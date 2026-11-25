import { Switch, Route, useLocation } from "wouter";
import { useEffect, useLayoutEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { BookMeetingFloat } from "@/components/BookMeetingFloat";
import { SignupGateModal } from "@/components/SignupGateModal";
import { ConciergeWidget } from "@/components/magnets/ConciergeWidget";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { organizationSchema, websiteSchema } from "@/lib/schema";

// Eager imports — Home loads on first paint, NotFound is imported as a
// component by faqs-section + locations/detail (React.lazy can't be used
// when the result is rendered as <NotFound /> instead of routed).
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// All other pages are code-split — each becomes its own chunk loaded on demand.
const ListingsPage = lazy(() => import("@/pages/listings"));
const ListingDetailPage = lazy(() => import("@/pages/listings/detail"));
const GlossaryPage = lazy(() => import("@/pages/resources/glossary"));
const FAQIndexPage = lazy(() => import("@/pages/resources/faqs"));
const FAQSectionPage = lazy(() => import("@/pages/resources/faqs-section"));
const BlogIndexPage = lazy(() => import("@/pages/resources/blog"));
const BlogPostPage = lazy(() => import("@/pages/resources/blog-post"));
const MarketReportPage = lazy(() => import("@/pages/resources/market-report"));
const GuidesIndexPage = lazy(() => import("@/pages/guides/index"));
const GuideRentalPricesPage = lazy(() => import("@/pages/guides/office-rental-prices-cairo-2026"));
const GuideHowToRentPage = lazy(() => import("@/pages/guides/how-to-rent-office-cairo"));
const GuideBuyVsRentPage = lazy(() => import("@/pages/guides/buy-vs-rent-office-cairo"));
const GuideSizePage = lazy(() => import("@/pages/guides/office-size-guide"));
const GuideFitOutPage = lazy(() => import("@/pages/guides/office-fit-out-costs-cairo"));
const SavedListingsPage = lazy(() => import("@/pages/saved"));
const TenantRepresentationPage = lazy(() => import("@/pages/services/tenant-representation"));
const PrimaryProperty = lazy(() => import("@/pages/services/primary-property"));
const PropertyResale = lazy(() => import("@/pages/services/property-resale"));
const InvestmentConsultation = lazy(() => import("@/pages/services/investment-consultation"));
const IncomeGeneratingProperty = lazy(() => import("@/pages/services/income-generating-property"));
const ServicesIndex = lazy(() => import("@/pages/services"));
const WhyPlaces = lazy(() => import("@/pages/why-places"));
const AdminOffices = lazy(() => import("@/pages/admin"));
const BusinessBuilding = lazy(() => import("@/pages/admin/business-building"));
const BusinessPark = lazy(() => import("@/pages/admin/business-park"));
const MixedUseMall = lazy(() => import("@/pages/admin/mixed-use"));
const Contact = lazy(() => import("@/pages/contact"));
const Developers = lazy(() => import("@/pages/developers"));
const EmaarPage = lazy(() => import("@/pages/developers/emaar"));
const ArabellaPage = lazy(() => import("@/pages/developers/arabella"));
const AlFuttaimPage = lazy(() => import("@/pages/developers/al-futtaim"));
const MajidAlFuttaimPage = lazy(() => import("@/pages/developers/majid-al-futtaim"));
const LmdPage = lazy(() => import("@/pages/developers/lmd"));
const SodicPage = lazy(() => import("@/pages/developers/sodic"));
const TheWaterwayPage = lazy(() => import("@/pages/developers/the-waterway"));
const MarakezPage = lazy(() => import("@/pages/developers/marakez"));
const ImkanMisrPage = lazy(() => import("@/pages/developers/imkan-misr"));
const MisrItaliaPage = lazy(() => import("@/pages/developers/misr-italia"));
const ModadPage = lazy(() => import("@/pages/developers/modad"));
const TheArkDevelopmentsPage = lazy(() => import("@/pages/developers/the-ark-developments"));
const KvrdPage = lazy(() => import("@/pages/developers/kvrd"));
const PreDevelopmentsPage = lazy(() => import("@/pages/developers/pre-developments"));
const AlRabatPropertiesPage = lazy(() => import("@/pages/developers/al-rabat-properties"));
const AlJaziPage = lazy(() => import("@/pages/developers/al-jazi"));
const HorizonEgyptPage = lazy(() => import("@/pages/developers/horizon-egypt"));
const CatalystPage = lazy(() => import("@/pages/developers/catalyst"));
const AfaaqPage = lazy(() => import("@/pages/developers/afaaq"));
const TownWritersPage = lazy(() => import("@/pages/developers/town-writers"));
const LarzPage = lazy(() => import("@/pages/developers/larz"));
const MorshedyPage = lazy(() => import("@/pages/developers/morshedy"));
const ElSewedyPage = lazy(() => import("@/pages/developers/el-sewedy"));
const InmaPage = lazy(() => import("@/pages/developers/inma-developments"));
const AmerGroupPage = lazy(() => import("@/pages/developers/amer-group"));
const MadinetMasrPage = lazy(() => import("@/pages/developers/madinet-masr"));
const RaslanGroupPage = lazy(() => import("@/pages/developers/raslan-group"));
const UpwydePage = lazy(() => import("@/pages/developers/upwyde"));
const PalmHillsPage = lazy(() => import("@/pages/developers/palm-hills"));
const SkyPage = lazy(() => import("@/pages/developers/sky"));
const OraPage = lazy(() => import("@/pages/developers/ora"));
const AkoyaPage = lazy(() => import("@/pages/developers/akoya"));
const ElHazekPage = lazy(() => import("@/pages/developers/el-hazek"));
const WealthPage = lazy(() => import("@/pages/developers/wealth"));
const Locations = lazy(() => import("@/pages/locations"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const LocationDetail = lazy(() => import("@/pages/locations/detail"));
const LandingPage = lazy(() => import("@/pages/landing"));
const AdminPage = lazy(() => import("@/pages/dashboard"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));

function ScrollToTop() {
  const [location] = useLocation();
  useLayoutEffect(() => {
    // If the URL has a hash (e.g. /resources/faqs#topic), let the page handle it.
    if (window.location.hash) return;
    // Force an instant jump even though html { scroll-behavior: smooth } is set
    // globally for in-page anchor links — otherwise route changes visibly
    // animate from the previous scroll position.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }, [location]);
  return null;
}

function PageViewTracker() {
  const [location] = useLocation();
  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_path: location,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
  return null;
}

// Fires a `click_outbound` GA4 event whenever the user clicks any link whose
// href points to a different origin than the site. Also captures a
// `download_pdf` event for any anchor with a download attribute pointing at
// a .pdf file (so we can count company-profile downloads without wiring
// individual onClicks on the ~2 anchors that download the file).
//
// One global delegated listener > 10 individual onClick handlers scattered
// through templates — same effect, one place to maintain.
function OutboundClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest?.("a");
      if (!target) return;
      const href = (target as HTMLAnchorElement).href;
      if (!href) return;

      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag !== "function") return;

      const isPdfDownload =
        (target as HTMLAnchorElement).hasAttribute("download") &&
        /\.pdf(\?.*)?$/i.test(href);
      if (isPdfDownload) {
        gtag("event", "download_pdf", {
          file_name: href.split("/").pop()?.split("?")[0] ?? href,
          file_url: href,
        });
        return;
      }

      // Outbound = different origin from the current page.
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
          gtag("event", "click_outbound", {
            link_domain: url.hostname,
            link_url: href,
            link_text: (target.textContent || "").trim().slice(0, 100),
          });
        }
      } catch {
        // Malformed href — ignore.
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}

const SITE_ORIGIN = "https://places-egy.com";

// Keep <link rel="canonical"> pointed at the current path on every route.
// index.html ships a hardcoded canonical (homepage); without this, every SPA
// route would tell crawlers its canonical is the homepage, collapsing the
// whole site's indexing onto "/". Query strings (e.g. ?transaction=sale filter
// params) are stripped so filtered views canonicalize to their base path and
// don't register as duplicate content.
function CanonicalTag() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location.split("?")[0].split("#")[0];
    // Normalize a trailing slash (except the root) so /listings and /listings/
    // don't produce two canonicals.
    const normalized = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
    const href = `${SITE_ORIGIN}${normalized}`;

    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }, [location]);
  return null;
}

