// Search landing pages: /rent/{location}, /buy/{location}, /income-property/{location}.
// Each page targets one query ("offices for rent in New Cairo" and its
// variations). Copy is built from the live listings, so numbers stay true.
// Shared by the server render (server/seo/render.ts) and the React page, so
// keep this file free of "@/" imports.
import { LOCATION_CONTENT } from "./location-content";

/** A page only exists while it has at least this many available units. */
export const LANDING_MIN_UNITS = 8;

export type DealSlug = "rent" | "buy" | "income-property";
type Tx = "rent" | "sale" | "income-property";

export interface Deal {
  slug: DealSlug;
  tx: Tx;
  /** H1 / main keyword, e.g. "Offices for Rent in New Cairo" */
  heading: (loc: string) => string;
  /** Variation used in subheadings, e.g. "office space for rent in New Cairo" */
  variant: (loc: string) => string;
  /** Short label for cross-links, e.g. "for rent" */
  label: string;
}

export const DEALS: Record<DealSlug, Deal> = {
  rent: {
    slug: "rent",
    tx: "rent",
    heading: (loc) => `Offices for Rent in ${loc}`,
    variant: (loc) => `office space for rent in ${loc}`,
    label: "for rent",
  },
  buy: {
    slug: "buy",
    tx: "sale",
    heading: (loc) => `Offices for Sale in ${loc}`,
    variant: (loc) => `office space for sale in ${loc}`,
    label: "for sale",
  },
  "income-property": {
    slug: "income-property",
    tx: "income-property",
    heading: (loc) => `Income Properties for Sale in ${loc}`,
    variant: (loc) => `leased office space for sale in ${loc}`,
    label: "as income properties",
  },
};
export const DEAL_SLUGS = Object.keys(DEALS) as DealSlug[];

export interface LandingLocation {
  slug: string;
  name: string;
  /** Where in the area the offices are, using the names searchers use. */
  within: string | null;
}

const WITHIN: Record<string, string> = {
  "new-cairo": "the Fifth Settlement (Tagamoa) and along 90th Street",
};

export const LANDING_LOCATIONS: LandingLocation[] = Object.values(LOCATION_CONTENT).map((l) => ({
  slug: l.slug,
  name: l.displayName,
  within: WITHIN[l.slug] ?? null,
}));

export const landingPath = (deal: DealSlug, locSlug: string) => `/${deal}/${locSlug}`;

/** The fields the copy and eligibility need. */
export interface LandingListing {
  id: number;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  area_sqm?: number | null;
  project?: string | null;
  furnishing?: string | null;
  location?: string | null;
  transaction_type?: string | null;
  rental_status?: string | null;
}

export function landingRows<T extends LandingListing>(all: T[], deal: DealSlug, locName: string): T[] {
  return all.filter(
    (l) => l.transaction_type === DEALS[deal].tx && l.location === locName && l.rental_status !== "rented",
  );
}

