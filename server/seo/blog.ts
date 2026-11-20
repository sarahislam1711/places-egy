// Blog pages (EN /blog, AR /ar/blog): fetched from WordPress and rendered to
// HTML. Used at build time (script/prerender.ts) and on request by the server
// (server/seo/routes.ts), so a post published in WordPress is a proper page
// immediately instead of after the next deploy.
import { attr, esc, injectBody, injectJsonLd, injectMeta } from "./html";

const SITE = "https://places-egy.com";
const CMS = "https://cms.places-egy.com";

export type BlogLang = "en" | "ar";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  featuredImage: string | null;
  // Slug of this post's translation in the other language (Polylang), or null.
  otherLangSlug: string | null;
  heading: string;
  excerpt: string;
  bodyHtml: string;
}

// Node-side HTML entity decoder for the common WP-emitted entities.
export function decodeEntitiesServer(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// WP content is authored in our own CMS, but strip anything executable anyway.
export function sanitizeWpHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|noscript|object|embed|form)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    // The page template supplies the one <h1>; headings inside the article start at h2.
    .replace(/<(\/?)h1\b/gi, "<$1h2");
}

/**
 * Published posts of one language. Returns [] on failure.
 * Build: long timeout + retries so a slow CMS doesn't drop pages.
 * Server: short timeout, one try, so a request never waits long on WordPress.
 */
export async function collectBlogPosts(
  lang: BlogLang,
  opts: { timeoutMs?: number; attempts?: number; quiet?: boolean } = {},
): Promise<BlogPostMeta[]> {
  const { timeoutMs = 45000, attempts = 3, quiet = false } = opts;
  const log = (...a: unknown[]) => !quiet && console.warn(...a);
  const url = `${CMS}/wp-json/wp/v2/posts?lang=${lang}&per_page=100&_embed=true`;
  try {
    let res: Response | undefined;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        if (res.ok) break;
      } catch (err) {
        if (attempt === attempts) throw err;
      }
      if (attempt < attempts) {
        log(`[blog] ${lang.toUpperCase()} fetch attempt ${attempt} failed — retrying`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (!res) throw new Error("no response");
    if (!res.ok) {
      log(`[blog] ${lang.toUpperCase()} fetch failed: HTTP ${res.status}`);
      return [];
    }
    type WpPost = {
      slug: string;
      title: { rendered: string };
      excerpt: { rendered: string };
      content: { rendered: string };
      date: string;
      translations?: Record<string, number>;
      yoast_head_json?: { title?: string; description?: string };
      meta?: Record<string, unknown>;
      _embedded?: { "wp:featuredmedia"?: Array<{ source_url?: string }> };
    };
    const raw = (await res.json()) as WpPost[];
    // Resolve counterpart-language post IDs to slugs in one lookup.
    const otherLang: BlogLang = lang === "ar" ? "en" : "ar";
    const otherIds = raw.map((p) => p.translations?.[otherLang]).filter((id): id is number => typeof id === "number");
    const otherSlugMap = new Map<number, string>();
    if (otherIds.length > 0) {
      try {
        const otherRes = await fetch(
          `${CMS}/wp-json/wp/v2/posts?include=${otherIds.join(",")}&per_page=100&_fields=id,slug&lang=${otherLang}`,
          { signal: AbortSignal.timeout(Math.min(timeoutMs, 15000)) },
        );
        if (otherRes.ok) {
          for (const p of (await otherRes.json()) as Array<{ id: number; slug: string }>) otherSlugMap.set(p.id, p.slug);
        }
      } catch (err) {
        log(`[blog] ${otherLang.toUpperCase()} translation slug lookup failed:`, err);
      }
    }
    return raw.map((p): BlogPostMeta => {
      const meta = p.meta ?? {};
      const seoTitle = (meta.rank_math_title as string | undefined) || p.yoast_head_json?.title || p.title.rendered;
      const seoDescription =
        (meta.rank_math_description as string | undefined) ||
        p.yoast_head_json?.description ||
        p.excerpt.rendered.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
      const otherId = p.translations?.[otherLang];
      return {
        slug: p.slug,
        title: decodeEntitiesServer(seoTitle),
        description: decodeEntitiesServer(seoDescription),
        publishedAt: p.date,
        featuredImage: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
        otherLangSlug: otherId ? otherSlugMap.get(otherId) ?? null : null,
        heading: decodeEntitiesServer(p.title.rendered),
        excerpt: decodeEntitiesServer(p.excerpt.rendered.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()),
        bodyHtml: sanitizeWpHtml(p.content?.rendered ?? ""),
      };
    });
  } catch (err) {
    log(`[blog] ${lang.toUpperCase()} fetch threw:`, err);
    return [];
  }
}

// ---------- page rendering ----------

export interface BlogData {
  en: BlogPostMeta[];
  ar: BlogPostMeta[];
  related: Record<BlogLang, Map<string, BlogPostMeta[]>>;
}

// Latin letters/digits and the Arabic block; everything else separates words.
const titleWords = (t: string) => new Set(t.toLowerCase().split(/[^0-9a-z\u0600-\u06ff]+/).filter((w) => w.length > 2));

// Related posts: top 4 by title similarity, then a balancing pass so every post
// is linked from at least 3 others (a 5th slot goes to under-linked posts).
export function buildBlogData(en: BlogPostMeta[], ar: BlogPostMeta[]): BlogData {
  const related: BlogData["related"] = { en: new Map(), ar: new Map() };
  for (const [lang, all] of [["en", en], ["ar", ar]] as const) {
    const ranked = (p: BlogPostMeta) => {
      const mine = titleWords(p.heading);
      return all
        .filter((o) => o.slug !== p.slug)
        .map((o, i) => ({ o, i, score: Array.from(titleWords(o.heading)).filter((w) => mine.has(w)).length }))
        .sort((x, y) => y.score - x.score || x.i - y.i)
        .map((x) => x.o);
    };
    for (const p of all) related[lang].set(p.slug, ranked(p).slice(0, 4));
    const incoming = (slug: string) =>
      Array.from(related[lang].values()).filter((list) => list.some((o) => o.slug === slug)).length;
    for (const p of all) {
      for (const host of ranked(p)) {
        if (incoming(p.slug) >= 3) break;
        const list = related[lang].get(host.slug)!;
        if (list.length < 5 && !list.some((o) => o.slug === p.slug)) list.push(p);
      }
    }
  }
  return { en, ar, related };
}

const base = (lang: BlogLang) => (lang === "ar" ? "/ar/blog" : "/blog");

function articleJsonLd(post: BlogPostMeta, url: string, lang: BlogLang) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: lang,
    author: { "@type": "Organization", "@id": `${SITE}/#organization`, name: "PLACES" },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "PLACES",
      logo: { "@type": "ImageObject", url: `${SITE}/opengraph.jpg` },
    },
    image: { "@type": "ImageObject", url: post.featuredImage ?? `${SITE}/opengraph.jpg` },
  };
}

