// Data-quality rules for listings. Used by scripts/validate-listings.ts (report)
// and the admin form (warnings before save). Keep free of "@/" imports.
import { extraAreaWord } from "./listing-pricing";

export interface CheckableListing {
  id?: number;
  title?: string | null;
  description?: string | null;
  area_sqm?: number | null;
  furnishing?: string | null;
  maintenance_status?: string | null;
  maintenance_fees?: number | null;
  currency?: string | null;
  price?: number | null;
  transaction_type?: string | null;
  price_per_meter?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  outdoor_area_type?: string | null;
  price_is_lump_sum?: boolean | null;
}

export interface ListingIssue {
  rule: string;
  field: string;
  current: string;
  conflicting: string;
  fix: string;
  /** "block": impossible values; the admin form won't save until fixed.
   *  "info": the editor confirms once in the form (e.g. a quoted
   *  outdoor rate); left out of the weekly report.
   *  Absent: a warning the editor can confirm and save anyway. */
  severity?: "block" | "info";
}

// "USD 45 / SQM", "$45/sqm", "$ 45 per m²"
const USD_RATE = /(?:usd|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)\s*(?:sqm|sq\.?\s*m|m²|m2|meter|metre)/i;

// True when price = the description's USD rate × area (within 2%).
function usdTotalMatches(description: string | null | undefined, area: number | null, price: number | null): boolean {
  const m = (description ?? "").match(USD_RATE);
  if (!m || !area || !price) return false;
  const total = Number(m[1].replace(/,/g, "")) * area;
  return total > 0 && Math.abs(total - price) / price < 0.02;
}

const fmtN = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const AREA_MIN = 10;
const AREA_MAX = 50_000;

// "1,080 SQM", "600meter", "233 m²", "500 - 4,500 SQM" -> [1080], [600], [233], [500, 4500]
export function titleSizes(title: string): number[] {
  const sizes: number[] = [];
  const unit = String.raw`(?:sq\.?\s*m|sqm|m²|m2|square\s*met(?:er|re)s?|met(?:er|re)s?)(?![a-z])`;
  const range = new RegExp(String.raw`(\d[\d,.]*)\s*(?:-|–|to)\s*(\d[\d,.]*)\s*${unit}`, "gi");
  const single = new RegExp(String.raw`(\d[\d,.]*)\s*${unit}`, "gi");
  const num = (s: string) => Number(s.replace(/,/g, ""));
  let rest = title;
  for (const m of Array.from(title.matchAll(range))) {
    sizes.push(num(m[1]), num(m[2]));
    rest = rest.replace(m[0], " ");
  }
  for (const m of Array.from(rest.matchAll(single))) sizes.push(num(m[1]));
  return sizes.filter((n) => Number.isFinite(n) && n > 0);
}

const UNFINISHED_IN_TITLE = /\b(white\s*box|core\s*(?:&|and)\s*shell|semi[\s-]*finished)\b/i;
const FINISHED_IN_TITLE = /\b(fully\s*finished|finished|furnished|fully\s*furnished)\b/i;
const FINISHED_VALUES = new Set(["finished", "fully-finished", "furnished", "serviced"]);
const UNFINISHED_VALUES = new Set(["core-shell", "semi-finished"]);
const CONDITION_LABEL: Record<string, string> = {
  "core-shell": "Core & Shell",
  "semi-finished": "Semi-Finished",
  finished: "Finished",
  "fully-finished": "Fully Finished",
  furnished: "Furnished",
  serviced: "Serviced",
};

// A maintenance charge stated in the description, e.g. "Maintenance: EGP 120 / sqm".
const MAINTENANCE_CHARGE =
  /maintenance[^.\n]{0,60}?(?:\d[\d,.]*\s*(?:egp|usd|le|l\.e|%|\/\s*(?:sqm|m))|(?:egp|usd)\s*\d|fees?\b|charges?\b|to be confirmed)/i;

