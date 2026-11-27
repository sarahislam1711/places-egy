import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, ChevronRight, HelpCircle, Home, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { FaqAccordionList } from "@/components/FaqAccordionList";
import { TenantRepCallout } from "@/components/TenantRepCallout";
import { supabase, type Listing } from "@/lib/supabase";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { DEALS, hubCopy, hubRows, landingStats, medianFigure, type DealSlug } from "@/lib/landing-pages";
import { areaPhoto } from "@/lib/area-visuals";
import { RequirementsTrigger } from "@/components/RequirementsForm";
import NotFound from "@/pages/not-found";

const SITE = "https://places-egy.com";
const BATCH = 24;
const CARD_FIELDS =
  "id,title,transaction_type,property_type,subtype,developer,project,location,location_area,price,currency,area_sqm,furnishing,images,rental_status,rental_end,updated_at,price_per_meter,maintenance_fees,maintenance_status,floor,parking,delivery_date";

// /rent, /buy, /income-property: every available office of one deal type
// across Cairo, broken down by area. The server renders the same copy for
// crawlers (renderDealHub in server/seo/render.ts).
export default function DealHubPage() {
  const [path] = useLocation();
  const dealSlug = path.split("/")[1] as DealSlug;
  const deal = DEALS[dealSlug];
  const [shown, setShown] = useState(BATCH);

  const { data: all = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["deal-hub-inventory"],
    enabled: !!deal,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select(CARD_FIELDS)
        .eq("is_test", false)
        .eq("property_type", "admin")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(() => (deal ? hubRows(all, dealSlug) : []), [all, deal, dealSlug]);
  const copy = useMemo(() => (deal && rows.length ? hubCopy(dealSlug, all) : null), [all, deal, dealSlug, rows.length]);
  const heading = deal ? deal.heading("Cairo") : "";
  const unitWord = dealSlug === "income-property" ? "income property" : `office ${deal?.label ?? ""}`;
  const stats = useMemo(() => (rows.length ? landingStats(rows, "Cairo") : null), [rows]);
  const heroStats: Array<{ label: string; value: string | null }> = [
    { label: dealSlug === "income-property" ? "income properties available" : `offices ${deal?.label ?? ""}`, value: stats ? stats.count.toLocaleString("en-US") : null },
    { label: copy?.areas.length === 1 ? "business district" : "business districts", value: copy ? String(copy.areas.length) : null },
    // Figures only in the big type (units go in the label) so nothing wraps.
    {
      label: DEALS[dealSlug]?.tx === "rent" ? "EGP median rent per m² a month" : "EGP median price per m²",
      value: stats?.perSqm ? medianFigure(dealSlug, stats.perSqm[1]).replace(/^EGP\s*/, "") : stats ? "—" : null,
    },
    { label: "m² sizes available", value: stats && stats.areaMin && stats.areaMax ? `${stats.areaMin.toLocaleString("en-US")}–${stats.areaMax.toLocaleString("en-US")}` : stats ? "—" : null },
  ];

  useDocumentMeta({
    title: copy?.title ?? `${heading} | PLACES`,
    description: copy?.description ?? "",
    url: `${SITE}/${dealSlug}`,
  });

  if (!deal) return <NotFound />;
  if (!isLoading && rows.length === 0) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Breadcrumb, ItemList and FAQPage JSON-LD come from the server render. */}
      <Navbar />

      {/* Hub hero: the Cairo-wide overview. Light like the rest of the page;
          the right side is the live market in numbers (the area pages have a
          photo instead, so the two page types don't look the same). */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-16">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
              <span className="text-primary font-medium" aria-current="page">{heading}</span>
            </nav>
            <h1 className="text-4xl md:text-[3.6rem] font-serif font-bold text-primary leading-[1.04] tracking-[-0.03em] text-balance">{heading}</h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {copy ? copy.intro[0] : `Every available ${unitWord} across Cairo, by area.`}
            </p>
            <div data-cta-row className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#areas">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-13 text-base">
                  Compare areas <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <RequirementsTrigger
                config={{ intent: dealSlug === "rent" ? "rent" : dealSlug === "buy" ? "buy" : "invest", pageName: heading }}
                fallbackHref="/contact"
              >
                <Button size="lg" variant="outline" className="bg-white text-primary border-primary/20 hover:border-primary/50 font-semibold px-7 h-13 text-base">
                  Send us your requirements
                </Button>
              </RequirementsTrigger>
            </div>
          </div>

          <div className="rounded-3xl bg-primary text-white p-7 md:p-10">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white">The market right now</h2>
            <p className="mt-1 text-sm text-white/60">Live from our listings, updated as units change</p>
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8">
              {heroStats.map((st) => (
                <div key={st.label} className="flex flex-col-reverse justify-end gap-1">
                  <dt className="text-sm text-white/65 leading-snug">{st.label}</dt>
                  <dd className="font-serif text-3xl md:text-[2.6rem] font-bold leading-none tracking-[-0.03em] text-white whitespace-nowrap">
                    {st.value ?? <span className="inline-block h-9 w-24 rounded bg-white/10 animate-pulse align-middle" />}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>


      {/* By area */}
      <section id="areas" className="py-10 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-8">
            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>{heading} by area</span>
          </h2>
          {copy ? (
            <ul className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {copy.areas.map((a) => {
                const photo = areaPhoto(a.loc.slug);
                const rent = DEALS[dealSlug].tx === "rent";
                // "749 offices for rent" / "12 offices for sale" / "3 income properties"
                const kindLabel = (n: number) =>
                  dealSlug === "income-property"
                    ? n === 1 ? "income property" : "income properties"
                    : `${n === 1 ? "office" : "offices"} ${deal.label}`;
                return (
                  <li key={a.loc.slug} className="flex">
                    {/* Slim card, faded area photo behind the text (same style as the
                        project cards on the area pages). */}
                    <Link
                      href={a.path}
                      className="group relative flex w-full flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-white p-4 md:p-6 min-h-[7.5rem] md:min-h-[10rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <img
                        src={photo.image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.28] transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-[0.38]"
                      />
                      <span className="relative flex items-start justify-between gap-2">
                        <span className="text-lg md:text-2xl font-serif font-bold leading-tight text-primary">{a.loc.name}</span>
                        <ArrowRight className="mt-1 h-4 w-4 md:h-5 md:w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                      <span className="relative flex flex-col gap-0.5">
                        <span className="text-sm md:text-base font-semibold text-primary">
                          {a.count} {kindLabel(a.count)}
                        </span>
                        <span className="text-xs md:text-sm text-primary/70">
                          {a.median ? `Median ${medianFigure(dealSlug, a.median)} / m²${rent ? " / month" : ""}` : "Prices on each listing"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[8.5rem] md:h-[10rem] rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {dealSlug === "rent" && (
        <section className="pt-4 pb-12">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <TenantRepCallout variant="rent" />
          </div>
        </section>
      )}

      {/* Latest units */}
      <section className="py-8 bg-secondary/40">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-8">
            <Home className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>{copy?.listHeading ?? heading}</span>
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
                  <ListingCard key={listing.id} listing={listing} />
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

      {/* FAQs */}
      {copy && (
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl [&>*]:max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>{heading}: FAQs</span>
            </h2>
            <FaqAccordionList faqs={copy.faqs} />
          </div>
        </section>
      )}

      {/* Other deal types: same link rows as "Keep exploring" on the area pages. */}
      <section className="pt-4 pb-16 md:pb-24">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>More offices in Cairo</span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              ...(Object.keys(DEALS) as DealSlug[]).filter((d) => d !== dealSlug).map((d) => ({ href: `/${d}`, label: DEALS[d].heading("Cairo") })),
              { href: "/listings", label: "All office listings" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl bg-white px-5 py-4 text-base font-semibold text-primary hover:text-accent transition-colors"
                >
                  <span>{l.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
