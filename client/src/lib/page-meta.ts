// Shared by the pages (useDocumentMeta) and script/prerender.ts, so the title
// crawlers see before JS matches what renders after. Keep free of "@/" imports:
// the build script imports this file directly.

const SITE = "https://places-egy.com";

export interface StaticPageMeta {
  title: string;
  description: string;
  url: string;
}

export const STATIC_PAGE_META = {
  "/services/tenant-representation": {
    title: "Tenant Representation in Cairo | Office Leasing | PLACES",
    description:
      "PLACES represents companies, not landlords. We find, compare and negotiate your office in Cairo and review the lease. Free for tenants.",
    url: `${SITE}/services/tenant-representation`,
  },
  "/services/primary-property": {
    title: "Primary Property in Egypt — Buy Direct From Developers | PLACES",
    description:
      "Buy directly from the developer — off-plan and newly launched units across Egypt's most active developments, with evaluation and transaction management.",
    url: `${SITE}/services/primary-property`,
  },
  "/services/property-resale": {
    title: "Property Resale in Egypt — Buy & Sell Offices | PLACES",
    description:
      "Buy or sell a unit that has already been transacted — with full market context on both sides, honest pricing, and end-to-end transaction management.",
    url: `${SITE}/services/property-resale`,
  },
  "/services/investment-consultation": {
    title: "Real Estate Investment Consultation in Egypt | PLACES",
    description:
      "Data-driven advisory for investors evaluating commercial and administrative assets in Egypt — from portfolio assessment to ongoing post-acquisition support.",
    url: `${SITE}/services/investment-consultation`,
  },
  "/services/income-generating-property": {
    title: "Income Generating Property in Egypt | PLACES",
    description:
      "Identify and acquire units that generate consistent rental income across Egypt's most active business districts — yield-first thinking, tenant demand data, and lease structuring.",
    url: `${SITE}/services/income-generating-property`,
  },
  "/glossary": {
    title: "Real Estate Glossary — Office Leasing & Investment Terms | PLACES",
    description:
      "A working glossary of administrative real estate terms — leasing, financing, contracts, unit specs — used by PLACES and Egypt's office market professionals.",
    url: `${SITE}/glossary`,
  },
  "/privacy-policy": {
    title: "Privacy Policy | PLACES",
    description:
      "How PLACES collects, uses, and protects the personal information you share on places-egy.com, including cookies, enquiries, and analytics.",
    url: `${SITE}/privacy-policy`,
  },
  "/terms-of-service": {
    title: "Terms of Service | PLACES",
    description:
      "The terms that govern your use of places-egy.com and PLACES' real estate advisory and brokerage services in Egypt.",
    url: `${SITE}/terms-of-service`,
  },
} satisfies Record<string, StaticPageMeta>;
