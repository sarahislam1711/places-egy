import { formatEgpShort, formatRateDate, useUsdEgpRate } from "@/lib/currency";
import { extraAreaUnpriced, extraAreaWord, maintenanceArea, outdoorAmount, totalPrice } from "@/lib/listing-pricing";
import { areaLabel } from "@/lib/listing-text";

type PriceFields = {
  price?: number | null;
  currency?: string | null;
  price_per_meter?: number | null;
  area_sqm?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  outdoor_area_type?: string | null;
  price_is_lump_sum?: boolean | null;
  transaction_type?: string | null;
};

const n = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

// Shows the editor exactly what visitors will see before saving, so a USD
// price left on EGP ("20,250 EGP / month" for a $20,250 unit) or an outdoor
// area mixed into the price is obvious at a glance.
export function PricePreview({ form }: { form: PriceFields }) {
  const fx = useUsdEgpRate();
  const cur = form.currency === "USD" || form.currency === "EGP" ? form.currency : null;
  const per = (form.transaction_type ?? "").toLowerCase() === "rent" ? " / month" : "";
  const price = Number(form.price) || 0;
  const ppm = Number(form.price_per_meter) || 0;
  const area = Number(form.area_sqm) || 0;
  const outdoor = outdoorAmount(form);
  const total = totalPrice(form);
  const oRate = Number(form.outdoor_price_per_meter) || 0;
  const word = extraAreaWord(form);

  return (
    <div className="md:col-span-2 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3 space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visitors will see</p>
      {!cur ? (
        <p className="text-sm text-destructive font-medium">Choose the currency the price is quoted in.</p>
      ) : (
        <>
          <p className="text-primary">
            <span className="text-2xl font-bold">{price ? n(price) : "—"}</span>{" "}
            <span className="text-sm text-muted-foreground">
              {cur}
              {per}
              {Number(form.outdoor_area_sqm) > 0 && !form.price_is_lump_sum ? " (indoor)" : ""}
            </span>
          </p>
          {outdoor > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                + {word} {n(Number(form.outdoor_area_sqm))} m² × {n(oRate)} {cur}/m² ={" "}
                <span className="text-primary font-medium">{n(outdoor)} {cur}</span>
              </p>
              <p className="text-sm text-primary font-semibold">
                Total {n(total)} {cur}
                {per}
              </p>
            </>
          )}
          {extraAreaUnpriced(form) && (
            <p className="text-sm text-destructive">Enter the {word} price per m² (0 if it's included).</p>
          )}
          {cur === "USD" && total > 0 && (
            <p className="text-xs text-muted-foreground">
              ≈ {formatEgpShort(Math.round(total * fx.rate))}
              {outdoor ? " total" : ""} at {fx.rate.toFixed(2)}
              {formatRateDate(fx.asOf) ? ` (${formatRateDate(fx.asOf)})` : ""}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {[areaLabel(form) || null, ppm ? `${n(ppm)} ${cur}/m²` : null, form.price_is_lump_sum ? "lump-sum price" : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {!form.price_is_lump_sum && ppm > 0 && area > 0 && (
            <p className="text-xs text-muted-foreground">
              Check: {n(ppm)} × {n(area)} m² = {n(ppm * area)} {cur}
              {price && Math.abs(price - ppm * area) / (ppm * area) > 0.03 ? " ≠ the price above" : " ✓"}
            </p>
          )}
          {Number(form.outdoor_area_sqm) > 0 && (
            <p className="text-xs text-muted-foreground">Maintenance applies to {n(maintenanceArea(form))} m² (indoor + {word}).</p>
          )}
        </>
      )}
    </div>
  );
}
