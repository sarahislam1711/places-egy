// One wording for the "use a tenant rep" call-out, shared by the React pages
// (TenantRepCallout) and the server/build-time HTML for crawlers, so both say
// the same thing. Keep free of "@/" imports: server code imports this file.

export const TENANT_REP_PATH = "/services/tenant-representation";

// FAQ topics whose readers are often companies looking for an office.
export const TENANT_REP_FAQ_SECTIONS = new Set([
  "advisors-brokers",
  "early-thinking",
  "contracts-legal",
  "risks-mistakes",
  "pricing-value",
  "locations",
]);

export type TenantRepVariant = "rent" | "listing" | "advice";

// `text` is the full sentence crawlers get (tenantRepHtml); the card on the page
// shows `lead` + `points` instead, so it scans in a second.
export const TENANT_REP_COPY: Record<
  TenantRepVariant,
  { title: string; text: string; link: string; lead: string; points: [string, string, string]; formPage: string }
> = {
  // /rent/* landing pages and location pages
  rent: {
    title: "Don't search alone",
    text: "PLACES represents you, not the landlord. We shortlist the offices that fit, negotiate the rent, rent-free period and yearly increases, and review the lease before you sign. Our tenant representation is free for tenants: the landlord pays our fee.",
    link: "How tenant representation works",
    lead: "PLACES represents you, not the landlord.",
    points: [
      "We shortlist the offices that fit your team",
      "We negotiate the rent, rent-free months and yearly increases",
      "We review the lease before you sign",
    ],
    formPage: "Offices for rent",
  },
  // individual rent listings
  listing: {
    title: "Want us to negotiate this office for you?",
    text: "With PLACES as your tenant representative, we compare this office with similar options, negotiate the terms and review the lease. It's free for tenants: the landlord pays our fee.",
    link: "Free tenant representation",
    lead: "With PLACES as your tenant representative, you have an advisor on your side.",
    points: [
      "We compare this office with similar ones nearby",
      "We negotiate the rent and the lease terms",
      "We review the lease before you sign",
    ],
    formPage: "Rent listing",
  },
  // guides and FAQ pages
  advice: {
    title: "Get an advisor on your side",
    text: "Our tenant representation service puts a PLACES advisor on your side of the table: we search the market, negotiate the lease terms and check the contract. It's free for tenants because the landlord pays our fee.",
    link: "Learn about tenant representation",
    lead: "Our tenant representation puts a PLACES advisor on your side of the table.",
    points: [
      "We search the whole market for you",
      "We negotiate the lease terms",
      "We check the contract before you sign",
    ],
    formPage: "Guide / FAQ",
  },
};

// Arabic (28 Nov). "وسيط عقاري للشركات" is the Arabic search term for the
// service; the brand stays PLACES.
export const TENANT_REP_COPY_AR: Record<TenantRepVariant, (typeof TENANT_REP_COPY)[TenantRepVariant]> = {
  rent: {
    title: "لا تبحث وحدك",
    text: "PLACES تمثّلك أنت، لا المالك. نختار لك المكاتب المناسبة، ونتفاوض على الإيجار وفترة السماح والزيادة السنوية، ونراجع العقد قبل التوقيع. خدمة الوسيط العقاري للشركات مجانية للمستأجر لأن المالك هو من يدفع أتعابنا.",
    link: "كيف تعمل خدمة الوسيط العقاري للشركات",
    lead: "PLACES تمثّلك أنت، لا المالك.",
    points: [
      "نختار لك المكاتب المناسبة لفريقك",
      "نتفاوض على الإيجار وأشهر السماح والزيادة السنوية",
      "نراجع العقد قبل أن توقّع",
    ],
    formPage: "Offices for rent (AR)",
  },
  listing: {
    title: "تريدنا أن نتفاوض على هذا المكتب نيابةً عنك؟",
    text: "مع PLACES كوسيط عقاري لشركتك، نقارن هذا المكتب بالبدائل المشابهة ونتفاوض على الشروط ونراجع العقد. الخدمة مجانية للمستأجر لأن المالك هو من يدفع أتعابنا.",
    link: "وسيط عقاري مجاني للشركات",
    lead: "مع PLACES كوسيط عقاري لشركتك، يكون معك مستشار في صفك.",
    points: [
      "نقارن هذا المكتب بالبدائل القريبة",
      "نتفاوض على الإيجار وشروط العقد",
      "نراجع العقد قبل أن توقّع",
    ],
    formPage: "Rent listing (AR)",
  },
  advice: {
    title: "خلّي معاك مستشار في صفك",
    text: "مع خدمة الوسيط العقاري للشركات من PLACES يكون معك مستشار في صفك: نبحث في السوق كله، ونتفاوض على شروط الإيجار، ونراجع العقد. الخدمة مجانية للمستأجر لأن المالك هو من يدفع أتعابنا.",
    link: "اعرف أكثر عن الوسيط العقاري للشركات",
    lead: "مع PLACES يكون معك مستشار في صفك على طاولة التفاوض.",
    points: [
      "نبحث في السوق كله من أجلك",
      "نتفاوض على شروط الإيجار",
      "نراجع العقد قبل أن توقّع",
    ],
    formPage: "Guide / FAQ (AR)",
  },
};

export const tenantRepCopy = (variant: TenantRepVariant, lang: "en" | "ar" = "en") =>
  (lang === "ar" ? TENANT_REP_COPY_AR : TENANT_REP_COPY)[variant];

/** Plain HTML version for server-rendered and build-time pages. */
export function tenantRepHtml(variant: TenantRepVariant, esc: (s: string) => string, lang: "en" | "ar" = "en", href = TENANT_REP_PATH): string {
  const c = tenantRepCopy(variant, lang);
  return `<aside><h2>${esc(c.title)}</h2><p>${esc(c.text)} <a href="${href}">${esc(c.link)}</a></p></aside>`;
}
