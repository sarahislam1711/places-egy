import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, ClipboardCheck, Search, Tag } from "lucide-react";
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
import { SERVICE_COMMON_AR, RESALE_AR } from "@/lib/services-ar";

const PATH = "/services/property-resale";

const WHY_SHORT = [
  "Honest market pricing: what the unit is actually worth, not what the seller is asking",
  "Serious, qualified buyers only, not unqualified enquiries",
  "The legal transfer, payment terms and handover managed from start to finish",
  "The same standard of honesty and diligence for buyers and sellers",
];

const WHO: Audience[] = [
  { title: "Buyers", need: "You want a unit that's ready now, without waiting for a developer handover.", help: "We find the right unit at the right price.", image: "/images/general-office.jpg", imageAlt: "A ready office" },
  { title: "Sellers", need: "You want to exit your investment at the best available price.", help: "We value your unit honestly and find serious buyers.", image: "/images/business-complex.jpg", imageAlt: "Office buildings in a Cairo business district" },
  { title: "Investors", need: "You're looking for undervalued resale units with strong upside.", help: "We identify them and negotiate on your behalf.", image: "/images/Trivium-Business-Complex.jpg", imageAlt: "Trivium Business Complex in New Cairo" },
];

const SERVICES: Reason[] = [
  { icon: Search, title: "For buyers", desc: "We identify resale units that represent genuine value, negotiate on your behalf, and review transfer documentation." },
  { icon: Tag, title: "For sellers", desc: "We assess your unit's market value, identify serious buyers, and manage the transaction to completion." },
  { icon: BarChart3, title: "Market pricing", desc: "We give you an honest view of what the unit is worth, based on comparable transactions, not asking prices." },
  { icon: ClipboardCheck, title: "Transaction management", desc: "We manage the legal transfer, payment terms, and handover process from start to finish." },
];

const STEPS = [
  {
    title: "Market value",
    desc: "Selling: we assess what your unit is worth. Buying: we tell you what a unit is actually worth. Both are based on comparable transactions, not asking prices.",
  },
  {
    title: "The right match",
    desc: "For buyers, we identify resale units that represent genuine value. For sellers, we identify motivated, qualified buyers.",
  },
  {
    title: "Documents",
    desc: "We review the transfer documentation. Ownership documents, registered contract status, outstanding fees, building condition and existing lease terms should all be verified before signing.",
  },
  {
    title: "Negotiation",
    desc: "We negotiate on your behalf as a buyer or investor, using comparable transactions rather than asking prices.",
  },
  {
    title: "Legal transfer and payment",
    desc: "We manage the legal transfer and the payment terms between buyer and seller.",
  },
  {
    title: "Handover",
    desc: "We manage the handover process and see the transaction through to completion.",
  },
];

const COMPARISON = [
  { label: "Who you buy from", a: "An existing owner: a ready unit or a partially-paid contract", b: "The developer, usually off-plan or at a new launch" },
  { label: "When you get the unit", a: "Immediately, with no construction wait", b: "After construction and handover" },
  { label: "What you can inspect", a: "The actual unit, its surroundings and the building quality", b: "The developer's plans, track record and payment plan" },
  { label: "Rental income", a: "Some units come with existing tenants and day-one rental income", b: "None during the construction period" },
  { label: "Payment", a: "Less remaining payment plan flexibility", b: "Developer installment plans of 5 to 10 years, with 5% to 20% down" },
  { label: "Main risks", a: "Hidden defects, outstanding maintenance fees, contracts that may not transfer cleanly", b: "Delivery delays, masterplan changes, developer financial issues" },
];

