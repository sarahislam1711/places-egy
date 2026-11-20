import { z } from "zod";
import { cleanListingTitle } from "../client/src/lib/listing-text";

// Whitelist of columns the admin API is allowed to write. Anything not in this
// schema is silently dropped — prevents mass-assignment via req.body.
//
// Keep in sync with the `Listing` type in client/src/lib/supabase.ts. The DB
// owns the `id` column; we never accept it from the client.
const listingFields = z
  .object({
    title: z.string().max(300).transform(cleanListingTitle).pipe(z.string().min(1)),
    property_type: z.string().max(100).optional(),
    subtype: z.string().max(100).optional(),
    developer: z.string().max(200).optional(),
    project: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    location_area: z.string().max(200).optional(),
    // Numeric fields accept null: the admin form sends null for any number
    // input left blank (an unfilled stat is omitted, not stored as 0). Title is
    // the only hard-required field server-side; price is enforced as required
    // by the dashboard's save-button gate, kept optional here so legacy rows
    // without a price can still be edited.
    price: z.number().finite().nonnegative().nullable().optional(),
    // USD or EGP; required on create (see listingInsertSchema). The dashboard
    // no longer pre-selects one, so a USD price can't be saved as EGP by default.
    currency: z
      .preprocess((v) => (typeof v === "string" ? v.trim().toUpperCase() || undefined : v ?? undefined), z.enum(["EGP", "USD"]))
      .optional(),
    area_sqm: z.number().finite().nonnegative().nullable().optional(),
    transaction_type: z.string().max(50).optional(),
    furnishing: z.string().max(50).optional(),
    description: z.string().max(20000).optional(),
    images: z.array(z.string().url().max(2000)).max(50).optional(),
    delivery_date: z.string().max(50).optional(),
    parking: z.number().int().nonnegative().nullable().optional(),
    price_per_meter: z.number().finite().nonnegative().nullable().optional(),
    // Terrace/roof/outdoor space, kept apart from area_sqm (the unit itself).
    outdoor_area_sqm: z.number().finite().nonnegative().nullable().optional(),
    outdoor_price_per_meter: z.number().finite().nonnegative().nullable().optional(),
    outdoor_area_type: z.enum(["outdoor", "roof", "terrace", "garden"]).nullable().optional(),
    // Price quoted as one total (e.g. a whole building), not rate × area.
    price_is_lump_sum: z.boolean().optional(),
    maintenance_fees: z.number().finite().nonnegative().nullable().optional(),
    maintenance_status: z.string().max(50).optional(),
    floor: z.number().int().nullable().optional(),
    // Cairo pin-drop coordinates (WGS84). Optional — legacy listings without
    // pins render as list-only, not on the map. Ranges gently constrained so
    // an obviously-broken value (e.g. accidental 0,0 in the Gulf of Guinea)
    // trips validation instead of silently landing a pin at the wrong spot.
    latitude: z.number().finite().min(-90).max(90).nullable().optional(),
    longitude: z.number().finite().min(-180).max(180).nullable().optional(),
    // Admin-only "test" flag. True = hidden from public listings endpoints,
    // sitemap, and prerendered meta (noindex emitted on detail page). Lets
    // us test in production without triggering soft-404s in GSC on delete.
    is_test: z.boolean().optional().default(false),
    // Rented listings stay visible with a badge; rental_end null = "date to be confirmed".
    rental_status: z.enum(["available", "rented"]).optional(),
    rental_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    rental_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  })
  .strict();

const rentalDatesInOrder = (l: { rental_start?: string | null; rental_end?: string | null }) =>
  !l.rental_end || !l.rental_start || l.rental_end >= l.rental_start;
const rentalDatesMessage = { message: "Available-from date must be after the rented date" };

export const listingInsertSchema = listingFields
  .refine(rentalDatesInOrder, rentalDatesMessage)
  .refine((l) => l.currency === "EGP" || l.currency === "USD", { message: "Choose the currency the price is quoted in" });

// Updates use the same shape but every field is optional. `.strict()` still
// rejects unknown keys.
export const listingUpdateSchema = listingFields.partial().refine(rentalDatesInOrder, rentalDatesMessage);
