// On-request HTML for pages whose content comes from the live inventory, so
// crawlers get real links and copy without waiting for a rebuild.
import { readFileSync, existsSync } from "fs";
import path from "path";
import { FURNISHING_OPTIONS, getEnumLabel } from "../../client/src/lib/enums";
import { areaLabel, cleanListingTitle, listingSnippet, rentedLabel } from "../../client/src/lib/listing-text";
import { extraAreaWord, outdoorAmount, totalPrice } from "../../client/src/lib/listing-pricing";
import { rankSimilar } from "../../client/src/lib/similar-listings";
import { LOCATION_CONTENT } from "../../client/src/lib/location-content";
import { breadcrumbSchema, faqSchema, itemListSchema, listingSchema } from "../../client/src/lib/schema";
import {
  DEVELOPERS_WITH_OWN_FAQ,
  developerInventory,
  developerRows,
  developersWithStock,
} from "../../client/src/lib/developer-inventory";
import {
  DEALS,
  LANDING_LOCATIONS,
  LANDING_MIN_UNITS,
  eligibleLandingPages,
  hubCopy,
  hubRows,
  landingCopy,
  landingProjects,
  medianLabel,
  landingPath,
  landingRows,
  landingStats,
  type DealSlug,
} from "../../client/src/lib/landing-pages";
import { landingFaqTopics, type RelatedLink } from "../../client/src/lib/landing-related";
import { TENANT_REP_PATH, tenantRepHtml } from "../../client/src/lib/tenant-rep-cta";
import { arabicPath, hasArabicTwin, localHref } from "../../client/src/lib/i18n";
import { CAIRO_AR, FAQ_TOPIC_LABELS_AR, areaCopyAr, dealHeadingAr, hubCopyAr, medianLabelAr, projectLineAr, unitsAr } from "../../client/src/lib/landing-pages-ar";
import { arabicListingTitle, areaAr } from "../../client/src/lib/listing-text-ar";
import { HOME_AR, SERVICES_AR } from "../../client/src/lib/home-ar";

// Service pages linked from the homepage's server render (crawlers had no
// path from / to any service page).
const SERVICE_LINKS = [
  { href: "/services/tenant-representation", name: "Tenant Representation", desc: "we represent companies, not landlords, when they lease an office. Free for tenants." },
  { href: "/services/primary-property", name: "Primary Property", desc: "buy an office directly from the developer." },
  { href: "/services/property-resale", name: "Property Resale", desc: "buy or sell an office on the resale market." },
  { href: "/services/investment-consultation", name: "Investment Consultation", desc: "advice on office investments, yields and risk." },
  { href: "/services/income-generating-property", name: "Income Generating Property", desc: "find and buy units with real tenant demand and a realistic rental yield." },
];

const LOCATIONS = Object.values(LOCATION_CONTENT);
import { arabicSkipNav, esc, injectBody, injectJsonLd, injectMeta, prerenderInner, type PageMeta } from "./html";
import { getInventory, type SeoListing } from "./data";

export const SITE = "https://places-egy.com";
export const PAGE_SIZE = 48;

let distPath = "";
const fileCache = new Map<string, string>();

export function setDistPath(p: string): void {
  distPath = p;
}

/** A built HTML file from dist/public (cached for the life of the process). */
export function builtFile(rel: string): string | null {
  if (fileCache.has(rel)) return fileCache.get(rel)!;
  const full = path.join(distPath, rel);
  if (!full.startsWith(distPath) || !existsSync(full)) return null;
  const html = readFileSync(full, "utf8");
  fileCache.set(rel, html);
  return html;
}

export function shell(): string {
  return builtFile("index.html") ?? "";
}

export function locationSlugFor(displayName: string | null): string | null {
  return LOCATIONS.find((l) => l.displayName === displayName)?.slug ?? null;
}

export function formatPrice(
  l: Pick<SeoListing, "price" | "currency" | "transaction_type"> &
    Partial<Pick<SeoListing, "price_per_meter" | "area_sqm" | "outdoor_area_sqm" | "outdoor_price_per_meter" | "outdoor_area_type" | "price_is_lump_sum">>,
): string {
  if (!l.price) return "Price on request";
  const cur = l.currency || "EGP";
  const per = l.transaction_type === "rent" ? " / month" : "";
  const amount = `${Number(l.price).toLocaleString("en-US")} ${cur}${per}`;
  // The extra area is charged separately (client/src/lib/listing-pricing.ts).
  const outdoor = outdoorAmount(l);
  if (!outdoor) return amount;
  return `${amount} + ${outdoor.toLocaleString("en-US")} ${cur} ${extraAreaWord(l)} (${Number(l.outdoor_area_sqm).toLocaleString("en-US")} m²) = ${totalPrice(l).toLocaleString("en-US")} ${cur}${per} total`;
}

