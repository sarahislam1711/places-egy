import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import {
  LOCATION_CONTENT,
} from "@/lib/location-content";
import {
  PROJECTS,
  DEVELOPER_DISPLAY_NAMES,
} from "@/lib/projects";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Building2,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Home,
  Landmark,
  Lightbulb,
  LayoutGrid,
  MessageCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, placeSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import NotFound from "@/pages/not-found";
import { DEALS, eligibleLandingPages } from "@/lib/landing-pages";
import { TenantRepCallout } from "@/components/TenantRepCallout";

const UNIT_TABS = [
  { tx: "rent", label: "For rent", noun: "offices for rent" },
  { tx: "sale", label: "For sale", noun: "offices for sale" },
  { tx: "income-property", label: "Income properties", noun: "income properties" },
] as const;

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Renders a string with lightweight emphasis markers:
//   **text**  →  primary bold
//   ~~text~~  →  accent color
function renderEmphasized(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|~~[^~]+~~)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={i} className="text-accent font-semibold">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

// Icon per property type. PLACES is admin-only — Building2 for all admin
// subtypes; default falls through to Building2 too.
function propertyTypeIcon(_type: string): LucideIcon {
  return Building2;
}


export default function LocationDetail() {
  const { slug } = useParams<{ slug: string }>();
  // Wait one frame for wouter's params to settle before deciding this is a
  // 404. Without this guard the component would flash <NotFound /> for a
  // frame when it renders before the router has populated `slug`, which
  // users perceive as "the page 404'd then loaded". Simple two-tick gate:
  // render a matched cream background while we wait, then render either
  // the real content or NotFound depending on whether the slug matched.
  const content = slug ? LOCATION_CONTENT[slug] : undefined;
  if (!slug) {
    return <div className="min-h-screen w-full bg-background" aria-hidden />;
  }

  // Per-location <title> + meta description so each /locations/{slug} page
  // ranks for its own district instead of being consolidated into the
  // homepage. useDocumentMeta safely no-ops when content is undefined
  // (invalid slug hits the NotFound fallback below).
  useDocumentMeta({
    title: content
      ? `${content.displayName} Business District: Projects & Prices | PLACES`
      : "Location — PLACES",
    description: content
      ? content.subtitle
      : "Browse admin offices across Egypt's top business districts.",
    url: content
      ? `https://places-egy.com/locations/${content.slug}`
      : "https://places-egy.com/locations",
  });

  // Newest 4 available units per deal type, for the tabbed "Available units" preview.
  const { data: newestByDeal = {} as Record<string, Listing[]> } = useQuery<Record<string, Listing[]>>({
    queryKey: ["location-newest-by-deal", content?.displayName],
    enabled: !!content,
    queryFn: async () => {
      const entries = await Promise.all(
        UNIT_TABS.map(async (tab) => {
          const { data, error } = await supabase
            .from<Listing>("listings")
            .select("*")
            .eq("is_test", false)
            .eq("property_type", "admin")
            .eq("location", content!.displayName)
            .eq("transaction_type", tab.tx)
            .neq("rental_status", "rented")
            .order("updated_at", { ascending: false })
            .limit(4);
          if (error) throw error;
          return [tab.tx, data ?? []] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
  });

  // Meta-only query for derived sections (projects / developers / types)
  type ListingMeta = Pick<Listing, "id" | "project" | "developer" | "property_type" | "subtype" | "transaction_type" | "location" | "rental_status">;
  const { data: allMeta = [] } = useQuery<ListingMeta[]>({
    queryKey: ["location-meta", content?.displayName],
    enabled: !!content,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("id, project, developer, property_type, subtype, transaction_type, location, rental_status")
        .eq('is_test', false)
        .eq("property_type", "admin")
        .eq("location", content!.displayName);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Selected developer pill in the "Top projects" filter — slug or "All"
  const [developerFilter, setDeveloperFilter] = useState<string>("All");

  // Static catalog projects whose location matches the current location.
  // Match by splitting on " · " so "Nasr City · Sheraton" matches "Sheraton".
  const locationProjects = useMemo(() => {
    if (!content) return [];
    const target = content.displayName.toLowerCase().trim();
    return PROJECTS.filter((p) =>
      p.location
        .toLowerCase()
        .split("·")
        .map((s) => s.trim())
        .includes(target),
    );
  }, [content]);

  // Distinct developer slugs present in the location's projects (preserves first-seen order)
  const developersInLocation = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of locationProjects) {
      if (seen.has(p.developer)) continue;
      seen.add(p.developer);
      out.push(p.developer);
    }
    return out;
  }, [locationProjects]);

  const filteredLocationProjects =
    developerFilter === "All"
      ? locationProjects
      : locationProjects.filter((p) => p.developer === developerFilter);

  // Distinct property_type + subtype pairs
  const propertyTypes = useMemo(() => {
    const seen = new Set<string>();
    const out: { property_type: string; subtype: string }[] = [];
    for (const row of allMeta) {
      if (!row.property_type || !row.subtype) continue;
      const key = `${row.property_type}|${row.subtype}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ property_type: row.property_type, subtype: row.subtype });
    }
    return out;
  }, [allMeta]);

  // Tabs with their available-unit counts; "See all" goes to the landing page
  // (/rent/new-cairo, …) when it's live, else to the filtered listings page.
  const unitTabs = useMemo(() => {
    if (!content) return [];
    const landing = eligibleLandingPages(allMeta).filter((p) => p.loc.slug === content.slug);
    return UNIT_TABS.map((tab) => {
      const count = allMeta.filter((l) => l.transaction_type === tab.tx && l.rental_status !== "rented").length;
      const page = landing.find((p) => DEALS[p.deal].tx === tab.tx);
      return {
        ...tab,
        count,
        href: page ? page.path : `/listings?transaction=${tab.tx}&location=${encodeURIComponent(content.displayName)}`,
        linkText: page ? `See all ${DEALS[page.deal].heading(content.displayName)}` : `See all ${tab.noun} in ${content.displayName}`,
      };
    }).filter((t) => t.count > 0 && (newestByDeal[t.tx]?.length ?? 0) > 0);
  }, [allMeta, content, newestByDeal]);
  const [unitTab, setUnitTab] = useState<string | null>(null);
  const activeTab = unitTabs.find((t) => t.tx === unitTab) ?? unitTabs[0];

  if (!content) return <NotFound />;

  const listingsHref = `/listings?location=${content.slug}`;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Locations", url: "/locations" },
          { name: content.displayName, url: `/locations/${content.slug}` },
        ])}
      />
      <SchemaMarkup
        schema={placeSchema({
          name: content.displayName,
          description: content.subtitle,
          url: `/locations/${content.slug}`,
        })}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img
            src={content.heroImage}
            alt={`${content.displayName} business district`}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/locations" className="hover:text-white transition-colors">Locations</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{content.displayName}</span>
          </nav>
          <div className="inline-flex w-12 h-12 bg-accent/20 rounded-full items-center justify-center text-accent mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            {content.h1}
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-3xl">
            {content.subtitle}
          </p>
          <a href={unitTabs.length > 0 ? "#available-units" : listingsHref}>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105"
            >
              Browse available units in {content.displayName}{" "}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-accent inline-flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              About {content.displayName}
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            {renderEmphasized(content.about)}
          </p>

          {content.highlights && content.highlights.length > 0 && (
            <div className="bg-secondary/50 rounded-2xl border-l-4 border-accent p-6 md:p-8 max-w-4xl">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                At a glance
              </span>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                {content.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-primary/90">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Available units — tabbed by deal type, each with a "See all" link to its landing page */}
      {activeTab && (
        <section id="available-units" className="py-8 bg-secondary/40 scroll-mt-24">
          <div className="container mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                <Home className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
                <span>Available units in {content.displayName}</span>
              </h2>
              <Link
                href={activeTab.href}
                className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
              >
                {activeTab.linkText} ({activeTab.count}) <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            {unitTabs.length > 1 && (
              <div role="tablist" aria-label="Deal type" className="flex flex-wrap gap-2 mb-6">
                {unitTabs.map((t) => (
                  <button
                    key={t.tx}
                    type="button"
                    role="tab"
                    aria-selected={t.tx === activeTab.tx}
                    onClick={() => setUnitTab(t.tx)}
                    className={`min-h-11 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                      t.tx === activeTab.tx
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {(newestByDeal[activeTab.tx] ?? []).map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact hideSubtype />
              ))}
            </div>
            <Link
              href={activeTab.href}
              className="md:hidden mt-6 flex w-full items-center justify-center rounded-full bg-primary text-white font-medium px-5 py-3 text-sm"
            >
              {activeTab.linkText} ({activeTab.count}) <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Top projects — sourced from /lib/projects.ts, filterable by developer */}
      {locationProjects.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-6 md:px-10">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                <Landmark className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
                <span>Top projects in {content.displayName}</span>
              </h2>
            </div>

            {/* Developer filter — hidden when only one developer has projects here */}
            {developersInLocation.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setDeveloperFilter("All")}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    developerFilter === "All"
                      ? "bg-primary text-white"
                      : "bg-white text-primary border border-border/60 hover:border-primary"
                  }`}
                >
                  All
                </button>
                {developersInLocation.map((devSlug) => (
                  <button
                    key={devSlug}
                    onClick={() => setDeveloperFilter(devSlug)}
                    className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                      developerFilter === devSlug
                        ? "bg-primary text-white"
                        : "bg-white text-primary border border-border/60 hover:border-primary"
                    }`}
                  >
                    {DEVELOPER_DISPLAY_NAMES[devSlug] ?? formatLabel(devSlug)}
                  </button>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLocationProjects.map((project, i) => {
                const developerName =
                  DEVELOPER_DISPLAY_NAMES[project.developer] ?? formatLabel(project.developer);
                return (
                  <div
                    key={`${project.name}-${project.developer}-${i}`}
                    className="relative h-72 rounded-2xl overflow-hidden"
                  >
                    <img
                      src={project.image}
                      alt={project.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10" />
                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-2.5 py-1 rounded-full shadow-sm">
                          <Building2 className="w-3 h-3" />
                          {developerName}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-white mb-1.5">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-white/80">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {project.location}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why businesses choose */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3">
              <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>Why choose an office in {content.displayName}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* For businesses — light cream, navy stat */}
            <div className="bg-secondary/60 rounded-2xl border-l-4 border-primary p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary/70">
                  For businesses
                </span>
              </div>
              <div className="mb-6">
                <div className="text-3xl md:text-6xl font-serif font-bold text-primary leading-none mb-2">
                  {content.why.operators.stat}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-primary/60">
                  {content.why.operators.statLabel}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary mb-4 leading-snug">
                {content.why.operators.headline}
              </h3>
              <ul className="space-y-3">
                {content.why.operators.bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-primary/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For investors — light cream, accent stat */}
            <div className="bg-secondary/60 rounded-2xl border-l-4 border-accent p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center text-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  For investors
                </span>
              </div>
              <div className="mb-6">
                <div className="text-3xl md:text-6xl font-serif font-bold text-accent leading-none mb-2">
                  {content.why.investors.stat}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-primary/60">
                  {content.why.investors.statLabel}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary mb-4 leading-snug">
                {content.why.investors.headline}
              </h3>
              <ul className="space-y-3">
                {content.why.investors.bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-primary/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Property types — hidden if empty */}
      {propertyTypes.length > 0 && (
        <section className="py-8 bg-secondary/40">
          <div className="container mx-auto px-6 md:px-10">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
                <span>Property types available in {content.displayName}</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyTypes.map(({ property_type, subtype }) => {
                const Icon = propertyTypeIcon(property_type);
                return (
                  <a
                    key={`${property_type}-${subtype}`}
                    href={`/listings?location=${content.slug}&type=${encodeURIComponent(property_type)}&subtype=${encodeURIComponent(subtype)}`}
                    className="group flex items-center gap-4 bg-white rounded-xl border border-border/40 border-l-4 border-l-accent px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
                        {formatLabel(property_type)}
                      </span>
                      <span className="block text-base font-serif font-bold text-primary truncate">
                        {formatLabel(subtype)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tenant representation */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <TenantRepCallout variant="rent" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-4 flex items-center justify-center gap-3">
              <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-accent shrink-0" />
              <span>Looking for an office in {content.displayName}?</span>
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              We know this market well. Talk to a PLACES advisor before you commit to anything.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-6 md:px-10 h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                Speak with a PLACES advisor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
