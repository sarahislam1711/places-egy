import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { Band, ClientLogoStrip, CtaBand, SectionHead, ServiceCards, ServiceHero
} from "@/components/service-page";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { useLang } from "@/lib/ui-text";
import { AR_PAGE_META } from "@/lib/page-meta";
import { SERVICES_AR } from "@/lib/home-ar";
import { SERVICE_COMMON_AR, SERVICES_INDEX_AR } from "@/lib/services-ar";

// Keep in sync with the "/services" entry in script/prerender.ts (INDEX_ROUTES).
const META = {
  title: "Office Real Estate Services in Egypt | PLACES",
  description:
    "Office real estate services in Egypt: tenant representation (free for tenants), buying from developers, resale, investment advice and income property.",
  url: "https://places-egy.com/services",
};

const SERVICES = [
  {
    name: "Tenant Representation",
    desc: "We represent your company, not the landlord: we find, compare and negotiate your office and review the lease. Free for tenants.",
    slug: "tenant-representation",
    tags: ["First offices", "Relocations & expansions", "Companies entering Egypt", "Commercial brands"],
    image: "/images/leasing.jpg",
    imageAlt: "Reviewing an office lease before signing",
  },
  {
    name: "Primary Property",
    desc: "Buy directly from the developer: off-plan and newly launched units across Egypt's most active developments.",
    slug: "primary-property",
    tags: ["First-time buyers", "Early-access investors", "End users"],
    image: "/images/hero-main.jpg",
    imageAlt: "A new office development in Egypt",
  },
  {
    name: "Property Resale",
    desc: "Buy or sell a unit that has already been transacted, with full market context on both sides.",
    slug: "property-resale",
    tags: ["Ready-now buyers", "Sellers", "Value investors"],
    image: "/images/hero-section.jpg",
    imageAlt: "Office buildings available on the resale market",
  },
  {
    name: "Investment Consultation",
    desc: "Data-driven advisory for investors evaluating administrative office assets in Egypt.",
    slug: "investment-consultation",
    tags: ["First-time investors", "Second opinions", "Institutional buyers"],
    image: "/images/investment-consultation.jpg",
    imageAlt: "Reviewing investment figures for an office asset",
  },
  {
    name: "Income Generating Property",
    desc: "Identify and acquire units that generate consistent rental income across Egypt's most active business districts.",
    slug: "income-generating-property",
    tags: ["Yield-focused investors", "Portfolio builders", "Passive investors"],
    image: "/images/Allegria-Business-Park.jpg",
    imageAlt: "Allegria Business Park, an income-generating office location",
  },
];

const GUIDANCE = [
  {
    situation: "You're renting an office for your company",
    answer: "We find, compare and negotiate your office across Cairo and review the lease before you sign. The landlord pays our fee.",
    service: "Tenant Representation",
    slug: "tenant-representation",
  },
  {
    situation: "You want to buy a new unit from a developer",
    answer: "Off-plan and newly launched units, with the unit, the developer and the payment plan assessed before you commit.",
    service: "Primary Property",
    slug: "primary-property",
  },
  {
    situation: "You want a ready unit now, or you're selling one",
    answer: "Honest pricing based on comparable transactions, serious buyers, and the legal transfer managed through to handover.",
    service: "Property Resale",
    slug: "property-resale",
  },
  {
    situation: "You're not sure where to invest",
    answer: "Objective analysis of yield potential, vacancy rates and capital appreciation, based on your objectives, risk appetite and target return.",
    service: "Investment Consultation",
    slug: "investment-consultation",
  },
  {
    situation: "You want a unit that pays rent",
    answer: "Units evaluated on tenant demand, realistic net yield, building management and lease terms that protect your income.",
    service: "Income Generating Property",
    slug: "income-generating-property",
  },
];