export function listingTitle(l: Pick<SeoListing, "title">): string {
  return cleanListingTitle(l.title ?? "") || "Office listing";
}

function facts(l: SeoListing): string {
  return [
    l.location,
    l.area_sqm ? `${Number(l.area_sqm).toLocaleString("en-US")} m²` : null,
    l.furnishing ? getEnumLabel(FURNISHING_OPTIONS, l.furnishing) || l.furnishing : null,
    formatPrice(l),
    l.rental_status === "rented" ? "Rented" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function listingLinks(rows: SeoListing[]): string {
  if (rows.length === 0) return "<p>No listings available right now.</p>";
  return (
    "<ul>" +
    rows.map((l) => `<li><a href="${esc(l.path)}">${esc(listingTitle(l))}</a> <span>${esc(facts(l))}</span></li>`).join("") +
    "</ul>"
  );
}

function pagination(page: number, pages: number): string {
  if (pages <= 1) return "";
  const href = (n: number) => (n === 1 ? "/listings" : `/listings/page/${n}`);
  const items: string[] = [];
  if (page > 1) items.push(`<li><a href="${href(page - 1)}" rel="prev">Previous</a></li>`);
  for (let n = 1; n <= pages; n++) {
    items.push(n === page ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${href(n)}">${n}</a></li>`);
  }
  if (page < pages) items.push(`<li><a href="${href(page + 1)}" rel="next">Next</a></li>`);
  return `<nav aria-label="Listings pages"><ul>${items.join("")}</ul></nav>`;
}

const locationNav = () =>
  "<h2>Offices by location</h2><ul>" +
  LOCATIONS.map((l) => `<li><a href="/locations/${l.slug}">Offices in ${esc(l.displayName)}</a></li>`).join("") +
  "</ul>";

// "Offices for rent in New Cairo" etc.: keyword-anchored links to every live landing page.
function landingNav(inventory: SeoListing[], heading = "Popular searches"): string {
  const pages = eligibleLandingPages(inventory);
  if (!pages.length) return "";
  return (
    `<h2>${esc(heading)}</h2><ul>` +
    pages.map((p) => `<li><a href="${p.path}">${esc(DEALS[p.deal].heading(p.loc.name))}</a> (${p.count})</li>`).join("") +
    "</ul>"
  );
}

/** The live landing page for this listing's deal type and location, if there is one. */
export function landingFor(l: Pick<SeoListing, "transaction_type" | "location">, inventory: SeoListing[]): { path: string; heading: string } | null {
  const page = eligibleLandingPages(inventory).find((p) => DEALS[p.deal].tx === l.transaction_type && p.loc.name === l.location);
  return page ? { path: page.path, heading: DEALS[page.deal].heading(page.loc.name) } : null;
}

export async function renderLanding(dealSlug: string, locSlug: string): Promise<string | null> {
  if (!(dealSlug in DEALS)) return null;
  const deal = dealSlug as DealSlug;
  const loc = LANDING_LOCATIONS.find((l) => l.slug === locSlug);
  if (!loc) return null;
  const inventory = await getInventory();
  const rows = landingRows(inventory, deal, loc.name);
  if (rows.length < LANDING_MIN_UNITS) return null;

  const copy = landingCopy(deal, loc, landingStats(rows, loc.name));
  const pagePath = landingPath(deal, loc.slug);
  let html = injectMeta(shell(), { title: copy.title, description: copy.description, url: `${SITE}${pagePath}` });
  html = injectJsonLd(
    html,
    breadcrumbSchema([
      { name: "Home", url: SITE },
      { name: DEALS[deal].heading("Cairo"), url: `${SITE}/${deal}` },
      { name: copy.h1, url: `${SITE}${pagePath}` },
    ]),
  );
  html = injectJsonLd(html, itemListSchema({ name: copy.h1, url: pagePath, items: rows.slice(0, 48).map((l) => ({ name: listingTitle(l), url: l.path })) }));
  html = injectJsonLd(html, faqSchema(copy.faqs));

  const siblings = DEALS_FOR_LOCATION(inventory, loc.name).filter((p) => p.path !== pagePath);
  return injectBody(
    html,
    `<h1>${esc(copy.h1)}</h1>` +
      copy.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
      (deal === "rent" ? tenantRepHtml("rent", esc) : "") +
      projectsHtml(deal, loc.name, rows) +
      `<h2>${esc(copy.listHeading)}</h2>` +
      listingLinks(rows) +
      `<h2>${esc(`${copy.h1}: FAQs`)}</h2>` +
      copy.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("") +
      (siblings.length
        ? `<h2>More offices in ${esc(loc.name)}</h2><ul>${siblings.map((p) => `<li><a href="${p.path}">${esc(DEALS[p.deal].heading(loc.name))}</a></li>`).join("")}</ul>`
        : "") +
      `<p><a href="/${deal}">${esc(DEALS[deal].heading("Cairo"))}</a> · <a href="/locations/${loc.slug}">${esc(`${loc.name} area guide: projects, developers and market overview`)}</a></p>` +
      relatedList(`Questions to settle before you ${deal === "rent" ? "sign a lease" : "buy"}`, landingFaqTopics(deal)) +
      landingNav(inventory, "Other popular searches") +
      locationNav(),
  );
}

// /rent, /buy, /income-property: every available unit of one deal type across
// Cairo, with a breakdown by area. Same copy as the React page (hubCopy).
export async function renderDealHub(dealSlug: string): Promise<string | null> {
  if (!(dealSlug in DEALS)) return null;
  const deal = dealSlug as DealSlug;
  const inventory = await getInventory();
  const rows = hubRows(inventory, deal);
  if (!rows.length) return null;
  const copy = hubCopy(deal, inventory);
  const path = `/${deal}`;
  let html = injectMeta(shell(), { title: copy.title, description: copy.description, url: `${SITE}${path}` });
  html = injectJsonLd(html, breadcrumbSchema([{ name: "Home", url: SITE }, { name: copy.h1, url: `${SITE}${path}` }]));
  html = injectJsonLd(html, itemListSchema({ name: copy.h1, url: path, items: rows.slice(0, 48).map((l) => ({ name: listingTitle(l), url: l.path })) }));
  html = injectJsonLd(html, faqSchema(copy.faqs));
  return injectBody(
    html,
    `<h1>${esc(copy.h1)}</h1>` +
      copy.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
      (deal === "rent" ? tenantRepHtml("rent", esc) : "") +
      `<h2>${esc(`${copy.h1} by area`)}</h2><ul>` +
      copy.areas
        .map((a) => `<li><a href="${a.path}">${esc(DEALS[deal].heading(a.loc.name))}</a>: ${a.count} available${a.median ? `, ${esc(copy.medianLabel(a.median))}` : ""}</li>`)
        .join("") +
      `</ul>` +
      `<h2>${esc(`Latest ${copy.h1.toLowerCase().replace(/ in cairo$/, "")}`)}</h2>` +
      listingLinks(rows.slice(0, 48)) +
      `<p><a href="/listings">Browse all ${inventory.length} listings</a></p>` +
      `<h2>${esc(`${copy.h1}: FAQs`)}</h2>` +
      copy.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("") +
      landingNav(inventory, "Other popular searches") +
      locationNav(),
  );
}

// Arabic twins of the deal hubs (/ar/rent …, 28 Nov): same live data, Arabic
// copy (hubCopyAr), lang="ar" dir="rtl" from the first byte, Arabic JSON-LD and
// the hidden crawler link list in Arabic. Links go to Arabic pages once live.
export async function renderDealHubAr(dealSlug: string): Promise<string | null> {
  if (!(dealSlug in DEALS)) return null;
  const deal = dealSlug as DealSlug;
  const inventory = await getInventory();
  const rows = hubRows(inventory, deal);
  if (!rows.length) return null;
  const copy = hubCopyAr(deal, inventory);
  const path = arabicPath(`/${deal}`);
  const ar = (enPath: string) => localHref(enPath, "ar");
  // Not switched on yet (not in AR_LIVE): reachable for review, but kept out of Google.
  const live = hasArabicTwin(`/${deal}`);
  let html = injectMeta(
    shell(),
    { title: copy.title, description: copy.description, url: `${SITE}${path}`, ...(live ? {} : { robots: "noindex, follow" }) },
    { lang: "ar" },
  );
  html = arabicSkipNav(html);
  html = injectJsonLd(html, breadcrumbSchema([{ name: "الرئيسية", url: `${SITE}${ar("/")}` }, { name: copy.h1, url: `${SITE}${path}` }]));
  html = injectJsonLd(html, itemListSchema({ name: copy.h1, url: path, items: rows.slice(0, 48).map((l) => ({ name: arabicListingTitle(l), url: l.path })) }));
  html = injectJsonLd(html, faqSchema(copy.faqs));
  return injectBody(
    html,
    `<h1>${esc(copy.h1)}</h1>` +
      copy.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
      (deal === "rent" ? tenantRepHtml("rent", esc, "ar", ar(TENANT_REP_PATH)) : "") +
      `<h2>${esc(`${copy.h1} حسب المنطقة`)}</h2><ul>` +
      copy.areas
        .map((a) => `<li><a href="${ar(a.path)}">${esc(dealHeadingAr(deal, a.name))}</a>: ${esc(unitsAr(deal, a.count))}${a.median ? `، ${esc(medianLabelAr(deal, a.median))}` : ""}</li>`)
        .join("") +
      `</ul>` +
      `<h2>${esc(copy.listHeading)}</h2><ul>` +
      rows.slice(0, 48).map((l) => `<li><a href="${l.path}">${esc(arabicListingTitle(l))}</a></li>`).join("") +
      `</ul>` +
      `<p><a href="${ar("/listings")}">تصفح كل المكاتب المتاحة</a></p>` +
      `<h2>${esc(`أسئلة شائعة: ${copy.h1}`)}</h2>` +
      copy.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("") +
      `<h2>مكاتب أخرى في القاهرة</h2><ul>` +
      (Object.keys(DEALS) as DealSlug[])
        .filter((d) => d !== deal)
        .map((d) => `<li><a href="${ar(`/${d}`)}">${esc(dealHeadingAr(d, CAIRO_AR))}</a></li>`)
        .join("") +
      `</ul>`,
    "ar",
  );
}

// Arabic twins of the area pages (/ar/rent/new-cairo …, 29 Nov). Same rules as
// renderLanding (404 under the minimum stock), Arabic copy from areaCopyAr.
export async function renderLandingAr(dealSlug: string, locSlug: string): Promise<string | null> {
  if (!(dealSlug in DEALS)) return null;
  const deal = dealSlug as DealSlug;
  const loc = LANDING_LOCATIONS.find((l) => l.slug === locSlug);
  if (!loc) return null;
  const inventory = await getInventory();
  const rows = landingRows(inventory, deal, loc.name);
  if (rows.length < LANDING_MIN_UNITS) return null;

  const copy = areaCopyAr(deal, loc.slug, landingStats(rows, loc.name));
  const enPath = landingPath(deal, loc.slug);
  const path = arabicPath(enPath);
  const place = areaAr(loc.slug);
  const ar = (p: string) => localHref(p, "ar");
  const live = hasArabicTwin(enPath);
  let html = injectMeta(
    shell(),
    { title: copy.title, description: copy.description, url: `${SITE}${path}`, ...(live ? {} : { robots: "noindex, follow" }) },
    { lang: "ar" },
  );
  html = arabicSkipNav(html);
  html = injectJsonLd(
    html,
    breadcrumbSchema([
      { name: "الرئيسية", url: `${SITE}${ar("/")}` },
      { name: dealHeadingAr(deal, CAIRO_AR), url: `${SITE}${ar(`/${deal}`)}` },
      { name: copy.h1, url: `${SITE}${path}` },
    ]),
  );
  html = injectJsonLd(html, itemListSchema({ name: copy.h1, url: path, items: rows.slice(0, 48).map((l) => ({ name: arabicListingTitle(l), url: l.path })) }));
  html = injectJsonLd(html, faqSchema(copy.faqs));

  const projects = landingProjects(rows, loc.name);
  const siblings = DEALS_FOR_LOCATION(inventory, loc.name).filter((p) => p.path !== enPath);
  const txWord = deal === "rent" ? "مكاتب للإيجار" : deal === "buy" ? "مكاتب للبيع" : "عقارات مدرة للدخل";
  return injectBody(
    html,
    `<h1>${esc(copy.h1)}</h1>` +
      copy.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
      (deal === "rent" ? tenantRepHtml("rent", esc, "ar", ar(TENANT_REP_PATH)) : "") +
      (projects.length >= 2
        ? `<h2>${esc(`أكثر المشروعات بها ${txWord} في ${place}`)}</h2><ul>` +
          projects.map((p) => `<li>${esc(p.name)}: ${esc(projectLineAr(deal, p.count, p.median))}</li>`).join("") +
          `</ul>`
        : "") +
      `<h2>${esc(copy.listHeading)}</h2><ul>` +
      rows.slice(0, 48).map((l) => `<li><a href="${l.path}">${esc(arabicListingTitle(l))}</a></li>`).join("") +
      `</ul>` +
      `<h2>${esc(`أسئلة شائعة: ${copy.h1}`)}</h2>` +
      copy.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("") +
      (siblings.length
        ? `<h2>${esc(`مكاتب أخرى في ${place}`)}</h2><ul>${siblings.map((p) => `<li><a href="${ar(p.path)}">${esc(dealHeadingAr(p.deal, place))}</a></li>`).join("")}</ul>`
        : "") +
      `<p><a href="${ar(`/${deal}`)}">${esc(dealHeadingAr(deal, CAIRO_AR))}</a> · <a href="${ar(`/locations/${loc.slug}`)}">${esc(`دليل منطقة ${place}`)}</a></p>` +
      `<h2>${esc(deal === "rent" ? "قبل أن توقّع عقد الإيجار" : "قبل أن تشتري")}</h2><ul>` +
      landingFaqTopics(deal).map((t) => `<li><a href="${ar(t.path)}">${esc(FAQ_TOPIC_LABELS_AR[t.path.split("/").pop() ?? ""] ?? t.label)}</a></li>`).join("") +
      `</ul>`,
    "ar",
  );
}

// "Projects with the most offices for rent in New Cairo": live counts and medians.
function projectsHtml(deal: DealSlug, locName: string, rows: SeoListing[]): string {
  const projects = landingProjects(rows, locName);
  if (projects.length < 2) return "";
  const what = deal === "rent" ? "offices for rent" : deal === "buy" ? "offices for sale" : "income properties";
  return (
    `<h2>${esc(`Projects with the most ${what} in ${locName}`)}</h2><ul>` +
    projects.map((p) => `<li>${esc(p.name)}: ${p.count} available${p.median ? `, ${esc(medianLabel(deal, p.median))}` : ""}</li>`).join("") +
    `</ul>`
  );
}

function relatedList(heading: string, links: RelatedLink[]): string {
  if (!links.length) return "";
  return `<h2>${esc(heading)}</h2><ul>` + links.map((l) => `<li><a href="${l.path}">${esc(l.label)}</a></li>`).join("") + "</ul>";
}

const DEALS_FOR_LOCATION = (inventory: SeoListing[], locName: string) =>
  eligibleLandingPages(inventory).filter((p) => p.loc.name === locName);

export async function renderHome(): Promise<string> {
  const inventory = await getInventory();
  const html = shell();
  const latest = inventory.filter((l) => l.rental_status !== "rented").slice(0, 12);
  return injectBody(
    html,
    `<h1>Find Your Office in Egypt</h1>` +
      `<p>Buy, lease, or resell administrative offices across Cairo's top districts: New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton and Maadi.</p>` +
      `<h2>Latest offices</h2>${listingLinks(latest)}` +
      `<p><a href="/listings">Browse all ${inventory.length} listings</a></p>` +
      `<h2>Our services</h2><ul>` +
      SERVICE_LINKS.map((sv) => `<li><a href="${sv.href}">${esc(sv.name)}</a>: ${esc(sv.desc)}</li>`).join("") +
      `</ul>` +
      landingNav(inventory) +
      locationNav(),
  );
}

// Arabic home (/ar, 29 Nov): Arabic meta + FAQ JSON-LD, lang="ar" dir="rtl"
// from the first byte, and the same sections as the page in Arabic. Links go
// to Arabic pages where they're live, English ones until then.
export async function renderHomeAr(): Promise<string> {
  const inventory = await getInventory();
  const ar = (p: string) => localHref(p, "ar");
  const live = hasArabicTwin("/");
  let html = injectMeta(
    shell(),
    { title: HOME_AR.title, description: HOME_AR.description, url: `${SITE}/ar`, ...(live ? {} : { robots: "noindex, follow" }) },
    { lang: "ar" },
  );
  html = arabicSkipNav(html);
  html = injectJsonLd(html, faqSchema([...HOME_AR.faqs]));
  const latest = inventory.filter((l) => l.rental_status !== "rented").slice(0, 12);
  const areas = eligibleLandingPages(inventory);
  const { h1 } = HOME_AR;
  return injectBody(
    html,
    `<h1>${esc(h1.before + h1.accent + h1.after)}</h1>` +
      `<p>${esc(HOME_AR.subLong)}</p>` +
      `<h2>${esc(HOME_AR.newUnits)}</h2><ul>` +
      latest.map((l) => `<li><a href="${l.path}">${esc(arabicListingTitle(l))}</a></li>`).join("") +
      `</ul>` +
      `<p><a href="${ar("/rent")}">${esc(dealHeadingAr("rent", CAIRO_AR))}</a> · <a href="${ar("/buy")}">${esc(dealHeadingAr("buy", CAIRO_AR))}</a> · <a href="${ar("/income-property")}">${esc(dealHeadingAr("income-property", CAIRO_AR))}</a></p>` +
      `<h2>${esc(HOME_AR.servicesLong)}</h2><ul>` +
      SERVICES_AR.map((sv) => `<li><a href="${ar(sv.href)}">${esc(sv.title)}</a>: ${esc(sv.desc)}</li>`).join("") +
      `</ul>` +
      `<h2>${esc(HOME_AR.howTitle)}</h2><ol>` +
      HOME_AR.steps.map((st) => `<li><strong>${esc(st.title)}</strong>: ${esc(st.desc)}</li>`).join("") +
      `</ol>` +
      (areas.length
        ? `<h2>عمليات بحث شائعة</h2><ul>` +
          areas.map((p) => `<li><a href="${ar(p.path)}">${esc(dealHeadingAr(p.deal, areaAr(p.loc.slug)))}</a></li>`).join("") +
          `</ul>`
        : "") +
      `<h2>${esc(HOME_AR.locTitle)}</h2><p>${esc(HOME_AR.locSub)}</p><ul>` +
      LOCATIONS.map((loc) => `<li><a href="${ar(`/locations/${loc.slug}`)}">${esc(areaAr(loc.slug))}</a></li>`).join("") +
      `</ul>` +
      `<h2>${esc(HOME_AR.faqTitle)}</h2>` +
      HOME_AR.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("") +
      `<h2>${esc(HOME_AR.finalTitle)}</h2><p>${esc(HOME_AR.finalText)} <a href="${ar("/contact")}">${esc(HOME_AR.finalCta)}</a></p>`,
    "ar",
  );
}

export async function renderListingsIndex(page: number): Promise<string | null> {
  const inventory = await getInventory();
  const pages = Math.max(1, Math.ceil(inventory.length / PAGE_SIZE));
  if (page < 1 || page > pages) return null;
  const base = builtFile("listings.html") ?? shell();
  const rows = inventory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const meta: PageMeta =
    page === 1
      ? {
          title: "Office Listings in Egypt — All Available Offices | PLACES",
          description: `Browse ${inventory.length} administrative offices for rent and sale across New Cairo, Sheikh Zayed, 6th October, Maadi, Downtown and Sheraton.`,
          url: `${SITE}/listings`,
        }
      : {
          title: `Office Listings in Egypt — Page ${page} of ${pages} | PLACES`,
          description: `Office listings ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${inventory.length}: administrative offices for rent and sale in Egypt.`,
          url: `${SITE}/listings/page/${page}`,
        };
  return injectBody(
    injectMeta(base, meta),
    `<h1>Office Listings in Egypt${page > 1 ? ` — Page ${page}` : ""}</h1>` +
      `<p>${esc(meta.description)}</p>` +
      listingLinks(rows) +
      pagination(page, pages) +
      locationNav(),
  );
}

// The about paragraph's **bold** and ~~accent~~ markers, as plain emphasis.
function emphasis(text: string): string {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<strong>$1</strong>");
}

// The area guide copy visitors see on /locations/{slug} (about, at a glance,
// projects, why operators/investors choose it). Without it, crawlers saw only
// the heading and the listing count: 184 words on /locations/sheraton.
function locationGuide(loc: (typeof LOCATIONS)[number]): string {
  const card = (title: string, c: (typeof loc)["why"]["operators"]) =>
    `<h3>${esc(title)}: ${esc(c.headline)}</h3><p><strong>${esc(c.stat)}</strong> ${esc(c.statLabel)}</p>` +
    `<ul>${c.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  return (
    `<h2>About ${esc(loc.displayName)}</h2><p>${emphasis(loc.about)}</p>` +
    (loc.highlights?.length ? `<h3>${esc(loc.displayName)} at a glance</h3><ul>${loc.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : "") +
    (loc.projectsContext ? `<h2>Office projects in ${esc(loc.displayName)}</h2><p>${esc(loc.projectsContext)}</p>` : "") +
    (loc.developersContext ? `<p>${esc(loc.developersContext)}</p>` : "") +
    `<h2>Why companies choose ${esc(loc.displayName)}</h2>` +
    card("For operators", loc.why.operators) +
    card("For investors", loc.why.investors)
  );
}

export async function renderLocation(slug: string): Promise<string | null> {
  const loc = LOCATIONS.find((l) => l.slug === slug);
  const base = builtFile(`locations/${slug}.html`);
  if (!loc || !base) return null;
  const inventory = await getInventory();
  const rows = inventory.filter((l) => l.location === loc.displayName);
  const intro = prerenderInner(base) ?? `<h1>${esc(loc.h1)}</h1>`;
  const deals = DEALS_FOR_LOCATION(inventory, loc.displayName);
  const dealLinks = deals.length
    ? `<ul>${deals.map((p) => `<li><a href="${p.path}">${esc(DEALS[p.deal].heading(loc.displayName))}</a> (${p.count})</li>`).join("")}</ul>`
    : "";
  return injectBody(
    base,
    intro + dealLinks + locationGuide(loc) + tenantRepHtml("rent", esc) +
      `<h2>Available offices in ${esc(loc.displayName)} (${rows.length})</h2>` + listingLinks(rows) + locationNav(),
  );
}

export async function renderDeveloper(slug: string): Promise<string | null> {
  const base = builtFile(`developers/${slug}.html`);
  if (!base) return null;
  const inventory = await getInventory();
  const inv = developerInventory(slug, inventory);
  const rows = developerRows(inventory, slug);
  const intro = prerenderInner(base) ?? "";

  let units = `<h2>${esc(inv.count ? `${inv.name} offices available (${inv.count})` : `${inv.name} offices`)}</h2><p>${esc(inv.summary)}</p>`;
  if (rows.length) {
    units += listingLinks(rows);
    if (inv.landingLinks.length) {
      units += `<ul>${inv.landingLinks.map((l) => `<li><a href="${l.path}">${esc(l.heading)}</a></li>`).join("")}</ul>`;
    }
  } else {
    const others = developersWithStock(inventory, slug);
    units +=
      `<p><a href="/contact">Ask about ${esc(inv.name)} availability</a></p>` +
      (others.length
        ? `<h3>Developers with offices available now</h3><ul>${others.map((d) => `<li><a href="/developers/${d.slug}">${esc(d.name)}</a> (${d.count})</li>`).join("")}</ul>`
        : "");
  }

  const ownFaq = DEVELOPERS_WITH_OWN_FAQ.has(slug);
  const faqs = ownFaq
    ? ""
    : `<h2>${esc(inv.name)}: FAQs</h2>` + inv.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("");
  const html = injectBody(base, intro + units + faqs + locationNav());
  return ownFaq ? html : injectJsonLd(html, faqSchema(inv.faqs));
}

export function similarListings(l: SeoListing, all: SeoListing[], limit = 6): SeoListing[] {
  return rankSimilar(l, all, limit);
}

function descriptionParagraphs(markdown: string): string {
  const paras = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/^\s{0,3}(#{1,6}|[-*+]|\d+[.)])\s+/gm, "")
        .replace(/[*_`~>#|]+/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
  return paras.map((p) => `<p>${esc(p)}</p>`).join("");
}

export async function renderListing(l: SeoListing): Promise<string> {
  const all = await getInventory();
  const title = listingTitle(l);
  const condition = l.furnishing ? getEnumLabel(FURNISHING_OPTIONS, l.furnishing) || l.furnishing : null;
  const locSlug = locationSlugFor(l.location);
  const photo = (l.images ?? []).find(Boolean);
  const url = `${SITE}${l.path}`;

  const meta: PageMeta = {
    title: `${title} | PLACES`,
    description:
      listingSnippet(l.description ?? "") ||
      `${title}: ${[l.location, l.area_sqm ? `${l.area_sqm} m²` : null, formatPrice(l)].filter(Boolean).join(", ")}.`,
    url,
    image: photo,
  };

  const rows: Array<[string, string]> = [
    ["Price", esc(formatPrice(l))],
    ["Area", l.area_sqm ? esc(areaLabel(l)) : "On request"],
    ["Location", locSlug ? `<a href="/locations/${locSlug}">${esc(l.location ?? "")}</a>` : esc(l.location ?? "")],
    ...(l.location_area ? ([["Area / district", esc(l.location_area)]] as Array<[string, string]>) : []),
    ...(l.building_name?.trim() ? ([["Building", esc(l.building_name.trim())]] as Array<[string, string]>) : []),
    ...(l.street_name?.trim() ? ([["Street", esc(l.street_name.trim())]] as Array<[string, string]>) : []),
    ...(condition ? ([["Condition", esc(condition)]] as Array<[string, string]>) : []),
    ["Transaction", esc(l.transaction_type === "income-property" ? "Income property" : l.transaction_type === "sale" ? "For sale" : "For rent")],
    ...(l.rental_status === "rented" ? ([["Availability", esc(rentedLabel(l))]] as Array<[string, string]>) : []),
  ];

  const similar = similarListings(l, all);
  const landing = landingFor(l, all);
  const body =
    `<article><h1>${esc(title)}</h1>` +
    (photo ? `<img src="${esc(photo)}" alt="${esc(title)}" width="1200" height="800">` : "") +
    `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>` +
    (descriptionParagraphs(l.description ?? "") || `<p>${esc(meta.description)}</p>`) +
    `</article>` +
    (l.transaction_type === "rent" && l.rental_status !== "rented" ? tenantRepHtml("listing", esc) : "") +
    (landing ? `<p>See all <a href="${landing.path}">${esc(landing.heading)}</a></p>` : "") +
    (locSlug ? `<p><a href="/locations/${locSlug}">More offices in ${esc(l.location ?? "")}</a></p>` : "") +
    (similar.length ? `<h2>Similar units</h2>${listingLinks(similar)}` : "") +
    `<p><a href="/listings">Browse all listings</a></p>`;

  return injectBody(injectJsonLd(injectMeta(shell(), meta), listingSchema({ ...l, title })), body);
}

// 404 / 410 page: noindex, no canonical, with ways back into the site.
export function renderNotFound(kind: "404" | "410" = "404", lang: "en" | "ar" = "en"): string {
  if (lang === "ar" && kind === "404") {
    // Unknown /ar/ addresses (29 Nov): the same page in Arabic, right-to-left.
    const ar = (p: string) => localHref(p, "ar");
    const lead = "ربما نُقلت الصفحة أو كُتب الرابط بشكل خاطئ. ابحث عن مكتب أو تصفح المكاتب حسب المنطقة.";
    const html = arabicSkipNav(injectMeta(shell(), { title: "الصفحة غير موجودة | PLACES", description: lead, url: null, robots: "noindex, follow" }, { lang: "ar" }));
    return injectBody(
      html,
      `<h1>لم نجد هذه الصفحة</h1><p>${lead}</p>` +
        `<form action="/listings" method="get" role="search"><label for="q">ابحث عن مكتب</label> ` +
        `<input id="q" name="q" type="search" placeholder="المنطقة أو المشروع أو المطور"> <button type="submit">بحث</button></form>` +
        `<p><a href="${ar("/rent")}">${esc(dealHeadingAr("rent", CAIRO_AR))}</a> · <a href="${ar("/buy")}">${esc(dealHeadingAr("buy", CAIRO_AR))}</a></p>` +
        `<h2>المكاتب حسب المنطقة</h2><ul>` +
        LOCATIONS.map((l) => `<li><a href="${ar(`/locations/${l.slug}`)}">${esc(`مكاتب في ${areaAr(l.slug)}`)}</a></li>`).join("") +
        `</ul>`,
      "ar",
    );
  }
  const gone = kind === "410";
  const title = gone ? "This listing is no longer available | PLACES" : "Page not found | PLACES";
  const heading = gone ? "This listing is no longer available" : "We couldn't find that page";
  const lead = gone
    ? "The office you're looking for has been rented, sold or withdrawn. Similar spaces are available below."
    : "The page may have moved, or the link may be mistyped. Try a search or browse our offices.";
  const html = injectMeta(shell(), { title, description: lead, url: null, robots: "noindex, follow" });
  return injectBody(
    html,
    `<h1>${heading}</h1><p>${lead}</p>` +
      `<form action="/listings" method="get" role="search"><label for="q">Search offices</label> ` +
      `<input id="q" name="q" type="search" placeholder="Area, project or developer"> <button type="submit">Search</button></form>` +
      `<p><a href="/listings">Browse all listings</a></p>` +
      locationNav(),
  );
}
