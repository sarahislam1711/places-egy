import { Link } from "wouter";
import { ArrowRight, Briefcase, Building2, Handshake } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { areaPhoto } from "@/lib/area-visuals";
import {
  Band,
  Checklist,
  IntroSplit,
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
import { AR_PAGE_META, STATIC_PAGE_META } from "@/lib/page-meta";
import { useLang } from "@/lib/ui-text";
import { areaPageHref, arabicPath } from "@/lib/i18n";
import { areaAr } from "@/lib/listing-text-ar";
import { TR_AR } from "@/lib/tenant-rep-ar";
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

// English page and its Arabic twin /ar/services/tenant-representation (29 Nov):
// one template, Arabic text from lib/tenant-rep-ar.ts.
export default function TenantRepresentation() {
  const { isAr, href: L } = useLang();
  const A = isAr ? TR_AR : null;
  useDocumentMeta(isAr ? AR_PAGE_META[arabicPath(PATH)] : STATIC_PAGE_META[PATH]);
  const pagePath = isAr ? arabicPath(PATH) : PATH;
  const who: Audience[] = A ? WHO.map((w, i) => ({ ...w, ...A.who[i] })) : WHO;
  const feeFlow = A ? FEE_FLOW.map((f, i) => ({ ...f, ...A.fee[i] })) : FEE_FLOW;
  const areas = AREAS.map((a) => {
    const slug = a.href.split("/").pop() ?? "";
    return A ? { ...a, href: areaPageHref(slug, "ar"), name: areaAr(slug), line: A.areaLine[slug] ?? a.line, imageAlt: areaAr(slug) } : a;
  });
  const faqs = A ? A.faqs : FAQS;
  const form = { intent: "rent" as const, pageName: "Tenant representation" };
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" lang={isAr ? "ar" : undefined}>
      <SchemaMarkup
        schema={breadcrumbSchema(
          A
            ? [
                { name: A.crumbs.home, url: L("/") },
                { name: A.crumbs.services, url: L("/services") },
                { name: A.crumbs.page, url: pagePath },
              ]
            : [
                { name: "Home", url: "/" },
                { name: "Services", url: "/services" },
                { name: "Tenant Representation", url: PATH },
              ],
        )}
      />
      <SchemaMarkup
        schema={serviceSchema(
          A
            ? { name: A.schemaName, description: A.schemaDescription, url: pagePath, serviceType: "تمثيل المستأجر" }
            : {
                name: "Tenant Representation",
                description:
                  "PLACES represents companies, not landlords: we find, compare and negotiate your office in Cairo and review the lease. Free for tenants; the landlord pays our fee.",
                url: PATH,
                serviceType: "Tenant representation",
              },
        )}
      />
      <SchemaMarkup schema={faqSchema(faqs)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={
            A
              ? [{ name: A.crumbs.home, href: L("/") }, { name: A.crumbs.services, href: L("/services") }, { name: A.crumbs.page }]
              : [{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Tenant Representation" }]
          }
          title={A ? A.h1 : "Tenant Representation for Companies in Cairo"}
          intro={A ? A.intro : "PLACES works for you, not the landlord. We find, compare and negotiate your office across Cairo's business districts and review the lease before you sign."}
          primary={{ label: A ? A.primary : "Send us your requirements", href: L("/contact"), form }}
          image="/images/leasing.jpg"
          imageAlt={A ? A.heroAlt : "Reviewing an office lease before signing"}
          promise={A ? A.promise : { title: "Free for tenants", text: "The landlord pays our fee once the lease is signed. Your company gets its own advisor at no cost." }}
          points={A ? A.points : ["Free for tenants", "4–8 weeks to a signed lease", "All six Cairo office districts"]}
        />

        <Band tone="white">
          <IntroSplit
            title={A ? A.whatTitle : "What is tenant representation?"}
            cardTitle={A ? A.whatCard : "With PLACES on your side"}
            items={A ? A.benefits : BENEFITS}
          >
            {A ? (
              A.whatText.map((t) => <p key={t}>{t}</p>)
            ) : (
              <>
                <p>
                  Tenant representation means your real estate advisor works only for the company that is renting. A
                  tenant representative (also called a tenant rep broker or tenant advisor) defines what you need,
                  searches the whole market, negotiates the terms and checks the lease on your side of the table.
                </p>
                <p>
                  The landlord's agent is paid to get the best deal for the landlord. Your tenant rep is there to get
                  the best deal for you.
                </p>
              </>
            )}
          </IntroSplit>
        </Band>

        <Band tone="cream" tight>
          <SectionHead title={A ? A.whoTitle : "Who we represent"} compact />
          <AudienceTabs items={who} label={A ? A.whoTitle : "Who we represent"} />
        </Band>

        <Band tone="dark" tight>
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-center">
            <SectionHead
              dark
              title={A ? A.servicesTitle : "Our tenant representation services"}
              lead={A ? A.servicesLead : "One advisor from the first brief to the day you move in, and again when your lease comes up for renewal."}
            />
            <Checklist items={A ? A.services : SERVICES} dark columns={2} />
          </div>
          <div className="mt-10 pt-10 border-t border-white/15">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight text-white">{A ? A.freeTitle : "Why it's free for tenants"}</h2>
              <p className="mt-4 text-lg text-white/75 leading-relaxed">
                {A
                  ? A.freeText
                  : "When PLACES represents you, the landlord pays our fee once the lease is signed. You get your own advisor negotiating on your side, at no cost to your company."}
              </p>
              <Link href={L("/faqs/advisors-brokers")} className="group mt-5 inline-flex items-center text-accent font-semibold hover:underline">
                {A ? A.freeLink : "Read the advisors & brokers FAQs"}{" "}
                <ArrowRight className="ms-1.5 w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
              </Link>
            </div>
            {/* How the fee flows: landlord → PLACES → your company */}
            <ol className="mt-10 flex flex-col md:flex-row items-stretch gap-2 md:gap-0" aria-label={A ? A.feeAria : "Who pays for tenant representation"}>
              {feeFlow.map((step, i) => (
                <li key={step.who} className="flex flex-col md:flex-row items-center md:flex-1">
                  <div
                    className={`w-full md:h-full rounded-2xl p-5 ${
                      i === feeFlow.length - 1 ? "bg-accent text-white" : "bg-white/[0.06] border border-white/10 text-white"
                    }`}
                  >
                    <step.icon className={`w-5 h-5 mb-3 ${i === feeFlow.length - 1 ? "text-white" : "text-accent"}`} aria-hidden />
                    <p className="font-serif font-bold text-lg leading-tight">{step.who}</p>
                    <p className={`mt-1 text-sm leading-snug ${i === feeFlow.length - 1 ? "text-white/90" : "text-white/65"}`}>{step.does}</p>
                  </div>
                  {i < feeFlow.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-white/40 shrink-0 my-1 md:my-0 md:mx-2 rotate-90 md:rotate-0 md:rtl:rotate-180" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.processTitle : "How the process works"}
            lead={
              A
                ? A.processLead
                : "Most searches take 4 to 8 weeks from the first brief to a signed lease. A core and shell office then needs 8 to 14 weeks of fit-out, which we try to cover with a rent-free period."
            }
            compact
          />
          <StepList steps={A ? A.steps : STEPS} />
          <p className="mt-10 text-muted-foreground">
            {A ? A.guideBefore : "Want the details first? Read our "}
            <Link href={L("/guides/how-to-rent-office-cairo")} className="text-accent font-semibold hover:underline">
              {A ? A.guideLink : "step-by-step guide to renting an office in Cairo"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="cream">
          <SectionHead
            title={A ? A.compareTitle : "Your own tenant rep vs the landlord's broker"}
            lead={A ? A.compareLead : "Both may show you offices. Only one is working for you."}
            compact
          />
          <ComparisonTable
            usLabel={A ? A.usLabel : "Your tenant rep (PLACES)"}
            themLabel={A ? A.themLabel : "The landlord's broker"}
            rows={A ? A.comparison : COMPARISON}
          />
        </Band>

        <Band tone="white">
          <SectionHead
            title={A ? A.areasTitle : "Areas we cover"}
            lead={A ? A.areasLead : "We search every major office district in Cairo, so you can compare areas before you compare buildings."}
          />
          <AreaTiles items={areas} slim />
          <div className="mt-14">
            <ClientLogoStrip />
          </div>
        </Band>

        <Band tone="cream">
          <FaqWithAdvisor
            title={A ? A.faqTitle : "Tenant representation FAQs"}
            faqs={faqs}
            footer={
              A ? (
                <>
                  {A.faqFooter}
                  <Link href={L("/faqs/contracts-legal")} className="text-accent font-medium hover:underline">{A.faqFooterLink}</Link>
                </>
              ) : (
                <>
                  More on leases:{" "}
                  <Link href="/faqs/contracts-legal" className="text-accent font-medium hover:underline">Contracts &amp; legal FAQs</Link>
                  {" · "}
                  <Link href="/blog/office-lease-renewal-vs-relocation" className="text-accent font-medium hover:underline">Renew your lease or relocate?</Link>
                </>
              )
            }
          />
        </Band>

        <Band tone="white">
          <SectionHead title={A ? A.buyTitle : "Buying instead of renting?"} />
          <RelatedServices current="/services/tenant-representation" order={["/services/primary-property", "/services/property-resale", "/services/income-generating-property", "/services/investment-consultation"]} />
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Ready to find your next office?"}
          text={A ? A.ctaText : "Tell us your size, area, budget and move-in date. We'll come back with a shortlist."}
          primary={{ label: A ? A.ctaButton : "Talk to an advisor", href: L("/contact"), form }}
        />
      </main>

      <Footer />
    </div>
  );
}