// Verbatim from the FAQ bank (client/src/lib/faq.ts).
const FAQS = [
  {
    question: "What are the advantages of buying resale commercial units?",
    answer:
      "Resale units allow immediate ownership and income, no construction risk, no waiting period for handover, and the chance to inspect the actual unit, surroundings, and building quality before buying. Some resale units come with existing tenants, providing day-one rental income. Resale also offers room for negotiation, since sellers often need liquidity, and prices can be 30% to 50% below primary launch prices.",
  },
  {
    question: "What are the risks of buying resale commercial properties in Egypt?",
    answer:
      "Risks include hidden defects in the unit or building, outstanding maintenance fees from previous owners, contracts that may not transfer cleanly, weak tenants locked in below-market leases, and lack of remaining payment plan flexibility. Due diligence is essential — verify ownership documents, registered contract status, outstanding fees, building condition, and existing lease terms before signing any resale agreement.",
  },
  {
    question: "Who buys resale commercial properties in Egypt?",
    answer:
      "Buyers include end-users (doctors, business owners, franchise operators) who want ready units for immediate use, investors seeking ready income-producing assets, businesses that want to own rather than rent their operating space, and other investors looking for value below primary market prices. End-users typically pay higher prices per square meter than pure investors because they value business utility over yield calculations.",
  },
  {
    question: "How do I price a commercial unit correctly for resale?",
    answer:
      "Price based on three benchmarks: comparable resale listings in the same project, primary developer prices for similar units, and rental yield expectations of likely buyers. A unit producing 10% annual yield justifies a price 10 times the annual rent. Pricing 5% to 10% below primary developer prices typically attracts buyers, while overpricing extends time on market and weakens negotiation position.",
  },
  {
    question: "When should I sell a commercial property to maximize profit?",
    answer:
      "Strong selling moments include: just before handover when end-users compete for ready units, just after handover when tenants are signed and income is proven, and at year 5 to 7 when the area has matured. Selling too early misses appreciation; selling too late risks market cycle changes. Time the sale to project completion phases and local demand cycles. Net proceeds after capital gains tax and transfer fees should be your benchmark.",
  },
  {
    question: "How do I verify the property's title is clear before buying?",
    answer:
      "Conduct a title search at the Real Estate Publicity Department to verify ownership history, check for liens or mortgages, confirm no court-imposed restrictions, and conduct a litigation search in the property's jurisdiction. Verify that the property is not subject to inheritance disputes, fraudulent transfer claims, or precautionary court measures. Hiring a real estate lawyer for this verification is strongly recommended — informal title checks miss legal issues that surface later.",
  },
  {
    question: "What is the difference between a primary sales advisor and a resale specialist?",
    answer:
      "Primary sales advisors source units directly from developers at launch prices, working through partnership agreements that give them access to pre-launch and early-launch inventory. Resale specialists source ready or near-delivery units from existing owners, often below primary launch prices in the same project. Comprehensive advisors handle both channels — primary for appreciation plays and resale for immediate income — providing more complete options for your portfolio.",
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

export default function PropertyResale() {
  const { isAr, href: L } = useLang();
  const A = isAr ? RESALE_AR : null;
  const C = SERVICE_COMMON_AR;
  useDocumentMeta(isAr ? AR_PAGE_META[arabicPath(PATH)] : STATIC_PAGE_META[PATH]);
  const pagePath = isAr ? arabicPath(PATH) : PATH;
  const who: Audience[] = A ? WHO.map((w, i) => ({ ...w, ...A.who[i] })) : WHO;
  const faqs = A ? A.faqs : FAQS;
  const crumbs = A
    ? [{ name: C.home, href: L("/") }, { name: C.services, href: L("/services") }, { name: A.crumb }]
    : [{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: "Property Resale" }];
  const breadcrumb = A
    ? [{ name: C.home, url: L("/") }, { name: C.services, url: L("/services") }, { name: A.crumb, url: pagePath }]
    : [{ name: "Home", url: "/" }, { name: "Services", url: "/services" }, { name: "Property Resale", url: PATH }];
  const services: Reason[] = A ? SERVICES.map((r, i) => ({ ...r, ...A.services[i] })) : SERVICES;
  const form = { intent: "buy" as const, pageName: "Property resale" };
  const { data: saleListings = [], isPending } = useQuery<Listing[]>({
    queryKey: ["resale-listings"],
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
                name: "Property Resale in Egypt",
                description:
                  "Buy or sell a unit that has already been transacted, with full market context on both sides, honest pricing, and end-to-end transaction management.",
                url: PATH,
                serviceType: "Secondary Real Estate Sales",
              },
        )}
      />
      <SchemaMarkup schema={faqSchema(faqs)} />
      <Navbar />

      <main className="flex-1">
        <ServiceHero
          crumbs={crumbs}
          title={A ? A.h1 : "Buy or Sell a Resale Office in Egypt"}
          intro={A ? A.intro : "Our property resale service helps you buy or sell a unit that has already been transacted, with full market context on both sides. It is for buyers who want a unit that's ready now, sellers who want the best available price, and investors looking for undervalued resale units."}
          primary={{ label: A ? C.talk : "Talk to an advisor", href: L("/contact"), form }}
          image="/images/hero-section.jpg"
          imageAlt={A ? A.heroAlt : "Property resale in Egypt"}
          promise={A ? A.promise : { title: "Honest market pricing", text: "We tell you what the unit is actually worth, based on comparable transactions, not what the seller is asking." }}
          points={A ? A.points : ["For buyers and sellers", "Priced on comparable transactions", "Transfer to handover managed"]}
        />

        <Band tone="white">
          <IntroSplit title={A ? A.whatTitle : "What is property resale?"} cardTitle={A ? A.whatCard : "Why choose PLACES for property resale"} items={A ? A.whyShort : WHY_SHORT}>
            {A ? A.whatText.map((t) => <p key={t}>{t}</p>) : <>
                <p>
                  Property resale, or the secondary market, means buying a unit from its existing owner instead of
                  from the developer. It can be a ready unit or a partially-paid contract transferred to a new buyer.
                </p>
                <p>
                  The secondary market in Egypt moves fast. Units get relisted, prices shift, and deals fall through,
                  often because neither side has full market context. We give buyers and sellers that context and
                  manage the transaction to completion.
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
            title={A ? A.servicesTitle : "Our property resale services"}
            lead={A ? A.servicesLead : "We act for both sides. Buyers and sellers get the same standard of honesty and diligence from our team."}
          />
          <ReasonGrid items={services} dark />
        </Band>

        <Band tone="white" tight>
          <SectionHead
            title={A ? A.processTitle : "How a resale deal works"}
            lead={A ? A.processLead : "From an honest valuation to handover, we manage the transaction from start to finish."}
          
            compact
          />
          <StepList steps={A ? A.steps : STEPS} />
        </Band>

        <Band tone="cream" tight>
          <SectionHead
            title={A ? A.compareTitle : "Resale vs primary property"}
            lead={A ? A.compareLead : "Resale suits buyers who want the unit now, want to skip handover delays, or want to see the delivered product before buying. Primary suits longer time horizons and developer payment plans."}
            compact
          />
          <SideBySide left={A ? A.left : "Resale (from an owner)"} right={A ? A.right : "Primary (from the developer)"} rows={A ? A.comparison : COMPARISON} />
          <p className="mt-10 text-muted-foreground">
            {A ? A.primaryBefore : <>Buying off-plan instead?{" "}</>}
            <Link href={L("/services/primary-property")} className="text-accent font-semibold hover:underline">
              {A ? A.primaryLink : "See our primary property service"}
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
            title={A ? A.faqTitle : "Property resale FAQs"}
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

        <Band tone="white">
          <SectionHead title={A ? C.otherServices : "Explore other services"} />
          <RelatedServices current="/services/property-resale" order={["/services/primary-property", "/services/tenant-representation", "/services/investment-consultation", "/services/income-generating-property"]} />
        </Band>

        <CtaBand
          title={A ? A.ctaTitle : "Buying or selling a resale unit?"}
          text={A ? A.ctaText : "Get honest market context before you commit to anything."}
          primary={{ label: A ? C.book : "Book a free consultation", href: L("/contact"), form }}
        />
      </main>

      <Footer />
    </div>
  );
}
