import type { BlogLang, BlogPost } from "@/lib/blog";

// Reader-facing topics for the blog (28 Nov). Every post sits in the one
// WordPress category ("Admin Offices"), so the category chips filtered
// nothing. Topics are worked out here from each post's slug (English) or
// title (Arabic): first matching rule wins; a post that matches nothing still
// shows under "All". New posts need no setup as long as their slug/title uses
// the usual words.

export type TopicId = "leasing" | "fitout" | "types" | "areas";

type Topic = { id: TopicId; en: string; ar: string; enRule: RegExp; arRule: RegExp };

// Order matters: the first rule that matches decides the topic.
export const TOPICS: Topic[] = [
  {
    id: "fitout",
    en: "Fit-out & handover",
    ar: "التشطيب والاستلام",
    enRule: /core|shell|finish|furnish|-ac-|grade-a|fit-?out|handover/,
    arRule: /كور|شل|تشطيب|مفروش|تكييف|الفئة الأولى|جاهز|تجهيز|core/i,
  },
  {
    id: "types",
    en: "Office & building types",
    ar: "أنواع المكاتب والمباني",
    enRule: /mixed-use|business-park|business-building|serviced|types-of|admin-offices-egypt/,
    arRule: /متعدد|ميكسد|بيزنس بارك|البيزنس|المباني الإدارية|بالخدمات|أنواع مكاتب|الدليل الشامل/,
  },
  {
    id: "leasing",
    en: "Leasing & moving",
    ar: "الإيجار والانتقال",
    enRule: /lease|relocat|looking|rent|service-charge|office-space/,
    arRule: /إيجار|عقد|نقل|تنقل|الانتقال|عرضين|مساحة|مصاريف|تكلفة|تدور|أأجر/,
  },
  {
    id: "areas",
    en: "Areas & investing",
    ar: "المناطق والاستثمار",
    enRule: /new-cairo|sheikh-zayed|90-street|capital|yield|for-sale|location/,
    arRule: /القاهرة الجديدة|الشيخ زايد|العاصمة|التسعين|شراء|للبيع/,
  },
];

export function topicOf(post: BlogPost, lang: BlogLang): Topic | undefined {
  const text = lang === "ar" ? post.title : post.slug;
  return TOPICS.find((t) => (lang === "ar" ? t.arRule : t.enRule).test(text));
}

export function topicLabel(post: BlogPost, lang: BlogLang): string | undefined {
  const t = topicOf(post, lang);
  return t ? (lang === "ar" ? t.ar : t.en) : undefined;
}

// Posts that now 301 elsewhere (see server/redirects.ts) — kept off the
// blog index and "Read next" so readers don't bounce through a redirect.
const HIDDEN = new Set(["/blog/how-much-office-space-do-i-need"]);

export function isListed(post: BlogPost, basePath: string): boolean {
  return !HIDDEN.has(`${basePath}/${post.slug}`);
}

// The in-depth guide that best continues each topic (English guides only).
export const TOPIC_GUIDE: Record<TopicId, string> = {
  leasing: "how-to-rent-office-cairo",
  fitout: "office-fit-out-costs-cairo",
  types: "office-size-guide",
  areas: "office-rental-prices-cairo-2026",
};
