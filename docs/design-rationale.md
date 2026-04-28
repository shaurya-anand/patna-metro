# Design Rationale

Architectural decisions and the reasoning behind them. Update when a decision is revisited or reversed.

---

## Static data, no backend

All station data, fares, and schedules live in `src/data/` as plain JS modules. No API, no database.

**Why:** PMRC does not publish a public data API. The data changes rarely (new stations open infrequently; fares change even less often). A static approach means zero hosting cost, zero latency, and offline support trivially. The tradeoff is that any data change requires a code deploy — acceptable given the change frequency.

**Where data lives:**
- `src/data/stations.js` — station list, fare slabs, schedule constants
- `src/data/graph.js` — adjacency list built at module load time
- `src/data/timeUtils.js` — time arithmetic (first/last train per station)

---

## BFS for route finding

`findRoute()` in `graph.js` uses breadth-first search. Interchange stations (Patna Junction, Khemnichak) are represented as duplicate nodes with cross-line edges.

**Why:** The network has 26 stations across 2 lines with 2 interchange points. BFS finds the shortest path (fewest stops) correctly on this topology. Dijkstra or A* would be overkill and add complexity with no benefit — all edges have uniform weight (one stop).

**Interchange handling:** stations with the same name on different lines are linked by `INTERCHANGE` edges in the graph. `findRoute()` expands from all same-name nodes of the origin, so boarding at either physical platform counts as the start.

---

## SVG viewBox zoom on Metro Map

The map uses SVG viewBox manipulation for zoom/pan, not CSS `transform: scale()`.

**Why:** CSS transform zooms the rasterised bitmap of the SVG, causing blurriness at high zoom on mobile (`3f07a72`). ViewBox manipulation tells the SVG renderer to re-draw the vector paths at the new resolution — always crisp. The tradeoff is slightly more complex state management (viewBox x/y/w/h vs a single scale factor), but the visual quality difference on Retina screens is significant.

---

## Bilingual via inline T objects

Every component that has user-facing text defines a local `T = { en: {...}, hi: {...} }` constant and reads from it via `useLang()`. No i18n library.

**Why:** The app has exactly two languages and the translation strings are small. An i18n library (react-i18next etc.) would add a dependency, a separate translation file format, and loading complexity. Inline objects are co-located with the component, easy to audit, and have zero runtime overhead. If a third language were ever needed this would need revisiting.

---

## PWA + TWA for app store distribution

The app is a PWA (via `vite-plugin-pwa`) wrapped in a Trusted Web Activity shell for Play Store distribution. PWABuilder was used to generate the TWA.

**Why:** Avoids native development entirely. The wrapper just loads `patna-metro.com` — all feature updates deploy instantly via Vercel without any app store resubmission. The tradeoff is that the app requires a network connection to receive updates (mitigated by the service worker cache for offline use).

**Digital Asset Links** (`.well-known/assetlinks.json`) are required for TWA to verify domain ownership. Served with `Cache-Control: public, max-age=3600` via `vercel.json`.

---

## NetworkFirst service worker strategy

Navigation requests use `NetworkFirst` with a 3-second timeout; all static assets are precached.

**Why:** For a transit app, fresh content is more important than offline-first. `NetworkFirst` tries the network, falls back to cache on timeout or failure. The 3s timeout prevents long hangs on slow connections. Static assets (JS, CSS, icons) are precached so the app shell loads instantly even offline.

---

## SPA routing via Vercel rewrites

`vercel.json` rewrites all routes to `index.html`. React Router handles routing client-side.

**Why:** Without the catch-all rewrite, navigating directly to `/planner` or `/map` returns a 404 from Vercel's edge. The rewrite is the standard fix for SPAs on Vercel. Note: `www.*` redirect was intentionally removed from `vercel.json` after it caused a redirect loop (`a04b0eb`) — that belongs in Vercel domain settings, not rewrites.

---

## Privacy policy as static HTML, not a React page

`public/privacy/index.html` is a plain HTML file served by Vercel at `/privacy`, not a React component.

**Why:** The privacy policy is static legal text that never needs React, i18n, or the app shell. Keeping it as plain HTML means it loads fast, has no JS dependency, and can be updated without touching the React build. It was added primarily for Play Store compliance.
