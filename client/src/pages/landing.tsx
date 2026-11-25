import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, ChevronRight, HelpCircle, Home, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { FaqAccordionList } from "@/components/FaqAccordionList";
import { supabase, type Listing } from "@/lib/supabase";
import { LOCATION_CONTENT } from "@/lib/location-content";
import { useDocumentMeta } from "@/lib/use-document-meta";
import {
  DEALS,
  LANDING_LOCATIONS,
  LANDING_MIN_UNITS,
  eligibleLandingPages,
  landingCopy,
  landingPath,
  landingProjects,
  medianLabel,
  landingRows,
  landingStats,
  type DealSlug,
} from "@/lib/landing-pages";
import { landingDevelopers, landingFaqTopics } from "@/lib/landing-related";
import NotFound from "@/pages/not-found";
import { TenantRepCallout } from "@/components/TenantRepCallout";

const SITE = "https://places-egy.com";
const CHIP =
  "inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors";
const BATCH = 24;
const CARD_FIELDS =
  "id,title,transaction_type,property_type,subtype,developer,project,location,location_area,price,currency,area_sqm,furnishing,images,rental_status,rental_end,updated_at,price_per_meter,maintenance_fees,maintenance_status,floor,parking,delivery_date";

// /rent/{location}, /buy/{location}, /income-property/{location}.
// The server renders the same copy for crawlers (server/seo/render.ts).
export default function LandingPage() {
  const [path] = useLocation();
  const { location: locSlug } = useParams<{ location: string }>();
  const dealSlug = path.split("/")[1] as DealSlug;
  const deal = DEALS[dealSlug];
  const loc = LANDING_LOCATIONS.find((l) => l.slug === locSlug);
  const content = loc ? LOCATION_CONTENT[loc.slug] : undefined;
  const [shown, setShown] = useState(BATCH);

  // This location's listings (all deal types, for the sibling links), card
  // fields only: no descriptions, which keeps the download small on mobile.
  const { data: all = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["landing-inventory", loc?.name],
    enabled: !!loc,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select(CARD_FIELDS)
        .eq("is_test", false)
        .eq("property_type", "admin")
        .eq("location", loc!.name)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(() => (deal && loc ? landingRows(all, dealSlug, loc.name) : []), [all, deal, dealSlug, loc]);
  const copy = useMemo(() => (deal && loc ? landingCopy(dealSlug, loc, landingStats(rows, loc.name)) : null), [deal, dealSlug, loc, rows]);
  const siblings = useMemo(
    () => (loc ? eligibleLandingPages(all).filter((p) => p.loc.slug === loc.slug && p.deal !== dealSlug) : []),
    [all, loc, dealSlug],
  );
  const pagePath = deal && loc ? landingPath(dealSlug, loc.slug) : path;
  const developers = useMemo(() => (loc ? landingDevelopers(loc.name) : []), [loc]);
  const projects = useMemo(() => (loc ? landingProjects(rows, loc.name) : []), [rows, loc]);
  const faqTopics = deal ? landingFaqTopics(dealSlug) : [];

  useDocumentMeta({
    title: copy?.title ?? "Offices | PLACES",
    description: copy?.description ?? "",
    url: `${SITE}${pagePath}`,
    image: content ? `${SITE}${content.heroImage}` : undefined,
  });

  if (!deal || !loc) return <NotFound />;
  if (!isLoading && rows.length < LANDING_MIN_UNITS) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Breadcrumb, ItemList and FAQPage JSON-LD come from the server render
          (server/seo/render.ts); adding them here would duplicate them. */}
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {content && (
            <img src={content.heroImage} alt={`${loc.name} business district`} fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/70 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${dealSlug}`} className="hover:text-white transition-colors">{deal.heading("Cairo")}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{loc.name}</span>
          </nav>
          <div className="inline-flex w-12 h-12 bg-accent/20 rounded-full items-center justify-center text-accent mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            {deal.heading(loc.name)}
          </h1>
          {copy ? (
            <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-3xl">{copy.intro[0]}</p>
          ) : (
            <div className="h-14 max-w-2xl rounded bg-white/10 animate-pulse mb-8" />
          )}
          <a href="#units">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              See {rows.length || ""} {deal.heading(loc.name).toLowerCase().replace(/ in .*/, "")} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Market summary from live data */}
      {copy && copy.intro.length > 1 && (
        <section className="py-8">
          <div className="container mx-auto px-6 md:px-10 max-w-4xl space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            {copy.intro.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* Tenant representation (rent pages only) */}
      {dealSlug === "rent" && (
        <section className="pb-8">
          <div className="container mx-auto px-6 md:px-10">
            <TenantRepCallout variant="rent" />
          </div>
        </section>
      )}

      {/* Units */}
      <section id="units" className="py-8 bg-secondary/40 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-8">
            <Home className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>{copy?.listHeading ?? deal.heading(loc.name)}</span>
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/40 bg-white h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rows.slice(0, shown).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} hideSubtype />
                ))}
              </div>
              {shown < rows.length && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" className="bg-white rounded-full px-8" onClick={() => setShown((n) => n + BATCH)}>
                    Show more ({rows.length - shown} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Projects with the most units — live counts and medians */}
      {projects.length >= 2 && (
        <section className="py-10">
          <div className="container mx-auto px-6 md:px-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>
                Projects with the most {dealSlug === "rent" ? "offices for rent" : dealSlug === "buy" ? "offices for sale" : "income properties"} in {loc.name}
              </span>
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projects.map((p) => (
                <li key={p.name} className="rounded-2xl bg-white border border-border/40 p-5">
                  <span className="block text-lg font-serif font-bold text-primary">{p.name}</span>
                  <span className="block mt-1 text-sm text-muted-foreground">
                    {p.count} available{p.median ? ` · ${medianLabel(dealSlug, p.median)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQs */}
      {copy && (
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>{copy.h1}: FAQs</span>
            </h2>
            <FaqAccordionList faqs={copy.faqs} />
          </div>
        </section>
      )}

      {/* Related searches + area guide */}
      <section className="py-10 bg-secondary/40">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary flex items-center gap-3 mb-5">
            <Building2 className="w-6 h-6 text-accent shrink-0" />
            <span>More offices in {loc.name}</span>
          </h2>
          <ul className="flex flex-wrap gap-3">
            {siblings.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors">
                  {DEALS[p.deal].heading(loc.name)} ({p.count})
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${dealSlug}`} className={CHIP}>
                {deal.heading("Cairo")}
              </Link>
            </li>
            <li>
              <Link href={`/locations/${loc.slug}`} className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors">
                {loc.name} area guide
              </Link>
            </li>
          </ul>
          {developers.length > 0 && (
            <>
              <h3 className="mt-8 mb-4 text-lg font-serif font-bold text-primary">Developers in {loc.name}</h3>
              <ul className="flex flex-wrap gap-3">
                {developers.map((d) => (
                  <li key={d.path}>
                    <Link href={d.path} className={CHIP}>{d.label}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className="mt-8 mb-4 text-lg font-serif font-bold text-primary">Questions to settle before you {dealSlug === "rent" ? "sign a lease" : "buy"}</h3>
          <ul className="flex flex-wrap gap-3">
            {faqTopics.map((t) => (
              <li key={t.path}>
                <Link href={t.path} className={CHIP}>{t.label}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Can't find the right space?{" "}
            <Link href="/contact" className="text-accent font-medium hover:underline">Tell us your size and budget</Link>{" "}
            and we'll send a shortlist.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
