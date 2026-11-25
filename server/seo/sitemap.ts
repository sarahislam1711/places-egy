// /sitemap.xml is an index of four sitemaps generated on request:
//   static    — hand-maintained routes + guides (from the built sitemap file)
//   locations — /locations hub, each location page, and live landing pages (/rent/new-cairo, …)
//   listings  — every published listing, lastmod from updated_at
//   blog      — WordPress posts (EN + AR, hreflang pairs), lastmod from modified
import type { Express } from "express";
import { buildPostEntries, fetchAllPosts, type WpPost } from "../../script/build-sitemap";
import { getInventory } from "./data";
import { builtFile, SITE } from "./render";
import { DEAL_SLUGS, eligibleLandingPages, hubRows, landingRows } from "../../client/src/lib/landing-pages";

const XML_HEAD = `<?xml version="1.0" encoding="UTF-8"?>\n`;
const URLSET_OPEN = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
const PARTS = ["static", "locations", "listings", "blog"] as const;

const day = (iso: string | null | undefined) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);
const url = (loc: string, lastmod: string | null, changefreq: string, priority: string) =>
  `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}` +
  `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

// <url> blocks from the built sitemap, minus everything now generated live.
function staticEntries(): { staticXml: string; locationXml: string } {
  const xml = builtFile("sitemap.xml") ?? "";
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const locOf = (b: string) => b.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
  const isLocation = (loc: string) => loc === `${SITE}/locations` || loc.startsWith(`${SITE}/locations/`);
  const live = (loc: string) =>
    /\/listings\/\d+/.test(loc) || /\/(ar\/)?blog\/[^/]+$/.test(loc) || isLocation(loc);
  const isBlogHub = (loc: string) => loc === `${SITE}/blog` || loc === `${SITE}/ar/blog`;
  return {
    staticXml: blocks.filter((b) => !live(locOf(b)) || isBlogHub(locOf(b))).filter((b, i, all) => all.findIndex((x) => locOf(x) === locOf(b)) === i).map((b) => `  ${b}`).join("\n"),
    locationXml: blocks.filter((b) => isLocation(locOf(b))).map((b) => `  ${b}`).join("\n"),
  };
}

async function listingsXml(): Promise<string> {
  const rows = await getInventory();
  return rows.map((l) => url(`${SITE}${l.path}`, day(l.updated_at ?? l.created_at), "weekly", "0.8")).join("\n");
}

const BLOG_TTL = 10 * 60_000;
let blogCache: { at: number; xml: string } | null = null;

async function blogXml(): Promise<string> {
  if (blogCache && Date.now() - blogCache.at < BLOG_TTL) return blogCache.xml;
  try {
    const [en, ar]: [WpPost[], WpPost[]] = await Promise.all([fetchAllPosts("en"), fetchAllPosts("ar")]);
    const enSlugs = new Map(en.map((p) => [p.id, p.slug]));
    const arSlugs = new Map(ar.map((p) => [p.id, p.slug]));
    const xml = [
      buildPostEntries(en, { lang: "en", translationSlugs: arSlugs }),
      buildPostEntries(ar, { lang: "ar", translationSlugs: enSlugs }),
    ].join("\n");
    blogCache = { at: Date.now(), xml };
    return xml;
  } catch (err) {
    console.warn("[seo] blog sitemap: WordPress unreachable", err);
    return blogCache?.xml ?? "";
  }
}

async function landingXml(): Promise<string> {
  const inventory = await getInventory();
  // Deal hubs (/rent, /buy, /income-property) for every deal type with stock.
  const hubs = DEAL_SLUGS.filter((d) => hubRows(inventory, d).length > 0).map((d) => {
    const latest = hubRows(inventory, d).reduce<string | null>((m, l) => ((l.updated_at ?? "") > (m ?? "") ? l.updated_at : m), null);
    return url(`${SITE}/${d}`, day(latest), "daily", "0.9");
  });
  return hubs.join("\n") + "\n" + eligibleLandingPages(inventory)
    .map((p) => {
      const rows = landingRows(inventory, p.deal, p.loc.name);
      const latest = rows.reduce<string | null>((m, l) => ((l.updated_at ?? "") > (m ?? "") ? l.updated_at : m), null);
      return url(`${SITE}${p.path}`, day(latest), "daily", "0.9");
    })
    .join("\n");
}

async function part(name: (typeof PARTS)[number]): Promise<string> {
  if (name === "listings") return listingsXml();
  if (name === "blog") return blogXml();
  const { staticXml, locationXml } = staticEntries();
  return name === "static" ? staticXml : [locationXml, await landingXml()].filter(Boolean).join("\n");
}

export function registerSitemapRoutes(app: Express): void {
  app.get("/sitemap.xml", (_req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const body =
      XML_HEAD +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      PARTS.map((p) => `  <sitemap>\n    <loc>${SITE}/sitemap-${p}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`).join("\n") +
      `\n</sitemapindex>\n`;
    res.setHeader("Cache-Control", "public, max-age=600");
    res.type("application/xml").send(body);
  });

  app.get("/sitemap-:name.xml", async (req, res, next) => {
    const name = String(req.params.name) as (typeof PARTS)[number];
    if (!PARTS.includes(name)) return next();
    try {
      const entries = await part(name);
      res.setHeader("Cache-Control", "public, max-age=600");
      res.type("application/xml").send(`${XML_HEAD}${URLSET_OPEN}${entries}\n</urlset>\n`);
    } catch (err) {
      console.warn(`[seo] sitemap-${name} failed`, err);
      next(err);
    }
  });
}
