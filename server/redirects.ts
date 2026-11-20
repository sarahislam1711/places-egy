import type { Express } from "express";

const BLOG_SLUG_TTL_MS = 10 * 60 * 1000;
type BlogSlugs = {
  at: number;
  en: Set<string>;
  ar: Set<string>;
  /** EN slug -> its Arabic translation's slug (decoded), from Polylang pairs. */
  enToAr: Map<string, string>;
};
let blogSlugCache: BlogSlugs | null = null;

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

type WpSlugRow = { id: number; slug: string; translations?: Record<string, number> };

async function fetchSlugs(lang: "en" | "ar"): Promise<WpSlugRow[]> {
  const api = process.env.WORDPRESS_API_URL;
  if (!api) return [];
  const res = await fetch(`${api}/posts?lang=${lang}&per_page=100&_fields=id,slug,translations`, {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`WP ${res.status}`);
  return (await res.json()) as WpSlugRow[];
}

export async function getBlogSlugSets(): Promise<BlogSlugs> {
  if (blogSlugCache && Date.now() - blogSlugCache.at < BLOG_SLUG_TTL_MS) return blogSlugCache;
  try {
    const [en, ar] = await Promise.all([fetchSlugs("en"), fetchSlugs("ar")]);
    const arById = new Map(ar.map((p) => [p.id, safeDecode(p.slug)]));
    const enToAr = new Map<string, string>();
    for (const p of en) {
      const arSlug = p.translations?.ar ? arById.get(p.translations.ar) : undefined;
      if (arSlug) enToAr.set(safeDecode(p.slug), arSlug);
    }
    blogSlugCache = {
      at: Date.now(),
      en: new Set(en.map((p) => safeDecode(p.slug))),
      ar: new Set(ar.map((p) => safeDecode(p.slug))),
      enToAr,
    };
  } catch {
    // Keep serving stale sets (or none) for a minute rather than hitting WP on every request.
    blogSlugCache = {
      at: Date.now() - BLOG_SLUG_TTL_MS + 60_000,
      en: blogSlugCache?.en ?? new Set(),
      ar: blogSlugCache?.ar ?? new Set(),
      enToAr: blogSlugCache?.enToAr ?? new Map(),
    };
  }
  return blogSlugCache;
}

// Permanent (301) redirects for retired URLs — preserves SEO link equity
// and keeps any external bookmarks landing on a useful page.
const PERMANENT_REDIRECTS: Record<string, string> = {
  "/services/corporate-leasing": "/services/leasing",
  "/admin-offices": "/admin",
  "/admin-offices/business-park": "/admin/business-park",
  "/admin-offices/business-building": "/admin/business-building",
  "/admin-offices/mixed-use": "/admin/mixed-use",
  "/admin-offices/mixed-use-mall": "/admin/mixed-use",
  "/office-spaces": "/",
  // Favorites/saved-listings page was briefly built as /my-favorites and
  // /favorites in early drafts. Canonical URL is now /saved (matches Redfin
  // convention). Preserve any accidentally-shared bookmarks by 301'ing both
  // legacy variants forward.
  "/my-favorites": "/saved",
  "/favorites": "/saved",
  "/wishlist": "/saved",
  // Ghost URL that Google crawled from an old backlink / scraper. The
  // SPA catch-all was serving a 200 with a blank shell → Google (correctly)
  // flagged it as a soft 404 in GSC. 301 to the real blog hub preserves
  // any inbound link equity + lands visitors somewhere useful.
  "/blog-list": "/blog",
  // PLACES retired its commercial offering — all /commercial* paths now
  // route to the homepage so external links + indexed URLs land on a
  // useful page that reflects the new admin-only positioning.
  "/commercial": "/",
  "/commercial/mega-mall": "/",
  "/commercial/mega-malls": "/",
  "/commercial/strip-mall": "/",
  "/commercial/strip-malls": "/",
  "/commercial/drive-through": "/",
  "/commercial/drive-thru": "/",
  // Six developer pages retired 2026-08-30 — pages were built with
  // placeholder content on 2026-08-25 and never completed. All 6 now
  // 301 to the main /developers hub so any external bookmarks, indexed
  // Google results, or old links land somewhere useful. /developers/milcon
  // was itself a 301 to /developers/mercon (renamed 2026-08-25); with
  // mercon retired we point milcon directly at the hub too so users
  // don't hop through a chain of redirects.
  "/developers/milcon": "/developers",
  "/developers/makateb-offices": "/developers",
  "/developers/concord-group": "/developers",
  "/developers/eloia": "/developers",
  "/developers/living-in": "/developers",
  "/developers/regents": "/developers",
  "/developers/mercon": "/developers",
  // Phantom /admin/{location} URLs Google indexed (probably from old internal
  // links or a stale sitemap). These match the generic /admin/:type SPA route
  // which shows the ListingsPage — but with wrong meta (homepage title +
  // canonical to /), causing GSC "Alternate page with proper canonical" +
  // "Crawled - currently not indexed" reports. Redirect each to the real
  // /locations/{slug} page which has its own meta + content.
  "/admin/new-cairo": "/locations/new-cairo",
  "/admin/sheikh-zayed": "/locations/sheikh-zayed",
  "/admin/6th-october": "/locations/6th-october",
  "/admin/downtown-cairo": "/locations/downtown-cairo",
  "/admin/sheraton": "/locations/sheraton",
  "/admin/maadi": "/locations/maadi",

  // Arabic blog slug cleanup (2026-09-11). Old slugs had 3 patterns Google
  // + Arabic readers hate: `ar-blog-<english>` prefixes (Polylang collision
  // workaround), `-2` suffixes (same-slug collision), and mixed English
  // words in Arabic URLs. Renamed to native Arabic slugs that read
  // naturally in search results + share previews and rank for Arabic
  // keyword queries. Every old URL 301s to the new Arabic URL so Google
  // transfers ranking signal and any inbound WhatsApp/email links still
  // land on the right post.
  "/ar/blog/ar-blog-admin-offices-egypt-guide": "/ar/blog/دليل-المكاتب-الادارية-مصر",
  "/ar/blog/types-of-admin-offices-egypt-2": "/ar/blog/انواع-المكاتب-الادارية-مصر",
  "/ar/blog/business-parks-egypt-2": "/ar/blog/دليل-بيزنس-بارك-مصر",
  "/ar/blog/business-buildings-egypt-2": "/ar/blog/المبانى-الادارية-مصر",
  // Target posts no longer exist in WP — send to the hub instead of a dead end.
  "/ar/blog/ar-blog-new-capital-right-for-your-company": "/ar/blog",
  "/ar/blog/ar-blog-business-park-vs-street-location": "/ar/blog",
  "/ar/blog/ar-blog-types-of-admin-offices-egypt": "/ar/blog/انواع-المكاتب-الادارية-مصر",
  "/ar/blog/ar-blog-mistakes-buying-office-new-cairo": "/ar/blog/اخطاء-شراء-مكتب-التجمع-الخامس",
  "/ar/blog/ar-blog-new-cairo-vs-administrative-capital-offices": "/ar/blog/التجمع-الخامس-ام-العاصمة-الادارية",
  "/ar/blog/أفضل-مناطق-المكاتب-الإدارية-في-القاهر": "/ar/blog/افضل-اماكن-المكاتب-التجمع-الخامس",
  "/ar/blog/ar-blog-new-cairo-vs-sheikh-zayed-offices": "/ar/blog/التجمع-الخامس-ام-الشيخ-زايد-للشركات",
  "/ar/blog/ar-blog-north-90-street-offices": "/ar/blog/مكاتب-التسعين-الشمالى",
  "/ar/blog/ar-blog-south-90-street-offices": "/ar/blog/مكاتب-التسعين-الجنوبى",

  // English blog post renames (2026-09-11). Trimming redundant suffixes
  // and standardising on `offices-for-{rent,sale}-new-cairo` shape so
  // the URLs match the same keyword pattern searchers type. Every old
  // variant collapses to the final slug in ONE hop (no redirect chains
  // — Google treats chained 301s as slightly weaker signals).
  "/blog/office-space-for-rent-in-new-cairo-a-practical-business-guide": "/blog/offices-for-rent-new-cairo",
  "/blog/office-space-for-rent-new-cairo": "/blog/offices-for-rent-new-cairo",
  "/blog/offices-for-sale-in-new-cairo-what-to-check-before-buying": "/blog/offices-for-sale-new-cairo",
  // North/South 90 Street EN post slug cleanup (2026-09-11). Post #80
  // was renamed from `blog-north-90-street-offices-new-cairo` → the
  // freed slug `north-90-street-offices` (post #86 vacated it after
  // being corrected to `south-90-street-offices`). Only redirecting
  // the truly-abandoned old URL — `/blog/north-90-street-offices`
  // itself is NOT redirected because it now correctly serves post #80.
  //
  // Google will notice the content behind `north-90-street-offices`
  // changed (South content → North content) on its next recrawl. This
  // costs some historical ranking signal for the URL, which is
  // unavoidable when a URL is repurposed. Alternative would have been
  // to keep #86 at a new slug and 301 the old one — user chose to swap
  // in-place for the cleaner shorter slug.
  "/blog/blog-north-90-street-offices-new-cairo": "/blog/north-90-street-offices",

  // Post repurposed 2026-09-12: an old "offices for SALE in New Cairo"
  // Arabic post was rewritten to be about "offices for RENT". Old sale
  // URL → new rent URL so any inbound backlinks or Google-indexed URLs
  // land on the current content.
  "/ar/blog/مكاتب-إدارية-للبيع-القاهرة-الجديدة-2": "/ar/blog/مكاتب-إدارية-للإيجار-القاهرة-الجديدة",
  "/ar/blog/تكلفة-المكتب-الحقيقية-ما-وراء-سعر-الإي": "/ar/blog/تكلفة-المكتب-الحقيقية",
  "/ar/blog/how-to-choose-company-office-location-cairo": "/ar/blog/اختيار-مقر-الشركة-القاهرة",
  "/ar/blog/مكاتب-إدارية-للبيع-في-القاهرة-الجديدة": "/ar/blog/مكاتب-للبيع-التجمع-الخامس",
  "/ar/blog/مكاتب-إدارية-للبيع-في-القاهرة-الجديدة-2": "/ar/blog/مكاتب-للبيع-التجمع-الخامس",
  "/ar/blog/أشتري-ولا-أأجر-مكتب-لشركتي-دليل-عملي-ق": "/ar/blog/شراء-ام-ايجار-مكتب",

  // `-2` Polylang-collision slugs renamed to Arabic in WP (2026-10-18).
  // Post 193's target is truncated by WP's slug length limit — keep it exact.
  "/ar/blog/mixed-use-buildings-egypt-2": "/ar/blog/المباني-متعددة-الاستخدامات",
  "/ar/blog/business-building-vs-business-park-2": "/ar/blog/البيزنس-بارك-و-المبنى-الإداري",
  "/ar/blog/mixed-use-vs-business-park-2": "/ar/blog/بيزنس-بارك-و-المشروع-متعدد-الاستخداما",
  "/ar/blog/core-and-shell-offices-2": "/ar/blog/ما-هو-الكور-اند-شل",
  "/ar/blog/office-finishing-types-egypt-2": "/ar/blog/أنواع-تشطيب-المكاتب-مصر",
  "/ar/blog/offices-mixed-use-buildings-pros-cons-2": "/ar/blog/مميزات-وعيوب-المباني-متعددة-الاستخدا",

  // Wrong slugs linked from inside blog articles (scripts/blog-link-check.ts, 2026-10-28).
  "/blog/business-park-vs-business-building": "/blog/business-building-vs-business-park",
  "/blog/common-types-admin-offices-egypt": "/blog/types-of-admin-offices-egypt",
  // No English version of this article exists; closest topic.
  "/blog/ready-to-move-vs-core-and-shell-offices-egypt": "/blog/core-and-shell-offices",
  "/ar/blog/ready-to-move-vs-core-and-shell-offices-egypt":
    "/ar/blog/ready-to-move-vs-core-and-shell-offices-in-egypt-تختار-مكتب-جاهز-ولا-تجهزه-بنف",
  "/ar/blog/business-park-mixed-use": "/ar/blog/بيزنس-بارك-و-المشروع-متعدد-الاستخداما",

  // Old URLs GSC still reported as 404 on 2026-11-19 (crawled 15–17 Nov, so
  // something still links to them). Each goes to its closest live page.
  // No Arabic twin exists for the yield post, so it lands on the English one.
  "/ar/blog/office-investment-yield-new-cairo": "/blog/office-investment-yield-new-cairo",
  "/ar/blog/blog-north-90-street-offices-new-cairo": "/ar/blog/مكاتب-التسعين-الشمالى",
  "/blog/where-to-buy-office-cairo-guide": "/blog/offices-for-sale-new-cairo",
  // Exact entry so this doesn't hop through the /resources/blog prefix rule
  // into the old 404 above.
  "/resources/blog/where-to-buy-office-cairo-guide": "/blog/offices-for-sale-new-cairo",
  "/developers/palm-hills-1": "/developers/palm-hills",
};

// Prefix redirects for path roots that have moved. Anything matching the
// `from` prefix is rewritten to the `to` prefix, preserving the rest of the
// path and the query string. Order matters: longer prefixes first.
const PREFIX_REDIRECTS: { from: string; to: string }[] = [
  { from: "/resources/blog", to: "/blog" },
  { from: "/resources/faqs", to: "/faqs" },
  { from: "/resources/glossary", to: "/glossary" },
];

// req.path arrives percent-encoded, but Arabic keys above are written as plain
// Arabic — match on the decoded form so those entries actually fire.
const DECODED_REDIRECTS = new Map(
  Object.entries(PERMANENT_REDIRECTS).map(([k, v]) => [k.normalize("NFC"), v]),
);

// Emit lowercase %xx so the Location matches the canonical URLs (WP slug form).
function canonicalEncode(target: string): string {
  return encodeURI(safeDecodePath(target)).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
}

function safeDecodePath(s: string): string {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

function lookupRedirect(rawPath: string): string | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath).normalize("NFC");
  } catch {
    decoded = rawPath;
  }
  const direct = DECODED_REDIRECTS.get(decoded);
  if (direct) return direct;
  // Old Arabic slugs also leaked under /blog/* (former sitemap bug).
  if (decoded.startsWith("/blog/")) {
    const viaAr = DECODED_REDIRECTS.get(`/ar${decoded}`);
    if (viaAr) return viaAr;
    if (decoded.startsWith("/blog/ar-blog-")) return `/ar${decoded}`;
  }
  return undefined;
}

