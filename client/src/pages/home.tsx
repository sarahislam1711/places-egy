import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { CountUp } from "@/components/ui/count-up";
import { ServicesExplorer } from "@/components/ServicesExplorer";
import { DeveloperStrip } from "@/components/DeveloperStrip";
import { DealAnnouncementCarousel } from "@/components/DealAnnouncementCarousel";
import { ListingCard } from "@/components/listings/ListingCard";
import { ArrowRight, Building2, ClipboardList, BarChart3, ShieldCheck, CheckCircle2, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase, type Listing } from "@/lib/supabase";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { faqSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";

const HOME_FAQS = [
  {
    question: "What types of properties does PLACES list?",
    answer:
      "PLACES is specialized in administrative office real estate across Cairo's top business districts. Listings include business parks, business buildings, and mixed-use developments, all available for sale or rent depending on the unit.",
  },
  {
    question: "Which locations in Egypt does PLACES cover?",
    answer:
      "PLACES covers six key business districts in Cairo and Greater Cairo: New Cairo, Sheikh Zayed, 6th October, Downtown Cairo, Sheraton, and Maadi. These locations represent Egypt's most active administrative real estate markets.",
  },
  {
    question: "Does PLACES help with both buying and leasing?",
    answer:
      "Yes. PLACES assists with leasing, primary property purchases, resale transactions, and investment acquisitions. Whether you are a business looking to rent office space or an investor buying an office for income, PLACES provides advisory and market access for both.",
  },
  {
    question: "How is PLACES different from a regular real estate broker?",
    answer:
      "PLACES goes beyond listing availability. Before you commit to any space, we conduct a market survey, evaluate shortlisted units against your requirements, and perform due diligence on developer credibility, contract terms, and service charge history. The goal is to make sure you choose the right space — not just an available one.",
  },
];

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  useDocumentMeta({
    title: "PLACES | Office Real Estate Advisors in Cairo, Egypt",
    description:
      "Buy, lease, or resell administrative offices across Cairo's top districts — New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi. Verified listings from trusted developers.",
    url: "https://places-egy.com/",
  });

  const { data: listings = [] } = useQuery<Listing[]>({
    // Own key + limit: the homepage shows 4 cards; fetching all listings
    // here cost ~150 KB on the most-visited page.
    queryKey: ["home-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq('is_test', false)
        .eq("property_type", "admin")
        .neq("rental_status", "rented")
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen font-sans flex flex-col bg-background">
      <SchemaMarkup schema={faqSchema(HOME_FAQS)} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[580px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-section.jpg"
            alt="Modern Office Building"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#F5F0EA]/15 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 max-w-7xl text-center text-white">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight text-white">
              Find <span className="text-accent">Your Office</span> in Egypt
            </h1>
            {/* Mobile gets the tight one-line subtitle; sm+ gets the fuller
                statement. Prevents 3-line wrap on phones. */}
            <p className="text-base md:text-xl text-white mb-6 md:mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              <span className="sm:hidden">Cairo offices, real advice, no pressure.</span>
              <span className="hidden sm:inline">
                Browse offices across Egypt's top business districts and get expert market guidance before you commit to anything.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/listings">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 font-bold px-6 h-12 text-base md:px-8 md:h-14 md:text-lg shadow-xl shadow-accent/30 transition-all hover:scale-105">
                  Find an Office
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-medium px-6 h-12 text-base md:px-8 md:h-14 md:text-lg backdrop-blur-sm bg-white/10">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/40 z-10">
          <div className="w-px h-16 bg-linear-to-b from-transparent via-white to-transparent" />
        </div>
      </section>

      {/* Stats Trust Bar — slimmed to a light inline strip so it reads as
          part of the hero-close, not as a floating card competing with
          the deals section below. Card treatment stripped (no shadow, no
          heavy background), just hairline dividers between numbers. */}
      <FadeInSection>
        <section className="pt-8 md:pt-10 pb-6 md:pb-8 relative z-20 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 text-center md:divide-x md:divide-primary/10">
              <div className="md:px-4">
                <p className="text-2xl md:text-4xl font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                  <CountUp end={50} duration={3500} suffix="+" />
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Developers</p>
              </div>
              <div className="md:px-4">
                <p className="text-2xl md:text-4xl font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                  <CountUp end={1000} duration={3500} suffix="+" />
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Listings</p>
              </div>
              <div className="md:px-4">
                <p className="text-2xl md:text-4xl font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                  <CountUp end={6} duration={3500} />
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Key Locations</p>
              </div>
              <div className="md:px-4">
                <p className="text-2xl md:text-4xl font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                  <CountUp end={500} duration={3500} suffix="+" />
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Businesses Helped</p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Latest closed deals — extra top margin + a small section eyebrow
          so it reads as its own moment on the page instead of a second
          card stacked on the stats above. */}
      <FadeInSection>
        <section className="pt-14 md:pt-20 pb-6">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-4 text-center md:text-left">
              Recently Closed
            </p>
            <DealAnnouncementCarousel />
          </div>
        </section>
      </FadeInSection>

      {/* Curated Opportunities */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full shadow-sm shadow-accent/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                New Available Units
              </span>
              <Link href="/listings" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group">
                View all available offices <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {listings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Link href="/listings">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  View all listings
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Developer Logo Strip */}
      <FadeInSection>
        <DeveloperStrip />
      </FadeInSection>

      {/* Services */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="mb-8 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
                <span className="md:hidden">Real estate services</span>
                <span className="hidden md:inline">Comprehensive real estate services</span>
              </h2>
            </div>

            <ServicesExplorer />
          </div>
        </section>
      </FadeInSection>

      {/* Buy / Rent CTA tiles */}
      <FadeInSection>
        <section className="py-8">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            {/* Compact photo-background CTA tiles — icon + title + CTA only. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link href="/buy" className="group relative h-40 md:h-44 rounded-2xl overflow-hidden cursor-pointer block shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img src="/images/admin 1.jpg" alt="Buy an office" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/70 transition-colors duration-500 group-hover:bg-primary/60" />
                <div className="relative h-full flex flex-col justify-between p-5 md:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">Buy an office</h3>
                    <span className="inline-flex items-center text-white font-bold uppercase tracking-wider text-[11px] md:text-xs group-hover:text-accent transition-colors">
                      Browse offices for sale <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/rent" className="group relative h-40 md:h-44 rounded-2xl overflow-hidden cursor-pointer block shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img src="/images/admin 2.jpg" alt="Rent an office" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-[#2E2A28]/85 via-[#2E2A28]/45 to-[#2E2A28]/30 transition-opacity duration-500 group-hover:opacity-90" />
                <div className="relative h-full flex flex-col justify-between p-5 md:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">Rent an office</h3>
                    <span className="inline-flex items-center text-white font-bold uppercase tracking-wider text-[11px] md:text-xs group-hover:text-accent transition-colors">
                      Browse offices for rent <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* How It Works */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="bg-primary/95 text-white rounded-3xl p-10 md:p-14 shadow-lg shadow-primary/5">
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-serif font-bold mb-3 text-white">The right space for your business exists.</h2>
                <p className="text-white/60 text-base">
                  We're here to make sure you find it fast.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: ClipboardList, title: "Understand", desc: "We start by understanding your business model, budget & what you actually need from a space." },
                  { icon: BarChart3, title: "Analyze", desc: "We survey the market, map competing supply & identify options that align with your office requirements." },
                  { icon: ShieldCheck, title: "Advise", desc: "We give you an objective view of your options, including the risks, the trade-offs & even what we'd do in your position." },
                  { icon: CheckCircle2, title: "Execute", desc: "We manage the transaction from offer to handover so nothing falls through the cracks." }
                ].map((step, i) => (
                  <div key={i} className="bg-white/[0.04] rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300">
                    <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center mb-4 text-accent">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-serif text-white">{step.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link href="/contact" className="inline-flex items-center text-accent font-medium hover:text-white transition-colors">
                  Tell us what you need — we'll handle the rest <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Locations Preview */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">Prime locations</h2>
                <p className="text-muted-foreground text-lg">Discover offices in Egypt's most sought-after business districts.</p>
              </div>
              <Link href="/locations">
                <Button variant="ghost" className="hidden md:flex">View All Locations <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/locations/new-cairo" className="group relative h-72 md:h-105 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 block">
                <img src="/images/new-cairo.jpg" alt="New Cairo" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-3xl font-serif text-white font-bold mb-2">New Cairo</h3>
                  <p className="text-gray-300 mb-4">The new heart of business with premium administrative hubs.</p>
                  <span className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-2">Explore <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>

              <div className="grid grid-rows-2 gap-6 md:min-h-105">
                <Link href="/locations/sheikh-zayed" className="group relative h-44 md:h-auto rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 block">
                  <img src="/images/Sheikh-zayed.jpg" alt="Sheikh Zayed" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">Sheikh Zayed</h3>
                  </div>
                </Link>
                <Link href="/locations/downtown-cairo" className="group relative h-44 md:h-auto rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 block">
                  <img src="/images/downtown-cairo.jpg" alt="Downtown Cairo" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">Downtown Cairo</h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-8">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  What types of properties does PLACES list?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  PLACES is specialized in administrative office real estate across Cairo's top business districts. Listings include business parks, business buildings, and mixed-use developments, all available for sale or rent depending on the unit.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Which locations in Egypt does PLACES cover?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  PLACES covers six key business districts in Cairo and Greater Cairo: New Cairo, Sheikh Zayed, 6th October, Downtown Cairo, Sheraton, and Maadi. These locations represent Egypt's most active administrative real estate markets.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Does PLACES help with both buying and leasing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Yes. PLACES assists with leasing, primary property purchases, resale transactions, and investment acquisitions. Whether you are a business looking to rent office space or an investor buying an office for income, PLACES provides advisory and market access for both.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  How is PLACES different from a regular real estate broker?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  PLACES goes beyond listing availability. Before you commit to any space, we conduct a market survey, evaluate shortlisted units against your requirements, and perform due diligence on developer credibility, contract terms, and service charge history. The goal is to make sure you choose the right space — not just an available one.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </FadeInSection>

      {/* Final CTA */}
      <FadeInSection>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-10 max-w-7xl">
            <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-border/40 p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">Need personalized guidance?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Our team is ready to listen to your requirements and offer tailored advice for your business. No pressure, just expert support.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-6 h-12 text-base md:px-10 md:h-14 md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105">
                  Talk to an Advisor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      <Footer />
      <CornerSlideMagnet />
    </div>
  );
}
