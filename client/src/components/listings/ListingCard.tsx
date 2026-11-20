import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { type Listing } from "@/lib/supabase";
import { DEVELOPER_OPTIONS, FURNISHING_OPTIONS, MAINTENANCE_STATUS_OPTIONS, getEnumLabel } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MapPin, Building2, Maximize, ArrowUpRight, ChevronLeft, ChevronRight, Phone, MessageCircle, Calendar, CarFront, type LucideIcon } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { listingSchema } from "@/lib/schema";
import { listingUrl } from "@/lib/listings";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatEgpShort, listingCurrency, priceInEgp, useUsdEgpRate } from "@/lib/currency";
import { extraAreaWord, outdoorAmount } from "@/lib/listing-pricing";
import { supabaseImage, supabaseImageOnError } from "@/lib/image-url";
import { trackEvent, listingEventParams as listingEventParamsFor } from "@/lib/analytics";
import { Lock } from "lucide-react";
import { areaLabel, cleanListingTitle, rentedLabel } from "@/lib/listing-text";

const PHONE = "01063618217";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  hideSubtype?: boolean;
  listView?: boolean;
  /** "feature": the /listings page design (inset photo, price first, specs row). */
  variant?: "default" | "feature";
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

function DetailBlock({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="bg-primary/[0.015] rounded-xl p-3 flex flex-col items-center text-center gap-1.5">
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <span className="text-xs font-semibold text-primary">{typeof value === "number" ? value.toLocaleString() : formatLabel(String(value))}</span>
    </div>
  );
}

