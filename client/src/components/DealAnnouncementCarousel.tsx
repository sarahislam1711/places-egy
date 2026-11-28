import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DealAnnouncement } from "@/components/DealAnnouncement";
import type { Deal } from "@/lib/deals";
import { trackEvent } from "@/lib/analytics";
import { DEAL_AR } from "@/lib/home-ar";

// Homepage carousel of the latest closed deals. Fetches up to 20 active deals
// from /api/deals (managed in the admin dashboard) and renders each as a
// DealAnnouncement slide. With one deal it's a static banner; with 2–3 it
// becomes a swipeable/auto-advancing carousel. Renders nothing when there are
// no active deals.
export function DealAnnouncementCarousel({ lang = "en" }: { lang?: "en" | "ar" } = {}) {
  const ar = lang === "ar";
  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const [index, setIndex] = useState(0);
  const count = deals.length;
  const multiple = count > 1;

  const go = useCallback(
    (next: number) => {
      const normalized = ((next % count) + count) % count;
      setIndex(normalized);
      // Only track manual navigation (user clicked ‹ ›). The auto-advance
      // path calls setIndex directly, not go(), so it doesn't fire this event.
      const deal = deals[normalized];
      if (deal) {
        trackEvent("deal_strip_navigate", {
          index: normalized,
          deal_id: deal.id,
          client_name: deal.client_name,
        });
      }
    },
    [count, deals],
  );

  // Gentle auto-advance, paused for reduced-motion users.
  useEffect(() => {
    if (!multiple) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [multiple, count]);

  // Keep index valid if the deal list shrinks (e.g. one was hidden).
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const current = deals[index];

  return (
    <div
      className="relative"
      role={multiple ? "group" : undefined}
      aria-roledescription={multiple ? "carousel" : undefined}
      aria-label={multiple ? (ar ? DEAL_AR.carousel : "Latest closed deals") : undefined}
    >
      <DealAnnouncement
        clientName={current.client_name}
        clientLogo={current.client_logo ?? ""}
        sqm={current.sqm ?? ""}
        location={current.location ?? ""}
        spaceType={current.space_type ?? ""}
        leaseFormat={current.lease_format ?? ""}
        lang={lang}
      />

      {multiple && (
        <>
          {/* Prev / next — pinned to the screen edges of the full-bleed strip. */}
          {/* Prev/next — 44×44 on mobile for reliable thumb-taps, 32×32
              on md+ where mouse click precision makes the smaller size
              fine. */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={ar ? DEAL_AR.prev : "Previous deal"}
            className="absolute start-2 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 md:h-8 md:w-8 items-center justify-center rounded-full bg-[#ECE7D8]/10 text-[#ECE7D8] backdrop-blur-sm transition-colors hover:bg-[#ECE7D8]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="h-5 w-5 md:h-4 md:w-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={ar ? DEAL_AR.next : "Next deal"}
            className="absolute end-2 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 md:h-8 md:w-8 items-center justify-center rounded-full bg-[#ECE7D8]/10 text-[#ECE7D8] backdrop-blur-sm transition-colors hover:bg-[#ECE7D8]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight className="h-5 w-5 md:h-4 md:w-4 rtl:rotate-180" />
          </button>

          {/* Position indicator — bottom-center. For a handful of deals it's a
              simple dot row; once there are many, it becomes a windowed set of
              dots (active + neighbours, edge dots shrink to hint "more") plus a
              "N / total" counter, so 20 deals never turn into 20 cluttered dots. */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {deals.map((deal, i) => {
                const distance = Math.abs(i - index);
                // With >5 deals, only render dots within 2 of the active one.
                if (count > 5 && distance > 2) return null;
                // Edge dots of the window shrink to signal there's more.
                const size =
                  i === index ? "w-5 bg-accent" : distance >= 2 && count > 5 ? "w-1 bg-[#ECE7D8]/30" : "w-1.5 bg-[#ECE7D8]/40 hover:bg-[#ECE7D8]/70";
                return (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={ar ? DEAL_AR.goTo(i + 1) : `Go to deal ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${size}`}
                  />
                );
              })}
            </div>
            {count > 5 && (
              <span className="text-[10px] font-bold tabular-nums tracking-wide text-[#ECE7D8]/60">
                {index + 1} / {count}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
