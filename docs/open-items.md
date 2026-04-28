# Open Items

Pending work, deferred decisions, and known gaps. Each item has a number for cross-referencing with CHANGELOG.

---

## Status snapshot (as of 2026-04-29)

- ✅ Core app shipped (all 5 pages, bilingual, route planner, map, schedule, stations)
- ✅ PWA + offline support
- ✅ SEO (meta, OG, structured data, sitemap, hreflang)
- ✅ Play Store TWA packaging + Digital Asset Links
- ✅ Privacy policy
- ✅ Screenshot assets for store listings (Android, iOS, iPad)
- ✅ iOS App Store submission (#1) — submitted 2026-04-29
- ⏳ Station data updates when new stations open (#2)
- ✅ www redirect (#3) — working via Vercel domain settings (308 confirmed)
- ⏳ Real-time train data (#4) — currently all schedule data is static/indicative

---

## Pending items

### ✅ #1 — iOS App Store submission — DONE 2026-04-29 (4a00e84)
iOS screenshots generated (`public/screenshots/ios/`, `public/screenshots/ipad/`) and submitted to App Store Connect.

### #2 — Station data updates when new stations open
All Red Line stations (S01–S14) and Blue Line S15–S23 are marked `operational: false` in `stations.js`. When PMRC officially opens additional stations, update the `operational` flag and verify fare slabs still match the official PMRC chart. Also check that the route planner correctly handles newly-operational segments.

### ✅ #3 — www redirect — DONE (verified 2026-04-29, 4915543)
`https://www.patna-metro.com` returns HTTP 308 → `https://patna-metro.com/` via Vercel domain settings. The `vercel.json` rewrite approach was reverted (`a04b0eb`) but the domain-level redirect was configured separately and is working correctly.

### #4 — Real-time train data
Current schedule is hardcoded and indicative (`SCHEDULE` in `stations.js`). PMRC does not appear to have a public API. If an official API or data feed becomes available, the Schedule and Planner pages should switch to live data. Until then, the disclaimer ("Schedule is indicative…") on the Schedule page covers this.

### #5 — Dark mode
No dark mode support currently. Tailwind's `dark:` utilities are available but unused. Low priority while the app is primarily used on mobile (most users won't notice), but worth adding if user feedback surfaces it.
