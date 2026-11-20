import { invalidateInventory } from "./seo/data";
import { healthHandler } from "./health";
import { syncListingToHotdesk, hotdeskMode, isHotdeskEligible, toHotdeskListing, hotdeskWarnings, type ListingRow } from "./hotdesk";
import { uploadVariants } from "./image-variants";
import { forgetListing } from "./listing-redirect";
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import multer from "multer";
import { supabaseAdmin } from "./supabase";
import { requireAdmin } from "./admin-auth";
import { strictLimiter, adminLimiter, uploadLimiter } from "./rate-limit";
import { listingInsertSchema, listingUpdateSchema } from "./listing-schema";
import { dealInsertSchema, dealUpdateSchema } from "./deal-schema";
import { clientLogoInsertSchema, clientLogoUpdateSchema } from "./client-logo-schema";
import {
  leadInsertSchema,
  leadUpdateSchema,
  conciergeLeadSchema,
  developerSurveyLeadSchema,
} from "./lead-schema";
import {
  accountSignupSchema,
  addFavoriteSchema,
  bulkFavoritesSchema,
} from "./account-schema";
import {
  generateSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionAccount,
  requireAccount,
} from "./account-auth";
import {
  sendMail,
  sendAdminLeadNotification,
  sendMarketReportReply,
  sendDeveloperSurveyReply,
  sendLeadWelcomeWithListings,
  escapeHtml,
} from "./mailer";
import {
  fetchRecentListingsForWelcome,
  fetchListingForContext,
} from "./lead-welcome-listings";
import { handleCalendlyWebhook } from "./calendly-webhook";
import { regenerateMarketReportHandler } from "./regenerate-report";
import { weeklyReportHandler } from "./weekly-report";
import { getUsdEgpRate, setManualUsdEgpRate } from "./fx";
import { nurtureFollowupsHandler } from "./nurture";
import { registerProjectCoordsRoutes } from "./project-coords-routes";
import {
  handleMilestoneOnFavorite,
  handleManualEmailRequest,
  runDigestSweep,
} from "./favorites-digest";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const SUPABASE_BUCKET = "listings-images";

const WP_API = process.env.WORDPRESS_API_URL;

if (!WP_API) {
  console.warn(
    "[blog] WORDPRESS_API_URL is not set — blog endpoints will return 500 until configured.",
  );
}

// Forwards a fetch to WordPress and returns its JSON + a couple of headers
// we need on the client (pagination headers, content-type).
async function proxyToWp(path: string, res: Response) {
  if (!WP_API) {
    return res.status(500).json({ error: "WORDPRESS_API_URL not configured" });
  }

  try {
    const url = `${WP_API}${path}`;
    const wpRes = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!wpRes.ok) {
      // Log the upstream body server-side but don't reflect it to the client —
      // WP error responses can leak plugin/version info.
      const text = await wpRes.text();
      console.error(
        `[blog] WP upstream ${wpRes.status} for ${path}: ${text.slice(0, 500)}`,
      );
      return res.status(wpRes.status).json({
        error: "Upstream WordPress error",
        status: wpRes.status,
      });
    }

    // Forward pagination headers so the client can read total/totalPages.
    const total = wpRes.headers.get("X-WP-Total");
    const totalPages = wpRes.headers.get("X-WP-TotalPages");
    if (total) res.setHeader("X-WP-Total", total);
    if (totalPages) res.setHeader("X-WP-TotalPages", totalPages);

    // Cache for 60s on the edge / browser. Tune later if you want.
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    const data = await wpRes.json();
    return res.json(data);
  } catch (err) {
    console.error("[blog] WP proxy error:", err);
    return res.status(502).json({ error: "Failed to reach WordPress" });
  }
}

// Columns added by sql/listings-outdoor-and-fx.sql. If this code runs before
// that migration, admin saves retry without them instead of failing.
const NEW_LISTING_COLUMNS = ["outdoor_area_sqm", "outdoor_price_per_meter", "outdoor_area_type", "price_is_lump_sum"] as const;
const missingNewColumns = (msg: string) =>
  /column|schema cache|42703|PGRST204/i.test(msg) && NEW_LISTING_COLUMNS.some((c) => msg.includes(c));
