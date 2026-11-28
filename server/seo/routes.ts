import type { Express, Request, Response, NextFunction } from "express";
import { renderDealHub, renderDeveloper, renderHome, renderLanding, renderListing, renderListingsIndex, renderLocation, renderNotFound, setDistPath, shell } from "./render";
import { findBlogPost, getBlogData, renderBlogHub, renderBlogPost, type BlogLang } from "./blog";
import { getListingById } from "./data";
import { registerSitemapRoutes } from "./sitemap";
import { ensureAlternates } from "./html";
import { alternatesFor } from "../../client/src/lib/i18n";

// Server-rendered pages. Registered before express.static so they win over
// build-time files. On any error, fall through to the normal static/SPA path.
export function registerSeoRoutes(app: Express, distPath: string): void {
  setDistPath(distPath);

  // Cloudflare's page rule rewrites /listings to "//listings/index.html"
  // (double slash), which no route matches. Collapse leading slashes first.
  app.use((req, _res, next) => {
    if (req.url.startsWith("//")) req.url = req.url.replace(/^\/+/, "/");
    next();
  });

  registerSitemapRoutes(app);

  const send = (render: (req: Request) => Promise<string | null>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const rendered = await render(req);
        if (rendered === null) return next();
        // Pages with a live Arabic twin carry en / ar / x-default hreflang.
        const html = ensureAlternates(rendered, alternatesFor(req.path));
        res.setHeader("Cache-Control", "no-cache");
        res.type("html").send(html);
      } catch (err) {
        console.warn(`[seo] render failed for ${req.path}:`, err);
        next();
      }
    };

  app.get(["/", "/index.html"], send(() => renderHome()));
  // Cloudflare's page rule rewrites /listings to /listings/index.html at the edge.
  app.get(["/listings", "/listings/index.html"], send(() => renderListingsIndex(1)));
  app.get("/listings/page/:n", (req, res, next) => {
    const n = Number(req.params.n);
    if (!Number.isInteger(n) || String(n) !== req.params.n) return next();
    if (n === 1) return res.redirect(301, "/listings");
    return send(() => renderListingsIndex(n))(req, res, next);
  });
  // listing-redirect.ts runs first: unknown ids and non-canonical slugs never get here.
  app.get(
    "/listings/:idSlug",
    send(async (req) => {
      const id = Number(String(req.params.idSlug).split("-")[0]);
      if (!Number.isInteger(id) || id <= 0) return null;
      const listing = await getListingById(id);
      if (!listing || listing.path !== req.path) return null;
      return renderListing(listing);
    }),
  );
  // Blog (EN + AR), rendered from WordPress on request (10-minute cache, refreshed
  // in the background) so a newly published post is a proper page right away,
  // not after the next deploy. Any miss or failure falls through to the
  // build-time page (express.static) exactly as before.
  void getBlogData(); // warm the cache at startup
  const blogHub = (lang: BlogLang) =>
    send(async () => {
      const data = await getBlogData();
      return data ? renderBlogHub(shell(), lang, data) : null;
    });
  const blogPost = (lang: BlogLang) =>
    send(async (req) => {
      const data = await getBlogData();
      const post = data && findBlogPost(data, lang, String(req.params.slug));
      return data && post ? renderBlogPost(shell(), post, lang, data) : null;
    });
  app.get(["/blog", "/blog/index.html"], blogHub("en"));
  app.get(["/ar/blog", "/ar/blog/index.html"], blogHub("ar"));
  app.get("/blog/:slug", blogPost("en"));
  app.get("/ar/blog/:slug", blogPost("ar"));
  app.get("/locations/:slug", send((req) => renderLocation(String(req.params.slug))));
  app.get("/developers/:slug", send((req) => renderDeveloper(String(req.params.slug))));
  // Deal hubs: every available office for rent / for sale / income property in Cairo.
  app.get(["/rent", "/buy", "/income-property"], send((req) => renderDealHub(req.path.slice(1))));
  // Search landing pages (/rent/new-cairo, /buy/new-cairo, …). A page exists only
  // while it has enough available units; otherwise it's a real 404.
  app.get(["/rent/:loc", "/buy/:loc", "/income-property/:loc"], async (req, res, next) => {
    try {
      const html = await renderLanding(req.path.split("/")[1], String(req.params.loc));
      res.setHeader("Cache-Control", "no-cache");
      if (html === null) return res.status(404).type("html").send(renderNotFound("404"));
      res.type("html").send(html);
    } catch (err) {
      console.warn(`[seo] render failed for ${req.path}:`, err);
      next();
    }
  });
}
