# Changelog

Reverse-chronological. Every entry answers "why", not just "what". Commit shas included for cross-reference.

---

## 2026-04-29

**4915543** — Mark www redirect done (item #3) — verified working via curl
`curl -sI https://www.patna-metro.com` returned HTTP 308 → `https://patna-metro.com/`. The redirect had been configured in Vercel domain settings (not `vercel.json`) at some point after the `vercel.json` rewrite was reverted (`a04b0eb`). Docs updated to reflect reality.

**4a00e84** — Mark iOS App Store submission done (item #1)
iOS submission confirmed by user. `open-items.md` and `strategy.md` updated.

**672c6aa** — Add session handoff docs and /start + /wrap skills
Set up the durable doc layer for cold-session pickup: `docs/CHANGELOG.md` (populated from full git history), `docs/open-items.md`, `docs/design-rationale.md`, `docs/strategy.md`. Also added `/start` and `/wrap` project-local skills adapted from smingle-stream.

---

## 2026-04-28

**24fbe15** — Commit untracked screenshot assets and gen scripts
Previously untracked work: three screenshot generation scripts (`gen-screenshots.mjs`, `gen-screenshots-ios.mjs`, `gen-screenshots-ipad.mjs`) and all Play Store / App Store mockup PNGs (Android, iOS, iPad sizes) were sitting untracked. Deleted test/preview files (`test-gilroy-*.png`, `svg-preview.html`, `metro-icon-preview.svg`) that were dev artefacts not part of the app.

---

## 2026-04-24

**136ac8f** — Clean /privacy URL (no .html extension)
Vercel rewrite already serves `public/privacy/index.html` at `/privacy` — the `.html` suffix was redundant and looked unprofessional in store listings.

**9f997ba** — Add privacy policy page
Required for Play Store submission. Served as a static HTML file at `public/privacy/index.html` rather than a React route — no JS needed for a static legal page.

**295552c / ad1785c** — Feature graphic final iterations
Final Play Store feature graphic (1024×500): train icon centred, no trailing full stop in tagline, elements properly aligned and spaced. Multiple iterations to get proportions right.

**b1cc83d** — Replace emoji with SVG train icon, redesign app icons
Emoji in feature graphic looked unprofessional at store scale. Custom SVG train icon created; app icons (192, 512) regenerated to match.

---

## 2026-04-23

**5d4f2af** — Switch icons to Gilroy Black
Helvetica Neue and Gilroy ExtraBold both failed to match the existing favicon.svg rendering. Gilroy Black was the actual weight used; font test PNGs confirmed the match.

**d70906a / a3ebe53 / 9c0cba0 / 6da1eca** — Feature graphic design iterations
Settled on layout: train SVG top-left, "Patna Metro" name + tagline, Play Store badge bottom-right. Earlier iterations had centering and text alignment issues.

**c2c09c3** — Add Digital Asset Links for Play Store TWA verification
`.well-known/assetlinks.json` is required for TWA (Trusted Web Activity) so the Play Store wrapper can verify it owns the domain. Wired into `vercel.json` with a 1-hour Cache-Control header.

**a04e90d** — Fix PWABuilder icon error + add narrow screenshot
PWABuilder complained about missing icon sizes. Play Store also requires at least one portrait/narrow screenshot.

**d8ac674** — Improve PWA manifest score for Play Store packaging
Several manifest fields (`id`, `display_override`, `dir`, `lang`, `categories`, `shortcuts`) added to reach the manifest quality threshold PWABuilder uses.

**2a045aa** — Add PNG icons to PWA manifest
Play Store TWA requires PNG icons; SVG-only manifests are rejected.

**78d0910** — Replace blank icons with proper M-logo icons
Vite scaffold shipped blank placeholder icons. Replaced with the Metro M-logo branded icons.

**2e30ef6** — Fix Hindi time display + add SEO to Planner page
`fmt()` was returning 12h strings correctly but the Planner page was concatenating raw HH:MM strings in Hindi mode. Also: Planner was the only page missing react-helmet-async meta tags.

**a04b0eb** — Revert www redirect from vercel.json
`www.*` → apex redirect in `vercel.json` caused a redirect loop (Vercel's own www handling conflicted). Reverted to apex-only.

**6cd9f34** — Fix www redirect + add sitemap lastmod dates
Attempted www redirect (later reverted). Added `<lastmod>` dates to sitemap.xml for Google Search Console.

---

## 2026-04-22

**59daef8** — Add favicon.ico + PNG icon link tags
Google Search requires `favicon.ico` at the root to show a favicon in search results. Added both the .ico file and explicit `<link rel="icon" type="image/png">` tags.

**269bc6f** — Add structured data for Google search thumbnail
`image`, `logo`, and `WebSite` schema.org types added inline so Google can pick up a thumbnail image for search results.

**7bd40de** — Fix Terminals layout on Schedule page
The ↔ arrow between terminal station names was off-centre when names were long. Fixed with explicit `grid-cols-[1fr_auto_1fr]`.

**d7dd87f** — Fix Schedule frequency Hindi translation + layout
`peakFrequency` and `offPeakFrequency` strings in `SCHEDULE` data were English-only; the Schedule page's Hindi mode showed raw English strings. Peak hours row layout was also broken on narrow screens.

**b11ad25** — Per-route overscroll colour
iOS elastic overscroll reveals the background colour behind the page. Each page now sets a `<main>` bg that matches its top colour (metro-blue for Home and Schedule, slate-50 for others) so the overscroll flash is always on-brand.

**e5ac73b** — iOS overscroll white flash fix (global)
Root-level fix: `h-dvh` on the app shell so the white body background is never exposed. `b11ad25` was the targeted per-route follow-up.

**3f07a72** — Metro Map: switch to SVG viewBox zoom
CSS `transform: scale()` zoom was blurring the SVG at high zoom levels because it was rasterising at screen resolution. Switched to viewBox manipulation — the SVG re-renders as crisp vectors at every zoom level.

**393c8a8** — iOS overscroll white flash on Schedule (targeted)
Schedule's blue hero was clipped by overscroll. Fixed by ensuring the bg extends behind the safe-area inset.

**5f03f15** — Metro Map redesign
Previous map was a flat SVG with no interaction. Redesigned with: card layout with legend strip, pinch-to-zoom + drag-to-pan (native touch listeners, `passive: false`), mouse drag for desktop, station detail drawer on tap, Reset button when zoomed.

**b2da11e / b6e4de4** — Station select chevron
Native `<select>` arrows are inconsistent across browsers/OS. Removed native arrows, added a custom chevron with proper breathing room.

**622cbb6** — Replace Vite favicon with Metro M icon
The default Vite favicon was still showing. Replaced with the Metro M-logo SVG.

**667962c** — hreflang tags + dynamic `<html lang>`
Added `<link rel="alternate" hreflang="en-IN|hi|x-default">` on every page. `<html lang>` attribute now switches dynamically with the EN/HI toggle via react-helmet-async.

---

## 2026-04-21

**7cd2e9a** — Add OG image for social media previews
Without an OG image, WhatsApp/Twitter link previews show a blank card. Added `og:image` and `twitter:image` meta tags.

**9498537** — Fix bottom nav bar hidden on mobile
Nav bar was being cut off by the iOS home indicator area. Fixed with `h-dvh` (dynamic viewport height) and `viewport-fit=cover` in the HTML meta viewport tag.

**34afb92** — Per-page SEO meta tags
react-helmet-async added to all 5 pages: `<title>`, `<meta name="description">`, `<link rel="canonical">`.

**422c183** — Fix SPA routing for Vercel
Without a catch-all rewrite, direct navigation to `/planner`, `/map` etc. returned a 404. Vercel's `rewrites` in `vercel.json` now serves `index.html` for all routes.

---

## 2026-04-20

**7cc149c** — Add PWA service worker
`vite-plugin-pwa` added with `registerType: 'autoUpdate'`. Navigation requests use NetworkFirst (3s timeout) so users get fresh content when online and fall back to cache when offline.

**9736b5c** — Initial commit — Patna Metro PWA
Full app from scratch: React 19 + Vite 5, React Router v7, Tailwind CSS. Five pages (Home, Planner, Map, Schedule, Stations), bilingual EN/HI, BFS route finder, fare slabs, train time utilities, station data for both lines (26 stations).
