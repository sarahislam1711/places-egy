// One wording for the "use a tenant rep" call-out, shared by the React pages
// (TenantRepCallout) and the server/build-time HTML for crawlers, so both say
// the same thing. Keep free of "@/" imports: server code imports this file.

export const TENANT_REP_PATH = "/services/tenant-representation";

// FAQ topics whose readers are often companies looking for an office.
export const TENANT_REP_FAQ_SECTIONS = new Set([
  "advisors-brokers",
  "early-thinking",
  "contracts-legal",
  "risks-mistakes",
  "pricing-value",
  "locations",
]);

export type TenantRepVariant = "rent" | "listing" | "advice";

export const TENANT_REP_COPY: Record<TenantRepVariant, { title: string; text: string; link: string }> = {
  // /rent/* landing pages and location pages
  rent: {
    title: "Don't search alone",
    text: "PLACES represents you, not the landlord. We shortlist the offices that fit, negotiate the rent, rent-free period and yearly increases, and review the lease before you sign. Our tenant representation is free for tenants: the landlord pays our fee.",
    link: "How tenant representation works",
  },
  // individual rent listings
  listing: {
    title: "Want us to negotiate this office for you?",
    text: "With PLACES as your tenant representative, we compare this office with similar options, negotiate the terms and review the lease. It's free for tenants: the landlord pays our fee.",
    link: "Free tenant representation",
  },
  // guides and FAQ pages
  advice: {
    title: "Get an advisor on your side",
    text: "Our tenant representation service puts a PLACES advisor on your side of the table: we search the market, negotiate the lease terms and check the contract. It's free for tenants because the landlord pays our fee.",
    link: "Learn about tenant representation",
  },
};

/** Plain HTML version for server-rendered and build-time pages. */
export function tenantRepHtml(variant: TenantRepVariant, esc: (s: string) => string): string {
  const c = TENANT_REP_COPY[variant];
  return `<aside><h2>${esc(c.title)}</h2><p>${esc(c.text)} <a href="${TENANT_REP_PATH}">${esc(c.link)}</a></p></aside>`;
}
