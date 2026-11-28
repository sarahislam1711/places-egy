import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { ArrowRight, ArrowLeft, Check, Clock, ChevronDown, ChevronRight, FileText, ListChecks } from "lucide-react";
import { GUIDES, type Guide } from "@/lib/guides";
import { trackEvent } from "@/lib/analytics";
import { openCalendly } from "@/lib/calendly";
import { TenantRepCallout } from "@/components/TenantRepCallout";
import { DeveloperSurveyMagnet, openDeveloperSurvey } from "@/components/magnets/DeveloperSurveyMagnet";
import { scrollToSection, useActiveSection, useAutoToc, useReadingProgress } from "@/lib/reading";

// Shared layout for every /guides/* page (redesigned 28 Nov). Handles:
//   - <title>, meta description, canonical, og:* and Article + Breadcrumb JSON-LD
//   - Split header: breadcrumb, category + read time, H1, intro and a
//     "What you'll learn" box on the left; the guide's photo on the right
//   - Thin reading-progress bar along the top edge of the screen
//   - Contents built from the H2s the page renders: a sticky panel on desktop
//     that highlights the section in view, a collapsible menu on phones
//   - Ending: the tenant-rep call-out, "Keep reading" photo cards, a call link
//
// Per-guide files just export their content between the layout tags. See
// office-rental-prices-cairo-2026.tsx for the canonical example.

type Props = {
  guide: Guide;
  wordCount?: number;
  children: ReactNode;
};

// The guides lead magnet (28 Nov): the free office search checklist PDF.
// Opens the same sign-up popup as the survey, set to the checklist offer.
const CHECKLIST_POINTS = [
  "What to decide before your first viewing",
  "What to check in every building",
  "The four lease terms worth negotiating",
  "A table to compare three offices side by side",
];

