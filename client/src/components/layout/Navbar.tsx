import { Link, useLocation } from "wouter";
import { Menu, X, Building2, TrendingUp, Handshake, Repeat, Coins, MessageCircle, ChevronDown, ArrowRight, Newspaper, HelpCircle, BookOpen, Compass, Sparkles, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { NavbarFavoriteButton } from "@/components/NavbarFavoriteButton";

const RESOURCES = [
  { title: "Blog", href: "/blog", icon: Newspaper },
  { title: "Guides", href: "/guides", icon: Compass },
  { title: "FAQs", href: "/faqs", icon: HelpCircle },
  { title: "Glossary", href: "/glossary", icon: BookOpen },
];

const SERVICES = [
  { title: "Tenant Representation", href: "/services/tenant-representation", icon: Handshake },
  { title: "Primary Property", href: "/services/primary-property", icon: Building2 },
  { title: "Property Resale", href: "/services/property-resale", icon: Repeat },
  { title: "Investment Consultation", href: "/services/investment-consultation", icon: TrendingUp },
  { title: "Income Generating Property", href: "/services/income-generating-property", icon: Coins },
];

const WHATSAPP_HREF = "https://wa.me/201063618217";

/** `solid`: always use the solid bar (pages without a dark photo header). */
export function Navbar({ solid = false }: { solid?: boolean } = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

  const isActive = (path: string) => location === path;

  const hasHero =
    ["/", "/listings", "/admin"].includes(location) ||
    location.startsWith("/developers/") ||
    /^\/locations\/[^/]+$/.test(location) ||
    /^\/admin\/[^/]+$/.test(location);
  const useSolid = solid || !hasHero || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
  };

  const toggleSection = (key: string) =>
    setOpenMobileSection((curr) => (curr === key ? null : key));

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 text-white",
      useSolid
        ? "bg-primary/95 backdrop-blur-lg border-b border-white/5 shadow-sm shadow-primary/5"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        {/* Column 1 — logo (left-aligned) */}
        <Link href="/" className="flex items-center gap-2 shrink-0 lg:justify-self-start">
          <img src="/images/places-logo.png" alt="PLACES" className="h-10 w-auto brightness-0 invert shrink-0" />
        </Link>

        {/* Column 2 — nav (center column, auto-sized, mathematically centered) */}
        <div className="hidden lg:flex items-center gap-2 justify-self-center">
          <NavigationMenu delayDuration={0} skipDelayDuration={0}>
            <NavigationMenuList className="gap-0">
              {/* Properties */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Admin Offices</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <AdminOfficesMenuContent />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Locations */}
              <NavigationMenuItem>
                <Link href="/locations" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors px-3.5", isActive("/locations") && "text-accent font-medium")}>
                  Locations
                </Link>
              </NavigationMenuItem>

              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1.5 p-3">
                    {SERVICES.map((item) => (
                      <li key={item.title}>
                        <Link href={item.href} className="flex items-center gap-2.5 select-none rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* About */}
              <NavigationMenuItem>
                <Link href="/why-places" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors px-3.5", isActive("/why-places") && "text-accent font-medium")}>
                  About
                </Link>
              </NavigationMenuItem>

              {/* Resources */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-55 gap-1.5 p-3">
                    {RESOURCES.map((item) => (
                      <li key={item.title}>
                        <Link href={item.href} className="flex items-center gap-2.5 select-none rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium leading-none">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Column 3 — Desktop CTAs (right-aligned) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 lg:justify-self-end">
          <Link href="/contact">
            <Button variant="outline" size="sm" className="rounded-full px-4 h-9 text-sm font-medium bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
              Contact
            </Button>
          </Link>
          <Link href="/listings">
            <Button size="sm" className="rounded-full px-4 h-9 text-sm font-medium bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20">
              Browse Listings
            </Button>
          </Link>
          <NavbarFavoriteButton />
        </div>

        {/* Mobile Menu Toggle — p-3 pushes tap target to 48×48 (well above
            iOS/Android 44×44 minimum) so users don't miss the hamburger
            when they mean to tap it. */}
        <button
          className="lg:hidden p-3 -mr-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-primary border-b border-white/10 shadow-xl py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-5 text-white h-[calc(100vh-5rem)] overflow-y-auto pb-20">
          {/* Browse Listings — primary CTA at top */}
          <Link href="/listings" onClick={closeMobile}>
            <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold py-4 text-sm">
              Browse Listings
            </Button>
          </Link>

          {/* Properties (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("properties")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "properties" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Admin Offices
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "properties" && "rotate-180")} />
            </button>
            {openMobileSection === "properties" && (
              <div className="pb-3 pl-4 flex flex-col gap-1 border-l border-white/10">
                {/* Mobile mirrors the desktop 2x2 card layout as a stacked
                    list — each row has an icon + title + tagline so mobile
                    users get the same context without needing the card
                    treatment. Tap targets are py-3 = 48px vertical, well
                    above the 44px iOS/Android minimum. */}
                {ADMIN_SUBTYPES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent shrink-0">
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <p className="text-[11px] text-white/60 leading-tight mt-0.5">{item.tagline}</p>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/admin" onClick={closeMobile} className="text-xs font-semibold text-accent hover:text-accent/80 pl-2 mt-2 inline-flex items-center gap-1">View all admin offices <ArrowRight className="w-3 h-3" /></Link>
              </div>
            )}
          </div>

          {/* Locations (flat) */}
          <Link href="/locations" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">Locations</Link>

          {/* Services (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("services")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "services" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Services
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "services" && "rotate-180")} />
            </button>
            {openMobileSection === "services" && (
              <div className="pb-3 pl-4 flex flex-col gap-2">
                {SERVICES.map((item) => (
                  <Link key={item.title} href={item.href} onClick={closeMobile} className="text-sm hover:text-accent">
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About (flat) */}
          <Link href="/why-places" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">About</Link>

          {/* Resources (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("resources")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "resources" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Resources
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "resources" && "rotate-180")} />
            </button>
            {openMobileSection === "resources" && (
              <div className="pb-3 pl-4 flex flex-col gap-2">
                {RESOURCES.map((item) => (
                  <Link key={item.title} href={item.href} onClick={closeMobile} className="text-sm hover:text-accent inline-flex items-center gap-2">
                    <item.icon className="w-4 h-4" /> {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact (flat) */}
          <Link href="/contact" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">Contact</Link>

          {/* WhatsApp direct link — GA4 outbound_click so we can measure
              which pages drive the most WA taps from the mobile nav. */}
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("outbound_click", {
                channel: "whatsapp",
                source: "navbar_mobile",
                page_url:
                  typeof window !== "undefined" ? window.location.pathname : null,
              });
              closeMobile();
            }}
            className="flex items-center gap-2 text-base font-medium py-3 text-accent hover:text-accent/80"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp us directly
          </a>
        </div>
      )}
    </header>
  );
}

// Admin Offices dropdown — reoriented from "property TYPE" to "deal INTENT"
// per user request 2026-09-07. Every visitor has one of these 4 questions on
// their mind when they click Admin Offices; giving them a one-tap path to
// the right filter cuts the number of clicks to the listing that fits them.
//
// Each item has a lucide icon (for visual scanning in a 2x2 grid), a bold
// title, and a one-line clarifier that removes any ambiguity about the
// deal type.
//
// Rent / Sale / Income Property go to the /rent, /buy and /income-property
// hubs (2026-11-27): same admin-office listings, but indexable pages built to
// rank, instead of filtered /listings?… URLs that robots.txt blocks.
const ADMIN_SUBTYPES = [
  {
    href: "/rent",
    title: "Rent",
    tagline: "Lease admin office space",
    icon: Key,
  },
  {
    href: "/buy",
    title: "Sale",
    tagline: "Buy admin office space",
    icon: Handshake,
  },
  {
    href: "/income-property",
    title: "Income Property",
    tagline: "Rented units generating yields",
    icon: TrendingUp,
  },
  {
    href: "/services/primary-property",
    title: "Primary",
    tagline: "Off-plan direct from developers",
    icon: Sparkles,
  },
] as const;

// Intent-first 2x2 grid dropdown. Each cell is a fast-decision card: an
// icon in an accent-tinted circle, a bold intent label, a one-line
// clarifier. Cards get an accent border + subtle lift on hover so users
// know they're clickable without needing an underline or explicit CTA.
//
// The bottom "View all admin offices →" row is preserved as a fifth
// escape hatch for browsers who want to scan every listing rather than
// commit to a specific deal type.
//
// Sizing: total width ~440px on desktop, comfortable click targets
// (~140px wide × ~110px tall per card, well above the 44px minimum).
// Mobile layout is handled separately in the hamburger menu below,
// so this component only renders on lg: viewports.
// Tightened 2026-09-07 per user feedback: icons now sit inline with the
// title (was stacked above) and the whole dropdown shrunk from 440px to
// 360px. Each card dropped from ~110px tall to ~68px tall — roughly 40%
// smaller vertically. Still fully accessible: card is 168px wide × 68px
// tall = well above the 44px minimum tap target.
// Intent-first 2x2 dropdown. Wrapper uses the site's warm cream tone
// (matches the FadeInSection cards on the homepage) so the panel feels
// like an editorial extension of PLACES's design language, not a
// generic bootstrap dropdown floating on white.
//
// Cards float on top with slightly-off-white surfaces + accent hover
// tint. The header row and footer link have their own faint separators
// so the eye reads: [heading] → [choices] → [browse everything].
function AdminOfficesMenuContent() {
  return (
    <div className="w-92 bg-[#F8F5F1] p-4 rounded-md">
      {/* Eyebrow — anchors what the visitor is looking at */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
        What are you looking for?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ADMIN_SUBTYPES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col select-none rounded-lg no-underline outline-none bg-white border border-border/40 px-3 py-3 transition-all hover:border-accent/60 hover:bg-accent/[0.03] hover:-translate-y-0.5 hover:shadow-sm focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                </div>
                <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-none">
                  {item.title}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                {item.tagline}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-primary/10">
        <Link
          href="/admin"
          className="group flex items-center justify-between px-1 py-1 text-xs font-semibold text-primary hover:text-accent transition-colors"
        >
          <span>View all admin offices</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
