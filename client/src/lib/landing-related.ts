// Links from the search landing pages (/rent/new-cairo etc.) to the FAQ topic
// pages and to the developers building in that location. These are the site's
// strongest pages, so linking from them helps Google find and value the FAQ and
// developer pages. Shared by the server render (server/seo/render.ts) and the
// React page, so keep this file free of "@/" imports.
import { FAQ_SECTIONS } from "./faq";
import { DEVELOPER_DISPLAY_NAMES, PROJECTS } from "./projects";
import { DEVELOPER_PAGE_SLUGS } from "./developer-inventory";
import type { DealSlug } from "./landing-pages";

export interface RelatedLink {
  path: string;
  label: string;
}

// The four FAQ topics a reader is most likely to need for each kind of search
// (27 Nov: trimmed from six, and shown as plain questions, not chapter titles).
const DEAL_FAQ_TOPICS: Record<DealSlug, string[]> = {
  rent: ["locations", "contracts-legal", "advisors-brokers", "risks-mistakes"],
  buy: ["rent-buy-resale", "developers", "pricing-value", "contracts-legal"],
  "income-property": ["investment-income", "pricing-value", "contracts-legal", "risks-mistakes"],
};

// How each FAQ section reads as a link on the landing pages.
const FAQ_TOPIC_LABELS: Record<string, string> = {
  "early-thinking": "Thinking it through before you start",
  "admin-vs-commercial": "Admin office or commercial space?",
  locations: "Which area suits your company?",
  "contracts-legal": "What to check in the contract",
  "advisors-brokers": "Should you use a broker?",
  "risks-mistakes": "Mistakes to avoid",
  "rent-buy-resale": "Rent, buy new or buy resale?",
  developers: "How to choose a developer and project",
  "pricing-value": "Is the price right?",
  "investment-income": "Buying an office for rental income",
};

export function landingFaqTopics(deal: DealSlug): RelatedLink[] {
  return DEAL_FAQ_TOPICS[deal].flatMap((id) => {
    const s = FAQ_SECTIONS.find((x) => x.id === id);
    return s ? [{ path: `/faqs/${s.id}`, label: FAQ_TOPIC_LABELS[s.id] ?? s.title }] : [];
  });
}

/** Developers with a page and at least one project in this location, A–Z. */
export function landingDevelopers(locName: string): RelatedLink[] {
  const slugs = new Set(
    PROJECTS.filter((p) => p.location.split(" · ")[0] === locName && DEVELOPER_PAGE_SLUGS.has(p.developer)).map((p) => p.developer),
  );
  return Array.from(slugs)
    .map((slug) => ({ path: `/developers/${slug}`, label: DEVELOPER_DISPLAY_NAMES[slug] ?? slug }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
