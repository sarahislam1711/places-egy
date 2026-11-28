import { BarChart3, CircleSlash, Handshake, Scale } from "lucide-react";
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
import { SERVICE_COMMON_AR, INVEST_AR } from "@/lib/services-ar";

const PATH = "/services/investment-consultation";

const WHAT_WE_LOOK_AT = [
  "Yield potential and vacancy rates",
  "Capital appreciation trends",
  "Competing supply across your asset class",
  "Developer track record",
  "Lease terms and tenant quality",
  "Exit potential",
];

const WHO: Audience[] = [
  { title: "First-time investors", need: "You want to invest in Egyptian real estate but don't know where to start.", help: "We give you an honest, structured entry point.", image: "/images/places-egy-team.jpg", imageAlt: "The PLACES advisory team" },
  { title: "Experienced investors", need: "You want a second opinion on a specific asset or market opportunity.", help: "We provide objective analysis.", image: "/images/business-park.jpg", imageAlt: "A business park in Cairo" },
  { title: "Institutional buyers", need: "You're evaluating assets at a portfolio level.", help: "We provide market data, asset evaluation, and ongoing advisory.", image: "/images/offices-hero.jpg", imageAlt: "Office towers in Cairo" },
];

const WHY: Reason[] = [
  { icon: Scale, title: "Objective advisory", desc: "Our advice is based on data and your goals, not on closing a deal." },
  { icon: BarChart3, title: "Market depth", desc: "We track yield trends, vacancy rates, and capital appreciation across commercial and administrative assets in Egypt." },
  { icon: Handshake, title: "Long-term relationship", desc: "We stay available after your first acquisition, for portfolio reviews and future decisions." },
  { icon: CircleSlash, title: "We say no", desc: "If a unit doesn't fit your investment thesis, we tell you. We don't push deals that don't make sense." },
];

const STEPS = [
  {
    title: "Portfolio assessment",
    desc: "We start by understanding your investment objectives, risk appetite, and target return before recommending anything.",
  },
  {
    title: "Market analysis",
    desc: "We analyze yield potential, vacancy rates, capital appreciation trends, and competing supply across your asset class.",
  },
  {
    title: "Asset evaluation",
    desc: "We evaluate units against your criteria: developer track record, lease terms, tenant quality, and exit potential.",
  },
  {
    title: "Ongoing advisory",
    desc: "We stay available after the transaction, for portfolio reviews, lease renewals, and future acquisitions.",
  },
];

const COMPARISON = [
  { label: "Who they work across", us: "Multiple developers and projects", them: "One developer's projects only" },
  { label: "Incentives", us: "Advice based on your goals and the numbers", them: "Aligned with the developer rather than the buyer" },
  { label: "What you get", us: "Objective comparisons based on data and your criteria", them: "Detailed product knowledge, with limited objectivity" },
  { label: "If the unit doesn't fit", us: "We tell you, and don't push the deal", them: "Their job is to sell that developer's units" },
];

