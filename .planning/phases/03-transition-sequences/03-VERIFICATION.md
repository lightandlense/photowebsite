---
phase: 03-transition-sequences
verified: 2026-03-01T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
human_verification:
  - test: "Click a genre photo and observe the full forward transition"
    expected: "Hand silhouette rises from bottom toward the clothespin, pin fades/slides up, neighboring photos sway, hand retreats, photo scales to fill the screen, darkroom fades out, gallery placeholder fades in with genre name, URL bar shows /gallery/{genre}"
    why_human: "Multi-stage GSAP animation with visual timing and spatial accuracy cannot be verified by static analysis"
  - test: "Click browser back button after arriving in gallery"
    expected: "No hand silhouette appears, gallery fades out, photo scales back to original clothesline position, darkroom fades in, clothespin is restored, sway animation resumes, URL returns to /"
    why_human: "Reverse animation direction, hand-hiding behaviour, and sway resume require runtime observation"
  - test: "Click the gallery Back button"
    expected: "Same reverse behaviour as browser back — gallery fades out, photo shrinks back to clothesline, darkroom fades in"
    why_human: "history.back() triggering popstate and then startReverse() requires a running browser to confirm"
  - test: "Click a photo rapidly twice during transition"
    expected: "Only one transition plays — second click is silently ignored"
    why_human: "Race condition guard (transitionInProgress) requires runtime double-click testing"
  - test: "After reverse, the previously-grabbed photo has its clothespin and image restored"
    expected: "Photo appears back on the line with pin visible and sway resuming — not stuck in empty state"
    why_human: "onReverseComplete clearProps restoration requires runtime visual confirmation"
---

# Phase 3: Transition Sequences Verification Report

**Phase Goal:** Clicking a clothesline photo plays a hand-grab animation that removes it and then pulls the camera into the image, arriving in the filmstrip gallery
**Verified:** 2026-03-01
**Status:** human_needed — all static checks passed; 5 items require runtime visual confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Clicking a genre photo triggers a hand silhouette entering from below, grasping the clothespin, and the photo releasing | VERIFIED (static) | `darkroom.js:63-65` calls `startForward(genre, photo)` on click; `transition.js:105-130` builds 3-act timeline — hand enters at `y:'100vh'`, moves to `targetY`, pin fades at 0.6s, hand retreats at 0.9s |
| 2 | After the hand-grab, the photo scales to fill the screen and dissolves into a gallery placeholder — no hard cut or blank frame | VERIFIED (static) | `transition.js:134-154` — photo scales with `getBoundingClientRect` scale-to-fill at 0.9s, darkroom fades 1.4s, gallery `opacity:1` at 1.8s; gallery prepped with `display:'flex', opacity:0` before timeline starts |
| 3 | Browser back button plays a reverse transition (no hand replay) at 2x speed, returning to the darkroom | VERIFIED (static) | `router.js:42-50` dispatches `route:change` with `trigger:'popstate'`; `main.js:77-79` calls `startReverse()` when `path === '/'`; `transition.js:174` hides hand before `reverse()`; `transition.js:212` sets `timeScale(2).reverse()` |
| 4 | The grabbed photo appears absent (empty pin) when returning to the darkroom | VERIFIED (static) | `transition.js:96` adds `clothesline__photo--empty` in `onComplete`; `css/transition.css:25-34` hides `.clothesline__image` and `.clothesline__pin` via `visibility:hidden`; `transition.js:183-185` removes class and clears props in `onReverseComplete` |
| 5 | Clicking during a transition is ignored (no double-trigger) | VERIFIED (static) | `transition.js:46` guards `startForward` with `if (store.get().transitionInProgress) return`; `transition.js:165` guards `startReverse` with `if (!forwardTl || store.get().transitionInProgress) return`; `store.js:14` confirms `transitionInProgress` field exists in state |

**Score:** 5/5 truths verified by static analysis. All truths require runtime confirmation (see Human Verification Required).

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/transition.js` | Forward and reverse transition controller | VERIFIED | 213 lines; exports `startForward` and `startReverse`; imports `store` from `./store.js` and `navigateTo` from `./router.js`; commit `d06bc1e` |
| `css/transition.css` | Hand positioning, absent-photo state, gallery placeholder styles | VERIFIED | 91 lines; `#hand-silhouette` positioning, `.clothesline__photo--empty` state, `#gallery` and `.gallery--visible` styles, `.gallery__back`; commit `1127a59` |
| `index.html` | Hand SVG element and `#gallery` placeholder section | VERIFIED | `#hand-silhouette` SVG at lines 99-130 (last child of `#darkroom`, `display:none`, `z-index:100`, `aria-hidden="true"`); `#gallery` section at lines 134-138 with `#gallery-genre-name` and `#gallery-back`; `css/transition.css` linked at line 19; commit `1127a59` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `js/darkroom.js` | `js/transition.js` | `import { startForward }` | WIRED | `darkroom.js:17` — `import { startForward } from './transition.js'`; called at `darkroom.js:64` — `startForward(genre, photo)` on click, and at `darkroom.js:68` on Enter keydown |
| `js/main.js` | `js/transition.js` | `import { startReverse }` | WIRED | `main.js:14` — `import { startReverse } from './transition.js'`; called at `main.js:78` inside `route:change` listener when `trigger === 'popstate' && path === '/'` |
| `js/main.js` | `route:change` popstate listener | `window.addEventListener('route:change')` | WIRED | `main.js:73` — listener active; `router.js:42-50` confirms `popstate` dispatches `route:change` with `trigger:'popstate'` — chain is complete |
| `js/transition.js` | `js/store.js` | `import { store }` | WIRED | `transition.js:13` — `import { store } from './store.js'`; `store.get().transitionInProgress` read at lines 46, 165; `store.set()` called at lines 48, 94, 167, 205 |
| `js/transition.js` | `js/router.js` | `import { navigateTo }` | WIRED | `transition.js:14` — `import { navigateTo } from './router.js'`; called at `transition.js:98` — `navigateTo('/gallery/' + genre)` in `onComplete` |