/** Pages that currently have enough stock, biggest first. */
export function eligibleLandingPages(all: LandingListing[]): Array<{ deal: DealSlug; loc: LandingLocation; count: number; path: string }> {
  const out: Array<{ deal: DealSlug; loc: LandingLocation; count: number; path: string }> = [];
  for (const loc of LANDING_LOCATIONS) {
    for (const deal of DEAL_SLUGS) {
      const count = landingRows(all, deal, loc.name).length;
      if (count >= LANDING_MIN_UNITS) out.push({ deal, loc, count, path: landingPath(deal, loc.slug) });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

// ---------- stats from live data ----------

const quantile = (sorted: number[], q: number) => {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.min(lo + 1, sorted.length - 1)] - sorted[lo]) * (i - lo);
};
const roundNice = (n: number) => {
  const step = n >= 1_000_000 ? 100_000 : n >= 100_000 ? 10_000 : n >= 10_000 ? 1_000 : n >= 1_000 ? 50 : 10;
  return Math.round(n / step) * step;
};
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M` : fmt(roundNice(n));

const CONDITION_LABELS: Record<string, string> = {
  "core-shell": "core & shell",
  "semi-finished": "semi-finished",
  finished: "finished",
  "fully-finished": "fully finished",
  furnished: "furnished",
  serviced: "serviced",
};

const titleCase = (s: string) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

export interface LandingStats {
  count: number;
  areaMin: number;
  areaMax: number;
  /** EGP-priced units only: per m² (monthly for rent), 25th / 50th / 75th percentile */
  perSqm: [number, number, number] | null;
  /** EGP-priced units only: total (monthly for rent), 25th / 75th percentile */
  total: [number, number] | null;
  egpCount: number;
  usdCount: number;
  projects: string[];
  conditions: Array<[string, number]>;
  sizeBands: Array<[string, number]>;
}

export function landingStats(rows: LandingListing[], locName: string): LandingStats {
  const areas = rows.map((r) => Number(r.area_sqm) || 0).filter((a) => a > 0).sort((a, b) => a - b);
  const egp = rows.filter((r) => (r.currency ?? "EGP") !== "USD" && Number(r.price) > 0);
  const perSqm = egp
    .filter((r) => Number(r.area_sqm) > 0)
    .map((r) => Number(r.price) / Number(r.area_sqm))
    .sort((a, b) => a - b);
  const totals = egp.map((r) => Number(r.price)).sort((a, b) => a - b);

  const locNames = new Set(LANDING_LOCATIONS.map((l) => l.name.toLowerCase()));
  const projectCounts = new Map<string, { name: string; n: number }>();
  for (const r of rows) {
    const raw = (r.project ?? "").trim();
    const key = raw.toLowerCase();
    if (!raw || locNames.has(key) || key === locName.toLowerCase()) continue;
    // Prefer a spelling someone capitalised; short lowercase names are acronyms ("cfc" -> "CFC").
    const display = /[A-Z]/.test(raw) ? raw : raw.length <= 4 ? raw.toUpperCase() : titleCase(raw);
    const cur = projectCounts.get(key) ?? { name: display, n: 0 };
    if (!/[A-Z]/.test(cur.name.slice(1)) && /[A-Z]/.test(raw)) cur.name = raw;
    cur.n++;
    projectCounts.set(key, cur);
  }
  const projects = Array.from(projectCounts.values()).filter((p) => p.n >= 2).sort((a, b) => b.n - a.n).slice(0, 6).map((p) => p.name);

  const condCounts = new Map<string, number>();
  for (const r of rows) {
    const label = r.furnishing ? CONDITION_LABELS[r.furnishing] : undefined;
    if (label) condCounts.set(label, (condCounts.get(label) ?? 0) + 1);
  }
  const bands: Array<[string, (a: number) => boolean]> = [
    ["under 100 m²", (a) => a < 100],
    ["100–300 m²", (a) => a >= 100 && a < 300],
    ["300–1,000 m²", (a) => a >= 300 && a < 1000],
    ["1,000 m² and above", (a) => a >= 1000],
  ];

  return {
    count: rows.length,
    areaMin: areas[0] ?? 0,
    areaMax: areas[areas.length - 1] ?? 0,
    perSqm: perSqm.length >= 3 ? [quantile(perSqm, 0.25), quantile(perSqm, 0.5), quantile(perSqm, 0.75)] : null,
    total: totals.length >= 3 ? [quantile(totals, 0.25), quantile(totals, 0.75)] : null,
    egpCount: egp.length,
    usdCount: rows.filter((r) => r.currency === "USD").length,
    projects,
    conditions: Array.from(condCounts).sort((a, b) => b[1] - a[1]),
    sizeBands: bands.map(([label, test]) => [label, areas.filter(test).length] as [string, number]).filter(([, n]) => n > 0),
  };
}

// ---------- copy ----------

export interface LandingCopy {
  title: string;
  description: string;
  h1: string;
  intro: string[];
  listHeading: string;
  faqs: Array<{ question: string; answer: string }>;
}

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export function landingCopy(dealSlug: DealSlug, loc: LandingLocation, s: LandingStats): LandingCopy {
  const deal = DEALS[dealSlug];
  const h1 = deal.heading(loc.name);
  const rent = deal.tx === "rent";
  const perUnit = rent ? "per m² per month" : "per m²";
  const where = loc.within ? `, in ${loc.within}` : "";
  const sizes = s.areaMin && s.areaMax ? `from ${fmt(s.areaMin)} to ${fmt(s.areaMax)} m²` : "in a range of sizes";
  const kind = dealSlug === "income-property" ? "leased, income-generating offices" : "administrative offices";

  const priceLine = s.perSqm
    ? rent
      ? `Typical asking rent is EGP ${fmt(roundNice(s.perSqm[0]))}–${fmt(roundNice(s.perSqm[2]))} ${perUnit} (median EGP ${fmt(roundNice(s.perSqm[1]))}).`
      : `Typical asking prices are EGP ${fmtMoney(s.perSqm[0])}–${fmtMoney(s.perSqm[2])} ${perUnit} (median EGP ${fmtMoney(s.perSqm[1])}).`
    : "";

  const intro = [
    `Browse ${s.count} ${kind} ${deal.label === "as income properties" ? "for sale" : deal.label} in ${loc.name}${where}. Office space ${sizes}, updated as units are listed, ${rent ? "rented" : "sold"} or withdrawn.`,
    [priceLine, s.usdCount ? `${s.usdCount} of the units are priced in USD.` : ""].filter(Boolean).join(" "),
    s.projects.length ? `Most of the available ${deal.variant(loc.name)} is in ${list(s.projects)}.` : "",
    s.conditions.length
      ? `Units are offered ${list(s.conditions.map(([c, n]) => `${c} (${n})`))}. Book a viewing on any listing, or ask PLACES for a shortlist that fits your size and budget.`
      : "Book a viewing on any listing, or ask PLACES for a shortlist that fits your size and budget.",
  ].filter(Boolean);

  const faqs: LandingCopy["faqs"] = [];
  if (s.perSqm) {
    const example = rent ? 200 : 150;
    faqs.push({
      question: rent ? `How much does it cost to rent an office in ${loc.name}?` : `How much does an office cost in ${loc.name}?`,
      answer:
        `Across the ${s.egpCount} EGP-priced ${rent ? "offices for rent" : "units"} in ${loc.name} listed on PLACES, the middle half are priced at EGP ` +
        (rent
          ? `${fmt(roundNice(s.perSqm[0]))}–${fmt(roundNice(s.perSqm[2]))} ${perUnit}, so a ${example} m² office typically rents for about EGP ${fmtMoney(s.perSqm[0] * example)}–${fmtMoney(s.perSqm[2] * example)} a month.`
          : `${fmtMoney(s.perSqm[0])}–${fmtMoney(s.perSqm[2])} ${perUnit}, so a ${example} m² office typically costs about EGP ${fmtMoney(s.perSqm[0] * example)}–${fmtMoney(s.perSqm[2] * example)}.`) +
        " Prices depend on the project, floor, finishing and size.",
    });
  }
  if (s.sizeBands.length) {
    faqs.push({
      question: `What sizes of office space are available ${deal.label === "as income properties" ? "for sale" : deal.label} in ${loc.name}?`,
      answer: `Units range ${sizes}: ${list(s.sizeBands.map(([b, n]) => `${n} ${b}`))}.`,
    });
  }
  if (s.projects.length) {
    faqs.push({
      question: `Which projects have ${rent ? "offices for rent" : "offices for sale"} in ${loc.name}?`,
      answer: `The most listings right now are in ${list(s.projects)}. Each listing page shows the project, floor, finishing and price.`,
    });
  }
  faqs.push({
    question: `How do I ${rent ? "rent" : "buy"} an office in ${loc.name} through PLACES?`,
    answer: `Open any listing and choose "Book a viewing", or contact PLACES with your size, budget and move-in date and we'll send a shortlist of matching ${deal.variant(loc.name)}.`,
  });

  return {
    title: `${h1} | ${s.count} Available | PLACES`,
    description: `${s.count} ${kind} ${deal.label === "as income properties" ? "for sale" : deal.label} in ${loc.name}, ${sizes}.${priceLine ? ` ${priceLine}` : ""} Book a viewing with PLACES.`.slice(0, 300),
    h1,
    intro,
    listHeading: `${titleCase(deal.variant(loc.name)).replace(/ In /, " in ").replace(/ For /, " for ")} (${s.count})`,
    faqs,
  };
}

