import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Search,
  KeyRound,
  Handshake,
  FileCheck2,
  Hammer,
  Building2,
  Store,
  Briefcase,
  TrendingUp,
  Globe2,
  Coins,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { FaqAccordionList } from "@/components/FaqAccordionList";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { STATIC_PAGE_META } from "@/lib/page-meta";
import { LOCATION_CONTENT } from "@/lib/location-content";

// All six areas, with each area guide's first highlight as the one-liner.
const AREAS = Object.values(LOCATION_CONTENT);

const PATH = "/services/tenant-representation";

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Your brief",
    desc: "Headcount today and in 12 and 36 months, budget, preferred areas, finishing level and move-in date. Everything else follows from this.",
  },
  {
    icon: Search,
    title: "2. Full-market search",
    desc: "We search across Cairo's business parks, office buildings and mixed-use projects, including units that aren't advertised, and filter out what doesn't fit.",
  },
  {
    icon: KeyRound,
    title: "3. Shortlist and viewings",
    desc: "A short list of real options with rent per m², service charges and finishing compared side by side, then viewings we arrange and attend with you.",
  },
  {
    icon: Handshake,
    title: "4. Negotiation",
    desc: "We negotiate the rent, the rent-free period, the yearly increase, service charges and any fit-out contribution: the terms that decide what the office really costs.",
  },
  {
    icon: FileCheck2,
    title: "5. Lease review and signing",
    desc: "We check every clause before you sign: term, increases, deposit, handover condition, break and renewal options, so there are no surprises after you move in.",
  },
  {
    icon: Hammer,
    title: "6. Fit-out, move-in and beyond",
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
  { label: "Works for", rep: "You, the company renting the office", agent: "The landlord or developer" },
  { label: "Which offices you see", rep: "Every option that fits your brief, across many buildings", agent: "Their own building or portfolio" },
  { label: "Goal in the negotiation", rep: "The lowest total cost and the safest terms for you", agent: "The highest rent and the longest commitment" },
  { label: "Lease review", rep: "Every clause checked from the tenant's side", agent: "Drafted to protect the landlord" },
  { label: "Cost to your company", rep: "Free: the landlord pays our fee", agent: "Paid by the landlord" },
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

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/leasing.jpg"
            alt="Tenant representation for companies leasing offices in Cairo"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-primary/25" />
          <div className="absolute inset-0 bg-linear-to-b from-background/15 via-background/55 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10 text-center">
          <nav className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Tenant Representation</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-5 leading-tight max-w-4xl mx-auto">
            Tenant Representation for Companies in Cairo
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
            PLACES works for you, not the landlord. We find, compare and negotiate your office across Cairo's business
            districts and review the lease before you sign. It's free for tenants: the landlord pays our fee.
          </p>
          <Link href="/contact" className="inline-flex">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Send Us Your Requirements <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* What is tenant representation */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-secondary/40 rounded-3xl border border-border/40 p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4 leading-tight">
                  What is tenant representation?
                </h2>
                <div className="h-1 w-20 bg-accent mb-6" />
                <p className="text-muted-foreground text-lg mb-4">
                  Tenant representation means your real estate advisor works only for the company that is renting. A
                  tenant representative (also called a tenant rep broker or tenant advisor) defines what you need,
                  searches the whole market, negotiates the terms and checks the lease on your side of the table.
                </p>
                <p className="text-muted-foreground text-lg">
                  The landlord's agent is paid to get the best deal for the landlord. Your tenant rep is there to get
                  the best deal for you.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  "You see every suitable office, not one landlord's building",
                  "You negotiate with market data, not guesswork",
                  "You sign a lease that has been checked clause by clause",
                  "You pay nothing for it: the landlord pays our fee",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-1 min-w-5 min-h-5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-primary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who we represent */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-10">Who we represent</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: "Companies securing their first office", desc: "A space that fits your team and budget, with room to grow, found without wasting weeks on the wrong options." },
              { icon: TrendingUp, title: "Growing teams relocating or expanding", desc: "More space, a better location, or both, with terms negotiated around your growth plans." },
              { icon: Globe2, title: "International companies entering Egypt", desc: "The right area, a clear view of how leases work in Egypt, and your first office or regional HQ in Cairo." },
              { icon: Store, title: "Brands securing commercial space", desc: "The right unit in the right development, with footfall, lease terms and operational fit checked before you commit." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services included */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-[1fr_1.3fr] gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4 leading-tight">
                Our tenant representation services
              </h2>
              <p className="text-muted-foreground text-lg">
                One advisor from the first brief to the day you move in, and again when your lease comes up for
                renewal.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {SERVICES.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-1 shrink-0" />
                  <span className="text-primary">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-3">How the process works</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-3xl">
            Most searches take 4 to 8 weeks from the first brief to a signed lease. A core and shell office then needs
            8 to 14 weeks of fit-out, which we try to cover with a rent-free period.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.title}>
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Want the details first? Read our{" "}
            <Link href="/guides/how-to-rent-office-cairo" className="text-accent font-medium hover:underline">
              step-by-step guide to renting an office in Cairo
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Why it's free */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" aria-hidden />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Coins className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Why it's free for tenants</h2>
                <p className="text-white/80 text-lg font-light leading-relaxed">
                  When PLACES represents you, the landlord pays our fee once the lease is signed. You get your own
                  advisor negotiating on your side, at no cost to your company.
                </p>
              </div>
              <Link href="/faqs/advisors-brokers" className="shrink-0">
                <Button className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-primary h-12 px-6 rounded-full font-bold transition-all">
                  Advisors &amp; brokers FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tenant rep vs landlord's agent */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-3">
            Your own tenant rep vs the landlord's broker
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            Both may show you offices. Only one is working for you.
          </p>
          {/* Phones: one card per row of the comparison */}
          <div className="md:hidden space-y-3">
            {COMPARISON.map((r) => (
              <div key={r.label} className="rounded-2xl border border-border/40 bg-white p-4">
                <h3 className="font-bold text-primary mb-2">{r.label}</h3>
                <p className="flex items-start gap-2 text-sm mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span><span className="font-semibold">Your tenant rep:</span> {r.rep}</span>
                </p>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                  <span><span className="font-semibold">Landlord's broker:</span> {r.agent}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-secondary/60 text-primary">
                <tr>
                  <th className="text-left p-4 font-bold" scope="col"></th>
                  <th className="text-left p-4 font-bold" scope="col">Your tenant rep (PLACES)</th>
                  <th className="text-left p-4 font-bold" scope="col">The landlord's broker</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((r) => (
                  <tr key={r.label} className="border-t border-border/40 bg-white">
                    <th className="text-left p-4 font-semibold text-primary" scope="row">{r.label}</th>
                    <td className="p-4">
                      <span className="inline-flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />{r.rep}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <span className="inline-flex items-start gap-2"><XCircle className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />{r.agent}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-3">Areas we cover</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            We search every major office district in Cairo, so you can compare areas before you compare buildings.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AREAS.map((a) => (
              <Link
                key={a.slug}
                href={`/locations/${a.slug}`}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-border/40 hover:border-accent hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">
                    Offices in {a.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{a.highlights?.[0] ?? a.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Companies we've placed */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border/40 bg-secondary/40 p-6 md:p-8">
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1">Companies we've placed</h2>
              <p className="text-muted-foreground">
                More than 100 companies, including Bosch, Henkel, Bupa and OPPO, have found their offices with PLACES.
              </p>
            </div>
            <Link href="/why-places" className="inline-flex items-center text-accent font-medium hover:underline shrink-0">
              See our clients <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-6">Tenant representation FAQs</h2>
          <FaqAccordionList faqs={FAQS} />
          <p className="mt-6 text-sm text-muted-foreground">
            More questions about leases and contracts?{" "}
            <Link href="/faqs/contracts-legal" className="text-accent font-medium hover:underline">Contracts &amp; legal FAQs</Link>
            {" · "}
            <Link href="/blog/office-lease-renewal-vs-relocation" className="text-accent font-medium hover:underline">Renew your lease or relocate?</Link>
          </p>
        </div>
      </section>

      {/* Related services */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-10">Buying instead of renting?</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: "Primary Property", desc: "Buy an office directly from the developer: off-plan and newly launched units across Egypt's most active developments.", link: "/services/primary-property" },
              { icon: KeyRound, title: "Property Resale", desc: "Buy a ready office on the resale market, with the unit, the price and the paperwork checked for you.", link: "/services/property-resale" },
              { icon: TrendingUp, title: "Investment Consultation", desc: "Compare yield, vacancy risk and capital growth before you invest in an office.", link: "/services/investment-consultation" },
            ].map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className="group relative p-8 rounded-2xl bg-primary/[0.03] border border-border/30 hover:bg-primary hover:border-primary transition-all duration-300 overflow-hidden"
              >
                <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center mb-5 text-accent group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary group-hover:text-white mb-2 transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/70 leading-relaxed mb-6 transition-colors">{item.desc}</p>
                <span className="inline-flex items-center text-accent text-sm font-medium">
                  Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 md:py-12 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">Ready to find your next office?</h2>
              <p className="text-muted-foreground text-lg">
                Tell us your size, area, budget and move-in date. We'll come back with a shortlist.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-6 md:px-10 h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
                Talk to an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
