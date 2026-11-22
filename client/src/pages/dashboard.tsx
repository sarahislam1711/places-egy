import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Listing } from "@/lib/supabase";
import { DealsManager } from "@/components/admin/DealsManager";
import { ClientLogosManager } from "@/components/admin/ClientLogosManager";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { AccountsManager } from "@/components/admin/AccountsManager";
import { HotdeskManager } from "@/components/admin/HotdeskManager";
import { ExchangeRatePanel } from "@/components/admin/ExchangeRatePanel";
import { PricePreview } from "@/components/admin/PricePreview";
import { EXTRA_AREA_TYPES } from "@/lib/listing-pricing";
import { ProjectPinInput } from "@/components/admin/ProjectPinInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, LogOut, X, Upload, Loader2, Home, Search } from "lucide-react";
import { humanizeError } from "@/lib/error-messages";

import { adminFetch } from "@/lib/admin-fetch";
import { rentedLabel } from "@/lib/listing-text";
import { listingIssues, suggestedTitle } from "@/lib/listing-checks";

import {
  DEVELOPER_OPTIONS,
  FURNISHING_OPTIONS,
  LOCATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SUBTYPE_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
  getEnumLabel,
  type EnumOption,
} from "@/lib/enums";
import { CURRENCY_OPTIONS, listingCurrency } from "@/lib/currency";

// Dropdown options — single source of truth lives in lib/enums.ts so the admin
// dropdowns, filter sidebars, and display labels all stay in lockstep.
const ENUM_OPTIONS = {
  property_type: PROPERTY_TYPE_OPTIONS,
  subtype: SUBTYPE_OPTIONS,
  transaction_type: TRANSACTION_TYPE_OPTIONS,
  furnishing: FURNISHING_OPTIONS,
  location: LOCATION_OPTIONS,
  developer: DEVELOPER_OPTIONS,
  currency: CURRENCY_OPTIONS,
  maintenance_status: MAINTENANCE_STATUS_OPTIONS,
};

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Listing data is queried under many keys across the app: ["listings"],
// ["admin-listings"], ["commercial-listings"], ["business-park-listings"],
// ["resale-listings"], ["location-newest-listings", ...], etc. After any
// admin mutation we want all of them to refetch — otherwise newly-created
// or edited listings stay invisible on subtype/service/location pages until
// the user does a hard reload.
function invalidateAllListingQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey[0];
      if (typeof k !== "string") return false;
      return k === "listings" || k.endsWith("-listings");
    },
  });
}

type ListingForm = Omit<Listing, "id"> & { id?: number };

