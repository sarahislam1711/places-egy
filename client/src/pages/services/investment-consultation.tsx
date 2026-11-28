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
import { STATIC_PAGE_META } from "@/lib/page-meta";

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
  { icon: Scale, title: "Objective advisory", desc: "We don't earn commission on what we recommend. Our advice is based on data, not on closing a deal." },
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
  { label: "Incentives", us: "We don't earn commission on what we recommend", them: "Aligned with the developer rather than the buyer" },
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
      "Realistic ROI ranges from 12% to 20% per year when combining rental yield (8% to 14%) and value growth (4% to 8%) on well-selected commercial units. Drive-thru, medical, and prime mall units perform at the higher end. Standard admin offices in mature areas perform at the lower end. Off-plan units in growing areas can exceed 20% over full development cycles.",
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
  useDocumentMeta(STATIC_PAGE_META[PATH]);
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Investment Consultation", url: PATH },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Real Estate Investment Consultation in Egypt",
          description:
            "Data-driven advisory for investors evaluating commercial and administrative assets in Egypt, from portfolio assessment to ongoing post-acquisition support.",
          url: PATH,
          serviceType: "Real Estate Investment Advisory",
        })}
      />
      <SchemaMarkup schema={faqSchema(FAQS)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={[{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Investment Consultation" }]}
          title="Real Estate Investment Consultation in Egypt"
          intro="Our investment consultation is data-driven advisory for investors evaluating commercial and administrative assets in Egypt. It is for first-time investors, experienced investors who want a second opinion, and institutional buyers assessing assets at portfolio level."
          primary={{ label: "Talk to an advisor", href: "/contact", form: { intent: "invest", pageName: "Investment consultation" } }}
          image="/images/investment-consultation.jpg"
          imageAlt="Real estate investment consultation in Egypt"
          promise={{ title: "Objective advisory", text: "We don't earn commission on what we recommend. Our advice is based on data, not on closing a deal." }}
          points={["Yield, vacancy and growth analyzed", "We tell you when a unit doesn't fit", "Available after the acquisition"]}
        />

        <Band tone="white">
          <IntroSplit title="What is real estate investment consultation?" cardTitle="What we analyze before you invest" items={WHAT_WE_LOOK_AT}>
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
              </IntroSplit>
        </Band>

        <Band tone="cream" tight>
          <SectionHead title="Who this service is for"  compact />
          <AudienceTabs items={WHO} label="Who this service is for" />
          <p className="mt-10 text-muted-foreground">
            Renting an office rather than investing?{" "}
            <Link href="/services/tenant-representation" className="text-accent font-semibold hover:underline">
              Our tenant representation is free for tenants
            </Link>
            .
          </p>
        </Band>

        <Band tone="dark">
          <SectionHead
            dark
            title="Why choose PLACES for investment consultation"
            lead="Advice based on data, from the first assessment to the decisions that come after your acquisition."
          />
          <ReasonGrid items={WHY} dark />
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title="How the consultation works"
            lead="Four stages, starting with your objectives and continuing after the transaction."
          
            compact
          />
          <StepList steps={STEPS} />
        </Band>

        <Band tone="cream">
          <SectionHead
            title="Independent advisor vs developer sales agent"
            lead="A developer's sales agent sells only that developer's projects. An independent advisor compares options across developers and projects."
            compact
          />
          <ComparisonTable usLabel="Independent advisor (PLACES)" themLabel="Developer's sales agent" rows={COMPARISON} />
          <p className="mt-10 text-muted-foreground">
            More on choosing an advisor in our{" "}
            <Link href="/faqs/advisors-brokers" className="text-accent font-semibold hover:underline">
              advisors &amp; brokers FAQs
            </Link>
            .
          </p>
        </Band>

        <Band tone="white">
          <FaqWithAdvisor
            title="Investment consultation FAQs"
            faqs={FAQS}
            footer={
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
            }
          />
        </Band>

        <Band tone="cream">
          <SectionHead title="Explore other services" />
          <RelatedServices current="/services/investment-consultation" order={["/services/income-generating-property", "/services/primary-property", "/services/property-resale", "/services/tenant-representation"]} />
        </Band>

        <CtaBand
          title="Not sure where to invest?"
          text="We'll give you an honest, data-driven view of your options."
          primary={{ label: "Book a free consultation", href: "/contact", form: { intent: "invest", pageName: "Investment consultation" } }}
        />
      </main>

      <Footer />
    </div>
  );
}
