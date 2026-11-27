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
import { LOCATION_CONTENT, getProjectImage } from "@/lib/location-content";
import { areaPhoto } from "@/lib/area-visuals";
import { ServiceHero } from "@/components/service-page";
import { RequirementsTrigger } from "@/components/RequirementsForm";
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
import { landingFaqTopics } from "@/lib/landing-related";
import NotFound from "@/pages/not-found";
import { TenantRepCallout } from "@/components/TenantRepCallout";

const SITE = "https://places-egy.com";
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
  const projects = useMemo(() => (loc ? landingProjects(rows, loc.name) : []), [rows, loc]);
  const heroMedian = useMemo(() => {
    if (!loc) return null;
    const st = landingStats(rows, loc.name);
    return st.perSqm ? medianLabel(dealSlug, st.perSqm[1]) : null;
  }, [rows, loc, dealSlug]);
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

      {/* Same split hero as the service pages and the /rent hub. */}
      <ServiceHero
        crumbs={[{ name: "Home", href: "/" }, { name: deal.heading("Cairo"), href: `/${dealSlug}` }, { name: loc.name }]}
        title={deal.heading(loc.name)}
        intro={copy ? copy.intro[0] : `Every available ${deal.label === "as income properties" ? "income property" : `office ${deal.label}`} in ${loc.name}.`}
        primary={{
          label: "Send us your requirements",
          href: "/contact",
          form: { intent: dealSlug === "rent" ? "rent" : dealSlug === "buy" ? "buy" : "invest", pageName: deal.heading(loc.name) },
        }}
        image={areaPhoto(loc.slug).image}
        imageAlt={areaPhoto(loc.slug).alt}
        promise={{
          title: rows.length ? `${rows.length} ${dealSlug === "income-property" ? "income properties" : `offices ${deal.label}`}` : deal.heading(loc.name),
          text: heroMedian ? `${heroMedian.charAt(0).toUpperCase()}${heroMedian.slice(1)}.` : `Updated as units are listed and withdrawn.`,
        }}
        points={[
          "Compare projects and prices",
          "Book a viewing on any office",
          dealSlug === "rent" ? "Free tenant representation" : "Advice before you buy",
        ]}
      />

      {/* Tenant representation (rent pages only) */}
      {dealSlug === "rent" && (
        <section className="pb-10">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <TenantRepCallout variant="rent" />
          </div>
        </section>
      )}

      {/* Units */}
      <section id="units" className="py-8 bg-secondary/40 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
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
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>
                Projects with the most {dealSlug === "rent" ? "offices for rent" : dealSlug === "buy" ? "offices for sale" : "income properties"} in {loc.name}
              </span>
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projects.map((p) => (
                <li key={p.name} className="relative overflow-hidden rounded-2xl bg-white border border-border/40 p-5">
                  {/* Faded photo of the project (the area's photo when we have none). */}
                  <img
                    src={getProjectImage(p.name) ?? areaPhoto(loc.slug).image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.28]"
                  />
                  <span className="relative block text-lg font-serif font-bold text-primary">{p.name}</span>
                  <span className="relative block mt-1 text-sm text-muted-foreground">
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

      {/* Keep exploring: the area guide (with the other deals here) and the
          questions to settle first, instead of rows of pills. The same links
          feed Google's view of the area and FAQ pages. */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
          <h2 className="text-3xl md:text-[2.5rem] font-serif font-bold leading-[1.1] tracking-[-0.02em] text-primary">
            Keep exploring {loc.name}
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {/* The area guide, as a picture, with the other deals here under it */}
            <div className="flex flex-col gap-4">
              <Link href={`/locations/${loc.slug}`} className="group relative block overflow-hidden rounded-2xl bg-muted aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[17rem]">
                <img
                  src={areaPhoto(loc.slug).image}
                  alt={areaPhoto(loc.slug).alt}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
                <span className="absolute inset-x-5 bottom-5 md:inset-x-6 md:bottom-6">
                  <span className="flex items-center justify-between gap-3 text-xl md:text-2xl font-serif font-bold text-white">
                    {loc.name} area guide
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                  <span className="mt-1 block text-sm md:text-base text-white/80">Projects, developers and what offices cost here</span>
                </span>
              </Link>
              <ul className="flex flex-col gap-2">
                {siblings.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="group flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-base font-semibold text-primary hover:text-accent transition-colors">
                      <span>
                        {DEALS[p.deal].heading(loc.name)} <span className="font-normal text-muted-foreground">({p.count})</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/${dealSlug}`} className="group flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-base font-semibold text-primary hover:text-accent transition-colors">
                    <span>{deal.heading("Cairo")}, all areas</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              </ul>
            </div>

            {/* The questions to settle first, as plain questions */}
            <div className="rounded-2xl bg-primary p-6 md:p-7 text-white">
              <h3 className="text-xl font-serif font-bold text-white">Before you {dealSlug === "rent" ? "sign a lease" : "buy"}</h3>
              <p className="mt-1 text-sm text-white/65">Straight answers from our FAQ</p>
              <ul className="mt-4">
                {faqTopics.map((t) => (
                  <li key={t.path}>
                    <Link href={t.path} className="group flex items-center justify-between gap-3 py-3 text-base font-medium text-white hover:text-accent transition-colors">
                      <span>{t.label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/65">
                Can't find the right space?{" "}
                <RequirementsTrigger config={{ intent: dealSlug === "rent" ? "rent" : dealSlug === "buy" ? "buy" : "invest", pageName: deal.heading(loc.name) }} fallbackHref="/contact">
                  <span className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent">Tell us your size and budget</span>
                </RequirementsTrigger>{" "}
                and we'll send a shortlist.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
