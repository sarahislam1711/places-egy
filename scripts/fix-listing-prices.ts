// Price/currency fixes found on 2026-11-19 (see listing-data-issues.csv).
// Needs sql/listings-outdoor-and-fx.sql applied first (outdoor_area_sqm).
//
// Dry run by default. --apply writes and saves a backup; --revert <file>
// restores it. A row is skipped if its current value no longer matches
// `from` (someone edited it since). updated_at is left alone.
//
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts --apply
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts --revert listing-prices-backup-<ts>.json
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

type Field = "currency" | "area_sqm" | "outdoor_area_sqm" | "outdoor_price_per_meter" | "outdoor_area_type" | "price" | "price_is_lump_sum";
type Fix = { id: number; field: Field; from: number | string | boolean | null; to: number | string | boolean; why: string };

// USD amounts saved as EGP: in every case the description's USD rate × area
// equals the stored price exactly, so only the currency is wrong.
const usd = (id: number, why: string): Fix => ({ id, field: "currency", from: "EGP", to: "USD", why });

// Extra area: type + size, and its price per m² when the description states one.
function extra(id: number, type: string, area: number, rate: number | null, why: string): Fix[] {
  const out: Fix[] = [
    { id, field: "outdoor_area_type", from: null, to: type, why },
    { id, field: "outdoor_area_sqm", from: null, to: area, why },
  ];
  if (rate != null) out.push({ id, field: "outdoor_price_per_meter", from: null, to: rate, why: `${why} (rate as stated)` });
  return out;
}

const FIXES: Fix[] = [
  usd(844, "description USD 36/m² × 450 m² = 16,200"),
  usd(843, "description $45/m², \"Monthly Rent: $20,250\" = 45 × 450"),
  usd(830, "description USD 52/m² × 403 m² = 20,956"),
  usd(802, "description USD 34/m² × 2,270 m² = 77,180 (outdoor 790 m² at USD 12 not in the price)"),
  usd(688, "description USD 40/m² × 500 m² = 20,000"),
  usd(685, "description USD 25/m² × 500 m² = 12,500"),
  usd(669, "description USD 40/m² × 500 m² = 20,000"),
  usd(641, "description USD 45/m² × 148 m² = 6,660"),
  usd(332, "description USD 40/m² × 800 m² = 32,000"),
  usd(316, "description USD 45/m² × 660 m² = 29,700"),
  usd(429, "description USD 40/m² × 378 m² = 15,120"),
  usd(434, "description USD 30/m² × 60 m² = 1,800"),
  usd(250, "description USD 28/m² × 1,424 m² = 39,872"),
  usd(244, "description USD 18/m² × 1,160 m² = 20,880 (stored 20,990)"),

  // Extra-area rules (agreed 2026-11-19, client/src/lib/listing-pricing.ts):
  // price = indoor only; the extra area (outdoor/roof/terrace/garden) is
  // shown separately with its own price per m², entered freely per listing.
  // Rates are set here only where the description states one; the others
  // are listed below for the team to enter in the admin.
  ...extra(855, "outdoor", 350, null, "description: Outdoor Area 350 SQM"),
  { id: 855, field: "area_sqm", from: 350, to: 650, why: "description: Indoor Area 650 SQM" },
  { id: 855, field: "price", from: 385000, to: 715000, why: "description rate EGP 1,100 × 650 m² indoor (was 1,100 × 350)" },

  // #845: price 863,000 = 1,000 × 721 + 500 × 284 (roof folded into the price).
  ...extra(845, "roof", 284, 500, "description: Roof Terrace 284 SQM at EGP 500 / SQM"),
  { id: 845, field: "price", from: 863000, to: 721000, why: "indoor only: EGP 1,000 × 721 m²; roof 142,000 shown separately (total unchanged)" },

  ...extra(802, "outdoor", 790, 12, "description: Outdoor Area 790 SQM at USD 12 / SQM"),
  ...extra(344, "outdoor", 790, 12, "description: Outdoor Area 790 SQM, USD 12 for the outdoor area"),
  ...extra(837, "outdoor", 250, null, "description: Outdoor Area 250 SQM"),
  ...extra(610, "outdoor", 1154, null, "description: Outdoor Area 1,154 SQM, rent \"based on indoor area only\""),
  ...extra(147, "outdoor", 150, null, "description: Outdoor Area 150 SQM"),
  ...extra(233, "outdoor", 32, null, "title/description: 632 SQM + 32 SQM"),
  ...extra(86, "terrace", 492, null, "description: Terrace Area 492 SQM"),

  // Sales quoted as one total that already covers the extra area.
  ...extra(196, "outdoor", 55, null, "title: 166 SQM + 55 SQM Outdoor"),
  { id: 196, field: "price_is_lump_sum", from: false, to: true, why: "description: Total Price EGP 53,000,000 (covers indoor + outdoor)" },
  ...extra(197, "terrace", 78, null, "title: 168 SQM + 78 SQM Terrace"),
  { id: 197, field: "price_is_lump_sum", from: false, to: true, why: "description: Total Price EGP 36,000,000 (covers indoor + terrace)" },
];

