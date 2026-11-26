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
      "Tenant representation for companies in Cairo, Egypt. As your tenant rep broker, PLACES finds office space and negotiates your lease. Free for tenants.",
    url: `${SITE}/services/tenant-representation`,
  },
  "/services/primary-property": {
    title: "Primary Property in Egypt: Buy From Developers | PLACES",
    description:
      "Primary property in Egypt: buy offices directly from developers, off-plan or at launch, with the unit, developer and payment plan assessed first.",
    url: `${SITE}/services/primary-property`,
  },
  "/services/property-resale": {
    title: "Property Resale in Egypt: Buy & Sell Offices | PLACES",
    description:
      "Property resale in Egypt: buy or sell an office that has already been transacted, priced on comparable transactions, with the transfer managed.",
    url: `${SITE}/services/property-resale`,
  },
  "/services/investment-consultation": {
    title: "Real Estate Investment Consultation in Egypt | PLACES",
    description:
      "Real estate investment consultation in Egypt: objective, data-driven advice on yield, vacancy and capital growth for commercial and administrative assets.",
    url: `${SITE}/services/investment-consultation`,
  },
  "/services/income-generating-property": {
    title: "Income Generating Property in Egypt | PLACES",
    description:
      "Income generating property in Egypt: find and buy units with real tenant demand, realistic net yield and lease terms that protect your rental income.",
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
