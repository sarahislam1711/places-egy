// Arabic home page text (/ar, 29 Nov). Shared by the React page (home.tsx),
// the server render (server/seo/render.ts → renderHomeAr) and the services
// explorer, so it must not use "@/" imports.
// Professional Egyptian business Arabic; the brand stays "PLACES" in Latin
// letters; Western digits; New Cairo = التجمع الخامس (13,000 searches/mo vs
// 2,200 for القاهرة الجديدة).

export const HOME_AR = {
  title: "مكاتب إدارية للإيجار والبيع في مصر | PLACES",
  description:
    "مكاتب إدارية للإيجار والبيع في التجمع الخامس والشيخ زايد و6 أكتوبر ووسط البلد وشيراتون والمعادي، من مطورين موثوقين، مع مستشارين يساعدونك قبل أن تقرر.",
  h1: { before: "اعثر على ", accent: "مكتبك الإداري", after: " في مصر" },
  subShort: "مكاتب في القاهرة، ونصيحة صادقة بلا ضغط.",
  subLong:
    "تصفح المكاتب الإدارية للإيجار والبيع في أهم مناطق الأعمال في مصر، واحصل على رأي خبير في السوق قبل أن تلتزم بأي شيء.",
  ctaFind: "ابحث عن مكتب",
  ctaTalk: "تحدث معنا",
  heroAlt: "مبنى إداري حديث",
  stats: { developers: "مطورون", listings: "وحدات معروضة", locations: "مناطق رئيسية", businesses: "شركات ساعدناها" },
  recentlyClosed: "صفقات أُغلقت مؤخرًا",
  newUnits: "وحدات متاحة جديدة",
  viewAll: "كل المكاتب المتاحة",
  servicesShort: "خدماتنا العقارية",
  servicesLong: "خدمات عقارية متكاملة للشركات",
  buy: { title: "اشترِ مكتبًا", cta: "تصفح المكاتب للبيع", alt: "مكتب إداري للبيع" },
  rent: { title: "استأجر مكتبًا", cta: "تصفح المكاتب للإيجار", alt: "مكتب إداري للإيجار" },
  howTitle: "المساحة المناسبة لشركتك موجودة.",
  howSub: "ودورنا أن نوصلك إليها بسرعة.",
  steps: [
    { title: "نفهم", desc: "نبدأ بفهم نشاط شركتك وميزانيتك وما تحتاجه فعلًا من المساحة." },
    { title: "نحلل", desc: "ندرس السوق ونرصد المعروض المنافس ونحدد الخيارات التي تناسب متطلباتك." },
    { title: "ننصح", desc: "نعرض عليك خياراتك بموضوعية، بما فيها المخاطر والمفاضلات، وحتى ما كنا سنفعله لو كنا مكانك." },
    { title: "ننفذ", desc: "ندير الصفقة من العرض حتى الاستلام حتى لا يفوتك أي تفصيل." },
  ],
  howCta: "أخبرنا بما تحتاجه، ونحن نتولى الباقي",
  locTitle: "أهم مناطق الأعمال",
  locSub: "اكتشف المكاتب في أكثر مناطق الأعمال طلبًا في مصر.",
  locAll: "كل المناطق",
  explore: "اكتشف",
  newCairoBlurb: "قلب الأعمال الجديد في القاهرة، بمجمعات إدارية متميزة.",
  faqTitle: "أسئلة شائعة",
  faqs: [
    {
      question: "ما نوع العقارات التي تعرضها PLACES؟",
      answer:
        "تتخصص PLACES في المكاتب الإدارية في أهم مناطق الأعمال في القاهرة. تشمل الوحدات المعروضة مكاتب في مشروعات بيزنس بارك ومبانٍ إدارية ومشروعات متعددة الاستخدامات، للبيع أو للإيجار بحسب كل وحدة.",
    },
    {
      question: "ما المناطق التي تغطيها PLACES في مصر؟",
      answer:
        "تغطي PLACES ست مناطق أعمال رئيسية في القاهرة الكبرى: التجمع الخامس، والشيخ زايد، و6 أكتوبر، ووسط البلد، وشيراتون، والمعادي. وهي أنشط أسواق المكاتب الإدارية في مصر.",
    },
    {
      question: "هل تساعد PLACES في الشراء والإيجار معًا؟",
      answer:
        "نعم. تساعدك PLACES في استئجار المكاتب، والشراء من المطور مباشرة، وصفقات إعادة البيع، والاستثمار العقاري. سواء كنت شركة تبحث عن مكتب للإيجار أو مستثمرًا يشتري مكتبًا بعائد إيجاري، نوفر لك الاستشارة والوصول إلى السوق في الحالتين.",
    },
    {
      question: "ما الذي يميز PLACES عن الوسيط العقاري التقليدي؟",
      answer:
        "لا نكتفي بعرض الوحدات المتاحة. قبل أن تلتزم بأي مساحة، نجري مسحًا للسوق، ونقيّم الوحدات المرشحة مقابل متطلباتك، ونراجع سمعة المطور وبنود العقد وتاريخ رسوم الخدمات. الهدف أن تختار المساحة المناسبة، لا مجرد مساحة متاحة.",
    },
  ],
  finalTitle: "تحتاج إلى استشارة تناسب شركتك؟",
  finalText: "فريقنا مستعد للاستماع إلى متطلباتك وتقديم نصيحة تناسب نشاطك. بلا ضغط، فقط دعم من خبراء.",
  finalCta: "تحدث مع مستشار",
  developers: "مطورون نتعامل معهم",
  learnMore: "اعرف المزيد",
} as const;

