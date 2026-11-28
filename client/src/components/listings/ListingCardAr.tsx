import { Link } from "wouter";
import { ArrowUpRight, Building2, MapPin, Maximize } from "lucide-react";
import { type Listing } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { listingUrl } from "@/lib/listings";
import { DEVELOPER_OPTIONS, getEnumLabel } from "@/lib/enums";
import { supabaseImage, supabaseImageOnError } from "@/lib/image-url";
import { trackEvent, listingEventParams } from "@/lib/analytics";
import {
  AREA_AR,
  arabicListingTitle,
  areaAr,
  areaLabelAr,
  currencyAr,
  furnishingAr,
  rentedLabelAr,
  subtypeAr,
  txAr,
} from "@/lib/listing-text-ar";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

/**
 * Arabic version of the standard listing card (same look as ListingCard's
 * default card), for /ar pages. Title is built from the listing's fields;
 * the card links to the listing page (English until listings get Arabic text).
 */
export function ListingCardAr({ listing }: { listing: Listing }) {
  const image = listing.images?.[0] ?? FALLBACK_IMAGE;
  const title = arabicListingTitle(listing);
  const tx = (listing.transaction_type ?? "").toLowerCase();
  const rent = tx === "rent";
  // Some listings have the area typed in as the project ("new cairo"): skip it.
  const rawProject = listing.project?.trim() ?? "";
  const norm = (v: string) => v.toLowerCase().replace(/[-_\s]+/g, " ").trim();
  const project =
    rawProject && !Object.keys(AREA_AR).some((k) => norm(k) === norm(rawProject)) && norm(rawProject) !== norm(listing.location ?? "")
      ? rawProject
      : "";
  const open = () => trackEvent("view_full_details_click", { ...listingEventParams(listing), lang: "ar" });

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-[0_12px_32px_-12px_rgba(232,64,74,0.18)] hover:-translate-y-0.5 transition-all duration-300 bg-[#FDFBF8]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={supabaseImage(image, "card")}
          onError={supabaseImageOnError(image)}
          alt={title}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
        />
        <FavoriteButton listingId={listing.id} overlay />
        <div className="absolute top-4 start-4 flex flex-wrap items-start gap-1.5 max-w-[85%]">
          <Badge
            className={`${tx === "sale" ? "bg-emerald-600" : rent ? "bg-accent text-accent-foreground" : "bg-blue-600"} text-[11px] font-bold shadow-sm border-0`}
          >
            {txAr(tx)}
          </Badge>
          {listing.rental_status === "rented" && (
            <Badge className="bg-slate-800/90 text-white text-[11px] font-semibold shadow-sm border-0">{rentedLabelAr(listing)}</Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
      </div>

      <CardHeader className="p-4 pb-1.5">
        <div className="flex justify-between items-start gap-2 mb-2">
          {listing.developer ? (
            <div className="text-xs font-semibold text-accent tracking-wide" dir="ltr">
              {getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}
            </div>
          ) : (
            <span />
          )}
          {subtypeAr(listing.subtype) && (
            <span className="text-[11px] font-bold text-primary/60 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              {subtypeAr(listing.subtype)}
            </span>
          )}
        </div>
        <h3 className="font-serif-ar text-base font-semibold leading-snug line-clamp-2">
          <Link href={listingUrl(listing)} onClick={open} className="hover:text-accent transition-colors">
            {title}
          </Link>
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {/* Area, dot and (usually English) project name as separate pieces:
              inside one span the dot jumped to the wrong side and the two
              names ran into each other. */}
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0">{areaAr(listing.location)}</span>
            {project && (
              <>
                <span aria-hidden className="shrink-0 text-muted-foreground/60">·</span>
                <bdi dir="ltr" className="truncate">{project}</bdi>
              </>
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 pb-2">
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">المساحة</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Maximize className="w-3.5 h-3.5 text-accent" />
              {areaLabelAr(listing) || "—"}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">التشطيب</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              <span className="truncate">{furnishingAr(listing.furnishing) || "—"}</span>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-[11px] text-muted-foreground font-medium">السعر</span>
          {listing.price != null && Number(listing.price) > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary font-serif">{Number(listing.price).toLocaleString("en-US")}</span>
              <span className="text-xs text-muted-foreground">{currencyAr(listing.currency)}</span>
              {rent && <span className="text-xs text-muted-foreground">/ شهريًا</span>}
            </div>
          ) : (
            <div className="text-base font-semibold text-primary">السعر عند الطلب</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-3 pt-0">
        <Link
          href={listingUrl(listing)}
          onClick={open}
          className="flex-1 inline-flex items-center justify-center h-9 rounded-md bg-secondary hover:bg-primary hover:text-white text-secondary-foreground text-sm font-medium transition-colors"
        >
          عرض التفاصيل <ArrowUpRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
        </Link>
      </CardFooter>
    </Card>
  );
}
