import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Mail, Phone, ExternalLink, ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type Lead, type LeadStatus } from "@/lib/leads";

// Leads dashboard tab. Read-mostly view of every submission from the site's
// LeadForm. Team uses this to work the queue: view details, mark contacted,
// add notes, delete spam.

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-accent/10 text-accent",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-neutral-200 text-neutral-600",
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Small color palette so common UTM sources are visually distinct at a
// glance in the compact table row. Anything unknown falls back to gray.
const UTM_SOURCE_STYLES: Record<string, string> = {
  google: "bg-blue-100 text-blue-700",
  gbp: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-indigo-100 text-indigo-700",
  linkedin: "bg-sky-100 text-sky-700",
  whatsapp: "bg-emerald-100 text-emerald-700",
  newsletter: "bg-amber-100 text-amber-700",
  email: "bg-amber-100 text-amber-700",
  tiktok: "bg-neutral-800 text-white",
};

function utmSourceLabel(source: string | null | undefined): string {
  return source ?? "direct";
}

export function LeadsManager() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data: allLeads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["admin-leads"],
    queryFn: () => adminFetch("/api/admin/leads"),
  });

  // Distinct UTM sources across the current lead set — powers the filter
  // dropdown. Includes a synthetic 'direct' bucket for leads without any
  // utm_source (someone who typed the URL or clicked an untagged link).
  const sourceCounts = (() => {
    const counts = new Map<string, number>();
    for (const l of allLeads) {
      const key = utmSourceLabel(l.utm_source);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  })();

  const leads = sourceFilter === "all"
    ? allLeads
    : allLeads.filter((l) => utmSourceLabel(l.utm_source) === sourceFilter);

  // Summary metrics for the four-card row at the top of the dashboard.
  // Week is defined as the last 7 rolling days ending now (not calendar
  // weeks starting on Monday) — matches how a merchant thinks about
  // pipeline: "leads I got in the last 7 days" vs "the 7 days before that".
  const summary = (() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const thisWeekCutoff = now - 7 * DAY;
    const lastWeekCutoff = now - 14 * DAY;

    const thisWeek: Lead[] = [];
    const lastWeek: Lead[] = [];
    for (const l of allLeads) {
      const ts = new Date(l.created_at).getTime();
      if (ts >= thisWeekCutoff) thisWeek.push(l);
      else if (ts >= lastWeekCutoff) lastWeek.push(l);
    }

    // % change vs previous 7 days. If last week was zero, we can't compute
    // a percentage — show a plain arrow instead. If this week is zero too,
    // it's a flat "no change" state.
    const thisCount = thisWeek.length;
    const lastCount = lastWeek.length;
    let deltaLabel: string;
    let deltaDirection: "up" | "down" | "flat";
    if (lastCount === 0 && thisCount === 0) {
      deltaLabel = "—";
      deltaDirection = "flat";
    } else if (lastCount === 0) {
      deltaLabel = `+${thisCount}`;
      deltaDirection = "up";
    } else {
      const pct = Math.round(((thisCount - lastCount) / lastCount) * 100);
      if (pct > 0) {
        deltaLabel = `+${pct}%`;
        deltaDirection = "up";
      } else if (pct < 0) {
        deltaLabel = `${pct}%`;
        deltaDirection = "down";
      } else {
        deltaLabel = "0%";
        deltaDirection = "flat";
      }
    }

    // Top source among this-week leads. Ties broken by insertion order.
    const sourceTallies = new Map<string, number>();
    for (const l of thisWeek) {
      const key = utmSourceLabel(l.utm_source);
      sourceTallies.set(key, (sourceTallies.get(key) ?? 0) + 1);
    }
    let topSource = "—";
    let topSourceCount = 0;
    for (const [k, v] of sourceTallies.entries()) {
      if (v > topSourceCount) {
        topSource = k;
        topSourceCount = v;
      }
    }

    // Top converting page — from lead_source column (which stores the
    // page path or form context). If none of the leads have it populated,
    // fall back to an em-dash.
    const pageTallies = new Map<string, number>();
    for (const l of thisWeek) {
      const key = l.lead_source ?? "(unknown)";
      pageTallies.set(key, (pageTallies.get(key) ?? 0) + 1);
    }
    let topPage = "—";
    let topPageCount = 0;
    for (const [k, v] of pageTallies.entries()) {
      if (v > topPageCount) {
        topPage = k;
        topPageCount = v;
      }
    }

    return {
      thisCount,
      lastCount,
      deltaLabel,
      deltaDirection,
      topSource,
      topSourceCount,
      topPage,
      topPageCount,
    };
  })();

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Lead> }) => {
      return adminFetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    // Surface the actual error to the admin instead of silently failing.
    // Common causes: session expired (401), Supabase RLS blocking the
    // delete, or the row was already gone.
    onError: (err: Error) => {
      window.alert(
        `Delete failed: ${err.message}\n\nIf this keeps happening, log out + back in (session may have expired), or check the browser console for details.`,
      );
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete lead from "${name}"? This can't be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      {/* Summary row — four rolling-7-day metrics at a glance. Renders
          before any lead rows so the admin sees the pulse of the site
          before scanning the queue. Hides on empty state to avoid a row
          of zeros scaring off a new install. */}
      {allLeads.length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Leads this week + delta vs previous 7 days */}
          <div className="bg-white rounded-xl border border-border/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Leads · Last 7 Days
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-3xl font-bold text-primary leading-none">
                {summary.thisCount}
              </p>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  summary.deltaDirection === "up"
                    ? "text-emerald-600"
                    : summary.deltaDirection === "down"
                      ? "text-rose-600"
                      : "text-muted-foreground"
                }`}
              >
                {summary.deltaDirection === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : summary.deltaDirection === "down" ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {summary.deltaLabel}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              vs {summary.lastCount} previous 7d
            </p>
          </div>

          {/* All-time lead count — grows monotonically, easy morale metric */}
          <div className="bg-white rounded-xl border border-border/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              All-Time Leads
            </p>
            <p className="font-serif text-3xl font-bold text-primary leading-none">
              {allLeads.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              across every channel
            </p>
          </div>

          {/* Top source this week — where to double down on marketing */}
          <div className="bg-white rounded-xl border border-border/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Top Source · 7d
            </p>
            <p className="font-serif text-xl font-bold text-primary leading-tight truncate">
              {summary.topSource}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {summary.topSourceCount} lead
              {summary.topSourceCount === 1 ? "" : "s"}
            </p>
          </div>

          {/* Top converting page/form — where the leads actually come from */}
          <div className="bg-white rounded-xl border border-border/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Top Page · 7d
            </p>
            <p className="font-serif text-xl font-bold text-primary leading-tight truncate" title={summary.topPage}>
              {summary.topPage}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {summary.topPageCount} lead
              {summary.topPageCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every form submission from the website. Click a row to expand for the
          full message, source, and notes.
        </p>

        {/* Source filter — filters by utm_source. 'Direct' = no UTM tag
            (someone typed the URL or came from an untagged link). Counts
            reflect the un-filtered totals so the admin can see channel
            volume at a glance. */}
        {allLeads.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Source:</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border/60 bg-white text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All ({allLeads.length})</option>
              {Array.from(sourceCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <option key={source} value={source}>
                    {source} ({count})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">
          Loading leads…
        </p>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border/40">
          <p className="text-muted-foreground mb-1">No leads yet.</p>
          <p className="text-xs text-muted-foreground">
            Submissions will show up here as soon as visitors fill any of the
            site's forms.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">When</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpanded(expanded === lead.id ? null : lead.id)
                      }
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {lead.name}
                      </td>
                      <td className="px-4 py-3 text-primary/80">
                        <div className="flex items-center gap-3 text-xs">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 hover:text-accent"
                          >
                            <Mail className="w-3 h-3" /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-accent"
                            >
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {/* UTM source pill on top (channel/campaign attribution),
                            lead_source below (which form on the site). */}
                        {(() => {
                          const src = utmSourceLabel(lead.utm_source);
                          const style =
                            UTM_SOURCE_STYLES[src] ??
                            "bg-neutral-200 text-neutral-700";
                          return (
                            <span
                              className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${style}`}
                            >
                              {src}
                            </span>
                          );
                        })()}
                        <div className="text-primary/80">{lead.lead_source}</div>
                        {/* Sent from an Arabic page (/ar/…): reply in Arabic. */}
                        {lead.page_url && /^\/ar(\/|$)/.test(lead.page_url) && (
                          <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Arabic page · reply in Arabic
                          </span>
                        )}
                        {lead.magnet && (
                          <div className="text-muted-foreground">
                            magnet: {lead.magnet}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {/* Custom-styled select — native chevron hidden so
                            the caret sits snugly next to the label instead
                            of floating on the far right of the pill. */}
                        <div className="relative inline-block">
                          <select
                            value={lead.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              updateMutation.mutate({
                                id: lead.id,
                                patch: { status: e.target.value as LeadStatus },
                              })
                            }
                            className={`appearance-none text-xs font-medium pl-3 pr-7 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_STYLES[lead.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70"
                            aria-hidden="true"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id, lead.name);
                          }}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors ml-auto"
                          aria-label="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expanded === lead.id && (
                      <tr className="border-b border-border/20 bg-primary/[0.02]">
                        <td colSpan={6} className="px-6 py-4 space-y-3">
                          {lead.message && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Projects they are interested in
                              </p>
                              <p dir="auto" className="text-sm text-primary whitespace-pre-wrap bg-white p-3 rounded-md border border-border/40">
                                {lead.message}
                              </p>
                            </div>
                          )}
                          {lead.locations && lead.locations.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Locations of interest
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {lead.locations.map((loc) => (
                                  <span
                                    key={loc}
                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                                  >
                                    {loc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {lead.page_url && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Landing page
                                </p>
                                <a
                                  href={lead.page_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline inline-flex items-center gap-1"
                                >
                                  {lead.page_url} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {lead.listing_id && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Listing #
                                </p>
                                <p className="text-primary">{lead.listing_id}</p>
                              </div>
                            )}
                            {lead.utm_source && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Source
                                </p>
                                <p className="text-primary">{lead.utm_source}</p>
                              </div>
                            )}
                            {lead.utm_campaign && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Campaign
                                </p>
                                <p className="text-primary">{lead.utm_campaign}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                              Internal notes
                            </p>
                            <Textarea
                              defaultValue={lead.notes ?? ""}
                              onBlur={(e) => {
                                const next = e.target.value.trim() || null;
                                if (next !== lead.notes) {
                                  updateMutation.mutate({
                                    id: lead.id,
                                    patch: { notes: next },
                                  });
                                }
                              }}
                              placeholder="Add follow-up notes here (auto-saves when you click away)…"
                              rows={2}
                              className="bg-white text-sm resize-none"
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
