// One-way sync of PLACES rent listings to Hotdesk's marketplace.
// PLACES is the source of truth; Hotdesk mirrors it. Rule: transaction_type
// "rent" and not a test listing → on Hotdesk; anything else → hidden there.
//
// HOTDESK_SYNC_MODE: "off" (default) | "preview" (log what would be sent) |
// "live" (call Hotdesk at HOTDESK_API_URL with HOTDESK_USERNAME/PASSWORD).
//
// Safety rules (agreed with the site owner):
//   - Never throws into, or slows down, the admin save that triggered it:
//     syncs run in the background, one at a time, with timeouts.
//   - Never edits workspaces (that would reset every listing's pin) and never
//     sends a status to a workspace.
//   - Never sends "Inactive" (2) except when an office leaves Hotdesk (sale,
//     test, deleted): coming back from Inactive needs Hotdesk's approval.
//     Rented (3) ↔ Active (1) is only sent when Hotdesk already has it live.
//   - Never logs the password or tokens.
import {
  DEVELOPER_OPTIONS,
  FURNISHING_OPTIONS,
  LOCATION_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
  SUBTYPE_OPTIONS,
  getEnumLabel,
} from "../client/src/lib/enums";
import { cleanListingTitle, listingSnippet } from "../client/src/lib/listing-text";
import { canonicalListingPath } from "./listing-redirect";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "./supabase";

const SITE = "https://places-egy.com";

export type HotdeskMode = "off" | "preview" | "live";

export function hotdeskMode(): HotdeskMode {
  const m = (process.env.HOTDESK_SYNC_MODE ?? "off").toLowerCase();
  return m === "preview" || m === "live" ? m : "off";
}

export interface ListingRow {
  id: number;
  title: string | null;
  description: string | null;
  transaction_type: string | null;
  property_type: string | null;
  subtype: string | null;
  developer: string | null;
  project: string | null;
  location: string | null;
  location_area: string | null;
  street_name?: string | null;
  building_name?: string | null;
  price: number | null;
  currency: string | null;
  price_per_meter: number | null;
  area_sqm: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  outdoor_area_type?: string | null;
  price_is_lump_sum?: boolean | null;
  floor: number | null;
  parking: number | null;
  furnishing: string | null;
  maintenance_fees: number | null;
  maintenance_status: string | null;
  delivery_date: string | null;
  images: string[] | null;
  is_test?: boolean | null;
  rental_status?: "available" | "rented" | null;
  rental_start?: string | null;
  rental_end?: string | null;
  hotdesk_listing_id?: number | null;
}

export function isHotdeskEligible(l: Pick<ListingRow, "transaction_type" | "is_test">): boolean {
  return (l.transaction_type ?? "").toLowerCase() === "rent" && !l.is_test;
}

// ── Mapping: PLACES listing → Hotdesk listing ──────────────────────────────

// Our location → the workspace (created by PLACES in Hotdesk's OS app) it lives under.
const WORKSPACE_TITLE: Record<string, string> = {
  "New Cairo": "Places - New Cairo",
  "Sheikh Zayed": "Places - Sheikh Zayed",
  "6th October": "Places - 6th October",
  "Maadi": "Places - Maadi",
  "Downtown Cairo": "Places - Downtown Cairo",
  "Sheraton": "Places - Sheraton",
};

// Hotdesk finishingType ids (from their OS app): 1 Core and Shell,
// 2 Semi-Finished, 3 Finished, 4 Furnished.
const FINISHING_TYPE: Record<string, number> = {
  "core-shell": 1,
  "semi-finished": 2,
  "finished": 3,
  "fully-finished": 3,
  "furnished": 4,
  "serviced": 4,
};

// Hotdesk listing status values.
const STATUS = { active: 1, inactive: 2, rented: 3 } as const;

