// GET /api/health: for uptime monitors. 200 when everything works, 503 when
// the database or the exchange rate is broken. The CMS is reported but does
// not fail the check (the site still serves; only blog freshness suffers).
import type { Request, Response } from "express";
import { supabaseAdmin } from "./supabase";
import { getUsdEgpRate } from "./fx";
import { sendAdminAlert } from "./alerts";

const DAY = 24 * 60 * 60 * 1000;

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number; error?: string; value?: T }> {
  const t = Date.now();
  try {
    const value = await Promise.race([
      fn(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout 8s")), 8000)),
    ]);
    return { ok: true, ms: Date.now() - t, value };
  } catch (e: any) {
    return { ok: false, ms: Date.now() - t, error: String(e?.message ?? e) };
  }
}

export async function healthHandler(_req: Request, res: Response) {
  const [db, cms, fx] = await Promise.all([
    timed(async () => {
      if (!supabaseAdmin) throw new Error("Supabase not configured");
      const { error, count } = await supabaseAdmin.from("listings").select("id", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return count;
    }),
    timed(async () => {
      const r = await fetch("https://cms.places-egy.com/wp-json/wp/v2/posts?per_page=1", { signal: AbortSignal.timeout(7000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    }),
    timed(async () => {
      const r = await getUsdEgpRate();
      const age = r.asOf ? Date.now() - Date.parse(r.asOf) : Infinity;
      if (r.kind === "fallback") throw new Error("exchange rate is the built-in fallback");
      if (r.kind === "auto" && age > 3 * DAY) throw new Error(`auto rate is ${Math.round(age / DAY)} days old`);
      return { rate: r.rate, kind: r.kind, asOf: r.asOf };
    }),
  ]);
  const healthy = db.ok && fx.ok;
  if (!healthy) {
    void sendAdminAlert("health", "Health check failing", JSON.stringify({ db, fx, cms }, null, 2));
  }
  res.status(healthy ? 200 : 503).set("Cache-Control", "no-store").json({
    status: healthy ? "ok" : "failing",
    checkedAt: new Date().toISOString(),
    database: { ok: db.ok, ms: db.ms, error: db.error, listings: db.value },
    exchangeRate: { ok: fx.ok, ...(fx.value ?? {}), error: fx.error },
    cms: { ok: cms.ok, ms: cms.ms, error: cms.error },
  });
}