export function registerRedirects(app: Express) {
  app.use((req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      const target = lookupRedirect(req.path);
      if (target) {
        const query = req.url.slice(req.path.length);
        res.redirect(301, canonicalEncode(target) + query);
        return;
      }
      for (const { from, to } of PREFIX_REDIRECTS) {
        if (req.path === from || req.path.startsWith(`${from}/`)) {
          const rest = req.path.slice(from.length);
          const query = req.url.slice(req.path.length);
          res.redirect(301, to + rest + query);
          return;
        }
      }
      // Blog category URL cleanup + legacy → clean conversion.
      //  - Legacy /blog?category=foo → /blog/category/foo (301, clean URLs)
      //  - Legacy /blog?category=uncategorized-* → real replacement category
      //    (English → admin-offices, Arabic → المكاتب-الإدارية)
      // Also handles the path-form /blog/category/uncategorized* by redirecting
      // to the same replacement.
      const isBlogEn = req.path === "/blog";
      const isBlogAr = req.path === "/ar/blog";
      const isBlogEnCat = req.path.startsWith("/blog/category/");
      const isBlogArCat = req.path.startsWith("/ar/blog/category/");

      // Resolve the category slug from either query or path.
      let catRaw: string | null = null;
      let base = "";
      if ((isBlogEn || isBlogAr) && typeof req.query.category === "string") {
        catRaw = req.query.category;
        base = isBlogAr ? "/ar/blog" : "/blog";
      } else if (isBlogEnCat) {
        catRaw = decodeURIComponent(req.path.slice("/blog/category/".length));
        base = "/blog";
      } else if (isBlogArCat) {
        catRaw = decodeURIComponent(req.path.slice("/ar/blog/category/".length));
        base = "/ar/blog";
      }

      if (catRaw != null && base) {
        const catLower = catRaw.toLowerCase();
        const isUncategorized =
          catLower === "uncategorized" ||
          catLower === "uncategorised" ||
          catLower.startsWith("uncategorized-") ||
          catLower.startsWith("uncategorised-") ||
          catRaw === "غير-مصنف";

        // Uncategorized → the real replacement category per language.
        if (isUncategorized) {
          const replacement =
            base === "/ar/blog" ? "المكاتب-الإدارية" : "admin-offices";
          res.redirect(301, `${base}/category/${encodeURIComponent(replacement)}`);
          return;
        }

        // Retired "Guides and Tips" WP category → admin-offices. Same reason
        // as the uncategorized shim above: prevents 404s from any external
        // links or GSC-indexed URLs pointing at the old slug. Covers the
        // common WordPress slug variants for this category name.
        const isRetiredGuidesTips =
          catLower === "guides-and-tips" ||
          catLower === "guides-tips" ||
          catLower === "guides" ||
          catLower === "tips" ||
          catLower === "guides-tips-en" ||
          // Arabic variants. WP usually slugifies "أدلة ونصائح" by
          // replacing the space with a hyphen but keeps the original
          // characters in the URL when someone links to it uncleaned.
          // Match both forms.
          catRaw === "أدلة ونصائح" ||
          catRaw === "أدلة-ونصائح" ||
          catRaw === "الأدلة-والنصائح" ||
          catRaw === "الأدلة والنصائح" ||
          catRaw === "نصائح" ||
          catRaw === "أدلة";
        if (isRetiredGuidesTips) {
          const replacement =
            base === "/ar/blog" ? "المكاتب-الإدارية" : "admin-offices";
          res.redirect(301, `${base}/category/${encodeURIComponent(replacement)}`);
          return;
        }

        // Legacy query-string form → clean path form (only when the request
        // came in via ?category=; already-clean path URLs are left alone).
        if (isBlogEn || isBlogAr) {
          res.redirect(
            301,
            `${base}/category/${encodeURIComponent(catRaw)}`,
          );
          return;
        }
      }
    }
    next();
  });

  // Arabic posts were once listed in the sitemap under /blog/<slug>, where they
  // serve the SPA shell with a homepage canonical. 301 them to /ar/blog/<slug>.
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const m = req.path.match(/^\/blog\/([^/]+)$/);
    if (!m) return next();
    try {
      const slug = safeDecode(m[1]);
      const { en, ar } = await getBlogSlugSets();
      if (ar.has(slug) && !en.has(slug)) {
        const query = req.url.slice(req.path.length);
        return res.redirect(301, canonicalEncode(`/ar/blog/${m[1]}`) + query);
      }
    } catch {
      // WP unreachable — fall through and serve normally.
    }
    next();
  });

  // /ar/blog/<english-slug> (a common hand-typed mistake) -> the Arabic twin.
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const m = req.path.match(/^\/ar\/blog\/([^/]+)$/);
    if (!m) return next();
    try {
      const slug = safeDecode(m[1]);
      const { ar, enToAr } = await getBlogSlugSets();
      const twin = !ar.has(slug) ? enToAr.get(slug) : undefined;
      if (twin) {
        const query = req.url.slice(req.path.length);
        return res.redirect(301, canonicalEncode(`/ar/blog/${twin}`) + query);
      }
    } catch {
      // WP unreachable — fall through and serve normally.
    }
    next();
  });

  // Trailing-slash 301 redirect — canonicalize every URL to the no-slash form so
  // search engines see one URL per page and link equity stays consolidated.
  // Skips the root path "/" which must keep its slash. Preserves the query string.
  // Applies to GET and HEAD only (HEAD is used by crawlers and link checkers).
  app.use((req, res, next) => {
    if (
      (req.method === "GET" || req.method === "HEAD") &&
      req.path.length > 1 &&
      req.path.endsWith("/")
    ) {
      const trimmed = req.path.replace(/\/+$/, "");
      const query = req.url.slice(req.path.length);
      res.redirect(301, trimmed + query);
      return;
    }
    next();
  });
}
