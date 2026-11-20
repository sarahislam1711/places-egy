import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/admin-fetch";

type AdminFx = {
  rate: number;
  kind: "auto" | "manual" | "fallback";
  asOf: string | null;
  source: string | null;
  autoRate: number | null;
  autoAsOf: string | null;
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// The one USD→EGP rate the site uses for "≈ EGP" and cross-currency filters.
// Listing prices themselves are never converted.
export function ExchangeRatePanel() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const { data, isLoading, error } = useQuery<AdminFx>({
    queryKey: ["admin-fx"],
    queryFn: () => adminFetch("/api/admin/fx/usd-egp"),
  });
  const save = useMutation({
    mutationFn: (rate: number | null) =>
      adminFetch("/api/admin/fx/usd-egp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      }) as Promise<AdminFx>,
    onSuccess: (fx) => {
      qc.setQueryData(["admin-fx"], fx);
      qc.invalidateQueries({ queryKey: ["fx", "usd-egp"] });
      setDraft("");
    },
  });

  if (isLoading) return <p className="text-muted-foreground py-8">Loading exchange rate…</p>;
  if (error || !data) return <p className="text-destructive py-8">Couldn't load the exchange rate: {(error as Error)?.message}</p>;

  const draftNum = Number(draft);
  const draftValid = draft.trim() !== "" && Number.isFinite(draftNum) && draftNum >= 10 && draftNum <= 500;

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-xl border border-border/40 bg-white p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rate in use</p>
        <p className="text-3xl font-bold text-primary">1 USD = {data.rate.toFixed(2)} EGP</p>
        <p className="text-sm text-muted-foreground">
          {data.kind === "manual"
            ? `Manual rate set ${when(data.asOf)}. It stays until you clear it.`
            : data.kind === "auto"
              ? `Updated automatically ${when(data.asOf)} from ${data.source ?? "the rate API"} (refreshes every 12 hours).`
              : "Default rate: the live rate hasn't loaded yet."}
        </p>
        {data.kind === "manual" && data.autoRate && (
          <p className="text-sm text-muted-foreground">
            Latest automatic rate: {data.autoRate.toFixed(2)} ({when(data.autoAsOf)})
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border/40 bg-white p-5 space-y-3">
        <Label className="text-sm font-medium text-primary">Set a manual rate (EGP per 1 USD)</Label>
        <p className="text-xs text-muted-foreground">
          Use this when the rate your brokers quote differs from the automatic one. It's used only for the "≈ EGP"
          figure on USD listings and for budget filters; listing prices are never changed.
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            value={draft}
            placeholder={data.rate.toFixed(2)}
            onChange={(e) => setDraft(e.target.value)}
            className="bg-white max-w-[160px]"
          />
          <Button disabled={!draftValid || save.isPending} onClick={() => save.mutate(draftNum)} className="bg-primary text-white">
            Use this rate
          </Button>
          {data.kind === "manual" && (
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate(null)}>
              Back to automatic
            </Button>
          )}
        </div>
        {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
      </div>
    </div>
  );
}
