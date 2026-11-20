# Testing a branch locally before it goes live

The live site deploys from `main`. A branch only reaches visitors when its pull
request is merged. Test locally first with the steps below.

> **Important: your local copy talks to the REAL database.** There is only one
> Supabase project, so anything you *save* in the local admin (listings, the
> exchange rate) changes the live site too. Reading pages is safe. To test the
> admin form, edit only a listing marked **Test** (`is_test`), which is hidden
> from visitors, or create a new one with the Test box ticked.
> For a fully separate copy, create a Supabase branch or second project, then
> put its URL and keys in `.env` instead.

## 1. Get the branch

```bash
git clone https://github.com/sarahislam1711/places-egy.git
cd places-egy
git fetch origin pull/2/head:seo-leads-fixes-2026-11
git switch seo-leads-fixes-2026-11
npm ci
```

## 2. `.env` (never commit it)

Copy the values from Railway → Variables. For local testing **leave out** the
ones that send emails or sync to other systems:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
WORDPRESS_API_URL=https://cms.places-egy.com/wp-json/wp/v2
ADMIN_PASSWORD=<any local password>
PORT=3001
# Leave these OUT locally:
# RESEND_API_KEY      -> no real emails (lead forms still save to the leads table!)
# HOTDESK_SYNC_MODE   -> stays "off"
# CRON_TOKEN          -> weekly report can't be triggered by accident
```

The lead forms still save to the real `leads` table. If you submit one, use a
name like "TEST – please ignore" and delete it in Dashboard → Leads.

## 3. Database migration (once, before testing this branch)

Run `sql/listings-outdoor-and-fx.sql` in Supabase → SQL editor. It only **adds**
columns and a table, so the live site keeps working unchanged. The branch
needs it, because the new code reads those columns.

## 4. Build and run

```bash
npm run build
npm start
```

Open http://localhost:3001

## 5. What to check

**Redirects (should 301 to a live page)**
- `/ar/blog/office-investment-yield-new-cairo`
- `/blog/where-to-buy-office-cairo-guide`
- `/developers/palm-hills-1`

**Pricing rules (agreed 19 Nov)**: price = indoor only; an extra area (outdoor, roof,
terrace or garden) is entered with its own size and price per m², freely, and shown
separately; budget filters/sorting use the total; maintenance applies to the extra
area too.

**Pages**
- `/` – no cookie banner from Egypt; one popup at a time.
- `/contact` – "Send us your requirements" form shows.
- Any Arabic blog post – green "ابعت طلبك على واتساب" box after the article.
- A USD listing – "≈ EGP … at <rate> (<date>)" under the price.
- `/listings` – the EGP/USD budget switch uses today's rate.

**Admin (`/dashboard`, local password; edit only a Test listing)**
- Add listing: Currency starts empty and Save stays disabled until it is chosen.
- Enter USD, 20250 price, 450 area, 45 per m²: the preview shows "20,250 USD / month ≈ EGP …".
- Switch the currency to EGP with "$45 / SQM" in the description: Save is blocked ("price is a USD amount saved as EGP").
- Enter EGP, 715000 price, 650 area, 1100 per m², extra area type Roof, 350 m²:
  Save is blocked until the roof price per m² is entered (0 if included).
- Enter 300 as the roof price per m²: the preview shows 715,000 (indoor) + roof 350 m² × 300 =
  105,000 → Total 820,000 / month.
- Enter the indoor + roof total as the price (e.g. 820,000): Save is blocked ("price includes the roof area").
- Exchange rate tab: shows the automatic rate and its time. (Setting a manual
  rate here changes it on the live site too.)

**Data reports (read-only)**
```bash
npx tsx --env-file=.env scripts/validate-listings.ts       # writes listing-data-issues.csv
npx tsx --env-file=.env scripts/fix-listing-prices.ts      # dry run: shows what it WOULD change
```

## 6. Going live

1. Run the migration (step 3) if it hasn't been run.
2. On GitHub, mark the pull request **Ready for review**, then merge it into `main`. Railway deploys.
3. After the deploy, apply the data fixes (writes to the database; a backup file is saved):
   `npx tsx --env-file=.env scripts/fix-listing-prices.ts --apply`
   To undo: `... --revert listing-prices-backup-<time>.json`
4. Fix the remaining "Must fix" listings in the admin (see the weekly report or the CSV).
