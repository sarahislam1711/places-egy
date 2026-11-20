// Which popup each page gets, and the rule that only one is on screen at a time.
//
// Pages are matched by intent:
//   - "concierge": visitor is looking for an office now (listings, locations,
//     developers, services) → "tell us what you need" chat prompt.
//   - "report":    visitor is researching (blog, FAQs, glossary, why PLACES)
//     → market report PDF popup.
//   - "both":      mixed intent (homepage) → concierge first; the report only
//     appears 15s after the concierge is closed. Never both at once.
//   - "none":      the page already has its own form (contact, market report)
//     or is a legal/admin page.
// Unlisted pages default to "concierge". Guides keep their own survey popup.

export type PagePopups = "concierge" | "report" | "both" | "none";

const RULES: [RegExp, PagePopups][] = [
  [/^\/$/, "both"],
  [/^\/(contact|resources\/market-report|privacy-policy|terms-of-service|dashboard)$/, "none"],
  [/^\/guides(\/|$)/, "none"],
  [/^\/(ar\/)?blog(\/|$)/, "report"],
  [/^\/faqs(\/|$)/, "report"],
  [/^\/(glossary|why-places)$/, "report"],
];

export function popupsFor(path: string): PagePopups {
  const p = path.replace(/\/+$/, "") || "/";
  for (const [re, kind] of RULES) if (re.test(p)) return kind;
  return "concierge";
}

export const conciergeAllowed = (path: string) => {
  const k = popupsFor(path);
  return k === "concierge" || k === "both";
};
export const reportAllowed = (path: string) => {
  const k = popupsFor(path);
  return k === "report" || k === "both";
};

// ── One popup on screen at a time ──────────────────────────────────────────
// In-memory (all popups live in the same SPA), so nothing goes stale across
// tabs or after a reload.
const REPORT_AFTER_CONCIERGE_MS = 15_000;
let conciergeOnScreen = false;
let reportOnScreen = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export function setConciergeOnScreen(on: boolean): void {
  conciergeOnScreen = on;
  notify();
}
export function setReportOnScreen(on: boolean): void {
  reportOnScreen = on;
  notify();
}
export const isReportOnScreen = () => reportOnScreen;

// The cookie banner counts as a popup too: nothing else opens while it is up,
// so a first visit never shows two cards at once.
let cookieBannerOnScreen = false;
export function setCookieBannerOnScreen(on: boolean): void {
  if (cookieBannerOnScreen === on) return;
  cookieBannerOnScreen = on;
  notify();
}
export const isCookieBannerOnScreen = () => cookieBannerOnScreen;

// Runs `show` after `delayMs`. If the concierge or the cookie banner is on
// screen at that moment, waits until it closes, then another 15s. Returns a
// cancel function.
export function scheduleReport(delayMs: number, show: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe = () => {};
  const blocked = () => conciergeOnScreen || cookieBannerOnScreen;
  const fire = () => {
    if (!blocked()) return show();
    const onChange = () => {
      if (blocked()) return;
      unsubscribe();
      timer = setTimeout(() => (blocked() ? fire() : show()), REPORT_AFTER_CONCIERGE_MS);
    };
    listeners.add(onChange);
    unsubscribe = () => listeners.delete(onChange);
  };
  timer = setTimeout(fire, delayMs);
  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}

// Calls `fn` whenever either popup appears or closes. Returns unsubscribe.
export function onPopupChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