// English /services and its Arabic twin /ar/services (29 Nov): one template.
export default function Services() {
  const { isAr, href: L } = useLang();
  const A = isAr ? SERVICES_INDEX_AR : null;
  useDocumentMeta(isAr ? AR_PAGE_META["/ar/services"] : META);
  const nameOf = (slug: string, en: string) => (A ? SERVICES_AR.find((x) => x.href === `/services/${slug}`)?.title ?? en : en);
  const services = SERVICES.map((sv) =>
    A ? { ...sv, name: nameOf(sv.slug, sv.name), desc: A.desc[sv.slug], tags: A.tags[sv.slug], imageAlt: A.imageAlt[sv.slug] } : sv,
  );
  const guidance = GUIDANCE.map((g) => (A ? { ...g, ...A.guidance[g.slug], service: nameOf(g.slug, g.service) } : g));
  const form = { intent: "other" as const, pageName: "Services" };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" lang={isAr ? "ar" : undefined}>
      <SchemaMarkup
        schema={breadcrumbSchema(
          A
            ? [
                { name: SERVICE_COMMON_AR.home, url: L("/") },
                { name: SERVICE_COMMON_AR.services, url: "/ar/services" },
              ]
            : [
                { name: "Home", url: "/" },
                { name: "Services", url: "/services" },
              ],
        )}
      />
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: A ? A.listName : "PLACES Services",
          url: `https://places-egy.com${L("/services")}`,
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.name,
              description: s.desc,
              url: `https://places-egy.com${L(`/services/${s.slug}`)}`,
              provider: { "@id": "https://places-egy.com/#organization" },
            },
          })),
        }}
      />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={A ? [{ name: SERVICE_COMMON_AR.home, href: L("/") }, { name: SERVICE_COMMON_AR.services }] : [{ name: "Home", href: "/" }, { name: "Services" }]}
          title={A ? A.h1 : "Office Real Estate Services in Egypt"}
          intro={A ? A.intro : "PLACES offers five specialized services covering the full lifecycle of administrative office real estate in Egypt, from leasing and acquisition to resale and investment advisory. Each one is built for a different decision: renting an office, buying one, selling one, or investing for income."}
          primary={{ label: A ? SERVICE_COMMON_AR.talk : "Talk to an advisor", href: L("/contact"), form }}
          image="/images/general-office.jpg"
          imageAlt={A ? A.heroAlt : "Office space in Egypt"}
          promise={A ? A.promise : { title: "Free for tenants", text: "When we represent your company in an office lease, the landlord pays our fee once the lease is signed." }}
          points={A ? A.points : ["Leasing, buying and resale", "Investment and income advice", "Free tenant representation"]}
        />

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.ourServices : "Our services"}
            lead={A ? A.ourServicesLead : "Five service areas, one team. Start with the one that matches what you're trying to do."}
            compact
          />
          <ServiceCards
            items={services.map((sv) => ({
              href: L(`/services/${sv.slug}`),
              name: sv.name,
              desc: sv.desc,
              tags: sv.tags,
              image: sv.image,
              imageAlt: sv.imageAlt,
            }))}
          />
        </Band>

        <Band tone="dark" tight>
          <SectionHead
            dark
            title={A ? A.whichTitle : "Which service do I need?"}
            lead={A ? A.whichLead : "Match your situation to the right starting point. If you're unsure, an advisor will point you to it."}
            compact
          />
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guidance.map((g) => (
              <li key={g.slug} className="flex">
                <Link
                  href={L(`/services/${g.slug}`)}
                  className="group flex w-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-colors hover:border-accent/60 hover:bg-white/[0.08]"
                >
                  <h3 className="text-lg font-serif font-bold leading-snug text-white">{g.situation}</h3>
                  <p className="mt-2 flex-1 text-sm text-white/65 leading-relaxed">{g.answer}</p>
                  <span className="mt-5 inline-flex items-center self-start gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
                    {g.service} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-white/75">
            {A ? A.guideBefore : <>Still deciding whether to rent or buy?{" "}</>}
            <Link href={L("/guides/buy-vs-rent-office-cairo")} className="text-accent font-semibold hover:underline">
              {A ? A.guideLink : "Read our guide to buying vs renting an office in Cairo"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="cream">
          <ClientLogoStrip />
          <Link
            href={L("/faqs")}
            className="mt-10 group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-2xl bg-white p-7 md:p-10 border border-primary/10 hover:border-accent transition-colors"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary group-hover:text-accent transition-colors">
                {A ? A.faqBoxTitle : "Have questions before choosing a service?"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {A ? A.faqBoxText : "Browse FAQs on Egypt's administrative office real estate market, organized into ten topic areas."}
              </p>
            </div>
            <span className="inline-flex items-center text-accent font-semibold whitespace-nowrap shrink-0">
              {A ? A.faqBoxLink : "Browse all FAQs"} <ArrowRight className="ms-2 w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </span>
          </Link>
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Not sure which service fits?"}
          text={A ? A.ctaText : "Tell us what you're trying to accomplish and we'll recommend the right starting point."}
          primary={{ label: A ? SERVICE_COMMON_AR.talk : "Talk to an advisor", href: L("/contact"), form }}
        />
      </main>

      <Footer />
      {!isAr && <CornerSlideMagnet />}
    </div>
  );
}
