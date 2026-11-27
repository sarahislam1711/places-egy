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
import { DEALS, hubCopy, hubRows, medianFigure, type DealSlug } from "@/lib/landing-pages";
import { areaPhoto } from "@/lib/area-visuals";
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

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/offices-hero.jpg" alt="Office buildings in Cairo" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/70 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{heading}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">{heading}</h1>
          {copy ? (
            <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-3xl">{copy.intro[0]}</p>
          ) : (
            <div className="h-14 max-w-2xl rounded bg-white/10 animate-pulse mb-8" />
          )}
          <a href="#areas">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Compare areas <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {dealSlug === "rent" && (
        <section className="pt-10 pb-4">
          <div className="container mx-auto px-6 md:px-10">
            <TenantRepCallout variant="rent" />
          </div>
        </section>
      )}

      {/* By area */}
      <section id="areas" className="py-10 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-8">
            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>{heading} by area</span>
          </h2>
          {copy ? (
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {copy.areas.map((a) => {
                const photo = areaPhoto(a.loc.slug);
                const rent = DEALS[dealSlug].tx === "rent";
                return (
                  <li key={a.loc.slug} className="flex">
                    <Link
                      href={a.path}
                      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-22px_rgba(17,17,17,0.4)] transition-shadow hover:shadow-[0_20px_44px_-24px_rgba(17,17,17,0.5)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={photo.image}
                          alt={photo.alt}
                          width={600}
                          height={450}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/15 to-transparent" aria-hidden />
                        <span className="absolute left-3 top-3 md:left-4 md:top-4 rounded-full bg-white/95 px-2.5 py-1 text-xs md:text-sm font-semibold text-primary shadow-sm">
                          {a.count} {a.count === 1 ? "office" : "offices"}
                        </span>
                        <span className="absolute inset-x-3 bottom-3 md:inset-x-5 md:bottom-4 flex items-end justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block text-[11px] md:text-sm font-medium text-white/75">{deal.label === "as income properties" ? "Income properties" : `Offices ${deal.label}`}</span>
                            <span className="block text-lg md:text-2xl font-serif font-bold leading-tight text-white">{a.loc.name}</span>
                          </span>
                          <ArrowRight className="hidden md:block h-5 w-5 shrink-0 text-white transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>
                      {/* Phones: room for the price to wrap, so every tile is the same height. */}
                      <div className="flex min-h-[5.0625rem] flex-1 items-center justify-between gap-2 px-3 py-3 md:min-h-0 md:px-5 md:py-4">
                        {a.median ? (
                          <span className="min-w-0">
                            <span className="block text-[11px] md:text-xs text-muted-foreground">{rent ? "Median rent" : "Median price"}</span>
                            <span className="block text-sm md:text-base font-semibold text-primary">
                              {medianFigure(dealSlug, a.median)} <span className="font-normal text-muted-foreground">/ m²{rent ? " / month" : ""}</span>
                            </span>
                          </span>
                        ) : (
                          // Too few EGP prices for a median: same two lines, so every tile matches.
                          <span className="min-w-0">
                            <span className="block text-[11px] md:text-xs text-muted-foreground">Listings</span>
                            <span className="block text-sm md:text-base font-semibold text-primary">See the offices</span>
                          </span>
                        )}
                        <ArrowRight className="md:hidden h-4 w-4 shrink-0 text-accent" aria-hidden />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3.9] rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest units */}
      <section className="py-8 bg-secondary/40">
        <div className="container mx-auto px-6 md:px-10">
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
          <div className="container mx-auto px-6 md:px-10 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>{heading}: FAQs</span>
            </h2>
            <FaqAccordionList faqs={copy.faqs} />
          </div>
        </section>
      )}

      {/* Other deal types */}
      <section className="py-10 bg-secondary/40">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary flex items-center gap-3 mb-5">
            <Building2 className="w-6 h-6 text-accent shrink-0" />
            <span>More offices in Cairo</span>
          </h2>
          <ul className="flex flex-wrap gap-3">
            {(Object.keys(DEALS) as DealSlug[])
              .filter((d) => d !== dealSlug)
              .map((d) => (
                <li key={d}>
                  <Link
                    href={`/${d}`}
                    className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                  >
                    {DEALS[d].heading("Cairo")}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/listings"
                className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
              >
                All listings
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
