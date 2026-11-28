// Shared by the build-time prerender (script/prerender.ts) and the on-request
// renderer (server/seo/render.ts): rewrite the SPA shell's head tags and put
// crawlable body HTML inside #root. React replaces #root when it mounts, and
// the block is hidden as soon as JS runs, so visitors never see it flash.

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL. null removes the canonical tag (404 pages). */
  url: string | null;
  image?: string;
  /** e.g. "noindex, follow". Omit to keep the shell's default. */
  robots?: string;
}

import { localHref } from "../../client/src/lib/i18n";

export function attr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function replacers throughout: page text can contain "$", which
// String.replace would otherwise interpret.
const swap = (html: string, re: RegExp, value: string) => html.replace(re, () => value);

export function injectMeta(
  shell: string,
  meta: PageMeta,
  opts: { lang?: "en" | "ar"; alternates?: Array<{ hreflang: string; url: string }> } = {},
): string {
  let html = shell;
  const t = attr(meta.title);
  const d = attr(meta.description);

  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = swap(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${d}" />`);
  html = swap(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${t}" />`);
  html = swap(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${d}" />`);

  if (meta.url) {
    const u = attr(meta.url);
    html = swap(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${u}" />`);
    html = swap(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${u}" />`);
  } else {
    html = html.replace(/\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, "");
    html = html.replace(/\s*<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, "");
  }
  if (meta.image) {
    html = swap(html, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/, `<meta property="og:image" content="${attr(meta.image)}" />`);
  }
  if (meta.robots) {
    html = swap(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/, `<meta name="robots" content="${attr(meta.robots)}" />`);
  }

  // Arabic pages: RTL and ar_EG locale from the first byte.
  if (opts.lang === "ar") {
    html = swap(html, /<html\b[^>]*>/i, `<html lang="ar" dir="rtl">`);
    html = /og:locale/i.test(html)
      ? swap(html, /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/>/i, `<meta property="og:locale" content="ar_EG" />`)
      : swap(html, /<\/head>/i, `<meta property="og:locale" content="ar_EG" />\n</head>`);
  }

  if (opts.alternates?.length) {
    const tags = opts.alternates
      .map((a) => `<link rel="alternate" hreflang="${attr(a.hreflang)}" href="${attr(a.url)}" />`)
      .join("\n");
    html = swap(html, /<\/head>/i, `${tags}\n</head>`);
  }
  return html;
}

/**
 * Add hreflang links to a finished page when it has none yet (pages rendered
 * on request). Same tags as the build-time pages and the sitemaps, all from
 * alternatesFor() in client/src/lib/i18n.ts.
 */
export function ensureAlternates(html: string, alternates: Array<{ hreflang: string; url: string }>): string {
  if (!alternates.length || /<link\s+rel="alternate"\s+hreflang=/i.test(html)) return html;
  const tags = alternates
    .map((a) => `<link rel="alternate" hreflang="${attr(a.hreflang)}" href="${attr(a.url)}" />`)
    .join("\n");
  return swap(html, /<\/head>/i, `${tags}\n</head>`);
}

/**
 * Arabic pages: swap the shell's hidden "Site navigation" link list (English)
 * for an Arabic one, so crawlers that don't run JavaScript see an all-Arabic
 * page. Links go to the English pages until their Arabic twins exist.
 */
export function arabicSkipNav(html: string): string {
  const links: Array<[string, string]> = [
    [localHref("/", "ar"), "الرئيسية"],
    [localHref("/listings", "ar"), "المكاتب المتاحة"],
    [localHref("/rent", "ar"), "مكاتب إدارية للإيجار"],
    [localHref("/buy", "ar"), "مكاتب إدارية للبيع"],
    [localHref("/locations", "ar"), "المناطق"],
    [localHref("/services", "ar"), "الخدمات"],
    ["/ar/blog", "المدونة"],
    [localHref("/contact", "ar"), "تواصل معنا"],
  ];
  const nav =
    `<nav aria-label="روابط الموقع" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">` +
    `<h2>PLACES — مكاتب إدارية في القاهرة</h2><ul>` +
    links.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("") +
    `</ul></nav>`;
  // The shell's list has no nested <nav>, so the first </nav> closes it.
  return html.replace(/<nav\s+aria-label="Site navigation"[\s\S]*?<\/nav>/, () => nav);
}

export function injectJsonLd(html: string, jsonLd: unknown): string {
  const encoded = JSON.stringify(jsonLd).replace(/<\/script/gi, "<\\/script");
  return swap(html, /<\/head>/i, `<script type="application/ld+json">${encoded}</script>\n</head>`);
}

const NAV_LINKS = {
  en: [
    ["/", "Home"], ["/listings", "Office listings"],
    ["/rent", "Offices for rent"], ["/buy", "Offices for sale"], ["/income-property", "Income properties"],
    ["/services", "Services"], ["/locations", "Locations"],
    ["/developers", "Developers"], ["/guides", "Guides"], ["/blog", "Blog"],
    ["/faqs", "FAQs"], ["/ar/blog", "Arabic blog"], ["/contact", "Contact"],
  ],
  ar: [
    ["/", "PLACES"], ["/listings", "المكاتب المتاحة"], ["/ar/blog", "المدونة"], ["/contact", "تواصل معنا"],
  ],
} as const;

const PRERENDER_HEAD =
  `<script>document.documentElement.classList.add("js")</script>` +
  `<style>.js #prerender{display:none}</style>`;

export function injectBody(html: string, inner: string, lang: "en" | "ar" = "en"): string {
  // Arabic pages link to the Arabic twin wherever one is live.
  const link = (href: string) => (lang === "ar" && !href.startsWith("/ar") ? localHref(href, "ar") : href);
  const nav = NAV_LINKS[lang].map(([href, label]) => `<li><a href="${link(href)}">${esc(label)}</a></li>`).join("");
  const block =
    `<div id="prerender" dir="${lang === "ar" ? "rtl" : "ltr"}" class="container mx-auto px-5 md:px-10 max-w-3xl py-16">` +
    `${inner}<nav><ul>${nav}</ul></nav></div>`;
  const withHead = html.includes(PRERENDER_HEAD) ? html : swap(html, /<\/head>/i, `${PRERENDER_HEAD}\n</head>`);
  // Replace an existing prerender block (build-time pages) or fill the empty root.
  if (/<div id="prerender"[\s\S]*?<\/nav><\/div><\/div>/.test(withHead)) {
    return withHead.replace(/<div id="root"><div id="prerender"[\s\S]*?<\/nav><\/div><\/div>/, () => `<div id="root">${block}</div>`);
  }
  return withHead.replace('<div id="root"></div>', () => `<div id="root">${block}</div>`);
}

/** The text inside a build-time prerender block, minus its nav, so it can be extended. */
export function prerenderInner(html: string): string | null {
  const m = html.match(/<div id="prerender"[^>]*>([\s\S]*?)<nav><ul>/);
  return m ? m[1] : null;
}
