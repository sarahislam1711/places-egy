import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { COMPANY_PROFILE_DOWNLOAD_NAME, COMPANY_PROFILE_HREF } from "@/lib/company-profile";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { ClientsStrip } from "@/components/ClientsStrip";
import { ShieldCheck, TrendingUp, Users, Award, Building2, HeartHandshake, Download } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { aboutPageSchema, breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";

export default function WhyPlaces() {
  useDocumentMeta({
    title: "Why PLACES — Egypt's Administrative Office Real Estate Specialists",
    description:
      "Meet the team and mission behind PLACES — Egypt's specialized partner for administrative office real estate across Cairo, New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi.",
    url: "https://places-egy.com/why-places",
  });
  const values = [
    {
      icon: ShieldCheck,
      title: "Trusted Expertise",
      desc: "Years of deep market knowledge across Egypt's most prestigious business districts.",
    },
    {
      icon: TrendingUp,
      title: "Investment Insight",
      desc: "Data-driven recommendations that help you maximize returns and minimize risk.",
    },
    {
      icon: Users,
      title: "Client-First Approach",
      desc: "We place your business needs at the core of every decision to ensure tailor-made solutions that align with your goals.",
    },
    {
      icon: Award,
      title: "Premium Network",
      desc: "Trusted by leading companies like talabat, Henkel, Bosch, and ACWA Power, backed by deep market relationships.",
    },
    {
      icon: Building2,
      title: "Curated Portfolio",
      desc: "Hand-picked properties across the most strategic locations in Cairo and beyond.",
    },
    {
      icon: HeartHandshake,
      title: "End-to-End Support",
      desc: "From initial search to final transaction — we're with you every step of the way.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Why PLACES", url: "/why-places" },
        ])}
      />
      <SchemaMarkup schema={aboutPageSchema()} />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-secondary/30 pt-24 md:pt-32 pb-8 md:pb-10 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-5">
            About PLACES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary">
            Why PLACES
          </h1>
        </div>
      </section>

      {/* About: two-column split — narrative on the left, numbered service
          list on the right. Breaks the wall-of-text into something scannable. */}
      <section className="bg-secondary/30 pt-2 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-stretch">
            <div className="border-l-2 border-accent pl-6 space-y-5">
              <p className="text-base md:text-lg text-primary font-medium leading-relaxed">
                At PLACES, we provide specialized real estate solutions with
                deep expertise in one focused sector: administrative office
                real estate — including sales, leasing, and consultancy.
              </p>
              <p className="text-base md:text-lg text-primary font-medium leading-relaxed">
                Through strong market knowledge and extensive industry
                relationships, we help developers, property owners, investors,
                and tenants make confident decisions and secure the best
                available opportunities.
              </p>
            </div>

            <ul className="space-y-2">
              {[
                { n: "01", label: "Site selection", desc: "Identifying the ideal location for your business." },
                { n: "02", label: "Property identification", desc: "Sourcing the right buildings and office spaces." },
                { n: "03", label: "Negotiation", desc: "Securing the best possible terms on every deal." },
                { n: "04", label: "Contract review", desc: "Making sure paperwork protects your interests." },
                { n: "05", label: "Investment advisory", desc: "Strategic guidance for long-term asset performance." },
              ].map((item) => (
                <li
                  key={item.n}
                  className="flex gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 transition-colors hover:border-accent/40 hover:bg-background/70"
                >
                  <span className="text-[11px] font-bold text-accent tracking-widest pt-0.5 shrink-0">{item.n}</span>
                  <div>
                    <p className="text-sm font-serif font-semibold text-primary leading-tight">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="bg-secondary/30 pb-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">01 · The Mission</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-5">
              Making real estate effortless
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-5xl mx-auto text-left">
              To provide specialized real estate services focused entirely on
              administrative spaces across all sectors of the market. We offer
              full support in securing suitable office spaces through{" "}
              <Link href="/services/tenant-representation" className="text-accent font-medium hover:underline">leasing, where we represent the tenant</Link>, or
              acquisition — whether for income-generating leased assets or
              vacant properties with investment potential. Our mission is to
              ensure efficient operations while maximizing long-term asset
              performance and value.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center pt-10 border-t border-border/40">
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">500+</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Happy clients</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">3+</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Years experience</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">250K</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Admin sqm leased</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">100K</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Admin sqm sold</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Customers — same client logo wall as the homepage */}
      <ClientsStrip />

      {/* Values Grid */}
      <section className="pt-2 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <a
              href={COMPANY_PROFILE_HREF}
              download={COMPANY_PROFILE_DOWNLOAD_NAME}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <Download className="h-4 w-4" />
              Download Company Profile
            </a>
          </div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">02 · What Sets Us Apart</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
              Six pillars, one promise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-background p-5 rounded-xl border border-border/60 hover:shadow-lg hover:border-accent/50 transition-all duration-300 group"
              >
                <div className="w-11 h-11 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold mb-2 text-primary">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-secondary/30 pt-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">03 · The Team</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
              The people behind PLACES
            </h2>
            <p className="text-muted-foreground mx-auto md:whitespace-nowrap">
              Advisors and brokers with end-to-end knowledge of Egypt's administrative real estate market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[
              // Founders
              { name: "Ahmed Eslam", title: "Co-Founder", image: "/images/optimized/why-places/Ahmed Eslam.JPG" },
              { name: "Mohamed Safwat", title: "Co-Founder", image: "/images/optimized/why-places/Mohamed Safwat .JPG", objectPosition: "center 25%" },
              // Senior leadership
              { name: "Omar Gamal", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Omar Gamal.JPG", objectPosition: "center 25%" },
              // Senior consultants
              { name: "Abdelrhman Younis", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Abdelrahman Younes.JPG" },
              { name: "Ahmed Ali", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Ahmed Ali.JPG" },
              { name: "Ibrahim Samir", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Ebrahim Samir .jpeg" },
              { name: "Mohamed Mohsen", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mohamed Mohsen .JPG" },
              { name: "Mostafa Ezzat", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mostafa Ezzat.JPG" },
              { name: "Abdallah Sleem", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Abdallah Sleem - senior corporate consultant _ 4  transactions - Celebrating exceptional performance and commitment throughout 2025..JPG" },
              { name: "Youssef Safwat", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Youssef Safwa.JPG" },
              { name: "Mohamed Eid", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mohamed Eid.JPG" },
              // Consultants
              { name: "Ahmed Khaled", title: "Senior Sales Consultant", image: "/images/optimized/why-places/Ahmed Khaled .JPG" },
              { name: "Dalia Ramadan", title: "Real Estate & Corporate Leasing Consultant", image: "/images/optimized/why-places/Dalia Ramadan.jpeg" },
              { name: "Youssef Hosny", title: "Corporate Consultant", image: "/images/optimized/why-places/Youssef Hussni.JPG" },
              { name: "Mohamed Sami", title: "Corporate Consultant", image: "/images/optimized/why-places/Mohamed Sami.JPG" },
              { name: "Ahmed Amr", title: "Corporate Consultant", image: "/images/optimized/why-places/Ahmed Amr .JPG" },
              { name: "Anas Harirah", title: "Corporate Consultant", image: "/images/optimized/why-places/Anas Harira.JPG" },
              { name: "Abdelrhman Salah", title: "Corporate Consultant", image: "/images/optimized/why-places/Abdelrahman Salah .JPG" },
              { name: "Ahmed Medhat", title: "Corporate Consultant", image: "/images/optimized/why-places/Ahmed Medhat.JPG" },
              { name: "Zeyad Medhat", title: "Senior Sales", image: "/images/optimized/why-places/Zeyad Medhat .JPG" },
              { name: "Mohamed Khaled", title: "Real Estate Advisor", image: "/images/optimized/why-places/Mohamed Khaled.JPG" },
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-primary/5 mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                    style={member.objectPosition ? { objectPosition: member.objectPosition } : undefined}
                  />
                </div>
                <h3 className="text-base font-serif font-bold text-primary mb-1 leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA — compact card with a left accent stripe and a
          horizontal copy/button layout. */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl border border-border/60 border-l-4 border-l-accent bg-background p-6 md:py-5 md:px-7">
            <div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary mb-1">
                Want our take on your specific situation?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Book a free 15-minute consultation with a PLACES advisor.
              </p>
            </div>
            <a
              href="https://wa.me/201063618217?text=Hi%2C%20I%27d%20like%20to%20book%20a%2015-minute%20consultation%20with%20a%20PLACES%20advisor."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Talk to us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <CornerSlideMagnet />
    </div>
  );
}
