// Page health check for places-egy.com with Playwright (run after each deploy).
//
//   npm i --no-save playwright@1.48.2 && npx playwright install chromium   # once
//   node scripts/page-health.mjs                        # live site, summary
//   node scripts/page-health.mjs http://localhost:3001  # a local build
//   node scripts/page-health.mjs https://places-egy.com --json > report.json
// Loads key pages on desktop and mobile and records, per page:
// HTTP status, console errors, page (JS) errors, failed requests, broken
// images, horizontal overflow, title / H1 / canonical / robots, duplicate
// JSON-LD, load timing, and feature checks for what shipped in Nov 2026.
import { chromium, devices } from "playwright";

const args = process.argv.slice(2);
const AS_JSON = args.includes("--json");
const BASE = (args.find((a) => !a.startsWith("--")) || "https://places-egy.com").replace(/\/$/, "");
const IGNORE_HOSTS = /google-analytics|googletagmanager|clarity\.ms|cloudflareinsights|doubleclick|facebook|calendly/;

async function listingPath(id) {
  const xml = await (await fetch(`${BASE}/sitemap-listings.xml`)).text();
  const m = xml.match(new RegExp(`<loc>https?://[^<]*?(/listings/${id}-[^<]+)</loc>`));
  return m ? m[1] : `/listings/${id}`;
}

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/listings", name: "Listings" },
  { path: "/listings/page/2", name: "Listings page 2" },
  { path: "/rent/new-cairo", name: "Rent New Cairo" },
  { path: "/buy/new-cairo", name: "Buy New Cairo" },
  { path: "/locations/new-cairo", name: "Location New Cairo" },
  { path: "/developers", name: "Developers" },
  { path: "/developers/palm-hills", name: "Developer Palm Hills" },
  { path: "/contact", name: "Contact", feature: "contactForm" },
  { path: "/guides/office-rental-prices-cairo-2026", name: "Guide rental prices" },
  { path: "/faqs", name: "FAQs" },
  { path: "/blog", name: "Blog hub" },
  { path: "/blog/core-and-shell-offices", name: "Blog post EN", feature: "blogCta" },
  { path: "/ar/blog", name: "Arabic blog hub" },
  { path: "/ar/blog/%d9%85%d8%a7-%d9%87%d9%88-%d8%a7%d9%84%d9%83%d9%88%d8%b1-%d8%a7%d9%86%d8%af-%d8%b4%d9%84", name: "Blog post AR", feature: "blogCta" },
  { id: 843, name: "Listing #843 (USD)", feature: "usd" },
  { id: 845, name: "Listing #845 (roof)", feature: "extraArea" },
  { id: 855, name: "Listing #855 (outdoor)", feature: "extraArea" },
  { path: "/zz-not-real-page", name: "Unknown page (expect 404)", expect: 404 },
];

const PROFILES = [
  { name: "desktop", options: { viewport: { width: 1366, height: 900 } } },
  { name: "mobile", options: { ...devices["Pixel 7"] } },
];

