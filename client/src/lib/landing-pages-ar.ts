// Arabic copy for the deal hubs (/ar/rent, /ar/buy, /ar/income-property) and,
// next, the area pages. Same live figures as the English copy in
// landing-pages.ts (counts, medians, sizes, projects), Arabic sentences around
// them. Keep free of "@/" imports: the server renderer imports it too.
import {
  DEALS,
  fmt,
  hubCopy,
  hubRows,
  landingStats,
  roundNice,
  type DealSlug,
  type HubCopy,
  type LandingListing,
  type LandingStats,
} from "./landing-pages";
import { areaAr } from "./listing-text-ar";

export const CAIRO_AR = "القاهرة";

/** Page H1 / heading for a deal type in a place (Arabic keyword first). */
export function dealHeadingAr(deal: DealSlug, place: string): string {
  if (deal === "rent") return `مكاتب إدارية للإيجار في ${place}`;
  if (deal === "buy") return `مكاتب إدارية للبيع في ${place}`;
  return `عقارات مدرة للدخل للبيع في ${place}`;
}

/** "1.2 مليون" / "190,000" */
export const fmtMoneyAr = (x: number) =>
  x >= 1_000_000 ? `${(x / 1_000_000).toFixed(x >= 10_000_000 ? 0 : 1)} مليون` : fmt(roundNice(x));

/** Median per m² in figures only ("1,300"), for the hero panel. */
export const medianFigureAr = (deal: DealSlug, median: number) =>
  DEALS[deal].tx === "rent" ? fmt(roundNice(median)) : fmtMoneyAr(median);

/** "متوسط 1,300 ج.م للمتر شهريًا" / "متوسط 190,000 ج.م للمتر" */
export const medianLabelAr = (deal: DealSlug, median: number) =>
  DEALS[deal].tx === "rent" ? `متوسط ${fmt(roundNice(median))} ج.م للمتر شهريًا` : `متوسط ${fmtMoneyAr(median)} ج.م للمتر`;

/**
 * Arabic count + noun with correct number agreement:
 * 1 مكتب، 2 مكتبان، 3–10 مكاتب، 11–99 مكتبًا، 100+ (ending 00–02) مكتب.
 */
export function countAr(n: number, forms: { one: string; two: string; few: string; many: string; hundred: string }): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const r = n % 100;
  if (r >= 3 && r <= 10) return `${fmt(n)} ${forms.few}`;
  if (r >= 11) return `${fmt(n)} ${forms.many}`;
  return `${fmt(n)} ${forms.hundred}`;
}

export const OFFICES = { one: "مكتب واحد", two: "مكتبان", few: "مكاتب", many: "مكتبًا", hundred: "مكتب" };
export const INCOME_UNITS = { one: "عقار واحد مدر للدخل", two: "عقاران مدران للدخل", few: "عقارات مدرة للدخل", many: "عقارًا مدرًا للدخل", hundred: "عقار مدر للدخل" };
export const DISTRICTS = { one: "منطقة أعمال واحدة", two: "منطقتا أعمال", few: "مناطق أعمال", many: "منطقة أعمال", hundred: "منطقة أعمال" };

/** "749 مكتبًا للإيجار" / "12 مكتبًا للبيع" / "3 عقارات مدرة للدخل" */
export function unitsAr(deal: DealSlug, n: number): string {
  if (deal === "income-property") return countAr(n, INCOME_UNITS);
  return `${countAr(n, OFFICES)} ${deal === "rent" ? "للإيجار" : "للبيع"}`;
}

const SIZE_BAND_AR: Record<string, string> = {
  "under 100 m²": "أقل من 100 م²",
  "100–300 m²": "من 100 إلى 300 م²",
  "300–1,000 m²": "من 300 إلى 1,000 م²",
  "1,000 m² and above": "1,000 م² فأكثر",
};

