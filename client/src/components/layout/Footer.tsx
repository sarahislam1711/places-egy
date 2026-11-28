import { Link } from "wouter";
import { COMPANY_PROFILE_DOWNLOAD_NAME, COMPANY_PROFILE_HREF } from "@/lib/company-profile";
import { Facebook, Instagram, Linkedin, Phone, Mail, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLang } from "@/lib/ui-text";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/places.egy", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/share/1CMGKrymLB/", icon: Facebook },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/places-egy/", icon: Linkedin },
];

// Names come from UI (lib/ui-text.ts) so the footer follows the page language.
const SERVICES = [
  { key: "tenantRep", href: "/services/tenant-representation" },
  { key: "primary", href: "/services/primary-property" },
  { key: "resale", href: "/services/property-resale" },
  { key: "investment", href: "/services/investment-consultation" },
  { key: "income", href: "/services/income-generating-property" },
] as const;

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
  const { t: ui, href, isAr } = useLang();
  const t = ui.footer;
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* PLACES — brand + contact */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <img src="/images/places-logo.png" alt="PLACES" loading="lazy" decoding="async" className="h-12 w-auto brightness-0 invert" />
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              {t.tagline}
            </p>
            <ul className="space-y-3 text-sm text-gray-300 pt-2">
              <li>
                <a
                  href={PHONE_TEL}
                  onClick={trackFooterOutbound("call")}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span dir="ltr">{PHONE_DISPLAY}</span>
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
                  <span>{ui.bar.whatsapp}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  onClick={trackFooterOutbound("email")}
                  className="flex items-center gap-3 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <span dir="ltr">{EMAIL}</span>
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
                  aria-label={t.on(name)}
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
                aria-label={t.on("TikTok")}
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
            <SectionHeading>{t.browse}</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={href("/listings")} className="hover:text-white transition-colors">{t.allListings}</Link></li>
              <li><Link href={href("/admin")} className="hover:text-white transition-colors">{t.adminOffices}</Link></li>
            </ul>
            <SubHeading>{t.explore}</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={href("/developers")} className="hover:text-white transition-colors">{t.developers}</Link></li>
              <li><Link href={href("/projects")} className="hover:text-white transition-colors">{t.projects}</Link></li>
              <li><Link href={href("/locations")} className="hover:text-white transition-colors">{t.locations}</Link></li>
            </ul>
            {/* Search landing pages with deep stock (the server 404s a page under 8 units). */}
            <SubHeading>{t.popular}</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={href("/rent/new-cairo")} className="hover:text-white transition-colors">{t.rentNewCairo}</Link></li>
              <li><Link href={href("/buy/new-cairo")} className="hover:text-white transition-colors">{t.buyNewCairo}</Link></li>
              <li><Link href={href("/income-property/new-cairo")} className="hover:text-white transition-colors">{t.incomeNewCairo}</Link></li>
              <li><Link href={href("/rent/sheikh-zayed")} className="hover:text-white transition-colors">{t.rentZayed}</Link></li>
            </ul>
          </div>

          {/* SERVICES */}
          <div className="space-y-3">
            <SectionHeading>{t.services}</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={href(s.href)} className="hover:text-white transition-colors">{ui.servicesItems[s.key]}</Link>
                </li>
              ))}
            </ul>
            {/* Free Market Report CTA — moved from Company column to fill
                empty vertical space here; also feels more at home under
                Services since it IS one of the things PLACES offers. */}
            <div className="mt-4">
              <Link
                href={href("/resources/market-report")}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full shadow-lg shadow-accent/20 transition-all hover:scale-105"
              >
                📄 {t.marketReport}
              </Link>
            </div>
          </div>

          {/* COMPANY */}
          <div className="space-y-3">
            <SectionHeading>{t.company}</SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={href("/why-places")} className="hover:text-white transition-colors">{t.about}</Link></li>
              <li><a href={COMPANY_PROFILE_HREF} download={COMPANY_PROFILE_DOWNLOAD_NAME} className="hover:text-white transition-colors">{t.profile}</a></li>
              <li><Link href={href("/contact")} className="hover:text-white transition-colors">{t.contact}</Link></li>
            </ul>
            <SubHeading>{t.resources}</SubHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={isAr ? "/ar/blog" : "/blog"} className="hover:text-white transition-colors">{t.blog}</Link></li>
              <li><Link href={isAr ? "/blog" : "/ar/blog"} lang={isAr ? "en" : "ar"} className="hover:text-white transition-colors">{t.otherBlog}</Link></li>
              <li><Link href={href("/guides")} className="hover:text-white transition-colors">{t.guides}</Link></li>
              <li><Link href={href("/faqs")} className="hover:text-white transition-colors">{t.faqs}</Link></li>
              <li><Link href={href("/glossary")} className="hover:text-white transition-colors">{t.glossary}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} PLACES. {t.rights}</p>
          <div className="flex gap-6">
            <Link href={href("/privacy-policy")} className="hover:text-white">{t.privacy}</Link>
            <Link href={href("/terms-of-service")} className="hover:text-white">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
