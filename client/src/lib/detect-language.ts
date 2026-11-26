// Detect the visitor's preferred language for email personalization.
// Order of precedence:
//   1. URL path — if they're on /ar/*, they're browsing in Arabic → return 'ar'
//   2. Browser navigator.language — first 2 chars 'ar' → 'ar', otherwise 'en'
//
// Called at form-submit / signup time and attached to the payload as
// preferred_language so server-side email code knows which template to render.

export type Lang = "en" | "ar";

export function detectPreferredLanguage(): Lang {
  if (typeof window === "undefined") return "en";

  // URL path takes priority — an explicit choice by the user.
  const path = window.location.pathname;
  if (path === "/ar" || path.startsWith("/ar/")) return "ar";

  // Fall back to browser language.
  const nav = window.navigator;
  const candidates: string[] = [];
  if (nav.language) candidates.push(nav.language);
  if (Array.isArray(nav.languages)) candidates.push(...nav.languages);
  for (const c of candidates) {
    if (c.toLowerCase().startsWith("ar")) return "ar";
  }
  return "en";
}

// Language of the page being shown: Arabic only on /ar pages, English
// everywhere else. On-screen popups use this so their wording always matches
// the content around them (an Arabic browser on an English page gets
// English). Emails keep using detectPreferredLanguage().
export function isArabicPath(path: string): boolean {
  return path === "/ar" || path.startsWith("/ar/");
}

export function pageLanguage(path?: string): Lang {
  if (path === undefined) {
    if (typeof window === "undefined") return "en";
    path = window.location.pathname;
  }
  return isArabicPath(path) ? "ar" : "en";
}
