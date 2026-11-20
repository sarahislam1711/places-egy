import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { DEFAULT_FILTERS, locationLabel, type Filters } from "@/components/listings/FilterSidebar";
import { ListingsFilterBar } from "@/components/listings/ListingsFilterBar";
import { buildListingsSearch, parseListingsSearch, type ListingsUrlState, type SortOption, type ViewMode } from "@/lib/listing-filters-url";
import { ListingCard } from "@/components/listings/ListingCard";
import { SafeListingsMap, canDrawMaps } from "@/components/listings/SafeMap";
import { supabase, type Listing } from "@/lib/supabase";
import { FURNISHING_OPTIONS, getEnumLabel } from "@/lib/enums";
import { formatEgpShort, priceInEgp, useUsdEgpRate } from "@/lib/currency";
import { DEVELOPER_DISPLAY_NAMES } from "@/lib/projects";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { listingUrl } from "@/lib/listings";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, Map as MapIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Matches the server-rendered /listings/page/N pages (server/seo/render.ts).
const PAGE_SIZE = 48;

const SORT_LABELS: Record<SortOption, string> = {
  "newest": "Newest First",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  "area-large": "Area: Large to Small",
  "area-small": "Area: Small to Large",
};

const LISTINGS_CANONICAL = "https://places-egy.com/listings";

// Faceted-navigation SEO: filtered/search views of /listings (any ?query) are
// near-infinite low-value URL variations and render an empty "no matches" state
// when a filter has no results — which Google reports as soft 404s. We mark any
// filtered view noindex,follow and canonicalize it to the clean /listings page,
// so only /listings itself is indexed. The clean page gets a self-canonical.
function useListingsIndexability(page: number, search: string) {
  useEffect(() => {
    const hasParams = search.length > 0;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", hasParams ? "noindex,follow" : "index,follow");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", page > 1 ? `${LISTINGS_CANONICAL}/page/${page}` : LISTINGS_CANONICAL);

    return () => {
      // Restore indexability when leaving so the next page isn't left noindexed.
      robots?.setAttribute("content", "index,follow");
    };
  }, [page, search]);
}