// Shown in the dry run for a person to decide; never applied by this script.
const REVIEW = [
  "Enter the extra-area price per m² in the admin (not stated in the description): #855 (350 m² outdoor), #837 (250), #610 (1,154), #147 (150), #233 (32), #86 (492 terrace). Until then their pages show the extra area without a price and the weekly report lists them.",
  "#49: price 2,355,000 EGP = USD 30/m² × 1,570 m² converted at 50 EGP/$ by hand. Original quote: USD 47,100/month. Set currency USD + price 47,100 if the original quote is in USD.",
  "#50: price 2,749,991 EGP ≈ USD 55/m² × 1,000 m² converted at ~50 by hand. Original quote: USD 55,000/month.",
  "#596: 7,350,000 ≈ EGP 850 × 8,650 m² (indoor 7,050 + outdoor 1,600 at the full indoor rate). Indoor price would be 5,992,500 + the outdoor 1,600 m² at whatever rate applies. Confirm the quote before changing.",
  "#808: priced on 664 m² (632 indoor + 32 outdoor) at 1,400; looks like a duplicate of #233.",
  "#87: area 557 but description says built-up 577 SQM; outdoor 150 SQM. Confirm the area.",
  "Roof mentioned without its size (#338, #244, #803, #770, #716, #814, #73, #246, #472, #277, #171, #306, #288): confirm the roof m², then enter it as the extra area (type Roof) with its price per m².",
  "#773, #512, #346, #144, #602, #491, #289, #511: price impossible for the area (see listing-data-issues.csv). Check against the original quote.",
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
const db = createClient(url, key);

const same = (a: unknown, b: unknown) =>
  (a == null && b == null) || (a != null && b != null && String(a) === String(b));

async function revert(file: string) {
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{ id: number; field: Field; value: unknown }>;
  for (const r of rows) {
    const { error } = await db.from("listings").update({ [r.field]: r.value }).eq("id", r.id);
    console.log(`#${r.id} ${r.field} ${error ? `FAILED ${error.message}` : `restored to ${r.value}`}`);
  }
}

async function main() {
  const revertIdx = process.argv.indexOf("--revert");
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);
  const apply = process.argv.includes("--apply");

  const ids = Array.from(new Set(FIXES.map((f) => f.id)));
  const { data, error } = await db.from("listings").select("id,currency,area_sqm,outdoor_area_sqm,outdoor_price_per_meter,outdoor_area_type,price,price_is_lump_sum").in("id", ids);
  if (error) throw error;
  const byId = new Map((data as Array<Record<string, unknown> & { id: number }>).map((r) => [r.id, r]));

  const todo: Fix[] = [];
  for (const f of FIXES) {
    const row = byId.get(f.id);
    const current = row?.[f.field] ?? null;
    if (!row) console.log(`#${f.id} SKIP: listing not found`);
    else if (same(current, f.to)) console.log(`#${f.id} ${f.field}: already ${f.to}`);
    else if (!same(current, f.from)) console.log(`#${f.id} ${f.field}: SKIP, now ${current} (expected ${f.from}); edited since the report`);
    else {
      console.log(`#${f.id} ${f.field}: ${f.from ?? "empty"} -> ${f.to}   (${f.why})`);
      todo.push(f);
    }
  }
  console.log(`\n${todo.length} change(s) on ${new Set(todo.map((f) => f.id)).size} listing(s) ${apply ? "to write" : "(dry run; pass --apply)"}`);
  console.log("\nFor a person to decide (not changed by this script):");
  for (const r of REVIEW) console.log(`  - ${r}`);
  if (!apply || todo.length === 0) return;

  const backup = `listing-prices-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backup, JSON.stringify(todo.map((f) => ({ id: f.id, field: f.field, value: f.from })), null, 2));
  console.log(`\nbackup: ${backup}`);
  for (const f of todo) {
    const { error: e } = await db.from("listings").update({ [f.field]: f.to }).eq("id", f.id);
    console.log(`#${f.id} ${f.field} ${e ? `FAILED ${e.message}` : "updated"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
