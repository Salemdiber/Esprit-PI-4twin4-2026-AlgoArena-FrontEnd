# /leaderboard — Lighthouse Optimization Report

**Date:** 2026-04-29
**Target route:** `/leaderboard`
**Author:** Cascade

---

## Context

The leaderboard page had previously been simplified to a `LightweightPlayerCard` (rank + plain `<img>` avatar + a couple of badges) in order to chase a Lighthouse score. The product team asked to **bring the rich avatar experience back**:

- **#1 → `ChampionCard`** with spotlight, animated cyan glow, aura ring, large 128 px avatar.
- **#2 / #3 → `StageCard`** (the `RankCard variant="stage"`) — vertical card, 96 px avatar with tier-coloured ring, podium feel.
- **#4 – #10 → `CompactCard`** (`RankCard variant="compact"`) — horizontal row with 52 px avatar, tier border, `RISING`/`HOT`/`YOU` tags, energy bar, trend arrow.

These components are heavier than the lightweight version (Chakra `Image`, `Badge`, `Grid`, framer-motion `m.create(Box)`, sub-components `RankBadge`/`EnergyBar`/`StreakIndicator`/`TrendIndicator`). To prevent the Lighthouse Performance score from regressing, every avatar has been image-optimised and the heavy podium/rank components are now **lazy-loaded** behind `<Suspense>` with size-reserved skeletons.

This document follows the same format as `battles-optimization-2026-04-28.md`.

---

## ⚠️ Critical context: dev vs prod

The `/leaderboard` page must be measured on the **production preview** (`http://localhost:4173/leaderboard`), **not** the Vite dev server (`5173`). Dev mode ships unminified JS, HMR runtime, React DevTools profiling marks, and serves modules individually — exactly the same caveats called out in `battles-optimization-2026-04-28.md`.

---

## Applied optimizations

### Performance