export default function ListingsPage() {
  // Filters, search, sort and view live in the query string (P1-3), so a
  // filtered view can be shared, bookmarked and restored with Back.
  const search = useSearch();
  const [initial] = useState<ListingsUrlState>(() =>
    parseListingsSearch(typeof window === "undefined" ? "" : window.location.search),
  );
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [searchQuery, setSearchQuery] = useState(initial.q);
  const [sortBy, setSortBy] = useState<SortOption>(initial.sort);
  const [viewMode, setViewMode] = useState<ViewMode>(initial.view);
  const urlState: ListingsUrlState = { filters, q: searchQuery, sort: sortBy, view: viewMode };
  const urlStateRef = useRef(urlState);
  urlStateRef.current = urlState;

  // The query string changed from outside (map pin -> ?q=<project>, navbar
  // links, Back/Forward): adopt it. Our own writes below round-trip to the
  // same string and are skipped.
  useEffect(() => {
    const next = parseListingsSearch(search);
    if (buildListingsSearch(next) === buildListingsSearch(urlStateRef.current)) return;
    setFilters(next.filters);
    setSearchQuery(next.q);
    setSortBy(next.sort);
    setViewMode(next.view);
  }, [search]);

  const routeParams = useParams<{ page?: string }>();
  useListingsIndexability(Math.max(1, Number(routeParams.page) || 1), search);

  // Write state changes back to the URL (replace, so typing doesn't flood
  // history). Anything but a view switch sends the visitor back to page 1.
  const [, navigate] = useLocation();
  const resultsKey = buildListingsSearch({ ...urlState, view: "grid" });
  const lastResultsKey = useRef(resultsKey);
  useEffect(() => {
    const next = buildListingsSearch(urlState, window.location.search);
    const resetPage = resultsKey !== lastResultsKey.current;
    lastResultsKey.current = resultsKey;
    const path = resetPage ? "/listings" : window.location.pathname;
    if (path === window.location.pathname && next === window.location.search) return;
    navigate(path + next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, sortBy, viewMode]);

  const { data: listings = [], isLoading, error } = useQuery<Listing[]>({
    queryKey: ["listings"],
    // Serve cached data instantly on revisit; refetch in the background after
    // 60s. gcTime keeps the cache alive for 5 minutes after the page unmounts
    // so navigating away and back is instant.
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq('is_test', false)
        .eq("property_type", "admin")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Live USD→EGP rate (server/fx.ts) so budget filtering and price sorting
  // compare USD and EGP listings at today's rate.
  const fxRate = useUsdEgpRate().rate;

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Free-text search — matches across title, project, location,
      // developer slug, and description. Empty query passes everything.
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          listing.title,
          listing.project,
          listing.location,
          listing.location_area,
          listing.developer,
          listing.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Transaction type (null = show all)
      // Normalize both sides to slug-form (lowercase + spaces → hyphens)
      // so filter label "Income Property" matches DB value "income-property".
      // Also correctly matches "Sale"/"Rent" against their identical slugs.
      if (
        filters.transactionType &&
        listing.transaction_type?.toLowerCase().replace(/\s+/g, "-") !==
          filters.transactionType.toLowerCase().replace(/\s+/g, "-")
      ) {
        return false;
      }
      // Property type (null = show all)
      if (filters.propertyType && listing.property_type?.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }
      // Subtype (multi, no selection = no filter) — normalize slugs
      if (filters.subtype.length > 0) {
        const normalize = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
        if (!filters.subtype.some(s => normalize(s) === normalize(listing.subtype ?? ""))) {
          return false;
        }
      }
      // Location (single, null = no filter) — normalize slugs (e.g. "new-cairo" matches "New Cairo")
      if (filters.location) {
        const normalize = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
        if (normalize(listing.location ?? "") !== normalize(filters.location)) {
          return false;
        }
      }
      // Budget, compared in EGP so USD listings are matched at the configured
      // rate. Unpriced listings are hidden once a bound is set.
      if (filters.priceMin != null || filters.priceMax != null) {
        const p = priceInEgp(listing, fxRate);
        if (p == null) return false;
        if (filters.priceMin != null && p < filters.priceMin) return false;
        if (filters.priceMax != null && p > filters.priceMax) return false;
      }
      // Area (m²). Units without an area are hidden once either bound is set.
      if (filters.areaMin != null || filters.areaMax != null) {
        const a = listing.area_sqm ?? 0;
        if (!a) return false;
        if (filters.areaMin != null && a < filters.areaMin) return false;
        if (filters.areaMax != null && a > filters.areaMax) return false;
      }
      // Furnishing (multi, no selection = no filter)
      if (filters.furnishing.length > 0 && !filters.furnishing.some(f => f.toLowerCase() === listing.furnishing?.toLowerCase())) {
        return false;
      }
      // Developer (single, null = no filter)
      if (filters.developer && listing.developer?.toLowerCase() !== filters.developer.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [listings, filters, searchQuery, fxRate]);

  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (priceInEgp(a, fxRate) ?? Infinity) - (priceInEgp(b, fxRate) ?? Infinity));
      case "price-high":
        return sorted.sort((a, b) => (priceInEgp(b, fxRate) ?? -1) - (priceInEgp(a, fxRate) ?? -1));
      case "area-large":
        return sorted.sort((a, b) => (b.area_sqm ?? 0) - (a.area_sqm ?? 0));
      case "area-small":
        return sorted.sort((a, b) => (a.area_sqm ?? 0) - (b.area_sqm ?? 0));
      case "newest":
      default:
        // Available before rented; within each, recently edited first, like new ones.
        return sorted.sort(
          (a, b) =>
            Number(a.rental_status === "rented") - Number(b.rental_status === "rented") ||
            (b.updated_at ?? "").localeCompare(a.updated_at ?? "") ||
            b.id - a.id,
        );
    }
  }, [filteredListings, sortBy, fxRate]);

  const page = Math.max(1, Number(routeParams.page) || 1);
  const pageCount = Math.max(1, Math.ceil(sortedListings.length / PAGE_SIZE));
  const pagedListings = sortedListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // Filters can shrink the result set below the current page.
  useEffect(() => {
    if (!isLoading && page > pageCount) navigate("/listings" + window.location.search, { replace: true });
  }, [isLoading, page, pageCount, navigate]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);


  // Track search queries after the user stops typing for 800ms. Debouncing
  // avoids flooding GA4 with partial keystroke queries ("n", "ne", "new"…)
  // and lets us report only the queries the user actually settled on, plus
  // how many results those queries produced.
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackEvent("listings_search", {
        search_term: searchQuery.trim().toLowerCase(),
        result_count: sortedListings.length,
      });
    }, 800);
    return () => clearTimeout(timer);
    // Intentionally excluding sortedListings from deps — we only want the
    // fire on query change, not every re-sort.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Track filter/sort/view changes so we can see which filter combinations
  // are actually used vs ignored. Skips the initial mount (defaults).
  useEffect(() => {
    if (filters === DEFAULT_FILTERS) return;
    trackEvent("listings_filter_change", {
      transaction_type: filters.transactionType ?? null,
      subtype: filters.subtype.join(",") || null,
      location: filters.location ?? null,
      developer: filters.developer ?? null,
      furnishing: filters.furnishing.join(",") || null,
      price_min: filters.priceMin,
      price_max: filters.priceMax,
      area_min: filters.areaMin,
      area_max: filters.areaMax,
      sort_by: sortBy,
      view_mode: viewMode,
      result_count: sortedListings.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, viewMode]);

  const activeFilterChips = (() => {
    // Only filters from "More filters" — deal, location, size and budget
    // already show their value on their own button in the filter bar.
    const chips: { label: string; clear: () => void }[] = [];
    // propertyType chip removed — site is admin-only, so the chip would
    // always appear and have nothing meaningful to clear to.
    filters.subtype.forEach((s) => chips.push({ label: s, clear: () => setFilters((p) => ({ ...p, subtype: p.subtype.filter((x) => x !== s) })) }));
    if (filters.developer) chips.push({ label: DEVELOPER_DISPLAY_NAMES[filters.developer] ?? filters.developer, clear: () => setFilters((p) => ({ ...p, developer: null })) });
    filters.furnishing.forEach((f) => chips.push({ label: getEnumLabel(FURNISHING_OPTIONS, f), clear: () => setFilters((p) => ({ ...p, furnishing: p.furnishing.filter((x) => x !== f) })) }));
    return chips;
  })();
  const hasAnyFilter =
    activeFilterChips.length > 0 || !!filters.transactionType || !!filters.location ||
    filters.areaMin != null || filters.areaMax != null || filters.priceMin != null || filters.priceMax != null ||
    !!searchQuery.trim();

  // Map: hidden by default everywhere; the "Show map" button opens it above
  // the results (on phones via ?view=map, as before). Its code isn't even
  // downloaded until then. It collapses for good if it can't draw — see
  // SafeListingsMap.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [desktopMapHidden, setDesktopMapHidden] = useState(true);
  const [mapUnavailable, setMapUnavailable] = useState(() => typeof window !== "undefined" && !canDrawMaps());
  const mapOpen = !mapUnavailable && (isDesktop ? !desktopMapHidden : viewMode === "map");
  const resultsView = viewMode === "list" ? "list" : "grid";

  const dealPhrase =
    filters.transactionType === "Rent" ? "offices for rent"
    : filters.transactionType === "Sale" ? "offices for sale"
    : filters.transactionType === "Income Property" ? "income properties"
    : "offices";
  const count = sortedListings.length;
  const headlineNoun = count === 1 ? dealPhrase.replace(/^offices/, "office").replace(/^income properties/, "income property") : dealPhrase;

  return (
    <div className="min-h-screen flex flex-col bg-muted font-sans">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Listings", url: "/listings" },
        ])}
      />
      {sortedListings.length > 0 && (
        <SchemaMarkup
          schema={itemListSchema({
            name: "PLACES Listings",
            url: "/listings",
            items: sortedListings.slice(0, 30).map((l) => ({ name: l.title, url: listingUrl(l) })),
          })}
        />
      )}
      <Navbar solid />

      <main className="container mx-auto px-6 md:px-10 pt-24 md:pt-28 pb-24 lg:pb-12 flex-1">
        <ListingsFilterBar
          filters={filters}
          setFilters={setFilters}
          listings={listings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Result count + sort + view controls */}
        <div className="mt-6 md:mt-8 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-primary leading-none">
              {isLoading ? (
                <span className="text-3xl md:text-5xl font-bold">Offices in Cairo</span>
              ) : (
                <>
                  <span className="text-4xl md:text-6xl font-bold">{count.toLocaleString()}</span>{" "}
                  <span className="text-2xl md:text-4xl text-primary/60">{headlineNoun} found</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              In <span className="text-primary font-medium">{filters.location ? locationLabel(filters.location) : "Cairo"}</span>
              {searchQuery.trim() && <> · matching “{searchQuery.trim()}”</>}
              {hasAnyFilter && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }}
                    className="underline underline-offset-4 decoration-border hover:text-accent hover:decoration-accent transition-colors"
                  >
                    Clear all
                  </button>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-white border border-border/60 rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 rounded-full transition-colors ${resultsView === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-2 rounded-full transition-colors ${resultsView === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {!mapUnavailable && (
              <button
                onClick={() => (isDesktop ? setDesktopMapHidden((h) => !h) : setViewMode((v) => (v === "map" ? "grid" : "map")))}
                aria-label={mapOpen ? "Hide map" : "Show map"}
                aria-pressed={mapOpen}
                className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border text-sm font-medium transition-colors ${
                  mapOpen ? "bg-primary text-white border-primary" : "bg-white text-primary border-border/60 hover:border-primary/40"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                {mapOpen ? "Hide map" : "Show map"}
              </button>
            )}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger aria-label="Sort listings" className="w-auto h-10 px-4 gap-1.5 rounded-full bg-white border-border/60 text-sm">
                <span className="text-muted-foreground">Sort:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {activeFilterChips.map((chip, i) => (
              <button
                key={i}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-border/60 text-primary px-3 py-1.5 rounded-full hover:border-accent hover:text-accent transition-colors"
              >
                {chip.label}
                <span className="text-primary/40">×</span>
              </button>
            ))}
          </div>
        )}

        {/* Map — only after the listings are on screen, so it never holds them up. */}
        {mapOpen && !isLoading && !error && sortedListings.length > 0 && (
          <SafeListingsMap
            listings={sortedListings}
            embedded
            hideWhenEmpty
            className="mb-8"
            cluster
            heightClassName="h-[55vh] min-h-[320px] max-h-[520px] lg:h-[340px] lg:min-h-0"
            placeholder={<div className="mb-8 h-[55vh] min-h-[320px] max-h-[520px] lg:h-[340px] lg:min-h-0 rounded-2xl bg-white/70 animate-pulse" />}
            onUnavailable={() => setMapUnavailable(true)}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border/40 bg-white p-2 animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-2xl" />
                <div className="p-3 space-y-3">
                  <div className="h-6 w-1/2 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-destructive mb-2">Failed to load listings</p>
            <p className="text-muted-foreground text-sm">Please try again later.</p>
          </div>
        ) : sortedListings.length > 0 ? (
          <>
            {resultsView === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pagedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} variant="feature" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pagedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} listView />
                ))}
              </div>
            )}
            <Pagination page={page} pageCount={pageCount} search={search} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-serif font-bold text-primary mb-2">No listings match your filters</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Try removing some filters to see more results, or browse all available units.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }} variant="outline">Clear all filters</Button>
              <a href="/listings">
                <Button className="bg-primary text-white">Browse all units</Button>
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CornerSlideMagnet />
    </div>
  );
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function Pagination({ page, pageCount, search }: { page: number; pageCount: number; search: string }) {
  if (pageCount <= 1) return null;
  const qs = search ? `?${search}` : "";
  const href = (n: number) => (n === 1 ? "/listings" : `/listings/page/${n}`) + qs;
  const linkClass = "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-full border text-sm font-medium transition-colors";
  return (
    <nav aria-label="Listings pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={`${linkClass} border-border/60 hover:bg-primary/5`}>
          Previous
        </Link>
      )}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={`${linkClass} border-primary bg-primary text-white`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={`${linkClass} border-border/60 hover:bg-primary/5`}>
            {n}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link href={href(page + 1)} rel="next" className={`${linkClass} border-border/60 hover:bg-primary/5`}>
          Next
        </Link>
      )}
    </nav>
  );
}
