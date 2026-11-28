import { Building2, FileText, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import {
  AudienceTabs,
  Band,
  Checklist,
  IntroSplit,
  ComparisonTable,
  CtaBand,
  FaqWithAdvisor,
  ReasonGrid,
  RelatedServices,
  SectionHead,
  ServiceHero,
  StepList,
  type Audience,
  type Reason,
} from "@/components/service-page";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { AR_PAGE_META, STATIC_PAGE_META } from "@/lib/page-meta";
import { useLang } from "@/lib/ui-text";
import { arabicPath } from "@/lib/i18n";
import { FAQ_TOPIC_LABELS_AR } from "@/lib/landing-pages-ar";
import { SERVICE_COMMON_AR, INCOME_AR } from "@/lib/services-ar";

const PATH = "/services/income-generating-property";

const GOOD_INCOME_UNIT = [
  "A high-demand location with proven foot traffic",
  "A target tenant pool of stable businesses",
  "Lease terms with escalation clauses",
  "Low vacancy risk in the surrounding area",
  "A well-managed building, not just a good location",
  "Strong resale liquidity",
];

const WHO: Audience[] = [
  { title: "Yield-focused investors", need: "You want consistent rental income from a well-located, well-managed asset.", help: "We find and evaluate the right units.", image: "/images/income-generating-property.jpg", imageAlt: "A leased office building" },
  { title: "Portfolio builders", need: "You're building a portfolio of income-generating assets.", help: "We help you identify, evaluate, and acquire them systematically.", image: "/images/Mivida-Business-Park.jpg", imageAlt: "Mivida Business Park in New Cairo" },
  { title: "Passive investors", need: "You want an asset that generates income without requiring active management.", help: "We advise on asset quality and lease terms.", image: "/images/admin%201.jpg", imageAlt: "A meeting room in a leased office" },
];

const WHY: Reason[] = [
  { icon: TrendingUp, title: "Yield-first thinking", desc: "We evaluate every asset on its income potential, not just its location or price." },
  { icon: Users, title: "Tenant demand data", desc: "We assess real rental demand in your target area before you commit capital." },
  { icon: Building2, title: "Asset quality focus", desc: "A well-located unit in a poorly managed building is a liability. We evaluate both." },
  { icon: FileText, title: "Lease term expertise", desc: "We structure leases that protect your income: break clauses, escalations and service charges, all reviewed." },
];

const STEPS = [
  {
    title: "Tenant demand analysis",
    desc: "We assess rental demand for your target asset class and location, before you buy.",
  },
  {
    title: "Yield assessment",
    desc: "We calculate realistic net yield based on current rental rates, service charges, and vacancy assumptions.",
  },
  {
    title: "Asset quality",
    desc: "We evaluate the unit's condition, developer track record, and building management standards.",
  },
  {
    title: "Lease structuring",
    desc: "We advise on lease terms, tenant selection, and contract conditions that protect your income long term.",
  },
];

const COMPARISON = [
  { label: "Tenant demand", us: "Real rental demand in the target area assessed before you buy", them: "Assumed rather than checked" },
  { label: "Expected rent", us: "Realistic net yield from current rental rates, service charges and vacancy", them: "Based on developer projections" },
  { label: "Building", us: "Unit condition and building management evaluated", them: "A well-located unit in a poorly managed building can become a liability" },
  { label: "After handover", us: "Tenants sourced before handover, which shortens the gap", them: "Plan for 6 to 18 months of costs with no rental income" },
  { label: "Lease", us: "Break clauses, escalations and service charges reviewed", them: "Terms that may not protect your income" },
];

// Verbatim from the FAQ bank (client/src/lib/faq.ts).
const FAQS = [
  {
    question: "What is income-generating property service and how does it work?",
    answer:
      "Income-generating property services help investors monetize commercial units through full-cycle support: unit selection focused on rental performance, pre-handover tenant sourcing, fit-out management to match tenant requirements, lease negotiation for optimal terms, and ongoing property management. Some services include financing options for fit-out costs. The goal is converting an empty unit into income-producing asset within months of handover.",
  },
  {
    question: "Should I buy a commercial unit specifically to rent it out?",
    answer:
      "Yes, if your goal is monthly income with long-term appreciation. Commercial units rented to stable tenants generate 8% to 14% annual yields in Egypt, with lease terms of 3 to 9 years and yearly rent increases of 7% to 10%. Categories like medical units, drive-thrus, and pharmacy strip malls perform best for buy-to-rent strategies because of long leases and tenant loyalty.",
  },
  {
    question: "What is the average rental yield for commercial property in Egypt?",
    answer:
      "Commercial rental yields range from 8% to 14% per year, compared to 4% to 6% for residential. Grade A admin offices yield 7% to 10%, prime mall retail yields 8% to 12%, drive-thrus and prime medical units yield 10% to 14%, and well-located strip malls yield 10% to 14%. Net yields after maintenance, vacancy, and management run 1.5 to 2 percentage points below gross yields.",
  },
  {
    question: "Are admin offices a good income-generating investment?",
    answer:
      "Yes, especially small executive units (30–100 sqm) and flexible co-working layouts. Demand is rising from startups, freelancers, and Gulf-backed companies expanding into Egypt. Admin offices generate slightly lower rent than retail (Grade A at USD 334 per sqm per year) but offer higher stability with less wear and tear. Office vacancy in Grade A buildings dropped to 4.5% in 2025, signaling strong demand.",
  },
  {
    question: "How do I plan for the gap between handover and the first rental income?",
    answer:
      "Plan for 6 to 18 months of expenses with no rental income after handover. This covers fit-out time, marketing the unit, tenant negotiations, and lease finalization. Set aside cash to cover maintenance fees, installments, and utilities during this period. Working with a leasing-focused consultancy like PLACES shortens this gap by sourcing tenants before handover.",
  },
  {
    question: "How do I avoid weak rental performance after handover?",
    answer:
      "Pre-handover preparation prevents most rental disappointments: select units in proven demand locations, source tenants 6 to 12 months before delivery, prepare for fit-out timing matching tenant move-in, set realistic rent based on market comparables not developer projections, and engage property management before handover. Working with a specialized consultancy like PLACES that combines selection with leasing services dramatically reduces the post-handover income gap.",
  },
  {
    question: "How do I structure a commercial lease for stability and protection?",
    answer:
      "Include: clear permitted use matching the unit license, lease term of 5+ years for retail and 7+ years for medical, annual rent escalation of 7% to 10%, security deposit of 3 to 6 months rent, key money for prime positions, maintenance responsibilities (typically tenant's), restrictions on sub-letting, default and termination clauses, insurance requirements, and dispute resolution mechanism. Register leases longer than 9 years with the Real Estate Publicity Department for full enforceability.",
  },
];

export default function IncomeGeneratingProperty() {
  const { isAr, href: L } = useLang();
  const A = isAr ? INCOME_AR : null;
  const C = SERVICE_COMMON_AR;
  useDocumentMeta(isAr ? AR_PAGE_META[arabicPath(PATH)] : STATIC_PAGE_META[PATH]);
  const pagePath = isAr ? arabicPath(PATH) : PATH;
  const who: Audience[] = A ? WHO.map((w, i) => ({ ...w, ...A.who[i] })) : WHO;
  const faqs = A ? A.faqs : FAQS;
  const crumbs = A
    ? [{ name: C.home, href: L("/") }, { name: C.services, href: L("/services") }, { name: A.crumb }]
    : [{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Income Generating Property" }];
  const breadcrumb = A
    ? [{ name: C.home, url: L("/") }, { name: C.services, url: L("/services") }, { name: A.crumb, url: pagePath }]
    : [{ name: "Home", url: "/" }, { name: "Services", url: "/services" }, { name: "Income Generating Property", url: PATH }];
  const why: Reason[] = A ? WHY.map((r, i) => ({ ...r, ...A.why[i] })) : WHY;
  const form = { intent: "invest" as const, pageName: "Income generating property" };
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" lang={isAr ? "ar" : undefined}>
      <SchemaMarkup
        schema={breadcrumbSchema(breadcrumb)}
      />
      <SchemaMarkup
        schema={serviceSchema(
          A
            ? { name: A.schemaName, description: A.schemaDescription, url: pagePath, serviceType: A.schemaName }
            : {
                name: "Income Generating Property in Egypt",
                description:
                  "Identify and acquire units that generate consistent rental income across Egypt's most active business districts: yield-first thinking, tenant demand data, and lease structuring.",
                url: PATH,
                serviceType: "Income Generating Real Estate Advisory",
              },
        )}
      />
      <SchemaMarkup schema={faqSchema(faqs)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={crumbs}
          title={A ? A.h1 : "Income Generating Property Advisory in Egypt"}
          intro={A ? A.intro : "We help investors identify and acquire units that generate consistent rental income across Egypt's most active business districts. It is for yield-focused investors, portfolio builders and passive investors who want income without active management."}
          primary={{ label: A ? C.talk : "Talk to an advisor", href: L("/contact"), form }}
          image="/images/Allegria-Business-Park.jpg"
          imageAlt={A ? A.heroAlt : "Income generating property in Egypt"}
          promise={A ? A.promise : { title: "Yield-first thinking", text: "We evaluate every asset on its income potential, not just its location or price." }}
          points={A ? A.points : ["Tenant demand checked first", "Realistic net yield", "Leases that protect your income"]}
        />

        <Band tone="white">
          <IntroSplit title={A ? A.whatTitle : "What is income generating property?"} cardTitle={A ? A.whatCard : "What makes a unit a good income investment"} items={A ? A.goodUnit : GOOD_INCOME_UNIT}>
            {A ? A.whatText.map((t) => <p key={t}>{t}</p>) : <>
                <p>
                  Income generating property is a commercial unit bought to earn rental income from tenants. Our
                  service helps you identify and acquire units that generate consistent rental income across Egypt's
                  most active business districts.
                </p>
                <p>
                  Not all investment properties generate income consistently. Tenant demand, lease terms, and asset
                  quality all determine whether a unit performs or sits vacant, so we evaluate every asset on its
                  income potential, not just its location or price.
                </p>
            </>}
              </IntroSplit>
        </Band>

        <Band tone="cream" tight>
          <SectionHead title={A ? C.whoTitle : "Who this service is for"} compact />
          <AudienceTabs items={who} label={A ? C.whoTitle : "Who this service is for"} />
          <p className="mt-10 text-muted-foreground">
            {A ? C.rentingOwnCompany : <>Renting an office for your own company?{" "}</>}
            <Link href={L("/services/tenant-representation")} className="text-accent font-semibold hover:underline">
              {A ? C.tenantRepFree : "Our tenant representation is free for tenants"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="dark">
          <SectionHead
            dark
            title={A ? A.whyTitle : "Why choose PLACES for income generating property"}
            lead={A ? A.whyLead : "Income depends on tenant demand, the lease and the building. We check all three before you commit capital."}
          />
          <ReasonGrid items={why} dark />
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.processTitle : "How we evaluate an income property"}
            lead={A ? A.processLead : "Four checks, in order, before you buy and while you set up the lease."}
          
            compact
          />
          <StepList steps={A ? A.steps : STEPS} />
        </Band>

        <Band tone="cream">
          <SectionHead
            title={A ? A.compareTitle : "A unit bought for income vs a unit left to chance"}
            lead={A ? A.compareLead : "The difference shows after handover: a unit chosen and leased for income starts earning sooner, while a unit bought without a plan can wait months for a tenant."}
            compact
          />
          <ComparisonTable usLabel={A ? A.usLabel : "Bought for income, with PLACES"} themLabel={A ? A.themLabel : "Bought without an income plan"} rows={A ? A.comparison : COMPARISON} />
        </Band>

        <Band tone="white">
          <FaqWithAdvisor
            title={A ? A.faqTitle : "Income generating property FAQs"}
            faqs={faqs}
            footer={
              A ? (
                <>
                  {C.moreFaqs}
                  {A.faqLinks.map((slug) => (
                    <span key={slug}>
                      <Link href={L(`/faqs/${slug}`)} className="text-accent font-medium hover:underline">{FAQ_TOPIC_LABELS_AR[slug]}</Link>
                      {" · "}
                    </span>
                  ))}
                  <Link href={L("/faqs")} className="text-accent font-medium hover:underline">{C.allFaqs}</Link>
                </>
              ) : (
              <>
                More FAQs:{" "}
                <Link href="/faqs/investment-income" className="text-accent font-medium hover:underline">Investment &amp; income-generating properties</Link>
                {" · "}
                <Link href="/faqs/pricing-value" className="text-accent font-medium hover:underline">Pricing, value &amp; unit evaluation</Link>
                {" · "}
                <Link href="/faqs/contracts-legal" className="text-accent font-medium hover:underline">Contracts, legal &amp; due diligence</Link>
                {" · "}
                <Link href="/faqs" className="text-accent font-medium hover:underline">Browse all FAQs</Link>
              </>
              )
            }
          />
        </Band>

        <Band tone="cream">
          <SectionHead title={A ? C.otherServices : "Explore other services"} />
          <RelatedServices current="/services/income-generating-property" order={["/services/investment-consultation", "/services/primary-property", "/services/property-resale", "/services/tenant-representation"]} />
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Looking for consistent rental income?"}
          text={A ? A.ctaText : "We'll identify the right assets and evaluate them before you commit."}
          primary={{ label: A ? C.book : "Book a free consultation", href: L("/contact"), form }}
        />
      </main>

      <Footer />
    </div>
  );
}
