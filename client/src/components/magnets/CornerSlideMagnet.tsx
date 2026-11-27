import { useEffect, useState } from "react";
import { X, FileText, ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { trackEvent } from "@/lib/analytics";
import { useLocation } from "wouter";
import { reportAllowed, scheduleReport, setReportOnScreen } from "@/lib/magnet-coord";

// Bottom-right corner slide-in for homepage + listing pages.
// Dark primary card, accent-red icon + button, larger typography, one-shot
// pulse animation on first appearance to grab attention without being annoying.
// Chat-widget style (like Intercom / Drift) — small, dismissible, brand-punchy.
//
// Fires:
//   - corner_magnet_shown    (once per mount, after visible + not dismissed)
//   - corner_magnet_open     (user clicked CTA — form expands)
//   - corner_magnet_dismiss  (user clicked X)

// Session-only dismiss: X button suppresses the popup for the current tab
// only. Close the tab and come back tomorrow → magnet appears again. The
// ONLY permanent suppression is a successful form submission (SUBMITTED_KEY
// in localStorage) — that persists forever across visits.
const DISMISS_KEY = "corner_magnet_dismissed_this_session";
const SUBMITTED_KEY = "market_report_submitted_at";
// Mobile viewports get a longer delay — the concierge appears at 8s on
// mobile (see ConciergeWidget), so pushing this one further out avoids
// two popups landing back-to-back on phones.
const SHOW_AFTER_MS_DESKTOP = 15000;
const SHOW_AFTER_MS_MOBILE = 30000;
const SHOW_AFTER_MS =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 767px)").matches
    ? SHOW_AFTER_MS_MOBILE
    : SHOW_AFTER_MS_DESKTOP;

function isSuppressed(): boolean {
  try {
    // Permanent: they submitted the form. Never nag them again.
    if (localStorage.getItem(SUBMITTED_KEY)) return true;
    // Session-only: they X'd the popup this visit. Clears when tab closes.
    if (sessionStorage.getItem(DISMISS_KEY)) return true;
    return false;
  } catch {
    return false;
  }
}

export function CornerSlideMagnet() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only on pages the rules in magnet-coord give it, and never while the
  // concierge is on screen (scheduleReport waits for it to close + 15s).
  const [location] = useLocation();
  const allowed = reportAllowed(location);
  useEffect(() => {
    if (!allowed || isSuppressed()) return;
    return scheduleReport(SHOW_AFTER_MS, () => {
      setReportOnScreen(true);
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      trackEvent("corner_magnet_shown", {
        magnet: "cairo_office_market_report_2026",
      });
    });
  }, [allowed]);

  useEffect(() => () => setReportOnScreen(false), []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore — user just sees it again next visit.
    }
    trackEvent("corner_magnet_dismiss", {
      magnet: "cairo_office_market_report_2026",
    });
    setVisible(false);
    setReportOnScreen(false);
    setTimeout(() => {
      setMounted(false);
      setExpanded(false);
    }, 500);
  };

  const open = () => {
    setExpanded(true);
    trackEvent("corner_magnet_open", {
      magnet: "cairo_office_market_report_2026",
    });
  };

  const handleFormSuccess = () => {
    try {
      localStorage.setItem(SUBMITTED_KEY, String(Date.now()));
    } catch {
      // Ignore — worst case they see the popup again next visit.
    }
  };

  if (!mounted || !allowed) return null;

  return (
    <div
      // Below lg the Browse/WhatsApp bar sits at the bottom: stay just above it
      // (MobileBottomBar sets --bottom-bar-offset; 1rem when the bar is hidden).
      className={`fixed right-4 bottom-[calc(var(--bottom-bar-offset,4.5rem)+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6 z-50 max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      {expanded ? (
        <div className="w-[min(26rem,calc(100vw-2rem))] max-h-[calc(100dvh-10rem)] lg:max-h-[calc(100dvh-3rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-primary/10">
          <div className="bg-primary px-6 py-5 relative">
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/20 px-2.5 py-1 rounded-full mb-2">
              Free · PDF · 2026
            </span>
            <h3 className="text-lg font-serif font-bold text-white leading-tight">
              Cairo Office Market Report
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Pricing, supply, yields — sent to your inbox.
            </p>
          </div>
          <div className="p-6">
            <LeadForm
              leadSource="corner_popup"
              magnet="cairo_office_market_report_2026"
              submitLabel="Send me the report"
              successTitle="You're on the list."
              successBody="Watch your inbox — the report will land within a few minutes."
              onSubmitSuccess={handleFormSuccess}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={open}
          className="group relative flex items-center gap-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 ring-1 ring-accent/30 px-5 py-4 md:px-6 md:py-5 max-w-md hover:shadow-accent/40 hover:ring-accent/60 transition-all duration-300 hover:-translate-y-0.5"
        >
          {/* Pulse ring on the icon — draws the eye */}
          <span className="relative flex h-12 w-12 items-center justify-center shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-accent/40 animate-ping"
              aria-hidden="true"
            />
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg">
              <FileText className="w-5 h-5" />
            </span>
          </span>

          <div className="text-left min-w-0 pr-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none mb-1.5">
              Free · 2026 Report
            </p>
            <p className="text-base md:text-lg font-serif font-bold leading-tight">
              Cairo Office Market Report
            </p>
            <p className="text-xs text-white/70 mt-1 inline-flex items-center gap-1 font-medium">
              Get it free
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </div>

          {/* X positioned absolute so it doesn't stretch the button, and doesn't
              inherit the button click. Use span+onClick with stopPropagation. */}
          <span
            role="button"
            tabIndex={0}
            aria-label="Dismiss for 14 days"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                dismiss();
              }
            }}
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
