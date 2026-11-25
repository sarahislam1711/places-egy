// Weekly "crawler view" check: loads every page in the static, location and
// blog sitemaps the way AI crawlers do (no JavaScript) and flags pages that
// show almost no text. On 2026-11-25, 23 of 72 pages (all guides, services,
// hubs) showed only ~120 words of menu and footer because their content was
// rendered in the browser only; this keeps that from quietly coming back.

const SITE = "https://places-egy.com";
const UA = "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)";
const SITEMAPS = ["/sitemap-static.xml", "/sitemap-locations.xml", "/sitemap-blog.xml"];
/** Fewer words than this (menu + footer alone are ~120) means the content isn't in the HTML. /contact (~210) and /services (~260) are short by design. */
export const MIN_CRAWLER_WORDS = 200;
const CONCURRENCY = 8;
const DEADLINE_MS = 20_000;

export interface CrawlerViewResult {
  checked: number;
  thin: Array<{ path: string; words: number; status: number }>;
  /** True when the time limit cut the run short (results are partial). */
  partial: boolean;
}

// Fetch from this server directly (faster, no Cloudflare) when we know its port.
function base(): string {
  return process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : SITE;
}

async function get(url: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(8000) });
  return { status: res.status, text: await res.text() };
}

export function visibleWords(html: string): number {
  const body = html.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");
  return body.split(/\s+/).filter(Boolean).length;
}

export async function checkCrawlerView(): Promise<CrawlerViewResult | null> {
  const started = Date.now();
  try {
    const paths = new Set<string>();
    for (const sm of SITEMAPS) {
      const { status, text } = await get(base() + sm);
      if (status !== 200) continue;
      for (const m of Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g))) paths.add(m[1].replace(SITE, "") || "/");
    }
    const queue = Array.from(paths);
    const thin: CrawlerViewResult["thin"] = [];
    let checked = 0;
    let partial = false;
    const worker = async () => {
      while (queue.length) {
        if (Date.now() - started > DEADLINE_MS) {
          partial = true;
          return;
        }
        const path = queue.shift()!;
        try {
          const { status, text } = await get(base() + path);
          const words = status === 200 ? visibleWords(text) : 0;
          if (status !== 200 || words < MIN_CRAWLER_WORDS) thin.push({ path: decodeURI(path), words, status });
        } catch {
          thin.push({ path: decodeURI(path), words: 0, status: 0 });
        }
        checked++;
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    thin.sort((a, b) => a.words - b.words);
    return { checked, thin, partial };
  } catch (err) {
    console.warn("[crawler-check] failed:", (err as Error).message);
    return null;
  }
}
