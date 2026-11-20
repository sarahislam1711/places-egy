// Read-only data check over all listings. Writes listing-data-issues.csv.
//
//   npx tsx --env-file=.env scripts/validate-listings.ts [out.csv]
//
// The same rules run in the admin before save (client/src/lib/listing-checks.ts).
import { writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { listingIssues, type CheckableListing } from "../client/src/lib/listing-checks";

const OUT = process.argv[2] ?? "listing-data-issues.csv";
const SITE = "https://places-egy.com";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");

const csv = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const db = createClient(url, key);

  const rows: CheckableListing[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("listings")
      .select("id,title,description,area_sqm,furnishing,maintenance_status,maintenance_fees,currency,price,transaction_type,price_per_meter,outdoor_area_sqm,outdoor_price_per_meter,outdoor_area_type,price_is_lump_sum,is_test")
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data as CheckableListing[]));
    if (data.length < 1000) break;
  }

  const lines = ["id,url,field,current value,conflicting value,suggested fix"];
  const byRule = new Map<string, number>();
  let affected = 0;
  for (const l of rows) {
    const issues = listingIssues(l);
    if (issues.length) affected++;
    for (const i of issues) {
      byRule.set(i.rule, (byRule.get(i.rule) ?? 0) + 1);
      const path = `/listings/${l.id}${slugify(l.title ?? "") ? `-${slugify(l.title ?? "")}` : ""}`;
      lines.push([l.id, `${SITE}${path}`, i.field, i.current, i.conflicting, i.fix].map(csv).join(","));
    }
  }
  writeFileSync(OUT, lines.join("\n") + "\n");
  console.log(`${rows.length} listings checked, ${affected} with issues, ${lines.length - 1} issues -> ${OUT}`);
  for (const [rule, n] of [...byRule].sort((a, b) => b[1] - a[1])) console.log(`  ${n.toString().padStart(4)}  ${rule}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
