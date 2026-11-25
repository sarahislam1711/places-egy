import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  KeyRound,
  Handshake,
  Building2,
  Store,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Coins,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { STATIC_PAGE_META } from "@/lib/page-meta";

export default function Leasing() {
  useDocumentMeta(STATIC_PAGE_META["/services/leasing"]);
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Leasing", url: "/services/leasing" },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Office & Commercial Leasing",
          description:
            "Find the right office or commercial unit on the right terms — admin offices and commercial units across Cairo's top business districts, with advisory, negotiation, and contract review.",
          url: "/services/leasing",
          serviceType: "Real Estate Leasing",
        })}
      />
      <Navbar />

      {/* Section 1 — Hero (centered, faded image, contained so it doesn't bleed into next section) */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/leasing.jpg"
            alt="Office leasing in Egypt"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-65"
          />
          {/* Brand-tinted darken layer for added depth and contrast */}
          <div className="absolute inset-0 bg-primary/25" />
          {/* Slightly darker top so the centered text reads cleanly; fades to page bg at the bottom */}
          <div className="absolute inset-0 bg-linear-to-b from-background/15 via-background/55 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10 text-center">
          <nav className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Leasing</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-5 leading-tight max-w-4xl mx-auto">
            Office &amp; Commercial Leasing in Egypt
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
            Find the right space on the right terms — whether you're securing an administrative office or a commercial unit across Cairo's top business districts.
          </p>
          <Link href="/contact" className="inline-flex">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Talk to an Advisor <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2 — Is this service right for your business? (boxed feature) */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-secondary/40 rounded-3xl border border-border/40 p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4 leading-tight">
                  Is this service right<br />for your business?
                </h2>
                <div className="h-1 w-20 bg-accent mb-6" />
                <p className="text-muted-foreground text-lg">
                  We specialize in helping organizations that value strategic alignment over quick transactions.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  "Multinational corporations expanding into Egypt",
                  "Startups establishing their first headquarters",
                  "Companies relocating for better operational efficiency",
                  "Organizations restructuring their real estate portfolio",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
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

      {/* Section 3 — Who this service is for */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Who this service is for
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Businesses Securing Their First Office",
                desc: "You need a space that works for your team, fits your budget, and gives you room to grow. We help you find it without wasting time on the wrong options.",
              },
              {
                icon: TrendingUp,
                title: "Growing Companies Relocating or Expanding",
                desc: "You need more space, a better location, or both. We assess what's available and negotiate the best terms for your situation.",
              },
              {
                icon: Store,
                title: "Brands and Operators Securing Commercial Space",
                desc: "You need the right unit in the right development. We evaluate footfall, lease terms, and operational fit before you commit.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
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


      {/* Section 5 — Why leasing with PLACES (open layout, no box) */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Why choose PLACES for leasing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ClipboardList, title: "We understand first", desc: "Your needs, budget, and operations — before we show you anything." },
              { icon: KeyRound, title: "We find what fits", desc: "Access to units across top developers — including unlisted ones." },
              { icon: Handshake, title: "We negotiate for you", desc: "Rent, fit-out, break clauses, and service charges." },
              { icon: ShieldCheck, title: "We review before you sign", desc: "Every clause checked — no surprises after you move in." },
            ].map((item, i) => (
              <div key={i}>
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Mid-page CTA — Unsure about fair market value? */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group border border-white/10">
            {/* Decorative blur accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" aria-hidden />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" aria-hidden />

            <div className="relative z-10 max-w-2xl text-center md:text-left md:pl-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-inner">
                  <Calculator className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                    Unsure about the fair market value?
                  </h2>
                  <p className="text-white/80 text-lg font-light leading-relaxed">
                    Get a preliminary, data-backed assessment from our experts before making any commitments.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <Link href="/contact">
                <Button className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-primary h-14 px-8 rounded-full text-lg font-bold transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  Evaluate Your Unit's Worth
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Browse leasing opportunities — single card */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 items-center rounded-2xl border border-border/40 bg-secondary/40 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-28 md:h-32 rounded-xl overflow-hidden bg-primary">
              <img
                src="/images/business-complex.jpg"
                alt="Leasing opportunities"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                  Browse leasing opportunities
                </h3>
                <p className="text-muted-foreground mt-1">
                  Curated admin & commercial units available for rent — updated regularly.
                </p>
              </div>

              <Link href="/listings">
                <Button
                  variant="outline"
                  className="bg-white border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-full h-11 px-6 w-full md:w-auto"
                >
                  View Leasing Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 — Related services (prominent, not plain cards) */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Explore other services
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Building2,
                title: "Primary Property",
                desc: "Looking to buy rather than lease? We give you access to off-plan and newly launched units across Egypt's most active developments.",
                link: "/services/primary-property",
              },
              {
                icon: TrendingUp,
                title: "Investment Consultation",
                desc: "Not sure where to put your money? We analyze yield potential, vacancy risk, and capital appreciation across commercial and administrative assets.",
                link: "/services/investment-consultation",
              },
              {
                icon: Coins,
                title: "Income Generating Property",
                desc: "Find units that generate consistent rental income. We identify assets with strong tenant demand and sustainable yield.",
                link: "/services/income-generating-property",
              },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group relative p-8 rounded-2xl bg-primary/[0.03] border border-border/30 hover:bg-primary hover:border-primary transition-all duration-300 overflow-hidden"
              >
                <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center mb-5 text-accent group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary group-hover:text-white mb-2 transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/70 leading-relaxed mb-6 transition-colors">{item.desc}</p>
                <span className="inline-flex items-center text-accent text-sm font-medium group-hover:text-accent transition-colors">
                  Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9 — Read more — Related FAQs */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Common FAQs on Leasing
            </h2>
            <a href="/faqs" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all FAQs <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "Admin offices vs commercial spaces", link: "/faqs/admin-vs-commercial" },
              { title: "Contracts, legal & due diligence", link: "/faqs/contracts-legal" },
              { title: "Risks, mistakes & best practices", link: "/faqs/risks-mistakes" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group flex items-center justify-between gap-4 p-5 rounded-xl bg-white border border-border/40 hover:border-accent hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent block mb-1">
                    FAQ Section
                  </span>
                  <h3 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 10 — Final CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 md:py-12 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">
                Ready to find your next space?
              </h2>
              <p className="text-muted-foreground text-lg">
                Tell us what you need. We'll take it from there.
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
