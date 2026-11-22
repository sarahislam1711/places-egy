import { Link } from "wouter";
import { COMPANY_PROFILE_DOWNLOAD_NAME, COMPANY_PROFILE_HREF } from "@/lib/company-profile";
import { Facebook, Instagram, Linkedin, Phone, Mail, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/places.egy", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/share/1CMGKrymLB/", icon: Facebook },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/places-egy/", icon: Linkedin },
];

const SERVICES = [
  { name: "Leasing", href: "/services/leasing" },
  { name: "Primary Property", href: "/services/primary-property" },
  { name: "Property Resale", href: "/services/property-resale" },
  { name: "Investment Consultation", href: "/services/investment-consultation" },
  { name: "Income Generating Property", href: "/services/income-generating-property" },
];

const PHONE_DISPLAY = "01063618217";
const PHONE_TEL = "tel:+201063618217";
const WHATSAPP_HREF = "https://wa.me/201063618217";
const EMAIL = "admin@places-egy.com";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-serif text-base font-semibold text-accent">{children}</h4>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[11px] font-bold uppercase tracking-widest text-white/50 mt-5 mb-2">
      {children}
    </h5>
  );
}

// Small helper to keep all footer outbound clicks in one shape. GA4 events
// are the correct tool for attribution of clicks LEAVING the site — UTMs
// only work for INBOUND traffic (they live in the URL of the destination).
// Every outbound event includes source=footer + which channel + the page
// the click happened on so we can see "which pages drive social follows".
function trackFooterOutbound(channel: string) {
  return () => {
    trackEvent("outbound_click", {
      channel,
      source: "footer",
      page_url:
        typeof window !== "undefined" ? window.location.pathname : null,
    });
  };
}

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* PLACES — brand + contact */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <img src="/images/places-logo.png" alt="PLACES" loading="lazy" decoding="async" className="h-12 w-auto brightness-0 invert" />
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Egypt's specialized partner for administrative office real estate. Buy, lease, or resell offices throughout Egypt with confidence.
            </p>
            <ul className="space-y-3 text-sm text-gray-300 pt-2">
              <li>
                <a
                  href={PHONE_TEL}
                  onClick={trackFooterOutbound("call")}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackFooterOutbound("whatsapp")}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  onClick={trackFooterOutbound("email")}
                  className="flex items-center gap-3 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <span>{EMAIL}</span>
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackFooterOutbound(name.toLowerCase())}
                  aria-label={`PLACES on ${name}`}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-accent hover:border-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@places.eg"
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackFooterOutbound("tiktok")}
                aria-label="PLACES on TikTok"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-accent hover:border-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* BROWSE */}
          <div className="space-y-3">
            <SectionHeading>Browse</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/listings" className="hover:text-white transition-colors">All listings</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin offices</Link></li>
            </ul>
            <SubHeading>Explore</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/developers" className="hover:text-white transition-colors">Browse all Developers</Link></li>
              <li><Link href="/projects" className="hover:text-white transition-colors">Browse all Projects</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors">Browse all Locations</Link></li>
            </ul>
            {/* Search landing pages with deep stock (the server 404s a page under 8 units). */}
            <SubHeading>Popular searches</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/rent/new-cairo" className="hover:text-white transition-colors">Offices for rent in New Cairo</Link></li>
              <li><Link href="/buy/new-cairo" className="hover:text-white transition-colors">Offices for sale in New Cairo</Link></li>
              <li><Link href="/income-property/new-cairo" className="hover:text-white transition-colors">Income properties in New Cairo</Link></li>
              <li><Link href="/rent/sheikh-zayed" className="hover:text-white transition-colors">Offices for rent in Sheikh Zayed</Link></li>
            </ul>
          </div>

          {/* SERVICES */}
          <div className="space-y-3">
            <SectionHeading>Services</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-white transition-colors">{s.name}</Link>
                </li>
              ))}
            </ul>
            {/* Free Market Report CTA — moved from Company column to fill
                empty vertical space here; also feels more at home under
                Services since it IS one of the things PLACES offers. */}
            <div className="mt-4">
              <Link
                href="/resources/market-report"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full shadow-lg shadow-accent/20 transition-all hover:scale-105"
              >
                📄 Free Market Report
              </Link>
            </div>
          </div>

          {/* COMPANY */}
          <div className="space-y-3">
            <SectionHeading>Company</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/why-places" className="hover:text-white transition-colors">About</Link></li>
              <li><a href={COMPANY_PROFILE_HREF} download={COMPANY_PROFILE_DOWNLOAD_NAME} className="hover:text-white transition-colors">Company Profile</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
            <SubHeading>Resources</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/ar/blog" className="hover:text-white transition-colors">Arabic blog</Link></li>
              <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} PLACES. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
