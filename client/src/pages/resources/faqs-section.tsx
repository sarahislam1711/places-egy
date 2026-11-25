import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronRight,
  Search,
  Link2,
  Check,
  ArrowUp,
  Brain,
  Building2,
  Repeat,
  MapPin,
  Users,
  DollarSign,
  ScrollText,
  Coins,
  Handshake,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import {
  FAQ_SECTIONS,
  getFAQSectionBySlug,
  slugify,
  type FAQSection,
} from "@/lib/faq";
import NotFound from "@/pages/not-found";
import { TenantRepCallout } from "@/components/TenantRepCallout";
import { TENANT_REP_FAQ_SECTIONS } from "@/lib/tenant-rep-cta";

// Wraps every case-insensitive occurrence of `query` inside `text` in a styled
// <mark> so the matched substring stands out.
function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-accent/20 text-primary rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function fireGtag(name: string, params: Record<string, unknown>) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  "early-thinking": Brain,
  "admin-vs-commercial": Building2,
  "rent-buy-resale": Repeat,
  locations: MapPin,
  developers: Users,
  "pricing-value": DollarSign,
  "contracts-legal": ScrollText,
  "investment-income": Coins,
  "advisors-brokers": Handshake,
  "risks-mistakes": ShieldAlert,
};

export default function FAQSectionPage() {
  const { slug } = useParams<{ slug: string }>();
  // Same guard as /locations/{slug}: wait for wouter's params to settle
  // before deciding this is a 404. Without this gate the component flashed
  // <NotFound /> for a frame on the initial render, which users perceive
  // as 'the page 404'd then loaded'. Render a matched cream background
  // while we wait, then either render the real section or NotFound.
  if (!slug) {
    return <div className="min-h-screen w-full bg-background" aria-hidden />;
  }
  const section = getFAQSectionBySlug(slug);
  if (!section) return <NotFound />;

  return <SectionView section={section} />;
}

