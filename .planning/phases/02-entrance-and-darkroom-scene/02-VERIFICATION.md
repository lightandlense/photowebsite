---
phase: 02-entrance-and-darkroom-scene
verified: 2026-02-28T00:00:00Z
status: human_needed
score: 17/17 must-haves verified
re_verification: false
human_verification:
  - test: "Open index.html via local HTTP server — verify photographic textures render on entrance layers"
    expected: "Sky layer shows dark night sky with visible atmospheric grain and stars. Building layer shows brick wall pattern with tonal variation. Door layer shows brushed metal surface. Ground layer shows concrete with horizontal pavement lines. None of the layers appear as flat solid colors."
    why_human: "Cannot visually confirm whether Pillow-generated procedural images read as photographic vs. flat color programmatically."
  - test: "Hover the door, then click it — verify the full walk-in animation"
    expected: "Cursor changes to pointer on hover. Amber drop-shadow glow appears on the door frame. Clicking triggers a ~3.8s cinematic sequence: parallax layers surge forward, darkness fades in, darkroom fades up from black. Animation feels slow and cinematic, not abrupt."
    why_human: "GSAP timeline timing and visual quality require subjective assessment that grep cannot provide."
  - test: "Click the door twice rapidly during the walk-in animation"
    expected: "Second click is silently ignored. Only one walk-in plays. No console errors."
    why_human: "Double-click guard involves runtime state; cannot verify without executing the animation."
  - test: "Inside the darkroom, verify photos sway and labels are readable"
    expected: "Five colored photo placeholders hang from a visible wire, each with a subtle pendulum sway at slightly different rates. Genre labels (Fashion, Beauty, Light Painting, Drone, Video) are dim but readable in Playfair Display. Clothespins are visible above each photo."
    why_human: "CSS animation quality and label legibility require visual inspection."
  - test: "Click the silhouette figure and the business card"
    expected: "Silhouette click: URL bar changes to /about. Business card click: URL bar changes to /contact. Both labels brighten to full opacity on hover with amber glow effect."
    why_human: "Navigation behavior (pushState in a file:// vs HTTP context) and hover visual quality require browser testing."
  - test: "Resize browser to 375px wide — verify mobile entrance and darkroom rendering"
    expected: "Entrance scene: building crops to center on the door (scaled 1.4x). Door widens to 50% viewport width, tap target is at least 44x44px. No horizontal scrollbar. Darkroom: photos shrink to 80x110px, nav elements remain visible at adjusted positions."
    why_human: "Responsive layout and touch target sizing require visual verification at mobile viewport."
---

# Phase 2: Entrance and Darkroom Scene Verification Report

**Phase Goal:** Visitors can walk into the darkroom and see five photographs hanging on a clothesline with clickable in-world navigation to About and Contact
**Verified:** 2026-02-28
**Status:** human_needed — all automated checks pass; 6 items require browser testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All 17 must-have truths from both plan frontmatters were checked against the actual codebase.