// Verbatim from the FAQ bank (client/src/lib/faq.ts).
const FAQS = [
  {
    question: "What is investment consultation for commercial real estate?",
    answer:
      "Investment consultation provides objective analysis of market opportunities, property types, locations, and developers based on your specific goals, budget, and risk tolerance. Quality consultation includes financial modeling, ROI projections, risk assessment, due diligence support, and ongoing portfolio review. Specialized commercial real estate consultancies like PLACES focus on commercial categories specifically, offering deeper expertise than general real estate agents.",
  },
  {
    question: "What does an investment consultation include for commercial property?",
    answer:
      "Investment consultation includes: assessment of your goals, budget, and risk tolerance, market analysis of suitable areas and property types, comparison of opportunities across developers and projects, financial projections including rental yield and capital appreciation forecasts, risk assessment, and a recommended action plan with specific units. Quality consultations are objective rather than sales-driven and prioritize fit with your situation over closing any specific deal.",
  },
  {
    question: "Is investing in commercial real estate in Egypt worth it compared to bank certificates or foreign currency?",
    answer:
      "Commercial real estate in Egypt usually outperforms bank certificates and foreign currency over the medium term. It offers rental yields between 8% and 14% per year, plus value growth over time. Certificates pay fixed returns that often fall behind inflation, and foreign currency on its own generates no income. The result depends on selection — a poorly chosen unit can underperform a savings account, which is why working with a specialized consultancy like PLACES helps.",
  },
  {
    question: "What is a realistic return on investment for commercial property in Egypt?",
    answer:
      "Realistic ROI ranges from 12% to 22% per year when combining rental yield (8% to 14%) and value growth (4% to 8%) on well-selected commercial units. Drive-thru, medical, and prime mall units perform at the higher end. Standard admin offices in mature areas perform at the lower end. Off-plan units in growing areas can do better over a full development cycle.",
  },
  {
    question: "Should my goal be rental income, value growth, or using the space for my own business?",
    answer:
      "Your goal depends on your priority. For monthly income, focus on medical units or admin offices with corporate tenants. For long-term value growth, focus on pre-launch units in growing areas. For business use, focus on visibility, accessibility, and fit with your brand. Many investors mix goals, but one should lead the decision.",
  },
  {
    question: "What is the difference between buying for rental income and buying for long-term value growth?",
    answer:
      "Rental income strategies focus on ready units in mature areas with immediate demand, accepting slower value growth for stable monthly income. Value growth strategies focus on off-plan units in developing areas, accepting delayed income for higher long-term price increases. Choose based on whether you need income now or wealth growth later.",
  },
  {
    question: "What are the biggest risks of investing in commercial real estate in Egypt?",
    answer:
      "The biggest risks are: developer delivery delays of 12 to 24 months, oversupply in specific submarkets reducing rental rates, currency devaluation cutting USD-equivalent income, unregistered properties with weak ownership protection, weak tenant demand in poorly selected locations, and overvaluation of \"prestige\" projects. Egypt's economy showed 4.4% growth and inflation slowed to 11.9% in early 2026, but currency risk and submarket oversupply remain the top concerns.",
  },
];