const OFFICE_ROOM_TYPE = 3;
const MAX_PHOTOS = 4; // Hotdesk keeps image1..image4
const SQM_PER_PERSON = 8;
// Same as the opening hours on the PLACES site: Sat–Thu 9am–6pm, closed Friday.
const WORKING_HOURS = {
  sat: "09:00am - 06:00pm",
  sun: "09:00am - 06:00pm",
  mon: "09:00am - 06:00pm",
  tue: "09:00am - 06:00pm",
  wed: "09:00am - 06:00pm",
  thu: "09:00am - 06:00pm",
  fri: null,
};

// Prefer the pre-sized 1600px WebP (server/image-variants.ts) over the raw upload.
function hotdeskPhoto(url: string): string {
  return url.replace(/(\/listings-images\/\d{13}-[a-z0-9]{6})\.[a-z0-9]+$/i, "$1.w1600.webp");
}

const label = (opts: Parameters<typeof getEnumLabel>[0], v: string | null) =>
  v ? getEnumLabel(opts, v) || v : null;

// Street and building are optional in our admin but required by Hotdesk, so an
// empty one is sent as "none" (agreed with Hotdesk; their site hides it).
const NONE = "none";
const clean = (v: string | null | undefined) => (v ?? "").replace(/[|]+/g, " ").replace(/\s+/g, " ").trim();

// The office's own address from our data, e.g. "Mivida The Place, Fifth
// Settlement, New Cairo". Our area field is free text ("new cairo",
// "Fifth Settlement ", blank), so parts are tidied and repeats dropped.
export function hotdeskAddress(l: Pick<ListingRow, "project" | "location_area" | "location">): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const raw of [l.project, l.location_area, label(LOCATION_OPTIONS, l.location)]) {
    const p = (raw ?? "").replace(/[|]+/g, " ").replace(/\s+/g, " ").trim().replace(/^[-–,\s]+|[-–,\s]+$/g, "");
    const key = p.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!p || seen.has(key)) continue;
    seen.add(key);
    parts.push(/^[a-z]/.test(p) ? p.replace(/\b\w/g, (c) => c.toUpperCase()) : p);
  }
  return parts.join(", ");
}

// Leads go through Hotdesk's own enquiry form, so phone numbers in our
// descriptions are removed.
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;

const MAX_DESCRIPTION = 1500;