// property_type is hardcoded to "admin" on every new listing — PLACES has
// retired its commercial offering. Keeping the field on the type for DB
// shape compatibility, but it's never user-editable.
const EMPTY_FORM: ListingForm = {
  title: "",
  property_type: "admin",
  subtype: "",
  developer: "",
  project: "",
  location: "",
  location_area: "",
  street_name: "",
  building_name: "",
  price: 0,
  // No default: the editor must choose. A pre-selected EGP is how USD prices
  // ended up shown as EGP (e.g. "20,250 EGP / month" for a $20,250 unit).
  currency: "",
  area_sqm: 0,
  transaction_type: "",
  furnishing: "",
  description: "",
  images: [],
  delivery_date: "",
  parking: 0,
  price_per_meter: 0,
  outdoor_area_sqm: null,
  outdoor_price_per_meter: null,
  outdoor_area_type: null,
  price_is_lump_sum: false,
  maintenance_fees: 0,
  maintenance_status: "",
  floor: 0,
  latitude: null,
  longitude: null,
  is_test: false,
  rental_status: "available",
  rental_start: null,
  rental_end: null,
};

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        sessionStorage.setItem("admin_password", password);
        onLogin();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">PLACES Admin</h1>
          <p className="text-muted-foreground text-sm">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className="bg-white h-12"
          />
          {error && <p className="text-accent text-sm">Incorrect password</p>}
          <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary text-white">
            {submitting ? "Checking..." : "Log In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Sentinel for the "no selection" item — Radix Select forbids an empty-string
// value, so we map this back to "" in onChange.
const NONE_VALUE = "__none__";

function SelectField({
  label,
  value,
  options,
  onChange,
  clearable = false,
}: {
  label: string;
  value: string;
  options: EnumOption[];
  onChange: (v: string) => void;
  // When true, adds a "— None —" option so the field can be left/returned blank
  // (e.g. Developer is optional on a listing).
  clearable?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      <Select
        value={value || (clearable ? NONE_VALUE : "")}
        onValueChange={(v) => onChange(v === NONE_VALUE ? "" : v)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto">
          {clearable && (
            <SelectItem value={NONE_VALUE}>
              <span className="text-muted-foreground">— None —</span>
            </SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const cairoDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Cairo",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatCairoDateTime(iso: string): string {
  return cairoDateTime.format(new Date(iso));
}

type DealFilter = "all" | "rent" | "rented" | "sale" | "income-property";
const DEAL_FILTERS: [DealFilter, string][] = [
  ["all", "All listings"],
  ["rent", "For rent"],
  ["rented", "Rented"],
  ["sale", "For sale"],
  ["income-property", "Income property"],
];
// "For rent" includes rented offices; "Rented" narrows to just those.
function matchesDeal(l: Pick<Listing, "transaction_type" | "rental_status">, f: DealFilter): boolean {
  if (f === "rented") return l.transaction_type === "rent" && l.rental_status === "rented";
  return f === "all" || l.transaction_type === f;
}

// Two listings are treated as duplicates when their titles match ignoring
// case, punctuation and spacing.
function titleKey(title: string | null | undefined): string {
  return (title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, " ")
    .trim();
}

function ListingFormDialog({
  open,
  onClose,
  listing,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingForm | null;
  existing: Listing[];
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [issuesChecked, setIssuesChecked] = useState(false);
  const issues = useMemo(() => listingIssues(form), [form]);
  const blocking = issues.filter((i) => i.severity === "block");

  useEffect(() => {
    setIssuesChecked(false);
    if (listing) {
      setForm(listing);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [listing, open]);

  const isEditing = !!form.id;

  const saveMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
      // updated_at is server-owned; the strict save schema would reject it.
      const { id, updated_at: _updatedAt, created_at: _createdAt, ...rest } = data;
      if (id) {
        await adminFetch(`/api/admin/listings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
        });
      } else {
        await adminFetch(`/api/admin/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
        });
      }
    },
    onSuccess: () => {
      invalidateAllListingQueries(queryClient);
      onClose();
    },
    onError: (error: Error) => {
      console.error("Save listing failed:", error);
    },
  });

  const set = (field: keyof ListingForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Coerce a number-input's raw string to a number, or null when blank/invalid.
  // Sending null (not 0, not NaN) means an unfilled field is simply omitted —
  // the listing card/detail page guard every numeric stat with `!= null`, so a
  // blank field shows nothing instead of "0 m²", and NaN never reaches the
  // server (its Zod .finite() check would otherwise reject the whole save).
  const toNum = (raw: string): number | null => {
    if (raw.trim() === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { publicUrl } = await adminFetch("/api/admin/listings-images", {
          method: "POST",
          body: fd,
        });
        if (publicUrl) newUrls.push(publicUrl);
      } catch (err) {
        console.error("Upload failed:", err);
        failed.push(file.name);
      }
    }
    set("images", [...(form.images || []), ...newUrls]);
    setUploading(false);
    // Don't let failed uploads vanish silently — tell the admin which ones and
    // why, so a rate-limit/size error is visible instead of looking like a cap.
    if (failed.length) {
      window.alert(
        `${failed.length} image(s) failed to upload: ${failed.join(", ")}. ` +
          `Please try those again.`,
      );
    }
  };

  const removeImage = (index: number) => {
    set("images", (form.images || []).filter((_: string, i: number) => i !== index));
  };

  // The first image in the array is the listing's main/cover photo (cards and
  // the carousel use images[0]). "Set as main" moves the chosen image to the
  // front, preserving the order of the rest.
  const setMainImage = (index: number) => {
    const imgs = form.images || [];
    if (index <= 0 || index >= imgs.length) return;
    const reordered = [imgs[index], ...imgs.filter((_: string, i: number) => i !== index)];
    set("images", reordered);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-serif font-bold text-primary">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium text-primary">Title <span className="text-accent">*</span></Label>
              <div className="flex gap-2">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-white" />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => set("title", suggestedTitle(form))}
                  title={`Build the title from the fields: ${suggestedTitle(form)}`}
                >
                  Generate title
                </Button>
              </div>
              {(() => {
                const key = titleKey(form.title);
                const matches = key ? existing.filter((l) => l.id !== form.id && titleKey(l.title) === key) : [];
                return matches.length > 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                    Another listing already has this title ({matches.map((m) => `#${m.id}`).join(", ")}).
                    If it's a different unit, make the title more specific; if it's the same unit, edit that one instead.
                  </p>
                ) : null;
              })()}
            </div>

            <SelectField label="Subtype" value={form.subtype} options={ENUM_OPTIONS.subtype} onChange={(v) => set("subtype", v)} />
            <SelectField label="Transaction Type" value={form.transaction_type} options={ENUM_OPTIONS.transaction_type} onChange={(v) => set("transaction_type", v)} />

            {form.transaction_type === "rent" && (
              <fieldset className="col-span-2">
                <legend className="mb-1.5 text-sm font-medium text-primary">Availability</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Availability">
                  {(["available", "rented"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={(form.rental_status ?? "available") === s}
                      onClick={() => {
                        set("rental_status", s);
                        if (s === "rented" && !form.rental_start) set("rental_start", new Date().toISOString().slice(0, 10));
                        if (s === "available") { set("rental_start", null); set("rental_end", null); }
                      }}
                      className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                        (form.rental_status ?? "available") === s
                          ? s === "rented" ? "bg-slate-700 border-slate-700 text-white" : "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-border/60 text-primary hover:bg-primary/5"
                      }`}
                    >
                      {s === "available" ? "Available" : "Rented"}
                    </button>
                  ))}
                </div>
                {form.rental_status === "rented" && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="rental_start" className="text-sm font-medium text-primary">Rented since</Label>
                      <Input id="rental_start" type="date" value={form.rental_start ?? ""} onChange={(e) => set("rental_start", e.target.value || null)} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rental_end" className="text-sm font-medium text-primary">Available again from</Label>
                      <Input id="rental_end" type="date" value={form.rental_end ?? ""} min={form.rental_start ?? undefined} onChange={(e) => set("rental_end", e.target.value || null)} className="bg-white" />
                      <p className="text-xs text-muted-foreground">Leave empty if unknown. Shows "date to be confirmed".</p>
                    </div>
                  </div>
                )}
              </fieldset>
            )}
            <SelectField label="Developer (optional)" value={form.developer} options={ENUM_OPTIONS.developer} onChange={(v) => set("developer", v)} clearable />
            <SelectField label="Location" value={form.location} options={ENUM_OPTIONS.location} onChange={(v) => set("location", v)} />
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Location Area</Label>
              <Input value={form.location_area} onChange={(e) => set("location_area", e.target.value)} placeholder="e.g. Fifth Settlement" className="bg-white" />
            </div>

            <SelectField label="Furnishing" value={form.furnishing} options={ENUM_OPTIONS.furnishing} onChange={(v) => set("furnishing", v)} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Project</Label>
              <Input value={form.project} onChange={(e) => set("project", e.target.value)} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="building_name" className="text-sm font-medium text-primary">Building name (optional)</Label>
              <Input id="building_name" value={form.building_name ?? ""} onChange={(e) => set("building_name", e.target.value)} placeholder="e.g. Building B7" className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="street_name" className="text-sm font-medium text-primary">Street name (optional)</Label>
              <Input id="street_name" value={form.street_name ?? ""} onChange={(e) => set("street_name", e.target.value)} placeholder="e.g. 90th Street" className="bg-white" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium text-primary">Project location on map</Label>
              <ProjectPinInput projectName={form.project} />
            </div>

            <SelectField
              label="Currency of the price *"
              value={form.currency ?? ""}
              options={ENUM_OPTIONS.currency}
              onChange={(v) => set("currency", v)}
            />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">
                {(form.transaction_type ?? "").toLowerCase() === "rent" ? "Monthly rent" : "Price"}, indoor only ({form.currency || "choose currency"}) <span className="text-accent">*</span>
              </Label>
              <Input type="number" value={form.price ?? ""} onChange={(e) => set("price", toNum(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Area (m²): the unit itself, without terrace/roof</Label>
              <Input type="number" value={form.area_sqm ?? ""} onChange={(e) => set("area_sqm", toNum(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Price per m² ({form.currency || "choose currency"})</Label>
              <Input type="number" value={form.price_per_meter ?? ""} onChange={(e) => set("price_per_meter", toNum(e.target.value))} className="bg-white" />
            </div>

            {/* Extra area: type, size and its own price per m², all entered freely. */}
            <SelectField
              label="Extra area type"
              value={form.outdoor_area_type ?? ""}
              options={EXTRA_AREA_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              onChange={(v) => set("outdoor_area_type", v || null)}
              clearable
            />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">
                {form.outdoor_area_type ? EXTRA_AREA_TYPES.find((t) => t.value === form.outdoor_area_type)?.label : "Extra area"} (m²)
              </Label>
              <Input
                type="number"
                value={form.outdoor_area_sqm ?? ""}
                onChange={(e) => {
                  const v = toNum(e.target.value);
                  set("outdoor_area_sqm", v);
                  if (v && !form.outdoor_area_type) set("outdoor_area_type", "outdoor");
                }}
                placeholder="Leave empty if none"
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium text-primary">
                {form.outdoor_area_type ? EXTRA_AREA_TYPES.find((t) => t.value === form.outdoor_area_type)?.label : "Extra area"} price per m² (
                {form.currency || "choose currency"}){form.outdoor_area_sqm ? <span className="text-accent"> *</span> : null}
              </Label>
              <Input
                type="number"
                value={form.outdoor_price_per_meter ?? ""}
                onChange={(e) => set("outdoor_price_per_meter", toNum(e.target.value))}
                placeholder={form.outdoor_area_sqm ? "Any amount; 0 if included in the indoor price" : "—"}
                disabled={!form.outdoor_area_sqm}
                className="bg-white"
              />
              <p className="text-xs text-muted-foreground">
                Charged and shown separately from the indoor price. Enter whatever rate applies to this property.
              </p>
            </div>

            <label className="md:col-span-2 flex items-center gap-2 text-sm text-primary">
              <Checkbox checked={!!form.price_is_lump_sum} onCheckedChange={(v) => set("price_is_lump_sum", v === true)} />
              Price is a lump sum (one total for the whole unit/building, not price per m² × area)
            </label>

            <PricePreview form={form} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Maintenance Fees ({form.currency || "choose currency"})</Label>
              <Input type="number" value={form.maintenance_fees ?? ""} onChange={(e) => set("maintenance_fees", toNum(e.target.value))} className="bg-white" />
            </div>

            <SelectField label="Maintenance" value={form.maintenance_status} options={ENUM_OPTIONS.maintenance_status} onChange={(v) => set("maintenance_status", v)} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Floor</Label>
              <Input type="number" value={form.floor ?? ""} onChange={(e) => set("floor", toNum(e.target.value))} placeholder="0" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Delivery date</Label>
              <Input value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} placeholder="e.g. Q3 2026" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Parking (spaces)</Label>
              <Input type="number" value={form.parking ?? ""} onChange={(e) => set("parking", toNum(e.target.value))} placeholder="0" className="bg-white" />
            </div>

            <div className="col-span-2 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <Checkbox
                id="is_test"
                checked={!!form.is_test}
                onCheckedChange={(v) => set("is_test", v === true)}
              />
              <Label htmlFor="is_test" className="text-sm font-medium text-primary cursor-pointer">
                Test listing — hidden from site + Google
              </Label>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium text-primary">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="flex w-full rounded-full border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-medium text-primary">Images</Label>
              <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-border/60 rounded-xl py-6 hover:border-accent/50 transition-colors cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                />
              </label>
              {(form.images || []).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    The first image is the main photo shown on listing cards. Hover an image and click "Set main" to make it the cover.
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(form.images || []).map((url: string, i: number) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border/40">
                        <img src={url} alt="" className="w-full h-20 object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Main
                          </span>
                        )}
                        {i !== 0 && (
                          <button
                            onClick={() => setMainImage(i)}
                            className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                          >
                            Set main
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {saveMutation.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
              <p className="font-semibold mb-1">Save failed</p>
              <p className="text-xs whitespace-pre-line">{humanizeError((saveMutation.error as Error).message)}</p>
            </div>
          )}

          {issues.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
              <p className="font-semibold">Check before saving</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                {issues.map((i) => (
                  <li key={i.rule} className={i.severity === "block" ? "text-destructive" : undefined}>
                    <span className="font-medium">{i.severity === "block" ? "Must fix: " : i.severity === "info" ? "Confirm: " : ""}{i.rule}</span>
                    {i.conflicting ? ` (${i.conflicting})` : ""}. {i.fix}
                  </li>
                ))}
              </ul>
              {blocking.length > 0 ? (
                <p className="text-xs font-medium text-destructive">
                  Fix the "Must fix" items to save. Visitors see these values on the site.
                </p>
              ) : (
                <label className="flex items-center gap-2 text-xs font-medium">
                  <Checkbox checked={issuesChecked} onCheckedChange={(v) => setIssuesChecked(v === true)} />
                  I've checked these and want to save anyway
                </label>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={
                saveMutation.isPending ||
                !form.title.trim() ||
                form.price == null ||
                blocking.length > 0 ||
                (issues.length > 0 && !issuesChecked)
              }
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editListing, setEditListing] = useState<ListingForm | null>(null);
  const [tab, setTab] = useState<"listings" | "deals" | "logos" | "leads" | "accounts" | "hotdesk" | "fx">("listings");
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [search, setSearch] = useState("");
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [dealFilter, setDealFilter] = useState<DealFilter>("all");

  // listing id -> ids of other listings sharing its title
  const duplicatesOf = useMemo(() => {
    const groups = new Map<string, number[]>();
    for (const l of listings) {
      const key = titleKey(l.title);
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), l.id]);
    }
    const out = new Map<number, number[]>();
    groups.forEach((ids) => {
      if (ids.length < 2) return;
      for (const id of ids) out.set(id, ids.filter((x) => x !== id));
    });
    return out;
  }, [listings]);

  const filteredListings = useMemo(() => {
    const byDeal = dealFilter === "all" ? listings : listings.filter((l) => matchesDeal(l, dealFilter));
    // Duplicates view: group copies next to each other.
    const base = onlyDuplicates
      ? byDeal
          .filter((l) => duplicatesOf.has(l.id))
          .sort((a, b) => titleKey(a.title).localeCompare(titleKey(b.title)) || b.id - a.id)
      : byDeal;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    // "423" or "#423" matches that listing ID exactly, ahead of text matches.
    const idQuery = q.replace(/^#/, "");
    if (/^\d+$/.test(idQuery)) {
      const exact = base.filter((l) => String(l.id) === idQuery);
      if (exact.length > 0) return exact;
    }
    const terms = q.split(/\s+/);
    return base.filter((l) => {
      const haystack = [
        l.id,
        l.title,
        l.location,
        l.location_area,
        l.project,
        l.developer,
        getEnumLabel(DEVELOPER_OPTIONS, l.developer),
        l.subtype,
        l.transaction_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[-_]/g, " ");
      return terms.every((t) => haystack.includes(t.replace(/[-_]/g, " ")));
    });
  }, [listings, search, onlyDuplicates, duplicatesOf, dealFilter]);
  const filtering = !!search || onlyDuplicates || dealFilter !== "all";

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminFetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidateAllListingQueries(queryClient);
    },
  });

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditListing(null);
    setFormOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/places-logo.png"
              alt="PLACES"
              className="h-8 w-auto brightness-0 invert"
            />
            <h1 className="text-xl font-serif font-bold group-hover:opacity-80 transition-opacity">
              Admin
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" /> View site
              </Button>
            </Link>
            {tab === "listings" && (
              <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Listing
              </Button>
            )}
            <Button onClick={onLogout} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/40">
          {([
            { key: "listings", label: "Listings" },
            { key: "deals", label: "Deals" },
            { key: "logos", label: "Clients" },
            { key: "leads", label: "Leads" },
            { key: "accounts", label: "Accounts" },
            { key: "hotdesk", label: "Hotdesk" },
            { key: "fx", label: "Exchange rate" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key
                  ? "border-accent text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "deals" ? (
          <DealsManager />
        ) : tab === "logos" ? (
          <ClientLogosManager />
        ) : tab === "leads" ? (
          <LeadsManager />
        ) : tab === "accounts" ? (
          <AccountsManager />
        ) : tab === "hotdesk" ? (
          <HotdeskManager />
        ) : tab === "fx" ? (
          <ExchangeRatePanel />
        ) : isLoading ? (
          <p className="text-muted-foreground text-center py-8 md:py-12">Loading listings...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground mb-4">No listings yet.</p>
            <Button onClick={handleAdd} className="bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Listing
            </Button>
          </div>
        ) : (
          <div>
            {/* Total-count pill so admin sees "how many do I have" at a glance
                without counting rows. Same rolling-metric pattern as the /leads
                dashboard summary shipped 523c2d6. */}
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  inputMode="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearch("")}
                  placeholder="Search by ID, title, location, developer…"
                  aria-label="Search listings"
                  className="pl-9 pr-9 bg-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={dealFilter}
                onChange={(e) => setDealFilter(e.target.value as DealFilter)}
                aria-label="Show listings"
                className="h-10 w-full sm:w-auto rounded-md border border-input bg-white px-3 text-sm text-primary"
              >
                {DEAL_FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label} ({value === "all" ? listings.length : listings.filter((l) => matchesDeal(l, value)).length})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-border/40 px-3 py-1 text-xs font-medium text-primary">
                  {filtering ? `${filteredListings.length} of ${listings.length}` : listings.length}
                  <span className="text-muted-foreground font-normal">
                    {listings.length === 1 ? "listing" : "listings"}
                    {filtering ? "" : " total"}
                  </span>
                </span>
                {duplicatesOf.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setOnlyDuplicates((v) => !v)}
                    aria-pressed={onlyDuplicates}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      onlyDuplicates
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    Duplicates ({duplicatesOf.size})
                    {onlyDuplicates && <X className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-primary/5">
                      <th className="text-left px-3 py-3 font-medium text-primary w-12">ID</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Subtype</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Location</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Developer</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-primary">Transaction</th>
                      <th className="text-left px-4 py-3 font-medium text-primary whitespace-nowrap">Created</th>
                      <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                          {search ? `No listings match "${search}".` : "No duplicates found."}{" "}
                          <button
                            type="button"
                            onClick={() => { setSearch(""); setOnlyDuplicates(false); }}
                            className="text-accent hover:underline"
                          >
                            Show all listings
                          </button>
                        </td>
                      </tr>
                    )}
                    {filteredListings.map((listing) => (
                      <tr key={listing.id} className="border-b border-border/20 hover:bg-primary/[0.02] transition-colors">
                        <td className="px-3 py-3 text-[11px] font-mono text-muted-foreground tabular-nums">
                          {listing.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-primary max-w-[280px] truncate">
                          {listing.is_test && (
                            <span className="mr-2 inline-block rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 align-middle">
                              Test
                            </span>
                          )}
                          {listing.rental_status === "rented" && (
                            <span className="mb-1 block w-fit rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {rentedLabel(listing)}
                            </span>
                          )}
                          {duplicatesOf.has(listing.id) && (
                            <span
                              title={`Same title as ${duplicatesOf.get(listing.id)!.map((id) => `#${id}`).join(", ")}`}
                              className="mb-1 block w-fit rounded bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                            >
                              Duplicate of {duplicatesOf.get(listing.id)!.map((id) => `#${id}`).join(", ")}
                            </span>
                          )}
                          {listing.title}
                        </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.subtype)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.price?.toLocaleString()} {listingCurrency(listing)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.transaction_type)}</td>
                      <td
                        className="px-4 py-3 text-muted-foreground whitespace-nowrap tabular-nums"
                        title={listing.created_at ? undefined : "Created before publish dates were recorded (Oct 20, 2026)"}
                      >
                        {listing.created_at ? formatCairoDateTime(listing.created_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id, listing.title)}
                            className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <ListingFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditListing(null); }}
        listing={editListing}
        existing={listings}
      />
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("admin_password"));

  const handleLogout = () => {
    sessionStorage.removeItem("admin_password");
    setAuthed(false);
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
