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

// The FAQ topics a reader is most likely to need for each kind of search.
const DEAL_FAQ_TOPICS: Record<DealSlug, string[]> = {
  rent: ["early-thinking", "admin-vs-commercial", "locations", "contracts-legal", "advisors-brokers", "risks-mistakes"],
  buy: ["rent-buy-resale", "admin-vs-commercial", "developers", "pricing-value", "contracts-legal", "risks-mistakes"],
  "income-property": ["investment-income", "rent-buy-resale", "pricing-value", "contracts-legal", "advisors-brokers", "risks-mistakes"],
};

export function landingFaqTopics(deal: DealSlug): RelatedLink[] {
  return DEAL_FAQ_TOPICS[deal].flatMap((id) => {
    const s = FAQ_SECTIONS.find((x) => x.id === id);
    return s ? [{ path: `/faqs/${s.id}`, label: s.title }] : [];
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
