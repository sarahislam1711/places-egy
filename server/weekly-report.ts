import type { Request, Response } from "express";
import { supabaseAdmin } from "./supabase";
import { sendMail } from "./mailer";
import { fetchGa4WeeklyTraffic, type GA4WeeklyTraffic } from "./ga4-client";
import { listingIssues, type CheckableListing } from "../client/src/lib/listing-checks";

// Weekly Monday-morning admin email report.
//
// Fired by an external cron (cron-job.org, same shared secret as the other
// crons) every Monday at 09:00 Cairo time. The endpoint queries Supabase
// directly for the last-7-days vs previous-7-days snapshot, formats the
// numbers into a branded email, and sends to admin@places-egy.com.
//
// Deliberately DOES NOT depend on GA4 for traffic numbers — GA4 doesn't
// have a server-side Node SDK we can drive from cron, and the value of
// this report is the lead pulse (which we DO own in Supabase) not the
// traffic pulse (which admin can check in GA4 anytime).
//
// Data shown:
//   - Leads this week vs previous 7-day window (count + delta %)
//   - Top lead source this week
//   - Top page / listing that produced leads this week
//   - Contacted leads this week (leads with status='contacted' in the
//     admin dashboard, created this week) — the sales-progress signal
//   - 3 hottest leads (highest-priority sources, last 7 days) with names

interface WeeklyMetrics {
  leadsThisWeek: number;
  leadsPrevWeek: number;
  leadsDeltaPct: number | null; // null if prev = 0 (can't divide)
  topSource: { name: string; count: number } | null;
  topPage: { path: string; count: number } | null;
  contactedThisWeek: number;
  hotLeads: Array<{
    name: string;
    email: string | null;
    phone: string | null;
    source: string;
    listing_id: number | null;
    created_at: string;
  }>;
  // Top 5 lead sources with counts — powers the "Leads by source" bar chart
  // in the email. Same source labeling as the topSource single-value field.
  leadsBySource: Array<{ name: string; value: number }>;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  // Traffic block from GA4 — null if the service account isn't configured
  // yet OR the fetch failed. Report still ships in that case, just
  // without the traffic KPIs.
  ga4: GA4WeeklyTraffic | null;
  // Published listings whose data contradicts itself (client/src/lib/listing-checks.ts).
  // "mustFix" = values the admin form would refuse to save (e.g. a USD price
  // saved as EGP); "toCheck" = warnings.
  listingIssues: { mustFix: number; toCheck: number; top: Array<{ id: number; title: string; rule: string; mustFix: boolean }> } | null;
}

