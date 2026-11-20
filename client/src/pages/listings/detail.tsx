import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, listingSchema } from "@/lib/schema";
import { supabase, type Listing } from "@/lib/supabase";
import { DEVELOPER_OPTIONS, FURNISHING_OPTIONS, MAINTENANCE_STATUS_OPTIONS, getEnumLabel } from "@/lib/enums";
import { listingUrl, parseListingId } from "@/lib/listings";
import { formatEgpShort, formatRateDate, listingCurrency, priceInEgp, useUsdEgpRate } from "@/lib/currency";
import { extraAreaWord, maintenanceArea, outdoorAmount, totalPrice } from "@/lib/listing-pricing";
import { supabaseImage, supabaseImageOnError } from "@/lib/image-url";
import { trackEvent, listingEventParams as listingEventParamsFor } from "@/lib/analytics";
import { openCalendly } from "@/lib/calendly";
import { useScrollDepth } from "@/lib/use-scroll-depth";
import { ViewingRequestModal } from "@/components/ViewingRequestModal";
import { rankSimilar } from "@/lib/similar-listings";
import { DEALS, eligibleLandingPages } from "@/lib/landing-pages";
import { cleanListingTitle, listingSnippet, rentedLabel } from "@/lib/listing-text";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MapPin,
  Building2,
  Maximize,
  Calendar,
  CalendarCheck,
  CarFront,
  Phone,
  MessageCircle,
  Loader2,
} from "lucide-react";

