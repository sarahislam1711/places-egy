// Weekly SEO regression check for the live site (no browser needed, Node 18+).
//   node scripts/seo-check.mjs [base-url]
// Checks: robots.txt, sitemap sizes, a sample of sitemap URLs (200, indexable,
// self-canonical, title, one H1) and that known 301 redirects still work.
// Exits 1 when anything fails.
const BASE = (process.argv[2] || "https://places-egy.com").replace(/\/$/, "");
const MIN = { static: 50, locations: 8, listings: 400, blog: 30 }; // roughly 70% of Nov 2026 counts
const SAMPLE = 60;
const REDIRECTS = [
  ["/blog/where-to-buy-office-cairo-guide", "/blog/offices-for-sale-new-cairo"],
  ["/resources/blog/where-to-buy-office-cairo-guide", "/blog/offices-for-sale-new-cairo"],
  ["/developers/palm-hills-1", "/developers/palm-hills"],
  ["/ar/blog/office-investment-yield-new-cairo", "/blog/office-investment-yield-new-cairo"],
  ["/blog/", "/blog"],
];

const fails = [];
const ok = (m) => console.log(`ok   ${m}`);
const bad = (m) => { fails.push(m); console.log(`FAIL ${m}`); };
const get = (u, o = {}) => fetch(u, { headers: { "user-agent": "places-seo-check" }, signal: AbortSignal.timeout(20000), ...o });
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const safeDecode = (s) => { try { return decodeURI(s); } catch { return s; } };

// 1. robots.txt
{
  const t = await (await get(`${BASE}/robots.txt`)).text();
  /^Disallow:\s*\/\s*$/m.test(t.split(/User-agent: GPTBot/)[0]) ? bad("robots.txt blocks the whole site") : ok("robots.txt does not block the site");
  /^Sitemap:\s*\S+/m.test(t) ? ok("robots.txt lists the sitemap") : bad("robots.txt has no Sitemap line");
  /^Disallow:\s*\/dashboard/m.test(t) ? ok("robots.txt keeps /dashboard private") : bad("robots.txt no longer disallows /dashboard");
}

// 2. sitemaps
const urls = [];
{
  const idx = await get(`${BASE}/sitemap.xml`);
  if (!idx.ok) bad(`sitemap.xml returned ${idx.status}`);
  else {
    for (const child of locs(await idx.text())) {
      const name = (child.match(/sitemap-([a-z]+)\.xml/) || [])[1];
      const r = await get(child.replace(/^https?:\/\/[^/]+/, BASE));
      if (!r.ok) { bad(`${child} returned ${r.status}`); continue; }
      const list = locs(await r.text());
      const min = MIN[name] ?? 1;
      list.length >= min ? ok(`${name} sitemap: ${list.length} URLs`) : bad(`${name} sitemap has ${list.length} URLs (expected at least ${min})`);
      urls.push(...list);
    }
  }
}

// 3. sample of URLs, deterministic per day so a re-run checks the same pages
{
  const day = Math.floor(Date.now() / 864e5);
  const pick = [...urls].sort((a, b) => ((a.length * 31 + day) % 97) - ((b.length * 31 + day) % 97)).slice(0, SAMPLE);
  for (const u of ["/", "/listings", "/blog", "/ar/blog", "/contact"]) pick.push(BASE + u);
  let good = 0;
  for (const u of new Set(pick)) {
    const url = u.replace(/^https?:\/\/[^/]+/, BASE);
    try {
      const r = await get(url, { redirect: "manual" });
      const html = r.status === 200 ? await r.text() : "";
      const probs = [];
      if (r.status !== 200) probs.push(`status ${r.status}`);
      else {
        if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) || /noindex/i.test(r.headers.get("x-robots-tag") || "")) probs.push("noindex");
        const canon = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1];
        if (!canon) probs.push("no canonical");
        else if (safeDecode(canon).replace(/\/$/, "") !== safeDecode(url).replace(/\/$/, "").replace(BASE, "https://places-egy.com")) probs.push(`canonical points to ${canon}`);
        const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
        if (title.trim().length < 10) probs.push("title missing or too short");
        const h1 = (html.match(/<h1[\s>]/gi) || []).length;
        if (h1 !== 1) probs.push(`${h1} H1 tags`);
      }
      probs.length ? bad(`${url}: ${probs.join(", ")}`) : good++;
    } catch (e) {
      bad(`${url}: ${e.message}`);
    }
  }
  ok(`${good} of ${new Set(pick).size} sampled pages passed`);
}

// 4. redirects
for (const [from, to] of REDIRECTS) {
  const r = await get(BASE + from, { redirect: "manual" });
  const loc = (r.headers.get("location") || "").replace(/^https?:\/\/[^/]+/, "");
  r.status === 301 && loc === to ? ok(`301 ${from} → ${to}`) : bad(`${from}: expected 301 → ${to}, got ${r.status} → ${loc || "(none)"}`);
}

console.log(fails.length ? `\n${fails.length} problem(s)` : "\nAll SEO checks passed");
process.exitCode = fails.length ? 1 : 0;