// Our descriptions are markdown; Hotdesk wants plain text with \n line breaks.
// Keeps the line structure (headings, bullet lists), drops a first line that
// just repeats the title, phone numbers and "for viewing call…" lines.
export function hotdeskDescription(l: ListingRow): string {
  const title = cleanListingTitle(l.title ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const lines: string[] = [];
  for (const raw of (l.description ?? "").split(/\r?\n/)) {
    const line = raw
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^\s{0,3}#{1,6}\s+/, "")
      .replace(/^\s*[-*+•]\s+/, "• ")
      .replace(/[*_`~>|]+/g, "")
      .replace(PHONE, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!line) {
      if (lines.length && lines[lines.length - 1] !== "") lines.push("");
      continue;
    }
    if (lines.length === 0 && line.toLowerCase().replace(/[^a-z0-9]/g, "") === title) continue;
    if (/^(for (details|viewing|more information)|call|whatsapp|contact)\b/i.test(line)) continue;
    lines.push(line);
  }
  let body = lines.join("\n").trim();
  if (body.length > MAX_DESCRIPTION) {
    const cut = body.slice(0, MAX_DESCRIPTION);
    body = cut.slice(0, Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". ") + 1, MAX_DESCRIPTION * 0.6)).trim();
  }
  if (!body) body = listingSnippet(l.description ?? "", 600);
  const address = hotdeskAddress(l);
  return [address && `Address: ${address}`, body].filter(Boolean).join("\n\n");
}

export function hotdeskTitle(l: Pick<ListingRow, "id" | "title">): string {
  const suffix = ` – #${l.id}`;
  return cleanListingTitle(l.title ?? "").slice(0, 255 - suffix.length).trim() + suffix;
}

const titleIsOurs = (title: unknown, placesId: number) =>
  typeof title === "string" && title.trim().endsWith(`#${placesId}`);

// Everything we send for one office. Workspace, city and postcode come from
// the workspace on Hotdesk, so they're filled in at sync time.
export function toHotdeskListing(l: ListingRow) {
  const rented = l.rental_status === "rented";
  const photos = (l.images ?? []).filter(Boolean).slice(0, MAX_PHOTOS);
  const area = l.area_sqm && l.area_sqm > 0 ? Math.round(l.area_sqm) : null;
  return {
    // Shown in the admin Hotdesk tab.
    title: hotdeskTitle(l),
    places_url: `${SITE}${canonicalListingPath(l)}`,
    workspace_title: l.location ? WORKSPACE_TITLE[l.location] ?? null : null,
    availability: { status: rented ? ("rented" as const) : ("available" as const) },
    photos: photos.map(hotdeskPhoto),
    // Sent to Hotdesk.
    finishingType: l.furnishing ? FINISHING_TYPE[l.furnishing] ?? null : null,
    description: hotdeskDescription(l),
    rules: {
      currency: (l.currency || "EGP").toUpperCase(),
      price: { month: l.price && l.price > 0 ? l.price : null },
      area,
      areaUnit: "sqm",
      capacity: area ? Math.max(1, Math.round(area / SQM_PER_PERSON)) : 1,
      quantity: 1,
      workingHours: WORKING_HOURS,
      address: hotdeskAddress(l),
      area_name: label(LOCATION_OPTIONS, l.location),
      // Hotdesk requires both; empty ones go as "none", which Hotdesk hides.
      building: clean(l.building_name) || NONE,
      street: clean(l.street_name) || NONE,
    },
    // Kept for the admin preview only.
    extra: {
      property_type: label(SUBTYPE_OPTIONS, l.subtype),
      developer: label(DEVELOPER_OPTIONS, l.developer),
      maintenance: label(MAINTENANCE_STATUS_OPTIONS, l.maintenance_status),
      finishing: label(FURNISHING_OPTIONS, l.furnishing),
    },
  };
}

export type HotdeskListing = ReturnType<typeof toHotdeskListing>;

// Data problems that would make a poor or rejected listing on Hotdesk.
export function hotdeskWarnings(p: HotdeskListing): string[] {
  const w: string[] = [];
  if (!p.workspace_title) w.push("location has no Hotdesk workspace");
  if (!p.rules.price.month) w.push("missing price");
  if (!p.rules.area) w.push("missing size");
  if (p.photos.length === 0) w.push("no photos");
  if (!p.description) w.push("no description");
  return w;
}

// ── Hotdesk API client ─────────────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

class HotdeskError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function apiBase(): string | null {
  const raw = (process.env.HOTDESK_API_URL ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(raw) ? raw : null;
}

let token: string | null = null;
let userId: number | null = null;

async function login(): Promise<void> {
  const base = apiBase();
  const username = process.env.HOTDESK_USERNAME;
  const password = process.env.HOTDESK_PASSWORD;
  if (!base || !username || !password) throw new HotdeskError("Hotdesk is not configured (URL, username or password missing)", 0);
  const res = await fetch(`${base}/user/login/jwt/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new HotdeskError(`login failed (${res.status})`, res.status);
  const body = (await res.json()) as { token?: string; access?: string; user?: { id?: number } };
  token = body.token ?? body.access ?? null;
  userId = body.user?.id ?? null;
  if (!token || !userId) throw new HotdeskError("login returned no token or user", res.status);
}

// JSON request with one automatic re-login when the token has expired.
async function api<T = any>(method: string, path: string, body?: unknown, retried = false): Promise<T> {
  const base = apiBase();
  if (!base) throw new HotdeskError("HOTDESK_API_URL missing or not https", 0);
  if (!token) await login();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
      "Accept-Language": "en",
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS * (isForm ? 3 : 1)),
  });
  if (res.status === 401 && !retried) {
    token = null;
    return api<T>(method, path, body, true);
  }
  const text = await res.text();
  if (!res.ok) throw new HotdeskError(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`, res.status);
  return (text ? JSON.parse(text) : null) as T;
}

type HdWorkspace = { id: number; title: string; city: number | { id: number }; metaData?: { detailedLocation?: { postalCode?: string } } };
type HdListing = {
  id: number;
  title: string;
  status: number;
  /** "Available again" date from Hotdesk's Rented popup (YYYY-MM-DD). */
  availableFrom?: string | null;
  owner?: number[];
  rules?: Record<string, any>;
  metaData?: Record<string, any>;
  workspace?: number | { id: number };
};

let workspaceCache: { at: number; byTitle: Map<string, HdWorkspace> } | null = null;

async function ourWorkspaces(): Promise<Map<string, HdWorkspace>> {
  if (workspaceCache && Date.now() - workspaceCache.at < 30 * 60_000) return workspaceCache.byTitle;
  if (!userId) await login();
  const page = await api<{ results: HdWorkspace[] }>("GET", `/workspace/?owner=${userId}&limit=100`);
  const byTitle = new Map(page.results.map((w) => [w.title.trim(), w]));
  workspaceCache = { at: Date.now(), byTitle };
  return byTitle;
}

// Hotdesk's developer list, matched to ours by name ("MARAKEZ" = "Marakez",
// "Al-Futtaim" = "Al Futtaim", "SKY — Park St." = "SKY"). A developer Hotdesk
// doesn't list is simply not sent. If the list can't be read, the office is
// still synced, just without a developer.
const devKey = (s: string) =>
  s.toLowerCase().replace(/\b(developments?|developers?|group|egypt)\b/g, "").replace(/[^a-z0-9]/g, "");
let developerCache: { at: number; byKey: Map<string, number> } | null = null;

async function hotdeskDeveloperId(placesDeveloper: string | null): Promise<number | null> {
  if (!placesDeveloper) return null;
  if (!developerCache || Date.now() - developerCache.at > 30 * 60_000) {
    const byKey = new Map<string, number>();
    try {
      const page = await api<{ results: { id: number; name: string }[] }>("GET", "/developer/?limit=500");
      for (const d of page.results ?? []) if (d?.name && d.id) byKey.set(devKey(d.name), d.id);
    } catch (e) {
      console.warn(`[hotdesk] developer list unavailable: ${e instanceof Error ? e.message : String(e)}`);
    }
    developerCache = { at: Date.now(), byKey };
  }
  const { byKey } = developerCache;
  const ours = getEnumLabel(DEVELOPER_OPTIONS, placesDeveloper) || placesDeveloper;
  return byKey.get(devKey(ours)) ?? byKey.get(devKey(placesDeveloper)) ?? byKey.get(devKey(ours.split(/[—–-]\s/)[0])) ?? null;
}

const idOf = (v: number | { id: number } | undefined) => (typeof v === "object" && v ? v.id : v);

// Our office on Hotdesk: by the saved id (checked to really be ours), else by
// the "#<id>" at the end of its title. Null when it isn't there yet.
async function findOnHotdesk(placesId: number, savedId?: number | null): Promise<HdListing | null> {
  if (!userId) await login();
  if (savedId) {
    try {
      const l = await api<HdListing>("GET", `/listing/${savedId}/`);
      if (titleIsOurs(l.title, placesId) && (l.owner ?? []).includes(userId!)) return l;
    } catch (e) {
      if (!(e instanceof HotdeskError) || e.status !== 404) throw e;
    }
  }
  const page = await api<{ results: HdListing[] }>(
    "GET",
    `/listing/?owner=${userId}&title__icontains=${encodeURIComponent(`#${placesId}`)}&limit=20`,
  );
  const hit = page.results.find((l) => titleIsOurs(l.title, placesId));
  return hit ? api<HdListing>("GET", `/listing/${hit.id}/`) : null;
}

async function uploadPhotos(hotdeskId: number, urls: string[]): Promise<void> {
  const form = new FormData();
  let n = 0;
  for (const url of urls.slice(0, MAX_PHOTOS)) {
    // Fall back to the original upload if the 1600px copy doesn't exist.
    let res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }).catch(() => null);
    if (!res?.ok) {
      const original = url.replace(/\.w1600\.webp$/, "");
      if (original !== url) {
        const candidates = [".jpg", ".jpeg", ".png", ".webp"].map((ext) => original + ext);
        for (const c of candidates) {
          res = await fetch(c, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }).catch(() => null);
          if (res?.ok) break;
        }
      }
    }
    if (!res?.ok) continue;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) continue;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_PHOTO_BYTES) continue;
    n += 1;
    const ext = type.includes("webp") ? "webp" : type.includes("png") ? "png" : "jpg";
    form.append(`image${n}`, new Blob([buf], { type }), `photo-${n}.${ext}`);
  }
  if (n > 0) await api("PUT", `/listing/${hotdeskId}/image_update/`, form);
}