async function checkPage(context, page, profile) {
  const tab = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];
  tab.on("console", (m) => {
    // A page that is meant to 404 logs its own 404; that is not an error.
    if (m.type() === "error" && !(page.expect && /status of 404/.test(m.text()))) consoleErrors.push(m.text().slice(0, 200));
  });
  tab.on("pageerror", (e) => pageErrors.push(String(e.message || e).slice(0, 200)));
  tab.on("requestfailed", (r) => {
    if (!IGNORE_HOSTS.test(r.url())) failed.push(`FAILED ${r.failure()?.errorText} ${r.url().slice(0, 140)}`);
  });
  tab.on("response", (r) => {
    const s = r.status();
    if (s >= 400 && !IGNORE_HOSTS.test(r.url()) && r.request().resourceType() !== "document") failed.push(`${s} ${r.url().slice(0, 140)}`);
  });

  const url = BASE + page.path;
  const t0 = Date.now();
  let status = 0;
  try {
    const resp = await tab.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    status = resp?.status() ?? 0;
    await tab.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await tab.waitForTimeout(1500);
  } catch (e) {
    pageErrors.push("NAVIGATION " + String(e.message).slice(0, 160));
  }
  const loadMs = Date.now() - t0;

  const info = await tab
    .evaluate((feature) => {
      const q = (s) => Array.from(document.querySelectorAll(s));
      const ld = q('script[type="application/ld+json"]').map((s) => {
        try {
          const j = JSON.parse(s.textContent || "");
          return { type: j["@type"], id: j["@id"] || null };
        } catch {
          return { type: "PARSE_ERROR", id: null };
        }
      });
      const ids = ld.map((x) => x.id).filter(Boolean);
      const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
      const brokenImgs = q("img")
        .filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src") && !i.getAttribute("src").startsWith("data:"))
        .map((i) => i.getAttribute("src").slice(0, 120));
      const nav = performance.getEntriesByType("navigation")[0];
      const lcp = (window.__lcp || 0);
      const text = document.body.innerText;
      const features = {};
      if (feature === "contactForm") features.contactForm = !!document.getElementById("requirements") && !!document.querySelector("#requirements button[type=submit], #requirements button");
      if (feature === "blogCta") features.blogCta = /Looking for an office now\?|بتدور على مكتب دلوقتي/.test(text) && !!document.querySelector('a[href*="wa.me"][href*="text="]');
      if (feature === "usd") features.usdPrice = /USD\s*\/\s*month/.test(text) && /≈\s*EGP/.test(text);
      if (feature === "extraArea") features.extraArea = /m²\s*(outdoor|roof|terrace|garden)/i.test(text);
      return {
        title: document.title,
        h1: q("h1").map((h) => h.innerText.trim().slice(0, 80)),
        canonical: document.querySelector('link[rel="canonical"]')?.href || null,
        robots: document.querySelector('meta[name="robots"]')?.content || null,
        lang: document.documentElement.lang,
        ldTypes: ld.map((x) => (Array.isArray(x.type) ? x.type.join("+") : x.type)),
        dupLdIds: Array.from(new Set(dupIds)),
        brokenImgs,
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
        lcpMs: lcp ? Math.round(lcp) : null,
        transferKB: Math.round(performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) / 1024 + (nav?.transferSize || 0) / 1024),
        features,
      };
    }, page.feature)
    .catch((e) => ({ evalError: String(e.message).slice(0, 160) }));

  await tab.close();

  const problems = [];
  const expect = page.expect ?? 200;
  if (status !== expect) problems.push(`status ${status} (expected ${expect})`);
  if (pageErrors.length) problems.push(`${pageErrors.length} JS error(s)`);
  if (consoleErrors.length) problems.push(`${consoleErrors.length} console error(s)`);
  if (failed.length) problems.push(`${failed.length} failed request(s)`);
  if (info.brokenImgs?.length) problems.push(`${info.brokenImgs.length} broken image(s)`);
  if (profile === "mobile" && info.overflowX > 2) problems.push(`scrolls sideways by ${info.overflowX}px on mobile`);
  if (expect === 200) {
    if (!info.h1 || info.h1.length !== 1) problems.push(`${info.h1?.length ?? 0} H1s`);
    if (!info.canonical) problems.push("no canonical");
    if (/noindex/.test(info.robots || "")) problems.push("noindex");
    if (info.dupLdIds?.length) problems.push(`duplicate JSON-LD: ${info.dupLdIds.join(", ")}`);
    if (info.ldTypes?.includes("PARSE_ERROR")) problems.push("invalid JSON-LD");
  }
  for (const [k, v] of Object.entries(info.features || {})) if (!v) problems.push(`feature missing: ${k}`);

  return { name: page.name, url, profile, status, loadMs, ...info, consoleErrors, pageErrors, failed: Array.from(new Set(failed)), problems };
}

const browser = await chromium.launch();
for (const p of PAGES) if (p.id) p.path = await listingPath(p.id);
const results = [];
for (const prof of PROFILES) {
  const context = await browser.newContext({ ...prof.options, locale: "en-US", timezoneId: "Africa/Cairo" });
  await context.addInitScript(() => {
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
  });
  for (const page of PAGES) results.push(await checkPage(context, page, prof.name));
  await context.close();
}
await browser.close();
if (AS_JSON) {
  console.log(JSON.stringify(results, null, 1));
} else {
  for (const r of results) {
    const flag = r.problems.length ? "FAIL" : "ok  ";
    console.log(`${flag} ${r.profile.padEnd(7)} ${String(r.status).padEnd(3)} ${String(r.loadMs).padStart(6)}ms  ${r.name.padEnd(30)} ${r.problems.join("; ")}`);
  }
  const bad = results.filter((r) => r.problems.length).length;
  console.log(`\n${results.length - bad}/${results.length} page loads healthy`);
  process.exitCode = bad ? 1 : 0;
}