All 5 key links verified as WIRED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DARK-05 | 03-01-PLAN.md | Clicking a photo triggers a hand-grab animation that removes it from the clothespin | SATISFIED | `darkroom.js:63-65` wires click to `startForward`; `transition.js` ACT 1 (lines 105-130) implements hand-grab sequence with pin release and neighbor sway |
| DARK-06 | 03-01-PLAN.md | Camera pulls into the selected photo (pull-in transition) leading to the filmstrip gallery | SATISFIED | `transition.js` ACT 2 (lines 134-148) scales photo to fill viewport via `getBoundingClientRect`; ACT 3 (lines 152-154) dissolves into `#gallery` placeholder; `navigateTo('/gallery/' + genre)` updates URL |

Both requirements declared in `03-01-PLAN.md` frontmatter (`requirements: [DARK-05, DARK-06]`) are satisfied.

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps only DARK-05 and DARK-06 to Phase 3. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `js/transition.js` | 124 | `photoEl.closest('.clothesline') &&` guard before wire querySelector — but result passed directly to `.to()` as selector | Info | If no wire element exists, GSAP receives `null` and logs a warning but does not crash. Non-breaking. |

No blocker or warning-level anti-patterns found. No TODO/FIXME/placeholder comments. No stub implementations. No empty handlers.

---

### Human Verification Required

#### 1. Forward transition visual quality

**Test:** Serve the site locally (`npx serve .` or equivalent), click the door to enter the darkroom, then click any genre photo.
**Expected:** Hand silhouette rises smoothly from below toward the clothespin; pin fades and slides up at ~0.6s; neighboring photos swing slightly; hand retreats; photo scales up and fills the viewport; darkroom scene fades out behind the growing photo; gallery placeholder appears with the genre name in Playfair Display; URL bar updates to `/gallery/{genre}`.
**Why human:** Multi-stage GSAP timeline spatial accuracy, easing curves, and visual continuity (no black frames, no jitter) cannot be confirmed by reading code.

#### 2. Reverse transition — no hand, correct speed

**Test:** After arriving in the gallery, click the browser back button.
**Expected:** No hand silhouette appears at any point. Gallery fades out. Photo shrinks back to its original clothesline position. Darkroom fades back in. Clothespin is restored to the photo. Sway animation resumes on clothesline photos. URL returns to `/`. Total reverse duration is approximately 1 second (half the forward ~2.1s).
**Why human:** `gsap.set(handEl, { display:'none' })` before `reverse()` must be observed at runtime; 2x speed feel must be assessed visually.

#### 3. Gallery back button

**Test:** After arriving in the gallery, click the "← Back" button in the top-left corner of the gallery.
**Expected:** Identical to browser back — gallery fades, photo shrinks back, darkroom fades in, no hand, sway resumes.
**Why human:** `history.back()` triggering `popstate` and the `route:change` chain to `startReverse()` must be confirmed in a real browser (behaviour can differ by browser/OS).

#### 4. Double-click guard (no double-trigger)

**Test:** Click a genre photo, then immediately click it or another photo again while the transition is still playing.
**Expected:** The second click produces no visible effect. Only one transition plays. No console errors.
**Why human:** `transitionInProgress` guard timing — the store is set synchronously at click, but race conditions only manifest at runtime.

#### 5. Photo restoration after reverse

**Test:** Complete the full forward + reverse cycle (click photo, go to gallery, press back). Inspect the clothesline photo that was grabbed.
**Expected:** Photo is fully visible with clothespin. Sway animation has resumed. No lingering GSAP transforms (no stuck scale, offset, or rotation). Clicking the same photo again triggers a fresh forward transition.
**Why human:** `onReverseComplete` with `clearProps` must be confirmed visually; GSAP prop cleanup is runtime-dependent.

---

### Gaps Summary

No gaps found. All 5 must-have truths are verified by static analysis. All 3 required artifacts exist and are substantive. All 5 key links are wired. Both requirements (DARK-05, DARK-06) are satisfied. No anti-patterns block goal achievement.

The phase goal — "Clicking a clothesline photo plays a hand-grab animation that removes it and then pulls the camera into the image, arriving in the filmstrip gallery" — is implemented end-to-end in the codebase. Runtime visual confirmation is the only remaining step.

---

_Verified: 2026-03-01_
_Verifier: Claude (gsd-verifier)_
