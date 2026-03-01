---
phase: 02-entrance-and-darkroom-scene
plan: 02
subsystem: ui
tags: [gsap, animation, parallax, darkroom, entrance, spa-router]

requires:
  - phase: 02-01
    provides: "#entrance and #darkroom DOM sections with GSAP-addressable elements (door, layers, photos, nav)"
  - phase: 01-02
    provides: "store.js (transitionInProgress guard), router.js (navigateTo for darkroom nav)"
provides:
  - "js/entrance.js: initEntrance() — CTA fade-in, door hover glow, walk-in GSAP timeline, showDarkroom transition"
  - "js/darkroom.js: initDarkroom() + revealDarkroom() — nav hover glows, photo scale lift, click navigation, stagger reveal"
  - "js/main.js: updated entry point calling initEntrance + initDarkroom, appendTestNav removed"
affects:
  - phase: 03-photo-interaction (walk-in animation established; darkroom photo click placeholder ready for hand-grab)
  - phase: 04-gallery-views (navigateTo pattern used by darkroom nav elements)

tech-stack:
  added: []
  patterns:
    - "GSAP timeline built once paused, played on click — never build inside event handler"
    - "Double-click guard via store.transitionInProgress set before play, cleared in onComplete"
    - "Separation of initDarkroom (event wiring, page load) and revealDarkroom (one-time entrance animation)"
    - "filter: drop-shadow via GSAP to/from for hover glows without layout reflow"
    - "Keyboard Enter delegates to element.click() for accessible GSAP-managed interactions"

key-files:
  created:
    - js/entrance.js
    - js/darkroom.js
  modified:
    - js/main.js

key-decisions:
  - "Walk-in timeline built once outside click handler (paused), played on click — avoids GSAP accumulation bugs"
  - "showDarkroom is internal to entrance.js, not exported — only entrance.js orchestrates the transition sequence"
  - "initDarkroom and revealDarkroom are separate exports — init runs on page load, reveal runs only after walk-in"
  - "Photo click handlers log to console in Phase 2 as placeholder — hand-grab transition wired in Phase 3"

patterns-established:
  - "GSAP parallax pattern: each .scene__layer animated independently via data-layer selector attribute"
  - "Scene controller pattern: one file per scene, exports init* for setup and reveal* for one-time entrance"

requirements-completed: [ENTR-03, ENTR-04, ENTR-05, ENTR-06, ENTR-07, DARK-03, DARK-04, DARK-07, DARK-08, DARK-09, DARK-10]

duration: 2min
completed: 2026-02-28
---

# Phase 2 Plan 2: Entrance and Darkroom Interactivity Summary

**GSAP-powered entrance walk-in (parallax surge + darkness overlay, ~3.8s total) and darkroom interactivity (staggered photo reveal, amber nav glows, click-to-navigate via router) transforming the static Phase 1 CSS scenes into a fully live experience.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T05:06:03Z
- **Completed:** 2026-03-01T05:08:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Walk-in GSAP timeline built once paused (parallax approach 0-1.5s, darkness fade 1.2-1.9s, hold 1.9-2.3s), triggered on door click with double-click guard
- Darkroom stagger reveal: 5 clothesline photos fade up from y:-20 at 0.15s intervals, nav elements fade in after 1s delay
- In-world nav elements (silhouette + business card) emit amber drop-shadow glows on hover and call navigateTo() on click

## Task Commits

Each task was committed atomically:

1. **Task 1: Create entrance.js** - `5225104` (feat)
2. **Task 2: Create darkroom.js** - `74c7c32` (feat)
3. **Task 3: Update main.js** - `39a0da8` (feat)

## Files Created/Modified

- `js/entrance.js` - initEntrance(): CTA fade-in (1.5s delay), door hover glow, paused walk-in timeline, showDarkroom transition
- `js/darkroom.js` - initDarkroom(): nav hover glows + click navigation; revealDarkroom(): stagger photo + nav reveal
- `js/main.js` - Imports initEntrance/initDarkroom, calls both in init(), removes appendTestNav scaffold

## Decisions Made

- Walk-in timeline built once outside click handler (paused), played on click — avoids GSAP timeline accumulation bugs on rapid triggers
- showDarkroom is internal to entrance.js, not exported — entrance.js owns the full transition sequence and hands off to darkroom at the end
- initDarkroom and revealDarkroom are separate exports with distinct lifecycles: init runs on page load to wire listeners, reveal is a one-time entrance animation triggered after the walk-in
- Photo click handlers log genre to console as placeholder (Phase 3 hand-grab transition will replace)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Full entrance-to-darkroom flow is live: CTA -> door hover -> click -> walk-in -> darkroom stagger reveal -> nav interactive
- Phase 3 can hook into `.clothesline__photo` click handlers (placeholder logs are in place)
- Phase 4 gallery views receive navigateTo calls from darkroom nav elements (/about, /contact routes)
- The GSAP parallax layer pattern is established for potential extension

---
*Phase: 02-entrance-and-darkroom-scene*
*Completed: 2026-02-28*

## Self-Check: PASSED

Files verified present:
- FOUND: js/entrance.js
- FOUND: js/darkroom.js
- FOUND: js/main.js
- FOUND: .planning/phases/02-entrance-and-darkroom-scene/02-02-SUMMARY.md

Commits verified present:
- FOUND: 5225104 (Task 1 — entrance.js)
- FOUND: 74c7c32 (Task 2 — darkroom.js)
- FOUND: 39a0da8 (Task 3 — main.js)

Key patterns verified:
- initEntrance export present in entrance.js
- revealDarkroom export present in darkroom.js
- transitionInProgress guard in entrance.js
- navigateTo calls in darkroom.js
- initEntrance and initDarkroom called in main.js
- appendTestNav removed from main.js (0 occurrences)
