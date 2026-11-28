import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BellRing, ClipboardCheck, Scale, SearchCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingCardAr } from "@/components/listings/ListingCardAr";
import {
  AudienceTabs,
  Band,
  Checklist,
  IntroSplit,
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
import { supabase, type Listing } from "@/lib/supabase";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { AR_PAGE_META, STATIC_PAGE_META } from "@/lib/page-meta";
import { useLang } from "@/lib/ui-text";
import { arabicPath } from "@/lib/i18n";
import { FAQ_TOPIC_LABELS_AR } from "@/lib/landing-pages-ar";
import { SERVICE_COMMON_AR, PRIMARY_AR } from "@/lib/services-ar";

const PATH = "/services/primary-property";

const WHAT_WE_DO = [
  "Direct relationships with Egypt's most active developers, including pre-launch and off-market opportunities",
  "An assessment of the unit, floor plan, developer track record and payment plan",
  "A clear view of whether the pricing is competitive and what similar units are trading at",
  "Paperwork, payment milestones and handover managed on your behalf",
];

const WHO: Audience[] = [
  { title: "First-time buyers", need: "You want to buy in a strong development at the best available price.", help: "We give you access and market context.", image: "/images/business-park.jpg", imageAlt: "A business park in Cairo" },
  { title: "Investors", need: "You want early access to units before they hit the secondary market at a premium.", help: "We track launches and give you first access.", image: "/images/mixed-use.jpg", imageAlt: "A mixed-use office development" },
  { title: "End users", need: "You want a unit you'll eventually occupy.", help: "We evaluate the development, the payment plan, and the handover timeline.", image: "/images/general-office.jpg", imageAlt: "An office in use" },
];

const WHY: Reason[] = [
  { icon: BellRing, title: "We know the launches", desc: "We track every major developer launch in Egypt, so you never miss a strong opportunity." },
  { icon: SearchCheck, title: "We evaluate before you buy", desc: "We assess the unit, the developer, and the payment plan, not just the brochure." },
  { icon: ClipboardCheck, title: "We manage the process", desc: "From reservation to handover, we manage every step so nothing falls through." },
  { icon: Scale, title: "Independent perspective", desc: "We're not employed by any developer. Our recommendations are based on the unit, not on who's selling it." },
];

const STEPS = [
  {
    title: "Your goal and budget",
    desc: "Whether you'll occupy the unit or invest in it, and what down payment and installment plan suit you. Every recommendation follows from this.",
  },
  {
    title: "Developers and launches",
    desc: "We track every major developer launch in Egypt and use our direct developer relationships, including pre-launch and off-market opportunities, to shortlist what fits.",
  },
  {
    title: "Unit evaluation",
    desc: "We assess the unit, floor plan, developer track record and payment plan before you commit.",
  },
  {
    title: "Price check",
    desc: "We tell you whether the pricing is competitive and what similar units are trading at, so you know where the launch price stands.",
  },
  {
    title: "Reservation and payments",
    desc: "We manage the paperwork and payment milestones on your behalf, so nothing falls through.",
  },
  {
    title: "Handover",
    desc: "We stay with you to handover and manage it on your behalf, the last step of buying directly from the developer.",
  },
];

const COMPARISON = [
  { label: "Who you buy from", a: "The developer, usually off-plan or at a new launch", b: "An existing owner: a ready unit or a partially-paid contract" },
  { label: "Payment", a: "Developer installment plans of 5 to 10 years, with 5% to 20% down", b: "Less remaining payment plan flexibility" },
  { label: "When you get the unit", a: "After construction and handover", b: "Immediately, with no construction wait" },
  { label: "Rental income", a: "None during the construction period", b: "Some units come with existing tenants and day-one rental income" },
  { label: "Main risks", a: "Delivery delays, masterplan changes, developer financial issues", b: "Hidden defects, outstanding maintenance fees, contracts that may not transfer cleanly" },
];

// Verbatim from the FAQ bank (client/src/lib/faq.ts).
const FAQS = [
  {
    question: "What is the difference between primary and resale commercial properties in Egypt?",
    answer:
      "Primary properties are bought directly from the developer, usually off-plan with installment plans of 5 to 10 years and 5% to 20% down payment. Resale properties are bought from existing owners — either ready units or partially-paid contracts transferred to new buyers. Primary offers lower entry prices and longer payment terms; resale offers immediate ownership, no construction wait, and often pre-existing tenants.",
  },
  {
    question: "What are the advantages of buying primary commercial units off-plan?",
    answer:
      "Off-plan units offer the lowest entry price (often 30% to 50% below ready unit prices), extended installment plans of 5 to 10 years, choice of best-positioned units before they sell out, and full capital appreciation through the development cycle. Investors who buy at pre-launch and sell before tenant move-in season can earn 25% to 60% appreciation without ever leasing the unit, according to recent market reports.",
  },
  {
    question: "What are the risks of buying primary off-plan commercial units?",
    answer:
      "Risks include developer delivery delays of 1 to 3 years beyond promised dates, masterplan changes that affect unit value, developer financial issues that can stop construction, area development that lags expectations, and the income gap during the construction period. These risks are reduced by choosing established developers with strong delivery track records, registered contracts, and clear penalty clauses for delays.",
  },
  {
    question: "What are the typical payment plans offered by developers for commercial units?",
    answer:
      "Common payment plans range from 5% to 20% down payment with installments over 5 to 10 years. Some developers offer plans like 5% down with 7 to 8 years of installments, or 15% down with 6-year plans, or 30% down with 3-year plans. Cash payments earn discounts of 20% to 40%. Longer payment plans favor investors managing cash flow, while shorter plans favor those wanting better total prices.",
  },
  {
    question: "How do I verify a developer's track record before investing?",
    answer:
      "Visit completed projects to inspect quality, finishing, and current condition. Talk to existing owners about delivery dates and developer responsiveness. Check official registration on realestate.gov.eg. Review the developer's financial reports, recent sales figures, and credit ratings if listed on EGX. Look for delivery history of at least 10 years and multiple completed projects in the same category as your target investment.",
  },
  {
    question: "Should I buy directly from a developer or through an advisor?",
    answer:
      "Going directly to a developer can occasionally yield small price savings but eliminates negotiation leverage, comparison opportunities, and post-purchase support that advisors provide. Quality advisors negotiate developer discounts, secure better unit positions, and coordinate the full transaction process — usually adding more value than their commission costs. For commercial property especially, the complexity makes advisor support worthwhile for most buyers.",
  },
  {
    question: "How do advisors get exclusive listings or pre-launch access?",
    answer:
      "Established advisors maintain partnership agreements with major developers, giving them early access to project launches before public release. Top developers often allocate 30% to 50% of inventory to broker partners during pre-launch phases. Advisors with strong developer relationships secure prime units (corner positions, ground floor retail, premium drive-thru spots) before they reach public sales channels.",
  },
];

/** Neutral side-by-side table: neither column is "wrong", so no ticks or crosses. */
function SideBySide({ left, right, rows }: { left: string; right: string; rows: { label: string; a: string; b: string }[] }) {
  const { isAr } = useLang();
  return (
    <>
      <div className="md:hidden space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-2xl bg-white p-5">
            <h3 className="font-bold text-primary mb-3">{r.label}</h3>
            <p className="text-sm mb-2"><span className="font-semibold text-primary">{left}:</span> <span className="text-muted-foreground">{r.a}</span></p>
            <p className="text-sm"><span className="font-semibold text-primary">{right}:</span> <span className="text-muted-foreground">{r.b}</span></p>
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white">
        <table className="w-full text-[15px]">
          <thead>
            <tr>
              <th className="px-5 py-4 w-[24%]" scope="col"><span className="sr-only">{isAr ? SERVICE_COMMON_AR.comparedOn : "Compared on"}</span></th>
              <th className="px-5 py-4 text-start font-serif text-lg font-bold text-white bg-primary" scope="col">{left}</th>
              <th className="px-5 py-4 text-start font-serif text-lg font-bold text-primary" scope="col">{right}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-primary/10">
                <th className="px-5 py-3.5 text-start font-semibold text-primary align-top" scope="row">{r.label}</th>
                <td className="px-5 py-3.5 align-top bg-primary/[0.03] text-primary">{r.a}</td>
                <td className="px-5 py-3.5 align-top text-muted-foreground">{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function PrimaryProperty() {
  const { isAr, href: L } = useLang();
  const A = isAr ? PRIMARY_AR : null;
  const C = SERVICE_COMMON_AR;
  useDocumentMeta(isAr ? AR_PAGE_META[arabicPath(PATH)] : STATIC_PAGE_META[PATH]);
  const pagePath = isAr ? arabicPath(PATH) : PATH;
  const who: Audience[] = A ? WHO.map((w, i) => ({ ...w, ...A.who[i] })) : WHO;
  const faqs = A ? A.faqs : FAQS;
  const crumbs = A
    ? [{ name: C.home, href: L("/") }, { name: C.services, href: L("/services") }, { name: A.crumb }]
    : [{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Primary Property" }];
  const breadcrumb = A
    ? [{ name: C.home, url: L("/") }, { name: C.services, url: L("/services") }, { name: A.crumb, url: pagePath }]
    : [{ name: "Home", url: "/" }, { name: "Services", url: "/services" }, { name: "Primary Property", url: PATH }];
  const why: Reason[] = A ? WHY.map((r, i) => ({ ...r, ...A.why[i] })) : WHY;
  const form = { intent: "buy" as const, pageName: "Primary property" };
  const { data: saleListings = [], isPending } = useQuery<Listing[]>({
    queryKey: ["primary-property-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq("is_test", false)
        .eq("property_type", "admin")
        .eq("transaction_type", "sale")
        .neq("rental_status", "rented")
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

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
                name: "Primary Property in Egypt",
                description:
                  "Buy directly from the developer: off-plan and newly launched units across Egypt's most active developments, with unit evaluation and transaction management.",
                url: PATH,
                serviceType: "Primary Real Estate Sales",
              },
        )}
      />
      <SchemaMarkup schema={faqSchema(faqs)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={crumbs}
          title={A ? A.h1 : "Buy Offices Directly From Developers in Egypt"}
          intro={A ? A.intro : "Our primary property service helps you buy directly from the developer: off-plan and newly launched units across Egypt's most active developments. It is for first-time buyers, investors and end users who want the unit, the developer and the payment plan evaluated before they commit."}
          primary={{ label: A ? C.talk : "Talk to an advisor", href: L("/contact"), form }}
          image="/images/hero-main.jpg"
          imageAlt={A ? A.heroAlt : "Primary property in Egypt"}
          promise={A ? A.promise : { title: "Independent perspective", text: "We're not employed by any developer. Our recommendations are based on the unit, not on who's selling it." }}
          points={A ? A.points : ["Pre-launch and off-market access", "Unit, developer and payment plan assessed", "Managed from reservation to handover"]}
        />

        <Band tone="white">
          <IntroSplit title={A ? A.whatTitle : "What is primary property?"} cardTitle={A ? A.whatCard : "What PLACES does for you"} items={A ? A.whatWeDo : WHAT_WE_DO}>
            {A ? A.whatText.map((t) => <p key={t}>{t}</p>) : <>
                <p>
                  Primary property means buying a unit directly from the developer, usually off-plan or at a new
                  launch, instead of from an existing owner. Primary units are usually sold on developer installment
                  plans of 5 to 10 years with a 5% to 20% down payment.
                </p>
                <p>
                  Buying directly from a developer gives you the best pricing, flexible payment plans, and access to
                  units before they hit the secondary market. But not all launches are equal, so we assess the unit,
                  the developer and the payment plan, not just the brochure.
                </p>
            </>}
              </IntroSplit>
        </Band>

        <Band tone="cream" tight>
          <SectionHead title={A ? C.whoTitle : "Who this service is for"} compact />
          <AudienceTabs items={who} label={A ? C.whoTitle : "Who this service is for"} />
          <p className="mt-10 text-muted-foreground">
            {A ? C.rentingInstead : <>Renting instead of buying?{" "}</>}
            <Link href={L("/services/tenant-representation")} className="text-accent font-semibold hover:underline">
              {A ? C.tenantRepFree : "Our tenant representation is free for tenants"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="dark">
          <SectionHead
            dark
            title={A ? A.whyTitle : "Why choose PLACES for primary property"}
            lead={A ? A.whyLead : "We work across developers, not for one of them, and stay with you from the first shortlist to handover."}
          />
          <ReasonGrid items={why} dark />
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.processTitle : "How buying from a developer works"}
            lead={A ? A.processLead : "Buying a commercial unit runs from defining your goal and budget to handover. We manage every step from reservation to handover."}
          
            compact
          />
          <StepList steps={A ? A.steps : STEPS} />
          <p className="mt-10 text-muted-foreground">
            {A ? A.guideBefore : <>Still deciding whether to buy at all? Read our{" "}</>}
            <Link href={L("/guides/buy-vs-rent-office-cairo")} className="text-accent font-semibold hover:underline">
              {A ? A.guideLink : "guide to buying vs renting an office in Cairo"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="cream" tight>
          <SectionHead
            title={A ? A.compareTitle : "Primary vs resale property"}
            lead={A ? A.compareLead : "Primary suits buyers with longer time horizons who want developer payment plans. Resale suits buyers who want the unit now and want to skip handover delays."}
            compact
          />
          <SideBySide left={A ? A.left : "Primary (from the developer)"} right={A ? A.right : "Resale (from an owner)"} rows={A ? A.comparison : COMPARISON} />
          <p className="mt-10 text-muted-foreground">
            {A ? A.resaleBefore : <>Prefer a ready unit?{" "}</>}
            <Link href={L("/services/property-resale")} className="text-accent font-semibold hover:underline">
              {A ? A.resaleLink : "See our property resale service"}
            </Link>
            .
          </p>
        </Band>

        <Band tone="white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 md:mb-14">
            <h2 className="text-3xl md:text-[2.75rem] font-serif font-bold leading-[1.1] tracking-[-0.02em] text-balance text-primary">
              {A ? C.forSaleTitle : "Units currently available for sale"}
            </h2>
            <a href={L("/buy")} className="inline-flex items-center text-accent font-semibold hover:underline shrink-0">
              {A ? C.browseUnits : "Browse all available units"} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
            </a>
          </div>
          {saleListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {saleListings.map((listing) => (
                isAr ? <ListingCardAr key={listing.id} listing={listing} /> : <ListingCard key={listing.id} listing={listing} compact />
              ))}
            </div>
          ) : (
            !isPending && <p className="text-muted-foreground py-8">{A ? C.noSale : "No sale listings available yet."}</p>
          )}
        </Band>

        <Band tone="cream">
          <FaqWithAdvisor
            title={A ? A.faqTitle : "Primary property FAQs"}
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
                <Link href="/faqs/rent-buy-resale" className="text-accent font-medium hover:underline">Rent vs buy vs resale</Link>
                {" · "}
                <Link href="/faqs/developers" className="text-accent font-medium hover:underline">Developers &amp; projects</Link>
                {" · "}
                <Link href="/faqs/pricing-value" className="text-accent font-medium hover:underline">Pricing, value &amp; unit evaluation</Link>
                {" · "}
                <Link href="/faqs" className="text-accent font-medium hover:underline">Browse all FAQs</Link>
              </>
              )
            }
          />
        </Band>

        <Band tone="white">
          <SectionHead title={A ? C.otherServices : "Explore other services"} />
          <RelatedServices current="/services/primary-property" order={["/services/property-resale", "/services/tenant-representation", "/services/investment-consultation", "/services/income-generating-property"]} />
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Ready to buy your first unit?"}
          text={A ? A.ctaText : "Tell us what you're looking for. We'll find the right opportunity."}
          primary={{ label: A ? C.book : "Book a free consultation", href: L("/contact"), form }}
        />
      </main>

      <Footer />
    </div>
  );
}
