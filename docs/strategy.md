# Strategy

Locked positions on distribution, SEO, and data. Update here when a strategic decision changes.

---

## Distribution

**Live web:** `patna-metro.com` via Vercel. Auto-deploys on push to `main`. SPA routing handled by `vercel.json` catch-all rewrite.

**Play Store:** TWA wrapper built with PWABuilder. Digital Asset Links at `.well-known/assetlinks.json` verify domain ownership. Any code push to `main` is instantly live in the TWA with no app store update required.

**App Store (iOS):** Screenshots generated (iOS + iPad sizes in `public/screenshots/`). Submission status: not confirmed in git history as of 2026-04-28. PWABuilder iOS export is the expected packaging path.

**Decision: web-first, no native code.** The app is a website. Native app distribution is just a shell around the same URL. This means all feature work ships once and reaches all platforms simultaneously. If native capabilities (push notifications, background location) are ever needed, this decision would need revisiting.

---

## SEO

**Target keywords:** "Patna Metro [route planner / fare / schedule / map / stations]" — high-intent, low-competition.

**Implementation:**
- `react-helmet-async` for per-page `<title>`, `<meta name="description">`, `<link rel="canonical">`
- hreflang alternates (`en-IN`, `hi`, `x-default`) on all pages
- `<html lang>` switches dynamically with the language toggle
- Schema.org structured data (`WebSite`, `image`, `logo`) for Google search thumbnail
- `sitemap.xml` with lastmod dates at `/sitemap.xml`
- `robots.txt` at `/robots.txt`

**Canonical domain:** `patna-metro.com` (apex, no www). Canonical tags point to `https://patna-metro.com/[path]`.

**www handling:** `www.patna-metro.com` redirect is unresolved (see open-item #3). Needs to be set in Vercel domain settings, not `vercel.json`.

---

## Data freshness

**Station operational status:** Updated manually in `src/data/stations.js` when PMRC officially opens a station. Currently only Bhootnath, Zero Mile, New ISBT (Blue Line partial) are `operational: true`.

**Fares:** Based on official PMRC fare chart. Four slabs: ₹15/14, ₹20/18, ₹30/27, ₹50/45 (token/smart card). Update if PMRC revises fares.

**Schedule:** Hardcoded in `SCHEDULE` constant (`stations.js`). Weekdays 06:00–22:00, Weekends 06:30–21:30. Indicative only — PMRC has no public API. The Schedule page shows a disclaimer.

**No backend, no CMS.** All data changes require a code commit + Vercel deploy. This is intentional — see design-rationale.md.

---

## Language support

EN and HI (Hindi) are the two supported languages. Toggled client-side via `LanguageContext`. No third language is planned.

All user-facing strings are translated in both languages. Adding a language would require touching every component's `T` object — at that scale, migrating to an i18n library should be considered first.
