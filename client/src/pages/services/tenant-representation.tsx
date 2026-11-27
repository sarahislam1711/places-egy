import { Link } from "wouter";
import { ArrowRight, Briefcase, Building2, Handshake } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { areaPhoto } from "@/lib/area-visuals";
import {
  Band,
  Checklist,
  ComparisonTable,
  CtaBand,
  FaqWithAdvisor,
  SectionHead,
  ServiceHero,
  StepList,
  AudienceTabs,
  type Audience,
  ClientLogoStrip,
  AreaTiles,
  RelatedServices,
} from "@/components/service-page";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { STATIC_PAGE_META } from "@/lib/page-meta";
import { LOCATION_CONTENT } from "@/lib/location-content";

const PATH = "/services/tenant-representation";

const FEE_FLOW = [
  { icon: Building2, who: "The landlord", does: "pays our fee when the lease is signed" },
  { icon: Handshake, who: "PLACES", does: "negotiates on your side of the table" },
  { icon: Briefcase, who: "Your company", does: "pays nothing for the service" },
];

const WHO: Audience[] = [
  { title: "Companies securing their first office", need: "You need a space that works for your team, fits your budget and gives you room to grow.", help: "We help you find it without wasting time on the wrong options.", image: "/images/admin%202.jpg", imageAlt: "A private office with a desk and chairs, ready for a team" },
  { title: "Growing teams relocating or expanding", need: "You need more space, a better location, or both.", help: "We assess what's available and negotiate the best terms for your situation.", image: "/images/business-complex.jpg", imageAlt: "Office buildings in a Cairo business district" },
  { title: "International companies entering Egypt", need: "You need the right area and a clear view of how office leases work in Egypt.", help: "We secure your first office or regional HQ in Cairo.", image: "/images/offices-hero.jpg", imageAlt: "Office towers in Cairo" },
  { title: "Brands securing commercial space", need: "You need the right unit in the right development.", help: "We evaluate footfall, lease terms and operational fit before you commit.", image: "/images/commercial.jpg", imageAlt: "Commercial units in a Cairo development" },
];

const BENEFITS = [
  "You see every suitable office, not one landlord's building",
  "You negotiate with market data, not guesswork",
  "You sign a lease that has been checked clause by clause",
  "You pay nothing for it: the landlord pays our fee",
];

// All six areas, with each area guide's first highlight as the one-liner.
// Short versions of each area guide's first highlight, so every tile fits
// the same space without cutting words.
const AREA_LINE: Record<string, string> = {
  "new-cairo": "Egypt's most active office market",
  "sheikh-zayed": "West Cairo's most connected business district",
  maadi: "A favourite of multinationals and embassies",
  "downtown-cairo": "Egypt's most central business district",
  "6th-october": "A large planned city with mature infrastructure",
  sheraton: "5 minutes from Cairo International Airport",
};
const AREAS = Object.values(LOCATION_CONTENT).map((a) => ({
  href: `/locations/${a.slug}`,
  name: a.displayName,
  line: AREA_LINE[a.slug] ?? a.highlights?.[0] ?? a.subtitle,
  image: areaPhoto(a.slug).image,
  imageAlt: areaPhoto(a.slug).alt,
}));

const STEPS = [
  {
    title: "Your brief",
    desc: "Headcount today and in 12 and 36 months, budget, preferred areas, finishing level and move-in date. Everything else follows from this.",
  },
  {
    title: "Full-market search",
    desc: "We search across Cairo's business parks, office buildings and mixed-use projects, including units that aren't advertised, and filter out what doesn't fit.",
  },
  {
    title: "Shortlist and viewings",
    desc: "A short list of real options with rent per m², service charges and finishing compared side by side, then viewings we arrange and attend with you.",
  },
  {
    title: "Negotiation",
    desc: "We negotiate the rent, the rent-free period, the yearly increase, service charges and any fit-out contribution: the terms that decide what the office really costs.",
  },
  {
    title: "Lease review and signing",
    desc: "We check every clause before you sign: term, increases, deposit, handover condition, break and renewal options, so there are no surprises after you move in.",
  },
  {
    title: "Fit-out, move-in and beyond",
    desc: "We stay with you through handover and fit-out, and come back when it's time to renew, renegotiate, expand or move.",
  },
];

const SERVICES = [
  "Requirements brief and space planning (how many m² you actually need)",
  "Full-market search, including units that aren't online",
  "Side-by-side comparison of rent, service charges, finishing and location",
  "Viewings arranged and attended with you",
  "Negotiation of rent, rent-free period, yearly increases and fit-out contribution",
  "Lease review before signing",
  "Support through handover and fit-out",
  "Lease renewals, renegotiations, expansions and relocations",
];