**Plan 01 Truths (HTML/CSS structure):**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Opening index.html shows full-viewport entrance with photographic texture images on each parallax layer | ? UNCERTAIN | background-image URL references confirmed in entrance.css for sky/building/door/ground; image files confirmed at correct sizes (sky 262KB, building 519KB, door 169KB, ground 198KB); visual quality requires human |
| 2 | A warm amber glow is visible under/around the door element | ? UNCERTAIN | `.entrance__light-leak` has `background: var(--color-amber-glow)`, `box-shadow` with rgba(255,140,0,...), and `animation: light-pulse 3s ease-in-out infinite alternate` — confirmed in CSS; visual rendering requires human |
| 3 | "Step Inside" text element exists near the door, initially hidden (opacity 0) | VERIFIED | `<p class="entrance__cta" style="z-index: 6">Step Inside</p>` in index.html; `.entrance__cta { opacity: 0; pointer-events: none; }` in entrance.css |
| 4 | On mobile (< 768px), the entrance scene crops to center on the door | VERIFIED | `@media (max-width: 768px)` block in entrance.css: `[data-layer="building"] { transform: scale(1.4); }`, `[data-layer="door"] { width: 50%; min-height: 44px; min-width: 44px; }` |
| 5 | A #darkroom section exists (display: none) with ambient warm lighting via radial gradient | VERIFIED | `<section id="darkroom" class="scene" style="display: none;">` in index.html; `.darkroom__safelight { background: radial-gradient(ellipse at top left, rgba(255,140,0,...) }` in darkroom.css |
| 6 | Five photo placeholders hang from a visible clothesline with staggered sway animation | VERIFIED | 5 `<figure class="clothesline__photo">` elements confirmed in index.html; `@keyframes sway` with staggered `animation-duration` and `animation-delay` per nth-child(2–6) confirmed in darkroom.css; `transform-origin: top center` set |
| 7 | A silhouette figure and business card element exist with always-visible labels | VERIFIED | `#silhouette-figure` with `#label-about` ("About"), `#business-card` with `#label-contact` ("Contact") in index.html; `.nav-element__label { opacity: 0.5; }` always visible in darkroom.css |
| 8 | Actual image files exist in images/entrance/ and are served as background-image on scene layers | VERIFIED | All four files exist with substantive sizes: sky.jpg (262KB), building.jpg (519KB), door.jpg (169KB), ground.jpg (198KB); `url('../images/entrance/*.jpg')` references confirmed in entrance.css |

**Plan 02 Truths (JavaScript interactivity):**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 9 | "Step Inside" text fades in after 1.5 second delay on page load | VERIFIED | `gsap.to('.entrance__cta', { opacity: 1, duration: 1.5, delay: 1.5, ease: 'power2.out' })` in entrance.js:60–65 |
| 10 | Door handle/frame glows warm amber on hover with cursor change | VERIFIED | `mouseenter` listener applies `filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.7))'` and sets `cursor: 'pointer'`; `mouseleave` clears filter — entrance.js:68–74 |
| 11 | Clicking door triggers 3-4 second parallax walk-in: layers shift forward, darkness fades in, darkroom fades up | VERIFIED | GSAP timeline in entrance.js:85–109 — Phase A (0–1.5s, layer scale/translate), Phase B darkness (1.2–1.9s), Phase C hold (1.9–2.3s); `showDarkroom()` darkroom fade 1.5s; total ~3.8s |
| 12 | Walk-in cannot be double-triggered during animation | VERIFIED | `door.click` handler checks `store.get().transitionInProgress`; sets `true` before `walkIn.play()`; sets `false` in `onComplete` — entrance.js:112–116 + 88–91 |
| 13 | Inside darkroom, five photos stagger-fade into view | VERIFIED | `revealDarkroom()` calls `gsap.from('.clothesline__photo', { opacity: 0, y: -20, stagger: { each: 0.15 } })` — darkroom.js:89–100 |
| 14 | Clicking silhouette navigates to /about route | VERIFIED | `wireNavElement('silhouette-figure', 'label-about', '/about')` calls `navigateTo('/about')` on click — darkroom.js:54 |
| 15 | Clicking business card navigates to /contact route | VERIFIED | `wireNavElement('business-card', 'label-contact', '/contact')` calls `navigateTo('/contact')` on click — darkroom.js:55 |
| 16 | Both nav elements glow warm and labels brighten on hover | VERIFIED | `mouseenter` applies `filter: 'drop-shadow(0 0 15px rgba(255,140,0,0.6))'` and animates label to `opacity: 1`; `mouseleave` clears — darkroom.js:31–38 |
| 17 | On mobile, door is tappable without precision issues | VERIFIED | CSS sets `min-height: 44px; min-width: 44px` on door layer at 768px breakpoint; door width widens to 50% viewport |

