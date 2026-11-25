// Single source of truth for the /guides/* content library. Consumed by:
//   - GuidesIndexPage (the hub at /guides)
//   - Each individual guide page (for prev/next + breadcrumbs)
//   - Navbar + Footer (Resources dropdown)
//   - build-sitemap.ts (adds every guide URL to sitemap.xml)
//   - prerender step (bakes correct <title>/<meta> into initial HTML)
//   - schema helpers (Article + breadcrumb JSON-LD)
//
// To add a new guide:
//   1. Append its metadata here
//   2. Create /client/src/pages/guides/<slug>.tsx with the content
//   3. Register the route in App.tsx (lazy import)
// The sitemap + nav + hub auto-update from this list on the next build.

export type Guide = {
  slug: string;
  title: string; // <title> tag + <h1>
  description: string; // meta description + og:description
  excerpt: string; // short teaser shown on the hub card
  category: "Renting" | "Buying" | "Planning" | "Costs" | "Market";
  readMinutes: number; // shown on the card + at the top of each guide
  publishedAt: string; // ISO date — used for JSON-LD datePublished
  updatedAt: string; // ISO date — used for JSON-LD dateModified + sitemap lastmod
  imageUrl?: string; // og:image + hub card thumbnail
};

// Ordered by priority for the hub display (highest-search-volume first).
// Change PUBLISHED_AT / UPDATED_AT here rather than in the page files so the
// sitemap + schema stay perfectly in sync.
export const GUIDES: Guide[] = [
  {
    slug: "office-rental-prices-cairo-2026",
    title: "Cairo Office Rental Prices: 2026 Guide by District",
    description:
      "How much does it cost to rent an office in Cairo in 2026? Full price-per-meter breakdown by district — New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, Maadi — with real market data.",
    excerpt:
      "What you'll actually pay per square meter across every major Cairo business district, with real 2026 asking prices from serviced offices to shell-and-core spaces.",
    category: "Renting",
    readMinutes: 9,
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    imageUrl: "/images/cairo-festival-city.webp",
  },
  {
    slug: "how-to-rent-office-cairo",
    title: "How to Rent an Office in Cairo: Complete 2026 Guide",
    description:
      "Step-by-step guide to renting an office in Cairo — from defining your requirements and shortlisting districts to negotiating lease terms and signing. Written by PLACES, Egypt's admin-office specialists.",
    excerpt:
      "The exact 7-step process — from figuring out how much space you need to signing the lease — with the negotiation levers most tenants leave on the table.",
    category: "Renting",
    readMinutes: 12,
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    imageUrl: "/images/general-office.jpg",
  },
  {
    slug: "buy-vs-rent-office-cairo",
    title: "Buying vs Renting an Office in Cairo: Which Makes Sense for You?",
    description:
      "Should your business buy or rent its Cairo office? A financial + strategic comparison with real 2026 numbers, break-even analysis, and the situations where each option wins.",
    excerpt:
      "The 5-year break-even math with real 2026 Cairo numbers, plus the four situations where owning wins outright and the three where renting is the obvious choice.",
    category: "Buying",
    readMinutes: 10,
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    imageUrl: "/images/hero-main.jpg",
  },
  {
    slug: "office-size-guide",
    title: "How Much Office Space Does Your Business Need? (m² per Employee)",
    description:
      "The 2026 office-size calculator: how many square meters your business actually needs based on headcount, hybrid working, and role mix — with a downloadable sizing table.",
    excerpt:
      "Standard formulas give the wrong answer for Egyptian offices. Here's the sizing table PLACES uses with real clients — by role type, meeting-room mix, and hybrid ratio.",
    category: "Planning",
    readMinutes: 8,
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    imageUrl: "/images/general-office.jpg",
  },
  {
    slug: "office-fit-out-costs-cairo",
    title: "Office Fit-Out Costs in Cairo (2026 Budget Breakdown)",
    description:
      "What it actually costs to fit out an office in Cairo in 2026: shell-and-core to fully-furnished, itemized budget by category (partitions, HVAC, IT, furniture) with contractor rate ranges.",
    excerpt:
      "The line-by-line 2026 fit-out budget — from partition walls to network cabling — with the four cost categories most SMB owners underestimate.",
    category: "Costs",
    readMinutes: 11,
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    imageUrl: "/images/Mivida-Business-Park.jpg",
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

// Return the next guide in the list (wraps back to first) for "read next" CTAs
// at the bottom of each guide.
export function nextGuide(current: string): Guide {
  const i = GUIDES.findIndex((g) => g.slug === current);
  return GUIDES[(i + 1) % GUIDES.length];
}
