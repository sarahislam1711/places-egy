import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Handshake,
  Building2,
  Repeat,
  TrendingUp,
  Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";

const SERVICES: { icon: LucideIcon; name: string; desc: string; slug: string }[] = [
  {
    icon: Handshake,
    name: "Tenant Representation",
    desc: "We represent your company, not the landlord: we find, compare and negotiate your office and review the lease. Free for tenants.",
    slug: "tenant-representation",
  },
  {
    icon: Building2,
    name: "Primary Property",
    desc: "Buy directly from the developer — off-plan and newly launched units across Egypt's most active developments.",
    slug: "primary-property",
  },
  {
    icon: Repeat,
    name: "Property Resale",
    desc: "Buy or sell a unit that has already been transacted — with full market context on both sides.",
    slug: "property-resale",
  },
  {
    icon: TrendingUp,
    name: "Investment Consultation",
    desc: "Data-driven advisory for investors evaluating administrative office assets in Egypt.",
    slug: "investment-consultation",
  },
  {
    icon: Coins,
    name: "Income Generating Property",
    desc: "Identify and acquire units that generate consistent rental income across Egypt's most active business districts.",
    slug: "income-generating-property",
  },
];

export default function Services() {
  useDocumentMeta({
    title: "Services — Leasing, Sales, Resale & Investment | PLACES",
    description:
      "PLACES delivers full-cycle office real estate services in Egypt: leasing, primary purchases, resale, investment consultation, and income-generating property advisory.",
    url: "https://places-egy.com/services",
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Hazy faded background image — fixed so it stays put as the user
          scrolls. Sits behind all content via z-0 + relative z-10 wrapper. */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/general-office.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-15 blur-sm"
        />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <SchemaMarkup
          schema={breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Services", url: "/services" },
          ])}
        />
        <SchemaMarkup
          schema={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "PLACES Services",
            url: "https://places-egy.com/services",
            itemListElement: SERVICES.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: s.name,
                description: s.desc,
                url: `https://places-egy.com/services/${s.slug}`,
                provider: { "@id": "https://places-egy.com/#organization" },
              },
            })),
          }}
        />
        <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-4 leading-tight">
            Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Five specialized service areas covering the full lifecycle of administrative office real estate in Egypt — from leasing and acquisition to resale and investment advisory.
          </p>
        </div>
      </section>

      {/* All services grid */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((service, i) => {
              // If we have an odd number of services, span the last card across
              // both columns so we never leave a visually empty cell.
              const spanFull = i === SERVICES.length - 1 && SERVICES.length % 2 === 1;
              return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`group relative p-8 md:p-10 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 overflow-hidden ${spanFull ? "md:col-span-2" : ""}`}
              >
                {/* Large faded service icon as decorative backdrop in the
                    bottom-right corner — adds depth without competing for
                    attention. Intensifies slightly on hover. */}
                <service.icon
                  className="absolute -right-8 -bottom-8 w-44 h-44 text-accent/5 group-hover:text-accent/10 transition-colors duration-500 pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary mb-2">
                    {service.name}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  <span className="inline-flex items-center text-accent text-sm font-medium group-hover:text-primary transition-colors">
                    Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Read more — Link to FAQs */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <Link
            href="/faqs"
            className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-10 rounded-2xl bg-secondary/40 border border-border/40 hover:border-accent hover:shadow-md transition-all"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Read more
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mt-2 group-hover:text-accent transition-colors">
                Have questions before choosing a service?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Browse FAQs on Egypt's administrative office real estate market — organized into ten topic areas.
              </p>
            </div>
            <span className="inline-flex items-center text-accent text-sm font-medium whitespace-nowrap shrink-0">
              Browse all FAQs <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2">
                Not sure which service fits?
              </h2>
              <p className="text-muted-foreground">
                Tell us what you're trying to accomplish and we'll recommend the right starting point.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
                Talk to an advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

        <Footer />
      </div>
      <CornerSlideMagnet />
    </div>
  );
}