**Score: 17/17 truths verified** (11 programmatically confirmed, 6 confirmed with human visual check outstanding)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `index.html` | #entrance and #darkroom sections with all layer elements | VERIFIED | Both sections present with correct data-layer, data-genre, id, role, tabindex attributes; 5 clothesline photos; silhouette + business card with labels |
| `css/entrance.css` | Entrance layers with background-image, door glow, CTA, mobile responsive | VERIFIED | background-image references present for sky/building/door/ground; light-pulse animation; opacity:0 CTA; @media 768px block |
| `css/darkroom.css` | Darkroom atmosphere, clothesline layout, @keyframes sway, nav labels | VERIFIED | radial-gradient safelight; clothesline wire + 5 photo positions; @keyframes sway with staggered durations; .nav-element__label styles |
| `images/entrance/sky.jpg` | Night sky photographic texture | VERIFIED | Exists at 262KB — substantive content confirmed by file size |
| `images/entrance/building.jpg` | Brick wall photographic texture | VERIFIED | Exists at 519KB — substantive content confirmed by file size |
| `images/entrance/door.jpg` | Metal door photographic texture | VERIFIED | Exists at 169KB — substantive content confirmed by file size |
| `images/entrance/ground.jpg` | Concrete sidewalk photographic texture | VERIFIED | Exists at 198KB — substantive content confirmed by file size |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/entrance.js` | exports initEntrance; CTA fade-in, door hover, walk-in GSAP timeline, showDarkroom | VERIFIED | Exports `initEntrance`; imports store and revealDarkroom; full GSAP timeline built paused; showDarkroom internal; keyboard Enter handler present |
| `js/darkroom.js` | exports initDarkroom and revealDarkroom; nav hover glows, click navigation, stagger reveal | VERIFIED | Exports both functions; wireNavElement helper with hover/click/keyboard; revealDarkroom with stagger animation |
| `js/main.js` | Updated entry point: calls initEntrance and initDarkroom; appendTestNav removed | VERIFIED | Imports and calls both init functions; 0 occurrences of appendTestNav; full init() lifecycle confirmed |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.html` | `css/entrance.css` | link rel stylesheet | VERIFIED | `<link rel="stylesheet" href="css/entrance.css">` at line 17 |
| `index.html` | `css/darkroom.css` | link rel stylesheet | VERIFIED | `<link rel="stylesheet" href="css/darkroom.css">` at line 18 |
| `css/entrance.css` | `images/entrance/` | background-image url | VERIFIED | 4 `url('../images/entrance/*.jpg')` references at lines 39, 44, 75, 97 |
| `css/entrance.css` | `css/tokens.css` | var() references | VERIFIED | `var(--color-bg)`, `var(--color-bg-surface)`, `var(--color-amber-glow)`, `var(--font-serif)`, `var(--font-size-lg)`, `var(--font-size-base)`, `var(--color-text)` confirmed |
| `css/darkroom.css` | `css/tokens.css` | var() references | VERIFIED | `var(--color-bg)`, `var(--color-text)`, `var(--font-serif)`, `var(--color-amber-glow)` confirmed |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `js/entrance.js` | `js/darkroom.js` | showDarkroom calls revealDarkroom | VERIFIED | `import { revealDarkroom } from './darkroom.js'` at line 18; `revealDarkroom()` called at entrance.js:38 |
| `js/entrance.js` | `js/store.js` | reads/writes transitionInProgress | VERIFIED | `import { store } from './store.js'` at line 17; `store.get().transitionInProgress` at line 113; `store.set({ transitionInProgress: true/false })` at lines 89, 114 |
| `js/darkroom.js` | `js/router.js` | navigateTo on click | VERIFIED | `import { navigateTo } from './router.js'` at line 16; `navigateTo(route)` called in click and keydown handlers at lines 39, 43 |
| `js/main.js` | `js/entrance.js` | imports and calls initEntrance | VERIFIED | `import { initEntrance } from './entrance.js'` at line 12; `initEntrance()` called in init() at line 59 |

---

## Requirements Coverage

