import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";

// `logoClass` is an optional override for logos whose source PNG has internal
// transparent padding — applied as extra classes on the <img> element so the
// visible logo lines up with the others (e.g. negative left margin).
const DEVELOPERS: { name: string; logo: string; desc: string; slug?: string; logoClass?: string }[] = [
  {
    name: "SODIC",
    logo: "/images/SODIC_Logo.png",
    desc: "One of Egypt's leading real estate developers with a portfolio spanning residential, commercial, and retail across West and East Cairo.",
    slug: "sodic",
  },
  {
    name: "Emaar",
    logo: "/images/Emaar_logo.png",
    desc: "A global real estate leader behind some of Cairo's most iconic mixed-use communities including Mivida, Marassi, and Uptown Cairo.",
    slug: "emaar",
  },
  {
    name: "Marakez",
    logo: "/images/Marakez _logo.png",
    desc: "Egyptian arm of Saudi Arabia's Fawaz Al Hokair Group — behind District 5 New Cairo, a 268-acre integrated mixed-use destination on the Cairo-Sokhna corridor.",
    slug: "marakez",
    logoClass: "-ml-4",
  },
  {
    name: "Al Futtaim",
    logo: "/images/Al futtaim _ logo.png",
    desc: "The group behind Cairo Festival City, one of Egypt's largest mixed-use developments combining retail, office, and hospitality.",
    slug: "al-futtaim",
  },
  {
    name: "Majid Al Futtaim",
    logo: "/images/majid-al-futtaim.png",
    desc: "Dubai-founded conglomerate operating the largest mall chain in the Middle East — behind Mall of Egypt, City Centre Almaza, and City Centre Maadi.",
    slug: "majid-al-futtaim",
  },
  {
    name: "Palm Hills",
    logo: "/images/PalmHills_logo.png",
    desc: "Egypt's leading integrated real estate developer since 1997 — listed on the Egyptian and London Stock Exchanges with 29 million sqm in portfolio, and three business park developments across New Cairo and Sheikh Zayed.",
    slug: "palm-hills",
  },
  {
    name: "LMD",
    logo: "/images/LMD-developments.png",
    desc: "A fast-growing developer delivering contemporary mixed-use projects across New Cairo with a focus on design and community.",
    slug: "lmd",
  },
  {
    name: "The Waterway",
    logo: "/images/waterway.png",
    desc: "Known for integrated commercial and residential developments in New Cairo, with a strong focus on walkable retail and F&B destinations.",
    slug: "the-waterway",
  },
  {
    name: "Morshedy Group",
    logo: "/images/morshedy-group.png",
    desc: "Formerly Memaar Al Morshedy — one of Egypt's longest-running developers, operating since 1983 with 21 mega projects, 40,000 residential units, and 4,000 admin units delivered across Maadi, Kattameya, and Greater Cairo.",
    slug: "morshedy",
  },
  {
    name: "Town Writers",
    logo: "/images/town-writers-logo.png",
    desc: "Narrative-driven developer behind New Cairo's Revolve Mall and Quadro on North 90 Street, with 50+ commercial and residential projects across New Cairo and the New Administrative Capital.",
    slug: "town-writers",
    logoClass: "-ml-4",
  },
  {
    name: "Larz Developments",
    logo: "/images/larz-developments-logo.png",
    desc: "Real estate arm of Al-Gawish Group — a 40-year-old Egyptian conglomerate — behind KOV strip mall in New Cairo's Golden Square, Cove Mall, and Larz Business Hub in the New Administrative Capital.",
    slug: "larz",
  },
  {
    name: "El Sewedy Developments",
    logo: "/images/elsewedy-developments-logo.png",
    desc: "Real estate arm of El Sewedy Industries — a sister company of Elsewedy Electric operating since 1938 — entering commercial real estate with U-Venues, a 35,000 sqm mixed-use destination at the gateway to New Cairo.",
    slug: "el-sewedy",
  },
  {
    name: "Inma Developments",
    logo: "/images/inma-developments.png",
    desc: "Real estate arm of Genena Group — the Egyptian conglomerate behind Genena Mall, one of Egypt's first commercial centers — delivering the Trivium series of business and commercial complexes across New Cairo's North 90 corridor.",
    slug: "inma-developments",
  },
  {
    name: "Amer Group",
    logo: "/images/amer-group-logo.png",
    desc: "One of Egypt's largest privately held real estate and hospitality groups since 1985 — known for the Porto resort brand and with a commercial presence in New Cairo through Top 90 on South 90 Street.",
    slug: "amer-group",
    logoClass: "scale-125 origin-left",
  },
  {
    name: "Madinet Masr",
    logo: "/images/Madinest-masr-logo.png",
    desc: "One of Egypt's most distinguished real estate developers with over 65 years of delivering large-scale integrated communities — and the developer behind Tajed, New Cairo's first fully integrated commercial district on the Ring Road.",
    slug: "madinet-masr",
    logoClass: "scale-125 origin-left",
  },
  {
    name: "Raslan Group",
    logo: "/images/raslan-group-logo.png",
    desc: "Egyptian holding group spanning real estate, construction, hospitality, and infrastructure — with two commercial strip mall developments in New Cairo: The Corner on Al Sadat Axis and Square One in the Narjis neighborhood near the Ring Road.",
    slug: "raslan-group",
  },
  {
    name: "Upwyde",
    logo: "/images/upwyde-logo.png",
    desc: "One of Egypt's most active commercial real estate developers — founded by six industry veterans with a combined half-century of experience — delivering four mixed-use commercial developments across New Cairo: IT, Cinco, Park Vie, and Granoy.",
    slug: "upwyde",
  },
  {
    name: "SKY — Park St.",
    logo: "/images/SKY-Park-st-logo.png",
    desc: "Founded in 1977, Sky Investments is a leading family-owned Egyptian conglomerate operating across 17 companies and 14,000+ employees — and the developer behind Park St., a boutique mixed-use brand with three Cairo developments.",
    slug: "sky",
    logoClass: "scale-125 origin-left",
  },
  {
    name: "ORA Developers Egypt",
    logo: "/images/ora-logo.png",
    desc: "International real estate group led by Naguib Sawiris — operating across Egypt, Cyprus, Grenada, Pakistan, UAE, and Iraq — with three business park developments across New Cairo and Sheikh Zayed: Solana East, Zed West, and Zed East.",
    slug: "ora",
    logoClass: "scale-125 origin-left -ml-12",
  },
  {
    name: "Akoya Developments",
    logo: "/images/Akoya-developments-logo.png",
    desc: "Egyptian real estate developer since 2008 — formed as a merger between Green Valley and Elghad — with two strip mall developments in New Cairo: The Ledge on the AUC Axis and Leven Square on Mohamed Naguib Axis.",
    slug: "akoya",
  },
  {
    name: "El Hazek Group",
    logo: "/images/El-Hazek-Group.png",
    desc: "Founded in 1979 — one of Egypt's most established real estate and construction groups operating across residential, commercial, tourism, and industrial real estate — with three commercial developments in New Cairo.",
    slug: "el-hazek",
  },
  {
    name: "Wealth Developments",
    // No logo file uploaded yet (/images/wealth-developments-logo.png was a 404):
    // the card shows the name instead. Add the file and restore the path.
    logo: "",
    desc: "Egyptian developer established in 2002 by Engineer Ahmed Shaker — founder of Arkan Engineering Consulting — with three mixed-use commercial developments on New Cairo's South 90 and North 90 Streets: Elev 8, At 9, and South Gate.",
    slug: "wealth",
  },
  {
    name: "Arabella",
    logo: "/images/arabella-developments.png",
    desc: "A developer delivering residential and commercial projects across Cairo with a focus on accessibility and value.",
    slug: "arabella",
  },
  {
    name: "Imkan Misr",
    logo: "/images/imkan-misr-logo.png",
    desc: "Egyptian arm of Abu Dhabi's IMKAN Properties, behind Alburouj — a 1,200-feddan East Cairo community home to Smart Village East.",
    slug: "imkan-misr",
    logoClass: "scale-125 origin-left",
  },
  {
    name: "Misr Italia",
    logo: "/images/Misritalia_logoo.png",
    desc: "Leading Egyptian developer behind Cairo Business Park — Grade A administrative offices on North 90th Street, New Cairo.",
    slug: "misr-italia",
  },
  {
    name: "Modad Developments",
    logo: "/images/modad-developments-logo.png",
    desc: "Egyptian construction and real estate group with 490+ projects across 27 governorates — built 80% of NBE's branch network — now delivering Brackets Mall on North 90 Street, New Cairo.",
    slug: "modad",
  },
  {
    name: "The Ark Developments",
    logo: "/images/the-ark-developments-logo.png",
    desc: "Coalition-backed developer behind The Ark Business District — a 92-acre integrated commercial destination on South 90 Street in New Cairo.",
    slug: "the-ark-developments",
    // Source PNG is white-on-transparent — invert so it renders as dark on the
    // card's white background.
    logoClass: "invert",
  },
  {
    name: "KVRD",
    logo: "/images/kvrd-logo.png",
    desc: "Research-led developer behind two of New Cairo's most distinctive commercial destinations: Polaris on North 90 Street and Sidewalk in the Golden Square.",
    slug: "kvrd",
  },
  {
    name: "PRE Developments",
    logo: "/images/Pre-developments-logo.png",
    desc: "Pioneers Real Estate — a 12 million sqm-land-bank developer behind three flagship New Cairo destinations: Point 90, ZAG, and The Big Business District.",
    slug: "pre-developments",
    logoClass: "scale-125 origin-left -ml-20",
  },
  {
    name: "Al Rabat Properties",
    logo: "/images/alrabat-properties.png",
    desc: "One of Egypt's longest-running specialized commercial developers, operating since 1980 and behind New Cairo's signature B Complexes series, the Medical Park chain, and flagship destinations including The Yard, Sway, Sleek, and By 9.",
    slug: "al-rabat-properties",
    logoClass: "scale-110 origin-left -ml-8",
  },
  {
    name: "Al Jazi Developments",
    logo: "/images/aljazi-logo.png",
    desc: "Egyptian arm of Qatar's Al Faisal Holding — exclusive Marriott International partner in Egypt, behind a 266,500 sqm Marriott-branded community on the Mohamed Naguib Axis with the Chess Field business park at its core.",
    slug: "al-jazi",
    logoClass: "scale-125 origin-left",
  },
  {
    name: "Horizon Egypt Developments",
    logo: "/images/Horizon-logo.png",
    desc: "Egyptian arm of UAE-based Adnan Saffarini Group — bringing 60 years of Emirati architectural expertise to New Cairo through Saada, a 370,000 sqm master-planned community on the New Suez Road.",
    slug: "horizon-egypt",
    logoClass: "scale-150 origin-left",
  },
  {
    name: "Catalyst Developments",
    logo: "/images/catalyst-logo.png",
    desc: "Egypt's first developer specialized exclusively in non-residential real estate — behind a portfolio of business hubs and medical destinations across New Cairo's most strategic Fifth Settlement corridors.",
    slug: "catalyst",
  },
  {
    name: "Afaaq Developments",
    logo: "/images/Afaaq-developments-logo.png",
    desc: "Creator of New Cairo's Amorada community brand — a three-project ecosystem combining ultra-luxurious residences, family compounds, and the Amorada Hub strip mall on the Middle Ring Road, designed by Copenhagen-based Norm Architects.",
    slug: "afaaq",
  },
];