// Suspense fallback shown while React.lazy() is fetching the chunk for a
// route the user just navigated to. Renders a full-height branded screen
// with the site background — deliberately NOT a bare white flash + tiny
// spinner. That's what users interpreted as "the page 404'd" — a moment
// of near-blank screen while the chunk loads.
function PageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent/70" />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <ChunkErrorBoundary>
    <Suspense fallback={<PageLoader />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listings" component={ListingsPage} />
      <Route path="/listings/page/:page" component={ListingsPage} />
      <Route path="/listings/:idSlug" component={ListingDetailPage} />
      <Route path="/why-places" component={WhyPlaces} />
      <Route path="/admin/business-building" component={BusinessBuilding} />
      <Route path="/admin/business-park" component={BusinessPark} />
      <Route path="/admin/mixed-use" component={MixedUseMall} />
      <Route path="/admin" component={AdminOffices} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/services" component={ServicesIndex} />
      <Route path="/services/tenant-representation" component={TenantRepresentationPage} />
      <Route path="/services/primary-property" component={PrimaryProperty} />
      <Route path="/services/property-resale" component={PropertyResale} />
      <Route path="/services/investment-consultation" component={InvestmentConsultation} />
      <Route path="/services/income-generating-property" component={IncomeGeneratingProperty} />
      <Route path="/glossary" component={GlossaryPage} />
      <Route path="/faqs" component={FAQIndexPage} />
      <Route path="/faqs/:slug" component={FAQSectionPage} />
      <Route path="/resources/market-report" component={MarketReportPage} />
      {/* Guides — long-form evergreen SEO content. Hub + 5 initial guides.
          Note: index route must be listed AFTER specific /guides/:slug
          routes so wouter matches the specific ones first. */}
      <Route path="/guides/office-rental-prices-cairo-2026" component={GuideRentalPricesPage} />
      <Route path="/guides/how-to-rent-office-cairo" component={GuideHowToRentPage} />
      <Route path="/guides/buy-vs-rent-office-cairo" component={GuideBuyVsRentPage} />
      <Route path="/guides/office-size-guide" component={GuideSizePage} />
      <Route path="/guides/office-fit-out-costs-cairo" component={GuideFitOutPage} />
      <Route path="/guides" component={GuidesIndexPage} />
      <Route path="/saved" component={SavedListingsPage} />
      <Route path="/blog">{() => <BlogIndexPage />}</Route>
      {/* Category filter — must come BEFORE /blog/:slug so wouter doesn't
          match "category" as a post slug. */}
      <Route path="/blog/category/:category">{() => <BlogIndexPage />}</Route>
      <Route path="/blog/:slug">{() => <BlogPostPage />}</Route>
      <Route path="/ar/blog">{() => <BlogIndexPage lang="ar" />}</Route>
      <Route path="/ar/blog/category/:category">{() => <BlogIndexPage lang="ar" />}</Route>
      <Route path="/ar/blog/:slug">{() => <BlogPostPage lang="ar" />}</Route>

      {/* Developer detail pages — must come before the generic /developers/:name fallback */}
      <Route path="/developers/emaar" component={EmaarPage} />
      <Route path="/developers/arabella" component={ArabellaPage} />
      <Route path="/developers/al-futtaim" component={AlFuttaimPage} />
      <Route path="/developers/majid-al-futtaim" component={MajidAlFuttaimPage} />
      <Route path="/developers/lmd" component={LmdPage} />
      <Route path="/developers/sodic" component={SodicPage} />
      <Route path="/developers/the-waterway" component={TheWaterwayPage} />
      <Route path="/developers/marakez" component={MarakezPage} />
      <Route path="/developers/imkan-misr" component={ImkanMisrPage} />
      <Route path="/developers/misr-italia" component={MisrItaliaPage} />
      <Route path="/developers/modad" component={ModadPage} />
      <Route path="/developers/the-ark-developments" component={TheArkDevelopmentsPage} />
      <Route path="/developers/kvrd" component={KvrdPage} />
      <Route path="/developers/pre-developments" component={PreDevelopmentsPage} />
      <Route path="/developers/al-rabat-properties" component={AlRabatPropertiesPage} />
      <Route path="/developers/al-jazi" component={AlJaziPage} />
      <Route path="/developers/horizon-egypt" component={HorizonEgyptPage} />
      <Route path="/developers/catalyst" component={CatalystPage} />
      <Route path="/developers/afaaq" component={AfaaqPage} />
      <Route path="/developers/town-writers" component={TownWritersPage} />
      <Route path="/developers/larz" component={LarzPage} />
      <Route path="/developers/morshedy" component={MorshedyPage} />
      <Route path="/developers/el-sewedy" component={ElSewedyPage} />
      <Route path="/developers/inma-developments" component={InmaPage} />
      <Route path="/developers/amer-group" component={AmerGroupPage} />
      <Route path="/developers/madinet-masr" component={MadinetMasrPage} />
      <Route path="/developers/raslan-group" component={RaslanGroupPage} />
      <Route path="/developers/upwyde" component={UpwydePage} />
      <Route path="/developers/palm-hills" component={PalmHillsPage} />
      <Route path="/developers/sky" component={SkyPage} />
      <Route path="/developers/ora" component={OraPage} />
      <Route path="/developers/akoya" component={AkoyaPage} />
      <Route path="/developers/el-hazek" component={ElHazekPage} />
      <Route path="/developers/wealth" component={WealthPage} />
      {/* Added 2026-08-25 */}

      {/* Location detail pages — dynamic template */}
      <Route path="/locations/:slug" component={LocationDetail} />
      {/* Search landing pages; the server 404s any page under the unit minimum. */}
      <Route path="/rent/:location" component={LandingPage} />
      <Route path="/buy/:location" component={LandingPage} />
      <Route path="/income-property/:location" component={LandingPage} />

      {/* Route categories to Listings Page for prototype */}
      <Route path="/admin/:type" component={ListingsPage} />
      <Route path="/developers/:name" component={ListingsPage} />
      <Route path="/services/:type" component={ListingsPage} />
      <Route path="/developers" component={Developers} />
      <Route path="/locations" component={Locations} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/dashboard" component={AdminPage} />
      {/* 
        For the prototype, other routes will fall back to 404 
        or we can map them to the listings page with different pre-sets 
        if we wanted to go deeper.
      */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
    </ChunkErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SchemaMarkup schema={organizationSchema} />
        <SchemaMarkup schema={websiteSchema} />
        <Toaster />
        <ScrollToTop />
        <CanonicalTag />
        <PageViewTracker />
        <OutboundClickTracker />
        <Router />
        <MobileBottomBar />
        {/* Book-a-meeting float HIDDEN 2026-08-17 per user request.
            Component + build code intentionally kept in the codebase
            (client/src/components/BookMeetingFloat.tsx). To re-enable,
            uncomment the line below. */}
        {/* <BookMeetingFloat /> */}
        <SignupGateModal />
        <ConciergeWidget />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
