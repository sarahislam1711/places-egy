import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import {
  ArrowRight,
  ChevronRight,
  Building2,
  ClipboardCheck,
  BarChart3,
  FileCheck,
  Search,
  Handshake,
  ShieldCheck,
  KeyRound,
  TrendingUp,
  Home,
  Repeat,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { STATIC_PAGE_META } from "@/lib/page-meta";

export default function PrimaryProperty() {
  useDocumentMeta(STATIC_PAGE_META["/services/primary-property"]);
  const { data: saleListings = [] } = useQuery<Listing[]>({
    queryKey: ["primary-property-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq('is_test', false)
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
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Primary Property", url: "/services/primary-property" },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Primary Property in Egypt",
          description:
            "Buy directly from the developer — off-plan and newly launched units across Egypt's most active developments, with evaluation and transaction management.",
          url: "/services/primary-property",
          serviceType: "Primary Real Estate Sales",
        })}
      />
      <Navbar />

      {/* Section 1 — Hero (centered, faded image, contained so it doesn't bleed into next section) */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/hero-main.jpg"
            alt="Primary property in Egypt"
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
            <span className="text-primary">Primary Property</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-5 leading-tight max-w-4xl mx-auto">
            Primary Property in Egypt
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
            Buy directly from the developer — off-plan and newly launched units across Egypt's most active developments.
          </p>
          <Link href="/contact" className="inline-flex">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Talk to an Advisor <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2 — Why choose PLACES (sits directly under hero, covers the image fade) */}
      <section className="relative py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary/95 rounded-3xl p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-10">
              Why choose PLACES for primary property
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Search, title: "We know the launches", desc: "We track every major developer launch in Egypt — so you never miss a strong opportunity." },
                { icon: ClipboardCheck, title: "We evaluate before you buy", desc: "We assess the unit, the developer, and the payment plan — not just the brochure." },
                { icon: Handshake, title: "We manage the process", desc: "From reservation to handover, we manage every step so nothing falls through." },
                { icon: ShieldCheck, title: "Independent perspective", desc: "We're not employed by any developer — our recommendations are based on the unit, not the commission." },
              ].map((item, i) => (
                <div key={i}>
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center mb-4 text-accent">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Our approach */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
              Our approach
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Buying directly from a developer gives you the best pricing, flexible payment plans, and access to units before they hit the secondary market — but not all launches are equal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Developer access", desc: "Direct relationships with Egypt's most active developers — including pre-launch and off-market opportunities." },
              { icon: ClipboardCheck, title: "Unit evaluation", desc: "We assess the unit, floor plan, developer track record, and payment plan before you commit." },
              { icon: BarChart3, title: "Market context", desc: "We tell you whether the pricing is competitive and what similar units are trading at." },
              { icon: FileCheck, title: "Transaction management", desc: "We manage paperwork, payment milestones, and handover on your behalf." },
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

      {/* Section 4 — Who this service is for */}
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
                icon: KeyRound,
                title: "First-time buyers",
                desc: "You want to buy in a strong development at the best available price. We give you access and market context.",
              },
              {
                icon: TrendingUp,
                title: "Investors",
                desc: "You want early access to units before they hit the secondary market at a premium. We track launches and give you first access.",
              },
              {
                icon: Home,
                title: "End users",
                desc: "You want a unit you'll eventually occupy. We evaluate the development, the payment plan, and the handover timeline.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-secondary/50 rounded-2xl border-l-4 border-accent p-6 md:p-7">
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center text-accent mb-4">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Available units for sale */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Units currently available for sale
            </h2>
            <a href="/listings?transaction=sale" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all available units <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {saleListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {saleListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">No sale listings available yet.</p>
          )}

          <div className="mt-8 md:hidden">
            <a href="/listings?transaction=sale">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                Browse all available units
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Section 6 — Explore other services */}
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
                icon: Repeat,
                title: "Property Resale",
                desc: "Looking at the secondary market instead? Buy or sell a previously transacted unit with full market context on both sides.",
                link: "/services/property-resale",
              },
              {
                icon: Building2,
                title: "Tenant Representation",
                desc: "Looking to lease rather than buy? We represent you, not the landlord, and it's free for tenants.",
                link: "/services/tenant-representation",
              },
              {
                icon: TrendingUp,
                title: "Investment Consultation",
                desc: "Not sure where to put your money? We analyze yield potential, vacancy risk, and capital appreciation.",
                link: "/services/investment-consultation",
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

      {/* Read more — Related FAQs */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Common FAQs on Primary Property
            </h2>
            <a href="/faqs" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all FAQs <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "Rent vs buy vs resale", link: "/faqs/rent-buy-resale" },
              { title: "Developers & projects", link: "/faqs/developers" },
              { title: "Pricing, value & unit evaluation", link: "/faqs/pricing-value" },
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

      {/* Section 7 — Final CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 md:py-12 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">
                Ready to buy your first unit?
              </h2>
              <p className="text-muted-foreground text-lg">
                Tell us what you're looking for. We'll find the right opportunity.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-6 md:px-10 h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
                Book a free consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
