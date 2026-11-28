-- Arabic text for listings (Arabic site, 29 Nov 2026).
-- One listing, two languages: photos, price, size, status etc. stay shared;
-- only the Arabic title and description are added to the same row.
-- Safe to run more than once. Run in Supabase → SQL Editor → New query → Run.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_ar text;

-- 'auto'   = machine-translated from the English description (re-translated
--            automatically when the English description changes)
-- 'edited' = corrected by the team in the admin; never overwritten
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_ar_source text;

-- When the Arabic description was last written (auto or by hand).
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_ar_updated_at timestamptz;
