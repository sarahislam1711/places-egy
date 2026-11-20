import { useMemo } from "react";
import { type Listing } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { FURNISHING_OPTIONS } from "@/lib/enums";
import { currentUsdEgpRate, formatEgpShort, useUsdEgpRate, type Currency } from "@/lib/currency";

export type Filters = {
  transactionType: "Sale" | "Rent" | "Income Property" | null;
  propertyType: "Admin" | "Commercial" | null;
  subtype: string[];
  location: string | null;
  /** Budget in EGP (USD listings are converted). Monthly rent for Rent, total price otherwise. */
  priceMin: number | null;
  priceMax: number | null;
  /** Currency the visitor types and sees the budget in. priceMin/priceMax stay EGP either way. */
  budgetCurrency: Currency;
  furnishing: string[];
  developer: string | null;
  areaMin: number | null;
  areaMax: number | null;
};

export const DEFAULT_FILTERS: Filters = {
  transactionType: null,
  propertyType: null,
  subtype: [],
  location: null,
  priceMin: null,
  priceMax: null,
  budgetCurrency: "EGP",
  furnishing: [],
  developer: null,
  areaMin: null,
  areaMax: null,
};

const ADMIN_SUBTYPES = ["Business Park", "Business Building", "Mixed Use"];
export const LOCATIONS = ["New Cairo", "Sheikh Zayed", "6th October", "Downtown Cairo", "Sheraton", "Maadi"];
const normLoc = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
/** Links pass locations as slugs ("new-cairo"); show the proper name. */
export const locationLabel = (v: string) => LOCATIONS.find((l) => normLoc(l) === normLoc(v)) ?? v;
export const sameLocation = (a: string | null, b: string) => !!a && normLoc(a) === normLoc(b);


interface FilterSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  listings: Listing[];
  className?: string;
}

// Placeholders hint at a realistic range for each budget type and currency.
export const BUDGET_HINTS = {
  rent: { label: "Monthly rent", EGP: { min: "e.g. 100,000", max: "e.g. 500,000" }, USD: { min: "e.g. 2,000", max: "e.g. 10,000" } },
  sale: { label: "Total price", EGP: { min: "e.g. 10,000,000", max: "e.g. 50,000,000" }, USD: { min: "e.g. 200,000", max: "e.g. 1,000,000" } },
} as const;
export type BudgetKind = keyof typeof BUDGET_HINTS;
export const budgetKindFor = (t: Filters["transactionType"]): BudgetKind | null => (t === null ? null : t === "Rent" ? "rent" : "sale");

// The budget is always stored (and filtered, and put in the URL) in EGP; USD
// is only what the visitor types and sees, converted at the site's rate.
// Live rate from /api/fx/usd-egp (components call useUsdEgpRate() to re-render when it loads).
const egpToShown = (egp: number, cur: Currency) => (cur === "USD" ? Math.round(egp / currentUsdEgpRate()) : egp);
const shownToEgp = (n: number, cur: Currency) => (cur === "USD" ? Math.round(n * currentUsdEgpRate()) : n);