// ── Sync ───────────────────────────────────────────────────────────────────

export type SyncAction = "created" | "updated" | "unchanged" | "hidden" | "skipped";
export type SyncResult = { action: SyncAction; hotdeskId: number | null; status?: number; notes: string[]; dryRun?: true };

async function loadListing(id: number): Promise<ListingRow | null> {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as ListingRow) ?? null;
}

/**
 * Brings Hotdesk in line with one PLACES listing.
 *   persist: save the Hotdesk id into listings.hotdesk_listing_id (off for
 *            tests, so they never write to our database).
 *   dryRun:  only read from Hotdesk and report what would change.
 * Each office carries a fingerprint of what we last sent (metaData.placesHash),
 * so an office whose listing hasn't changed costs one read and no writes.
 */
export async function syncOne(
  placesId: number,
  opts: { persist: boolean; dryRun?: boolean; /** Tests only: pretend the listing has these values. */ testOverrides?: Partial<ListingRow> },
): Promise<SyncResult> {
  const dry = opts.dryRun === true;
  const out = (r: SyncResult): SyncResult => (dry ? { ...r, dryRun: true } : r);
  const notes: string[] = [];
  const loaded = await loadListing(placesId);
  const row = loaded && opts.testOverrides ? { ...loaded, ...opts.testOverrides } : loaded;
  const existing = await findOnHotdesk(placesId, row?.hotdesk_listing_id);

  // Not for Hotdesk (sale, test, deleted): hide it there if it's still showing.
  if (!row || !isHotdeskEligible(row)) {
    if (!existing) return out({ action: "skipped", hotdeskId: null, notes: ["not a rent listing; nothing on Hotdesk"] });
    if (existing.status === STATUS.inactive) return out({ action: "unchanged", hotdeskId: existing.id, status: existing.status, notes: ["already Inactive on Hotdesk"] });
    if (!dry) await api("PUT", `/listing/${existing.id}/`, { status: STATUS.inactive });
    return out({ action: "hidden", hotdeskId: existing.id, status: STATUS.inactive, notes: ["set to Inactive on Hotdesk"] });
  }

  const p = toHotdeskListing(row);
  const problems = hotdeskWarnings(p);
  if (!p.workspace_title || !p.rules.price.month) {
    return out({ action: "skipped", hotdeskId: existing?.id ?? null, notes: problems });
  }
  const ws = (await ourWorkspaces()).get(p.workspace_title);
  if (!ws) return out({ action: "skipped", hotdeskId: existing?.id ?? null, notes: [`workspace "${p.workspace_title}" not found on Hotdesk`] });

  const ourRules = {
    currency: p.rules.currency,
    price: { month: p.rules.price.month },
    area: p.rules.area,
    areaUnit: p.rules.areaUnit,
    capacity: p.rules.capacity,
    quantity: p.rules.quantity,
    workingHours: p.rules.workingHours,
  };
  const postalCode = ws.metaData?.detailedLocation?.postalCode;
  const location = (prev: Record<string, any> | undefined) => ({
    ...(prev ?? {}),
    address: p.rules.address,
    area: p.rules.area_name ?? prev?.area ?? "",
    buildingName: p.rules.building,
    streetName: p.rules.street,
    postalCode: postalCode || prev?.postalCode || "00000",
  });
  const developer = await hotdeskDeveloperId(row.developer);
  const common = {
    title: p.title,
    type: OFFICE_ROOM_TYPE,
    quickBooking: false,
    ...(p.finishingType ? { finishingType: p.finishingType } : {}),
    ...(developer ? { developer } : {}),
    descriptions: { en: p.description },
  };
  const placesHash = createHash("sha1")
    .update(JSON.stringify([common, ourRules, p.rules.address, p.rules.area_name, p.rules.building, p.rules.street, postalCode, ws.id, p.photos]))
    .digest("hex");
  const ourMeta = { placesListingId: row.id, placesUrl: p.places_url, placesPhotos: p.photos, placesHash };
  const want = p.availability.status === "rented" ? STATUS.rented : STATUS.active;
  if (problems.length) notes.push(`data to improve: ${problems.join(", ")}`);

  if (dry) {
    if (!existing) return out({ action: "created", hotdeskId: null, status: STATUS.inactive, notes: ["new office (arrives Inactive, waiting for Hotdesk approval)", ...notes] });
    const same = existing.metaData?.placesHash === placesHash && idOf(existing.workspace) === ws.id;
    const statusNote =
      existing.status === STATUS.inactive ? ["waiting for Hotdesk approval (Inactive)"]
      : existing.status !== want ? [want === STATUS.rented ? "would mark Rented" : "would mark Active"]
      : [];
    if (existing.status !== STATUS.inactive && want === STATUS.active && existing.availableFrom) statusNote.push("would clear available-again date");
    return out({ action: same && !statusNote.some((n) => n.startsWith("would")) ? "unchanged" : "updated", hotdeskId: existing.id, status: existing.status, notes: [...(same ? [] : ["details changed"]), ...statusNote, ...notes] });
  }

  let hotdeskId: number;
  let current: HdListing;
  let action: SyncAction;
  if (!existing) {
    const created = await api<HdListing>("POST", "/listing/", {
      ...common,
      workspace: ws.id,
      city: idOf(ws.city),
      metaData: ourMeta,
      rules: { ...ourRules, images: {}, detailedLocation: location(undefined), description: p.description },
    });
    hotdeskId = created.id;
    action = "created";
    if (p.photos.length) await uploadPhotos(hotdeskId, p.photos);
    current = await api<HdListing>("GET", `/listing/${hotdeskId}/`);
  } else if (existing.metaData?.placesHash === placesHash && idOf(existing.workspace) === ws.id) {
    hotdeskId = existing.id;
    action = "unchanged";
    current = existing;
  } else {
    hotdeskId = existing.id;
    action = "updated";
    // rules is replaced whole on Hotdesk, so start from what they have.
    const rules = { ...(existing.rules ?? {}), ...ourRules, detailedLocation: location(existing.rules?.detailedLocation), description: p.description };
    const body: Record<string, unknown> = { ...common, rules, metaData: { ...(existing.metaData ?? {}), ...ourMeta } };
    if (idOf(existing.workspace) !== ws.id) {
      body.workspace = ws.id;
      body.city = idOf(ws.city);
      notes.push(`moved to ${ws.title}`);
    }
    // Photos: only re-upload when our first four changed.
    const before = JSON.stringify(existing.metaData?.placesPhotos ?? null);
    await api("PUT", `/listing/${hotdeskId}/`, body);
    if (before !== JSON.stringify(p.photos)) {
      await uploadPhotos(hotdeskId, p.photos);
      notes.push("photos updated");
    }
    current = await api<HdListing>("GET", `/listing/${hotdeskId}/`);
  }

  // Rented ↔ available, only while Hotdesk has the office live (1 or 3).
  // An available office also loses any "available again" date left by
  // Hotdesk's Rented popup, so its page doesn't say "Available from <date>".
  let status = current.status;
  if (status === STATUS.inactive) {
    notes.push("waiting for Hotdesk approval (Inactive)");
  } else {
    const change: Record<string, unknown> = {};
    if (status !== want) change.status = want;
    if (want === STATUS.active && current.availableFrom) change.availableFrom = null;
    if (Object.keys(change).length) {
      await api("PUT", `/listing/${hotdeskId}/`, change);
      if (change.status) notes.push(want === STATUS.rented ? "marked Rented on Hotdesk" : "marked Active on Hotdesk");
      if ("availableFrom" in change) notes.push("cleared available-again date");
      status = want;
      if (action === "unchanged") action = "updated";
    }
  }

  if (opts.persist && row.hotdesk_listing_id !== hotdeskId && supabaseAdmin) {
    const { error } = await supabaseAdmin.from("listings").update({ hotdesk_listing_id: hotdeskId }).eq("id", placesId);
    if (error) notes.push(`could not save Hotdesk id: ${error.message}`);
  }
  return { action, hotdeskId, status, notes };
}