export default function InvestmentConsultation() {
  const { isAr, href: L } = useLang();
  const A = isAr ? INVEST_AR : null;
  const C = SERVICE_COMMON_AR;
  useDocumentMeta(isAr ? AR_PAGE_META[arabicPath(PATH)] : STATIC_PAGE_META[PATH]);
  const pagePath = isAr ? arabicPath(PATH) : PATH;
  const who: Audience[] = A ? WHO.map((w, i) => ({ ...w, ...A.who[i] })) : WHO;
  const faqs = A ? A.faqs : FAQS;
  const crumbs = A
    ? [{ name: C.home, href: L("/") }, { name: C.services, href: L("/services") }, { name: A.crumb }]
    : [{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Investment Consultation" }];
  const breadcrumb = A
    ? [{ name: C.home, url: L("/") }, { name: C.services, url: L("/services") }, { name: A.crumb, url: pagePath }]
    : [{ name: "Home", url: "/" }, { name: "Services", url: "/services" }, { name: "Investment Consultation", url: PATH }];
  const why: Reason[] = A ? WHY.map((r, i) => ({ ...r, ...A.why[i] })) : WHY;
  const form = { intent: "invest" as const, pageName: "Investment consultation" };
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
                name: "Real Estate Investment Consultation in Egypt",
                description:
                  "Data-driven advisory for investors evaluating commercial and administrative assets in Egypt, from portfolio assessment to ongoing post-acquisition support.",
                url: PATH,
                serviceType: "Real Estate Investment Advisory",
              },
        )}
      />
      <SchemaMarkup schema={faqSchema(faqs)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={crumbs}
          title={A ? A.h1 : "Real Estate Investment Consultation in Egypt"}
          intro={A ? A.intro : "Our investment consultation is data-driven advisory for investors evaluating commercial and administrative assets in Egypt. It is for first-time investors, experienced investors who want a second opinion, and institutional buyers assessing assets at portfolio level."}
          primary={{ label: A ? C.talk : "Talk to an advisor", href: L("/contact"), form }}
          image="/images/investment-consultation.jpg"
          imageAlt={A ? A.heroAlt : "Real estate investment consultation in Egypt"}
          promise={A ? A.promise : { title: "Objective advisory", text: "Our advice is based on data and your goals, not on closing a deal." }}
          points={A ? A.points : ["Yield, vacancy and growth analyzed", "We tell you when a unit doesn't fit", "Available after the acquisition"]}
        />

        <Band tone="white">
          <IntroSplit title={A ? A.whatTitle : "What is real estate investment consultation?"} cardTitle={A ? A.whatCard : "What we analyze before you invest"} items={A ? A.whatWeLookAt : WHAT_WE_LOOK_AT}>
            {A ? A.whatText.map((t) => <p key={t}>{t}</p>) : <>
                <p>
                  Investment consultation is objective analysis of market opportunities, property types, locations and
                  developers, based on your own goals, budget and risk tolerance. It comes before you buy, so the
                  decision rests on data rather than a sales pitch.
                </p>
                <p>
                  Buying a commercial or administrative unit is a long-term financial decision. The wrong asset in the
                  wrong location can take years to recover from, which is why we start with your objectives, risk
                  appetite and target return before recommending anything.
                </p>
            </>}
              </IntroSplit>
        </Band>

        <Band tone="cream" tight>
          <SectionHead title={A ? C.whoTitle : "Who this service is for"} compact />
          <AudienceTabs items={who} label={A ? C.whoTitle : "Who this service is for"} />
          <p className="mt-10 text-muted-foreground">
            {A ? C.rentingInsteadInvest : <>Renting an office rather than investing?{" "}</>}
            <Link href={L("/services/tenant-representation")} className="text-accent font-semibold hover:underline">
              {A ? C.tenantRepFree : "Our tenant representation is free for tenants"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="dark">
          <SectionHead
            dark
            title={A ? A.whyTitle : "Why choose PLACES for investment consultation"}
            lead={A ? A.whyLead : "Advice based on data, from the first assessment to the decisions that come after your acquisition."}
          />
          <ReasonGrid items={why} dark />
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.processTitle : "How the consultation works"}
            lead={A ? A.processLead : "Four stages, starting with your objectives and continuing after the transaction."}
          
            compact
          />
          <StepList steps={A ? A.steps : STEPS} />
        </Band>

        <Band tone="cream">
          <SectionHead
            title={A ? A.compareTitle : "Independent advisor vs developer sales agent"}
            lead={A ? A.compareLead : "A developer's sales agent sells only that developer's projects. An independent advisor compares options across developers and projects."}
            compact
          />
          <ComparisonTable usLabel={A ? A.usLabel : "Independent advisor (PLACES)"} themLabel={A ? A.themLabel : "Developer's sales agent"} rows={A ? A.comparison : COMPARISON} />
          <p className="mt-10 text-muted-foreground">
            {A ? A.advisorsBefore : <>More on choosing an advisor in our{" "}</>}
            <Link href={L("/faqs/advisors-brokers")} className="text-accent font-semibold hover:underline">
              {A ? A.advisorsLink : <>advisors &amp; brokers FAQs</>}
            </Link>
            .
          </p>
        </Band>

        <Band tone="white">
          <FaqWithAdvisor
            title={A ? A.faqTitle : "Investment consultation FAQs"}
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
                <Link href="/faqs/early-thinking" className="text-accent font-medium hover:underline">Early thinking &amp; understanding the decision</Link>
                {" · "}
                <Link href="/faqs/investment-income" className="text-accent font-medium hover:underline">Investment &amp; income-generating properties</Link>
                {" · "}
                <Link href="/faqs/risks-mistakes" className="text-accent font-medium hover:underline">Risks, mistakes &amp; best practices</Link>
                {" · "}
                <Link href="/faqs" className="text-accent font-medium hover:underline">Browse all FAQs</Link>
              </>
              )
            }
          />
        </Band>

        <Band tone="cream">
          <SectionHead title={A ? C.otherServices : "Explore other services"} />
          <RelatedServices current="/services/investment-consultation" order={["/services/income-generating-property", "/services/primary-property", "/services/property-resale", "/services/tenant-representation"]} />
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Not sure where to invest?"}
          text={A ? A.ctaText : "We'll give you an honest, data-driven view of your options."}
          primary={{ label: A ? C.book : "Book a free consultation", href: L("/contact"), form }}
        />
      </main>

      <Footer />
    </div>
  );
}