export function ChecklistCard({ guideSlug, className = "" }: { guideSlug?: string; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white p-6 md:p-8 ${className}`}>
      <div className="flex flex-col gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <ListChecks className="h-3.5 w-3.5" aria-hidden /> Free checklist · PDF
          </span>
          <p className="mt-3 font-serif text-2xl md:text-[1.7rem] font-bold leading-tight text-primary">
            The Cairo office search checklist
          </p>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Every step PLACES advisors check, from working out how much space you need to move-in day. Three printable pages.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {CHECKLIST_POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-primary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            trackEvent("office_checklist_open", { guide_slug: guideSlug ?? null });
            openDeveloperSurvey({ source: "checklist_card", guide_slug: guideSlug ?? null, offer: "office_checklist" });
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          Get the free checklist <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// The developer-survey lead magnet as a calm card in the page (28 Nov): the
// timed popup covered what people were reading. Clicking opens the popup form.
export function SurveyCard({ guideSlug, className = "" }: { guideSlug?: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 ${className}`}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        <FileText className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-3 font-serif text-lg font-bold leading-snug text-primary">What are Cairo developers actually charging?</p>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">Our free 2026 price survey: real numbers from New Cairo, Sheikh Zayed and 6th October.</p>
      <button
        type="button"
        onClick={() => {
          trackEvent("developer_survey_open", { variant: "card", guide_slug: guideSlug ?? null });
          openDeveloperSurvey({ source: "card", guide_slug: guideSlug ?? null });
        }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
      >
        Get the free survey <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function GuideLayout({ guide, wordCount, children }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const toc = useAutoToc(contentRef);
  const active = useActiveSection(toc.map((t) => t.id));
  const progress = useReadingProgress(contentRef);
  const url = `https://places-egy.com/guides/${guide.slug}`;
  // Two other guides to keep reading: the next ones in the list, wrapping round.
  const i = GUIDES.findIndex((g) => g.slug === guide.slug);
  const more = [1, 2].map((n) => GUIDES[(i + n) % GUIDES.length]).filter((g) => g.slug !== guide.slug);

  useDocumentMeta({
    title: `${guide.title} | PLACES`,
    description: guide.description,
    url,
    image: guide.imageUrl,
  });

  useEffect(() => {
    trackEvent("guide_view", { guide_slug: guide.slug, guide_title: guide.title, category: guide.category });
  }, [guide.slug, guide.title, guide.category]);

  const showUpdated = guide.updatedAt !== guide.publishedAt;

  // Jump to the start of a section, just below the fixed navbar. Done by hand
  // because on phones the contents menu closes on tap, which shifts the page
  // mid-scroll and made the browser's own anchor jump stop short.
  const goToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string, onPick?: () => void) => {
    e.preventDefault();
    onPick?.();
    scrollToSection(id);
  };

  const tocList = (onPick?: () => void) => (
    <ul className="space-y-1">
      {toc.map((item) => {
        const on = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => goToSection(e, item.id, onPick)}
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
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SchemaMarkup
        schema={articleSchema({
          headline: guide.title,
          description: guide.description,
          slug: guide.slug,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          imageUrl: guide.imageUrl,
          section: guide.category,
          readMinutes: guide.readMinutes,
          wordCount,
        })}
      />
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ])}
      />

      <Navbar />

      {/* Reading progress: a thin line along the very top of the screen */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden>
        <div className="h-full origin-left bg-accent transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <main className="flex-1">
        {/* Header */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-14">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-7">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                <span className="text-primary font-medium line-clamp-1">{guide.category}</span>
              </nav>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">{guide.category}</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {guide.readMinutes} min read
                </span>
              </div>
              <h1 className="mt-5 font-serif text-3xl md:text-[2.9rem] font-bold text-primary leading-[1.08] tracking-[-0.025em] text-balance">
                {guide.title}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">{guide.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                By PLACES advisors · {showUpdated ? "Updated" : "Published"}{" "}
                <time dateTime={showUpdated ? guide.updatedAt : guide.publishedAt}>{fmtDate(showUpdated ? guide.updatedAt : guide.publishedAt)}</time>
              </p>
            </div>

            <div className="relative">
              {guide.imageUrl && (
                <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                  <img
                    src={guide.imageUrl}
                    alt={guide.imageAlt ?? ""}
                    width={900}
                    height={675}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {guide.learn && guide.learn.length > 0 && (
                <div className="relative -mt-16 mx-4 md:mx-8 rounded-2xl bg-primary p-5 md:p-6 text-white shadow-[0_24px_48px_-20px_rgba(17,17,17,0.5)]">
                  <p className="font-serif text-lg font-bold text-white">What you'll learn</p>
                  <ul className="mt-3 space-y-2">
                    {guide.learn.map((l) => (
                      <li key={l} className="flex items-start gap-2.5 text-sm text-white/85">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body: contents on the left (desktop), the article on the right */}
        <section className="pb-12">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-4">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="px-3 pb-2 font-serif text-base font-bold text-primary">In this guide</p>
                    {tocList()}
                  </div>
                  <SurveyCard guideSlug={guide.slug} />
                </div>
              </aside>
            )}

            <div className="min-w-0">
              {/* Phones / tablets: contents as a collapsible menu */}
              {toc.length > 0 && (
                <div className="lg:hidden mb-8 rounded-2xl bg-white">
                  <button
                    type="button"
                    onClick={() => setTocOpen((o) => !o)}
                    aria-expanded={tocOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-serif font-bold text-primary"
                  >
                    In this guide <span className="font-sans text-sm font-normal text-muted-foreground">{toc.length} sections</span>
                    <ChevronDown className={`ml-auto h-5 w-5 shrink-0 transition-transform ${tocOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {tocOpen && <div className="px-2 pb-3">{tocList(() => setTocOpen(false))}</div>}
                </div>
              )}

              <article
                ref={contentRef}
                className="guide-content max-w-[720px] prose prose-neutral md:prose-lg prose-headings:font-serif prose-headings:text-primary prose-headings:scroll-mt-28 prose-h2:text-2xl md:prose-h2:text-[2rem] prose-h2:leading-tight prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-primary/85 prose-a:text-accent prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-li:text-primary/85 prose-table:text-sm prose-th:bg-primary/5 prose-th:text-primary prose-td:align-top prose-img:rounded-2xl"
              >
                {children}
              </article>
              <ChecklistCard guideSlug={guide.slug} className="mt-12 max-w-[720px]" />
              <SurveyCard guideSlug={guide.slug} className="lg:hidden mt-6 max-w-[720px]" />
            </div>
          </div>
        </section>

        {/* Free advisor offer */}
        <section className="pb-14">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <TenantRepCallout variant="advice" />
          </div>
        </section>

        {/* Keep reading */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">Keep reading</h2>
              <Link href="/guides" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
                All guides <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-2">
              {more.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    onClick={() => trackEvent("guide_next_click", { from_slug: guide.slug, to_slug: g.slug })}
                    className="group flex h-full overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {g.imageUrl && (
                      <div className="w-[38%] shrink-0 overflow-hidden bg-muted">
                        <img
                          src={g.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-xs font-semibold text-accent">{g.category}</span>
                      <span className="mt-1.5 font-serif text-lg font-bold leading-snug text-primary group-hover:text-accent transition-colors">{g.title}</span>
                      <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {g.readMinutes} min read
                        <ArrowRight className="ml-auto h-4 w-4 text-accent transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
              <Link href="/guides" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All PLACES guides
              </Link>
              <button
                type="button"
                onClick={() => openCalendly("guide_footer", `guide_${guide.slug}`)}
                className="text-muted-foreground hover:text-accent transition-colors underline decoration-dotted underline-offset-4"
              >
                Prefer to talk? Book a 30-minute call
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Developer survey form: opens only from the survey card (no timed popup). */}
      <DeveloperSurveyMagnet variant="popup" guideSlug={guide.slug} autoShow={false} />
    </div>
  );
}