const listAr = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join("، ")} و${items[items.length - 1]}`;

export interface LandingCopyAr {
  title: string;
  description: string;
  h1: string;
  intro: string[];
  listHeading: string;
  faqs: Array<{ question: string; answer: string }>;
}

/** Arabic copy for one deal type in one place (the whole of Cairo for the hubs). */
export function landingCopyAr(deal: DealSlug, place: string, s: LandingStats): LandingCopyAr {
  const rent = DEALS[deal].tx === "rent";
  const h1 = dealHeadingAr(deal, place);
  const kind = deal === "income-property" ? "المكاتب المؤجرة المدرة للدخل" : "المكاتب الإدارية";
  const txWord = deal === "income-property" ? "للبيع" : rent ? "للإيجار" : "للبيع";

  const intro = [`تصفح ${kind} ${txWord} في ${place}.`];

  const faqs: LandingCopyAr["faqs"] = [];
  if (s.perSqm) {
    const ex = rent ? 200 : 150;
    faqs.push({
      question: rent ? `كم تكلفة إيجار مكتب في ${place}؟` : `كم سعر المكتب الإداري في ${place}؟`,
      answer: rent
        ? `من بين ${countAr(s.egpCount, OFFICES)} للإيجار بأسعار بالجنيه في ${place} على PLACES، يتراوح سعر النصف الأوسط بين ${fmt(roundNice(s.perSqm[0]))} و${fmt(roundNice(s.perSqm[2]))} ج.م للمتر شهريًا، أي أن مكتبًا مساحته ${ex} م² يُؤجَّر عادةً بحوالي ${fmtMoneyAr(s.perSqm[0] * ex)} إلى ${fmtMoneyAr(s.perSqm[2] * ex)} ج.م شهريًا. يختلف السعر حسب المشروع والدور والتشطيب والمساحة.`
        : `من بين الوحدات المسعّرة بالجنيه في ${place} على PLACES، يتراوح سعر النصف الأوسط بين ${fmtMoneyAr(s.perSqm[0])} و${fmtMoneyAr(s.perSqm[2])} ج.م للمتر، أي أن مكتبًا مساحته ${ex} م² يكلف عادةً حوالي ${fmtMoneyAr(s.perSqm[0] * ex)} إلى ${fmtMoneyAr(s.perSqm[2] * ex)} ج.م. يختلف السعر حسب المشروع والدور والتشطيب والمساحة.`,
    });
  }
  if (s.sizeBands.length) {
    faqs.push({
      question: `ما المساحات المتاحة للمكاتب ${txWord} في ${place}؟`,
      answer: `${s.areaMin && s.areaMax ? `تتراوح المساحات بين ${fmt(s.areaMin)} و${fmt(s.areaMax)} م²: ` : ""}${listAr(
        s.sizeBands.map(([b, c]) => `${fmt(c)} ${c >= 3 && c <= 10 ? "وحدات" : "وحدة"} ${SIZE_BAND_AR[b] ?? b}`),
      )}.`,
    });
  }
  if (s.projects.length) {
    faqs.push({
      question: `ما المشروعات التي بها مكاتب ${txWord} في ${place}؟`,
      answer: `أكثر الوحدات المتاحة حاليًا في ${listAr(s.projects)}. تعرض كل وحدة المشروع والدور والتشطيب والسعر.`,
    });
  }
  if (rent) {
    const small = s.sizeBands.find(([b]) => b === "under 100 m²")?.[1] ?? 0;
    if (small > 0) {
      faqs.push({
        question: `هل توجد مكاتب صغيرة للإيجار في ${place}؟`,
        answer: `نعم. ${countAr(small, OFFICES)} من المكاتب المتاحة للإيجار في ${place} ${small === 1 ? "مساحته" : "مساحتها"} أقل من 100 م²، ${small === 1 ? "ويناسب" : "وتناسب"} الفرق الصغيرة.${s.areaMin ? ` أصغرها ${fmt(s.areaMin)} م².` : ""}`,
      });
    }
    const furnished = s.conditions.find(([c]) => c === "furnished")?.[1] ?? 0;
    if (furnished > 0) {
      faqs.push({
        question: `هل يمكن استئجار مكتب مفروش في ${place}؟`,
        answer: `نعم. ${countAr(furnished, OFFICES)} من المكاتب المتاحة للإيجار في ${place} ${furnished === 1 ? "معروض مفروشًا وجاهزًا" : "معروضة مفروشة وجاهزة"} للانتقال. تعرض كل وحدة مستوى التشطيب.`,
      });
    }
  }
  faqs.push({
    question: rent ? `كيف أستأجر مكتبًا في ${place} عن طريق PLACES؟` : `كيف أشتري مكتبًا في ${place} عن طريق PLACES؟`,
    answer: `أرسل لنا المساحة المطلوبة والميزانية وموعد الانتقال، وسيرسل لك مستشار من PLACES قائمة مختصرة بالوحدات المناسبة${rent ? "، ويتفاوض نيابةً عنك على الإيجار وفترة السماح والزيادة السنوية. الخدمة مجانية للشركات المستأجرة لأن المالك هو من يدفع أتعابنا" : ""}.`,
  });

  const t = `${h1} | ${unitsAr(deal, s.count).replace(/ (للإيجار|للبيع)$/, "")} | PLACES`;
  return {
    title: t.length <= 60 ? t : `${h1} | PLACES`,
    description: "",
    h1,
    intro,
    listHeading: h1,
    faqs,
  };
}

export interface HubAreaAr {
  slug: string;
  name: string;
  count: number;
  median: number | null;
  /** English path of the area's page; links use localHref() so they go to the Arabic twin once it exists. */
  path: string;
}

export interface HubCopyAr extends LandingCopyAr {
  areas: HubAreaAr[];
}

/** Arabic copy for /ar/rent, /ar/buy, /ar/income-property (all of Cairo). */
export function hubCopyAr(deal: DealSlug, all: LandingListing[]): HubCopyAr {
  const en: HubCopy = hubCopy(deal, all);
  const rows = hubRows(all, deal);
  const base = landingCopyAr(deal, CAIRO_AR, landingStats(rows, "Cairo"));
  const areas = en.areas.map((a) => ({ slug: a.loc.slug, name: areaAr(a.loc.slug), count: a.count, median: a.median, path: a.path }));
  const top = areas.slice(0, 3).map((a) => a.name);
  const rent = DEALS[deal].tx === "rent";
  const description = `${unitsAr(deal, rows.length)} في ${areas.length > 3 ? `${top.join("، ")} وغيرها` : listAr(top)}. قارن أسعار المتر والمساحات والتشطيب${rent ? "، مع وسيط عقاري مجاني للشركات المستأجرة" : ""}.`;
  return { ...base, description: description.slice(0, 160), areas };
}

// ---------- area pages: /ar/rent/{area}, /ar/buy/{area}, /ar/income-property/{area} ----------

/** Where in the area the offices are, in the words Arabic searchers use. */
const WITHIN_AR: Record<string, string> = {
  "new-cairo": "على امتداد شارع التسعين الشمالي والجنوبي",
};

/** Arabic copy for one deal type in one area (same live figures as landingCopy). */
export function areaCopyAr(deal: DealSlug, locSlug: string, s: LandingStats): LandingCopyAr {
  const place = areaAr(locSlug);
  const base = landingCopyAr(deal, place, s);
  const rent = DEALS[deal].tx === "rent";
  const within = WITHIN_AR[locSlug];
  const kind = deal === "income-property" ? "المكاتب المؤجرة المدرة للدخل" : "المكاتب الإدارية";
  const txWord = rent ? "للإيجار" : "للبيع";
  const intro = [
    `تصفح ${kind} ${txWord} في ${place}${within ? `، ${within}` : ""}.`,
  ];
  const description = `${unitsAr(deal, s.count)} في ${place}. قارن أسعار المتر والمساحات والتشطيب والمشروعات${rent ? "، مع وسيط عقاري مجاني للشركات المستأجرة" : ""}.`.slice(0, 160);
  return { ...base, intro, description };
}

/** Arabic labels for the FAQ topics linked from the area pages. */
export const FAQ_TOPIC_LABELS_AR: Record<string, string> = {
  "early-thinking": "قبل أن تبدأ: ما الذي تفكر فيه",
  "admin-vs-commercial": "مكتب إداري أم وحدة تجارية؟",
  locations: "أي منطقة تناسب شركتك؟",
  "contracts-legal": "ما الذي تراجعه في العقد",
  "advisors-brokers": "هل تحتاج إلى وسيط عقاري؟",
  "risks-mistakes": "أخطاء يجب تجنبها",
  "rent-buy-resale": "إيجار أم شراء جديد أم إعادة بيع؟",
  developers: "كيف تختار المطور والمشروع",
  "pricing-value": "هل السعر مناسب؟",
  "investment-income": "شراء مكتب للدخل الإيجاري",
};

/** "متاح 12 · متوسط 1,300 ج.م للمتر شهريًا" */
export const projectLineAr = (deal: DealSlug, count: number, median: number | null) =>
  `متاح ${fmt(count)}${median ? ` · ${medianLabelAr(deal, median)}` : ""}`;