const COMPARISON = [
  { label: "Works for", us: "You, the company renting the office", them: "The landlord or developer" },
  { label: "Which offices you see", us: "Every option that fits your brief, across many buildings", them: "Their own building or portfolio" },
  { label: "Goal in the negotiation", us: "The lowest total cost and the safest terms for you", them: "The highest rent and the longest commitment" },
  { label: "Lease review", us: "Every clause checked from the tenant's side", them: "Drafted to protect the landlord" },
  { label: "Cost to your company", us: "Free: the landlord pays our fee", them: "Paid by the landlord" },
];

const FAQS = [
  {
    question: "What is tenant representation?",
    answer:
      "Tenant representation means a real estate advisor works only for the company that is renting, not for the landlord. The advisor (also called a tenant representative, tenant rep broker or tenant advisor) defines what you need, searches the whole market, negotiates the lease terms and reviews the contract on your behalf.",
  },
  {
    question: "How much does tenant representation cost in Egypt?",
    answer:
      "With PLACES it is free for the tenant. The landlord pays our fee when the lease is signed, so your company gets its own advisor at no cost.",
  },
  {
    question: "How long does an office search in Cairo take?",
    answer:
      "Most searches take 4 to 8 weeks from the first brief to a signed lease. If the office is delivered core and shell, plan another 8 to 14 weeks for fit-out, which is why we negotiate a rent-free fit-out period.",
  },
  {
    question: "Do you only show your own listings?",
    answer:
      "No. We search across developers, business parks and office buildings, including units that are not advertised online, and show you every option that fits your brief.",
  },
  {
    question: "What can a tenant rep negotiate for us?",
    answer:
      "The rent per m², a rent-free period at the start of the lease, the yearly rent increase, service charges, the deposit, a fit-out contribution from the landlord, and break and renewal options. Together these decide what the office really costs over the lease.",
  },
  {
    question: "Can you help us renew or renegotiate our current lease?",
    answer:
      "Yes. We compare your current terms with the market, tell you whether to stay or move, and negotiate the renewal for you. Starting well before your lease ends gives you the most leverage.",
  },
  {
    question: "Do you work with international companies opening an office in Egypt?",
    answer:
      "Yes. We help multinational companies choose the right area, understand how office leases work in Egypt, and secure their first office or regional headquarters in Cairo.",
  },
  {
    question: "What's the difference between a tenant rep and the landlord's agent?",
    answer:
      "The landlord's agent works for the landlord and shows you their own building. A tenant rep works for you, compares every suitable option across the market and negotiates against the landlord on your behalf.",
  },
  {
    question: "Do you also help companies buy an office?",
    answer:
      "Yes. If owning makes more sense than renting, we help companies buy offices directly from developers or on the resale market, through our primary property and property resale services.",
  },
];

