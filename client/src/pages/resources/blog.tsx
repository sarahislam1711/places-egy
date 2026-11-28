import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight, Search, X } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, blogIndexSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { BlogLangSwitcher } from "@/components/blog/BlogLangSwitcher";
import { BlogSlideUpMagnet } from "@/components/magnets/BlogSlideUpMagnet";
import { FeaturedPost, PostCard, PostRow } from "@/components/blog/BlogCards";
import { CtaBand } from "@/components/service-page";
import { fetchPosts, stripHtml, type BlogLang, type BlogPost } from "@/lib/blog";
import { TOPICS, isListed, topicOf, type TopicId } from "@/lib/blog-topics";
import { GUIDES } from "@/lib/guides";

// /blog and /ar/blog (redesigned 28 Nov). Every post loads at once (there
// are ~30 per language) so readers can search and filter by topic instead of
// paging 9 at a time:
//   - header with search
//   - newest post large + the next 3 as a "Latest" list
//   - "Browse by topic" tabs + card grid with "Show more"
//   - the in-depth guides (English), then the dark closing band
// The WordPress category chips are gone: every post is in the same category.

const PAGE = 9;

const COPY = {
  en: {
    home: "Home",
    blog: "Blog",
    heading: "PLACES Blog",
    sub: "Practical advice on renting, buying and running an office in Egypt, from the advisors who negotiate these deals every day.",
    search: (n: number) => `Search ${n} articles`,
    clear: "Clear search",
    latest: "Latest",
    browse: "Browse by topic",
    all: "All articles",
    results: (n: number, q: string) => `${n} ${n === 1 ? "article matches" : "articles match"} “${q}”`,
    none: "Nothing matches that yet. Try a shorter word, or browse by topic.",
    more: "Show more articles",
    guidesTitle: "Want the full picture? Read our in-depth guides",
    guidesAll: "All guides",
    ctaTitle: "Want our take on your situation?",
    ctaText: "Tell us what you need and a PLACES advisor will come back with options that fit.",
    ctaButton: "Send us your requirements",
  },
  ar: {
    home: "الرئيسية",
    blog: "المدونة",
    heading: "مدونة PLACES",
    sub: "تحليلات ونصائح حول سوق العقارات الإدارية والتجارية في مصر — من فريق يعمل داخل السوق كل يوم.",
    search: (n: number) => `ابحث في ${n} مقال`,
    clear: "مسح البحث",
    latest: "الأحدث",
    browse: "تصفح حسب الموضوع",
    all: "كل المقالات",
    results: (n: number, q: string) => `${n} مقال يطابق «${q}»`,
    none: "لا توجد نتائج. جرّب كلمة أقصر أو تصفح حسب الموضوع.",
    more: "عرض المزيد",
    guidesTitle: "أدلة متعمقة (بالإنجليزية)",
    guidesAll: "كل الأدلة",
    ctaTitle: "تريد رأينا في حالتك بالذات؟",
    ctaText: "قل لنا ما تحتاجه وسيعود إليك مستشار من PLACES بخيارات مناسبة.",
    ctaButton: "أرسل طلبك",
  },
} as const;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ٟ]/g, "");

