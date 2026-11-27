import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { breadcrumbSchema, guidesCollectionSchema } from "@/lib/schema";
import { GUIDES } from "@/lib/guides";
import { ArrowRight, Clock } from "lucide-react";
import { DeveloperSurveyMagnet } from "@/components/magnets/DeveloperSurveyMagnet";

// /guides — hub index page. One card per guide. Auto-populates from the
// GUIDES array in lib/guides.ts. Also emits a CollectionPage JSON-LD block
// that lists every guide, so AI answer engines pick up the whole library
// from a single crawl.

export default function GuidesIndexPage() {
  useDocumentMeta({
    title: "Cairo Office Guides — Renting, Buying & Fit-Out | PLACES",
    description:
      "Practical, data-backed guides on renting, buying, sizing, and fitting out an office in Cairo. Written by PLACES, Egypt's admin-office specialists.",
    url: "https://places-egy.com/guides",
  });

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

      <main className="flex-1 pt-24 md:pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-3">
            PLACES Guides
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary tracking-tight leading-tight mb-4">
            The Cairo office playbook.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Everything you actually need to know before renting, buying, or
            fitting out an office in Egypt — data-backed, plain-language, no
            fluff. Written by PLACES, who broker Cairo's admin office market
            every day.
          </p>
        </section>

        {/* Guide cards (no divider: it left ~110px of empty space under the intro) */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl mt-8 md:mt-12">
          <div className="grid gap-6 md:grid-cols-2">
            {GUIDES.map((guide, idx) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className={`group bg-white border border-border/40 rounded-2xl p-6 md:p-8 hover:border-accent/40 hover:shadow-xl transition-all ${
                  // First guide gets a slight visual emphasis so the reader has
                  // a clear "start here" without a heavy-handed label.
                  idx === 0 ? "md:col-span-2 border-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                    {guide.category}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {guide.readMinutes} min
                  </span>
                </div>

                <h2
                  className={`font-serif font-bold text-primary group-hover:text-accent transition-colors leading-tight mb-3 ${
                    idx === 0 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                  }`}
                >
                  {guide.title}
                </h2>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                  {guide.excerpt}
                </p>

                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Read the guide
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl mt-16">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-10 text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-white">
              Need advice specific to your situation?
            </h3>
            <p className="text-white/80 mb-6 max-w-xl mx-auto leading-relaxed">
              Every office decision is different. Tell PLACES what you're
              looking for and we'll come back with a short-list of buildings
              that fit.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
            >
              Talk to a PLACES advisor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <DeveloperSurveyMagnet variant="popup" />
    </div>
  );
}
