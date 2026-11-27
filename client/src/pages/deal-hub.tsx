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
import { ServiceHero } from "@/components/service-page";
import NotFound from "@/pages/not-found";

const SITE = "https://places-egy.com";
// Hero photo per hub (checked visually: office buildings, no homes).
const HUB_IMAGE: Record<DealSlug, { image: string; alt: string }> = {
  rent: { image: "/images/cairo-business-park.webp", alt: "Office buildings at Cairo Business Park, New Cairo" },
  buy: { image: "/images/Mivida-Business-Park.jpg", alt: "Office buildings at Mivida Business Park, New Cairo" },
  "income-property": { image: "/images/District-5.jpg", alt: "A leased office building at District 5, New Cairo" },
};
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

      {/* Same split hero as the service pages: light, so it flows into the
          page; the dark promise card on the photo matches the call-out below. */}
      <ServiceHero
        crumbs={[{ name: "Home", href: "/" }, { name: heading }]}
        title={heading}
        intro={copy ? copy.intro[0] : `Every available ${deal.label === "as income properties" ? "income property" : `office ${deal.label}`} across Cairo, by area.`}
        primary={{
          label: "Send us your requirements",
          href: "/contact",
          form: { intent: dealSlug === "rent" ? "rent" : dealSlug === "buy" ? "buy" : "invest", pageName: heading },
        }}
        image={HUB_IMAGE[dealSlug].image}
        imageAlt={HUB_IMAGE[dealSlug].alt}
        promise={{
          title: rows.length ? `${rows.length} ${dealSlug === "income-property" ? "income properties" : `offices ${deal.label}`}` : heading,
          text: copy ? `Across ${copy.areas.length} areas of Cairo, updated as units are listed${dealSlug === "rent" ? ", rented" : ", sold"} or withdrawn.` : "Updated as units are listed and withdrawn.",
        }}
        points={
          dealSlug === "rent"
            ? ["Compare prices by area", "Book a viewing on any office", "Free tenant representation"]
            : dealSlug === "buy"
              ? ["Compare prices by area", "Ready and off-plan units", "Advice before you buy"]
              : ["Units with tenants in place", "Compare prices by area", "Advice before you buy"]
        }
      />

      {dealSlug === "rent" && (
        <section className="pb-4">
          <div className="container mx-auto px-6 md:px-10 max-w-6xl">
            <TenantRepCallout variant="rent" />
          </div>
        </section>
      )}

      {/* By area */}
      <section id="areas" className="py-10 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-8">
            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
            <span>{heading} by area</span>
          </h2>
          {copy ? (
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
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
                    <Link
                      href={a.path}
                      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                        {/* Neutral scrim so the name reads on any photo. */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                        <span className="absolute inset-x-3 bottom-3 md:inset-x-5 md:bottom-4 flex items-end justify-between gap-2">
                          <span className="text-lg md:text-2xl font-serif font-bold leading-tight text-white">{a.loc.name}</span>
                          <ArrowRight className="hidden md:block h-5 w-5 shrink-0 text-white transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>
                      {/* Phones: room for the price to wrap, so every tile is the same height. */}
                      <div className="flex min-h-[5.0625rem] flex-1 flex-col justify-center gap-0.5 px-3 py-3 md:min-h-0 md:px-5 md:py-4">
                        <span className="text-sm md:text-base font-semibold text-primary">
                          {a.count} {kindLabel(a.count)}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {a.median ? `Median ${medianFigure(dealSlug, a.median)} / m²${rent ? " / month" : ""}` : "Prices on each listing"}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/4.1] rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

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