// Crawlable links between the two blogs: each post links to its translation
// ("Read this article in Arabic →" / "اقرأ هذا المقال بالإنجليزية ←") and to a
// few related posts in the same language. Without these the Arabic posts were
// reachable only via the sitemap and /ar/blog, so Google left them unindexed.
function postBody(p: BlogPostMeta, lang: BlogLang, data: BlogData): string {
  const other: BlogLang = lang === "en" ? "ar" : "en";
  const twin = p.otherLangSlug ? data[other].find((o) => o.slug === p.otherLangSlug) : undefined;
  const twinLine = twin
    ? `<p><a href="${base(other)}/${attr(twin.slug)}" hreflang="${other}">` +
      `${lang === "en" ? "Read this article in Arabic →" : "اقرأ هذا المقال بالإنجليزية ←"}</a></p>`
    : "";
  const related = data.related[lang].get(p.slug) ?? [];
  const relatedList = related.length
    ? `<h2>${lang === "en" ? "Related articles" : "مقالات ذات صلة"}</h2><ul>` +
      related.map((o) => `<li><a href="${base(lang)}/${attr(o.slug)}">${esc(o.heading)}</a></li>`).join("") +
      `</ul>`
    : "";
  // Same call to action the React page shows after the article, so the served
  // HTML links each post to the commercial pages too.
  const cta =
    lang === "ar"
      ? `<h2>بتدور على مكتب دلوقتي؟</h2><p>ابعتلنا المنطقة والمساحة والميزانية، ومستشار من PLACES هيبعتلك قائمة بالوحدات المتاحة. ` +
        `<a href="/listings">تصفح المكاتب المتاحة</a> · <a href="/rent/new-cairo">مكاتب للإيجار في القاهرة الجديدة</a> · <a href="/contact">تواصل معنا</a></p>`
      : `<h2>Looking for an office now?</h2><p>Tell us the area, size and budget and a PLACES advisor will send you a shortlist of available units. ` +
        `<a href="/listings">Browse available offices</a> · <a href="/rent/new-cairo">Offices for rent in New Cairo</a> · <a href="/contact">Contact us</a></p>`;
  return (
    `<article><h1>${esc(p.heading)}</h1>` +
    `<p><time datetime="${attr(p.publishedAt)}">${esc(p.publishedAt.slice(0, 10))}</time></p>` +
    twinLine +
    `<div class="blog-content">${p.bodyHtml}</div>` +
    cta +
    `</article>` +
    relatedList
  );
}

