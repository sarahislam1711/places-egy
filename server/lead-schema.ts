import { z } from "zod";

// Public POST /api/leads payload. Kept small on purpose — asking for less =
// higher conversion rate. Only name + email are required. Everything else
// (phone, message, source, magnet, listing_id, utm_*) is optional context
// the client should attach when available.
//
// The API layer is the trust boundary: any field not in this schema is
// dropped silently. Length limits keep the DB / email templates safe from
// arbitrary blobs, and the honeypot field short-circuits obvious bots.
export const leadInsertSchema = z
  .object({
    // Required
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),

    // Phone is required for the market-report magnet (real-estate leads must
    // be reachable). Server enforces min length so a blank isn't accepted.
    phone: z.string().trim().min(4).max(40),

    // Free-text field where the visitor can name a project or ask a specific
    // question. Optional — never gate the form on this.
    message: z.string().trim().max(2000).nullable().optional(),

    // Locations the visitor is interested in. Multi-select from the 6
    // canonical Cairo districts we serve. Optional — magnet flows that
    // already carry listing_id (like price_unlock) don't need to ask
    // for locations again because the listing itself pins the district.
    // Contact-page LeadForm still enforces min-1 at the client level
    // for the multi-select UX, so the DB still gets the signal there.
    locations: z
      .array(
        z.enum([
          "new-cairo",
          "sheikh-zayed",
          "6th-october",
          "downtown-cairo",
          "sheraton",
          "maadi",
        ]),
      )
      .max(6)
      .default([]),

    // Where the lead came from. Slug-y string set by the wrapper component
    // (e.g. "contact_page", "market_report", "listing_inquiry", "footer",
    // "exit_intent"). We restrict format so it stays greppable in the DB.
    lead_source: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .regex(/^[a-z0-9_-]+$/i, "lead_source must be slug-format"),

    // Which magnet was offered (for A/B tracking + follow-up automation).
    // Free string, but slug-format so it's greppable. Null for plain contact.
    magnet: z
      .string()
      .trim()
      .max(60)
      .regex(/^[a-z0-9_-]+$/i)
      .nullable()
      .optional(),

    // Contextual metadata (all optional). listing_id links inquiries to a
    // specific listing; page_url captures where the form lived; utm_* keeps
    // marketing-channel attribution.
    listing_id: z.number().int().positive().nullable().optional(),
    page_url: z.string().max(500).nullable().optional(),
    utm_source: z.string().max(80).nullable().optional(),
    utm_medium: z.string().max(80).nullable().optional(),
    utm_campaign: z.string().max(80).nullable().optional(),
    utm_term: z.string().max(80).nullable().optional(),
    utm_content: z.string().max(80).nullable().optional(),

    // Language preference — captured from browser + URL path at submit time.
    // Used to render the market-report auto-reply email in the visitor's
    // language. Optional; server falls back to 'en'.
    preferred_language: z.enum(["en", "ar"]).optional(),

    // Honeypot: real users leave this blank; bots fill every field. If it
    // arrives non-empty we accept the request with 200 (so bots don't retry)
    // but never persist. Handled in the route, not the schema.
    website: z.string().max(200).optional(),
  })
  .strict();

// Concierge widget schema — lightweight lead capture from the "Looking for
// something specific?" bottom-left popup. Deliberately minimal to maximize
// conversion: name required, contact (email OR phone) required, intent as
// enum. No locations, no separate message.
//
// Goes into the same `leads` table as everything else — lead_source is
// hardcoded server-side to "concierge_widget", magnet stays null.
export const conciergeLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(4).max(40),
    intent: z.enum(["buy", "rent", "browsing", "other"]),
    // Free-text — for when they pick "other" or want to add specifics.
    // Optional even for "other" so submission never fails on it.
    message: z.string().trim().max(500).nullable().optional(),
    // Optional qualifiers — the concierge form doesn't gate on these, but
    // any that get filled in help the sales team qualify faster. Bucketed
    // rather than free-text so the data is reportable.
    company: z.string().trim().max(150).nullable().optional(),
    job_title: z.string().trim().max(150).nullable().optional(),
    area_range: z
      .enum(["under-100", "100-300", "300-500", "500-plus"])
      .nullable()
      .optional(),
    budget_from: z.number().int().nonnegative().max(1_000_000_000).nullable().optional(),
    budget_to: z.number().int().nonnegative().max(1_000_000_000).nullable().optional(),
    preferred_language: z.enum(["en", "ar"]).optional(),
    page_url: z.string().max(500).nullable().optional(),
    utm_source: z.string().max(80).nullable().optional(),
    utm_medium: z.string().max(80).nullable().optional(),
    utm_campaign: z.string().max(80).nullable().optional(),
    utm_term: z.string().max(80).nullable().optional(),
    utm_content: z.string().max(80).nullable().optional(),
    website: z.string().max(200).optional(), // honeypot
  })
  .strict();

// Developer survey lead magnet schema — the /guides/* popup + inline embed
// that captures info-seeking traffic and emails back the PLACES developer
// price survey PDF. Same shape as the concierge widget (name, phone, email
// all required + all the optional qualifiers) so admin sees consistent
// data across both funnels.
export const developerSurveyLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(4).max(40),
    intent: z.enum(["buy", "rent", "browsing", "other"]),
    // Optional qualifiers — all identical to the concierge widget so we
    // can compose one shared "friendlyLead" formatter in the future.
    company: z.string().trim().max(150).nullable().optional(),
    job_title: z.string().trim().max(150).nullable().optional(),
    area_range: z
      .enum(["under-100", "100-300", "300-500", "500-plus"])
      .nullable()
      .optional(),
    budget_from: z.number().int().nonnegative().max(1_000_000_000).nullable().optional(),
    budget_to: z.number().int().nonnegative().max(1_000_000_000).nullable().optional(),
    message: z.string().trim().max(500).nullable().optional(),
    preferred_language: z.enum(["en", "ar"]).optional(),
    // 'popup' vs 'inline' so admin can see which placement drove the lead.
    placement: z.enum(["popup", "inline"]),
    // Which guide URL surfaced the magnet.
    guide_slug: z.string().trim().max(120).nullable().optional(),
    // Which free download was requested. Defaults to the developer survey
    // (older clients don't send it). "office_checklist" = the Cairo office
    // search checklist offered at the end of every guide (28 Nov).
    offer: z.enum(["developer_survey", "office_checklist"]).optional(),
    page_url: z.string().max(500).nullable().optional(),
    utm_source: z.string().max(80).nullable().optional(),
    utm_medium: z.string().max(80).nullable().optional(),
    utm_campaign: z.string().max(80).nullable().optional(),
    utm_term: z.string().max(80).nullable().optional(),
    utm_content: z.string().max(80).nullable().optional(),
    website: z.string().max(200).optional(), // honeypot
  })
  .strict();

// Admin-only PATCH for updating a lead (mark followed-up, add notes, change
// status). No new leads allowed here — inserts always come through the
// public POST route above.
export const leadUpdateSchema = z
  .object({
    status: z
      .enum(["new", "contacted", "qualified", "won", "lost"])
      .optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();