// Separated so the Hooks below run after the section guard above.
function SectionView({ section }: { section: FAQSection }) {
  // Per-section <title> + meta description so each /faqs/{slug} page ranks
  // for its own topic instead of being consolidated into the homepage.
  // Description dynamically composed from the section's real substance so
  // Google sees a unique snippet on each URL.
  const questionCount = section.subsections.reduce(
    (n, sub) => n + sub.items.length,
    0,
  );
  useDocumentMeta({
    title: `${section.title} — Egypt Office FAQs | PLACES`,
    description: `${questionCount} answered questions about ${section.title.toLowerCase()} for buying, renting, or investing in admin offices in Egypt. Written by PLACES advisors.`,
    url: `https://places-egy.com/faqs/${section.id}`,
  });

  const [search, setSearch] = useState("");
  const [activeSubsectionId, setActiveSubsectionId] = useState<string>(
    section.subsections[0]?.id ?? "",
  );
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const normalizedSearch = search.toLowerCase().trim();
  const Icon = SECTION_ICONS[section.id] ?? Brain;

  // Filter only within this section.
  const filteredSubsections = useMemo(() => {
    if (!normalizedSearch) return section.subsections;
    return section.subsections
      .map((sub) => ({
        ...sub,
        items: sub.items.filter(
          (item) =>
            item.q.toLowerCase().includes(normalizedSearch) ||
            item.a.toLowerCase().includes(normalizedSearch),
        ),
      }))
      .filter((sub) => sub.items.length > 0);
  }, [normalizedSearch, section]);

  // Scroll-spy on subsections (we're already inside one section).
  useEffect(() => {
    if (normalizedSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSubsectionId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    section.subsections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [normalizedSearch, section]);

  // GA4 search event — debounced, scoped to section so you can see what people
  // search WITHIN each topic.
  useEffect(() => {
    if (!normalizedSearch) return;
    const timer = window.setTimeout(() => {
      const resultsCount = filteredSubsections.reduce((acc, sub) => acc + sub.items.length, 0);
      fireGtag("search", {
        search_term: normalizedSearch,
        results_count: resultsCount,
        faq_section: section.id,
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [normalizedSearch, filteredSubsections, section.id]);

  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Open <details> at #anchor on first paint, in case the user landed deep-linked.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "auto", block: "start" });
      const details = el.closest("details");
      if (details && !details.open) details.open = true;
    });
  }, []);

  const handleCopyLink = (qSlug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${qSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(qSlug);
      window.setTimeout(() => setCopiedSlug(null), 1800);
    });
  };

  const otherSections = FAQ_SECTIONS.filter((s) => s.id !== section.id);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "FAQs", url: "/faqs" },
          { name: section.title, url: `/faqs/${section.id}` },
        ])}
      />
      {/* This section's FAQPage JSON-LD is baked into the served HTML by
          script/prerender.ts. Mounting it here too would put two FAQPage blocks
          on the page ("Duplicate field FAQPage" in Search Console). */}
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">{section.shortTitle ?? section.title}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Section {section.number} of {FAQ_SECTIONS.length}
            </span>
          </div>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-4 leading-tight">
            {section.title}
          </h1>
          <p className="text-lg text-muted-foreground">{section.intro}</p>
        </div>
      </section>

      {/* Sticky search bar — scoped to this section */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="container mx-auto px-6 md:px-10 py-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={`Search within ${section.shortTitle ?? section.title}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-border/60 focus-visible:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Body — sticky sidebar (subsections + other sections) + main content */}
      <div className="container mx-auto px-6 md:px-10 py-10">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-44 space-y-6">
              {/* Subsections in this section — scroll-spy enabled */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-accent mb-3">
                  On this page
                </span>
                <div className="space-y-1">
                  {section.subsections.map((sub) => {
                    const isActive = sub.id === activeSubsectionId;
                    return (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        className={`block rounded-md px-3 py-2 text-sm leading-snug font-semibold transition-colors ${
                          isActive ? "bg-primary text-white" : "text-primary/80 hover:bg-primary/5"
                        }`}
                      >
                        {sub.title}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Other sections — sibling nav */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-accent mb-3">
                  Other topics
                </span>
                <div className="space-y-1">
                  {otherSections.map((s) => {
                    const SIcon = SECTION_ICONS[s.id] ?? Brain;
                    return (
                      <Link
                        key={s.id}
                        href={`/faqs/${s.id}`}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm leading-snug font-medium text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <SIcon className="w-3.5 h-3.5 shrink-0 text-accent/70" />
                        <span className="flex-1">{s.shortTitle ?? s.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </aside>

          {/* Mobile section jump */}
          <div className="lg:hidden mb-6">
            <label htmlFor="faq-section-jump" className="block text-xs font-bold uppercase tracking-widest text-accent mb-2">
              Switch topic
            </label>
            <select
              id="faq-section-jump"
              className="w-full bg-white border border-border/60 rounded-md px-3 h-11 text-sm text-primary"
              value={section.id}
              onChange={(e) => {
                window.location.href = `/faqs/${e.target.value}`;
              }}
            >
              {FAQ_SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.shortTitle ?? s.title}
                </option>
              ))}
            </select>
          </div>

          <main className="min-w-0">
            {filteredSubsections.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-2">
                  No questions match "{search}" in this section.
                </p>
                <Link href="/faqs" className="text-accent font-medium hover:underline">
                  Search across all FAQs →
                </Link>
              </div>
            ) : (
              filteredSubsections.map((sub) => (
                <div key={sub.id} id={sub.id} className="scroll-mt-44 mb-12">
                  <h2 className="flex items-center gap-3 mb-5">
                    <span aria-hidden className="inline-block w-8 h-0.5 bg-accent shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      {sub.title}
                    </span>
                  </h2>
                  <div className="divide-y divide-border/40 border-y border-border/40">
                    {sub.items.map((item) => {
                      const qSlug = slugify(item.q);
                      const isCopied = copiedSlug === qSlug;
                      return (
                        <FAQAccordion
                          key={qSlug}
                          slug={qSlug}
                          question={item.q}
                          answer={item.a}
                          isCopied={isCopied}
                          onCopyLink={() => handleCopyLink(qSlug)}
                          searchQuery={normalizedSearch}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {TENANT_REP_FAQ_SECTIONS.has(section.id) && <TenantRepCallout variant="advice" className="mt-16" />}

            {/* Final per-section CTA */}
            <section className="mt-16 mb-4">
              <div className="bg-primary rounded-3xl p-10 md:p-14 text-center">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  Still have questions about {(section.shortTitle ?? section.title).toLowerCase()}?
                </h2>
                <p className="text-white/70 mb-8 max-w-xl mx-auto">
                  Book a free 15-minute consultation with a PLACES advisor — we'll answer your specific situation directly.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
                  >
                    Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      {showBackToTop && (
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <Footer />

      <CornerSlideMagnet />
    </div>
  );
}

// ─── Native details/summary accordion ──────────────────────────────

type AccordionProps = {
  slug: string;
  question: string;
  answer: string;
  isCopied: boolean;
  onCopyLink: () => void;
  searchQuery: string;
};

function FAQAccordion({ slug, question, answer, isCopied, onCopyLink, searchQuery }: AccordionProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = !!searchQuery;
    }
  }, [searchQuery]);

  return (
    <details
      ref={detailsRef}
      id={slug}
      className="group scroll-mt-44"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) {
          fireGtag("select_content", {
            content_type: "faq",
            item_id: slug,
            item_name: question,
          });
        }
      }}
    >
      <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <h3 className="text-base md:text-lg font-medium text-primary leading-snug flex-1 group-hover:text-accent transition-colors">
          {highlightMatch(question, searchQuery)}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label={isCopied ? "Link copied" : "Copy link to this question"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCopyLink();
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-md p-1.5 hover:bg-primary/5 text-primary/60 hover:text-accent"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
          <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-primary/5 text-primary/60 group-open:bg-accent group-open:text-white transition-colors text-sm font-medium">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </div>
      </summary>
      <div className="pb-6 pr-12 max-w-3xl">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {highlightMatch(answer, searchQuery)}
        </p>
      </div>
    </details>
  );
}
