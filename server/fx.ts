// USD → EGP exchange rate, one source of truth for the whole site.
//
// - auto rate: refreshed from a public rate API at most every REFRESH_MS,
//   lazily on request (no cron needed) and saved to `exchange_rates` so a
//   restart or a failed fetch keeps the last good value.
// - manual rate: set by the admin (dashboard → Exchange rate). When set it
//   wins until cleared — for days the bank/market rate brokers use differs.
// - Prices are never converted in the database; this rate only powers the
//   "≈ EGP" hint and filtering/sorting across currencies.
//
// Table: sql/listings-outdoor-and-fx.sql. Works without it (memory only).
import { supabaseAdmin } from "./supabase";

const PAIR = "USD_EGP";
const REFRESH_MS = 12 * 60 * 60 * 1000;
// Used only until the first successful fetch or DB read.
const FALLBACK_RATE = 56.09;
const API_URL = process.env.FX_API_URL || "https://open.er-api.com/v6/latest/USD";
// Sanity band: a fetched value outside it is ignored (API glitch, wrong pair).
const MIN_RATE = 10;
const MAX_RATE = 500;

export interface FxRate {
  rate: number;
  /** "auto" (API), "manual" (admin override) or "fallback" (nothing loaded yet). */
  kind: "auto" | "manual" | "fallback";
  /** When this value was fetched / set (ISO). */
  asOf: string | null;
  source: string | null;
  /** Latest API value, shown to the admin next to a manual override. */
  autoRate: number | null;
  autoAsOf: string | null;
}

type Row = {
  auto_rate: number | null;
  auto_source: string | null;
  auto_fetched_at: string | null;
  manual_rate: number | null;
  manual_set_at: string | null;
};

let row: Row | null = null;
let loadedFromDbAt = 0;
let refreshing: Promise<void> | null = null;
// After a failed fetch, wait before trying the rate API again.
let lastAttemptAt = 0;
const RETRY_MS = 10 * 60 * 1000;

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

async function readDb(): Promise<void> {
  if (!supabaseAdmin) return;
  const { data, error } = await supabaseAdmin
    .from("exchange_rates")
    .select("auto_rate,auto_source,auto_fetched_at,manual_rate,manual_set_at")
    .eq("pair", PAIR)
    .maybeSingle();
  if (error) {
    console.warn("[fx] exchange_rates read failed:", error.message);
    return;
  }
  if (data) {
    row = {
      auto_rate: num(data.auto_rate),
      auto_source: data.auto_source,
      auto_fetched_at: data.auto_fetched_at,
      manual_rate: num(data.manual_rate),
      manual_set_at: data.manual_set_at,
    };
  }
  loadedFromDbAt = Date.now();
}

async function fetchAuto(): Promise<void> {
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { rates?: Record<string, number>; time_last_update_utc?: string };
    const rate = Number(body.rates?.EGP);
    if (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) throw new Error(`implausible EGP rate ${body.rates?.EGP}`);
    const fetchedAt = new Date().toISOString();
    const source = new URL(API_URL).host;
    row = { ...(row ?? { manual_rate: null, manual_set_at: null }), auto_rate: rate, auto_source: source, auto_fetched_at: fetchedAt };
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("exchange_rates")
        .upsert({ pair: PAIR, auto_rate: rate, auto_source: source, auto_fetched_at: fetchedAt, updated_at: fetchedAt });
      if (error) console.warn("[fx] exchange_rates save failed:", error.message);
    }
  } catch (err) {
    console.warn("[fx] rate fetch failed; keeping the last good rate:", (err as Error).message);
  }
}

function current(): FxRate {
  const autoRate = row?.auto_rate ?? null;
  const autoAsOf = row?.auto_fetched_at ?? null;
  if (row?.manual_rate) {
    return { rate: row.manual_rate, kind: "manual", asOf: row.manual_set_at, source: "set by admin", autoRate, autoAsOf };
  }
  if (autoRate) {
    const placeholder = (row?.auto_source ?? "").startsWith("initial");
    return { rate: autoRate, kind: placeholder ? "fallback" : "auto", asOf: placeholder ? null : autoAsOf, source: row?.auto_source ?? null, autoRate, autoAsOf };
  }
  return { rate: FALLBACK_RATE, kind: "fallback", asOf: null, source: null, autoRate: null, autoAsOf: null };
}

/**
 * The rate to use now. Serves the cached value immediately and refreshes in
 * the background when it is older than REFRESH_MS (a visitor never waits on
 * the rate API except on a cold start).
 */
export async function getUsdEgpRate(): Promise<FxRate> {
  const stale = () => {
    // The migration seeds a placeholder row (auto_source "initial value…");
    // it's never a real fetched rate, so refresh it straight away.
    if (!row?.auto_source || row.auto_source.startsWith("initial")) return true;
    const at = row.auto_fetched_at ? Date.parse(row.auto_fetched_at) : 0;
    return Date.now() - at > REFRESH_MS;
  };
  if (!refreshing && (loadedFromDbAt === 0 || (stale() && Date.now() - lastAttemptAt > RETRY_MS))) {
    refreshing = (async () => {
      if (loadedFromDbAt === 0 || Date.now() - loadedFromDbAt > 60_000) await readDb();
      if (stale() && Date.now() - lastAttemptAt > RETRY_MS) {
        lastAttemptAt = Date.now();
        await fetchAuto();
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  if (!row && refreshing) await refreshing; // cold start: wait once
  return current();
}

/** Admin override. `null` clears it and returns to the API rate. */
export async function setManualUsdEgpRate(rate: number | null): Promise<FxRate> {
  if (rate != null && (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE)) {
    throw new Error(`Rate must be between ${MIN_RATE} and ${MAX_RATE}`);
  }
  const setAt = new Date().toISOString();
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { error } = await supabaseAdmin
    .from("exchange_rates")
    .upsert({ pair: PAIR, manual_rate: rate, manual_set_at: rate == null ? null : setAt, updated_at: setAt });
  if (error) throw new Error(error.message);
  row = { ...(row ?? { auto_rate: null, auto_source: null, auto_fetched_at: null }), manual_rate: rate, manual_set_at: rate == null ? null : setAt };
  return current();
}