/** Short label for a stored EGP amount in the visitor's chosen currency: "EGP 850K", "$15K". */
export function formatBudgetShort(egp: number, cur: Currency): string {
  if (cur === "EGP") return formatEgpShort(egp);
  const v = egpToShown(egp, cur);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

/** Min/max budget boxes with an EGP / USD switch. Shared by the filter bar and "More filters". */
export function BudgetFields({
  filters,
  setFilters,
  kind,
  inputClassName,
}: {
  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
  kind: BudgetKind;
  inputClassName?: string;
}) {
  useUsdEgpRate(); // re-render with the live rate once it loads
  const cur = filters.budgetCurrency;
  const hints = BUDGET_HINTS[kind];
  const setPrice = (key: "priceMin" | "priceMax", raw: string) => {
    const n = parseAmount(raw);
    setFilters((p) => ({ ...p, [key]: n == null ? null : shownToEgp(n, p.budgetCurrency) }));
  };
  const shown = (egp: number | null) => (egp == null ? "" : formatAmount(egpToShown(egp, cur)));
  const label = `${hints.label} in ${cur}`;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{hints.label}</p>
        <div role="radiogroup" aria-label="Budget currency" className="inline-flex rounded-full bg-muted p-0.5">
          {(["EGP", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cur === c}
              onClick={() => setFilters((p) => ({ ...p, budgetCurrency: c }))}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                cur === c ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input inputMode="numeric" placeholder={hints[cur].min} aria-label={`Minimum ${label.toLowerCase()}`} className={inputClassName} value={shown(filters.priceMin)} onChange={(e) => setPrice("priceMin", e.target.value)} />
        <span className="text-muted-foreground">–</span>
        <Input inputMode="numeric" placeholder={hints[cur].max} aria-label={`Maximum ${label.toLowerCase()}`} className={inputClassName} value={shown(filters.priceMax)} onChange={(e) => setPrice("priceMax", e.target.value)} />
      </div>
    </div>
  );
}

export const parseAmount = (raw: string): number | null => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
};
export const formatAmount = (n: number | null) => (n == null ? "" : n.toLocaleString("en-US"));

export function FilterSidebar({ filters, setFilters, listings, className }: FilterSidebarProps) {

  const locations = useMemo(
    () => Array.from(new Set([...LOCATIONS, ...listings.map(l => l.location).filter(Boolean)])).sort(),
    [listings]
  );

  const subtypeOptions = ADMIN_SUBTYPES;

  const setTransactionType = (type: "Sale" | "Rent" | "Income Property") => {
    // Rent budgets are monthly and sale budgets are totals, so a budget
    // never carries over from one transaction type to another.
    setFilters((prev) => ({
      ...prev,
      transactionType: prev.transactionType === type ? null : type,
      priceMin: null,
      priceMax: null,
    }));
  };

  const toggleSubtype = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      subtype: prev.subtype.includes(value)
        ? prev.subtype.filter((s) => s !== value)
        : [...prev.subtype, value],
    }));
  };

  const toggleFurnishing = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      furnishing: prev.furnishing.includes(value)
        ? prev.furnishing.filter((f) => f !== value)
        : [...prev.furnishing, value],
    }));
  };

  const setLocation = (value: string) => {
    setFilters((prev) => ({ ...prev, location: value === "all" ? null : value }));
  };

  const setPrice = (key: "priceMin" | "priceMax", raw: string) => {
    setFilters((prev) => ({ ...prev, [key]: parseAmount(raw) }));
  };
  const budget = budgetKindFor(filters.transactionType);

  const setArea = (key: "areaMin" | "areaMax", raw: string) => {
    const n = Number(raw.replace(/[^\d.]/g, ""));
    setFilters((prev) => ({ ...prev, [key]: raw.trim() === "" || !Number.isFinite(n) ? null : n }));
  };

  // Use slug values (matching Supabase) — labels are the user-visible text.
  const furnishingOptions = FURNISHING_OPTIONS;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-end -mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-accent h-auto p-0"
          onClick={() => setFilters(DEFAULT_FILTERS)}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Filter 1 — Transaction Type. Three-way segmented control now
          that income-property is a real option. Compact enough to still
          fit horizontally on desktop; wraps naturally on narrow columns. */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Transaction</Label>
        <div className="flex flex-wrap gap-2 p-1 bg-secondary/50 rounded-lg">
          {(["Sale", "Rent", "Income Property"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTransactionType(type)}
              className={`flex-1 min-w-20 text-sm font-medium py-2 px-2 rounded-full transition-all whitespace-nowrap ${
                filters.transactionType === type
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filter 2 — Subtype (multi-select pills) */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Subtype</Label>
        <div className="flex flex-wrap gap-2">
          {subtypeOptions.map((opt) => {
            const isSelected = filters.subtype.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleSubtype(opt)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Filter 4 — Location dropdown */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
        <Select value={filters.location ?? "all"} onValueChange={setLocation}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Budget — numeric min/max in EGP, split by transaction type */}
      <div className="space-y-3">
        {budget ? (
          <BudgetFields filters={filters} setFilters={setFilters} kind={budget} inputClassName="bg-white" />
        ) : (
          <>
            <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Budget</Label>
            <p className="text-xs text-muted-foreground">Choose Sale, Rent or Income Property above to set a budget.</p>
          </>
        )}
      </div>

      <Separator />

      {/* Area (m²) — numeric min/max */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Area (m²)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum area in square metres"
            className="bg-white"
            value={filters.areaMin ?? ""}
            onChange={(e) => setArea("areaMin", e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum area in square metres"
            className="bg-white"
            value={filters.areaMax ?? ""}
            onChange={(e) => setArea("areaMax", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Filter 6 — Furnishing (compact pills) */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Handover condition</Label>
        <div className="flex flex-wrap gap-2">
          {furnishingOptions.map((opt) => {
            const isSelected = filters.furnishing.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleFurnishing(opt.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
