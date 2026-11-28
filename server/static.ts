import { registerSeoRoutes } from "./seo/routes";
import { isKnownRoute, loadKnownRoutes } from "./seo/known-routes";
import { renderNotFound } from "./seo/render";
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const comingSoonHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PLACES</title>
  <style>
    body {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #000000;
      color: #ffffff;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { font-size: 18px; opacity: 0.6; }
  </style>
</head>
<body>
  <h1>PLACES</h1>
  <p>Something new is coming. Stay tuned.</p>
</body>
</html>`;

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  // If the build directory exists, serve it normally
  if (fs.existsSync(distPath)) {
    registerSeoRoutes(app, distPath);

    // 🚨 CRITICAL hub-page resolver, mounted BEFORE express.static.
    //
    // Context: pages like /listings also have children at /listings/{id}-slug,
    // which forces the prerender script to create a `listings/` DIRECTORY on
    // disk. serve-static, when it sees /listings (no extension, no trailing
    // slash), finds the DIRECTORY first and — with redirect:false — falls
    // through to the SPA catch-all serving generic index.html. The
    // prerendered flat file at dist/public/listings.html NEVER gets served.
    //
    // Result (bug confirmed in production Oct 10): every hub page in this
    // list was returning the homepage title + canonical to "/". Google
    // consolidated all ranking signal onto the homepage; the hubs were
    // invisible in search. This is almost certainly why organic lead flow
    // stalled since late September.
    //
    // Fix: for bare-path requests (no file extension, no trailing slash),
    // try to serve the flat .html file BEFORE express.static sees it as a
    // directory. If the flat file doesn't exist we fall through to the
    // existing resolvers unchanged.
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      const urlPath = req.path;
      // Only hit this for bare, no-extension paths. Skip assets, API, root.
      if (urlPath === "/" || urlPath.includes(".") || urlPath.startsWith("/api/")) {
        return next();
      }
      // Strip leading slash → relative to distPath, append .html.
      // Prerendered Arabic files are named with WordPress's lowercase %xx
      // escapes; browsers and Google often request uppercase (%D8).
      const normalized = urlPath.replace(/%[0-9A-F]{2}/gi, (m) => m.toLowerCase());
      const candidate = path.resolve(distPath, `${normalized.slice(1)}.html`);
      // Safety: candidate must be inside distPath (block path-traversal).
      if (!candidate.startsWith(distPath + path.sep)) return next();
      if (!fs.existsSync(candidate)) return next();
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(candidate);
    });

    app.use(
      express.static(distPath, {
        // Serve build-time prerendered pages: a request for /developers/akoya
        // resolves to developers/akoya.html (meta-only prerender output) before
        // falling through to the SPA catch-all below. Without this, those files
        // would never be served and crawlers would keep getting the generic
        // index.html shell.
        extensions: ["html"],
        // Never auto-301 a directory URL to add a trailing slash. Our
        // registerRedirects middleware canonicalizes URLs to the NO-slash
        // form (for consistent hreflang + canonical + backlink equity),
        // and serve-static's default "add trailing slash" redirect fought
        // it, creating an infinite loop on prerendered index-style routes
        // like /admin/business-park (whose file is admin/business-park/
        // index.html). With redirect:false, a bare directory URL falls
        // through to the SPA catch-all — which is what we want, since the
        // catch-all sends the SPA shell and the client-side router handles
        // /admin/:type properly.
        redirect: false,
        setHeaders: (res, filePath) => {
          // Vite-hashed assets (`/assets/index-abc123.js`, etc.) are immutable
          // — the filename changes when the content changes — so cache forever.
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            return;
          }
          // Images aren't fingerprinted but rarely change. 30-day cache with
          // must-revalidate so updated files propagate within a month at most.
          if (filePath.includes(`${path.sep}images${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=2592000, must-revalidate");
            return;
          }
          // Favicons + sitemap + robots: 1-day cache.
          if (/\.(svg|png|ico|xml|txt)$/.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=86400");
            return;
          }
          // HTML (index.html + prerendered per-route pages): never cache, so
          // users/crawlers get the latest deploy immediately.
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      })
    );
    const routesLoaded = loadKnownRoutes(path.resolve(distPath, ".."));
    if (!routesLoaded) console.warn("[seo] dist/known-routes.json missing; unknown paths will return 200");

    app.use("/{*path}", async (req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      // app.use() strips the mount path from req.path, so read the original URL.
      const urlPath = new URL(req.originalUrl, "http://localhost").pathname;
      // Missing static files (anything with an extension) get a plain 404.
      if (path.extname(urlPath)) return res.status(404).type("text").send("Not found");
      const known = req.method === "GET" || req.method === "HEAD" ? await isKnownRoute(urlPath) : false;
      if (known === false) return res.status(404).type("html").send(renderNotFound("404", urlPath === "/ar" || urlPath.startsWith("/ar/") ? "ar" : "en"));
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // Fallback: serve coming soon page directly
    app.use("/{*path}", (_req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.send(comingSoonHtml);
    });
  }
}