export function ListingCard({ listing, compact = false, hideSubtype = false, listView = false, variant = "default" }: ListingCardProps) {
  const images = listing.images?.length ? listing.images : [FALLBACK_IMAGE];
  const hasMultiple = images.length > 1;
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(0);

  // Prefetch the next + previous modal image so arrow clicks render instantly
  // instead of waiting for a fresh network round-trip.
  useEffect(() => {
    if (!modalOpen || !hasMultiple) return;
    const nextIdx = (modalImage + 1) % images.length;
    const prevIdx = (modalImage - 1 + images.length) % images.length;
    [images[nextIdx], images[prevIdx]].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [modalOpen, modalImage, images, hasMultiple]);

  const goPrev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const goNext = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goPrev();
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goNext();
  };

  // Touch-swipe for mobile: the prev/next arrows are hover-only (no hover on
  // touch devices), so let users swipe the image directly to change it.
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    // Ignore tiny moves (taps); a clear horizontal swipe changes the image.
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const displayTitle = cleanListingTitle(listing.title ?? "");
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in the ${displayTitle} listing on PLACES.`);

  const listingEventParams = listingEventParamsFor(listing);

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (open) {
      trackEvent("listing_quick_view", listingEventParams);
    } else {
      setModalImage(0);
    }
  };

  const handleCallClick = () =>
    trackEvent("call_click", { source: "listing_modal", ...listingEventParams });

  const handleWhatsappClick = () =>
    trackEvent("whatsapp_click", { source: "listing_modal", ...listingEventParams });

  const handleViewFullDetailsClick = () =>
    trackEvent("view_full_details_click", listingEventParams);


  if (listView) {
    return (
      <>
        <div
          onClick={() => setModalOpen(true)}
          className="group flex h-44 md:h-52 bg-[#FDFBF8] rounded-2xl border border-border/40 overflow-hidden hover:shadow-[0_12px_32px_-12px_rgba(232,64,74,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          <div className="relative w-48 md:w-64 shrink-0 self-stretch overflow-hidden">
            <img
              src={supabaseImage(images[0], "card")}
              onError={supabaseImageOnError(images[0])}
              alt={displayTitle}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 flex flex-wrap items-start gap-1.5 max-w-[85%]">
              <Badge className={`
                ${listing.transaction_type?.toLowerCase() === 'sale' ? 'bg-emerald-600' :
                  listing.transaction_type?.toLowerCase() === 'rent' ? 'bg-accent text-accent-foreground' :
                  listing.transaction_type?.toLowerCase() === 'income-property' ? 'bg-blue-600' :
                  'bg-emerald-600'}
                uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
              `}>
                {formatLabel(listing.transaction_type)}
              </Badge>
              {listing.rental_status === "rented" && (
                <Badge className="bg-slate-800/90 text-white tracking-wide text-[10px] font-semibold shadow-sm border-0">
                  {rentedLabel(listing)}
                </Badge>
              )}
            </div>
            <FavoriteButton listingId={listing.id} overlay />
          </div>
          <div className="flex-1 p-5 flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-start gap-4 mb-1">
                <h3 className="font-serif text-base font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
                  <Link
                    href={listingUrl(listing)}
                    onClick={(e) => { e.stopPropagation(); handleViewFullDetailsClick(); }}
                    className="hover:underline"
                  >
                    {displayTitle}
                  </Link>
                </h3>
                {!hideSubtype && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full shrink-0">
                    {formatLabel(listing.subtype)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {formatLabel(listing.location)}
                </span>
                {listing.developer && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {listing.area_sqm && (
                  <span className="flex items-center gap-1">
                    <Maximize className="w-3 h-3 text-accent" />
                    {areaLabel(listing)}
                  </span>
                )}
                {listing.furnishing && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-accent" />
                    {getEnumLabel(FURNISHING_OPTIONS, listing.furnishing)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              {listing.price != null && (
                (
<div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary font-serif">
                      {listing.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">{listingCurrency(listing)}</span>
                    {listing.transaction_type?.toLowerCase() === "rent" && <span className="text-xs text-muted-foreground">/month</span>}
                    <EgpHint listing={listing} />
                    <OutdoorLine listing={listing} />
                  </div>
)
              )}
              <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Quick view →
              </span>
            </div>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
          {modalOpen && <SchemaMarkup schema={listingSchema(listing)} />}
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background p-0">
            <div className="relative h-64 overflow-hidden rounded-t-lg shrink-0 group/modal">
              {images[0] === FALLBACK_IMAGE && listing.images?.length === 0 ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No images available</span>
                </div>
              ) : (
                <>
                  <img src={supabaseImage(images[modalImage], "full")} onError={supabaseImageOnError(images[modalImage])} alt={displayTitle} fetchPriority="high" decoding="async" className="w-full h-full object-cover transition-all duration-500" />
                  {hasMultiple && (
                    <>
                      <button onClick={() => setModalImage((c: number) => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={() => setModalImage((c: number) => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"><ChevronRight className="w-5 h-5" /></button>
                    </>
                  )}
                  {hasMultiple && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: string, i: number) => (
                        <button key={i} onClick={() => setModalImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === modalImage ? "bg-white w-5" : "bg-white/50"}`} />
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="absolute top-4 left-4 flex flex-wrap items-start gap-1.5 max-w-[85%]">
                <Badge className={`${listing.transaction_type?.toLowerCase() === 'sale' ? 'bg-emerald-600' : listing.transaction_type?.toLowerCase() === 'rent' ? 'bg-accent text-accent-foreground' : listing.transaction_type?.toLowerCase() === 'income-property' ? 'bg-blue-600' : 'bg-emerald-600'} uppercase tracking-wider text-[10px] font-bold shadow-sm border-0`}>
                  {formatLabel(listing.transaction_type)}
                </Badge>
                {listing.rental_status === "rented" && (
                  <Badge className="bg-slate-800/90 text-white tracking-wide text-[10px] font-semibold shadow-sm border-0">
                    {rentedLabel(listing)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-primary">{displayTitle}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {formatLabel(listing.location)}
                      {listing.location_area && (
                        <span className="text-muted-foreground/70"> · {listing.location_area}</span>
                      )}
                    </span>
                    {listing.developer && (<span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">{getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}</span>)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {listing.price != null && (
                    (
<>
                        <span className="text-2xl font-bold text-primary font-serif">{listing.price.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">{listingCurrency(listing)}{listing.transaction_type?.toLowerCase() === "rent" ? "/month" : ""}</p>
                        <EgpHint listing={listing} block />
                        <OutdoorLine listing={listing} block />
                      </>
)
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <DetailBlock icon={MapPin} label="Project" value={listing.project} />
                <DetailBlock icon={Maximize} label="Area" value={listing.area_sqm ? `${areaLabel(listing)}` : null} />
                {listing.price_per_meter != null && <DetailBlock icon={Building2} label="Price/m²" value={`${listing.price_per_meter.toLocaleString()} ${listingCurrency(listing)}`} />}
                <DetailBlock icon={Building2} label="Handover condition" value={getEnumLabel(FURNISHING_OPTIONS, listing.furnishing)} />
                {!!listing.maintenance_fees && listing.maintenance_status !== "included" && <DetailBlock icon={Building2} label="Maintenance Fees" value={`${listing.maintenance_fees.toLocaleString()} ${listingCurrency(listing)}`} />}
                {listing.maintenance_status && <DetailBlock icon={Building2} label="Maintenance" value={getEnumLabel(MAINTENANCE_STATUS_OPTIONS, listing.maintenance_status)} />}
                {listing.floor != null && Number(listing.floor) !== 0 && <DetailBlock icon={Building2} label="Floor" value={listing.floor} />}
                {listing.delivery_date && <DetailBlock icon={Calendar} label="Delivery date" value={listing.delivery_date} />}
                {listing.parking != null && Number(listing.parking) !== 0 && <DetailBlock icon={CarFront} label="Parking" value={listing.parking} />}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a href={`tel:${PHONE}`} onClick={handleCallClick}><Button className="w-full bg-primary hover:bg-primary/90 text-white"><Phone className="w-4 h-4 mr-2" /> Call Us</Button></a>
                <a href={`https://wa.me/2${PHONE}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" onClick={handleWhatsappClick}><Button className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button></a>
              </div>
              <Link href={listingUrl(listing)} onClick={handleViewFullDetailsClick} className="block text-center text-sm font-medium text-primary hover:text-accent transition-colors pt-1">
                View full details <ArrowUpRight className="inline w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const isRent = listing.transaction_type?.toLowerCase() === "rent";
  const featureCard = (
    <article className="group relative bg-white rounded-3xl border border-border/50 p-2 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <img
          src={supabaseImage(images[current], "card")}
          onError={supabaseImageOnError(images[current])}
          alt={displayTitle}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-start gap-1.5 max-w-[75%]">
          <span className={`${listing.transaction_type?.toLowerCase() === "sale" ? "bg-emerald-600" : isRent ? "bg-accent" : "bg-blue-600"} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}>
            {isRent ? "For Rent" : listing.transaction_type?.toLowerCase() === "sale" ? "For Sale" : formatLabel(listing.transaction_type)}
          </span>
          {listing.rental_status === "rented" && (
            <span className="bg-slate-800/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{rentedLabel(listing)}</span>
          )}
        </div>
        <div className="absolute top-0 right-0 z-20"><FavoriteButton listingId={listing.id} overlay /></div>
        {hasMultiple && (
          <>
            <button onClick={prev} aria-label="Previous image" className="absolute z-10 left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} aria-label="Next image" className="absolute z-10 right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.slice(0, 8).map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/60 w-1.5"}`} />
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalOpen(true); }}
          className="hidden md:inline-flex absolute z-10 bottom-3 right-3 items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Quick view
        </button>
      </div>

      <div className="px-3 pt-4 pb-3 flex flex-col flex-1">
        <div className="flex items-baseline flex-wrap gap-x-1">
          {listing.price != null ? (
            <>
              <span className="text-2xl font-bold text-primary font-serif">{listing.price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">{listingCurrency(listing)}{isRent ? "/month" : ""}</span>
              <EgpHint listing={listing} />
              <OutdoorLine listing={listing} block />
            </>
          ) : (
            <span className="text-lg font-semibold text-primary font-serif">Price on request</span>
          )}
        </div>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-primary line-clamp-2">
          {/* Stretched link: the whole card opens the listing. */}
          <Link href={listingUrl(listing)} onClick={handleViewFullDetailsClick} className="after:absolute after:inset-0 after:rounded-3xl hover:text-accent transition-colors">
            {displayTitle}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="truncate">
            {[listing.project?.trim(), formatLabel(listing.location)]
              .filter((v, i, a): v is string => !!v && a.findIndex((x) => x?.toLowerCase() === v.toLowerCase()) === i)
              .join(", ")}
          </span>
        </div>
        <div className="mt-auto pt-3">
          <div className="border-t border-border/60 pt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {listing.area_sqm ? (
              <span className="inline-flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5 text-primary/70" />{areaLabel(listing)}</span>
            ) : null}
            {listing.furnishing && (
              <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-primary/70" />{getEnumLabel(FURNISHING_OPTIONS, listing.furnishing)}</span>
            )}
            {listing.price_per_meter != null && listing.price_per_meter > 0 && (
              <span className="inline-flex items-center gap-1.5">{listing.price_per_meter.toLocaleString()} {listingCurrency(listing)}/m²</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <>
      {variant === "feature" ? featureCard : (
      <Card className="group overflow-hidden border-border/50 hover:shadow-[0_12px_32px_-12px_rgba(232,64,74,0.18)] hover:-translate-y-0.5 transition-all duration-300 bg-[#FDFBF8]">
        {/* Image Carousel */}
        <div
          className="relative aspect-[16/10] overflow-hidden"
          onTouchStart={hasMultiple ? handleTouchStart : undefined}
          onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        >
          <img
            src={supabaseImage(images[current], "card")}
            onError={supabaseImageOnError(images[current])}
            alt={displayTitle}
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
          />

          <FavoriteButton listingId={listing.id} overlay />

          {hasMultiple && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 shadow-md backdrop-blur-sm flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 shadow-md backdrop-blur-sm flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {/* Cap dots at 12 to avoid a crowded row on listings with many
                  images. Users can still page past image #12 via the ‹ › arrows. */}
              {images.slice(0, 12).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === current ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4 flex flex-wrap items-start gap-1.5 max-w-[85%]">
            <Badge className={`
              ${listing.transaction_type?.toLowerCase() === 'sale' ? 'bg-emerald-600' :
                listing.transaction_type?.toLowerCase() === 'rent' ? 'bg-accent text-accent-foreground' :
                listing.transaction_type?.toLowerCase() === 'income-property' ? 'bg-blue-600' :
                'bg-emerald-600'}
              uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
            `}>
              {formatLabel(listing.transaction_type)}
            </Badge>
            {listing.rental_status === "rented" && (
              <Badge className="bg-slate-800/90 text-white tracking-wide text-[10px] font-semibold shadow-sm border-0">
                {rentedLabel(listing)}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-1.5">
          <div className="flex justify-between items-start gap-2 mb-2">
            {listing.developer ? (
              <div className="text-xs font-semibold text-accent uppercase tracking-wide">
                {getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}
              </div>
            ) : (
              <span />
            )}
            {!hideSubtype && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                {formatLabel(listing.subtype)}
              </span>
            )}
          </div>
          <h3 className="font-serif text-base font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            <Link href={listingUrl(listing)} onClick={handleViewFullDetailsClick} className="hover:text-accent transition-colors">
              {displayTitle}
            </Link>
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {formatLabel(listing.location)}
          </div>
        </CardHeader>

        <CardContent className={compact ? "p-4 pt-1 pb-2" : "p-4 pt-1 pb-2"}>
          {!compact && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Area</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Maximize className="w-3.5 h-3.5 text-accent" />
                  {areaLabel(listing)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Condition</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span className="truncate">{getEnumLabel(FURNISHING_OPTIONS, listing.furnishing)}</span>
                </div>
              </div>
            </div>
          )}
          <div className={compact ? "" : "mt-2"}>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary font-serif">
                {listing.price?.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{listingCurrency(listing)}</span>
              {listing.transaction_type?.toLowerCase() === "rent" && <span className="text-xs text-muted-foreground">/month</span>}
                    <EgpHint listing={listing} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-3 pt-0 flex gap-2">
          <Link
            href={listingUrl(listing)}
            onClick={handleViewFullDetailsClick}
            className="flex-1 inline-flex items-center justify-center h-9 rounded-md bg-secondary hover:bg-primary hover:text-white text-secondary-foreground text-sm font-medium transition-colors"
          >
            View Details <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3 text-sm"
          >
            Quick view
          </Button>
        </CardFooter>
      </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setModalImage(0); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background p-0">
          {/* Modal image carousel */}
          <div className="relative h-64 overflow-hidden rounded-t-lg shrink-0 group/modal">
            {images[0] === FALLBACK_IMAGE && listing.images?.length === 0 ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No images available</span>
              </div>
            ) : (
              <>
                <img
                  src={supabaseImage(images[modalImage], "full")}
                  onError={supabaseImageOnError(images[modalImage])}
                  alt={displayTitle}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {hasMultiple && (
                  <>
                    <button
                      onClick={() => setModalImage((c) => (c === 0 ? images.length - 1 : c - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setModalImage((c) => (c === images.length - 1 ? 0 : c + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {hasMultiple && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setModalImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === modalImage ? "bg-white w-5" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="absolute top-4 left-4 flex flex-wrap items-start gap-1.5 max-w-[85%]">
              <Badge className={`
                ${listing.transaction_type?.toLowerCase() === 'sale' ? 'bg-emerald-600' :
                  listing.transaction_type?.toLowerCase() === 'rent' ? 'bg-accent text-accent-foreground' :
                  listing.transaction_type?.toLowerCase() === 'income-property' ? 'bg-blue-600' :
                  'bg-emerald-600'}
                uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
              `}>
                {formatLabel(listing.transaction_type)}
              </Badge>
              {listing.rental_status === "rented" && (
                <Badge className="bg-slate-800/90 text-white tracking-wide text-[10px] font-semibold shadow-sm border-0">
                  {rentedLabel(listing)}
                </Badge>
              )}
            </div>
          </div>

          {/* Modal body */}
          <div className="px-6 pb-6 pt-4 space-y-4">
            {/* Title + location + price */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-primary">{displayTitle}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {formatLabel(listing.location)}
                    {listing.location_area && (
                      <span className="text-muted-foreground/70"> · {listing.location_area}</span>
                    )}
                  </span>
                  {listing.developer && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-primary font-serif">
                  {listing.price?.toLocaleString()}
                </span>
                <p className="text-xs text-muted-foreground">
                  {listingCurrency(listing)}{listing.transaction_type?.toLowerCase() === "rent" ? "/month" : ""}
                </p>
                <EgpHint listing={listing} block />
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-3 gap-3">
              <DetailBlock icon={MapPin} label="Project" value={listing.project} />
              <DetailBlock icon={Maximize} label="Area" value={listing.area_sqm ? `${areaLabel(listing)}` : null} />
              {listing.price_per_meter != null && <DetailBlock icon={Building2} label="Price/m²" value={`${listing.price_per_meter.toLocaleString()} ${listingCurrency(listing)}`} />}
              <DetailBlock icon={Building2} label="Handover condition" value={getEnumLabel(FURNISHING_OPTIONS, listing.furnishing)} />
              {!!listing.maintenance_fees && listing.maintenance_status !== "included" && <DetailBlock icon={Building2} label="Maintenance Fees" value={`${listing.maintenance_fees.toLocaleString()} ${listingCurrency(listing)}`} />}
              {listing.maintenance_status && <DetailBlock icon={Building2} label="Maintenance" value={getEnumLabel(MAINTENANCE_STATUS_OPTIONS, listing.maintenance_status)} />}
              {listing.floor != null && Number(listing.floor) !== 0 && <DetailBlock icon={Building2} label="Floor" value={listing.floor} />}
              {listing.delivery_date && <DetailBlock icon={Calendar} label="Delivery date" value={listing.delivery_date} />}
              {listing.parking != null && Number(listing.parking) !== 0 && <DetailBlock icon={CarFront} label="Parking" value={listing.parking} />}
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a href={`tel:${PHONE}`} onClick={handleCallClick}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  <Phone className="w-4 h-4 mr-2" /> Call Us
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
            <Link
              href={listingUrl(listing)}
              onClick={handleViewFullDetailsClick}
              className="block text-center text-sm font-medium text-primary hover:text-accent transition-colors pt-1"
            >
              View full details <ArrowUpRight className="inline w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// "≈ EGP 1.1M" under USD prices, so they can be compared with EGP listings.
// With an outdoor area it's the total (indoor + outdoor).
function EgpHint({ listing, block }: { listing: Listing; block?: boolean }) {
  const fx = useUsdEgpRate();
  if (listingCurrency(listing) !== "USD") return null;
  const egp = priceInEgp(listing, fx.rate);
  if (egp == null) return null;
  const text = `≈ ${formatEgpShort(egp)}${outdoorAmount(listing) > 0 ? " total" : ""}`;
  return block ? <p className="text-[11px] text-muted-foreground">{text}</p> : <span className="text-[11px] text-muted-foreground ml-1">{text}</span>;
}

// The extra area (outdoor/roof/terrace) is charged separately from the indoor price (listing-pricing.ts):
// "+ 96,250 EGP/month roof (350 m²)".
function OutdoorLine({ listing, block }: { listing: Listing; block?: boolean }) {
  const amount = outdoorAmount(listing);
  if (!amount) return null;
  const rent = listing.transaction_type?.toLowerCase() === "rent";
  const text = `+ ${amount.toLocaleString("en-US")} ${listingCurrency(listing)}${rent ? "/month" : ""} ${extraAreaWord(listing)} (${Number(listing.outdoor_area_sqm).toLocaleString("en-US")} m²)`;
  return block ? <p className="text-[11px] text-muted-foreground w-full">{text}</p> : <span className="text-[11px] text-muted-foreground ml-1">{text}</span>;
}
