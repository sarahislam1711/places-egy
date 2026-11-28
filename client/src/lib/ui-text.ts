import { useLocation } from "wouter";
import { langOfPath, localHref, twinPath, type Lang } from "@/lib/i18n";

// Site chrome text (menu, footer, phone bottom bar) in English and Arabic.
// Arabic: professional Egyptian business Arabic; the brand stays "PLACES" in
// Latin letters; Western digits.

export const UI = {
  en: {
    adminOffices: "Admin Offices",
    locations: "Locations",
    services: "Services",
    about: "About",
    resources: "Resources",
    contact: "Contact",
    browseListings: "Browse Listings",
    whatsappDirect: "WhatsApp us directly",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    lookingFor: "What are you looking for?",
    viewAllAdmin: "View all admin offices",
    switchTo: "العربية",
    switchToLabel: "اقرأ هذه الصفحة بالعربية",
    resourcesItems: { blog: "Blog", guides: "Guides", faqs: "FAQs", glossary: "Glossary" },
    servicesItems: {
      tenantRep: "Tenant Representation",
      primary: "Primary Property",
      resale: "Property Resale",
      investment: "Investment Consultation",
      income: "Income Generating Property",
    },
    adminItems: {
      rent: { title: "Rent", tagline: "Lease admin office space" },
      sale: { title: "Sale", tagline: "Buy admin office space" },
      income: { title: "Income Property", tagline: "Rented units generating yields" },
      primary: { title: "Primary", tagline: "Off-plan direct from developers" },
    },
    footer: {
      tagline: "Egypt's specialized partner for administrative office real estate. Buy, lease, or resell offices throughout Egypt with confidence.",
      browse: "Browse",
      allListings: "All listings",
      adminOffices: "Admin offices",
      explore: "Explore",
      developers: "Browse all Developers",
      projects: "Browse all Projects",
      locations: "Browse all Locations",
      popular: "Popular searches",
      rentNewCairo: "Offices for rent in New Cairo",
      buyNewCairo: "Offices for sale in New Cairo",
      incomeNewCairo: "Income properties in New Cairo",
      rentZayed: "Offices for rent in Sheikh Zayed",
      services: "Services",
      marketReport: "Free Market Report",
      company: "Company",
      about: "About",
      profile: "Company Profile",
      contact: "Contact",
      resources: "Resources",
      blog: "Blog",
      otherBlog: "Arabic blog",
      guides: "Guides",
      faqs: "FAQs",
      glossary: "Glossary",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      on: (name: string) => `PLACES on ${name}`,
    },
    bar: { browse: "Browse", call: "Call", whatsapp: "WhatsApp" },
  },
  ar: {
    adminOffices: "المكاتب الإدارية",
    locations: "المناطق",
    services: "الخدمات",
    about: "من نحن",
    resources: "دليلك",
    contact: "تواصل معنا",
    browseListings: "تصفح المكاتب",
    whatsappDirect: "راسلنا على واتساب",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    lookingFor: "ما الذي تبحث عنه؟",
    viewAllAdmin: "كل المكاتب الإدارية",
    switchTo: "English",
    switchToLabel: "Read this page in English",
    resourcesItems: { blog: "المدونة", guides: "الأدلة", faqs: "الأسئلة الشائعة", glossary: "قاموس المصطلحات" },
    servicesItems: {
      tenantRep: "وسيط عقاري للشركات",
      primary: "الشراء من المطور",
      resale: "إعادة البيع",
      investment: "الاستشارات الاستثمارية",
      income: "عقارات مدرة للدخل",
    },
    adminItems: {
      rent: { title: "إيجار", tagline: "مكاتب إدارية للإيجار" },
      sale: { title: "شراء", tagline: "مكاتب إدارية للبيع" },
      income: { title: "عقار مدر للدخل", tagline: "وحدات مؤجرة بعائد إيجاري" },
      primary: { title: "من المطور", tagline: "وحدات جديدة مباشرة من المطور" },
    },
    footer: {
      tagline: "PLACES شريكك المتخصص في المكاتب الإدارية في مصر: شراء وإيجار وإعادة بيع المكاتب بثقة.",
      browse: "تصفح",
      allListings: "كل المكاتب المتاحة",
      adminOffices: "المكاتب الإدارية",
      explore: "اكتشف",
      developers: "كل المطورين",
      projects: "كل المشروعات",
      locations: "كل المناطق",
      popular: "عمليات بحث شائعة",
      rentNewCairo: "مكاتب للإيجار في التجمع الخامس",
      buyNewCairo: "مكاتب للبيع في التجمع الخامس",
      incomeNewCairo: "عقارات مدرة للدخل في التجمع الخامس",
      rentZayed: "مكاتب للإيجار في الشيخ زايد",
      services: "الخدمات",
      marketReport: "تقرير السوق المجاني",
      company: "الشركة",
      about: "من نحن",
      profile: "ملف الشركة",
      contact: "تواصل معنا",
      resources: "دليلك",
      blog: "المدونة",
      otherBlog: "المدونة بالإنجليزية",
      guides: "الأدلة",
      faqs: "الأسئلة الشائعة",
      glossary: "قاموس المصطلحات",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الاستخدام",
      on: (name: string) => `PLACES على ${name}`,
    },
    bar: { browse: "تصفح", call: "اتصل", whatsapp: "واتساب" },
  },
} as const;

/**
 * Language of the current page plus helpers: `t` (its UI text), `href(enPath)`
 * (the Arabic twin when it exists, else the English page) and `twin` (this
 * page in the other language, or null).
 */
export function useLang() {
  const [location] = useLocation();
  const path = location.split(/[?#]/)[0];
  const lang: Lang = langOfPath(path);
  return {
    lang,
    isAr: lang === "ar",
    t: UI[lang],
    href: (enPath: string) => localHref(enPath, lang),
    twin: twinPath(path),
  };
}