/** The five services in Arabic, same order and links as the English explorer. */
export const SERVICES_AR = [
  {
    href: "/services/tenant-representation",
    title: "وسيط عقاري للشركات",
    desc: "نمثل شركتك لا المالك: نبحث عن مكتبك في القاهرة، ونقارن الخيارات، ونتفاوض نيابةً عنك، ونراجع عقد الإيجار. الخدمة مجانية للمستأجرين.",
  },
  {
    href: "/services/primary-property",
    title: "الشراء من المطور",
    desc: "اشترِ مباشرة من المطور. نوفر لك الوصول إلى الوحدات تحت الإنشاء والمطروحة حديثًا في أنشط المشروعات في مصر.",
  },
  {
    href: "/services/property-resale",
    title: "إعادة البيع",
    desc: "اشترِ أو بِع وحدة سبق تداولها. نربط المشترين الجادين بالبائعين الراغبين في البيع، مع صورة كاملة عن السوق للطرفين.",
  },
  {
    href: "/services/investment-consultation",
    title: "الاستشارات الاستثمارية",
    desc: "لست متأكدًا أين تضع أموالك؟ نحلل العائد المتوقع ومخاطر الشغور ونمو قيمة الأصل في سوق المكاتب الإدارية في مصر.",
  },
  {
    href: "/services/income-generating-property",
    title: "عقارات مدرة للدخل",
    desc: "اعثر على وحدات تحقق دخلًا إيجاريًا ثابتًا. نحدد الأصول ذات الطلب القوي من المستأجرين والعائد المستدام في أنشط مناطق الأعمال في مصر.",
  },
] as const;

/** Deal strip ("Recently closed"): labels, plus the admin's English values in Arabic. */
export const DEAL_AR = {
  newDeal: "صفقة جديدة",
  sqm: "م²",
  leased: "مؤجرة",
  justClosed: "أُغلقت للتو",
  spaceType: "نوع المساحة",
  term: "التعاقد",
  location: "الموقع",
  carousel: "أحدث الصفقات المغلقة",
  prev: "الصفقة السابقة",
  next: "الصفقة التالية",
  goTo: (n: number) => `الانتقال إلى الصفقة ${n}`,
  aria: (sqm: string, client: string, location: string) => `أحدث صفقة مغلقة: ${sqm} م² مؤجرة لشركة ${client} في ${location}`,
};

const DEAL_VALUES_AR: Record<string, string> = {
  "administrative hq": "مقر إداري",
  "admin hq": "مقر إداري",
  "headquarters": "مقر رئيسي",
  "office": "مكتب إداري",
  "administrative office": "مكتب إداري",
  "lease": "إيجار",
  "long-term lease": "إيجار طويل الأجل",
  "short-term lease": "إيجار قصير الأجل",
  "sale": "بيع",
  "purchase": "شراء",
};

/** Arabic for a deal's space type / term; unknown values stay as typed (names). */
export const dealValueAr = (v: string) => DEAL_VALUES_AR[v.trim().toLowerCase()] ?? v;
