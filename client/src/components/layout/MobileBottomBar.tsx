import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutGrid, MessageCircle, Phone } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_HREF = "https://wa.me/201063618217";
const PHONE_TEL = "tel:+201063618217";

// Always-visible mobile-only sticky bottom bar with the highest-intent
// actions on the site. Adapts to context:
//   - /listings (browse): hidden entirely (browse IS the current activity)
//   - /listings/[id] (detail): Call + WhatsApp — visitor already on a
//     specific unit, primary intent is contact-a-human
//   - everything else: Browse + WhatsApp
//
// While a page's own contact buttons are on screen (any element marked
// data-cta-row, e.g. the service-page hero and closing band), the bar slides
// away so phones never show two WhatsApp buttons at once. It also sets
// --bottom-bar-offset so the help bubble (ConciergeWidget) sits just above
// the bar when it's shown and drops to the corner when it's hidden.
//
// Book / Calendly button intentionally removed 2026-08-23 — calendar
// bookings paused for now. When re-enabled, restore the third column
// and switch the grid back to grid-cols-3.
export function MobileBottomBar() {
  const [location] = useLocation();
  const [ctaOnScreen, setCtaOnScreen] = useState(false);
  const barShown = location !== "/listings" && !ctaOnScreen;

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const vh = window.innerHeight;
      const onScreen = Array.from(document.querySelectorAll("[data-cta-row]")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.bottom > 64 && r.top < vh - 64;
      });
      setCtaOnScreen(onScreen);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    // Pages render their content after data loads, so check again shortly.
    const late = window.setTimeout(schedule, 600);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [location]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bottom-bar-offset", barShown ? "4.5rem" : "1rem");
  }, [barShown]);

  if (location === "/listings") return null;

  const isDetail = location.startsWith("/listings/");

  return (
    <div
      aria-hidden={!barShown}
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
        barShown ? "translate-y-0" : "translate-y-full pointer-events-none"
      } bg-primary/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]`}
    >
      <div className="grid grid-cols-2 gap-1.5 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {isDetail ? (
          <a
            href={PHONE_TEL}
            onClick={() => trackEvent("call_click", { source: "mobile_bottom_bar_detail" })}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-primary font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        ) : (
          <Link
            href="/listings"
            onClick={() => trackEvent("browse_listings_click", { source: "mobile_bottom_bar" })}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-primary font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Browse
          </Link>
        )}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click", { source: isDetail ? "mobile_bottom_bar_detail" : "mobile_bottom_bar" })}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1fb855] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
