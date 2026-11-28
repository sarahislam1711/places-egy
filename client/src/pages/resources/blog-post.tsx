import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Check, ChevronDown, ChevronRight, Clock, Link2, Linkedin, MessageCircle } from "lucide-react";
import DOMPurify from "dompurify";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, blogPostingSchema } from "@/lib/schema";
import { BlogLangSwitcher } from "@/components/blog/BlogLangSwitcher";
import {
  fetchPost,
  fetchRelatedPosts,
  formatPostDate,
  pickBlogImage,
  stripHtml,
  type BlogLang,
  type BlogPost,
} from "@/lib/blog";
import { trackEvent } from "@/lib/analytics";
import { useScrollDepth } from "@/lib/use-scroll-depth";
import { scrollToSection, slugifyHeading, useActiveSection, useReadingProgress, type TocItem } from "@/lib/reading";
import { TOPIC_GUIDE, isListed, topicOf } from "@/lib/blog-topics";
import { PostCard, TopicPill } from "@/components/blog/BlogCards";
import { CtaBand } from "@/components/service-page";
import { GUIDES } from "@/lib/guides";

const BASE_URL = "https://places-egy.com";
// FAQ section headings (English + Arabic). "Questions to ask before…" sections don't match.
const FAQ_HEADING = /^(frequently asked questions|faqs?\b)|^(ال)?(أ|ا)سئلة (ال)?شائعة/i;
const WHATSAPP_NUMBER = "201063618217";

const COPY = {
  en: {
    home: "Home",
    blog: "Blog",
    minRead: "min read",
    tags: "Tags",
    writtenBy: "Written by",
    authorBio:
      "Part of the PLACES advisory team — specialists in Egypt's commercial and administrative real estate market.",
    readNext: "Read next",
    readNextSub: "More from the PLACES team.",
    ctaHeading: "Want our take on your situation?",
    ctaBody: "Tell us what you need and a PLACES advisor will come back with options that fit.",
    ctaButton: "Send us your requirements",
    backToAll: "All articles",
    inThis: "In this article",
    sections: (n: number) => `${n} sections`,
    by: "By",
    share: "Share this article",
    copy: "Copy link",
    copied: "Link copied",
    goDeeper: "Go deeper",
    guideCta: "Read the guide",
    inlineHeading: "Looking for an office now?",
    inlineBody: "Tell us the area, size and budget on WhatsApp and a PLACES advisor will send you a shortlist of available units.",
    inlineWhatsapp: "Send us your requirements on WhatsApp",
    inlineBrowse: "Browse available offices",
    waMessage: (title: string) => `Hi, I read "${title}" on the PLACES blog and I'd like help finding an office.`,
  },
  ar: {
    home: "الرئيسية",
    blog: "المدونة",
    minRead: "دقيقة قراءة",
    tags: "الوسوم",
    writtenBy: "بقلم",
    authorBio:
      "جزء من فريق PLACES الاستشاري — متخصصون في سوق العقارات التجارية والإدارية في مصر.",
    readNext: "اقرأ المزيد",
    readNextSub: "المزيد من فريق PLACES.",
    ctaHeading: "تريد رأينا في حالتك بالذات؟",
    ctaBody: "قل لنا ما تحتاجه وسيعود إليك مستشار من PLACES بخيارات مناسبة.",
    ctaButton: "أرسل طلبك",
    backToAll: "كل المقالات",
    inThis: "في هذا المقال",
    sections: (n: number) => `${n} أقسام`,
    by: "بقلم",
    share: "شارك المقال",
    copy: "نسخ الرابط",
    copied: "تم النسخ",
    goDeeper: "للتعمق أكثر",
    guideCta: "اقرأ الدليل",
    inlineHeading: "بتدور على مكتب دلوقتي؟",
    inlineBody: "ابعتلنا المنطقة والمساحة والميزانية على واتساب، ومستشار من PLACES هيبعتلك قائمة بالوحدات المتاحة.",
    inlineWhatsapp: "ابعت طلبك على واتساب",
    inlineBrowse: "تصفح المكاتب المتاحة",
    waMessage: (title: string) => `مرحباً، قرأت مقال «${title}» على مدونة PLACES وعايز مساعدة في إيجاد مكتب.`,
  },
} as const;