export default function Developers() {
  useDocumentMeta({
    title: "Office Developers in Egypt — Trusted Real Estate Partners | PLACES",
    description:
      "PLACES works with 50+ verified office developers across Egypt — Emaar, Marakez, SODIC, Palm Hills, ORA, and more. Browse developer portfolios, projects, and available units.",
    url: "https://places-egy.com/developers",
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
        ])}
      />
      <SchemaMarkup
        schema={itemListSchema({
          name: "Egyptian Real Estate Developers",
          url: "/developers",
          items: DEVELOPERS.filter((d) => d.slug).map((d) => ({
            name: d.name,
            url: `/developers/${d.slug}`,
          })),
        })}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-3 md:mb-4 leading-tight flex flex-wrap items-center gap-3">
            <span>Developers we work with</span>
            <Users className="w-6 h-6 md:w-9 md:h-9 text-accent shrink-0" />
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            PLACES partners with Egypt's most active developers — giving you direct access to inventory, pricing, and market knowledge that isn't available elsewhere.
          </p>
        </div>
      </section>

      {/* Developer Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEVELOPERS.map((dev, i) => (
              <a
                key={i}
                href={dev.slug ? `/developers/${dev.slug}` : `/listings?developer=${encodeURIComponent(dev.name)}`}
                className="group relative flex flex-col h-full bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 md:p-8">
                  <div className="h-12 md:h-14 w-40 flex items-center justify-start mb-4 md:mb-6">
                    {dev.logo ? (
                      <img
                        src={dev.logo}
                        alt={`${dev.name} logo`}
                        loading="lazy"
                        decoding="async"
                        className={`max-h-full max-w-full object-contain object-left grayscale group-hover:grayscale-0 transition-all duration-300 ${dev.logoClass ?? ""}`}
                      />
                    ) : (
                      // Text-only fallback for developers whose logo file
                      // hasn't been uploaded yet. Rendered in the site's
                      // serif so it visually stands in for a wordmark.
                      <span className="font-serif text-lg md:text-xl font-bold text-primary/80 group-hover:text-primary transition-colors">
                        {dev.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-primary mb-2">{dev.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dev.desc}</p>
                </div>
                <div className="mt-auto px-6 md:px-8 pb-5 md:pb-6">
                  <span className="inline-flex items-center text-accent text-sm font-medium group-hover:text-primary transition-colors">
                    Explore developer <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2">
                Looking for a specific developer?
              </h2>
              <p className="text-muted-foreground">
                Tell us what you need and we'll connect you with the right project.
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
  );
}
