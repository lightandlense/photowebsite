---
phase: 03-transition-sequences
plan: "01"
subsystem: transition
tags: [gsap, animation, transition, hand-silhouette, gallery]
dependency_graph:
  requires: [darkroom.js, store.js, router.js]
  provides: [transition.js, css/transition.css, #gallery-placeholder, #hand-silhouette]
  affects: [darkroom.js, main.js, index.html]
tech_stack:
  added: []
  patterns:
    - GSAP multi-stage timeline with position parameters (3-act forward, timeScale(2).reverse() reverse)
    - CSS animation-play-state pause/resume to prevent sway/GSAP conflict
    - getBoundingClientRect scale-to-fill viewport calculation
    - CSS class absent-photo state (clothesline__photo--empty) — preserves layout without DOM removal
    - onReverseComplete callback for full state restore
key_files:
  created:
    - js/transition.js
    - css/transition.css
  modified:
    - index.html
    - js/darkroom.js
    - js/main.js
decisions:
  - Hand hidden via gsap.set(handEl, { display:'none' }) before forwardTl.reverse() — prevents hand replay on back navigation (Pitfall 5 resolution)
  - Gallery section uses class-based .gallery--visible toggle alongside GSAP display change — ensures flexbox centering works reliably
  - forwardTl rebuilt per click (not built-once) — photo position varies per click; rect must be measured fresh each time
  - navigateTo called in onComplete callback — URL updates only after gallery is visually ready, not at click time
metrics:
  duration: 2 min
  completed_date: "2026-03-01"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 3
---

# Phase 3 Plan 1: Hand-Grab and Gallery Transition Summary

**One-liner:** 3-act GSAP forward transition (hand grab, photo pull-in, gallery dissolve) with 2x-speed reverse via timeScale(2).reverse() and CSS absent-photo state.

## What Was Built

The cinematic bridge from the darkroom clothesline into the gallery. Clicking a genre photo triggers a silhouette hand rising from below, grasping the clothespin (which releases), neighboring photos sway, the hand retreats, and the photo scales to fill the screen while the darkroom dissolves away — arriving at a gallery placeholder. Browser back and the gallery back button both trigger the same reverse transition at 2x speed with no hand replay.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add hand SVG, gallery placeholder, and transition CSS | 1127a59 | index.html, css/transition.css |
| 2 | Create transition.js — forward and reverse animation controller | d06bc1e | js/transition.js |
| 3 | Wire darkroom.js genre click and main.js reverse transition | 8705b7f | js/darkroom.js, js/main.js |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Hide hand before reverse() rather than nested sub-timeline | Simplest solution to Pitfall 5 — gsap.set(display:none) before reverse() prevents visual replay without restructuring the timeline |
| Gallery uses .gallery--visible CSS class alongside GSAP display | The [style*="display: flex"] selector is fragile when GSAP sets display:block; class toggle is reliable |
| forwardTl rebuilt per click | Photo position (getBoundingClientRect) differs every click — timeline must be fresh to avoid stale rect values |
| navigateTo in onComplete | URL must change after gallery is visible — not at click time — to match the visual transition state |

## Architecture Notes

`transition.js` is the sole owner of forward/reverse animation logic. It imports from `store.js` (transitionInProgress guard, currentGenre) and `router.js` (navigateTo). `darkroom.js` calls `startForward(genre, photo)` on genre photo click. `main.js` calls `startReverse()` on popstate to `/`. No circular dependencies.

The gallery section (`#gallery`) is a Phase 3 placeholder — dark background with genre name in Playfair Display. Phase 4 will replace its contents with the real filmstrip while keeping the same `#gallery` element as the dissolve target.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Steps

Manual verification required (visual animation):

1. Open `index.html` via local HTTP server
2. Click door to enter darkroom
3. Click any genre photo — verify 3-act sequence (hand rises, pin releases, neighbors sway, hand retreats, photo scales, darkroom fades, gallery fades in, URL updates)
4. Click browser back — verify reverse (no hand, gallery fades, photo shrinks back, darkroom fades in, pin restored, sway resumes)
5. Click gallery back button — verify same reverse behavior
6. Rapid double-click during transition — verify only one transition plays

## Self-Check: PASSED

| Item | Status |
|------|--------|
| js/transition.js | FOUND |
| css/transition.css | FOUND |
| 03-01-SUMMARY.md | FOUND |
| commit 1127a59 (task 1) | FOUND |
| commit d06bc1e (task 2) | FOUND |
| commit 8705b7f (task 3) | FOUND |