export default function BlogIndexPage({ lang = "en" }: { lang?: BlogLang }) {
  const isAr = lang === "ar";
  const t = COPY[lang];
  const basePath = isAr ? "/ar/blog" : "/blog";
  const serif = isAr ? "font-serif-ar" : "font-serif";

  useDocumentMeta({
    title: isAr
      ? "PLACES Blog — تحليل سوق العقارات الإدارية في مصر"
      : "PLACES Blog — Egyptian Office Real Estate Market Analysis",
    description: t.sub,
    url: `https://places-egy.com${basePath}`,
  });

  // Old /blog/category/:slug links still work: they narrow to that WordPress category.
  const params = useParams<{ category?: string }>();
  const category = params.category ? decodeURIComponent(params.category) : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["blog-all-posts-for-cats", lang],
    queryFn: () => fetchPosts({ page: 1, perPage: 100, lang }),
    staleTime: 5 * 60 * 1000,
  });

  const all = useMemo(
    () =>
      (data?.posts ?? []).filter(
        (p) => isListed(p, basePath) && (!category || p.categories.some((c) => c.slug === category)),
      ),
    [data, basePath, category],
  );

  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  const q = query.trim();
  const searching = q.length > 1;
  const showLatest = !searching && topic === "all" && !category && all.length > 5;
  const latest = showLatest ? all.slice(0, 5) : [];

  const list = useMemo(() => {
    if (searching) {
      const words = norm(q).split(/\s+/).filter(Boolean);
      return all.filter((p) => {
        const hay = norm(`${p.title} ${stripHtml(p.excerpt)}`);
        return words.every((w) => hay.includes(w));
      });
    }
    const inTopic = topic === "all" ? all : all.filter((p) => topicOf(p, lang)?.id === topic);
    return showLatest ? inTopic.slice(5) : inTopic;
  }, [all, topic, searching, q, lang, showLatest]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const p of all) {
      const id = topicOf(p, lang)?.id;
      if (id) c[id] = (c[id] ?? 0) + 1;
    }
    return c;
  }, [all, lang]);

  const schemaPosts = useMemo(
    () => all.map((p: BlogPost) => ({ title: p.title, slug: p.slug, date: p.date, excerpt: stripHtml(p.excerpt) })),
    [all],
  );

  const pickTopic = (id: TopicId | "all") => {
    setTopic(id);
    setShown(PAGE);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: t.home, url: "/" },
          { name: t.blog, url: basePath },
        ])}
      />
      <SchemaMarkup schema={blogIndexSchema({ posts: schemaPosts })} />
      <Navbar />

      <main className="flex-1">
        {/* Header: title + search */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-12">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <div className="flex items-start justify-between gap-4 mb-7">
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-primary transition-colors">{t.home}</Link>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden />
                <span className="text-primary font-medium" aria-current="page">{t.blog}</span>
              </nav>
              <BlogLangSwitcher lang={lang} />
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,24rem)] lg:items-end">
              <div>
                <h1 className={`text-4xl md:text-[3.4rem] font-bold text-primary leading-[1.05] tracking-[-0.03em] ${serif}`}>{t.heading}</h1>
                <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">{t.sub}</p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShown(PAGE);
                  }}
                  placeholder={t.search(all.length || 30)}
                  aria-label={t.search(all.length || 30)}
                  className="h-13 w-full rounded-full bg-white ps-12 pe-12 text-base text-primary placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={t.clear}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-primary"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-6 md:px-10 max-w-6xl pb-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Newest post large, next three as a list */}
            {showLatest && (
              <section className="pb-14 md:pb-20">
                <div className="container mx-auto px-6 md:px-10 max-w-6xl grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
                  <FeaturedPost post={latest[0]} lang={lang} basePath={basePath} />
                  <div className="flex flex-col">
                    <h2 className={`text-2xl font-bold text-primary mb-4 ${serif}`}>{t.latest}</h2>
                    <ul className="flex flex-col gap-3">
                      {latest.slice(1).map((p) => (
                        <li key={p.id}>
                          <PostRow post={p} lang={lang} basePath={basePath} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Topic tabs + grid (or search results) */}
            <section className="pb-16 md:pb-24">
              <div className="container mx-auto px-6 md:px-10 max-w-6xl">
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <h2 className={`text-2xl md:text-3xl font-bold text-primary ${serif}`} aria-live="polite">
                    {searching ? t.results(list.length, q) : t.browse}
                  </h2>
                  {!searching && (
                    <div
                      role="tablist"
                      aria-label={t.browse}
                      className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {[{ id: "all" as const, label: t.all }, ...TOPICS.map((tp) => ({ id: tp.id, label: isAr ? tp.ar : tp.en }))]
                        .filter((f) => counts[f.id])
                        .map((f) => {
                          const on = f.id === topic;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              role="tab"
                              aria-selected={on}
                              onClick={() => pickTopic(f.id)}
                              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                on ? "bg-primary text-white" : "bg-white text-primary hover:bg-white/70"
                              }`}
                            >
                              {f.label} <span className={on ? "text-white/60" : "text-muted-foreground"}>{counts[f.id]}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {list.length === 0 ? (
                  <p className="rounded-2xl bg-white p-8 text-muted-foreground">{t.none}</p>
                ) : (
                  <>
                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {list.slice(0, shown).map((p) => (
                        <li key={p.id}>
                          <PostCard post={p} lang={lang} basePath={basePath} />
                        </li>
                      ))}
                    </ul>
                    {list.length > shown && (
                      <div className="mt-10 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShown((n) => n + PAGE)}
                          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                          {t.more} <span className="text-white/60">({list.length - shown})</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* In-depth guides */}
            <section className="pb-16 md:pb-24">
              <div className="container mx-auto px-6 md:px-10 max-w-6xl">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className={`text-2xl md:text-3xl font-bold text-primary ${serif}`}>{t.guidesTitle}</h2>
                  <Link href="/guides" className="shrink-0 text-sm font-semibold text-accent hover:underline">{t.guidesAll}</Link>
                </div>
                <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="ltr">
                  {GUIDES.map((g) => (
                    <li key={g.slug} className="w-60 shrink-0 snap-start md:w-auto">
                      <Link href={`/guides/${g.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white">
                        <span className="relative block aspect-[16/10] overflow-hidden bg-muted">
                          {g.imageUrl && (
                            <img src={g.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          )}
                        </span>
                        <span className="flex flex-1 flex-col p-4">
                          <span className="font-serif font-bold leading-snug text-primary group-hover:text-accent transition-colors">{g.title}</span>
                          <span className="mt-auto pt-2 text-xs text-muted-foreground">{g.readMinutes} min read</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        <CtaBand
          title={t.ctaTitle}
          text={t.ctaText}
          primary={{ label: t.ctaButton, href: "/contact", form: { intent: "other", pageName: "Blog" } }}
        />
      </main>

      <Footer />
      <BlogSlideUpMagnet />
    </div>
  );
}
