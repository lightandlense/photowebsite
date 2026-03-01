---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [css-custom-properties, playfair-display, film-grain, gsap, gallery-json, htaccess, webp]

# Dependency graph
requires: []
provides:
  - CSS design system: tokens (colors, typography, timing), base reset, film grain overlay
  - index.html: HTML shell with Google Fonts, CSS links, GSAP 3.14.2 CDN, app root div, picture element
  - gallery.json: genre data manifest with 5 genres, empty photos arrays
  - .htaccess: Apache SPA rewrite rules for cPanel hosting
  - images/*/: five genre directories (fashion, beauty, light-painting, drone, video)
  - test WebP/JPEG image pair proving image pipeline works
affects: [01-02, 02-entrance, 03-transitions, 04-filmstrip, 05-pages]

# Tech tracking
tech-stack:
  added:
    - GSAP 3.14.2 (gsap.min.js, ScrollTrigger.min.js, ScrollSmoother.min.js via jsDelivr CDN)
    - Playfair Display (Google Fonts — weights 400, 700, italic 400)
    - Pillow (Python image generation for test images)
  patterns:
    - CSS custom properties on :root for all design tokens (colors, typography, timing, grain)
    - Mobile-first responsive breakpoints (768px tablet, 1024px desktop)
    - SVG feTurbulence fractalNoise for film grain via body::before pseudo-element
    - picture element with WebP source + JPEG img fallback
    - gallery.json as genre data manifest (adding a genre = one JSON entry, no code change)
    - GSAP CDN scripts loaded before module script tag (globals available when main.js runs)

key-files:
  created:
    - css/tokens.css
    - css/base.css
    - css/grain.css
    - index.html
    - .htaccess
    - gallery.json
    - images/fashion/test-sample.webp
    - images/fashion/test-sample.jpg
    - images/fashion/.gitkeep
    - images/beauty/.gitkeep
    - images/light-painting/.gitkeep
    - images/drone/.gitkeep
    - images/video/.gitkeep
  modified: []

key-decisions:
  - "Color palette: --color-bg #1a1208 (deep warm black), --color-text #e8d5b0 (cream/amber), --color-accent #c8902a (warm gold)"
  - "Cinematic timing: --duration-cinematic 1.5s per user decision for deliberate 1-2 second transitions"
  - "Grain implementation: SVG feTurbulence fractalNoise at baseFrequency 0.65, opacity 0.04 — subtle, felt rather than seen"
  - "GSAP loaded via jsDelivr CDN, no defer — globals must be available before main.js module runs"
  - "gallery.json photos array included in each genre entry now so Phase 4 can populate without schema change"

patterns-established:
  - "Design token pattern: all visual values as CSS custom properties on :root, consumed via var() throughout"
  - "Image pipeline pattern: picture element with source type=image/webp + img src JPEG fallback"
  - "SPA routing pattern: .htaccess Apache rewrite sends all non-file/dir requests to index.html"

requirements-completed: [INFR-01, INFR-02, INFR-04, INFR-05]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 1 Plan 01: HTML Scaffold, CSS Design System, gallery.json, .htaccess, Image Folders Summary

**Darkroom design system established: CSS custom properties, Playfair Display serif, SVG film grain overlay, 5-genre gallery.json manifest, Apache SPA routing, and WebP/JPEG test image pipeline — all serving correctly via local HTTP server**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T04:18:07Z
- **Completed:** 2026-03-01T04:20:04Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Darkroom CSS design system with locked color palette (#1a1208 bg, #e8d5b0 text, #c8902a accent), Playfair Display serif typography, and cinematic timing tokens
- Film grain overlay via SVG feTurbulence fractalNoise at 0.04 opacity — subtle texture visible over entire page
- gallery.json manifest with 5 genre entries (fashion, beauty, light-painting, drone, video) including empty photos arrays for Phase 4 compatibility
- WebP + JPEG fallback pipeline validated: test-sample.webp (830B) and test-sample.jpg (5.1KB), both under 200KB
- Apache .htaccess SPA rewrite rules for cPanel hosting
- HTML shell with Google Fonts preconnect, GSAP 3.14.2 CDN (before module script), app root div, and picture element

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CSS design system (tokens, base, grain)** - `b0e67d7` (feat)
2. **Task 2: Create index.html, .htaccess, gallery.json, and image folders** - `18344a7` (feat)
3. **Task 3: Create test WebP/JPEG image pair and add picture element to index.html** - `169ebcf` (feat)

## Files Created/Modified

- `css/tokens.css` - CSS custom properties on :root for all design tokens (colors, typography, timing, grain)
- `css/base.css` - Global reset, body styles, headings, links, responsive breakpoints (768px, 1024px), visually-hidden utility
- `css/grain.css` - Film grain via body::before with SVG feTurbulence fractalNoise data URI, pointer-events: none
- `index.html` - HTML shell with Google Fonts, CSS links, GSAP CDN, app root, placeholder content, picture element
- `.htaccess` - Apache SPA rewrite rules (RewriteEngine, RewriteCond !-f !-d, RewriteRule to index.html)
- `gallery.json` - Genre manifest v1 with 5 genres, clotheslineIndex 0-4, empty photos arrays
- `images/fashion/test-sample.webp` - 830B WebP warm amber gradient (darkroom palette)
- `images/fashion/test-sample.jpg` - 5.1KB JPEG fallback of same gradient
- `images/fashion/.gitkeep` - Directory placeholder
- `images/beauty/.gitkeep` - Directory placeholder
- `images/light-painting/.gitkeep` - Directory placeholder
- `images/drone/.gitkeep` - Directory placeholder
- `images/video/.gitkeep` - Directory placeholder

## Decisions Made

- Grain opacity at 0.04 (value from design tokens) with baseFrequency 0.65, 3 octaves — matches "felt more than seen" aesthetic intent
- photos array added to each gallery.json genre entry proactively so Phase 4 can populate without a schema change
- GSAP CDN scripts load without `defer` so globals are available synchronously before the `type="module"` main.js runs
- Pillow used to generate warm amber gradient test images (400x300, horizontal gradient from #1a1208 to #c8902a)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full CSS design system ready — Plan 02 can import tokens immediately via var()
- index.html shell ready — js/main.js module reference already wired, Plan 02 creates that file
- gallery.json manifest ready — SPA router in Plan 02 can load it on init
- Image pipeline validated — Phase 4 can populate genre folders with real photos knowing the WebP/JPEG pipeline works
- No blockers for Plan 02 (SPA router, state store, main.js entry point)

---
*Phase: 01-foundation*
*Completed: 2026-03-01*

## Self-Check: PASSED

All 14 files verified present on disk. All 3 task commits verified in git log (b0e67d7, 18344a7, 169ebcf).