async function fetchMetrics(): Promise<WeeklyMetrics> {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = now;
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const prevWeekEnd = weekStart;

  // ── Leads this week + previous week ─────────────────────────────────────
  const { data: leadsThisWeek } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,phone,lead_source,utm_source,page_url,listing_id,created_at,magnet")
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString())
    .order("created_at", { ascending: false });

  const { data: leadsPrevWeek } = await supabaseAdmin
    .from("leads")
    .select("id")
    .gte("created_at", prevWeekStart.toISOString())
    .lt("created_at", prevWeekEnd.toISOString());

  const thisCount = leadsThisWeek?.length ?? 0;
  const prevCount = leadsPrevWeek?.length ?? 0;
  const deltaPct = prevCount === 0 ? null : Math.round(((thisCount - prevCount) / prevCount) * 100);

  // ── Top source (by utm_source if set, else lead_source) ─────────────────
  const sourceCounts = new Map<string, number>();
  for (const l of leadsThisWeek ?? []) {
    const key = (l.utm_source as string | null) ?? (l.lead_source as string) ?? "direct";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sortedSources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topSourceEntry = sortedSources[0];
  const topSource = topSourceEntry ? { name: topSourceEntry[0], count: topSourceEntry[1] } : null;
  const leadsBySource = sortedSources.slice(0, 5).map(([name, value]) => ({ name, value }));

  // ── Top page (by page_url) ──────────────────────────────────────────────
  const pageCounts = new Map<string, number>();
  for (const l of leadsThisWeek ?? []) {
    const raw = l.page_url as string | null;
    if (!raw) continue;
    // Strip origin + query so we group by pathname only. Falls back to raw
    // if URL parsing throws (malformed page_urls).
    let path: string;
    try {
      path = new URL(raw).pathname;
    } catch {
      path = raw;
    }
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1);
  }
  const topPageEntry = [...pageCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topPage = topPageEntry ? { path: topPageEntry[0], count: topPageEntry[1] } : null;

  // ── Contacted leads this week (status='contacted' in admin dashboard) ───
  // Counts leads that were CREATED this week AND have been marked as
  // "contacted" (or beyond) in the admin dashboard — a follow-up signal
  // showing how many of this week's leads have actually been actioned.
  const { data: contactedThisWeek } = await supabaseAdmin
    .from("leads")
    .select("id")
    .in("status", ["contacted", "qualified", "won"])
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString());

  // ── Hot leads: top 3 by "warm signal" this week ─────────────────────────
  // Simple heuristic: viewing requests (someone asked to see a specific
  // unit) and magnet leads (market_report, developer_survey; price_unlock
  // before the price gate was removed on 2026-10-28) are hotter than plain
  // contact-form leads because they explicitly asked for something. Then by
  // created_at desc.
  const HOT_SOURCES = new Set(["viewing_request"]);
  const HOT_MAGNETS = new Set([
    "price_unlock",
    "cairo_office_market_report_2026",
    "developer_survey",
  ]);
  type LeadRow = {
    name: string;
    email: string | null;
    phone: string | null;
    lead_source: string;
    utm_source: string | null;
    listing_id: number | null;
    created_at: string;
    magnet: string | null;
  };
  const hotLeads = (leadsThisWeek ?? [])
    .map((l) => l as unknown as LeadRow)
    .sort((a, b) => {
      const hot = (l: LeadRow) => HOT_SOURCES.has(l.lead_source) || (!!l.magnet && HOT_MAGNETS.has(l.magnet));
      const aHot = hot(a) ? 1 : 0;
      const bHot = hot(b) ? 1 : 0;
      if (aHot !== bHot) return bHot - aHot;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 3)
    .map((l) => ({
      name: l.name,
      email: l.email,
      phone: l.phone,
      source: l.utm_source ?? l.lead_source,
      listing_id: l.listing_id,
      created_at: l.created_at,
    }));

  // GA4 traffic in parallel — fire-and-await but not blocking on failure.
  const ga4 = await fetchGa4WeeklyTraffic();
  const issues = await fetchListingIssues();

  return {
    leadsThisWeek: thisCount,
    leadsPrevWeek: prevCount,
    leadsDeltaPct: deltaPct,
    topSource,
    topPage,
    contactedThisWeek: contactedThisWeek?.length ?? 0,
    hotLeads,
    leadsBySource,
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    ga4,
    listingIssues: issues,
  };
}