export function listingIssues(l: CheckableListing): ListingIssue[] {
  const issues: ListingIssue[] = [];
  const title = l.title ?? "";
  const area = l.area_sqm == null ? null : Number(l.area_sqm);

  // Area missing or implausible
  if (area == null || area === 0) {
    issues.push({ rule: "area is 0 or missing", field: "area_sqm", current: String(area ?? ""), conflicting: "", fix: "Enter the unit's area in m²" });
  } else if (area < AREA_MIN || area > AREA_MAX) {
    issues.push({
      rule: `area outside ${AREA_MIN}–${AREA_MAX.toLocaleString("en-US")} m²`,
      field: "area_sqm",
      current: String(area),
      conflicting: titleSizes(title).join(" / "),
      fix: titleSizes(title).length ? `Likely ${titleSizes(title)[0]} m² (from title)` : "Check the area; likely a typo",
    });
  }

  // Size in title vs area field
  const sizes = titleSizes(title);
  if (sizes.length && area && !sizes.some((s) => Math.abs(s - area) < 1)) {
    issues.push({
      rule: "title size differs from area field",
      field: "title/area_sqm",
      current: `area ${area}`,
      conflicting: `title says ${sizes.join(" / ")} m²`,
      fix: "Correct whichever is wrong (title or area)",
    });
  }

  // "650 SQM + 350 SQM Outdoor": the first figure is the unit itself; the
  // second is a terrace/roof/outdoor add-on. Area should be the first.
  const plus = title.match(/(\d[\d,.]*)\s*(?:sq\.?\s*m|sqm|m²|m2)\s*\+\s*(\d[\d,.]*)\s*(?:sq\.?\s*m|sqm|m²|m2)/i);
  if (plus && area) {
    const main = Number(plus[1].replace(/,/g, ""));
    const extra = Number(plus[2].replace(/,/g, ""));
    if (Math.abs(main - area) < 1 && !l.outdoor_area_sqm) {
      issues.push({
        rule: "extra area from the title isn't entered",
        field: "outdoor_area_sqm",
        current: "empty",
        conflicting: `title: ${main} m² + ${extra} m²`,
        fix: `Enter ${extra} as the extra area (outdoor/roof/terrace) with its price per m²`,
      });
    }
    if (Math.abs(main - area) >= 1 && Math.abs(main + extra - area) >= 1) {
      // When the area holds the add-on (#855: 350 outdoor instead of 650
      // indoor), the price was usually computed from it too.
      const rateM = (l.description ?? "").match(/(?:egp|usd|le|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)\s*(?:sqm|sq\.?\s*m|m²|m2|meter|metre)/i);
      const rateNum = rateM ? Number(rateM[1].replace(/,/g, "")) : 0;
      const priceNow = l.price == null ? 0 : Number(l.price);
      const priceFromWrongArea = rateNum > 0 && priceNow > 0 && Math.abs(rateNum * area - priceNow) / priceNow < 0.02;
      issues.push({
        rule: "area field isn't the main area from the title",
        field: "area_sqm",
        current: `area ${area}`,
        conflicting: `title: ${main} m² + ${extra} m²`,
        fix:
          `Set area to ${main} (the unit) and the extra area to ${extra}` +
          (priceFromWrongArea
            ? `. The price (${priceNow.toLocaleString("en-US")}) is ${rateNum.toLocaleString("en-US")} × ${area}; at that rate the ${main} m² unit is ${(rateNum * main).toLocaleString("en-US")} (indoor price), and the ${extra} m² is entered separately with its own price per m²`
            : ""),
        severity: "block",
      });
    }
  }

  // Price sanity, from price per m². Catches a per-m² rate or the area typed
  // into the price field (e.g. USD 33 for 1,700 m²; USD 560 for 560 m²).
  const price = l.price == null ? null : Number(l.price);
  if (price == null || price <= 0) {
    issues.push({ rule: "price missing", field: "price", current: String(price ?? ""), conflicting: "", fix: "Enter the price (rent per month, or total sale price)", severity: "block" });
  } else if (area && area >= AREA_MIN) {
    const perM2 = price / area;
    const usd = (l.currency ?? "").toUpperCase() === "USD";
    const sale = l.transaction_type === "sale" || l.transaction_type === "income-property";
    const [lo, hi] = sale ? (usd ? [150, 15_000] : [5_000, 600_000]) : usd ? [2, 150] : [50, 8_000];
    // A USD amount saved as EGP is reported by its own rule below, with the right fix.
    const usdSavedAsEgp = !usd && usdTotalMatches(l.description, area, price);
    if ((perM2 < lo || perM2 > hi) && !usdSavedAsEgp) {
      const unit = `${usd ? "USD" : "EGP"}${sale ? "" : "/month"}`;
      issues.push({
        rule: `price is ${perM2 < lo ? "too low" : "too high"} for the area`,
        field: "price",
        current: `${price.toLocaleString("en-US")} ${unit}`,
        conflicting: `= ${perM2.toLocaleString("en-US", { maximumFractionDigits: 1 })} per m² (expected ${lo.toLocaleString("en-US")}–${hi.toLocaleString("en-US")})`,
        fix: perM2 < lo
          ? `If ${price.toLocaleString("en-US")} is the rate per m², the ${sale ? "price" : "monthly rent"} is ${(price * area).toLocaleString("en-US")} ${unit}`
          : "Check the price, currency and area",
        severity: "block",
      });
    }
  }

  // USD amount saved as EGP: the description says "$45 / SQM" and the price
  // equals 45 × area, but the currency field is EGP. The page then shows
  // "20,250 EGP / month" for a $20,250 unit (about 56x too cheap) and the
  // EGP budget filter ranks it among the cheapest offices.
  const usdRate = (l.description ?? "").match(USD_RATE);
  if (usdRate && price && area && (l.currency ?? "EGP").toUpperCase() === "EGP") {
    const usdTotal = Number(usdRate[1].replace(/,/g, "")) * area;
    if (usdTotalMatches(l.description, area, price)) {
      issues.push({
        rule: "price is a USD amount saved as EGP",
        field: "currency",
        current: `${price.toLocaleString("en-US")} EGP`,
        conflicting: `description: ${usdRate[0].trim()} × ${area} m² = $${usdTotal.toLocaleString("en-US")}`,
        fix: "Set currency to USD",
        severity: "block",
      });
    }
  }

  const lumpSum = !!l.price_is_lump_sum;
  const outdoorArea = l.outdoor_area_sqm == null ? null : Number(l.outdoor_area_sqm);
  const outdoorRate = l.outdoor_price_per_meter == null ? null : Number(l.outdoor_price_per_meter);
  const ppm = l.price_per_meter == null ? null : Number(l.price_per_meter);

  // Price = INDOOR price (listing-pricing.ts): price per m² × area. Outdoor is
  // added separately, so it must not be in the price. These are typed
  // separately and shown side by side on the card, so they must agree. Off by
  // more than 2x blocks saving (wrong currency/area, a rate typed as a total);
  // a smaller gap is a warning (negotiated discount, rounding).
  if (!lumpSum && ppm && ppm > 0 && price && area) {
    const indoor = ppm * area;
    if (Math.abs(price - indoor) / indoor > 0.03) {
      const off = price < indoor ? indoor / price : price / indoor;
      const includesOutdoor =
        !!outdoorArea && outdoorRate != null && outdoorRate > 0 && Math.abs(price - (indoor + outdoorRate * outdoorArea)) / price < 0.03;
      issues.push({
        rule: includesOutdoor ? `price includes the ${extraAreaWord(l)} area` : "price doesn't match price per m² × area",
        field: "price/price_per_meter/area_sqm",
        current: `price ${fmtN(price)}`,
        conflicting: `${fmtN(ppm)} × ${fmtN(area)} m² = ${fmtN(indoor)}`,
        fix: includesOutdoor
          ? `Enter the indoor price only (${fmtN(indoor)}); the ${extraAreaWord(l)} amount is added separately`
          : "Correct the price, the price per m² or the area. If the price is one total (e.g. a whole building), tick \"Price is a lump sum\"",
        // Outdoor in the price is counted twice (it's also added separately).
        ...(off > 2 || includesOutdoor ? { severity: "block" as const } : {}),
      });
    }
  }

  // The extra area (outdoor/roof/terrace/garden) is priced separately with
  // its own price per m², entered freely. It must be entered (0 if included).
  if (outdoorArea && !lumpSum && outdoorRate == null) {
    issues.push({
      rule: `${extraAreaWord(l)} area has no price per m²`,
      field: "outdoor_price_per_meter",
      current: `${fmtN(outdoorArea)} m² ${extraAreaWord(l)}`,
      conflicting: "",
      fix: `Enter the ${extraAreaWord(l)} price per m² (0 if it's included in the indoor price), or tick "Price is a lump sum"`,
      severity: "block",
    });
  }

  // Rate stated in the description ("EGP 1,100 / SQM") vs price ÷ area.
  const rate = (l.description ?? "").match(/(?:egp|usd|le|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)\s*(?:sqm|sq\.?\s*m|m²|m2|meter|metre)/i);
  if (rate && price && area && !lumpSum) {
    const expected = Number(rate[1].replace(/,/g, "")) * area;
    if (expected > 0 && Math.abs(expected - price) / expected > 0.1) {
      issues.push({
        rule: "price doesn't match the rate × area in the description",
        field: "price/area_sqm",
        current: `price ${fmtN(price)}`,
        conflicting: `${rate[0].trim()} × ${fmtN(area)} m² = ${fmtN(expected)}`,
        fix: "Correct the price, the area or the rate in the description (the price is the indoor price only)",
      });
    }
  }

  // The description talks in one currency, the currency field says the other.
  const cur = (l.currency ?? "").toUpperCase();
  const desc = l.description ?? "";
  const mentionsUsd = /(?:\busd\b|\$\s*\d|\d\s*\$|دولار)/i.test(desc);
  const mentionsEgp = /(?:\begp\b|\ble\b|\bl\.e\b|جنيه|ج\.م)/i.test(desc);
  if (cur === "EGP" && mentionsUsd && !mentionsEgp && !(price && area && usdTotalMatches(desc, area, price))) {
    issues.push({ rule: "description prices are in USD, currency is EGP", field: "currency", current: "EGP", conflicting: "description mentions USD/$ only", fix: "Set currency to USD, or correct the description" });
  } else if (cur === "USD" && mentionsEgp && !mentionsUsd) {
    issues.push({ rule: "description prices are in EGP, currency is USD", field: "currency", current: "USD", conflicting: "description mentions EGP only", fix: "Set currency to EGP, or correct the description" });
  }

  // Empty title segment, e.g. "Office for Rent in Hyde Park – | Finished".
  if (/[–—-]\s*\||\|\s*\||\|\s*[–—-]|[|–—-]\s*$/.test(title.trim())) {
    issues.push({
      rule: "title has an empty part",
      field: "title",
      current: title,
      conflicting: "",
      fix: "Fill in the missing part (usually the size) or use Generate title",
      severity: "block",
    });
  }

  // Condition in title vs condition field. "Flexi Finished" (finishing to the
  // tenant's choice) is a semi-finished unit, so it isn't a "finished" claim.
  const cond = l.furnishing ?? "";
  const condTitle = title.replace(/\bflexi[\s-]*finish(?:ed|ing)\b/gi, "");
  if (UNFINISHED_IN_TITLE.test(condTitle) && FINISHED_VALUES.has(cond)) {
    issues.push({
      rule: "title says unfinished, condition says finished",
      field: "title/furnishing",
      current: CONDITION_LABEL[cond] ?? cond,
      conflicting: `title: ${condTitle.match(UNFINISHED_IN_TITLE)?.[0]}`,
      fix: "Set condition to Core & Shell / Semi-Finished, or fix the title",
    });
  } else if (!UNFINISHED_IN_TITLE.test(condTitle) && FINISHED_IN_TITLE.test(condTitle) && UNFINISHED_VALUES.has(cond)) {
    issues.push({
      rule: "title says finished, condition says unfinished",
      field: "title/furnishing",
      current: CONDITION_LABEL[cond] ?? cond,
      conflicting: `title: ${condTitle.match(FINISHED_IN_TITLE)?.[0]}`,
      fix: "Set condition to Finished / Fully Finished, or fix the title",
    });
  }

  // Markdown in title
  if (/^\s*#/.test(title) || /[*`~]|\[[^\]]*\]\(/.test(title)) {
    issues.push({
      rule: "Markdown in title",
      field: "title",
      current: title,
      conflicting: "",
      fix: title.replace(/^\s*#+\s*/, "").replace(/[*`~]+/g, "").trim(),
    });
  }

  // Maintenance included but a charge is described
  const charge = (l.description ?? "").match(MAINTENANCE_CHARGE)?.[0];
  if (l.maintenance_status === "included" && charge) {
    issues.push({
      rule: "maintenance 'included' but description states a charge",
      field: "maintenance_status",
      current: "Included",
      conflicting: `description: "${charge.trim()}"`,
      fix: "Set maintenance to Not Included and enter the fee, or edit the description",
    });
  }

  // Currency
  if (!l.currency) {
    issues.push({ rule: "currency missing", field: "currency", current: "", conflicting: "", fix: "Choose EGP or USD: the currency the price is quoted in", severity: "block" });
  }

  return issues;
}

const TITLE_CONDITION: Record<string, string> = {
  "core-shell": "Core & Shell",
  "semi-finished": "Semi-Finished",
  finished: "Finished",
  "fully-finished": "Fully Finished",
  furnished: "Furnished",
  serviced: "Serviced",
};

// Fields are sometimes typed in lowercase ("hyde park", "cfc"): capitalise
// names nobody capitalised; short ones are acronyms.
function displayName(raw: string): string {
  if (!raw || /[A-Z]/.test(raw)) return raw;
  return raw.length <= 4 ? raw.toUpperCase() : raw.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

// Title built from the structured fields, so title and fields can't disagree:
// "Office for Rent in Mivida The Place | 114 SQM | Finished"
export function suggestedTitle(l: {
  transaction_type?: string | null;
  project?: string | null;
  location_area?: string | null;
  location?: string | null;
  area_sqm?: number | null;
  furnishing?: string | null;
}): string {
  const deal =
    l.transaction_type === "income-property" ? "Income Property for Sale"
    : l.transaction_type === "sale" ? "Office for Sale"
    : "Office for Rent";
  const place = displayName(l.project?.trim() || l.location_area?.trim() || l.location?.trim() || "");
  return [
    place ? `${deal} in ${place}` : deal,
    l.area_sqm ? `${Number(l.area_sqm).toLocaleString("en-US")} SQM` : null,
    l.furnishing ? TITLE_CONDITION[l.furnishing] ?? null : null,
  ]
    .filter(Boolean)
    .join(" | ");
}
