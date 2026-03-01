# Phase 3: Transition Sequences - Research

**Researched:** 2026-03-01
**Domain:** GSAP 3 multi-stage timeline animation, SVG silhouette, CSS animation/GSAP conflict resolution, photo-to-gallery pull transition
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Hand-grab animation
- Silhouette hand (dark shape, no detail — fits the dim darkroom)
- Hand reaches up from the bottom of the viewport, like the viewer reaching up to the clothesline
- After grabbing, the photo unclips and scales up to fill the screen — becoming the gateway into the gallery
- Medium pace (~1-1.5s) — deliberate but not slow, matches the walk-in timing

#### Camera pull-in
- Camera zooms into the selected photo — it fills the screen and dissolves into the gallery view
- Darkroom stays visible in the background as the photo scales — feels like physically moving closer to the image
- The zoomed photo lands as the first visible photo in the filmstrip — continuous visual connection, no hard cut
- Full pull-in transition ~1.5-2s from grab to gallery visible — brisk but smooth

#### Reverse transition
- Simplified reverse — gallery fades/zooms out back to darkroom, no hand replay on return
- Faster than forward (~50% quicker) — user wants to get back and pick another genre
- Photo is absent from its clothespin when returning — empty pin reinforces the physical metaphor
- Both themed back button and browser back button trigger the identical reverse animation

#### Visual style
- Hand silhouette has a warm amber tint — dark but catching the safelight edge, matching the darkroom palette
- No extra effects during transition — clean zoom and cross-fade, no grain intensification or blur overlays
- Neighboring photos sway slightly when one is grabbed — as if the clothesline physically moved
- Clothesline bounces subtly when the clothespin releases — sells the physical interaction

### Claude's Discretion
- Exact GSAP easing curves for hand motion and zoom
- How the silhouette hand SVG is constructed
- Exact timing offsets between grab, scale, and dissolve phases
- How to manage the "absent photo" state on the clothesline (CSS class vs DOM removal)
- The themed back button design in the filmstrip view (Phase 3 just wires the transition trigger)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DARK-05 | Clicking a photo triggers a hand-grab animation that removes it from the clothespin | GSAP multi-stage timeline: CSS sway pause → hand SVG entrance from bottom → grab gesture → clothespin release → neighbor sway disturbance. CSS `animation-play-state: paused` stops sway before GSAP takes over. |
| DARK-06 | Camera pulls into the selected photo (pull-in transition) leading to the filmstrip gallery | GSAP scale-to-fill technique: calculate scaleX/scaleY from `getBoundingClientRect()` vs viewport dimensions, animate with `transformOrigin` centered on photo's center point, dissolve darkroom with overlay opacity tween, then show gallery section. Reverse via `tl.timeScale(2).reverse()` on popstate. |
</phase_requirements>

---

## Summary

Phase 3 builds the cinematic bridge between the darkroom clothesline and the filmstrip gallery. The core technical challenge is a three-act GSAP timeline: (1) a hand silhouette SVG enters from below, grasps the selected photo, triggering clothespin release and neighbor sway; (2) the photo scales to fill the screen (camera pull-in) while the darkroom dissolves; (3) the gallery view cross-fades in so the first filmstrip frame visually matches the scaled photo. A simplified reverse transition plays on back navigation.

The existing codebase already has the right scaffold. GSAP 3.14.2 is loaded as a CDN global. The clothesline photos use CSS `@keyframes sway` with `rotate` property — this must be paused via `animationPlayState = 'paused'` before GSAP animates the same `rotate`/`transform` property, or a snap/jitter will occur (this was explicitly flagged as a Phase 3 risk in the Phase 2 RESEARCH.md). The darkroom scene controller `darkroom.js` already has a stubbed click handler for genre photos that just logs — Phase 3 replaces that stub with the full transition sequence.

The hand silhouette is an inline SVG with a single filled path — no images needed, no external assets. It is injected into the DOM by JavaScript (or pre-placed hidden in HTML), positioned fixed at the bottom of the viewport, and animated up then slightly curved to simulate a reach. The "absent photo" state after the forward transition is managed by adding a CSS class (`clothesline__photo--empty`) that hides the image and clothespin contents while keeping the structural element in the DOM — this preserves the clothesline layout so other photos don't shift positions.