// Data-quality pass over published listings. Never fails the report.
async function fetchListingIssues(): Promise<WeeklyMetrics["listingIssues"]> {
  if (!supabaseAdmin) return null;
  try {
    const rows: Array<CheckableListing & { id: number; title: string }> = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabaseAdmin
        .from("listings")
        .select(
          "id,title,description,area_sqm,furnishing,maintenance_status,maintenance_fees,currency,price,transaction_type," +
            "price_per_meter,outdoor_area_sqm,outdoor_price_per_meter,outdoor_area_type,price_is_lump_sum",
        )
        .eq("is_test", false)
        .eq("property_type", "admin")
        .order("id", { ascending: false })
        .range(from, from + 999);
      if (error) throw error;
      rows.push(...((data ?? []) as unknown as Array<CheckableListing & { id: number; title: string }>));
      if (!data || data.length < 1000) break;
    }
    let mustFix = 0;
    let toCheck = 0;
    const top: Array<{ id: number; title: string; rule: string; mustFix: boolean }> = [];
    for (const l of rows) {
      // "info" items (e.g. a quoted outdoor rate) were confirmed in the form.
      const found = listingIssues(l).filter((i) => i.severity !== "info");
      const block = found.find((i) => i.severity === "block");
      if (block) mustFix++;
      else if (found.length) toCheck++;
      const first = block ?? found[0];
      if (first) top.push({ id: l.id, title: l.title, rule: first.rule, mustFix: !!block });
    }
    top.sort((a, b) => Number(b.mustFix) - Number(a.mustFix) || b.id - a.id);
    return { mustFix, toCheck, top: top.slice(0, 15) };
  } catch (err) {
    console.warn("[weekly-report] listing check failed:", (err as Error).message);
    return null;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

// Map raw GA4 event names → plain-English labels the sales team recognizes.
// Anything not in this map falls through to a titlecased version of the slug
// (so we never surface "developer_survey_submit" untouched).
const EVENT_LABELS: Record<string, string> = {
  contact_form_submit: "Form submits",
  viewing_request_submit: "Viewing requests",
  viewing_request_open: "Viewing form opens",
  price_unlock_submit: "Price unlocks (old)",
  developer_survey_submit: "Survey submits",
  concierge_submit: "Concierge chats",
  whatsapp_click: "WhatsApp clicks",
  phone_click: "Phone clicks",
  email_click: "Email clicks",
  calendly_open: "Booking opens",
  favorite_add: "Listing saves",
  account_signup: "Account signups",
};

function friendlyEventName(slug: string): string {
  return (
    EVENT_LABELS[slug] ??
    slug
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Same idea for lead sources — the DB stores slugs (corner_popup, etc.);
// the email should show what a human would recognize.
const LEAD_SOURCE_LABELS: Record<string, string> = {
  corner_popup: "Homepage popup",
  blog_slide_up: "Blog popup",
  footer: "Footer button",
  market_report_page: "Market report page",
  market_report_landing: "Market report page",
  concierge_widget: "Concierge chat widget",
  contact_page: "Contact page",
  contact_form: "Contact page",
  listing_inquiry: "Listing inquiry",
  exit_intent: "Exit-intent popup",
  favorites_email_me_now: "'Email my saved list' button",
  developer_survey_popup: "Developer survey popup",
  developer_survey_inline: "Developer survey inline",
  viewing_request: "Viewing request (listing page)",
  price_unlock: "Price unlock (old)",
};

function friendlyLeadSource(slug: string): string {
  return (
    LEAD_SOURCE_LABELS[slug] ??
    slug
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Charts are rendered as HTML tables + colored <div>s, NOT inline SVG.
// Gmail (both web + mobile) strips <svg> from email bodies, which was
// leaving the report with labeled-but-empty chart cards. HTML tables +
// background-color divs render identically in Gmail, Apple Mail, and
// Outlook web with zero external image requests.

// Grouped-bar chart for the daily-sessions comparison. Each day column
// has two skinny bars side by side: red = this week, light gray =
// previous week. Mirrors the "Last 7 days vs Previous period" comparison
// on the GA4 home dashboard, but rendered as pure HTML/CSS so Gmail
// won't strip it.
function renderSessionsLineChart(
  daily: Array<{ date: string; sessions: number }>,
  prevDaily: Array<{ date: string; sessions: number }> = [],
): string {
  if (daily.length === 0) return "";
  // Scale to the tallest bar across BOTH series so the comparison is honest.
  const allValues = [
    ...daily.map((d) => d.sessions),
    ...prevDaily.map((d) => d.sessions),
  ];
  const max = Math.max(...allValues, 1);
  const CHART_H = 110;
  const cells = daily
    .map((d, i) => {
      const dayLabel = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
      const prev = prevDaily[i]?.sessions ?? 0;
      const currH = Math.max(Math.round((d.sessions / max) * CHART_H), d.sessions > 0 ? 3 : 0);
      const prevH = Math.max(Math.round((prev / max) * CHART_H), prev > 0 ? 3 : 0);
      return `
        <td valign="bottom" align="center" style="padding:0 3px; vertical-align:bottom;">
          <div style="font-size:11px; font-weight:700; color:#171717; margin-bottom:4px; line-height:1;">${d.sessions}</div>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
            <tr>
              <td valign="bottom" style="padding:0 1px; vertical-align:bottom; height:${CHART_H}px;">
                <div style="width:14px; height:${currH}px; background:#E11D48; border-radius:3px 3px 0 0;"></div>
              </td>
              <td valign="bottom" style="padding:0 1px; vertical-align:bottom; height:${CHART_H}px;">
                <div style="width:14px; height:${prevH}px; background:#CBD5E1; border-radius:3px 3px 0 0;"></div>
              </td>
            </tr>
          </table>
          <div style="font-size:10px; color:#94A3B8; margin-top:6px; text-transform:uppercase; letter-spacing:0.5px;">${dayLabel}</div>
        </td>
      `;
    })
    .join("");
  // Simple legend row below the chart so recipients know which bar is which.
  const legend = `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 0;">
      <tr>
        <td style="padding:0 8px; vertical-align:middle;">
          <span style="display:inline-block; width:10px; height:10px; background:#E11D48; border-radius:2px; vertical-align:middle;"></span>
          <span style="font-size:11px; color:#475569; margin-left:6px; vertical-align:middle;">This week</span>
        </td>
        <td style="padding:0 8px; vertical-align:middle;">
          <span style="display:inline-block; width:10px; height:10px; background:#CBD5E1; border-radius:2px; vertical-align:middle;"></span>
          <span style="font-size:11px; color:#475569; margin-left:6px; vertical-align:middle;">Previous week</span>
        </td>
      </tr>
    </table>
  `;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
      <tr>${cells}</tr>
    </table>
    ${legend}
  `;
}

// Horizontal bar chart — one row per series. Rendered as a 3-column
// table: [label] [bar] [value]. The bar itself is a colored <div>
// inside a light-gray track <div>, width set as inline percentage.
function renderHorizontalBars(
  data: Array<{ name: string; value: number }>,
  opts: { color?: string } = {},
): string {
  if (data.length === 0) return "";
  const color = opts.color ?? "#E11D48";
  const max = Math.max(...data.map((d) => d.value), 1);
  const rows = data
    .map((d) => {
      const widthPct = Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0);
      return `
        <tr>
          <td style="padding:6px 12px 6px 0; font-size:12px; color:#475569; white-space:nowrap; vertical-align:middle; width:130px;">
            ${escapeHtml(d.name)}
          </td>
          <td style="padding:6px 0; vertical-align:middle;">
            <div style="background:#F1F5F9; border-radius:4px; height:14px; overflow:hidden;">
              <div style="background:${color}; width:${widthPct}%; height:14px; border-radius:4px;"></div>
            </div>
          </td>
          <td style="padding:6px 0 6px 8px; font-size:12px; font-weight:700; color:#171717; text-align:right; white-space:nowrap; vertical-align:middle; width:60px;">
            ${d.value.toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${rows}
    </table>
  `;
}

function renderReport(m: WeeklyMetrics): string {
  const deltaLine =
    m.leadsDeltaPct === null
      ? m.leadsThisWeek > 0
        ? `<span style="color:#059669; font-weight:600;">+${m.leadsThisWeek}</span> new leads vs 0 last week`
        : `<span style="color:#6b7280;">No leads this week or last week</span>`
      : m.leadsDeltaPct > 0
        ? `<span style="color:#059669; font-weight:600;">▲ ${m.leadsDeltaPct}%</span> more leads than last week`
        : m.leadsDeltaPct < 0
          ? `<span style="color:#dc2626; font-weight:600;">▼ ${Math.abs(m.leadsDeltaPct)}%</span> fewer leads than last week`
          : `<span style="color:#6b7280;">Same as last week</span>`;

  const kpiCell = (label: string, value: string | number, extra?: string) => `
    <td valign="top" style="width:25%; padding:16px 12px; background:#F8F5F1; border-radius:12px; text-align:center; vertical-align:top;">
      <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1.5px;">${escapeHtml(label)}</p>
      <p style="margin:0; font-size:28px; font-weight:700; color:#171717; font-family:Georgia,serif; line-height:1;">${value}</p>
      ${extra ? `<p style="margin:6px 0 0 0; font-size:11px; color:#64748B;">${extra}</p>` : ""}
    </td>
  `;

  const hotLeadsRows = m.hotLeads.length
    ? m.hotLeads
        .map(
          (l) => `
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #EAE4DA; font-size:14px; color:#171717;">
            <div style="font-weight:600;">${escapeHtml(l.name)}</div>
            <div style="font-size:12px; color:#64748B; margin-top:2px;">
              ${l.email ? `<a href="mailto:${escapeHtml(l.email)}" style="color:#64748B; text-decoration:none;">${escapeHtml(l.email)}</a>` : ""}
              ${l.email && l.phone ? " · " : ""}
              ${l.phone ? `<a href="tel:${escapeHtml(l.phone)}" style="color:#64748B; text-decoration:none;">${escapeHtml(l.phone)}</a>` : ""}
            </div>
          </td>
          <td style="padding:12px 16px; border-bottom:1px solid #EAE4DA; font-size:12px; color:#64748B; white-space:nowrap;">
            <span style="background:#E11D48; color:#ffffff; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(friendlyLeadSource(l.source))}</span>
            <div style="margin-top:4px; color:#94A3B8;">${fmtDate(l.created_at)}</div>
          </td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="2" style="padding:24px 16px; text-align:center; font-size:13px; color:#94A3B8;">No hot leads this week.</td></tr>`;

  const body = `
    <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:3px;">
      Weekly Report
    </p>
    <h1 style="margin:0 0 4px 0; font-size:24px; font-weight:700; color:#171717; line-height:1.2;">
      PLACES — ${fmtDate(m.weekStart)} to ${fmtDate(m.weekEnd)}
    </h1>
    <p style="margin:0 0 24px 0; font-size:14px; color:#64748B;">
      ${deltaLine}
    </p>

    <!-- Section 1: New leads + Contacted -->
    <table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
      <tr>
        ${kpiCell("New leads this week", m.leadsThisWeek, m.leadsPrevWeek > 0 ? `${m.leadsPrevWeek} last week` : "—")}
        ${kpiCell(
          "Leads already contacted",
          m.contactedThisWeek,
          m.leadsThisWeek > 0
            ? `${Math.round((m.contactedThisWeek / m.leadsThisWeek) * 100)}% of new leads`
            : "—",
        )}
      </tr>
    </table>

    <!-- Section 2: Website traffic (plain labels) + section 3 chart -->
    ${m.ga4
      ? (() => {
          const deltaLine = (pct: number | null, curr: number): string => {
            if (pct === null) return curr > 0 ? `up from 0` : "—";
            if (pct > 0) return `<span style="color:#059669;">▲ ${pct}%</span> vs last week`;
            if (pct < 0) return `<span style="color:#dc2626;">▼ ${Math.abs(pct)}%</span> vs last week`;
            return "same as last week";
          };
          return `<table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
          <tr>
            ${kpiCell("Website visits", m.ga4.sessions.toLocaleString(), deltaLine(m.ga4.sessionsDeltaPct, m.ga4.sessions))}
            ${kpiCell("Website visitors", m.ga4.users.toLocaleString(), "unique people")}
            ${kpiCell("Actions taken", m.ga4.keyEvents.toLocaleString(), deltaLine(m.ga4.keyEventsDeltaPct, m.ga4.keyEvents))}
          </tr>
        </table>

        <!-- Chart: this week vs last week -->
        <div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
          <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
            Website visits — this week vs last week
          </p>
          ${renderSessionsLineChart(m.ga4.dailySessions, m.ga4.prevDailySessions)}
        </div>

        <!-- Actions breakdown: which specific actions people took -->
        ${m.ga4.keyEventBreakdown.length > 0
          ? `<div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
              <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
                What actions people took
              </p>
              ${renderHorizontalBars(
                m.ga4.keyEventBreakdown.map((e) => ({ name: friendlyEventName(e.name), value: e.count })),
                { color: "#171717" },
              )}
            </div>`
          : ""}`;
        })()
      : `<div style="margin-bottom:24px; padding:12px 16px; background:#F8F5F1; border-radius:8px; font-size:12px; color:#64748B;">
          Website traffic data isn't available this week — Google Analytics connection needs a check.
        </div>`}

    <!-- Section 4: Where the leads came from -->
    ${m.leadsBySource.length > 0
      ? `<div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
          <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
            Where new leads came from this week
          </p>
          ${renderHorizontalBars(
            m.leadsBySource.map((s) => ({ name: friendlyLeadSource(s.name), value: s.value })),
            { color: "#171717" },
          )}
        </div>`
      : ""}

    <!-- Section 5: Hot leads to follow up -->
    <h2 style="margin:32px 0 12px 0; font-size:16px; font-weight:700; color:#171717;">Hot leads to follow up</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff; border:1px solid #EAE4DA; border-radius:12px; overflow:hidden;">
      ${hotLeadsRows}
    </table>

    ${m.listingIssues && (m.listingIssues.mustFix > 0 || m.listingIssues.toCheck > 0)
      ? `<!-- Section 6: Listing data to fix -->
    <h2 style="margin:32px 0 12px 0; font-size:16px; font-weight:700; color:#171717;">Listings to fix</h2>
    <p style="margin:0 0 12px 0; font-size:14px; color:#475569;">
      <strong style="color:#B91C1C;">${m.listingIssues.mustFix} must fix</strong> (wrong currency, impossible price or area: visitors see wrong numbers)
      · ${m.listingIssues.toCheck} to check.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff; border:1px solid #EAE4DA; border-radius:12px; overflow:hidden;">
      ${m.listingIssues.top
        .map(
          (t) => `<tr><td style="padding:10px 14px; border-bottom:1px solid #F1ECE4; font-size:13px;">
            <span style="color:${t.mustFix ? "#B91C1C" : "#92400E"}; font-weight:600;">${t.mustFix ? "Must fix" : "Check"}</span>
            · #${t.id} ${escapeHtml(t.title ?? "")}<br/>
            <span style="color:#64748B;">${escapeHtml(t.rule)}</span>
          </td></tr>`,
        )
        .join("")}
    </table>`
      : ""}

    <div style="margin:32px 0 8px 0; padding:16px 20px; background:#171717; border-radius:12px; text-align:center;">
      <a href="https://places-egy.com/dashboard" style="display:inline-block; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px;">
        Open the leads dashboard →
      </a>
    </div>

    <p style="margin:24px 0 0 0; font-size:12px; color:#94A3B8; text-align:center;">
      Auto-generated every Monday. Reply to this email to hand off feedback on what to add.
    </p>
  `;

  // Minimal wrapper — no need for the marketing brandedShell here since
  // this is an internal report, not a customer-facing email. Just a clean
  // Gmail-safe container.
  return `<!doctype html>
    <html><body style="margin:0; padding:0; background:#F8F5F1; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F8F5F1;">
      <tr><td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background:#ffffff; border-radius:16px; padding:32px;">
          <tr><td>${body}</td></tr>
        </table>
      </td></tr>
    </table>
    </body></html>`;
}

// The exported cron handler. Called by the same cron-job.org config that
// runs the other weekly jobs. Auth via x-cron-token header, same shared
// secret pattern as regenerate-report + send-favorites-digests.
export async function weeklyReportHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const cronToken = process.env.CRON_TOKEN;
  if (!cronToken) {
    res.status(503).json({ message: "CRON_TOKEN not configured" });
    return;
  }
  const provided = req.header("x-cron-token");
  if (!provided || provided !== cronToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const metrics = await fetchMetrics();
    const html = renderReport(metrics);
    // Subject line: plain labels the sales team scans instantly.
    // Example: "PLACES weekly summary · 11 new leads · 1,240 website visits"
    const parts: string[] = [
      `${metrics.leadsThisWeek} new lead${metrics.leadsThisWeek === 1 ? "" : "s"}`,
    ];
    if (metrics.ga4) {
      parts.push(`${metrics.ga4.sessions.toLocaleString()} website visits`);
    }
    // Recipients: admin inbox + Mohamed Safwat. Both receive the same
    // report; sent as separate emails so mailer errors on one don't
    // block the other.
    const recipients = ["admin@places-egy.com", "mohamed.safwat@places-egy.com"];
    await Promise.all(
      recipients.map((to) =>
        sendMail({
          to,
          subject: `PLACES weekly summary · ${parts.join(" · ")}`,
          html,
        }),
      ),
    );
    console.log(
      `[weekly-report] sent for ${metrics.weekStart} to ${metrics.weekEnd}:`,
      metrics.leadsThisWeek,
      "leads,",
      metrics.contactedThisWeek,
      "contacted",
    );
    res.json({ ok: true, ...metrics });
  } catch (err) {
    console.error("[weekly-report] failed:", err);
    res.status(500).json({ message: (err as Error).message });
  }
}