// The post body on its own, so the page re-rendering (contents highlight on
// scroll, share button state) doesn't rewrite the article HTML — that reset
// the FAQ toggles and anything else changed in the page.
const ArticleBody = memo(function ArticleBody({ html, isAr }: { html: string; isAr: boolean }) {
  return <div className={`blog-content ${isAr ? "blog-content-ar" : ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
});

function setMetaTag(key: string, value: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLinkTag(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function BlogPostPage({ lang = "en" }: { lang?: BlogLang }) {
  const isAr = lang === "ar";
  const t = COPY[lang];
  const basePath = isAr ? "/ar/blog" : "/blog";

  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  useScrollDepth(`${basePath}/${slug}`);

  const { data: post, isLoading, isError } = useQuery<BlogPost | null>({
    queryKey: ["blog-post", lang, slug],
    queryFn: () => fetchPost(slug ?? "", lang),
    enabled: Boolean(slug),
  });

  const { data: related = [] } = useQuery<BlogPost[]>({
    queryKey: ["blog-related", lang, post?.id],
    queryFn: () => (post ? fetchRelatedPosts(post, 4) : Promise.resolve([])),
    enabled: Boolean(post),
  });

  useEffect(() => {
    if (!isLoading && !isError && post === null) {
      setLocation(basePath, { replace: true });
    }
  }, [isLoading, isError, post, setLocation, basePath]);

  useEffect(() => {
    if (!post) return;

    const title = post.seo.title || `${post.title} — PLACES`;
    const description = post.seo.description || stripHtml(post.excerpt);
    const url = `${BASE_URL}${basePath}/${post.slug}`;
    const image = post.featuredImage?.url
      ? post.featuredImage.url.startsWith("http")
        ? post.featuredImage.url
        : `${BASE_URL}${post.featuredImage.url}`
      : undefined;

    const previousTitle = document.title;
    document.title = title;
    setMetaTag("description", description);
    setMetaTag("og:title", title, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:url", url, "property");
    setMetaTag("og:type", "article", "property");
    setMetaTag("og:locale", isAr ? "ar_EG" : "en_EG", "property");
    if (image) {
      setMetaTag("og:image", image, "property");
      document.head.querySelector('meta[property="og:image:width"]')?.remove();
      document.head.querySelector('meta[property="og:image:height"]')?.remove();
      document.head.querySelector('meta[property="og:image:type"]')?.remove();
      document.head.querySelector('meta[property="og:image:alt"]')?.remove();
      document.head.querySelector('meta[property="og:image:secure_url"]')?.remove();
      document.head.querySelector('meta[name="twitter:image:alt"]')?.remove();
    }
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) setMetaTag("twitter:image", image);

    // hreflang tags. Polylang exposes translation pairs on the WP REST
    // response and blog.ts resolves each post's counterpart slug in a
    // secondary fetch. When we have the pair we emit reciprocal alternates
    // so Google can properly cluster EN/AR translations instead of treating
    // them as duplicates. When we don't (translation missing/unpublished),
    // fall back to self + x-default → English blog hub. Better to
    // under-claim than to point Google at a 404.
    setLinkTag("alternate", url, isAr ? "ar" : "en");
    if (post.translationSlug) {
      const otherLang: BlogLang = isAr ? "en" : "ar";
      const otherBase = otherLang === "ar" ? "/ar/blog" : "/blog";
      const otherUrl = `${BASE_URL}${otherBase}/${post.translationSlug}`;
      setLinkTag("alternate", otherUrl, otherLang);
      // x-default points at the English version whenever available.
      setLinkTag("alternate", isAr ? otherUrl : url, "x-default");
    } else {
      setLinkTag("alternate", `${BASE_URL}/blog`, "x-default");
    }
    setLinkTag("canonical", url);

    trackEvent("blog_post_view", {
      post_id: post.id,
      post_slug: post.slug,
      post_title: post.title,
      post_category: post.categories[0]?.slug,
      lang,
    });

    return () => {
      document.title = previousTitle;
    };
  }, [post, basePath, isAr, lang]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  // Sanitise once and give every H2 an id inside the HTML itself, so the
  // contents links survive re-renders and #section links work on load.
  const { html, toc } = useMemo(() => {
    if (!post) return { html: "", toc: [] as TocItem[] };
    const clean = DOMPurify.sanitize(post.content);
    const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, "text/html");
    const used = new Set<string>();
    const items: TocItem[] = [];
    doc.querySelectorAll("h2").forEach((h) => {
      const text = h.textContent?.trim() ?? "";
      if (!text) return;
      let id = h.id || slugifyHeading(text);
      let n = 2;
      while (used.has(id)) id = `${slugifyHeading(text)}-${n++}`;
      h.id = id;
      used.add(id);
      items.push({ id, text });
    });
    // FAQ sections become tap-to-open toggles: every H3 question under a
    // "Frequently asked questions" / "أسئلة شائعة" H2, with its answer
    // paragraphs inside. The text stays in the HTML for search engines.
    doc.querySelectorAll("h2").forEach((h2) => {
      if (!FAQ_HEADING.test(h2.textContent?.trim() ?? "")) return;
      const section: Element[] = [];
      let el = h2.nextElementSibling;
      while (el && el.tagName !== "H2") {
        section.push(el);
        el = el.nextElementSibling;
      }
      if (!section.some((e) => e.tagName === "H3")) return;
      const list = doc.createElement("div");
      list.className = "blog-faq";
      let answer: HTMLElement | null = null;
      for (const node of section) {
        if (node.tagName === "H3") {
          const item = doc.createElement("details");
          item.className = "blog-faq-item";
          const summary = doc.createElement("summary");
          summary.appendChild(node);
          answer = doc.createElement("div");
          answer.className = "blog-faq-answer";
          item.append(summary, answer);
          list.appendChild(item);
        } else if (answer) {
          answer.appendChild(node);
        }
        // Anything between the H2 and the first question stays where it is.
      }
      const firstQ = section.find((e) => e.tagName === "H3");
      const anchor = section[section.indexOf(firstQ!) - 1];
      if (anchor) anchor.after(list);
      else h2.after(list);
    });
    return { html: doc.body.firstElementChild?.innerHTML ?? clean, toc: items };
  }, [post]);
  const active = useActiveSection(toc.map((x) => x.id));
  const progress = useReadingProgress(articleRef, post?.id);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const serif = isAr ? "font-serif-ar" : "font-serif";

  if (isLoading || !post) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex-1 pt-28 md:pt-36" aria-hidden>
          <div className="container mx-auto px-6 md:px-10 max-w-6xl grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
            <div className="space-y-4">
              <div className="h-6 w-40 rounded-full bg-white/80 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-white/80 animate-pulse" />
              <div className="h-12 w-3/4 rounded-xl bg-white/80 animate-pulse" />
            </div>
            <div className="aspect-[1.91/1] rounded-3xl bg-white/80 animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const url = `${BASE_URL}${basePath}/${post.slug}`;
  const dek = post.seo.description || stripHtml(post.excerpt).replace(/\s*\[?(…|&hellip;|\.\.\.)\]?\s*$/, "…");
  const topic = topicOf(post, lang);
  const guide = !isAr && topic ? GUIDES.find((g) => g.slug === TOPIC_GUIDE[topic.id]) : undefined;
  const readNext = related.filter((p) => isListed(p, basePath)).slice(0, 3);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string, close?: boolean) => {
    e.preventDefault();
    if (close) setTocOpen(false);
    scrollToSection(id);
    trackEvent("blog_toc_click", { post_slug: post.slug, section: id });
  };

  const tocList = (close?: boolean) => (
    <ul className="space-y-1">
      {toc.map((item) => {
        const on = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id, close)}
              aria-current={on ? "location" : undefined}
              className={`block rounded-lg px-3 py-2 text-sm leading-snug transition-colors ${
                on ? "bg-primary text-white font-semibold" : "text-primary/75 hover:bg-[#F5F0EA] hover:text-primary"
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  const share = (
    <div>
      <p className="text-sm font-semibold text-primary">{t.share}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share", { method: "whatsapp", content_type: "blog_post", item_id: post.slug })}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary hover:text-[#1ebe5b] transition-colors"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share", { method: "linkedin", content_type: "blog_post", item_id: post.slug })}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary hover:text-[#0a66c2] transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-4 w-4" aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
            trackEvent("share", { method: "copy_link", content_type: "blog_post", item_id: post.slug });
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-primary hover:text-accent transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-accent" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: t.home, url: "/" },
          { name: t.blog, url: basePath },
          { name: post.title, url: `${basePath}/${post.slug}` },
        ])}
      />
      <SchemaMarkup schema={blogPostingSchema(post, basePath)} />
      <Navbar />

      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
        <div
          className="h-full bg-accent origin-left rtl:origin-right transition-transform duration-150"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <main className="flex-1">
        {/* Header: title on one side, the post image on the other */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-14">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <div className="flex items-start justify-between gap-4 mb-7">
              <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-primary transition-colors">{t.home}</Link>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden />
                <Link href={basePath} className="hover:text-primary transition-colors">{t.blog}</Link>
              </nav>
              <BlogLangSwitcher lang={lang} translationSlug={post.translationSlug} />
            </div>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:items-center">
              <div>
                <span className="flex flex-wrap items-center gap-3">
                  <TopicPill post={post} lang={lang} />
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden /> {post.readingTimeMinutes} {t.minRead}
                  </span>
                </span>
                <h1 className={`mt-5 text-3xl md:text-[2.75rem] font-bold text-primary leading-[1.1] tracking-[-0.02em] text-balance ${serif}`}>
                  {post.title}
                </h1>
                {dek && <p className="mt-5 text-lg text-muted-foreground leading-relaxed line-clamp-4">{dek}</p>}
                <p className="mt-5 text-sm text-muted-foreground">
                  {t.by} <span className="font-medium text-primary">{post.author.name}</span> · {formatPostDate(post.date)}
                </p>
              </div>
              {post.featuredImage && (
                <div className="relative aspect-[1.91/1] overflow-hidden rounded-3xl bg-muted">
                  <img
                    src={pickBlogImage(post.featuredImage, "hero") ?? post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body: contents beside the article on desktop, a menu above it on phones */}
        <section className="pb-16 md:pb-20">
          <div
            className={`container mx-auto px-6 md:px-10 max-w-6xl grid gap-10 ${
              toc.length >= 3 ? "lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14" : ""
            }`}
          >
            {toc.length >= 3 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-6">
                  <nav className="rounded-2xl bg-white p-3" aria-label={t.inThis}>
                    <p className="px-3 pt-2 pb-2 text-sm font-semibold text-primary">{t.inThis}</p>
                    {tocList()}
                  </nav>
                  {share}
                </div>
              </aside>
            )}

            <article ref={articleRef} className={`min-w-0 max-w-[720px] ${toc.length >= 3 ? "" : "mx-auto w-full"}`}>
              {toc.length >= 3 && (
                <div className="lg:hidden mb-8 rounded-2xl bg-white">
                  <button
                    type="button"
                    onClick={() => setTocOpen((o) => !o)}
                    aria-expanded={tocOpen}
                    className="flex w-full items-center gap-3 px-5 py-4 text-start"
                  >
                    <span className="font-semibold text-primary">{t.inThis}</span>
                    <span className="text-sm text-muted-foreground">{t.sections(toc.length)}</span>
                    <ChevronDown className={`ms-auto h-5 w-5 shrink-0 transition-transform ${tocOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {tocOpen && <div className="px-2 pb-3">{tocList(true)}</div>}
                </div>
              )}

              <div ref={contentRef}>
                <ArticleBody html={html} isAr={isAr} />
              </div>

              {/* Lead capture where the reader finishes. The WhatsApp text names
                  the post so leads can be traced to it. */}
              <div className="mt-12 rounded-2xl bg-white p-6 md:p-8">
                <h2 className={`text-xl md:text-2xl font-bold text-primary ${serif}`}>{t.inlineHeading}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{t.inlineBody}</p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waMessage(post.title))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { source: "blog_post_inline", lang, post_slug: post.slug })}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold px-6 h-12 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden />
                    {t.inlineWhatsapp}
                  </a>
                  <Link
                    href="/listings"
                    onClick={() => trackEvent("select_content", { content_type: "blog_post_inline_browse", lang })}
                    className="inline-flex items-center justify-center rounded-full bg-background text-primary font-semibold px-6 h-12 hover:bg-[#ece5dc] transition-colors"
                  >
                    {t.inlineBrowse}
                  </Link>
                </div>
              </div>

              {/* The guide that continues this topic */}
              {guide && (
                <Link
                  href={`/guides/${guide.slug}`}
                  onClick={() => trackEvent("select_content", { content_type: "blog_post_guide", item_id: guide.slug, post_slug: post.slug })}
                  className="group mt-6 flex items-center gap-5 overflow-hidden rounded-2xl bg-primary p-3 pe-6 text-white"
                >
                  {guide.imageUrl && (
                    <span className="relative hidden sm:block aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl">
                      <img src={guide.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                    </span>
                  )}
                  <span className="min-w-0 py-2 ps-3 sm:ps-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/60">{t.goDeeper}</span>
                    <span className="mt-1 block font-serif text-lg font-bold leading-snug">{guide.title}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      {t.guideCta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </span>
                </Link>
              )}

              <div className="mt-10 lg:hidden">{share}</div>
            </article>
          </div>
        </section>

        {readNext.length > 0 && (
          <section className="pb-16 md:pb-24">
            <div className="container mx-auto px-6 md:px-10 max-w-6xl">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className={`text-2xl md:text-3xl font-bold text-primary ${serif}`}>{t.readNext}</h2>
                <Link href={basePath} className="shrink-0 text-sm font-semibold text-accent hover:underline">{t.backToAll}</Link>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {readNext.map((p, i) => (
                  <li key={p.id} className={i === 2 ? "sm:hidden lg:block" : ""}>
                    <PostCard post={p} lang={lang} basePath={basePath} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <CtaBand
          title={t.ctaHeading}
          text={t.ctaBody}
          primary={{ label: t.ctaButton, href: "/contact", form: { intent: "other", pageName: `Blog: ${post.title}` } }}
        />
      </main>

      <Footer />
    </div>
  );
}
