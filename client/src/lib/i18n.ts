// Language core for the Arabic site (28 Nov). Shared by the React app, the
// server renderer (server/seo/*) and the build scripts (script/*), so it must
// not use "@/" imports or browser-only APIs.
//
// Rules (seo-plans/5-arabic-website-plan, section 3.2b):
//   - Arabic pages live at "/ar" + the English path (English slugs after /ar/).
//   - A page has an Arabic twin only when it is listed in AR_LIVE: fully
//     Arabic, reviewed and switched on. Until then it gets NO hreflang and no
//     Arabic URL anywhere (sitemaps, switcher, links).
//   - Paired pages carry exactly three alternates, identical on both twins:
//     en → English URL, ar → Arabic URL, x-default → English URL.
//   - The Arabic blog (/ar/blog/*) has its own pairing via WordPress and is not
//     handled here.

export type Lang = "en" | "ar";

export const SITE_ORIGIN = "https://places-egy.com";

/**
 * English paths whose Arabic twin is live. Add a path here only when the
 * Arabic page is complete (every word Arabic) and has been checked.
 */
export const AR_LIVE: readonly string[] = [
  // 29 Nov: the three deal hubs (reviewed in the preview).
  "/rent",
  "/buy",
  "/income-property",
  // 29 Nov: area pages (reviewed: /ar/rent/new-cairo). Listed in the sitemap
  // only while the English page has enough stock.
  "/rent/new-cairo",
  "/buy/new-cairo",
  "/income-property/new-cairo",
  "/rent/sheikh-zayed",
  "/rent/maadi",
];

/** "/ar/rent" → "/rent", "/ar" → "/", English paths unchanged. */
export function englishPath(path: string): string {
  if (path === "/ar" || path === "/ar/") return "/";
  return path.startsWith("/ar/") ? path.slice(3) : path;
}

/** "/rent" → "/ar/rent", "/" → "/ar". */
export function arabicPath(enPath: string): string {
  const p = englishPath(enPath);
  return p === "/" ? "/ar" : `/ar${p}`;
}

export function langOfPath(path: string): Lang {
  return path === "/ar" || path.startsWith("/ar/") ? "ar" : "en";
}

/** Does this page (given in either language) have a live Arabic twin? */
export function hasArabicTwin(path: string): boolean {
  const p = englishPath(path.split(/[?#]/)[0].replace(/\/+$/, "") || "/");
  return AR_LIVE.includes(p);
}

/** The same page in the other language, or null when there is no twin. */
export function twinPath(path: string): string | null {
  if (!hasArabicTwin(path)) return null;
  return langOfPath(path) === "ar" ? englishPath(path) : arabicPath(path);
}

export type Alternate = { hreflang: "en" | "ar" | "x-default"; url: string };

/** hreflang set for a page (either language). Empty when there is no twin. */
export function alternatesFor(path: string, origin: string = SITE_ORIGIN): Alternate[] {
  if (!hasArabicTwin(path)) return [];
  const en = englishPath(path);
  // Must equal each page's canonical: the home page keeps its trailing slash
  // ("https://places-egy.com/"), every other page has none.
  const enUrl = `${origin}${en}`;
  const arUrl = `${origin}${arabicPath(en)}`;
  return [
    { hreflang: "en", url: enUrl },
    { hreflang: "ar", url: arUrl },
    { hreflang: "x-default", url: enUrl },
  ];
}

/**
 * Where a link should point for a reader in `lang`: the Arabic twin when it
 * exists, otherwise the English page (never a missing /ar/ URL).
 */
export function localHref(enPath: string, lang: Lang): string {
  if (lang === "ar" && hasArabicTwin(enPath)) return arabicPath(enPath);
  return enPath;
}
