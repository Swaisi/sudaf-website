# Sudaf Engineering Consultancy — website

Bilingual (EN default, AR at `/ar/*`) company site for Sudaf Engineering Consultancy, Misurata, Libya.
Live at https://www.sudaf.ly. Owner communicates in Arabic.

## Stack & deploy
- React 19 + Vite 7 + react-router-dom 7. No CSS framework; all styles in `src/App.css` (design tokens on `:root`).
- `npm run build` = `vite build && node scripts/prerender.js`.
- Push to `main` on GitHub `Swaisi/sudaf-website` → Vercel auto-deploys in ~10–60 s.
- `vercel.json`: `cleanUrls: true` + SPA fallback rewrite to `/` (must be `/`, not `/index.html`, with cleanUrls).
- Vercel Web Analytics via `@vercel/analytics` in `src/main.jsx` (its script 404s locally — expected).

## Structure
- `src/App.jsx` — all pages/components. Language comes from the URL (`useLang()`); `pagePath(path, lang)` builds links.
  Pages: Home, About, Services (editorial rows + `#service-N` anchors), Projects (placeholder), Tools, Contact, 404.
  `usePageMeta()` syncs title/description/canonical/og/`<html lang dir>` at runtime.
- `src/seo.js` — single source of page metadata (used at runtime and by the prerender script). Add new pages here.
- `scripts/prerender.js` — writes one HTML per page×language with correct head tags, plus `sitemap.xml` and `robots.txt`.
- `src/data.js` — services (EN/AR), contact info, pillars, tools, about paragraphs, process steps, FAQs.
- `src/icons.jsx` — inline SVG icon set + WhatsApp icon.
- `index.html` — static OG tags, hreflang, JSON-LD (ProfessionalService) for Sudaf.

## Hero traffic simulation
- `src/sim/roundabout.js` — pure, framework-free engine: grade-separated roundabout (N–S flyover, 2 lanes each way),
  two-lane at-grade ring (inner lane: left/U-turns + some through; outer: through), right-turn slip lanes,
  right-hand traffic (CCW). IDM car following, critical-gap acceptance at give-way lines (measured from front bumper),
  inner-lane exits yield to outer lane. Fleet: car/van/bus/truck with type-specific params.
  Scenarios `MODES = { free, peak, jam }`; `stats()` gives LOS from HCM delay thresholds. Units: 1 px = 0.25 m.
- `src/RoundaboutSim.jsx` — canvas renderer (cached ground + deck layers), scenario buttons (time-lapse fast-forward
  via `sim.ff`), LOS/delay/speed/queue readouts, `TrendChart` (one measure per chart — no dual axes).
- `src/drawEnvironment.js` — static buildings/palms/pavements placed with an occupancy mask clear of roads.
- Panel sizes from viewport height; on wide-but-short screens it switches to a side-by-side layout (see App.css).

## Engineering tools (`/tools`)
- `src/tools/roundaboutCalc.js` — Kimber/TRL LR942 capacity + DMRB CD 116 QA/QC checks; NCHRP 672 fastest-path
  speeds (metric Eq. 6-1/6-2), HCM 6/7 roundabout lane capacity, control delay, LOS. Checks are indicative; owner should
  confirm thresholds against current editions.
- `src/RoundaboutTool.jsx` — UK/US tabs, blueprint-style SVG diagrams, sliders, results, pass/review/fail checklist.

## Design language (phase-1 refresh, Oct 2026)
Navy `#0c1f33` / gold `#d6b46a`, fonts Alexandria (headings, weight 500) + Cairo (body) — owner chose these fonts.
Pill buttons with circular arrow badge (`ArrowBadge`), hairline numbered section labels (`SectionLabel`),
chamfered frames, navy-gold duotone images in `public/images/duo/`, image-filled numerals, dark pillars section,
gold software marquee (forced LTR), FAQ `<details>` accordion, gradient footer with big CTA.
References the owner liked: hrgreen.com, imagineteam.com, neuropelvicsurgery.com (DD.NYC).

## Rules
- Never invent statistics, clients, years or project claims — only facts in existing content or supplied by the owner.
- Keep EN and AR in sync for every text; check RTL layout (logical CSS properties, `flip-rtl` for arrows).
- Respect `prefers-reduced-motion`; keep hero CTAs and the whole sim panel visible at 100% zoom on 1366×768 laptops.
- Verify visually before shipping: `npx vite preview --port 4173`, then screenshot with puppeteer-core + Edge
  (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) at desktop and 390 px mobile, EN and AR;
  check `document.documentElement.scrollWidth` equals the viewport width.
- After changing the sim engine, run a headless stress test (stuck vehicles, overlaps, LOS per scenario) in node.
