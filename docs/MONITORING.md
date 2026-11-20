# Monitoring: how we know when something breaks

| Layer | What it catches | Where | Alert goes to |
|---|---|---|---|
| `GET /api/health` | database down, exchange rate stuck or on fallback, CMS unreachable | `server/health.ts` | polled by the uptime monitor below |
| Server error e-mails | any 5xx response, unhandled promise rejection, uncaught exception (max 1 e-mail/hour per problem) | `server/alerts.ts` | `ALERT_EMAILS` or admin@ + mohamed.safwat@ |
| CI build | a pull request that does not build | `.github/workflows/ci.yml` | GitHub (red check on the PR) |
| Live health (every 6 h and after each push) | pages not loading, JS errors, broken images, missing title/H1/canonical, duplicate structured data | `.github/workflows/live-health.yml` | failed-run e-mail + a GitHub issue labelled `monitoring` |
| GA4 custom insights | traffic or lead drops, event stops firing | GA4 admin | GA e-mail |
| Search Console | indexing, coverage, manual actions | search.google.com | Search Console e-mail |

## One-time setup (not in code)

1. **Uptime monitor** (UptimeRobot free, or Better Stack): HTTP monitor on
   `https://places-egy.com/api/health`, every 5 minutes, alert e-mail to the two
   team addresses. Add a keyword monitor on `https://places-egy.com/` for "PLACES".
2. **GitHub:** in the repo, Watch → Custom → Actions + Issues, so a failed run reaches you.
   Create the label `monitoring` (the workflow creates the issue even if the label is
   missing only after you add it once).
3. **Railway:** Settings → Healthcheck path `/api/health`; enable deploy-failure notifications.
4. **Cron jobs** (cron-job.org): turn on "notify on failure" for the weekly report,
   nurture follow-ups and favourites digest jobs. A silent cron failure is the easiest thing to miss.
5. **Optional:** Sentry (free tier) for browser-side JavaScript errors.

## Reading a failure

- `/api/health` returns `503` and names the failing part (`database`, `exchangeRate`, `cms`).
- A failing Live health run lists each failing page and why; re-run locally with
  `node scripts/page-health.mjs`.
