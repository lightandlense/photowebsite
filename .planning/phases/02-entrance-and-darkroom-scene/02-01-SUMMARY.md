---
phase: 02-entrance-and-darkroom-scene
plan: 01
subsystem: visual-scenes
tags: [html-structure, css-layout, parallax, darkroom, clothesline, textures]
dependency_graph:
  requires:
    - css/tokens.css (color, font, timing tokens from Phase 1)
    - gallery.json (genre IDs and clotheslineIndex values)
    - GSAP CDN scripts (loaded before main.js)
  provides:
    - "#entrance section: 5 parallax layers + door + light-leak + CTA + darkness overlay"
    - "#darkroom section: safelight + clothesline with 5 genre photos + silhouette + business card"
    - "images/entrance/*.jpg: photographic placeholder textures for all entrance layers"
    - "css/entrance.css: scene layout, image-based layers, door glow, CTA, mobile responsive"
    - "css/darkroom.css: atmosphere, clothesline, sway keyframes, nav elements"
  affects:
    - js/main.js (GSAP targets: #door, .scene__layer, .entrance__cta, .scene__overlay--darkness, #darkroom, .clothesline__photo)
    - Phase 2 Plan 02 (walk-in animation wires up DOM built here)
tech_stack:
  added:
    - Pillow (Python stdlib) — procedural texture generation via generate-entrance-textures.py
  patterns:
    - Parallax layers as absolute-positioned siblings with z-index stacking
    - background-image URL on each layer (photographic texture primary, background-color fallback)
    - CSS @keyframes sway with rotate property and staggered animation-duration/delay per child
    - transform-origin: top center for pendulum sway from clothespin attachment point
    - 100dvh with 100vh fallback for iOS Safari dynamic viewport
    - CSS clip-path polygon for silhouette figure shape
key_files:
  created:
    - tools/generate-entrance-textures.py
    - images/entrance/sky.jpg
    - images/entrance/building.jpg
    - images/entrance/door.jpg
    - images/entrance/ground.jpg
    - css/entrance.css
    - css/darkroom.css
  modified:
    - index.html (replaced placeholder content with both scene sections, added CSS links)
decisions:
  - "Entrance layer images are primary visuals via background-image URL — CSS gradients only serve as background-color fallbacks per locked user decision"
  - "Sway animation uses CSS rotate property (not transform: rotate) with will-change: rotate for GPU compositing"
  - "door-frame layer uses ::before pseudo-element CSS shape rather than an image file — no texture needed for the dark surround"
  - "Clothespin notch implemented as ::after pseudo-element on .clothesline__pin using var(--color-bg) background to create gap illusion"
metrics:
  duration: "3 minutes"
  completed_date: "2026-02-28"
  tasks_completed: 4
  files_created: 7
  files_modified: 1
---

# Phase 2 Plan 1: Entrance and Darkroom Scene Structure Summary

**One-liner:** Full HTML/CSS scene structure for entrance exterior (photographic parallax layers with brick/metal/concrete textures) and darkroom interior (clothesline with 5 swaying genre photos, silhouette figure, business card), built as GSAP-addressable DOM elements.

## What Was Built

### Task 1: Generate photographic placeholder textures (commit: 3600680)

Created `tools/generate-entrance-textures.py` — a Pillow-only procedural texture generator producing four photographic-style images for the entrance parallax layers:

- **sky.jpg** (1920x1080, 255KB): Dark night sky with scattered stars, atmospheric haze sine-wave bands, and warm urban light pollution glow at horizon
- **building.jpg** (1920x1080, 506KB): Brick wall with standard offset bond pattern, per-brick color variation, surface grain, suggested window upper-right, street number "127" upper-left
- **door.jpg** (800x1200, 165KB): Brushed metal with vertical stripe variation, horizontal panel division lines, warm-toned handle, heavy vignette
- **ground.jpg** (1920x400, 193KB): Concrete with horizontal pavement joints, curb light-catch strip, gradient from lighter top to darker foreground

All images use fixed-seed RNG for reproducibility. Script is idempotent and safe to re-run.

### Task 2: Rewrite index.html (commit: 509fef3)

Replaced Phase 1 placeholder content with two scene sections inside `<div id="app">`:

- **#entrance**: 5 `.scene__layer` divs (sky, building, door-frame, door, ground) + `.entrance__light-leak` + `.entrance__cta` + `.scene__overlay--darkness`
- **#darkroom** (display: none): `.darkroom__safelight` + `.clothesline` with wire and 5 `<figure>` elements for each genre + `#silhouette-figure` + `#business-card`
- Added `<link>` tags for `css/entrance.css` and `css/darkroom.css` after `grain.css`

### Task 3: Create entrance.css (commit: 7fc5cf9)

Full entrance exterior stylesheet with:
- `.scene` container at 100dvh (iOS Safari compatible)
- `.scene__layer` with `will-change: transform` for GSAP parallax
- Image-based layers: each `[data-layer]` uses `background-image: url(...)` pointing to generated images; `background-color` is fallback only
- `door-frame` uses `::before` CSS recessed rectangle — no image needed
- `door` layer positioned center-bottom (not full-viewport), `cursor: pointer`
- `.entrance__light-leak` with amber box-shadow and 3s pulsing animation
- `.entrance__cta` starts at `opacity: 0` — GSAP target
- `.scene__overlay--darkness` for walk-in transition
- Mobile 768px: building scales 1.4x to crop to door, door widens to 50%

### Task 4: Create darkroom.css (commit: 63e0be3)

Full darkroom interior stylesheet with:
- Radial gradient safelight from upper-left (warm amber evoking film darkroom)
- `.clothesline__wire` with gradient fade-in/out edges and droop shadow
- 5 photos at 18% wire intervals with staggered vertical offsets (4px, -2px, 6px, 1px, -3px)
- `@keyframes sway` using `rotate` property with `transform-origin: top center`
- Per-photo staggered animation durations (4.6s–5.5s) and negative delays for organic asynchrony
- Clothespin with notch gap via `::after` using `var(--color-bg)` background
- Photo placeholders 120x160px with dimmed serif genre labels
- Silhouette figure via CSS `clip-path: polygon(...)` — no image file needed
- Business card via CSS gradient + border — no image file needed
- Nav labels at 0.5 opacity in Playfair Display
- Mobile 768px: smaller photos (80x110px), adjusted positions

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified present:
- FOUND: tools/generate-entrance-textures.py
- FOUND: images/entrance/sky.jpg (262KB)
- FOUND: images/entrance/building.jpg (519KB)
- FOUND: images/entrance/door.jpg (169KB)
- FOUND: images/entrance/ground.jpg (198KB)
- FOUND: css/entrance.css
- FOUND: css/darkroom.css

Commits verified present:
- FOUND: 3600680 (Task 1 — textures)
- FOUND: 509fef3 (Task 2 — index.html)
- FOUND: 7fc5cf9 (Task 3 — entrance.css)
- FOUND: 63e0be3 (Task 4 — darkroom.css)

Key artifacts verified:
- background-image URL references present in entrance.css (4 image URLs)
- @keyframes sway defined in darkroom.css
- #entrance and #darkroom both present in index.html
- #darkroom has display: none
- 5 clothesline__photo figures in index.html
- CSS links for both entrance.css and darkroom.css in index.html head