// One sync at a time (admin saves and the full check share this line);
// repeated saves of the same listing while it waits are merged.
let chain: Promise<unknown> = Promise.resolve();
const waiting = new Set<number>();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn);
  chain = run.catch(() => undefined);
  return run;
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 300);

function enqueue(placesId: number): void {
  if (waiting.has(placesId)) return;
  waiting.add(placesId);
  serial(async () => {
    waiting.delete(placesId);
    const r = await syncOne(placesId, { persist: true });
    console.log(`[hotdesk] #${placesId} ${r.action}${r.hotdeskId ? ` → ${r.hotdeskId}` : ""}${r.notes.length ? ` (${r.notes.join("; ")})` : ""}`);
  }).catch((e) => {
    waiting.delete(placesId);
    console.warn(`[hotdesk] #${placesId} sync failed: ${errText(e)}`);
  });
}

// Called after every admin create/update/delete. Never throws and never
// blocks the admin save that triggered it.
export function syncListingToHotdesk(
  listing: ListingRow | null,
  id: number,
  reason: "created" | "updated" | "deleted",
): void {
  try {
    const mode = hotdeskMode();
    if (mode === "off") return;
    if (mode === "preview") {
      const action = listing && isHotdeskEligible(listing) ? "upsert" : "remove";
      const payload = action === "upsert" && listing ? toHotdeskListing(listing) : { id };
      console.log(`[hotdesk:preview] ${reason} #${id} -> ${action}`, JSON.stringify(payload).slice(0, 500));
      return;
    }
    enqueue(id);
  } catch (e) {
    console.warn(`[hotdesk] #${id} not queued: ${errText(e)}`);
  }
}