**Primary recommendation:** Build the forward transition as a single GSAP timeline with labeled phases (grab, scale, dissolve) that can be paused, debugged, and tuned independently. Use `tl.timeScale(2).reverse()` for the reverse transition — same timeline, faster, no code duplication.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 (CDN global) | Multi-stage timeline, scale-to-fill animation, reverse transition | Already locked and loaded; only tool with the required timeline control depth |
| Inline SVG | Native | Hand silhouette shape | No external asset dependency; amber tint via SVG `fill`; scales perfectly at any size |
| CSS `animation-play-state` | Native | Pause clothesline sway before GSAP takes over transform | Single property controls all ongoing CSS animations without removing them |
| Vanilla JS ES modules | Native | `transition.js` scene controller module | Phase 1/2 pattern — no framework, no build step |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS custom properties (tokens) | Phase 1 tokens | Colors, timing — `--color-accent` (#c8902a) for hand amber tint | Every design value that references the darkroom palette |
| `store.js` (existing) | Project | `transitionInProgress` guard, `currentGenre` tracking | Before playing any transition — prevents double-triggers |
| `router.js` (existing) | Project | `navigateTo('/gallery/genre')` after pull-in; popstate listener for reverse | Existing pattern for all SPA navigation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG hand | PNG/WebP image | SVG is zero-dependency, recolorable via CSS fill, scales to any viewport; PNG requires an asset pipeline |
| `tl.timeScale(2).reverse()` for return | Separate reverse timeline | Duplicate code and mismatched timing; shared timeline ensures forward and reverse are always mirror images |
| CSS class for absent photo | DOM removal | Removing from DOM shifts remaining photo positions on the wire; class keeps layout stable |
| Scale+transformOrigin for pull-in | CSS perspective zoom | CSS perspective zoom can't be precisely targeted to one element; GSAP scale with calculated transformOrigin is controllable and reversible |

**Installation:** No new packages — all dependencies are already loaded.

## Architecture Patterns

### Recommended Project Structure
```
js/
├── transition.js      # NEW: forward/reverse transition controller
├── darkroom.js        # UPDATE: replace console.log stub with transition.startForward(genre, photoEl)
└── main.js            # UPDATE: wire route:change listener to call transition.startReverse() on popstate to '/'
css/
├── transition.css     # NEW: hand SVG positioning, absent-photo state, overlay styles
└── darkroom.css       # No changes needed
index.html             # UPDATE: add hand SVG element (hidden), add gallery placeholder section
```

### Pattern 1: CSS Sway Pause Before GSAP Transition

**What:** The clothesline sway uses CSS `@keyframes` with `rotate` property. GSAP also animates `rotate`/`transform` on the same element during the grab. Both cannot run simultaneously — the CSS animation wins or causes jitter. The fix is to freeze the CSS animation via `animationPlayState` before the GSAP timeline starts, then re-enable it after the transition ends (or never re-enable for the grabbed photo since it becomes absent).

**When to use:** Any time GSAP needs to animate a property that a CSS `@keyframes` is already animating.

**Example:**
```javascript
// Source: MDN animation-play-state docs
// https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state

function pauseSwayOnPhoto(photoEl) {
  photoEl.style.animationPlayState = 'paused';
}

function resumeSwayOnPhoto(photoEl) {
  photoEl.style.animationPlayState = 'running';
}

// Use before ANY GSAP tween targeting a clothesline__photo element
// Pause the grabbed photo AND its neighbors (for disturbance effect)
```

### Pattern 2: Scale-to-Fill Viewport (Photo Pull-In)

**What:** To zoom the selected photo until it fills the screen, calculate the scale needed based on the photo's current size vs the viewport. Set `transformOrigin` to the element's center point relative to its own bounds. Animate `scaleX`/`scaleY` (not `width`/`height`) and simultaneously animate `x`/`y` to move the element's center to the viewport center. Then use a darkroom overlay to dissolve.

**When to use:** Any "zoom into element to fill screen" transition.

**Example:**
```javascript
// Source: GSAP CSS Plugin docs — https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/
// Scale calculation pattern — HIGH confidence technique

function buildPullInTween(photoEl) {
  const rect = photoEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // How much to scale to fill the viewport (use max to overfill rather than letterbox)
  const scaleX = vw / rect.width;
  const scaleY = vh / rect.height;
  const scale = Math.max(scaleX, scaleY);

  // Current center of the photo in viewport coordinates
  const photoCenterX = rect.left + rect.width / 2;
  const photoCenterY = rect.top + rect.height / 2;

  // Distance to move so center of photo = center of viewport
  const dx = vw / 2 - photoCenterX;
  const dy = vh / 2 - photoCenterY;

  return gsap.to(photoEl, {
    scale: scale,
    x: `+=${dx}`,
    y: `+=${dy}`,
    transformOrigin: '50% 50%',
    duration: 1.2,
    ease: 'power2.inOut'
  });
}
```

**Critical note:** Take `getBoundingClientRect()` AFTER the sway animation is paused (otherwise the rect reflects the current sway rotation, not the neutral position). Call `gsap.set(photoEl, { rotate: 0 })` after pausing sway, before measuring.

### Pattern 3: Multi-Stage Forward Transition Timeline

**What:** A single GSAP timeline with labeled phases so each act is independently tuneable. The timeline is built once, stored in a module variable, and not re-created per click.

**When to use:** Any animation with 3+ sequential acts that each need independent easing.

**Example:**
```javascript
// Source: GSAP Timeline docs — https://gsap.com/docs/v3/GSAP/Timeline/
// transition.js

let forwardTl = null;  // stored at module level, built on first call

export function startForward(genre, photoEl, onGalleryReady) {
  if (store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true, currentGenre: genre });

  // 1. Freeze sway on ALL photos (grabbed + neighbors for disturbance)
  const allPhotos = document.querySelectorAll('.clothesline__photo');
  allPhotos.forEach(p => { p.style.animationPlayState = 'paused'; });

  // Snap grabbed photo to neutral rotation before measuring
  gsap.set(photoEl, { rotate: 0 });

  const rect = photoEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / rect.width, vh / rect.height);
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);

  const handEl = document.getElementById('hand-silhouette');
  const pinEl = photoEl.querySelector('.clothesline__pin');
  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');

  forwardTl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      store.set({ transitionInProgress: false });
      // Mark photo as absent on clothesline
      photoEl.classList.add('clothesline__photo--empty');
      onGalleryReady?.();
    }
  });

  // ACT 1: GRAB (~0-1.2s)
  forwardTl
    // Hand enters from bottom
    .set(handEl, { display: 'block', y: '100vh', opacity: 1 })
    .to(handEl, { y: '0vh', duration: 0.8, ease: 'power2.out' }, 0)
    // Clothespin releases (pin slides/fades)
    .to(pinEl, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.6)
    // Neighbor photos sway (disturbance)
    .to(getNeighborPhotos(photoEl), {
      rotate: (i) => (i % 2 === 0 ? 3 : -3),
      duration: 0.4,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    }, 0.7)
    // Hand retreats
    .to(handEl, { y: '100vh', opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.9)

  // ACT 2: PULL-IN (~0.9-2.1s)
    .to(photoEl, {
      scale: scale,
      x: `+=${dx}`,
      y: `+=${dy}`,
      transformOrigin: '50% 50%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, 0.9)
    // Darkroom fades behind the growing photo
    .to(darkroomEl, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 1.4)

  // ACT 3: DISSOLVE (~1.8-2.1s)
    .set(galleryEl, { display: 'block', opacity: 0 }, 1.8)
    .to(galleryEl, { opacity: 1, duration: 0.3, ease: 'none' }, 1.8)
    .set(darkroomEl, { display: 'none' }, 2.1);

  return forwardTl;
}
```

### Pattern 4: Reverse Transition via timeScale + reverse()

**What:** The same forward timeline plays in reverse, at 2x speed, giving the "50% quicker" return feel. Timeline `reverse()` inverts all easing curves automatically (ease-out becomes ease-in). `timeScale(2)` doubles playback speed.

**When to use:** Any reverse navigation that should mirror the forward animation.

**Example:**
```javascript
// Source: GSAP Timeline.reverse() docs — https://gsap.com/docs/v3/GSAP/Timeline/reverse()/
// transition.js

export function startReverse(onDarkroomReady) {
  if (!forwardTl || store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const galleryEl = document.getElementById('gallery');
  const darkroomEl = document.getElementById('darkroom');

  // Ensure darkroom is visible and gallery is hiding
  gsap.set(darkroomEl, { display: 'block', opacity: 0 });

  // Reverse the forward timeline at 2x speed (no hand replay since hand already retreated)
  forwardTl
    .timeScale(2)
    .reverse();

  // Listen for reverse complete
  forwardTl.eventCallback('onReverseComplete', () => {
    // Reset timeline for potential re-use
    forwardTl.timeScale(1);
    store.set({ transitionInProgress: false });
    onDarkroomReady?.();
  });
}
```

**Important:** The hand silhouette already retreats during the forward timeline's ACT 1 end. When reversed, it would briefly re-appear entering from below, which contradicts the "no hand replay on return" decision. **Resolution:** The hand portion of the timeline should be in a *nested* sub-timeline that is excluded from the `reverse()` scope, OR the hand is set to `display: none` before calling `reverse()` and re-positioned off-screen separately. See "Open Questions" for the preferred approach.

### Pattern 5: Absent Photo State

**What:** After the forward transition, the grabbed photo must appear absent (empty pin, no image). A CSS class hides the image contents and clothespin while keeping the `<figure>` in the DOM to prevent layout shift.

**When to use:** After any forward transition completes, before the reverse transition could restore the photo.

**Example:**
```css
/* transition.css */
/* Photo slot remains in DOM but shows as empty */
.clothesline__photo--empty .clothesline__image {
  visibility: hidden;   /* hides content, preserves layout space */
  opacity: 0;
}

.clothesline__photo--empty .clothesline__pin {
  visibility: hidden;
  opacity: 0;
}
```

```javascript
// After reverse transition completes, restore the photo
photoEl.classList.remove('clothesline__photo--empty');
gsap.set(photoEl, { clearProps: 'scale,x,y,rotate,opacity' }); // reset GSAP-set transforms
photoEl.style.animationPlayState = 'running'; // restore sway
```

### Pattern 6: popstate Hook for Reverse Transition

**What:** The existing `router.js` dispatches `route:change` events with `trigger: 'popstate'` on browser back/forward. `main.js` already listens to this. Phase 3 wires the reverse transition to this listener when navigating back to `'/'` (darkroom).

**Example:**
```javascript
// main.js update — wire reverse transition
import { startReverse } from './transition.js';

window.addEventListener('route:change', (e) => {
  if (e.detail.trigger === 'popstate' && e.detail.path === '/') {
    startReverse(() => {
      // darkroom is ready — restore sway on absent photo's neighbors
      document.querySelectorAll('.clothesline__photo:not(.clothesline__photo--empty)')
        .forEach(p => { p.style.animationPlayState = 'running'; });
    });
  }
});
```

### Anti-Patterns to Avoid

- **Animating `width`/`height` for pull-in:** Triggers layout reflow every frame. Use `scale` + `x`/`y` transform instead.
- **Measuring `getBoundingClientRect()` while sway animation is running:** The rect reflects the current rotated position, not neutral. Always pause sway and snap to `rotate: 0` before measuring.
- **Playing GSAP tween on an element while CSS animation is running the same property:** Results in snap/jitter. Always pause CSS animation first via `animationPlayState = 'paused'`.
- **Building the timeline inside the click handler:** Creates a new timeline on each click. Build once, reference from module scope.
- **Using `timeline.reverse()` directly on a timeline that contains `gsap.set()` calls:** Set tweens with zero duration are reversible but can behave unexpectedly if not at the timeline boundaries. Put `display: none/block` sets at timeline edges.
- **Calling `navigateTo()` before the gallery is visually ready:** Routes should change in the `onComplete` callback after the gallery is visible, not at click time.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-act animation sequencing | `setTimeout` chains or Promise.all | `gsap.timeline()` with position parameters and labels | GSAP labels allow independent tuning of each act without recalculating all subsequent delays |
| Scale-to-fill calculation | Manual pixel math in every function | `getBoundingClientRect()` + `Math.max(vw/w, vh/h)` — one utility function | Centralizes the viewport-relative scale math; handles window resize automatically when called at animation time |
| Reverse animation | Separate reverse timeline with mirrored tweens | `forwardTl.timeScale(2).reverse()` | Code stays in sync; easing inversion is automatic; no risk of forward/reverse drifting apart over time |
| CSS animation/GSAP conflict | Removing and re-adding CSS animation classes | `element.style.animationPlayState = 'paused'/'running'` | Pause preserves animation progress for when it resumes; class removal resets to keyframe start |
| Hand SVG asset | External PNG/WebP image | Inline SVG `<path>` in HTML | Zero HTTP request; amber fill via CSS custom property; transforms fine at all scales; immediate DOM control |

**Key insight:** The timeline approach from Phase 2 scales directly to Phase 3's three-act sequence. The same pattern (`gsap.timeline({ paused: true })` built once, played on trigger) handles far more complex sequences — just add more `.to()` / `.set()` calls with position parameters.

## Common Pitfalls

### Pitfall 1: CSS Sway vs GSAP Transform Conflict (CRITICAL)
**What goes wrong:** GSAP tries to animate `rotate`/`transform` on a `.clothesline__photo` element while the CSS `@keyframes sway` is actively animating the same property. The photo snaps to 0 rotation or jitters between GSAP and CSS values.
**Why it happens:** CSS animations and GSAP both write to `transform`. CSS wins in most browsers when there's a conflict, or the result is undefined behavior.
**How to avoid:** Call `element.style.animationPlayState = 'paused'` on ALL clothesline photos before starting any GSAP transition. Then `gsap.set(grabbedPhoto, { rotate: 0 })` to snap to neutral before measuring. This was explicitly called out as a Phase 3 risk in the Phase 2 RESEARCH.md.
**Warning signs:** Photo snaps to an unexpected rotation angle when click happens; grab animation starts at a tilted position.

### Pitfall 2: getBoundingClientRect Measured During Rotation
**What goes wrong:** The scale calculation uses a photo rect that reflects its current sway angle (e.g., 1.3deg rotation). The scaled photo doesn't center correctly — it pulls to one side.
**Why it happens:** `getBoundingClientRect()` returns the actual rendered bounding box, which is larger than the neutral photo when rotated (the rotation expands the axis-aligned bounding box).
**How to avoid:** Always pause sway and snap to `rotate: 0` BEFORE calling `getBoundingClientRect()`. The sequence is: (1) pause animation, (2) `gsap.set(el, { rotate: 0 })`, (3) measure rect, (4) start timeline.
**Warning signs:** Photo pull-in lands slightly off-center or the gallery transition doesn't align with the filmstrip's first frame.

### Pitfall 3: Double-Trigger During Transition
**What goes wrong:** User clicks a second photo while the first transition is playing. Two timelines run simultaneously. State corrupts.
**Why it happens:** Missing `transitionInProgress` guard.
**How to avoid:** Check `store.get().transitionInProgress` at the top of `startForward()`. Return immediately if true. Set `true` on start, `false` in `onComplete`.
**Warning signs:** Clicking another photo during animation causes visual chaos.

### Pitfall 4: Hand SVG Stacking Context
**What goes wrong:** The hand silhouette appears behind the clothesline photos or behind the darkroom background even though it's positioned at a high z-index.
**Why it happens:** Parent elements create stacking contexts that isolate child z-index values. If the hand SVG is a child of `#darkroom` but `.clothesline__photo` elements have `z-index: 2` on `.clothesline`, the hand must have a higher z-index within the same stacking context.
**How to avoid:** Place the hand SVG as a direct child of `#darkroom` at the end of the DOM order (last child = painted last = on top by default). Give it `z-index: 10` — higher than any clothesline element. Or place it as a child of `#app` (outside `#darkroom`) with `position: fixed` and a very high z-index (e.g., 100).
**Warning signs:** Hand silhouette appears behind photos during grab animation; can't be seen despite having correct `opacity: 1`.

### Pitfall 5: Reverse Timeline Replays the Hand
**What goes wrong:** Calling `forwardTl.reverse()` replays the hand entering from below on the return transition, which the user explicitly decided against ("simplified reverse — no hand replay on return").
**Why it happens:** `reverse()` reverses the entire timeline including the hand entrance/exit tweens.
**How to avoid:** Two options: (A) Extract the hand animation into a separate `handTl` nested timeline that is excluded from the reversible scope by animating it forward-only in an `onStart` callback. (B) Before calling `reverse()`, `gsap.set(handEl, { display: 'none' })` and also set the hand tweens' `invalidate()` or use a conditional callback. **Recommended:** Use Option A — nest `handTl` inside the forward timeline but mark it as `reversed: false` using a label trick, OR simply build the hand portion as a standalone forward-only play in `onStart`, while the main `forwardTl` starts from ACT 2 for the reversible portion.
**Warning signs:** On browser back, a dark hand shape briefly appears at the bottom of the screen.

### Pitfall 6: Gallery Section Not Prepped Before Dissolve
**What goes wrong:** The gallery `display: none` at timeline start. When `gsap.set(galleryEl, { display: 'block' })` fires at ACT 3, there's a layout flash as the gallery DOM renders for the first time while the animation is playing.
**Why it happens:** First render of a complex DOM subtree is expensive; combined with a live animation, it causes dropped frames.
**How to avoid:** Preload the gallery section: call `initGallery(genre)` (Phase 4 function) before the forward timeline starts — even just setting `display: block; opacity: 0` so the browser has already laid out the gallery before the dissolve begins.
**Warning signs:** Visible stutter or flash at the ACT 2→ACT 3 transition.

### Pitfall 7: Photo Absent State Persists After Reverse
**What goes wrong:** After the user navigates back to the darkroom, the previously selected photo remains visually absent (empty pin). The `clothesline__photo--empty` class was never removed.
**Why it happens:** `startReverse()` forgets to remove the class and reset GSAP transforms on the photo element.
**How to avoid:** In the `onReverseComplete` callback: remove `clothesline__photo--empty`, call `gsap.set(photoEl, { clearProps: 'scale,x,y,rotate,opacity,transform' })`, restore `animationPlayState = 'running'` on all photos.
**Warning signs:** Clicking back from gallery shows the darkroom with an empty clothespin; sway animation doesn't resume.

## Code Examples

Verified patterns from official sources:

### CSS Animation Pause Pattern
```javascript
// Source: MDN — https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state
// Verified: animation-play-state 'paused' freezes at current frame; 'running' resumes from that frame

// Pause all clothesline photos before any transition
document.querySelectorAll('.clothesline__photo').forEach(el => {
  el.style.animationPlayState = 'paused';
});

// Resume sway after transition (on clotheslines that still have photos)
document.querySelectorAll('.clothesline__photo:not(.clothesline__photo--empty)').forEach(el => {
  el.style.animationPlayState = 'running';
});
```

### GSAP Timeline Position Parameters
```javascript
// Source: https://gsap.com/docs/v3/GSAP/Timeline/
// Position param syntax:
//   0            — absolute time from start
//   "<"          — same start time as previous tween
//   ">"          — after end of previous tween
//   "<0.3"       — 0.3s after the start of previous tween
//   "label"      — at a named label
//   "+=0.2"      — 0.2s after the current end of the timeline

const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
tl
  .to(handEl, { y: 0, duration: 0.8 }, 0)              // hand starts at t=0
  .to(pinEl, { opacity: 0, duration: 0.3 }, '<0.5')    // pin fades 0.5s after hand starts
  .to(photoEl, { scale: 5, duration: 1.2 }, '>-0.2')  // zoom starts 0.2s before pin finishes
  .to(darkroomEl, { opacity: 0, duration: 0.8 }, '<')  // darkroom fades at same time as zoom
  .set(galleryEl, { display: 'block' }, '>')            // gallery shows after darkroom fades
  .to(galleryEl, { opacity: 1, duration: 0.3 }, '<');   // gallery fades in immediately
```

### Reverse at 2x Speed
```javascript
// Source: https://gsap.com/docs/v3/GSAP/Timeline/reverse()/
// timeScale(2) doubles speed; reverse() inverts easing (ease-out becomes ease-in)

forwardTl
  .timeScale(2)
  .eventCallback('onReverseComplete', () => {
    store.set({ transitionInProgress: false });
    // restore photo, resume sway
  })
  .reverse();
```

### Inline SVG Hand Silhouette (HTML)
```html
<!-- Place as last child of #darkroom, so it paints over clothesline photos -->
<!-- Source: SVG path approach — no external asset needed -->
<svg
  id="hand-silhouette"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 120 180"
  aria-hidden="true"
  style="
    position: fixed;
    bottom: -180px;        /* starts off-screen */
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 180px;
    z-index: 100;
    display: none;
    pointer-events: none;
    fill: rgba(40, 24, 8, 0.85);   /* dark amber — safelight edge catch */
    filter: drop-shadow(0 0 8px rgba(200, 144, 42, 0.4));  /* --color-accent glow */
  "
>
  <!--
    Simple upward-reaching hand silhouette:
    - Palm base at bottom
    - Four fingers + thumb pointing upward
    - Derived from basic geometric shapes — can be refined later
    Claude's discretion: exact path points
  -->
  <path d="
    M 55,170 L 50,80 L 45,50 C 44,38 56,38 57,50 L 58,70
    L 58,40 C 57,28 69,28 70,40 L 71,65
    L 71,35 C 70,23 82,23 83,35 L 84,62
    L 84,45 C 83,33 95,33 96,45 L 97,80
    L 97,90 C 105,75 112,80 110,92 L 97,120
    C 97,140 90,155 85,170 Z
  "/>
</svg>
```

### Scale-to-Fill Calculation
```javascript
// Source: GSAP CSS Plugin docs — transformOrigin, scale
// getBoundingClientRect technique — verified pattern

function calcFillScale(el) {
  // Must be called AFTER: animationPlayState paused + gsap.set(el, { rotate: 0 })
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    scale: Math.max(vw / rect.width, vh / rect.height),
    dx: vw / 2 - (rect.left + rect.width / 2),
    dy: vh / 2 - (rect.top + rect.height / 2),
  };
}

// Usage in timeline:
const { scale, dx, dy } = calcFillScale(photoEl);
tl.to(photoEl, {
  scale,
  x: `+=${dx}`,
  y: `+=${dy}`,
  transformOrigin: '50% 50%',
  duration: 1.2,
  ease: 'power2.inOut'
}, 'pull-in');
```

### CSS Absent Photo State
```css
/* transition.css */
/* Hides photo contents without removing from DOM — preserves layout */
.clothesline__photo--empty .clothesline__image,
.clothesline__photo--empty .clothesline__pin {
  visibility: hidden;
  opacity: 0;
  transition: none; /* no hover/GSAP transitions on hidden content */
}

/* Suppress hover effects on empty slot */
.clothesline__photo--empty {
  cursor: default;
  pointer-events: none;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate forward/reverse timelines | Single timeline + `timeScale().reverse()` | GSAP 3 | Forward and reverse guaranteed to stay in sync; easing automatically inverts |
| `height: 100vh` for full-screen | `100dvh` with `100vh` fallback | Safari 15.4 / Chrome 108 (2022) | No impact for transition phase — this was Phase 2 |
| Animating `width`/`height` for zoom | `scale` + `transform` only | Long-standing GSAP best practice | GPU-composited; no layout reflow; critical for smooth 60fps zoom |
| `display: none` removal for state | CSS class + `visibility: hidden` | Long-standing CSS best practice | Preserves DOM layout; avoids clothesline photo position shifting |

**Deprecated/outdated:**
- `TweenMax`/`TweenLite`: Replaced by unified `gsap` in GSAP 3 — already using correct API
- CSS transform string syntax (`transform: 'rotate(1.5deg)'`): Use standalone CSS `rotate:` property for keyframes per Phase 2 decision

## Open Questions

1. **How to prevent hand replay on reverse (Pitfall 5)**
   - What we know: `forwardTl.reverse()` will attempt to replay the hand entrance in reverse. User decided no hand on return.
   - What's unclear: The cleanest implementation — nested sub-timeline vs. conditional in `onReverseComplete` vs. using `gsap.set(handEl, { display: 'none' })` before calling `reverse()`.
   - Recommendation: Before calling `forwardTl.reverse()`, call `gsap.set(handEl, { display: 'none', y: '100vh' })`. This pre-positions the hand off-screen before the reverse timeline tries to animate it. The hand tweens in the reversed timeline will still run but won't be visible. This is the simplest implementation — no timeline restructuring needed. Planner should document this as a known approach and mark it for verification during implementation.

2. **Gallery section placeholder for Phase 3**
   - What we know: Phase 4 builds the filmstrip gallery. Phase 3 needs to dissolve INTO the gallery. For Phase 3 testing, there's no gallery yet.
   - What's unclear: Should Phase 3 create a placeholder `#gallery` section (dark background, genre name text) that Phase 4 replaces, or should Phase 3 skip the dissolve-to-gallery step and just fade to black?
   - Recommendation: Create a minimal `#gallery` placeholder — dark background, genre name in Playfair Display, no other content. Phase 3 can fully implement the transition and verify the visual continuity. Phase 4 replaces the placeholder content with the real filmstrip. This aligns with the success criteria ("no hard cut or blank frame visible").

3. **Hand SVG path shape**
   - What we know: User decided silhouette hand, amber tint, reaches from below. Claude has discretion over exact SVG path.
   - What's unclear: The specific path data for an upward-reaching hand silhouette that reads as a grabbing gesture.
   - Recommendation: Start with a simple geometric approximation (palm rectangle + finger rectangles), test it in the darkroom context, and refine. The amber `filter: drop-shadow()` and the animation (rising from below, stopping near the clothespin) do most of the storytelling — the shape doesn't need to be photorealistic. Planner should allocate time for at least one visual iteration.

## Sources

### Primary (HIGH confidence)
- [GSAP Timeline docs](https://gsap.com/docs/v3/GSAP/Timeline/) — position parameters, labels, reverse(), timeScale(), onComplete/onReverseComplete callbacks
- [GSAP Timeline.reverse() docs](https://gsap.com/docs/v3/GSAP/Timeline/reverse()/) — reverse() behavior confirmed: inverts easing, plays from current position backwards
- [GSAP CSS Plugin docs](https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/) — scale, xPercent, yPercent, transformOrigin behavior verified
- [MDN animation-play-state](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state) — pause/resume CSS animations via JS
- Phase 2 source files (`darkroom.js`, `darkroom.css`, `entrance.js`, `main.js`, `router.js`, `store.js`, `index.html`) — confirmed existing architecture, sway animation implementation, click handler stub, store schema

### Secondary (MEDIUM confidence)
- [CSS-Tricks — Play and Pause CSS Animations](https://css-tricks.com/how-to-play-and-pause-css-animations-with-css-custom-properties/) — `animation-play-state: paused` pattern confirmed
- Phase 2 RESEARCH.md Pitfall 4 — explicitly flags the CSS animation/GSAP conflict as a Phase 3 risk, with `clearProps: 'animation'` suggestion (superseded by `animationPlayState` approach which is cleaner)
- [GSAP community — Scale image to full screen on click](https://gsap.com/community/forums/topic/24609-scale-image-to-full-screen-on-click-horizontal-scroll-case/) — `getBoundingClientRect` + scale calculation approach confirmed as community standard

### Tertiary (LOW confidence)
- WebSearch results on GSAP zoom/scale fill-screen patterns — general approach confirmed via multiple forum threads; specific code derived from first principles using official API docs
- SVG hand silhouette path — no authoritative reference; path data in code examples is a starting sketch to be refined during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GSAP 3.14.2 already locked and loaded; CSS animation-play-state is MDN-documented standard; inline SVG is native
- Architecture: HIGH — All patterns derived from official GSAP docs and verified against existing Phase 2 code; scale calculation is math-based (correct by construction)
- Pitfalls: HIGH — CSS/GSAP conflict and getBoundingClientRect-during-rotation are verified failure modes documented in Phase 2; other pitfalls are logical consequences of the approach
- SVG path shape: LOW — Placeholder path in code examples; will need visual iteration during implementation

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (GSAP 3 stable; CSS animation-play-state is long-standing spec)
