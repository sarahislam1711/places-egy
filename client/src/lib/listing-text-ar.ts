// Arabic wording for listing facts (Arabic site, 28 Nov). Used by the Arabic
// listing card now, and by Arabic listing pages + the admin auto-title later.
// Keep free of "@/" imports: the server and build scripts import it too.
// Brand names and project names stay as written; Western digits.

/** Arabic names for the six PLACES areas, keyed by slug and by display name. */
export const AREA_AR: Record<string, string> = {
  "new-cairo": "التجمع الخامس",
  "sheikh-zayed": "الشيخ زايد",
  maadi: "المعادي",
  "downtown-cairo": "وسط البلد",
  "6th-october": "6 أكتوبر",
  sheraton: "شيراتون",
  "New Cairo": "التجمع الخامس",
  "Sheikh Zayed": "الشيخ زايد",
  Maadi: "المعادي",
  "Downtown Cairo": "وسط البلد",
  "6th October": "6 أكتوبر",
  Sheraton: "شيراتون",
};

export const areaAr = (nameOrSlug: string | null | undefined): string =>
  (nameOrSlug && AREA_AR[nameOrSlug.trim()]) || (nameOrSlug ?? "");

const FURNISHING_AR: Record<string, string> = {
  "core-shell": "كور آند شل",
  finished: "متشطب",
  "semi-finished": "نصف تشطيب",
  "fully-finished": "تشطيب كامل",
  furnished: "مفروش",
  serviced: "مجهز بالخدمات",
};

const SUBTYPE_AR: Record<string, string> = {
  "business-park": "بيزنس بارك",
  "business-building": "مبنى إداري",
  "mixed-use": "مشروع متعدد الاستخدامات",
  "mega-mall": "مول تجاري",
  "strip-mall": "ستريب مول",
  "drive-through": "درايف ثرو",
};

export const furnishingAr = (v: string | null | undefined) => (v ? FURNISHING_AR[v] ?? "" : "");
export const subtypeAr = (v: string | null | undefined) => (v ? SUBTYPE_AR[v] ?? "" : "");

const n = (x: number) => Number(x).toLocaleString("en-US");

/** "للإيجار" / "للبيع" / "عقار مدر للدخل" */
export function txAr(tx: string | null | undefined): string {
  const t = (tx ?? "").toLowerCase();
  if (t === "rent") return "للإيجار";
  if (t === "sale") return "للبيع";
  if (t === "income-property") return "عقار مدر للدخل";
  return "";
}

/** "ج.م" / "دولار" */
export const currencyAr = (c: string | null | undefined) => ((c ?? "EGP").toUpperCase() === "USD" ? "دولار" : "ج.م");

/** "650 م²" or "650 م² + 350 م² روف" */
export function areaLabelAr(l: { area_sqm?: number | null; outdoor_area_sqm?: number | null; outdoor_area_type?: string | null }): string {
  const word = { roof: "روف", terrace: "تراس", garden: "حديقة" }[l.outdoor_area_type ?? ""] ?? "مساحة خارجية";
  const main = l.area_sqm ? `${n(l.area_sqm)} م²` : "";
  const outdoor = l.outdoor_area_sqm ? `${n(l.outdoor_area_sqm)} م² ${word}` : "";
  return [main, outdoor].filter(Boolean).join(" + ");
}

/** "مؤجر · متاح من 1 فبراير 2027" / "مؤجر · الموعد يُحدد لاحقًا" */
export function rentedLabelAr(l: { rental_end?: string | null }): string {
  if (!l.rental_end) return "مؤجر · الموعد يُحدد لاحقًا";
  const d = new Date(`${l.rental_end}T00:00:00`);
  const date = d.toLocaleDateString("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });
  return `مؤجر · متاح من ${date}`;
}

/**
 * Arabic listing title built from the listing's own fields, e.g.
 * "مكتب إداري للإيجار في التجمع الخامس | 205 م²". Consistent and keyword-rich,
 * with nothing to translate (plan section 3.7).
 */
export function arabicListingTitle(l: {
  transaction_type?: string | null;
  property_type?: string | null;
  location?: string | null;
  area_sqm?: number | null;
}): string {
  const kind = (l.property_type ?? "admin") === "commercial" ? "وحدة تجارية" : "مكتب إداري";
  const tx = (l.transaction_type ?? "").toLowerCase() === "income-property" ? "مؤجر للبيع" : txAr(l.transaction_type);
  const where = l.location ? ` في ${areaAr(l.location)}` : "";
  const size = l.area_sqm ? ` | ${n(l.area_sqm)} م²` : "";
  return `${kind} ${tx}${where}${size}`.replace(/\s+/g, " ").trim();
}
