-- Price-integrity fields + live exchange rate (2026-11-19).
--
-- Additive only: nullable columns and a new table. The current live code
-- ignores them, so this is safe to run before the new code is deployed —
-- and it MUST be run before (the new code reads these columns).
--
-- Run in the Supabase SQL editor as project owner.

-- 1. Listings: an extra area (outdoor/roof/terrace/garden) kept apart from the unit's own area, and
--    a flag for prices quoted as one total (whole buildings) rather than
--    rate × area. Example the old schema couldn't hold: #855, 650 m² indoor
--    + 350 m² outdoor, where the outdoor figure ended up in area_sqm.
--    The extra area has a type (outdoor / roof / terrace / garden) and its own
--    price per m², entered freely per listing.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS outdoor_area_sqm numeric,
  ADD COLUMN IF NOT EXISTS outdoor_price_per_meter numeric,
  ADD COLUMN IF NOT EXISTS outdoor_area_type text,
  ADD COLUMN IF NOT EXISTS price_is_lump_sum boolean NOT NULL DEFAULT false;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_outdoor_area_type_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_outdoor_area_type_check
  CHECK (outdoor_area_type IS NULL OR outdoor_area_type IN ('outdoor', 'roof', 'terrace', 'garden'));

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_outdoor_nonneg_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_outdoor_nonneg_check
  CHECK ((outdoor_area_sqm IS NULL OR outdoor_area_sqm >= 0)
     AND (outdoor_price_per_meter IS NULL OR outdoor_price_per_meter >= 0));

-- Currency is USD or EGP (NULL stays allowed for legacy rows; the admin form
-- now requires a choice on every save). NOT VALID: applies to new writes
-- without failing on any odd legacy value; find those with
--   SELECT id, currency FROM listings WHERE currency NOT IN ('EGP','USD');
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_currency_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_currency_check
  CHECK (currency IS NULL OR currency IN ('EGP', 'USD')) NOT VALID;

-- 2. Exchange rate: one row per pair. The server refreshes auto_rate daily
--    from a public rate API; manual_rate, when set by the admin, wins until
--    cleared. Prices are never converted in the database — this rate is only
--    used to show "≈ EGP" and to filter/sort across currencies.
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  pair            text PRIMARY KEY,               -- 'USD_EGP'
  auto_rate       numeric CHECK (auto_rate IS NULL OR auto_rate > 0),
  auto_source     text,
  auto_fetched_at timestamptz,
  manual_rate     numeric CHECK (manual_rate IS NULL OR manual_rate > 0),
  manual_set_at   timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.exchange_rates (pair, auto_rate, auto_source, auto_fetched_at)
VALUES ('USD_EGP', 56.09, 'initial value (2026-10-28 constant)', NULL)
ON CONFLICT (pair) DO NOTHING;

-- Server-only table (service role). Visitors get the rate from /api/fx/usd-egp.
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.exchange_rates FROM anon;
REVOKE ALL ON public.exchange_rates FROM authenticated;
