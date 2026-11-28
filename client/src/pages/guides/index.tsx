import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { CtaBand } from "@/components/service-page";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { breadcrumbSchema, guidesCollectionSchema } from "@/lib/schema";
import { GUIDES, type Guide } from "@/lib/guides";
import { ArrowRight, Check, ChevronRight, Clock } from "lucide-react";
import { DeveloperSurveyMagnet } from "@/components/magnets/DeveloperSurveyMagnet";
import { SurveyCard } from "@/components/guides/GuideLayout";

// /guides — hub index page. Auto-populates from GUIDES in lib/guides.ts and
// emits a CollectionPage JSON-LD block listing every guide, so AI answer
// engines pick up the whole library from a single crawl.
//
// Layout (28 Nov redesign): split header with the "start here" guide as a big
// photo card, topic filters, photo cards for the rest, dark closing band.
// Every guide stays in the HTML whatever filter is picked (crawlers see all).

type Filter = { id: string; label: string; match: (g: Guide) => boolean };
const FILTERS: Filter[] = [
  { id: "all", label: "All guides", match: () => true },
  { id: "renting", label: "Renting", match: (g) => g.category === "Renting" },
  { id: "buying", label: "Buying", match: (g) => g.category === "Buying" },
  { id: "planning", label: "Planning & costs", match: (g) => g.category === "Planning" || g.category === "Costs" },
];

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {guide.imageUrl && (
          <img
            src={guide.imageUrl}
            alt={guide.imageAlt ?? ""}
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary">
          {guide.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg md:text-xl font-bold leading-snug text-primary group-hover:text-accent transition-colors">
          {guide.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{guide.excerpt}</p>
        <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {guide.readMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function GuidesIndexPage() {
  useDocumentMeta({
    title: "Cairo Office Guides — Renting, Buying & Fit-Out | PLACES",
    description:
      "Practical, data-backed guides on renting, buying, sizing, and fitting out an office in Cairo. Written by PLACES, Egypt's admin-office specialists.",
    url: "https://places-egy.com/guides",
  });

  const [filter, setFilter] = useState("all");
  const featured = GUIDES[0];
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  // "All": the featured guide is already in the header, so the grid shows the rest.
  const shown = GUIDES.filter((g) => active.match(g) && (filter !== "all" || g.slug !== featured.slug));

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
        ])}
      />
      <SchemaMarkup
        schema={guidesCollectionSchema(
          GUIDES.map((g) => ({
            name: g.title,
            url: `/guides/${g.slug}`,
            description: g.description,
          })),
        )}
      />

      <Navbar />

      <main className="flex-1">
        {/* Header: intro on the left, the "start here" guide on the right */}
        <section className="pt-28 md:pt-36 pb-12 md:pb-16">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
            <div>
              <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                <span className="text-primary font-medium" aria-current="page">Guides</span>
              </nav>
              <h1 className="font-serif text-4xl md:text-[3.6rem] font-bold text-primary leading-[1.04] tracking-[-0.03em]">
                The Cairo office playbook
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Practical guides to renting, buying, sizing and fitting out an office in Cairo, written by the PLACES advisors who negotiate these deals every day.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[`${GUIDES.length} in-depth guides`, "Real 2026 Cairo numbers", "Free, no sign-up"].map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Check className="h-4 w-4 text-accent" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/guides/${featured.slug}`}
              className="group relative block overflow-hidden rounded-3xl bg-primary aspect-[4/5] sm:aspect-[4/3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {featured.imageUrl && (
                <img
                  src={featured.imageUrl}
                  alt={featured.imageAlt ?? ""}
                  width={900}
                  height={675}
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/45 to-transparent" aria-hidden />
              <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Start here</span>
              <span className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7 block">
                <span className="flex items-center gap-2 text-sm text-white/80">
                  {featured.category} <span aria-hidden>·</span> <Clock className="h-3.5 w-3.5" aria-hidden /> {featured.readMinutes} min read
                </span>
                <span className="mt-2 block font-serif text-2xl md:text-3xl font-bold leading-tight text-white">{featured.title}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </span>
            </Link>
          </div>
        </section>

        {/* All guides, filterable by topic */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">Browse by topic</h2>
              <div role="tablist" aria-label="Filter guides by topic" className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((f) => {
                  const count = GUIDES.filter(f.match).length;
                  const on = f.id === filter;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setFilter(f.id)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        on ? "bg-primary text-white" : "bg-white text-primary hover:bg-white/70"
                      }`}
                    >
                      {f.label} <span className={on ? "text-white/60" : "text-muted-foreground"}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((g) => (
                <li key={g.slug}>
                  <GuideCard guide={g} />
                </li>
              ))}
            </ul>
            <SurveyCard className="mt-8 md:flex md:items-center md:gap-6 [&>p]:md:mt-0 [&>button]:md:mt-0 [&>button]:md:ml-auto" />
          </div>
        </section>

        <CtaBand
          title="Need advice for your situation?"
          text="Every office decision is different. Tell us what you need and a PLACES advisor will come back with options that fit."
          primary={{ label: "Send us your requirements", href: "/contact", form: { intent: "other", pageName: "Guides" } }}
        />
      </main>

      <Footer />

      <DeveloperSurveyMagnet variant="popup" autoShow={false} />
    </div>
  );
}