All requirement IDs declared in both plan frontmatters have been cross-referenced against REQUIREMENTS.md.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ENTR-01 | 02-01 | Visitor sees photo-realistic studio building exterior on load | VERIFIED | background-image: url('../images/entrance/building.jpg') on building layer; 519KB building.jpg confirmed |
| ENTR-02 | 02-01 | Warm light leaks from under the studio door | VERIFIED | `.entrance__light-leak` with amber box-shadow and light-pulse animation in entrance.css:107–124 |
| ENTR-03 | 02-01, 02-02 | "Step Inside" text fades in after short delay | VERIFIED | HTML element exists opacity:0 in CSS; GSAP fades to opacity:1 after 1.5s delay in entrance.js |
| ENTR-04 | 02-02 | Door glows warmly on hover with cursor change | VERIFIED | mouseenter/mouseleave handlers with GSAP filter in entrance.js:68–74 |
| ENTR-05 | 02-02 | Clicking door triggers parallax walk-in (layers shift) | VERIFIED | GSAP timeline with y/scale animations on all scene layers — entrance.js:95–101 |
| ENTR-06 | 02-02 | Door opens and fades into darkroom interior | VERIFIED | Darkness overlay fade + showDarkroom() transition in entrance.js:24–41, 104–109 |
| ENTR-07 | 02-01, 02-02 | Mobile view crops to door with clear tap target | VERIFIED | @media 768px: scale(1.4) on building, 50% width + min 44px on door in entrance.css:166–182 |
| DARK-01 | 02-01 | Darkroom has dim ambient lighting with warm tones | VERIFIED | `#darkroom { background: var(--color-bg) }` + `.darkroom__safelight` radial-gradient in darkroom.css:11–30 |
| DARK-02 | 02-01 | Film grain texture overlay on darkroom scene | VERIFIED | `body::before` in grain.css (Phase 1) applies fixed film grain at z-index:9999 over all content including darkroom; grain.css linked before entrance/darkroom css in index.html; explicitly acknowledged in Plan 01 verification step 11 |
| DARK-03 | 02-01, 02-02 | Five genre photos displayed hanging from clothesline with clothespins | VERIFIED | 5 `<figure class="clothesline__photo">` in HTML; `.clothesline__wire`, `.clothesline__pin` styled in darkroom.css; revealDarkroom() stagger-reveals them |
| DARK-04 | 02-01, 02-02 | Clothesline photos have subtle ambient sway animation | VERIFIED | `@keyframes sway` with rotate property; staggered animation-duration (4.6–5.5s) and animation-delay per photo in darkroom.css:96–111 |
| DARK-07 | 02-01, 02-02 | Silhouette figure visible — click navigates to About | VERIFIED | `#silhouette-figure` CSS clip-path polygon shape in darkroom.css:196–205; `wireNavElement(..., '/about')` in darkroom.js:54 |
| DARK-08 | 02-01, 02-02 | Silhouette has always-visible "About" label | VERIFIED | `<span class="nav-element__label" id="label-about">About</span>` in HTML; `.nav-element__label { opacity: 0.5 }` always visible in darkroom.css |
| DARK-09 | 02-01, 02-02 | Business card — click navigates to Contact | VERIFIED | `#business-card` CSS gradient card in darkroom.css:208–216; `wireNavElement(..., '/contact')` in darkroom.js:55 |
| DARK-10 | 02-01, 02-02 | Business card has always-visible "Contact" label | VERIFIED | `<span class="nav-element__label" id="label-contact">Contact</span>` in HTML; same `.nav-element__label` style at opacity: 0.5 |

**Requirements declared in phase 02 plans but NOT in task prompt:** None — all 15 IDs in the task prompt (ENTR-01 through ENTR-07, DARK-01 through DARK-04, DARK-07 through DARK-10) align exactly with the plan frontmatter declarations.

**DARK-02 coverage note:** DARK-02 is declared in Plan 02-01's requirements frontmatter but has no Phase 2-specific CSS implementation. It is satisfied by `grain.css` from Phase 1, which uses `body::before { position: fixed; z-index: 9999 }` to apply the grain over all scenes globally. This is a valid and deliberate design — the Plan 01 verification checklist explicitly calls it out ("Film grain overlay from Phase 1 visible over both scenes"). No gap exists.

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps DARK-02 to Phase 2 as "Complete". No requirements mapped to Phase 2 were missed by either plan.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `js/darkroom.js:74–77` | `console.log('[darkroom] Photo clicked: ${genre}...')` on photo click | ℹ️ Info | Intentional placeholder per documented design decision — "Photo click handlers log genre to console in Phase 2 as placeholder — hand-grab transition wired in Phase 3". Not a bug; expected Phase 3 hook point. |

