-- Optional street and building name per listing.
-- Shown on the listing page only; sent to Hotdesk ("none" when empty).
-- Safe to run more than once. Undo: ALTER TABLE listings DROP COLUMN street_name, DROP COLUMN building_name;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS street_name text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS building_name text;