function withoutNewColumns<T extends Record<string, unknown>>(row: T): T {
  const copy = { ...row };
  for (const c of NEW_LISTING_COLUMNS) delete (copy as Record<string, unknown>)[c];
  return copy;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  registerProjectCoordsRoutes(app);

  // GET /img/<supabase-key> — public image proxy that serves listings-
  // images from the sending domain (places-egy.com) instead of the raw
  // Supabase Storage host. Gmail + Yahoo spam filters penalize
  // image-domain / sending-domain mismatches; this proxy lets our
  // outbound emails reference images at places-egy.com so DKIM +
  // reputation align.
  //
  // Cache-Control lets Cloudflare cache each image for a year (Supabase
  // keys are immutable — the filename embeds a timestamp + random slug,
  // so a new upload produces a new URL). After the first request per
  // image, Railway sees zero further hits for that image.
  //
  // Path guardrails:
  //   - Only serves objects under the `listings-images` bucket.
  //   - Rejects path traversal + control characters.
  //   - Rejects anything outside a small allowlist of image extensions.
  //
  // The route is deliberately mounted BEFORE any auth or rate limiter
  // scope so images work for logged-out visitors + email recipients.
  app.get("/img/{*key}", async (req: Request, res: Response) => {
    // Express 5 wildcard segments come back as an array. Rejoin into a
    // slash-separated path for the Supabase lookup below.
    const rawKey = req.params.key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    // Reject path traversal + control chars up front.
    if (!key || key.includes("..") || /[\x00-\x1f]/.test(key)) {
      return res.status(400).send("Bad path");
    }
    // Extension allowlist mirrors the upload-time whitelist so we never
    // proxy anything the admin upload endpoint wouldn't have accepted.
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) {
      return res.status(400).send("Unsupported extension");
    }
    const supabaseHost = process.env.SUPABASE_URL;
    if (!supabaseHost) {
      return res.status(503).send("Supabase not configured");
    }
    const upstream = `${supabaseHost}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
    try {
      const upstreamRes = await fetch(upstream);
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).send("Upstream error");
      }
      // Copy content-type + length verbatim so browsers render the
      // image correctly regardless of format.
      const contentType = upstreamRes.headers.get("content-type");
      const contentLength = upstreamRes.headers.get("content-length");
      if (contentType) res.setHeader("Content-Type", contentType);
      if (contentLength) res.setHeader("Content-Length", contentLength);
      // Aggressive caching at Cloudflare + browser. Keys are immutable,
      // so we can pin `public, max-age=31536000, immutable` without risk.
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      // Buffer + send. Small (< 1MB typically) so streaming isn't
      // strictly needed and Express handles buffered response cleanly.
      const buf = Buffer.from(await upstreamRes.arrayBuffer());
      return res.send(buf);
    } catch (err) {
      console.warn("[img-proxy] fetch failed:", err);
      return res.status(502).send("Bad gateway");
    }
  });

  // GET /api/blog/posts?page=1&per_page=9&category=market-insights&lang=en|ar
  // The `lang` param is Polylang's language filter — exposed to the REST API
  // by our custom snippet in WP's Code Snippets plugin. Only "en" or "ar"
  // reach WP; anything else is stripped so we never leak arbitrary params.
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    const params = new URLSearchParams();
    params.set("_embed", "true");
    params.set("page", String(req.query.page ?? 1));
    params.set("per_page", String(req.query.per_page ?? 9));
    const lang = String(req.query.lang ?? "");
    if (lang === "en" || lang === "ar") params.set("lang", lang);
    if (req.query.category) {
      // Frontend passes category SLUG, but WP /posts expects category ID.
      // Resolve slug → id first.
      const catRes = await fetch(
        `${WP_API}/categories?slug=${encodeURIComponent(String(req.query.category))}`,
      );
      const cats = (await catRes.json()) as Array<{ id: number }>;
      if (cats.length > 0) params.set("categories", String(cats[0].id));
    }
    return proxyToWp(`/posts?${params.toString()}`, res);
  });

  // GET /api/blog/posts/by-id/:id — single post by numeric ID. Used to
  // resolve Polylang translation pointers (translations: { en: 123 }) into
  // the counterpart post's slug so the client can emit reciprocal hreflang.
  // Guards :id as a positive integer to keep this from being a general
  // proxy passthrough.
  app.get("/api/blog/posts/by-id/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0 || id > 10_000_000) {
      return res.status(400).json({ message: "Invalid id" });
    }
    return proxyToWp(`/posts/${id}?_fields=slug`, res);
  });

  // GET /api/blog/posts/:slug?lang=en|ar — single post by slug
  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    const slug = encodeURIComponent(String(req.params.slug));
    const lang = String(req.query.lang ?? "");
    const langParam = lang === "en" || lang === "ar" ? `&lang=${lang}` : "";
    return proxyToWp(`/posts?slug=${slug}&_embed=true${langParam}`, res);
  });

  // GET /api/blog/categories?lang=en|ar — list of categories, optionally
  // filtered by Polylang language via the same custom snippet that exposes
  // ?lang= on /posts. Blank/missing lang returns everything (legacy behavior).
  app.get("/api/blog/categories", async (req: Request, res: Response) => {
    const lang = String(req.query.lang ?? "");
    const langParam = lang === "en" || lang === "ar" ? `&lang=${lang}` : "";
    return proxyToWp(
      `/categories?per_page=100&hide_empty=true${langParam}`,
      res,
    );
  });

  // GET /api/deals — public. The homepage deal carousel reads the active deals
  // (max 3) ordered by sort_order then newest. Uses the service-role client but
  // only ever returns active rows, so it's safe to expose unauthenticated.
  // USD→EGP rate for "≈ EGP" hints and cross-currency filtering (server/fx.ts).
  app.get("/api/fx/usd-egp", async (_req: Request, res: Response) => {
    const fx = await getUsdEgpRate();
    res.set("Cache-Control", "public, max-age=900");
    res.json({ rate: fx.rate, kind: fx.kind, asOf: fx.asOf });
  });

  // Admin: read the full rate state (incl. the API value under an override).
  app.get("/api/admin/fx/usd-egp", adminLimiter, requireAdmin, async (_req: Request, res: Response) => {
    res.json(await getUsdEgpRate());
  });

  // Admin: set a manual rate ({ rate: 52.5 }) or clear it ({ rate: null }).
  app.put("/api/admin/fx/usd-egp", adminLimiter, requireAdmin, async (req: Request, res: Response) => {
    const raw = req.body?.rate;
    const rate = raw === null || raw === "" || raw === undefined ? null : Number(raw);
    try {
      res.json(await setManualUsdEgpRate(rate));
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  });

  app.get("/api/deals", async (_req: Request, res: Response) => {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ message: error.message });
    res.json(data ?? []);
  });

  // ── Cron: monthly market report regeneration ────────────────────────────
  // Called externally by a cron scheduler on the 1st of every month.
  // Auth via x-cron-token header. See server/regenerate-report.ts.
  app.post("/api/admin/regenerate-market-report", regenerateMarketReportHandler);

  // ── Cron: weekly Monday admin lead report ───────────────────────────────
  // Called externally by cron-job.org every Monday at 09:00 Cairo time.
  // Auth via x-cron-token header, same shared secret as the other crons.
  // Sends a branded HTML email to admin@places-egy.com with the last 7
  // days of leads + deals + hot leads. See server/weekly-report.ts.
  app.post("/api/admin/weekly-report", weeklyReportHandler);

  // Uptime monitors poll this (see docs/MONITORING.md).
  app.get("/api/health", healthHandler);

  // ── Cron: day-2 + day-5 nurture followups ───────────────────────────────
  // Called daily at 10:00 Cairo. Finds leads created 48-72h ago (day_2) and
  // 5-6 days ago (day_5), sends templated nurture emails with 3 fresh
  // listings + WhatsApp CTA. Idempotent via sent_followups table.
  // See server/nurture.ts and sql/sent-followups.sql.
  app.post("/api/admin/send-nurture-followups", nurtureFollowupsHandler);

  // ── Cron: favorites digest sweep (every 30 min) ─────────────────────────
  // Finds accounts eligible for the 2h debounced digest (or weekly recap on
  // Mondays) and fires the emails. Same x-cron-token auth as above.
  app.post(
    "/api/admin/send-favorites-digests",
    async (req: Request, res: Response) => {
      const cronToken = process.env.CRON_TOKEN;
      if (!cronToken) {
        return res.status(503).json({ message: "CRON_TOKEN not configured" });
      }
      const provided = req.header("x-cron-token");
      if (!provided || provided !== cronToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const result = await runDigestSweep();
        console.log("[digest-sweep] result:", result);
        res.json({ ok: true, ...result });
      } catch (err) {
        console.error("[digest-sweep] failed:", err);
        res.status(500).json({ message: (err as Error).message });
      }
    },
  );

  // ── Manual "Email me my list" from /saved page ──────────────────────────
  // Signed-in user requests an on-demand digest of their current favorites.
  // Ignores debounce + 24h cadence cap since it was user-initiated.
  app.post(
    "/api/accounts/favorites/email-me-now",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      const account = (req as Request & { account: { id: number } }).account;
      const ok = await handleManualEmailRequest(account.id).catch(() => false);
      if (!ok) return res.status(400).json({ message: "No favorites to email" });
      res.json({ ok: true });
    },
  );

  // ── Calendly webhook ─────────────────────────────────────────────────────
  // Public endpoint hit by Calendly on invitee.created + invitee.canceled.
  // Auth is via HMAC signature (see server/calendly-webhook.ts). Every booking
  // ends up in the calendly_bookings table with full UTM attribution + fires
  // an admin@ notification on new bookings.
  app.post("/api/webhooks/calendly", async (req, res) => {
    await handleCalendlyWebhook(req, res);
  });

  // ── Leads (public capture + admin management) ────────────────────────────
  // POST /api/leads — public form submission from any capture point (contact
  // page, lead magnet CTAs, listing inquiries, footer, exit popup). Rate
  // limited via strictLimiter (5/min per IP) to blunt bot floods. Honeypot
  // field silently discards obvious bot submissions.
  app.post(
    "/api/leads",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = leadInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission" });
      }
      const { website: honeypot, ...lead } = parsed.data;
      // Silently accept + discard bot submissions so scanners get 200 and
      // stop retrying, but the row never lands in the DB.
      if (honeypot && honeypot.trim().length > 0) {
        return res.json({ ok: true });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from("leads")
        .insert({ ...lead, status: "new" })
        .select()
        .single();
      if (error) {
        console.error("[leads] insert failed:", error.message);
        return res.status(500).json({ message: "Could not save submission" });
      }

      // Fire the admin notification email. Doesn't block the response —
      // even if mail fails, the lead is already persisted so PLACES sees it
      // in the dashboard.
      void sendAdminLeadNotification({
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        message: lead.message ?? null,
        lead_source: lead.lead_source,
        magnet: lead.magnet ?? null,
        listing_id: lead.listing_id ?? null,
        page_url: lead.page_url ?? null,
        locations: lead.locations ?? null,
        utm_source: lead.utm_source ?? null,
        utm_medium: lead.utm_medium ?? null,
        utm_campaign: lead.utm_campaign ?? null,
      });

      // Auto-reply to the LEAD themselves. Fire-and-forget — a mailer failure
      // never blocks the response since the lead is already persisted and
      // admin@ already got the notification above.
      //
      // Magnet-specific replies (market report, developer survey) get their
      // own richer email with the promised PDF. Every other lead source
      // (contact form, price_unlock, generic magnet) gets the value-first
      // welcome with 3 recent listings embedded.
      if (lead.magnet === "cairo_office_market_report_2026") {
        void sendMarketReportReply({
          toEmail: lead.email,
          toName: lead.name,
          lang: lead.preferred_language ?? "en",
        });
      } else if (lead.magnet === "price_unlock") {
        // Price-unlock leads get similar-units email: filter recent listings
        // by the same subtype + location as the one they unlocked, so the
        // recommendations feel relevant instead of random.
        void (async () => {
          const contextListing = lead.listing_id
            ? await fetchListingForContext(lead.listing_id)
            : null;
          const listings = await fetchRecentListingsForWelcome({
            subtype: contextListing?.transaction_type ? undefined : undefined, // placeholder — subtype lives in raw row, not FavoritedListing
            location: contextListing?.location ?? null,
            excludeIds: lead.listing_id ? [lead.listing_id] : undefined,
          });
          await sendLeadWelcomeWithListings({
            toEmail: lead.email,
            toName: lead.name,
            source: "price_unlock",
            listings,
            context: { contextListing },
            lang: lead.preferred_language ?? "en",
          });
        })();
      } else {
        // Default: any generic contact-form submission (no magnet field set).
        void (async () => {
          const listings = await fetchRecentListingsForWelcome();
          await sendLeadWelcomeWithListings({
            toEmail: lead.email,
            toName: lead.name,
            source: "contact_form",
            listings,
            lang: lead.preferred_language ?? "en",
          });
        })();
      }

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ── Concierge widget lead capture ────────────────────────────────────────
  // Lightweight lead from the bottom-left "Looking for something specific?"
  // popup. Same `leads` table, but its own schema (no locations required,
  // email OR phone). lead_source hardcoded so admin can filter by it later.
  app.post(
    "/api/leads/concierge",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = conciergeLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission" });
      }
      const {
        website: honeypot,
        intent,
        message,
        company,
        job_title,
        area_range,
        budget_from,
        budget_to,
        ...rest
      } = parsed.data;
      if (honeypot && honeypot.trim().length > 0) {
        return res.json({ ok: true });
      }

      // Compose everything the admin needs into the message field so it
      // shows up front-and-center in the Leads dashboard without any new
      // DB columns. Layout is intent first (headline), then any qualifiers
      // that were filled in, then the free-text message.
      const intentLabel = {
        buy: "Wants to BUY an office",
        rent: "Wants to RENT an office",
        browsing: "Just browsing",
        other: "Other / undecided",
      }[intent];
      const areaLabel = area_range
        ? {
            "under-100": "Under 100 m²",
            "100-300": "100–300 m²",
            "300-500": "300–500 m²",
            "500-plus": "500+ m²",
          }[area_range]
        : null;
      const budgetLabel =
        budget_from != null || budget_to != null
          ? `${budget_from != null ? new Intl.NumberFormat("en-US").format(budget_from) : "?"} – ${budget_to != null ? new Intl.NumberFormat("en-US").format(budget_to) : "?"} EGP`
          : null;
      const qualifiers: string[] = [];
      if (company) qualifiers.push(`Company: ${company}`);
      if (job_title) qualifiers.push(`Title: ${job_title}`);
      if (areaLabel) qualifiers.push(`Area needed: ${areaLabel}`);
      if (budgetLabel) qualifiers.push(`Budget: ${budgetLabel}`);
      const composedMessage = [
        intentLabel,
        qualifiers.length ? qualifiers.join("\n") : null,
        message,
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: inserted, error } = await supabaseAdmin
        .from("leads")
        .insert({
          name: rest.name,
          email: rest.email ?? "",
          phone: rest.phone ?? "",
          message: composedMessage,
          locations: [],
          lead_source: "concierge_widget",
          magnet: null,
          page_url: rest.page_url ?? null,
          utm_source: rest.utm_source ?? null,
          utm_medium: rest.utm_medium ?? null,
          utm_campaign: rest.utm_campaign ?? null,
          utm_term: rest.utm_term ?? null,
          utm_content: rest.utm_content ?? null,
          preferred_language: rest.preferred_language ?? null,
          status: "new",
        })
        .select()
        .single();
      if (error) {
        console.error("[concierge] insert failed:", error.message);
        return res.status(500).json({ message: "Could not save submission" });
      }

      void sendAdminLeadNotification({
        name: rest.name,
        email: rest.email ?? "(not provided)",
        phone: rest.phone ?? null,
        message: composedMessage,
        lead_source: "concierge_widget",
        magnet: null,
        listing_id: null,
        page_url: rest.page_url ?? null,
        locations: null,
        utm_source: rest.utm_source ?? null,
        utm_medium: rest.utm_medium ?? null,
        utm_campaign: rest.utm_campaign ?? null,
      });

      // Value-first auto-reply — 3 recent listings filtered by their intent
      // (buy → sale, rent → rent, browsing/other → no filter). Skips send
      // if we couldn't capture an email (concierge accepts email-or-phone).
      if (rest.email && rest.email.trim().length > 0) {
        void (async () => {
          const txFilter: "sale" | "rent" | null =
            intent === "buy" ? "sale" : intent === "rent" ? "rent" : null;
          const listings = await fetchRecentListingsForWelcome({
            transactionType: txFilter,
          });
          await sendLeadWelcomeWithListings({
            toEmail: rest.email as string,
            toName: rest.name,
            source: "concierge",
            listings,
            lang: rest.preferred_language ?? "en",
          });
        })();
      }

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ── Developer survey magnet ─────────────────────────────────────────────
  // The /guides/* lead magnet — captures name/phone/email + qualifiers in
  // exchange for the PLACES Cairo Developer Price Survey PDF. Same schema
  // shape as concierge (with placement + guide_slug added). Auto-reply
  // email delivers the PDF; admin gets the friendly-formatted notification.
  app.post(
    "/api/leads/developer-survey",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = developerSurveyLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission" });
      }
      const {
        website: honeypot,
        intent,
        message,
        company,
        job_title,
        area_range,
        budget_from,
        budget_to,
        placement,
        guide_slug,
        ...rest
      } = parsed.data;
      if (honeypot && honeypot.trim().length > 0) {
        return res.json({ ok: true });
      }

      // Compose the message: intent + qualifiers + placement context, so
      // admin sees at a glance both what the user asked for AND where the
      // magnet was surfaced.
      const intentLabel = {
        buy: "Wants to BUY an office",
        rent: "Wants to RENT an office",
        browsing: "Just browsing",
        other: "Other / undecided",
      }[intent];
      const areaLabel = area_range
        ? {
            "under-100": "Under 100 m²",
            "100-300": "100–300 m²",
            "300-500": "300–500 m²",
            "500-plus": "500+ m²",
          }[area_range]
        : null;
      const budgetLabel =
        budget_from != null || budget_to != null
          ? `${budget_from != null ? new Intl.NumberFormat("en-US").format(budget_from) : "?"} – ${budget_to != null ? new Intl.NumberFormat("en-US").format(budget_to) : "?"} EGP`
          : null;
      const qualifiers: string[] = [];
      if (company) qualifiers.push(`Company: ${company}`);
      if (job_title) qualifiers.push(`Title: ${job_title}`);
      if (areaLabel) qualifiers.push(`Area needed: ${areaLabel}`);
      if (budgetLabel) qualifiers.push(`Budget: ${budgetLabel}`);
      if (guide_slug) qualifiers.push(`Read guide: ${guide_slug}`);
      const composedMessage = [
        intentLabel,
        qualifiers.length ? qualifiers.join("\n") : null,
        message,
      ]
        .filter(Boolean)
        .join("\n\n");

      // lead_source encodes placement so LEAD_SOURCE_LABELS in mailer.ts
      // can render it distinctly ('Developer survey popup' vs '... inline').
      const leadSource =
        placement === "inline"
          ? "developer_survey_inline"
          : "developer_survey_popup";

      const { data: inserted, error } = await supabaseAdmin
        .from("leads")
        .insert({
          name: rest.name,
          email: rest.email,
          phone: rest.phone,
          message: composedMessage,
          locations: [],
          lead_source: leadSource,
          magnet: "cairo_developer_survey_2026",
          page_url: rest.page_url ?? null,
          utm_source: rest.utm_source ?? null,
          utm_medium: rest.utm_medium ?? null,
          utm_campaign: rest.utm_campaign ?? null,
          utm_term: rest.utm_term ?? null,
          utm_content: rest.utm_content ?? null,
          preferred_language: rest.preferred_language ?? null,
          status: "new",
        })
        .select()
        .single();
      if (error) {
        console.error("[developer-survey] insert failed:", error.message);
        return res.status(500).json({ message: "Could not save submission" });
      }

      // Admin notification via the existing friendly-formatted mailer.
      void sendAdminLeadNotification({
        name: rest.name,
        email: rest.email,
        phone: rest.phone,
        message: composedMessage,
        lead_source: leadSource,
        magnet: "cairo_developer_survey_2026",
        listing_id: null,
        page_url: rest.page_url ?? null,
        locations: null,
        utm_source: rest.utm_source ?? null,
        utm_medium: rest.utm_medium ?? null,
        utm_campaign: rest.utm_campaign ?? null,
      });

      // Auto-reply to the visitor with the PDF download link.
      void sendDeveloperSurveyReply({
        toEmail: rest.email,
        toName: rest.name,
        lang: rest.preferred_language ?? "en",
      });

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ── Accounts (quick-signup + favorites) ──────────────────────────────────
  // Public, cookie-session accounts backing the favorites system. Signup =
  // 3 fields (name, email, phone); no password. On success we mint a session
  // token, store on the account row, set an httpOnly cookie. See
  // server/account-auth.ts for the session model.

  app.post(
    "/api/accounts",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = accountSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid signup" });
      }
      const { website, ...body } = parsed.data;
      if (website && website.trim().length > 0) {
        // Silently accept bot submissions so scanners get 200 and stop.
        return res.json({ ok: true });
      }

      // SECURITY (2026-08-30 audit finding): if this email already has an
      // account, do NOT log the requester in. The previous behavior rotated
      // the existing account's session_token and issued the requester a
      // cookie for that account — a trivial account-takeover primitive
      // (attacker submits {email: victim@...} and receives victim's session).
      //
      // New behavior: return the same generic 200 whether the email is new
      // or already exists. No token rotation, no cookie issued, no enumeration
      // signal in the response body. The genuine returning user experience
      // (they still have their cookie from the original signup) is unchanged
      // because we never touched the existing row.
      //
      // A future real "log me back in on a new device" flow needs an out-of-
      // band verification step (magic link to the email) — deliberately not
      // built here; too easy to get wrong.
      const existing = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("email", body.email.toLowerCase())
        .maybeSingle();

      const token = generateSessionToken();
      const now = new Date().toISOString();

      if (existing.data) {
        // Silently 200 without side effects. Deliberately mimic the fresh-
        // signup response shape (no `existed` flag) so an attacker can't
        // enumerate registered emails by comparing responses.
        return res.json({ ok: true });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from("accounts")
        .insert({
          name: body.name,
          email: body.email.toLowerCase(),
          phone: body.phone,
          session_token: token,
          last_active_at: now,
          preferred_language: body.preferred_language ?? "en",
        })
        .select("id")
        .single();
      if (error || !inserted) {
        console.error("[accounts] insert failed:", error?.message);
        return res.status(500).json({ message: "Could not create account" });
      }

      setSessionCookie(res, token);

      // Fire notification to admin@ so the team knows a new account signed
      // up — same pattern as lead notifications.
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#1a1a1a; max-width:560px;">
          <h2 style="margin:0 0 16px 0;">New account signup — ${escapeHtml(body.name)}</h2>
          <p style="margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
          <p style="margin:0 0 8px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(body.phone)}">${escapeHtml(body.phone)}</a></p>
          <p style="margin:24px 0 0 0; font-size:12px; color:#64748b;">
            View + WhatsApp them from <a href="https://places-egy.com/dashboard">/dashboard</a> → Accounts.
          </p>
        </div>
      `;
      void sendMail({
        to: "admin@places-egy.com",
        subject: `New account: ${body.name}`,
        html,
        replyTo: body.email,
      });

      // Value-first welcome email — introduces PLACES + shows 3 recent
      // admin listings the new account holder can save first.
      void (async () => {
        const listings = await fetchRecentListingsForWelcome();
        await sendLeadWelcomeWithListings({
          toEmail: body.email,
          toName: body.name,
          source: "account_signup",
          listings,
          lang: body.preferred_language ?? "en",
        });
      })();

      res.json({ ok: true, id: inserted.id, existed: false });
    },
  );

  // Log out — clears cookie. Doesn't invalidate the token server-side (the
  // next signup rotates it anyway); Phase 6 can rotate here too if needed.
  app.post(
    "/api/accounts/logout",
    (_req: Request, res: Response) => {
      clearSessionCookie(res);
      res.json({ ok: true });
    },
  );

  // Who am I? Returns current account + their favorites. If no session
  // cookie or invalid, returns 200 with `account: null` — the client's
  // useAccount() hook uses this to decide whether to show anon or signed-in
  // state. Never 401 here; the /favorites routes will 401 as needed.
  app.get(
    "/api/accounts/me",
    async (req: Request, res: Response) => {
      const account = await getSessionAccount(req);
      if (!account) return res.json({ account: null, favorites: [] });
      if (!supabaseAdmin) return res.json({ account, favorites: [] });
      const { data } = await supabaseAdmin
        .from("account_favorites")
        .select("listing_id,added_at")
        .eq("account_id", account.id)
        .order("added_at", { ascending: false });
      res.json({
        account,
        favorites: (data ?? []).map((r) => ({
          listing_id: r.listing_id,
          added_at: r.added_at,
        })),
      });
    },
  );

  app.post(
    "/api/accounts/favorites",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const parsed = addFavoriteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid" });
      const now = new Date().toISOString();
      // Upsert — silently no-op if already favorited.
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .upsert(
          {
            account_id: account.id,
            listing_id: parsed.data.listing_id,
            added_at: now,
          },
          { onConflict: "account_id,listing_id", ignoreDuplicates: true },
        );
      if (error) return res.status(400).json({ message: error.message });

      // Stamp last_favorite_at so the 2h debounced digest cron knows this
      // account has new activity + when it went quiet. Fire-and-forget.
      void supabaseAdmin
        .from("accounts")
        .update({ last_favorite_at: now })
        .eq("id", account.id);

      // Check if this favorite is the 10th — if so fire the milestone email
      // immediately (bottom-of-funnel signal). Fire-and-forget.
      void handleMilestoneOnFavorite(account.id);

      res.json({ ok: true });
    },
  );

  app.delete(
    "/api/accounts/favorites/:listingId",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const listingId = Number(req.params.listingId);
      if (!Number.isFinite(listingId)) return res.status(400).json({ message: "Invalid id" });
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .delete()
        .eq("account_id", account.id)
        .eq("listing_id", listingId);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // Bulk-merge: called right after signup with the anonymous localStorage
  // favorites the visitor built before creating the account. Idempotent —
  // duplicates are silently ignored.
  app.post(
    "/api/accounts/favorites/bulk",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const parsed = bulkFavoritesSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid" });
      if (parsed.data.listing_ids.length === 0) return res.json({ ok: true, merged: 0 });
      const now = new Date().toISOString();
      const rows = parsed.data.listing_ids.map((id) => ({
        account_id: account.id,
        listing_id: id,
        added_at: now,
      }));
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .upsert(rows, {
          onConflict: "account_id,listing_id",
          ignoreDuplicates: true,
        });
      // Stamp last_favorite_at so the digest cron treats these merged
      // favorites as recent activity worth sending a digest about.
      void supabaseAdmin
        .from("accounts")
        .update({ last_favorite_at: now })
        .eq("id", account.id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true, merged: rows.length });
    },
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Admin endpoints. All gated by requireAdmin + strictLimiter. Use the
  // service-role Supabase client which bypasses RLS — never expose this key.
  // ──────────────────────────────────────────────────────────────────────────

  // POST /api/admin/login — verify the admin password without exposing it on
  // a write path. Returns 200/401. Used by the dashboard login screen.
  app.post(
    "/api/admin/login",
    adminLimiter,
    requireAdmin,
    (_req: Request, res: Response) => {
      res.json({ ok: true });
    },
  );

  app.post(
    "/api/admin/listings",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      // updated_at/created_at/hotdesk_listing_id are server-owned; the dashboard may echo them back.
      const { updated_at: _ignored, created_at: _ignoredCreated, hotdesk_listing_id: _hotdeskId, ...body } = req.body ?? {};
      const parsed = listingInsertSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid listing payload" });
      }
      let { error, data } = await supabaseAdmin
        .from("listings")
        .insert(parsed.data)
        .select()
        .single();
      if (error && missingNewColumns(error.message)) {
        ({ error, data } = await supabaseAdmin.from("listings").insert(withoutNewColumns(parsed.data)).select().single());
      }
      if (error) return res.status(400).json({ message: error.message });
      syncListingToHotdesk(data, data.id, "created");
      invalidateInventory();
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/listings/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      // updated_at/created_at/hotdesk_listing_id are server-owned; the dashboard may echo them back.
      const { updated_at: _ignored, created_at: _ignoredCreated, hotdesk_listing_id: _hotdeskId, ...body } = req.body ?? {};
      const parsed = listingUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid listing payload" });
      }
      const changes = { ...parsed.data, updated_at: new Date().toISOString() };
      let { error, data } = await supabaseAdmin.from("listings").update(changes).eq("id", id).select().single();
      if (error && missingNewColumns(error.message)) {
        ({ error, data } = await supabaseAdmin.from("listings").update(withoutNewColumns(changes)).eq("id", id).select().single());
      }
      if (error) return res.status(400).json({ message: error.message });
      forgetListing(id);
      syncListingToHotdesk(data, id, "updated");
      invalidateInventory();
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/listings/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin
        .from("listings")
        .delete()
        .eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      forgetListing(id);
      syncListingToHotdesk(null, id, "deleted");
      invalidateInventory();
      res.json({ ok: true });
    },
  );

  // ── Deals admin CRUD (mirrors the listings routes) ────────────────────────
  app.get(
    "/api/admin/deals",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      // Admin view: all deals (incl. inactive), in display order.
      const { data, error } = await supabaseAdmin
        .from("deals")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.post(
    "/api/admin/deals",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = dealInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid deal payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("deals")
        .insert(parsed.data)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/deals/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = dealUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid deal payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("deals")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/deals/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Client logos ─────────────────────────────────────────────────────────
  // Renders on the /why-places "Companies We've Placed" strip. Public GET
  // returns only active logos in display order; admin CRUD mirrors the deals
  // pattern exactly.

  app.get("/api/client-logos", async (_req: Request, res: Response) => {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from("client_logos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) return res.status(500).json({ message: error.message });
    res.json(data ?? []);
  });

  app.get(
    "/api/admin/client-logos",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      // Admin view: all logos (incl. inactive), in display order.
      const { data, error } = await supabaseAdmin
        .from("client_logos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.post(
    "/api/admin/client-logos",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = clientLogoInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client logo payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("client_logos")
        .insert(parsed.data)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/client-logos/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = clientLogoUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client logo payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("client_logos")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/client-logos/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin.from("client_logos").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Leads admin CRUD ─────────────────────────────────────────────────────
  // List every submission. Newest first — that's the working view for the
  // team ("who did we get in the last hour?"). Bounded to 500 rows so a
  // runaway list doesn't hang the dashboard; add pagination if we ever hit
  // that ceiling in practice.
  app.get(
    "/api/admin/leads",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  // Update lead status or notes (e.g. mark contacted, add follow-up notes).
  app.patch(
    "/api/admin/leads/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = leadUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid lead update" });
      }
      const { error, data } = await supabaseAdmin
        .from("leads")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/leads/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      // `.select()` after delete returns the deleted rows so we can detect
      // the "policy allowed the call but blocked all rows" case, which
      // Supabase treats as success. If 0 rows come back but no error was
      // raised, RLS is the culprit — surface that to the admin instead of
      // pretending it worked.
      const { data, error } = await supabaseAdmin
        .from("leads")
        .delete()
        .eq("id", id)
        .select();
      if (error) return res.status(400).json({ message: error.message });
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `Row not deleted (id=${id}). Either the row is gone already or Supabase RLS is blocking deletes for the service role. Check RLS policies on the 'leads' table.`,
        });
      }
      res.json({ ok: true, deleted: data.length });
    },
  );

  // ── Accounts admin (view all signed-up users + their favorites) ──────────
  // Read-only from admin — accounts self-mutate via the public /api/accounts
  // routes above. Bounded to 500 rows same as leads.
  app.get(
    "/api/admin/accounts",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      // Get accounts + favorite counts in two queries (small tables — this
      // is fine and simpler than a view/RPC).
      const { data: accounts, error } = await supabaseAdmin
        .from("accounts")
        .select("id,name,email,phone,created_at,last_active_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      const { data: favs } = await supabaseAdmin
        .from("account_favorites")
        .select("account_id");
      const countMap = new Map<number, number>();
      for (const f of favs ?? []) {
        countMap.set(f.account_id, (countMap.get(f.account_id) ?? 0) + 1);
      }
      const enriched = (accounts ?? []).map((a) => ({
        ...a,
        favorite_count: countMap.get(a.id) ?? 0,
      }));
      res.json(enriched);
    },
  );

  // Fetch one account + its full favorites list (with joined listing details).
  app.get(
    "/api/admin/accounts/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const { data: account, error: accountErr } = await supabaseAdmin
        .from("accounts")
        .select("id,name,email,phone,created_at,last_active_at")
        .eq("id", id)
        .maybeSingle();
      if (accountErr) return res.status(400).json({ message: accountErr.message });
      if (!account) return res.status(404).json({ message: "Not found" });

      const { data: favRows } = await supabaseAdmin
        .from("account_favorites")
        .select("listing_id,added_at")
        .eq("account_id", id)
        .order("added_at", { ascending: false });

      const listingIds = (favRows ?? []).map((r) => r.listing_id);
      let listings: unknown[] = [];
      if (listingIds.length > 0) {
        const { data: ls } = await supabaseAdmin
          .from("listings")
          .select("*")
          .in("id", listingIds);
        // Preserve added_at ordering.
        const map = new Map((ls ?? []).map((l: { id: number }) => [l.id, l]));
        listings = listingIds
          .map((lid) => map.get(lid))
          .filter((l) => l != null);
      }
      res.json({ account, favorites: listings });
    },
  );

  app.delete(
    "/api/admin/accounts/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      // account_favorites has ON DELETE CASCADE (see SQL), so favorites go too.
      const { error } = await supabaseAdmin.from("accounts").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Bookings admin (Calendly meetings synced via webhook) ────────────────
  app.get(
    "/api/admin/bookings",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const { data, error } = await supabaseAdmin
        .from("calendly_bookings")
        .select("*")
        .order("start_time", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.delete(
    "/api/admin/bookings/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const { error } = await supabaseAdmin.from("calendly_bookings").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // What Hotdesk would receive for every eligible (rent, non-test) listing,
  // plus data problems to fix before launch. Read-only.
  app.get(
    "/api/admin/hotdesk/preview",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const rows: ListingRow[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabaseAdmin
          .from("listings")
          .select("*")
          .order("updated_at", { ascending: false })
          .range(from, from + 999);
        if (error) return res.status(500).json({ message: error.message });
        rows.push(...(data as ListingRow[]));
        if (data.length < 1000) break;
      }
      const eligible = rows.filter(isHotdeskEligible);
      const listings = eligible.map((l) => {
        const payload = toHotdeskListing(l);
        return { id: l.id, warnings: hotdeskWarnings(payload), payload };
      });
      res.json({
        mode: hotdeskMode(),
        totals: {
          all: rows.length,
          eligible: eligible.length,
          rented: eligible.filter((l) => l.rental_status === "rented").length,
          withWarnings: listings.filter((l) => l.warnings.length > 0).length,
        },
        listings,
      });
    },
  );

  app.post(
    "/api/admin/listings-images",
    uploadLimiter,
    requireAdmin,
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "File must be an image" });
      }
      // Extension whitelist — defence in depth beyond the MIME check.
      // Anything not in the allowlist gets rejected + normalized (never
      // written to storage) so path-traversal-y extensions can't leak in
      // via the filename we hand to Supabase Storage.
      const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
      const rawExt = (file.originalname.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTS.has(rawExt)) {
        return res.status(400).json({
          message: `Unsupported image type. Allowed: ${[...ALLOWED_EXTS].join(", ")}`,
        });
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${rawExt}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (upErr) return res.status(400).json({ message: upErr.message });
      await uploadVariants(supabaseAdmin, SUPABASE_BUCKET, fileName, file.buffer);
      const { data } = supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(fileName);
      res.json({ publicUrl: data.publicUrl });
    },
  );

  return httpServer;
}