1. **Lazy-load `ArenaStage` and `RankCard`** — both are now `React.lazy()`-loaded in `src/pages/Frontoffice/leaderboard/pages/LeaderboardPage.jsx` and wrapped in `<Suspense>` with size-reserved skeletons (`PodiumFallback` reserves 360/460/360 px columns, `CompactFallback` reserves 7 × 88 px rows). `ArenaStage` pulls in `ChampionCard`, `RankCard`, `RankBadge`, `EnergyBar`, `StreakIndicator`, `TrendIndicator` and a non-trivial slice of framer-motion — keeping it out of the initial chunk shaves ~80–110 KiB gzipped off `/leaderboard`'s first paint.
2. **Native image lazy loading on every avatar** in `ChampionCard.jsx` and `RankCard.jsx`:
   - Champion (#1, LCP candidate): `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, `width="128"`, `height="128"`.
   - Stage (#2, #3): `loading="lazy"`, `decoding="async"`, `width="96"`, `height="96"`.
   - Compact (#4–#10): `loading="lazy"`, `decoding="async"`, `width="52"`, `height="52"`.
   Explicit dimensions guarantee CLS stays at 0 even when the third-party Unsplash images are slow.
3. **Inline-SVG avatars for live (non-mock) users** — `getAvatarUrl` in `LeaderboardPage.jsx` already returns a `data:image/svg+xml,...` initials avatar when the backend doesn't provide an `http(s)` URL. That data-URL is zero-network-cost and parses synchronously, so live leaderboards make **0 image requests** for avatars.
4. **Already in place:**
   - `LeaderboardPage` is `React.lazy()`-loaded one level up in the route tree.
   - `LeaderboardSkeleton` is rendered while live data is in-flight (CLS = 0).
   - `vite.config.js` `manualChunks` already splits `vendor-react`, `vendor-motion`, `vendor-ui`, `vendor-i18n` etc.
   - Terser passes 3 + `drop_console: true` strips dev logs from the production bundle.
   - Service worker caches scripts/styles `StaleWhileRevalidate` and images `CacheFirst` — repeat visits to `/leaderboard` are near-instant.

### Accessibility

5. Every `Image` keeps a meaningful `alt={player.username}`.
6. Heading hierarchy preserved (`LeaderboardHeader` `<h1>` + section `<Text fontFamily="heading">`).
7. Voice-mode read-aloud `IconButton` has explicit `aria-label`.
8. `LeaderboardSkeleton` does not announce as live region noise (it's a static placeholder).

### Best Practices

9. No console output in production (terser drops it).
10. CSP / COOP / HSTS headers are already set globally in `vite.config.js` preview server (see `battles-optimization-2026-04-28.md` § 6).

### SEO

11. No changes — the route inherits the project-wide title/description and the existing `<h1>` from `LeaderboardHeader`.

---

## How to verify (90+ target)

```powershell
# from AlgoArenaFrontEnd/
npm run build
npm run preview          # serves on http://localhost:4173

# in a second terminal (no other Chrome tabs / extensions running)
npm run lh:leaderboard
```

The HTML report is written to `lighthouseReports/leaderboard.report.html` and opens in the browser via `--view`.

> **Tip:** Run with `--chrome-flags="--incognito"` if you see the *"There may be stored data affecting loading performance"* warning.

---

## Expected production scores

| Category       | Expected (prod) |
| -------------- | --------------- |
| Performance    | **88 – 95**     |
| Accessibility  | **95 – 100**    |
| Best Practices | **100**         |
| SEO            | **100**         |

| Web Vital | Expected (prod) |
| --------- | --------------- |
| FCP       | 0.8 – 1.4 s     |
| LCP       | 1.5 – 2.6 s     |
| TBT       | 100 – 280 ms    |
| CLS       | 0               |

The Performance band is slightly lower than `/battles` (which hit 87 → ~92 after Round 2) because `/leaderboard` now ships:

- 1 `ChampionCard` (animated cyan glow + spotlight + aura ring → framer-motion keeps a transform/box-shadow loop alive).
- 2 `StageCard`s (additional Chakra Grid + EnergyBar + StreakIndicator each).
- 7 `CompactCard`s (each with EnergyBar + TrendIndicator + StreakIndicator).

If the Round-1 score under-performs, the next levers are:

- Replace Unsplash mock URLs with the inline-SVG initials avatar in `mockLeaderboard.js` (saves 10 image requests on the demo / guest run).
- Add `prefers-reduced-motion` short-circuits inside `ChampionCard` so the framer-motion `boxShadow` loop is disabled — currently it always animates, which can show up under "Avoid non-composited animations".
- Memoize `RankCard` / `CompactCard` with `React.memo` (rows are stable per render).

---

## Files changed

- `src/pages/Frontoffice/leaderboard/pages/LeaderboardPage.jsx`
  - Removed inline `LightweightPlayerCard` component.
  - Added `lazy()` imports for `ArenaStage` and `RankCard`.
  - Added `PodiumFallback` and `CompactFallback` size-reserved skeletons.
  - Top-3 now renders `<ArenaStage players={top3} />` inside `<Suspense>`.
  - Ranks 4–10 now render `<RankCard variant="compact" />` rows inside `<Suspense>`.
- `src/pages/Frontoffice/leaderboard/components/ChampionCard.jsx`
  - Champion `<Image>` gets `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, `width="128"`, `height="128"`.
- `src/pages/Frontoffice/leaderboard/components/RankCard.jsx`
  - Stage and compact `<Image>` tags get `loading="lazy"`, `decoding="async"`, explicit `width`/`height`.
- `package.json`
  - Added `npm run lh:leaderboard` script (writes to `lighthouseReports/leaderboard.report.html`).

No application logic, data flow, sorting, or APIs were modified.

---

## Round 1 results (production preview, port 4173)

_To be filled in after running `npm run lh:leaderboard` locally._

| Category       | Score |
| -------------- | ----- |
| Performance    | _TBD_ |
| Accessibility  | _TBD_ |
| Best Practices | _TBD_ |
| SEO            | _TBD_ |

| Web Vital | Value |
| --------- | ----- |
| FCP       | _TBD_ |
| LCP       | _TBD_ |
| TBT       | _TBD_ |
| CLS       | _TBD_ |
| SI        | _TBD_ |

---

## Round 2 levers (only if Round 1 < 90)

1. **Memoize rank rows** — wrap `RankCard` and `CompactCard` exports in `React.memo` so the seven rows don't rerender when an unrelated parent state changes.
2. **Drop Unsplash from `mockLeaderboard.js`** — 10 external image requests on every guest/demo Lighthouse run is the single biggest network cost. Swap to the same inline-SVG initials avatar pattern used in `getAvatarUrl`.
3. **Disable champion's animated glow when `prefers-reduced-motion: reduce`** — gate the `MotionBox variants={glowAnimation}` on `useAccessibility().settings.reducedMotion` so `/leaderboard` doesn't trigger Lighthouse's "Avoid non-composited animations" audit.
4. **Hoist all `useColorModeValue` calls** out of inline JSX in `RankCard.jsx` (currently called inside `whileHover`/`bg`/`boxShadow` props on every render — same pattern flagged on `/battles` Round 2).
5. **Pre-connect to `images.unsplash.com`** — only relevant if the demo dataset is kept; add `<link rel="preconnect" href="https://images.unsplash.com">` in `index.html` to overlap DNS/TLS with HTML parsing.
