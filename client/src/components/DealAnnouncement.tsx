import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { DEAL_AR, dealValueAr } from "@/lib/home-ar";

// Deal Announcement — a full-bleed "Done Deal" strip that deliberately breaks
// the boxed-card rhythm of the homepage so a freshly-closed deal reads as an
// announcement, not another content card. Charcoal ground with a JUST CLOSED
// corner stamp, the leased-SQM hero metric (animated count-up), three
// category-encoded tags, the client logo as a sign-off, and a translucent ghost
// of the SQM figure bleeding off the right edge.
//
// Adding a new deal is data-only — pass a DealAnnouncementProps object.

export interface DealAnnouncementProps {
  clientName: string;
  /** Image URL — a light/white logo, to sit on the dark ground. */
  clientLogo: string;
  /** Leased area; also drives the ghost figure. */
  sqm: number | string;
  /** District / business park — never hardcoded; always per deal. */
  location: string;
  /** Nature of the space, e.g. "Administrative HQ". */
  spaceType: string;
  /** Commercial structure, e.g. "Long-term lease", "Sale". */
  leaseFormat: string;
  /** Show a dismiss control (for a persistent strip). */
  dismissible?: boolean;
  /** "ar" on /ar pages: Arabic labels, RTL-mirrored ribbon and ghost figure. */
  lang?: "en" | "ar";
}

function formatSqm(sqm: number | string): string {
  if (typeof sqm === "number") return sqm.toLocaleString("en-US");
  return sqm;
}

export function DealAnnouncement({
  clientName,
  clientLogo,
  sqm,
  location,
  spaceType,
  leaseFormat,
  dismissible = false,
  lang = "en",
}: DealAnnouncementProps) {
  const ar = lang === "ar";
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const sqmLabel = formatSqm(sqm);

  return (
    <section
      aria-label={ar ? DEAL_AR.aria(sqmLabel, clientName, location) : `Latest closed deal: ${sqmLabel} square metres leased to ${clientName} in ${location}`}
      className="group relative overflow-hidden rounded-2xl border border-[#ECE7D8]/10 bg-[#16161A] text-[#ECE7D8] shadow-lg shadow-black/20 motion-safe:animate-[dealBreathe_3s_ease-in-out_infinite] motion-safe:will-change-transform"
    >
      {/* Animated coral hue — a soft radial wash that drifts/pulses behind the
          content, giving the dark banner a living glow. motion-safe gated. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[dealHue_6s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(120% 140% at 20% 0%, rgba(232,64,74,0.22), transparent 55%)",
        }}
      />

      {/* Subtle grain over the charcoal, echoing the deck slides. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 'Alive' sweep — a slow diagonal sheen drifting across the dark surface.
          motion-safe only, so reduced-motion users see a static strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[dealSweep_7s_linear_infinite] opacity-60"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(236,231,216,0.06) 50%, transparent 60%)",
          backgroundSize: "250% 100%",
        }}
      />

      {/* Ghost SQM figure, bleeding off the right edge. HIDDEN on mobile —
          it adds visual noise, competes with the tags at small sizes, and
          the card is more legible without it. Kept on md+. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute ${ar ? "-left-4" : "-right-4"} top-1/2 -translate-y-1/2 select-none font-serif font-bold leading-none text-[#ECE7D8]/[0.045] hidden md:block md:text-[15rem]`}
      >
        {sqmLabel}
      </span>

      {/* 'JUST CLOSED' diagonal corner ribbon (top-right). The bar is wider than
          the corner and rotated 45°, with its ends tucking under the card edges
          so overflow-hidden clips the ENDS, not the text — keeping the words
          fully readable. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute ${ar ? "-left-[52px] -rotate-45 tracking-normal" : "-right-[52px] rotate-45 tracking-[0.22em]"} top-[22px] z-20 hidden w-[180px] bg-accent py-1 text-center text-[10px] font-bold uppercase text-accent-foreground shadow-md sm:block`}
      >
        {ar ? DEAL_AR.justClosed : "Just Closed"}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss deal announcement"
          className="absolute end-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full text-[#ECE7D8]/50 transition-colors hover:bg-[#ECE7D8]/10 hover:text-[#ECE7D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Content row — tighter on mobile (gap-3, p-4) to keep the card
          from dominating small viewports. Desktop keeps the roomier
          layout it was already using. */}
      <div className="relative z-20 flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-7 md:p-6">
        {/* Eyebrow + hero metric */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <span className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {ar ? DEAL_AR.newDeal : "New Deal"}
          </span>
          <div className="flex items-baseline gap-2">
            {/* Hero number — smaller on mobile so it doesn't overrun the
                narrow viewport. Was text-4xl, now text-3xl on mobile. */}
            <span className="font-serif text-3xl md:text-5xl font-bold leading-none tracking-tight text-[#ECE7D8]">
              {sqmLabel}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-[#ECE7D8]/55">
              {ar ? DEAL_AR.sqm : "SQM"}
              <br />
              {ar ? DEAL_AR.leased : "Leased"}
            </span>
          </div>
        </div>

        {/* Hairline divider between the metric and the supporting detail. */}
        <div aria-hidden className="hidden h-10 w-px bg-[#ECE7D8]/15 md:block" />

        {/* Category-encoded tags in two rows: Space Type + Term on top (equal
            width), Location spanning the full width below them. */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <DealTag category={ar ? DEAL_AR.spaceType : "Space Type"} value={ar ? dealValueAr(spaceType) : spaceType} variant="filled" className="flex-1" />
            <DealTag category={ar ? DEAL_AR.term : "Term"} value={ar ? dealValueAr(leaseFormat) : leaseFormat} variant="outline" className="flex-1" />
          </div>
          <DealTag category={ar ? DEAL_AR.location : "Location"} value={location} variant="outline" icon={<MapPin className="h-3 w-3" />} className="w-full" />
        </div>

        {/* Client logo — sized to hold real visual weight against the
            large SQM number on the left. Bumped from h-20/w-56 to
            h-32/w-80 on desktop (2026-09-07 per user feedback that the
            old size felt tiny relative to the strip's overall footprint).
            Mobile stays compact so the card doesn't need extra vertical
            room to fit the logo. */}
        {clientLogo && (
          <div className="flex shrink-0 items-center md:border-s md:border-[#ECE7D8]/15 md:ps-6 md:pe-10">
            <div className="flex h-12 w-36 md:h-32 md:w-80 items-center justify-center mx-auto md:mx-0">
              <img
                src={clientLogo}
                alt={ar ? `شعار ${clientName}` : `${clientName} logo`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain opacity-95 brightness-0 invert"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DealTag({
  category,
  value,
  variant,
  icon,
  className = "",
}: {
  category: string;
  value: string;
  variant: "filled" | "outline";
  icon?: React.ReactNode;
  className?: string;
}) {
  const skin =
    variant === "filled"
      ? "bg-[#ECE7D8] text-[#0E0E0F]"
      : "border border-[#ECE7D8]/20 text-[#ECE7D8]";
  const labelTone = variant === "filled" ? "text-[#0E0E0F]/55" : "text-[#ECE7D8]/45";

  if (!value) return null;

  return (
    <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-1.5 ${skin} ${className}`}>
      <span className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelTone}`}>
        {category}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
        {icon}
        {value}
      </span>
    </div>
  );
}