/** Full HTML for one post, from the SPA shell. */
export function renderBlogPost(shell: string, post: BlogPostMeta, lang: BlogLang, data: BlogData): string {
  const url = `${SITE}${base(lang)}/${post.slug}`;
  const alternates: Array<{ hreflang: string; url: string }> = [{ hreflang: lang, url }];
  if (lang === "en") {
    if (post.otherLangSlug) alternates.push({ hreflang: "ar", url: `${SITE}/ar/blog/${post.otherLangSlug}` });
    alternates.push({ hreflang: "x-default", url });
  } else if (post.otherLangSlug) {
    alternates.push({ hreflang: "en", url: `${SITE}/blog/${post.otherLangSlug}` });
    alternates.push({ hreflang: "x-default", url: `${SITE}/blog/${post.otherLangSlug}` });
  } else {
    // Arabic-only post: it is its own default version.
    alternates.push({ hreflang: "x-default", url });
  }
  const html = injectMeta(
    shell,
    { title: post.title, description: post.description, url, image: post.featuredImage ?? undefined },
    { lang, alternates },
  );
  return injectBody(injectJsonLd(html, articleJsonLd(post, url, lang)), postBody(post, lang, data), lang);
}

export const BLOG_HUB_META = {
  en: {
    title: "PLACES Blog — Cairo Office Market Insights, Guides & News",
    heading: "PLACES Blog",
    description:
      "Latest articles from PLACES on Cairo's admin-office market — rental trends, developer updates, buy-vs-rent analysis, and location deep-dives for business decision makers.",
  },
  ar: {
    title: "المدونة — رؤى وأدلة PLACES",
    heading: "مدونة PLACES",
    description:
      "أحدث المقالات والأدلة من PLACES عن سوق المكاتب الإدارية في مصر — القاهرة الجديدة، الشيخ زايد، 6 أكتوبر، والمناطق التجارية الرئيسية.",
  },
} as const;

/** Full HTML for the /blog or /ar/blog hub, from the SPA shell. */
export function renderBlogHub(shell: string, lang: BlogLang, data: BlogData): string {
  const m = BLOG_HUB_META[lang];
  const html = injectMeta(
    shell,
    { title: m.title, description: m.description, url: `${SITE}${base(lang)}` },
    {
      lang,
      alternates: [
        { hreflang: "en", url: `${SITE}/blog` },
        { hreflang: "ar", url: `${SITE}/ar/blog` },
        { hreflang: "x-default", url: `${SITE}/blog` },
      ],
    },
  );
  const otherHub =
    lang === "en"
      ? `<p><a href="/ar/blog" hreflang="ar">Read our blog in Arabic →</a></p>`
      : `<p><a href="/blog" hreflang="en">اقرأ المدونة بالإنجليزية ←</a></p>`;
  const list =
    `<ul>` +
    data[lang]
      .map((p) => `<li><h2><a href="${base(lang)}/${attr(p.slug)}">${esc(p.heading)}</a></h2><p>${esc(p.excerpt)}</p></li>`)
      .join("") +
    `</ul>`;
  return injectBody(html, `<h1>${esc(m.heading)}</h1><p>${esc(m.description)}</p>${otherHub}${list}`, lang);
}

// ---------- live data for the server ----------

const TTL = 10 * 60_000;
let cache: { at: number; data: BlogData } | null = null;
let refreshing: Promise<BlogData | null> | null = null;

async function loadBlogData(): Promise<BlogData | null> {
  const [en, ar] = await Promise.all([
    collectBlogPosts("en", { timeoutMs: 8000, attempts: 1 }),
    collectBlogPosts("ar", { timeoutMs: 8000, attempts: 1 }),
  ]);
  // A failed or partial fetch keeps the previous data instead of dropping posts.
  if (en.length === 0 || ar.length === 0) return null;
  return buildBlogData(en, ar);
}

/**
 * Posts for live rendering. Fresh data is served from memory; stale data is
 * served immediately while a refresh runs in the background, so a visitor
 * never waits on WordPress except on a cold start (bounded by the 8s timeout).
 * Returns null when WordPress is unavailable and nothing is cached; callers
 * then fall back to the build-time page.
 */
export async function getBlogData(): Promise<BlogData | null> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  if (!refreshing) {
    refreshing = loadBlogData()
      .then((d) => {
        if (d) cache = { at: Date.now(), data: d };
        else console.warn("[blog] WordPress refresh failed; keeping previous posts");
        return d;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  if (cache) return cache.data;
  return refreshing;
}

/** The post at a URL slug (decoded or encoded), or null. */
export function findBlogPost(data: BlogData, lang: BlogLang, slug: string): BlogPostMeta | null {
  const norm = (s: string) => {
    try {
      return decodeURIComponent(s).normalize("NFC").toLowerCase();
    } catch {
      return s.normalize("NFC").toLowerCase();
    }
  };
  const want = norm(slug);
  return data[lang].find((p) => norm(p.slug) === want) ?? null;
}