// ── Full check (first send + nightly) ──────────────────────────────────────
// Walks every rent listing plus every office we already have on Hotdesk, so
// it also catches saves that failed while Hotdesk was down and offices whose
// listing was deleted. Runs in the background, one listing at a time, a short
// pause between each; stops by itself after repeated failures.

const PAUSE_MS = 400;
const MAX_FAILS_IN_A_ROW = 5;

export type SweepReport = {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string | null;
  total: number;
  done: number;
  counts: Record<SyncAction | "failed", number>;
  stoppedEarly: string | null;
  failures: { id: number; error: string }[];
  /** Listings Hotdesk can't take yet and why (missing price, location, ...). */
  skipped: { id: number; why: string }[];
};

let sweep: SweepReport | null = null;
let sweepRunning = false;

export const lastSweep = () => sweep;
export const sweepIsRunning = () => sweepRunning;

// Our offices on Hotdesk by PLACES id (read from the "#<id>" title suffix).
async function ourOfficesByPlacesId(): Promise<Map<number, number>> {
  if (!userId) await login();
  const base = new URL(apiBase()!);
  const found = new Map<number, number>();
  let path: string | null = `/listing/?owner=${userId}&limit=100`;
  for (let page = 0; path && page < 100; page++) {
    const r: { results: HdListing[]; next?: string | null } = await api("GET", path);
    for (const l of r.results) {
      const m = /#(\d+)\s*$/.exec(l.title ?? "");
      if (m && titleIsOurs(l.title, Number(m[1]))) found.set(Number(m[1]), l.id);
    }
    const next: URL | null = r.next ? new URL(r.next, base) : null;
    path = next && next.host === base.host ? next.pathname + next.search : null;
  }
  return found;
}