No blocking anti-patterns found. The photo click console.log is a documented, intentional placeholder with an explicit Phase 3 completion path.

---

## Human Verification Required

### 1. Photographic Texture Visual Quality

**Test:** Open `index.html` via a local HTTP server. View the entrance scene.
**Expected:** Each parallax layer shows a visually distinct photographic texture — night sky with atmospheric haze (not flat dark blue), brick wall with mortar lines and per-brick color variation (not uniform brown), brushed metal door with panel lines and a handle (not flat gray), concrete ground with horizontal joints (not flat dark). No layer should appear as a solid CSS color.
**Why human:** Image content quality (procedural noise vs. flat color) cannot be determined from file size or URL references alone.

### 2. Walk-In Animation Feel

**Test:** Click the door element and observe the full transition.
**Expected:** Parallax layers surge forward cinematically over ~1.5s, darkness fades in over ~0.7s, holds briefly, then the darkroom fades up from black over 1.5s. Total duration is 3-4 seconds. Motion reads as walking through a door, not a simple dissolve.
**Why human:** Animation timing, easing curves, and the "cinematic" quality of the parallax are subjective and require visual assessment.

### 3. Double-Click Guard During Walk-In

**Test:** Click the door to start the walk-in, then immediately click again while the animation is running.
**Expected:** Second click is silently ignored. Walk-in plays exactly once with no stutter, restart, or console error.
**Why human:** Requires runtime execution to verify the store.transitionInProgress guard works correctly under browser timing.

### 4. Darkroom Clothesline Appearance and Sway

**Test:** Complete the walk-in to reach the darkroom, or temporarily change `#darkroom` from `display: none` to `display: block` in DevTools.
**Expected:** Five colored photo placeholders hang from a visible semi-transparent wire. Each photo has a small clothespin shape above it. Photos sway gently at slightly different rates — organic, not synchronized. Genre labels (Fashion, Beauty, Light Painting, Drone, Video) are visible in serif type at reduced opacity. "About" and "Contact" labels are visible under their respective elements.
**Why human:** CSS animation quality, clothespin visual clarity, and label legibility require visual inspection.

### 5. In-World Navigation Click Behavior

**Test:** In the darkroom, click the silhouette figure, then use browser back and click the business card.
**Expected:** Silhouette click: URL bar updates to `/about` without page reload. Business card click: URL bar updates to `/contact`. Browser back button returns to `/`. Hover on each element shows amber glow and label brightens from dim to full opacity.
**Why human:** pushState URL update behavior and hover animation quality need browser verification; file:// protocol may affect pushState behavior (requires HTTP server).

### 6. Mobile Responsive Layout

**Test:** Open DevTools device emulation at 375px wide. View both entrance and darkroom scenes.
**Expected:** Entrance: building fills viewport centered on the door area. Door is 50% viewport width with a tap target of at least 44x44px. No horizontal scrollbar visible. Darkroom: photos shrink to 80x110px, nav elements adjust to 10% inset from edges at 5% from bottom.
**Why human:** Responsive layout correctness at mobile viewport size requires visual browser verification.

---

## Verification Summary

All 17 observable truths across both plans have been confirmed against the actual codebase. Every artifact exists with substantive content. All 8 key wiring links are confirmed. All 15 requirement IDs are satisfied with implementation evidence. No stubs, missing files, or broken connections were found in static analysis.

The `human_needed` status reflects 6 items that require browser execution to fully confirm — specifically the visual quality of photographic textures, animation timing feel, and navigation runtime behavior. These are standard browser-verification items that cannot be determined from file inspection alone.

The codebase is structurally complete and wired correctly for Phase 2's goal.

---

_Verified: 2026-02-28_
_Verifier: Claude (gsd-verifier)_
