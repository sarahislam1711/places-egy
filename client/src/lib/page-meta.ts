// Shared by the pages (useDocumentMeta) and script/prerender.ts, so the title
// crawlers see before JS matches what renders after. Keep free of "@/" imports:
// the build script imports this file directly.

const SITE = "https://places-egy.com";

export interface StaticPageMeta {
  title: string;
  description: string;
  url: string;
}

export const STATIC_PAGE_META = {
  "/services/tenant-representation": {
    title: "Tenant Representation in Cairo | Office Leasing | PLACES",
    description:
      "Tenant representation for companies in Cairo, Egypt. As your tenant rep broker, PLACES finds office space and negotiates your lease. Free for tenants.",
    url: `${SITE}/services/tenant-representation`,
  },
  "/services/primary-property": {
    title: "Primary Property in Egypt: Buy From Developers | PLACES",
    description:
      "Primary property in Egypt: buy offices directly from developers, off-plan or at launch, with the unit, developer and payment plan assessed first.",
    url: `${SITE}/services/primary-property`,
  },
  "/services/property-resale": {
    title: "Property Resale in Egypt: Buy & Sell Offices | PLACES",
    description:
      "Property resale in Egypt: buy or sell an office that has already been transacted, priced on comparable transactions, with the transfer managed.",
    url: `${SITE}/services/property-resale`,
  },
  "/services/investment-consultation": {
    title: "Real Estate Investment Consultation in Egypt | PLACES",
    description:
      "Real estate investment consultation in Egypt: objective, data-driven advice on yield, vacancy and capital growth for commercial and administrative assets.",
    url: `${SITE}/services/investment-consultation`,
  },
  "/services/income-generating-property": {
    title: "Income Generating Property in Egypt | PLACES",
    description:
      "Income generating property in Egypt: find and buy units with real tenant demand, realistic net yield and lease terms that protect your rental income.",
    url: `${SITE}/services/income-generating-property`,
  },
  "/glossary": {
    title: "Real Estate Glossary — Office Leasing & Investment Terms | PLACES",
    description:
      "A working glossary of administrative real estate terms — leasing, financing, contracts, unit specs — used by PLACES and Egypt's office market professionals.",
    url: `${SITE}/glossary`,
  },
  "/privacy-policy": {
    title: "Privacy Policy | PLACES",
    description:
      "How PLACES collects, uses, and protects the personal information you share on places-egy.com, including cookies, enquiries, and analytics.",
    url: `${SITE}/privacy-policy`,
  },
  "/terms-of-service": {
    title: "Terms of Service | PLACES",
    description:
      "The terms that govern your use of places-egy.com and PLACES' real estate advisory and brokerage services in Egypt.",
    url: `${SITE}/terms-of-service`,
  },
} satisfies Record<string, StaticPageMeta>;

/**
 * Arabic twins of static pages (29 Nov), keyed by the Arabic path. Used by the
 * pages (useDocumentMeta) and script/prerender.ts (Arabic build-time HTML).
 */
export const AR_PAGE_META: Record<string, StaticPageMeta> = {
  "/ar/services/tenant-representation": {
    title: "وسيط عقاري للشركات في القاهرة | إيجار مكاتب إدارية | PLACES",
    description:
      "PLACES وسيط عقاري يمثل الشركات لا الملاك في إيجار المكاتب الإدارية بالقاهرة: نبحث ونقارن ونتفاوض ونراجع عقد الإيجار. الخدمة مجانية للمستأجرين.",
    url: `${SITE}/ar/services/tenant-representation`,
  },
  "/ar/services": {
    title: "خدمات المكاتب الإدارية في مصر | إيجار وشراء واستثمار | PLACES",
    description:
      "خدمات المكاتب الإدارية في مصر: وسيط عقاري للشركات (مجاني للمستأجرين)، والشراء من المطور، وإعادة البيع، والاستشارات الاستثمارية، والعقارات المدرة للدخل.",
    url: `${SITE}/ar/services`,
  },
  "/ar/services/primary-property": {
    title: "الشراء من المطور في مصر: مكاتب إدارية مباشرة من المطورين | PLACES",
    description:
      "اشترِ مكتبك الإداري مباشرة من المطور في مصر، تحت الإنشاء أو عند الطرح، بعد تقييم الوحدة والمطور وخطة السداد. وصول مبكر قبل الطرح ومتابعة حتى الاستلام.",
    url: `${SITE}/ar/services/primary-property`,
  },
  "/ar/services/property-resale": {
    title: "إعادة بيع المكاتب الإدارية في مصر: شراء وبيع | PLACES",
    description:
      "اشترِ أو بِع مكتبًا إداريًا إعادة بيع في مصر بتسعير صادق مبني على صفقات مشابهة، مع مشترين جادين ومتابعة نقل الملكية حتى الاستلام.",
    url: `${SITE}/ar/services/property-resale`,
  },
  "/ar/services/investment-consultation": {
    title: "استشارات الاستثمار العقاري في مصر | PLACES",
    description:
      "استشارات استثمار عقاري مبنية على البيانات للأصول التجارية والإدارية في مصر: العائد ومعدلات الشغور ونمو القيمة وسجل المطور، قبل أن تستثمر.",
    url: `${SITE}/ar/services/investment-consultation`,
  },
  "/ar/services/income-generating-property": {
    title: "عقارات مدرة للدخل في مصر: مكاتب بعائد إيجاري | PLACES",
    description:
      "اعثر على مكاتب ووحدات تجارية تحقق دخلًا إيجاريًا ثابتًا في مصر: نتحقق من طلب المستأجرين ونحسب العائد الصافي ونراجع عقد الإيجار قبل أن تشتري.",
    url: `${SITE}/ar/services/income-generating-property`,
  },
  "/ar/contact": {
    title: "تواصل مع PLACES | استشارة في إيجار وشراء المكاتب الإدارية",
    description:
      "تواصل مع PLACES لإيجار أو شراء مكتب إداري أو للاستشارة الاستثمارية في مصر: اتصال مباشر أو واتساب أو بريد إلكتروني، ورد في اليوم نفسه.",
    url: `${SITE}/ar/contact`,
  },
};