const PHONE = "01063618217";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Tiny helper that creates or updates a <meta> tag in <head>. Used for the
// dynamic per-listing meta title, description, and Open Graph tags so each
// listing has its own SEO/social-preview metadata pulled from Supabase.
function setMetaTag(key: string, value: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export default function ListingDetailPage() {
  const { idSlug } = useParams<{ idSlug: string }>();
  const [, setLocation] = useLocation();
  const id = parseListingId(idSlug);

  // Soft client-side redirect: a malformed URL (no leading number) sends the
  // user back to /listings instead of a hard 404. The replace flag swaps the
  // bad URL out of history so the back button doesn't bounce them back.
  useEffect(() => {
    if (id === null) {
      setLocation("/listings", { replace: true });
    }
  }, [id, setLocation]);

  if (id === null) return null;

  return <DetailView id={id} idSlug={idSlug ?? ""} />;
}

// Separated so the hooks below run after the id-validity guard above.
function DetailView({ id, idSlug }: { id: number; idSlug: string }) {
  const fx = useUsdEgpRate();
  const [, setLocation] = useLocation();
  const [imageIndex, setImageIndex] = useState(0);
  const [viewingOpen, setViewingOpen] = useState(false);

  useScrollDepth(`/listings/${idSlug}`);

  // Track gallery navigation — fires when user views images beyond the first.
  // Gives us "gallery engagement rate" per listing (are people browsing all
  // photos, or bouncing after one?).
  useEffect(() => {
    if (imageIndex === 0) return;
    trackEvent("listing_gallery_view", {
      listing_id: id,
      image_index: imageIndex,
    });
  }, [imageIndex, id]);

  const { data: listing, isLoading, isError } = useQuery<Listing | null>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq('is_test', false)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  // Every listing with the same transaction type (card fields only), cached
  // across listing pages; ranked by rankSimilar (area, location, price).
  const { data: similarPool = [] } = useQuery<Listing[]>({
    queryKey: ["similar-pool", listing?.transaction_type],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!listing?.transaction_type) return [];
      const base =
        "id,title,transaction_type,property_type,subtype,developer,project,location,location_area,price,currency,area_sqm,furnishing,images,rental_status,rental_end,updated_at,price_per_meter,maintenance_fees,maintenance_status,floor,parking,delivery_date";
      const query = (cols: string) =>
        supabase
          .from<Listing>("listings")
          .select(cols)
          .eq("is_test", false)
          .eq("property_type", "admin")
          .eq("transaction_type", listing.transaction_type);
      let { data, error } = await query(`${base},outdoor_area_sqm,outdoor_price_per_meter,outdoor_area_type,price_is_lump_sum`);
      // Before sql/listings-outdoor-and-fx.sql runs, those columns don't exist.
      if (error) ({ data, error } = await query(base));
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!listing?.transaction_type,
  });

  const similarListings = useMemo<Listing[]>(
    () => (listing ? rankSimilar(listing, similarPool, 4) : []),
    [similarPool, listing],
  );
  // The "Offices for Rent in New Cairo"-style page for this unit, if it's live.
  const landingPage = useMemo(
    () =>
      listing
        ? eligibleLandingPages(similarPool).find(
            (p) => DEALS[p.deal].tx === listing.transaction_type && p.loc.name === listing.location,
          )
        : undefined,
    [similarPool, listing],
  );

  // Listing not found → soft redirect to /listings (replace history so the
  // bad URL doesn't trap the back button).
  useEffect(() => {
    if (!isLoading && !isError && listing === null) {
      setLocation("/listings", { replace: true });
    }
  }, [isLoading, isError, listing, setLocation]);

  // GA4 conversion event — fires once per listing detail view. Richer than
  // the generic page_view so you can slice "which listings get viewed" in GA4.
  useEffect(() => {
    if (!listing) return;
    trackEvent("listing_view", listingEventParamsFor(listing));
  }, [listing]);

  // Dynamic per-listing meta tags pulled from Supabase. Updates whenever the
  // listing data changes. Restores generic site-level meta on unmount so the
  // tags don't leak into the next page.
  useEffect(() => {
    if (!listing) return;

    const title = `${cleanListingTitle(listing.title ?? "")} | PLACES`;
    const description =
      listingSnippet(listing.description ?? "") ||
      `${listing.area_sqm ? listing.area_sqm + " sqm " : ""}${formatLabel(listing.property_type)} for ${formatLabel(listing.transaction_type)} in ${formatLabel(listing.location)}.`;
    const url = `https://places-egy.com${listingUrl(listing)}`;
    const image = listing.images?.[0];

    const previousTitle = document.title;
    document.title = title;
    // Explicitly assert this listing is indexable — guarantees a detail page is
    // never left noindexed if the user arrived from a filtered /listings?… view
    // (which sets robots=noindex). Individual listings are exactly what we WANT
    // indexed (each is in the sitemap + prerendered). EXCEPT test listings:
    // when admin flags one as is_test, emit a hard noindex so a leaked direct
    // URL never gets indexed.
    setMetaTag(
      "robots",
      (listing as Listing & { is_test?: boolean }).is_test
        ? "noindex,nofollow,noarchive"
        : "index,follow",
    );
    setMetaTag("description", description);
    setMetaTag("og:title", title, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:url", url, "property");
    setMetaTag("og:type", "product", "property");
    if (image) {
      setMetaTag("og:image", image, "property");
      // The static og:image:width/height/type/alt tags in index.html describe
      // the site-level opengraph.jpg (1280x720 JPEG). When we override og:image
      // to a listing's own photo, those dimension tags become misleading —
      // scrapers will trust them and render the wrong aspect ratio. Drop them
      // so scrapers infer dims from the image URL itself.
      document.head.querySelector('meta[property="og:image:width"]')?.remove();
      document.head.querySelector('meta[property="og:image:height"]')?.remove();
      document.head.querySelector('meta[property="og:image:type"]')?.remove();
      document.head.querySelector('meta[property="og:image:alt"]')?.remove();
      document.head.querySelector('meta[property="og:image:secure_url"]')?.remove();
      document.head.querySelector('meta[name="twitter:image:alt"]')?.remove();
    }
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) setMetaTag("twitter:image", image);

    return () => {
      document.title = previousTitle;
    };
  }, [listing]);

  // Canonical URL guard — if the user landed on a stale slug
  // (`/listings/47-old-slug` after the title changed), silently update the URL
  // to the canonical form without causing a navigation. This keeps SEO clean
  // and matches the slug to the current title.
  useEffect(() => {
    if (!listing) return;
    const canonical = listingUrl(listing).replace(/^\/listings\//, "");
    if (canonical !== idSlug) {
      window.history.replaceState(null, "", listingUrl(listing));
    }
  }, [listing, idSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  // While the redirect effect is firing for a missing listing, render nothing.
  if (!listing) return null;

  const images = listing.images?.length ? listing.images : [FALLBACK_IMAGE];
  const hasMultiple = images.length > 1;
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${cleanListingTitle(listing.title ?? "")} listing on PLACES.`,
  );

  const listingEventParams = listingEventParamsFor(listing);
  const handleCallClick = () =>
    trackEvent("call_click", { source: "listing_detail", ...listingEventParams });
  const handleWhatsappClick = () =>
    trackEvent("whatsapp_click", { source: "listing_detail", ...listingEventParams });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Listings", url: "/listings" },
          { name: cleanListingTitle(listing.title ?? ""), url: listingUrl(listing) },
        ])}
      />
      <SchemaMarkup schema={listingSchema(listing)} />
      <Navbar />

      {/* Header: breadcrumb + title + price */}
      <section className="pt-24 md:pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <Link href="/listings" className="hover:text-primary transition-colors">Listings</Link>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-primary line-clamp-1">{cleanListingTitle(listing.title ?? "")}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="min-w-0">
              <Badge
                className={`${listing.transaction_type?.toLowerCase() === "sale" ? "bg-emerald-600" : "bg-accent text-accent-foreground"} uppercase tracking-wider text-[10px] font-bold shadow-sm border-0 mb-3`}
              >
                {formatLabel(listing.transaction_type)}
              </Badge>
              {listing.rental_status === "rented" && (
                <span className="inline-block mb-3 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                  {rentedLabel(listing)}
                </span>
              )}
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary leading-tight">
                {cleanListingTitle(listing.title ?? "")}
              </h1>
              <div className="flex items-center gap-2 md:gap-3 mt-3 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2 shrink-0">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {formatLabel(listing.location)}
                    {listing.location_area && (
                      <span className="text-muted-foreground/70"> · {listing.location_area}</span>
                    )}
                  </span>
                </div>
                {listing.developer && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full shrink-0">
                    {getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}
                  </span>
                )}
              </div>
            </div>

            {/* Right column — favorite + price + unlock CTA stacked as
                one cohesive vertical group. Heart sits above the price
                so the whole right side reads as one column instead of
                a floating heart + a bottom-anchored price. */}
            <div className="flex flex-col items-start md:items-end shrink-0 gap-3">
              <FavoriteButton listingId={listing.id} size="lg" />
              {listing.price != null && (
                <div className="md:text-right">
                  <div className="flex items-baseline gap-1.5 md:justify-end">
                    <span className="text-3xl md:text-4xl font-bold text-primary font-serif">
                      {listing.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {listingCurrency(listing)}
                      {listing.transaction_type?.toLowerCase() === "rent" ? " / month" : ""}
                    </span>
                  </div>
                  {outdoorAmount(listing) > 0 && (
                    <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                      <p>
                        Indoor ({Number(listing.area_sqm).toLocaleString("en-US")} m²) · + {extraAreaWord(listing)}{" "}
                        {Number(listing.outdoor_area_sqm).toLocaleString("en-US")} m² at{" "}
                        {Number(listing.outdoor_price_per_meter).toLocaleString("en-US")} {listingCurrency(listing)}/m²:{" "}
                        {outdoorAmount(listing).toLocaleString("en-US")} {listingCurrency(listing)}
                      </p>
                      <p className="font-semibold text-primary">
                        Total {totalPrice(listing).toLocaleString("en-US")} {listingCurrency(listing)}
                        {listing.transaction_type?.toLowerCase() === "rent" ? " / month" : ""}
                      </p>
                    </div>
                  )}
                  {listingCurrency(listing) === "USD" && priceInEgp(listing, fx.rate) != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {formatEgpShort(priceInEgp(listing, fx.rate)!)}{outdoorAmount(listing) > 0 ? " total" : ""} at {fx.rate.toFixed(2)} EGP/USD
                      {formatRateDate(fx.asOf) ? ` (${formatRateDate(fx.asOf)})` : ""}
                    </p>
                  )}
                </div>
              )}
              <Button
                type="button"
                onClick={() => setViewingOpen(true)}
                className="bg-accent hover:bg-accent/90 text-white rounded-full"
              >
                <CalendarCheck className="w-4 h-4 mr-2" /> Book a viewing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Image gallery */}
      <section className="pb-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="relative aspect-[16/9] md:aspect-[16/7] rounded-2xl overflow-hidden bg-muted group">
            <img
              src={supabaseImage(images[imageIndex], "full")}
              onError={supabaseImageOnError(images[imageIndex])}
              alt={cleanListingTitle(listing.title ?? "")}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
            {hasMultiple && (
              <>
                <button
                  onClick={() => setImageIndex((c) => (c === 0 ? images.length - 1 : c - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageIndex((c) => (c === images.length - 1 ? 0 : c + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === imageIndex ? "bg-white w-6" : "bg-white/50 w-2"}`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip — desktop only */}
          {hasMultiple && (
            <div className="hidden md:flex gap-3 mt-4 overflow-x-auto">
              {images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === imageIndex ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={supabaseImage(src, "thumb")} onError={supabaseImageOnError(src)} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Body — details + contact card */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            {/* Left — description + specs */}
            <div className="min-w-0">
              {listing.description && (
                <div className="mb-10">
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4">
                    About this unit
                  </h2>
                  <div
                    className="listing-description"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        // Descriptions often start with "# Title" in Markdown; the
                        // page already has its H1 (the listing title), so headings
                        // inside the description start at H2.
                        (marked.parse(listing.description, { async: false }) as string).replace(/<(\/?)h1\b/gi, "<$1h2"),
                      ),
                    }}
                  />
                </div>
              )}

              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-5">
                  Unit details
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <DetailRow icon={MapPin} label="Project" value={listing.project} />
                  <DetailRow icon={MapPin} label="Location" value={listing.location} />
                  {listing.location_area && (
                    <DetailRow icon={MapPin} label="Area" value={listing.location_area} />
                  )}
                  <DetailRow icon={Building2} label="Property type" value={listing.property_type} />
                  {listing.subtype && (
                    <DetailRow icon={Building2} label="Subtype" value={listing.subtype} />
                  )}
                  {listing.developer && (
                    <DetailRow icon={Building2} label="Developer" value={getEnumLabel(DEVELOPER_OPTIONS, listing.developer)} />
                  )}
                  {listing.area_sqm != null && (
                    <DetailRow icon={Maximize} label="Built-up area" value={`${Number(listing.area_sqm).toLocaleString("en-US")} m²`} />
                  )}
                  {listing.outdoor_area_sqm != null && listing.outdoor_area_sqm > 0 && (
                    <DetailRow
                      icon={Maximize}
                      label={extraAreaWord(listing) === "outdoor" ? "Outdoor area" : extraAreaWord(listing).replace(/^./, (c) => c.toUpperCase())}
                      value={
                        `${Number(listing.outdoor_area_sqm).toLocaleString("en-US")} m²` +
                        (listing.outdoor_price_per_meter != null
                          ? ` at ${Number(listing.outdoor_price_per_meter).toLocaleString("en-US")} ${listingCurrency(listing)}/m²`
                          : "")
                      }
                    />
                  )}
                  {listing.price_per_meter != null && (
                    <DetailRow
                      icon={Building2}
                      label="Price per m²"
                      value={
                        (
`${listing.price_per_meter.toLocaleString()} ${listingCurrency(listing)}`
)
                      }
                    />
                  )}
                  {!!listing.maintenance_fees && listing.maintenance_status !== "included" && (
                    <DetailRow
                      icon={Building2}
                      label="Maintenance Fees"
                      value={`${listing.maintenance_fees.toLocaleString()} ${listingCurrency(listing)}`}
                    />
                  )}
                  {listing.maintenance_status && (
                    <DetailRow
                      icon={Building2}
                      label="Maintenance"
                      value={
                        getEnumLabel(MAINTENANCE_STATUS_OPTIONS, listing.maintenance_status) +
                        // Maintenance is charged on the outdoor area too.
                        (Number(listing.outdoor_area_sqm) > 0
                          ? ` (on indoor + ${extraAreaWord(listing)}: ${maintenanceArea(listing).toLocaleString("en-US")} m²)`
                          : "")
                      }
                    />
                  )}
                  {/* 0 is the admin form's default, not data: "Floor 0 / Parking
                      spots 0" showed on units that are whole buildings or have
                      parking. Hidden like a zero maintenance fee. */}
                  {listing.floor != null && Number(listing.floor) !== 0 && (
                    <DetailRow icon={Building2} label="Floor" value={String(listing.floor)} />
                  )}
                  {listing.parking != null && Number(listing.parking) !== 0 && (
                    <DetailRow icon={CarFront} label="Parking spots" value={String(listing.parking)} />
                  )}
                  {listing.delivery_date && (
                    <DetailRow icon={Calendar} label="Delivery date" value={listing.delivery_date} />
                  )}
                  {listing.furnishing && (
                    <DetailRow
                      icon={Building2}
                      label="Handover condition"
                      value={getEnumLabel(FURNISHING_OPTIONS, listing.furnishing) || listing.furnishing}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right — sticky contact card */}
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
                  Interested in this unit?
                </p>
                <h3 className="text-lg font-serif font-bold text-primary mb-1">
                  Talk to a PLACES advisor
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Get more details, schedule a viewing, or ask about availability.
                </p>
                <div className="flex flex-col gap-3">
                  <a href={`tel:${PHONE}`} onClick={handleCallClick}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      <Phone className="w-4 h-4 mr-2" /> Call us
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/2${PHONE}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsappClick}
                  >
                    <Button className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white">
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                  </a>
                </div>
                {/* Tertiary CTA — self-serve booking. Deliberately styled
                    as a low-key link, not a third full-width button, so
                    Call/WhatsApp stay the primary paths for hot leads. */}
                <button
                  type="button"
                  onClick={() =>
                    openCalendly("listing_detail", `listing_${listing.id}`)
                  }
                  className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-accent transition-colors underline decoration-dotted underline-offset-4"
                >
                  Or book a 30-min call
                </button>
              </div>

              <Link
                href="/listings"
                className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to all listings
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Similar units — score-ranked off-ramp for users who aren't sold */}
      {similarListings.length > 0 && (
        <section className="py-8 md:py-12 bg-secondary/30 border-t border-border/40">
          <div className="container mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
                  Not the right fit?
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                  Check out similar units
                </h2>
              </div>
              {landingPage ? (
                <Link
                  href={landingPage.path}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  See all {DEALS[landingPage.deal].heading(landingPage.loc.name)} ({landingPage.count})
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/listings"
                  className="hidden md:inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  View all listings <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {similarListings.map((l) => (
                <Link
                  key={l.id}
                  href={listingUrl(l)}
                  className="group block bg-white border border-border/40 rounded-xl overflow-hidden hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={supabaseImage(l.images?.[0] || FALLBACK_IMAGE, "card")}
                      onError={supabaseImageOnError(l.images?.[0] || FALLBACK_IMAGE)}
                      alt={l.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-primary line-clamp-2 mb-3 leading-snug">
                      {l.title}
                    </h3>
                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-accent group-hover:text-primary transition-colors">
                      View unit <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 md:hidden text-center">
              <Link
                href="/listings"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                View all listings <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <CornerSlideMagnet />
      <ViewingRequestModal
        listing={listing}
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
      />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  // ReactNode allowed so callers can pass a locked-state fallback component
  // (a React node) in place of a raw string/number.
  value: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-border/40">
      <span className="w-9 h-9 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-primary mt-0.5 break-words">
          {typeof value === "string" ? formatLabel(value) : value}
        </p>
      </div>
    </div>
  );
}