// ---------- deal hubs: /rent, /buy, /income-property (all of Cairo) ----------

const CAIRO: LandingLocation = { slug: "", name: "Cairo", within: null };

/** Available units of one deal type across every PLACES location. */
export function hubRows<T extends LandingListing>(all: T[], deal: DealSlug): T[] {
  return LANDING_LOCATIONS.flatMap((loc) => landingRows(all, deal, loc.name));
}

export interface HubArea {
  loc: LandingLocation;
  count: number;
  /** Median EGP price per m² (monthly for rent); null when too few EGP-priced units. */
  median: number | null;
  /** The area's /{deal}/{loc} page when it has enough stock, else its area guide. */
  path: string;
}

export interface HubCopy extends LandingCopy {
  areas: HubArea[];
  /** Short line describing an area's median, e.g. "median EGP 1,300 per m² per month". */
  medianLabel: (median: number) => string;
}

export function hubCopy(dealSlug: DealSlug, all: LandingListing[]): HubCopy {
  const rows = hubRows(all, dealSlug);
  const base = landingCopy(dealSlug, CAIRO, landingStats(rows, CAIRO.name));
  const rent = DEALS[dealSlug].tx === "rent";
  const eligible = new Set(eligibleLandingPages(all).filter((p) => p.deal === dealSlug).map((p) => p.loc.slug));
  const areas = LANDING_LOCATIONS.map((loc) => {
    const locRows = landingRows(all, dealSlug, loc.name);
    const s = landingStats(locRows, loc.name);
    return {
      loc,
      count: locRows.length,
      median: s.perSqm ? s.perSqm[1] : null,
      path: eligible.has(loc.slug) ? landingPath(dealSlug, loc.slug) : `/locations/${loc.slug}`,
    };
  })
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count);
  const kind = dealSlug === "income-property" ? "leased offices for sale" : rent ? "offices for rent" : "offices for sale";
  const areaNames = areas.slice(0, 3).map((a) => a.loc.name);
  return {
    ...base,
    // Search snippets cut at ~155 characters.
    description: `${rows.length} ${kind} across ${areas.length > 3 ? `${areaNames.join(", ")} and more` : list(areaNames)}. Compare prices per m², sizes and finishing${rent ? ", with free tenant representation" : ""}.`.slice(0, 158),
    areas,
    medianLabel: (m) => (rent ? `median EGP ${fmt(roundNice(m))} per m² a month` : `median EGP ${fmtMoney(m)} per m²`),
  };
}
