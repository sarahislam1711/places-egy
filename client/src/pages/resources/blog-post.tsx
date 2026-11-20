import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
} from "lucide-react";
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

const BASE_URL = "https://places-egy.com";
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
    ctaHeading: "Want our take on your specific situation?",
    ctaBody: "Free 15-minute consultation with a PLACES advisor.",
    ctaButton: "Talk to an advisor",
    backToAll: "Back to all posts",
    defaultCategory: "Insights",
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
    ctaBody: "استشارة مجانية لمدة 15 دقيقة مع مستشار PLACES.",
    ctaButton: "تحدث مع مستشار",
    backToAll: "العودة إلى جميع المقالات",
    defaultCategory: "رؤى",
    inlineHeading: "بتدور على مكتب دلوقتي؟",
    inlineBody: "ابعتلنا المنطقة والمساحة والميزانية على واتساب، ومستشار من PLACES هيبعتلك قائمة بالوحدات المتاحة.",
    inlineWhatsapp: "ابعت طلبك على واتساب",
    inlineBrowse: "تصفح المكاتب المتاحة",
    waMessage: (title: string) => `مرحباً، قرأت مقال «${title}» على مدونة PLACES وعايز مساعدة في إيجاد مكتب.`,
  },
} as const;

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
    queryFn: () => (post ? fetchRelatedPosts(post, 3) : Promise.resolve([])),
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col font-sans bg-background"
        dir={isAr ? "rtl" : "ltr"}
      >
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen flex flex-col font-sans bg-background"
        dir={isAr ? "rtl" : "ltr"}
      >
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-background"
      dir={isAr ? "rtl" : "ltr"}
    >
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: t.home, url: "/" },
          { name: t.blog, url: basePath },
          { name: post.title, url: `${basePath}/${post.slug}` },
        ])}
      />
      <SchemaMarkup schema={blogPostingSchema(post, basePath)} />
      <Navbar />

      <section className="pt-24 md:pt-32 pb-6 md:pb-8">
        <div className="container mx-auto px-5 md:px-10 max-w-3xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">
                {t.home}
              </Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              <Link href={basePath} className="hover:text-primary transition-colors">
                {t.blog}
              </Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              <span className="text-primary line-clamp-1">{post.title}</span>
            </nav>
            <BlogLangSwitcher lang={lang} translationSlug={post.translationSlug} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            {post.categories.map((c) => (
              <span
                key={c.slug}
                className="text-[11px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full"
              >
                {c.name}
              </span>
            ))}
          </div>

          <h1
            className={`text-3xl md:text-5xl font-bold text-primary leading-tight mb-4 md:mb-6 ${
              isAr ? "font-serif-ar" : "font-serif"
            }`}
          >
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-t border-b border-border/40 py-4">
            <span className="font-medium text-primary">{post.author.name}</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatPostDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTimeMinutes} {t.minRead}
            </span>
          </div>
        </div>
      </section>

      {post.featuredImage && (
        <section className="pb-10">
          <div className="container mx-auto px-6 md:px-10 max-w-4xl">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img
                src={pickBlogImage(post.featuredImage, "hero") ?? post.featuredImage.url}
                alt={post.featuredImage.alt}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <article className="pb-10 md:pb-12">
        <div className="container mx-auto px-5 md:px-10 max-w-3xl">
          <div
            className={`blog-content ${isAr ? "blog-content-ar" : ""}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Lead capture right where the reader finishes the article. The
              WhatsApp text names the post so leads can be traced to it. */}
          <div
            className="mt-10 rounded-2xl border border-accent/30 bg-accent/5 p-6 md:p-7"
            dir={isAr ? "rtl" : "ltr"}
          >
            <h2 className={`text-xl md:text-2xl font-bold text-primary mb-2 ${isAr ? "font-serif-ar" : "font-serif"}`}>
              {t.inlineHeading}
            </h2>
            <p className="text-muted-foreground mb-5">{t.inlineBody}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waMessage(post.title))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { source: "blog_post_inline", lang, post_slug: post.slug })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-medium px-6 h-12 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t.inlineWhatsapp}
              </a>
              <Link
                href="/listings"
                onClick={() => trackEvent("select_content", { content_type: "blog_post_inline_browse", lang })}
                className="inline-flex items-center justify-center rounded-full border border-primary/20 text-primary font-medium px-6 h-12 hover:bg-primary/5 transition-colors"
              >
                {t.inlineBrowse}
              </Link>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border/40 flex flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2 self-center">
                {t.tags}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="text-xs font-medium text-primary/70 bg-primary/5 border border-primary/10 px-3 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <section className="pb-12">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          <div className="bg-secondary/40 border border-border/40 rounded-2xl p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
              {t.writtenBy}
            </p>
            <h3
              className={`text-lg font-bold text-primary mb-1 ${
                isAr ? "font-serif-ar" : "font-serif"
              }`}
            >
              {post.author.name}
            </h3>
            <p className="text-sm text-muted-foreground">{t.authorBio}</p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 border-t border-border/40 pt-12">
          <div className="container mx-auto px-6 md:px-10">
            <h2
              className={`text-2xl md:text-3xl font-bold text-primary mb-2 ${
                isAr ? "font-serif-ar" : "font-serif"
              }`}
            >
              {t.readNext}
            </h2>
            <p className="text-muted-foreground mb-8">{t.readNextSub}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`${basePath}/${p.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {p.featuredImage && (
                      <img
                        src={pickBlogImage(p.featuredImage, "card") ?? p.featuredImage.url}
                        alt={p.featuredImage.alt}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                      {p.categories[0]?.name ?? t.defaultCategory}
                    </span>
                    <h3
                      className={`text-base font-bold text-primary mt-2 leading-snug group-hover:text-accent transition-colors line-clamp-2 ${
                        isAr ? "font-serif-ar" : "font-serif"
                      }`}
                    >
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-border/40">
            <div>
              <h2
                className={`text-2xl md:text-3xl font-bold text-primary mb-1 ${
                  isAr ? "font-serif-ar" : "font-serif"
                }`}
              >
                {t.ctaHeading}
              </h2>
              <p className="text-muted-foreground">{t.ctaBody}</p>
            </div>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0"
              >
                {t.ctaButton}{" "}
                <ArrowRight className={`ml-2 w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
          <Link
            href={basePath}
            className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 mr-1 ${isAr ? "rotate-180" : ""}`} />{" "}
            {t.backToAll}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