export default function TenantRepresentation() {
  useDocumentMeta(STATIC_PAGE_META[PATH]);
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Tenant Representation", url: PATH },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Tenant Representation",
          description:
            "PLACES represents companies, not landlords: we find, compare and negotiate your office in Cairo and review the lease. Free for tenants; the landlord pays our fee.",
          url: PATH,
          serviceType: "Tenant representation",
        })}
      />
      <SchemaMarkup schema={faqSchema(FAQS)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={[{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Tenant Representation" }]}
          title="Tenant Representation for Companies in Cairo"
          intro="PLACES works for you, not the landlord. We find, compare and negotiate your office across Cairo's business districts and review the lease before you sign."
          primary={{ label: "Send us your requirements", href: "/contact", form: { intent: "rent", pageName: "Tenant representation" } }}
          image="/images/leasing.jpg"
          imageAlt="Reviewing an office lease before signing"
          promise={{ title: "Free for tenants", text: "The landlord pays our fee once the lease is signed. Your company gets its own advisor at no cost." }}
          points={["Free for tenants", "4–8 weeks to a signed lease", "All six Cairo office districts"]}
        />

        <Band tone="white">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionHead title="What is tenant representation?" />
              <div className="-mt-4 space-y-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
                <p>
                  Tenant representation means your real estate advisor works only for the company that is renting. A
                  tenant representative (also called a tenant rep broker or tenant advisor) defines what you need,
                  searches the whole market, negotiates the terms and checks the lease on your side of the table.
                </p>
                <p>
                  The landlord's agent is paid to get the best deal for the landlord. Your tenant rep is there to get
                  the best deal for you.
                </p>
              </div>
            </div>
            <div className="lg:pt-3 rounded-2xl bg-background p-7 md:p-9">
              <p className="text-sm font-semibold text-primary mb-5">With PLACES on your side:</p>
              <Checklist items={BENEFITS} />
            </div>
          </div>
        </Band>

        <Band tone="cream">
          <SectionHead title="Who we represent" />
          <AudienceTabs items={WHO} label="Who we represent" />
        </Band>

        <Band tone="dark">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-start">
            <SectionHead
              dark
              title="Our tenant representation services"
              lead="One advisor from the first brief to the day you move in, and again when your lease comes up for renewal."
            />
            <Checklist items={SERVICES} dark columns={2} />
          </div>
          <div className="mt-14 pt-12 border-t border-white/15">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight text-white">Why it's free for tenants</h2>
              <p className="mt-4 text-lg text-white/75 leading-relaxed">
                When PLACES represents you, the landlord pays our fee once the lease is signed. You get your own
                advisor negotiating on your side, at no cost to your company.
              </p>
              <Link href="/faqs/advisors-brokers" className="group mt-5 inline-flex items-center text-accent font-semibold hover:underline">
                Read the advisors &amp; brokers FAQs <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
            {/* How the fee flows: landlord → PLACES → your company */}
            <ol className="mt-10 flex flex-col md:flex-row items-stretch gap-2 md:gap-0" aria-label="Who pays for tenant representation">
              {FEE_FLOW.map((step, i) => (
                <li key={step.who} className="flex flex-col md:flex-row items-center md:flex-1">
                  <div
                    className={`w-full md:h-full rounded-2xl p-5 ${
                      i === FEE_FLOW.length - 1 ? "bg-accent text-white" : "bg-white/[0.06] border border-white/10 text-white"
                    }`}
                  >
                    <step.icon className={`w-5 h-5 mb-3 ${i === FEE_FLOW.length - 1 ? "text-white" : "text-accent"}`} aria-hidden />
                    <p className="font-serif font-bold text-lg leading-tight">{step.who}</p>
                    <p className={`mt-1 text-sm leading-snug ${i === FEE_FLOW.length - 1 ? "text-white/90" : "text-white/65"}`}>{step.does}</p>
                  </div>
                  {i < FEE_FLOW.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-white/40 shrink-0 my-1 md:my-0 md:mx-2 rotate-90 md:rotate-0" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Band>

        <Band tone="white">
          <SectionHead
            title="How the process works"
            lead="Most searches take 4 to 8 weeks from the first brief to a signed lease. A core and shell office then needs 8 to 14 weeks of fit-out, which we try to cover with a rent-free period."
          />
          <StepList steps={STEPS} />
          <p className="mt-10 text-muted-foreground">
            Want the details first? Read our{" "}
            <Link href="/guides/how-to-rent-office-cairo" className="text-accent font-semibold hover:underline">
              step-by-step guide to renting an office in Cairo
            </Link>
            .
          </p>
        </Band>

        <Band tone="cream">
          <SectionHead title="Your own tenant rep vs the landlord's broker" lead="Both may show you offices. Only one is working for you." />
          <ComparisonTable usLabel="Your tenant rep (PLACES)" themLabel="The landlord's broker" rows={COMPARISON} />
        </Band>

        <Band tone="white">
          <SectionHead
            title="Areas we cover"
            lead="We search every major office district in Cairo, so you can compare areas before you compare buildings."
          />
          <AreaTiles items={AREAS} />
          <div className="mt-14">
            <ClientLogoStrip />
          </div>
        </Band>

        <Band tone="cream">
          <FaqWithAdvisor
            title="Tenant representation FAQs"
            faqs={FAQS}
            footer={
              <>
                More on leases:{" "}
                <Link href="/faqs/contracts-legal" className="text-accent font-medium hover:underline">Contracts &amp; legal FAQs</Link>
                {" · "}
                <Link href="/blog/office-lease-renewal-vs-relocation" className="text-accent font-medium hover:underline">Renew your lease or relocate?</Link>
              </>
            }
          />
        </Band>

        <Band tone="white">
          <SectionHead title="Buying instead of renting?" />
          <RelatedServices current="/services/tenant-representation" order={["/services/primary-property", "/services/property-resale", "/services/income-generating-property", "/services/investment-consultation"]} />
        </Band>

        <CtaBand
          title="Ready to find your next office?"
          text="Tell us your size, area, budget and move-in date. We'll come back with a shortlist."
          primary={{ label: "Talk to an advisor", href: "/contact", form: { intent: "rent", pageName: "Tenant representation" } }}
        />
      </main>

      <Footer />
    </div>
  );
}