async function rentListingIds(): Promise<number[]> {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const ids: number[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("listings")
      .select("id, transaction_type, is_test")
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error) throw error;
    ids.push(...(data as ListingRow[]).filter(isHotdeskEligible).map((l) => l.id));
    if (data.length < 1000) break;
  }
  return ids;
}

/**
 * Starts a full check in the background. Returns false if one is already
 * running. Writes to Hotdesk only when dryRun is false AND the mode is live.
 * `onlyIds` limits the check to some listings and `persist: false` skips
 * saving Hotdesk ids (both for tests only).
 */
export function startSweep(opts: { dryRun: boolean; onlyIds?: number[]; persist?: boolean }): boolean {
  if (sweepRunning) return false;
  const dryRun = opts.dryRun || hotdeskMode() !== "live";
  sweepRunning = true;
  const report: SweepReport = {
    dryRun,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    total: 0,
    done: 0,
    counts: { created: 0, updated: 0, unchanged: 0, hidden: 0, skipped: 0, failed: 0 },
    stoppedEarly: null,
    failures: [],
    skipped: [],
  };
  sweep = report;
  void (async () => {
    try {
      const onHotdesk = await ourOfficesByPlacesId();
      const ids = opts.onlyIds?.length
        ? opts.onlyIds
        : Array.from(new Set([...(await rentListingIds()), ...Array.from(onHotdesk.keys())])).sort((a, b) => a - b);
      report.total = ids.length;
      let failsInARow = 0;
      for (const id of ids) {
        try {
          const r = await serial(() => syncOne(id, { persist: !dryRun && opts.persist !== false, dryRun }));
          report.counts[r.action] += 1;
          if (r.action === "skipped" && onHotdesk.has(id) === false && !r.notes[0]?.startsWith("not a rent")) {
            report.skipped.push({ id, why: r.notes.join(", ") });
          }
          if (!dryRun && r.action !== "unchanged" && r.action !== "skipped") {
            console.log(`[hotdesk:check] #${id} ${r.action}${r.hotdeskId ? ` → ${r.hotdeskId}` : ""}${r.notes.length ? ` (${r.notes.join("; ")})` : ""}`);
          }
          failsInARow = 0;
        } catch (e) {
          report.counts.failed += 1;
          report.failures.push({ id, error: errText(e) });
          console.warn(`[hotdesk:check] #${id} failed: ${errText(e)}`);
          if (++failsInARow >= MAX_FAILS_IN_A_ROW) {
            report.stoppedEarly = `${MAX_FAILS_IN_A_ROW} failures in a row; Hotdesk may be down. The next check picks up the rest.`;
            break;
          }
        }
        report.done += 1;
        await new Promise((r) => setTimeout(r, PAUSE_MS));
      }
    } catch (e) {
      report.stoppedEarly = `could not start: ${errText(e)}`;
    } finally {
      report.finishedAt = new Date().toISOString();
      sweepRunning = false;
      const c = report.counts;
      console.log(
        `[hotdesk:check] ${dryRun ? "dry run " : ""}done ${report.done}/${report.total}: ${c.created} new, ${c.updated} updated, ${c.unchanged} unchanged, ${c.hidden} hidden, ${c.skipped} skipped, ${c.failed} failed${report.stoppedEarly ? ` (stopped: ${report.stoppedEarly})` : ""}`,
      );
    }
  })();
  return true;
}
