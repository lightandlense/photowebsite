# Phase 2: Entrance and Darkroom Scene - Research

**Researched:** 2026-02-28
**Domain:** GSAP 3 animation, CSS layered scene composition, interactive hover effects, mobile responsiveness
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Entrance Visual Style
- Photo-realistic layers composited as parallax elements — real photographic textures (brick, concrete, metal) not illustrated or abstract
- Industrial metal door as focal point — heavy steel/iron door with handle, warehouse/loft studio vibe, warm light leaking from underneath and around edges
- Full building facade visible — brick wall, window, street number, ground/sidewalk. Feels like standing outside a real place
- "Step Inside" text in Playfair Display (matching site serif typography), centered near the door, gentle fade-in after 1-2 second delay

#### Walk-in Animation Feel
- Slow and cinematic pacing (3-4 seconds total) — deliberate, dramatic entrance matching the site's "cinematic & slow" design language
- Depth layers shift forward — ground plane moves down, building walls move apart/aside, door grows larger as visitor "approaches" and walks through. Physical forward-motion feeling
- Transition through darkness — scene goes dark as visitor passes through the doorway, then darkroom lighting fades up, like eyes adjusting to the dark
- Always show entrance on every visit — the entrance IS the experience, sets the mood each time. No skip for returning visitors

#### Darkroom Atmosphere
- Minimal but evocative detail level — clothesline with photos is the focus, plus one or two accent details (like a safe light or developing tray) to suggest a real darkroom without cluttering the view
- Slightly staggered photo heights on clothesline — natural variation in how they hang, some a bit higher/lower, like they were clipped on casually. Organic feel
- Barely perceptible ambient sway — very subtle, slow movement noticed if you stare, mostly about making the scene feel alive rather than actively animated
- Warm amber safe light illumination — classic darkroom amber/red safe light glow from one side, warm, moody, authentic to film photography

#### In-World Navigation
- Clearly visible elements — obvious enough that visitors know they can click them, labels always visible, positioned where eyes naturally go
- Both elements positioned below the clothesline — silhouette figure standing on the floor, business card on a table/tray. Natural eye flow downward from photos
- Warm glow + label brightens on hover — consistent with door hover behavior, subtle warm glow effect and label text becomes more prominent
- Small serif text labels (Playfair Display) positioned right below each element — like gallery labels, always visible at reduced opacity

### Claude's Discretion
- Exact parallax layer count and z-depth values
- Safe light color temperature (amber vs red spectrum)
- Clothespin visual style and attachment point
- Business card design details
- Silhouette figure pose and proportions
- Specific easing curves for the walk-in animation
- Accent detail selection (which darkroom props to include)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ENTR-01 | Visitor sees a photo-realistic old photo studio building exterior on page load | CSS layered scene with absolute-positioned image layers; `#entrance` section replaces placeholder content in `#app` |
| ENTR-02 | Warm light leaks from under the studio door, inviting entry | CSS radial-gradient or box-shadow amber glow on door-bottom element; CSS animation for subtle pulse |
| ENTR-03 | "Step Inside" text fades in near the door after a short delay | `gsap.to()` with `opacity: 1` after 1.5s delay; Playfair Display, `--color-text` token |
| ENTR-04 | Door handle/frame glows warmly on hover with cursor change | `mouseenter`/`mouseleave` + `gsap.to()` box-shadow or filter; `cursor: pointer` CSS |
| ENTR-05 | Clicking the door triggers a parallax walk-in animation (layered ground/building shift) | `gsap.timeline({ paused: true })` triggered on click; layers animate `y`, `scale`, `x` with cinematic easing |
| ENTR-06 | Door opens and fades into the darkroom interior | Timeline continuation: door scale/fade, black overlay fade, darkroom section fade in via `gsap.to()` opacity |
| ENTR-07 | On mobile, view is cropped to focus on the door area with clear tap target | CSS `@media (max-width: 768px)` with `overflow: hidden`, `object-position: center`, large tap-target overlay |
| DARK-01 | Darkroom scene has dim ambient lighting with warm tones | CSS background `--color-bg` (#1a1208) with radial gradient amber safe-light; warm color palette from tokens |
| DARK-02 | Film grain texture overlay on the darkroom scene | Already implemented in `grain.css` via `body::before` SVG feTurbulence — auto-covers darkroom |
| DARK-03 | Five genre photographs displayed hanging from a clothesline with clothespins | Flex/absolute positioned `<figure>` elements with top-attached clothespin SVG/image; staggered vertical offsets |
| DARK-04 | Clothesline photos have subtle ambient sway animation | CSS `@keyframes sway` with `rotate` ±2deg, `transform-origin: top center`, 4-6s duration, `alternate infinite` |
| DARK-07 | Silhouette figure visible in the darkroom background — click navigates to About page | Absolutely positioned SVG or PNG silhouette; click calls `navigateTo('/about')` from router.js |
| DARK-08 | Silhouette has a small always-visible "About" label near it | `<span>` below silhouette in Playfair Display, `opacity: 0.5` default, brightens on hover |
| DARK-09 | Business card on the darkroom table — click navigates to Contact page | Absolutely positioned image; click calls `navigateTo('/contact')` from router.js |
| DARK-10 | Business card has a small always-visible "Contact" label near it | `<span>` below card in Playfair Display, `opacity: 0.5` default, brightens on hover |
</phase_requirements>

---

## Summary

Phase 2 is a GSAP-driven scene composition phase. The core technical challenge is building two CSS "painted scenes" (entrance exterior + darkroom interior) as layered HTML elements, then orchestrating transitions between them with GSAP timelines. The stack is already locked from Phase 1: GSAP 3.14.2 on CDN as a global, vanilla JS modules, no build step, no framework.

The entrance scene uses absolute-positioned image layers that GSAP animates on door click — layers shift on x/y/scale to simulate walking forward through the door. A black overlay fades in/out during the transition through darkness. The darkroom scene is a single fixed-height viewport with CSS ambient lighting (radial gradients, box-shadows), the clothesline photos with CSS sway animation, and clickable navigation elements wired to the existing router.

The film grain overlay from Phase 1 (`body::before` SVG feTurbulence at 0.04 opacity) already covers both scenes with no additional work. The SPA router from Phase 1 (`navigateTo()` from router.js) handles the in-world navigation clicks. Phase 2's job is the visual scenes and the click-triggered GSAP animation sequences connecting them.

**Primary recommendation:** Build both scenes as CSS layers with absolute positioning, use GSAP timeline (paused on creation, .play() on door click) for the walk-in sequence, CSS @keyframes for ongoing clothesline sway, and mouseenter/mouseleave GSAP tweens for hover glows.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 (CDN global) | Walk-in timeline, hover glows, fade-in text, scene transitions | Locked in Phase 1; already loaded; industry standard for cinematic sequences |
| Vanilla JS (ES modules) | Native | Scene controllers, event wiring, router calls | Phase 1 pattern — no framework, no build step |
| CSS @keyframes | Native | Clothesline ambient sway — runs forever without JS involvement | Better than GSAP for infinite ambient loops; no JS overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS custom properties (tokens) | Phase 1 tokens | Color palette, durations, font — all scene values use these | Every CSS value that matches the design system |
| Playfair Display (Google Fonts) | Already loaded | "Step Inside" text, navigation labels | All serif text per locked decision |
| CSS radial-gradient | Native | Safe-light amber glow, darkroom lighting atmosphere | Ambient lighting effects that don't need animation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS @keyframes for sway | GSAP repeat: -1 timeline | GSAP repeat works fine but adds JS overhead for something that never changes; CSS runs on compositor |
| CSS box-shadow/filter for glow | Canvas or WebGL | Canvas overkill; CSS filter: drop-shadow() is composited, no layout impact |
| Absolute positioned layers | CSS 3D perspective parallax | 3D perspective is elegant but overflow: hidden breaks it; absolute positioning is simpler to control with GSAP |

**Installation:** No new packages — all dependencies loaded in Phase 1.

## Architecture Patterns

### Recommended Project Structure
```
index.html             # Add #entrance and #darkroom sections; remove Phase 1 placeholder
css/
├── tokens.css         # Unchanged — Phase 1 tokens already correct
├── base.css           # Unchanged
├── grain.css          # Unchanged — already covers all scenes
├── entrance.css       # NEW: entrance scene layers, door glow, "Step Inside" text
└── darkroom.css       # NEW: darkroom atmosphere, clothesline layout, nav element labels
js/
├── main.js            # UPDATE: remove appendTestNav(); call initEntrance()
├── router.js          # Unchanged
├── store.js           # Unchanged
├── entrance.js        # NEW: entrance scene controller (DOM setup, walk-in timeline, hover, mobile)
└── darkroom.js        # NEW: darkroom scene controller (sway, hover glows, nav wiring)
images/
├── entrance/          # NEW: building facade layers (bg, wall, door, ground, sky)
└── darkroom/          # NEW: darkroom background, clothespin SVG/PNG, silhouette, business card
```

### Pattern 1: Scene as Layered Absolute-Positioned Elements

**What:** Each scene is a `position: relative; overflow: hidden; width: 100vw; height: 100dvh` container. All visual elements are `position: absolute` children stacked via z-index. GSAP addresses each layer by data attribute or class.

**When to use:** Any "painted scene" with multiple depth layers that GSAP will animate independently.

**Example:**
```html
<!-- Source: Phase 1 pattern + Keith Clark pure CSS parallax principles -->
<section id="entrance" class="scene">
  <div class="scene__layer" data-layer="sky"      style="z-index:1"></div>
  <div class="scene__layer" data-layer="building" style="z-index:2"></div>
  <div class="scene__layer" data-layer="wall"     style="z-index:3"></div>
  <div class="scene__layer" data-layer="door"     style="z-index:4" id="door"></div>
  <div class="scene__layer" data-layer="ground"   style="z-index:5"></div>
  <div class="scene__overlay--darkness"            style="z-index:8"></div>
  <p class="entrance__cta" style="z-index:6">Step Inside</p>
</section>
```

```css
/* entrance.css */
.scene {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
}
.scene__layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  will-change: transform;  /* compositor hint for GSAP animation */
}
.scene__overlay--darkness {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
}
```

### Pattern 2: GSAP Paused Timeline Triggered on Click

**What:** Build the entire walk-in sequence as a paused GSAP timeline. Attach a click listener to the door element that calls `tl.play()`. Guard with `transitionInProgress` store flag to prevent double-clicks.

**When to use:** Any multi-step animation that should play exactly once per trigger, in sequence.

**Example:**
```javascript
// Source: GSAP official docs — https://gsap.com/docs/v3/GSAP/Timeline/
// entrance.js

import { store } from './store.js';
import { navigateTo } from './router.js';

export function initEntrance() {
  const door = document.getElementById('door');
  const darkness = document.querySelector('.scene__overlay--darkness');

  // "Step Inside" text fades in after 1.5s delay
  gsap.to('.entrance__cta', {
    opacity: 1,
    duration: var_cinematic,   // use CSS var token value
    delay: 1.5,
    ease: 'power2.out'
  });

  // Door hover glow
  door.addEventListener('mouseenter', () => {
    gsap.to(door, { filter: 'drop-shadow(0 0 18px rgba(255,140,0,0.7))', duration: 0.3 });
    door.style.cursor = 'pointer';
  });
  door.addEventListener('mouseleave', () => {
    gsap.to(door, { filter: 'none', duration: 0.4 });
  });

  // Build walk-in timeline (paused until click)
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      store.set({ currentRoute: '/darkroom', transitionInProgress: false });
      showDarkroom();
    }
  });

  tl
    // Phase A: approach — layers scale/shift toward viewer (1.5s)
    .to('[data-layer="ground"]',   { y: '20%',   scale: 1.1, duration: 1.5, ease: 'power2.in' }, 0)
    .to('[data-layer="building"]', { scale: 1.15, duration: 1.5, ease: 'power2.in' }, 0)
    .to('[data-layer="door"]',     { scale: 1.4,  duration: 1.5, ease: 'power2.in' }, 0)
    .to('.entrance__cta',          { opacity: 0,  duration: 0.4, ease: 'power2.out' }, 0)
    // Phase B: darkness — screen goes black (0.6s)
    .to(darkness, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 1.3)
    // Phase C: hold darkness briefly
    .to(darkness, { opacity: 1, duration: 0.3 }, 1.9)
    // Phase D: darkroom fades up — handled in onComplete / showDarkroom()

  door.addEventListener('click', () => {
    if (store.get().transitionInProgress) return;
    store.set({ transitionInProgress: true });
    tl.play();
  });
}
```

### Pattern 3: CSS Clothesline Sway Animation

**What:** Infinite ambient rotation on each photo element using CSS `@keyframes` with `transform-origin: top center` and `animation-direction: alternate`. Each photo gets a slightly different duration and delay for organic randomness.

**When to use:** Any infinite ambient animation that never stops — CSS is better than GSAP for this because it runs on the compositor without JS ticking.

**Example:**
```css
/* darkroom.css */
/* Source: MDN CSS animation + transform-origin docs */
@keyframes sway {
  from { rotate: -1.5deg; }
  to   { rotate:  1.5deg; }
}

.clothesline__photo {
  transform-origin: top center;
  animation: sway 5s ease-in-out infinite alternate;
  will-change: rotate;
}

/* Stagger durations per photo for organic feel */
.clothesline__photo:nth-child(1) { animation-duration: 4.8s; animation-delay: -0.5s; }
.clothesline__photo:nth-child(2) { animation-duration: 5.2s; animation-delay: -1.2s; }
.clothesline__photo:nth-child(3) { animation-duration: 4.6s; animation-delay: -0.8s; }
.clothesline__photo:nth-child(4) { animation-duration: 5.5s; animation-delay: -1.8s; }
.clothesline__photo:nth-child(5) { animation-duration: 4.9s; animation-delay: -0.3s; }
```

### Pattern 4: In-World Navigation Hover Glow

**What:** `mouseenter`/`mouseleave` on the silhouette and business card animate `filter: drop-shadow()` with warm amber color. Label opacity bumps from 0.5 to 1. Click calls `navigateTo()`.

**When to use:** Any interactive object in the scene that needs hover feedback consistent with the door hover pattern.

**Example:**
```javascript
// darkroom.js
import { navigateTo } from './router.js';

function wireNavElement(elementId, labelId, route) {
  const el = document.getElementById(elementId);
  const label = document.getElementById(labelId);

  el.addEventListener('mouseenter', () => {
    gsap.to(el,    { filter: 'drop-shadow(0 0 12px rgba(255,140,0,0.6))', duration: 0.3 });
    gsap.to(label, { opacity: 1, duration: 0.3 });
    el.style.cursor = 'pointer';
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el,    { filter: 'none', duration: 0.4 });
    gsap.to(label, { opacity: 0.5, duration: 0.4 });
  });
  el.addEventListener('click', () => navigateTo(route));
}

export function initDarkroom() {
  wireNavElement('silhouette-figure', 'label-about',   '/about');
  wireNavElement('business-card',     'label-contact', '/contact');
  showPhotosWithStagger();
}
```

### Pattern 5: Mobile Responsive Scene Cropping

**What:** On mobile (`max-width: 768px`), the entrance scene `overflow: hidden` crops to center on the door. The door element gets a large transparent tap-target overlay `(min-height: 44px per Apple HIG)`. `dvh` units handle iOS Safari's dynamic viewport bar.

**When to use:** Any full-viewport scene that must work on both desktop (wide view) and mobile (cropped view).

**Example:**
```css
/* entrance.css — mobile overrides */
@media (max-width: 768px) {
  .scene {
    height: 100dvh;   /* dvh = dynamic viewport height: handles iOS Safari address bar */
  }
  [data-layer="building"] {
    background-position: center center;
    /* Crop to door area by scaling up and repositioning */
    transform: scale(1.4) translateX(-5%);
  }
  #door {
    /* Ensure touch target meets minimum 44x44pt Apple HIG */
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Anti-Patterns to Avoid

- **Animating `left`/`top` CSS properties:** Causes layout reflow every frame. Always animate `x`/`y` (GSAP transform) or CSS `translate`. GSAP's `x`/`y` map to `transform: translateX/Y` automatically.
- **Setting `opacity: 0` in CSS then animating `from` in GSAP:** Can cause flash of invisible content on load. Use `gsap.set()` to set initial invisible state synchronously before DOM paint, or use `gsap.from()` with `immediateRender: true`.
- **Calling `navigateTo()` on page load:** Already documented in Phase 1 — breaks WebKit back button. Only call on user-initiated events.
- **Using `100vh` on mobile:** iOS Safari's address bar changes viewport height. Use `100dvh` in Phase 2 scenes.
- **Animating `width`/`height`:** Layout-triggering properties destroy 60fps. Use `scaleX`/`scaleY` instead.
- **Creating the walk-in timeline inside the click handler:** Creates a new timeline on every click. Build it once, call `.play()` on click.
- **Missing `pointer-events: none` on overlay layers:** The darkness overlay and grain layer must have `pointer-events: none` or they block click events on scene elements below them. The grain is already correct in `grain.css`. The darkness overlay needs the same treatment.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation sequencing | Custom promise chain or setTimeout cascade | `gsap.timeline()` position parameters | GSAP handles overlapping, labels, callbacks; setTimeout drift compounds over long sequences |
| Scroll-free parallax on click/event | requestAnimationFrame loop with manual position tracking | `gsap.to()` with target element refs | GSAP handles interruption, easing, compositing — rAF requires all three manually |
| Infinite sway loop | GSAP repeat: -1 with yoyo | CSS @keyframes with `alternate infinite` | CSS runs on compositor thread, no JS involvement; saves frame budget for the walk-in |
| Glow/warmth on hover | CSS transition + extra DOM element for glow | `gsap.to(el, { filter: 'drop-shadow(...)' })` on mouseenter | GSAP handles fast mouseenter/mouseleave cleanly — CSS transitions can't be cancelled mid-tween |
| Scene switching | Removing/adding DOM sections | Opacity + `pointer-events: none` toggle between `#entrance` and `#darkroom` | Keeps both sections in DOM for instant re-access; no re-render cost |

**Key insight:** The walk-in is a one-shot multi-layer sequence — this is exactly what `gsap.timeline()` was designed for. Don't approximate it with delays.

## Common Pitfalls

### Pitfall 1: Double-Click During Animation
**What goes wrong:** User clicks door twice. Timeline restarts or two timelines run simultaneously. Darkroom appears twice, state corrupts.
**Why it happens:** No guard on the click handler.
**How to avoid:** Check `store.get().transitionInProgress` before calling `tl.play()`. Set it `true` on click, `false` in `onComplete`.
**Warning signs:** Darkroom appears while entrance is still partially visible.

### Pitfall 2: Flash of Invisible Content on Load
**What goes wrong:** Elements that should start invisible (`.entrance__cta`, darkness overlay) flash briefly visible before GSAP sets `opacity: 0`.
**Why it happens:** GSAP `gsap.from({ opacity: 0 })` doesn't run until after DOM paint. CSS already painted the element at its default opacity: 1.
**How to avoid:** Set initial invisible state with CSS directly (`opacity: 0`) or call `gsap.set()` synchronously at the top of the init function before any animation runs.
**Warning signs:** Brief white flash or visible text immediately on page load before animation.

### Pitfall 3: Walk-in Layers Overflow Scene Bounds
**What goes wrong:** As layers scale up during the walk-in animation (`scale: 1.4`), they overflow outside the scene container and trigger scrollbars or layout shift.
**Why it happens:** `overflow: visible` on `.scene` container, or `overflow: hidden` was broken by a child with `transform-style: preserve-3d`.
**How to avoid:** Keep `overflow: hidden` on `.scene`. Do NOT use `transform-style: preserve-3d` on scene container or its direct children — this breaks overflow clipping. Use GSAP `x/y/scale` (not CSS 3D perspective) for the parallax effect.
**Warning signs:** Horizontal scrollbar appears during walk-in animation.

### Pitfall 4: Clothesline Sway Interrupts GSAP
**What goes wrong:** Phase 3's hand-grab animation (future phase) tries to GSAP-animate a photo that CSS `@keyframes` is already animating. The result is a snap or jitter.
**Why it happens:** CSS animations and GSAP transforms fight for the same property. Both use `transform/rotate`.
**How to avoid:** When Phase 3 grabs a photo, call `gsap.set(el, { clearProps: 'animation' })` or remove the CSS animation class before the GSAP tween takes over. Document this in Phase 3 research.
**Warning signs:** Photo snaps to a default rotation before the grab animation.

### Pitfall 5: Mobile Touch Target Too Small
**What goes wrong:** On mobile, users can't reliably tap the door or navigation elements because the visual footprint is small after scene cropping.
**Why it happens:** Visual size reduced by cropping/scaling; tap target inherits visual bounds.
**How to avoid:** Add an invisible `<button>` or `<div>` with `position: absolute; min-height: 44px; min-width: 44px` overlaying each interactive element on mobile. Or pad the element with CSS so its hit area exceeds its visual size.
**Warning signs:** Tap success rate less than 100% in testing on a real phone.

### Pitfall 6: `filter` Animation Performance
**What goes wrong:** Animating `filter: drop-shadow()` on every mousemove (rather than mouseenter/leave) causes excessive GPU compositing layer invalidations.
**Why it happens:** `filter` creates a new compositing layer; changing it frequently is expensive.
**How to avoid:** Only animate `filter` on `mouseenter` and `mouseleave` — not on `mousemove`. The transition from GSAP is smooth enough.
**Warning signs:** GPU memory spike visible in Chrome DevTools > Performance > GPU.

### Pitfall 7: `dvh` Browser Support
**What goes wrong:** `100dvh` not supported in older browsers (pre-Safari 15.4, pre-Chrome 108).
**Why it happens:** `dvh` is a newer viewport unit.
**How to avoid:** Layer fallback: `height: 100vh; height: 100dvh;` — browsers that don't support `dvh` will use the `100vh` value. This is the accepted pattern for mobile viewport height.
**Warning signs:** Fixed-height scene clips or scrolls unexpectedly on older iOS.

## Code Examples

Verified patterns from official sources:

### GSAP Timeline Walk-in Skeleton
```javascript
// Source: https://gsap.com/docs/v3/GSAP/Timeline/
// Build once, play on demand

const walkInTl = gsap.timeline({
  paused: true,
  defaults: { ease: 'power2.inOut' },
  onComplete: handleTransitionComplete
});

// Approach phase — layers surge toward viewer
walkInTl
  .to('[data-layer="ground"]',   { y: '25%',  scale: 1.2, duration: 1.5 }, 0)
  .to('[data-layer="building"]', { scale: 1.2, duration: 1.5 },             0)
  .to('[data-layer="door"]',     { scale: 1.6, duration: 1.5 },             0)
  // Darkness fade — starts at 1.2s, overlaps with approach
  .to('.scene__overlay--darkness', { opacity: 1, duration: 0.7 },           1.2)
  // Hold dark for 0.4s — inserted at 1.9s
  .to('.scene__overlay--darkness', { opacity: 1, duration: 0.4 },           1.9);

// Trigger on click
document.getElementById('door').addEventListener('click', () => {
  if (!store.get().transitionInProgress) {
    store.set({ transitionInProgress: true });
    walkInTl.play();
  }
});
```

### Scene Reveal with Darkroom Fade-in
```javascript
// Source: GSAP gsap.to() docs
// Called from walkInTl onComplete

function showDarkroom() {
  const entrance = document.getElementById('entrance');
  const darkroom = document.getElementById('darkroom');

  // Hide entrance, reveal darkroom
  gsap.set(entrance, { display: 'none' });
  gsap.set(darkroom, { display: 'block', opacity: 0 });

  gsap.to(darkroom, {
    opacity: 1,
    duration: 1.5,
    ease: 'power2.out',
    onComplete: () => {
      // Remove darkness overlay after darkroom is visible
      gsap.set('.scene__overlay--darkness', { opacity: 0 });
      store.set({ currentRoute: '/darkroom' });
    }
  });
}
```

### Staggered Photo Entry (darkroom arrives)
```javascript
// Source: https://gsap.com/resources/getting-started/Staggers/

gsap.from('.clothesline__photo', {
  opacity: 0,
  y: -20,
  duration: 0.8,
  stagger: {
    each: 0.15,
    from: 'start',
    ease: 'power2.out'
  },
  ease: 'power2.out'
});
```

### CSS Ambient Light (safe light glow)
```css
/* darkroom.css */
/* Warm amber safe-light emanating from upper-left */
.darkroom__safelight {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 50%;
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 140, 0, 0.18) 0%,
    rgba(200, 100, 20, 0.08) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 2;
}
```

### Always-Visible Navigation Label
```html
<!-- Silhouette + label — darkroom.html snippet -->
<div class="nav-element" id="silhouette-figure" role="button" tabindex="0" aria-label="Navigate to About page">
  <img src="images/darkroom/silhouette.png" alt="" class="nav-element__image">
  <span class="nav-element__label" id="label-about">About</span>
</div>
```
```css
/* darkroom.css */
.nav-element { position: absolute; cursor: pointer; }
.nav-element__label {
  display: block;
  font-family: var(--font-serif);
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.5;
  text-align: center;
  margin-top: 0.4rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: none; /* GSAP handles transitions */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for full-screen mobile | `100dvh` with `100vh` fallback | Safari 15.4 / Chrome 108 (2022) | Prevents clipping by dynamic browser UI on mobile |
| GSAP `transform` shorthand | Individual CSS `rotate` property in keyframes | CSS 2022 | `rotate:` as standalone property gives cleaner keyframes without full transform string |
| `box-shadow` for glow on images/SVG | `filter: drop-shadow()` | Long-standing | `drop-shadow` respects alpha channel of transparent PNGs; `box-shadow` follows box model only |
| `setTimeout` delays for sequencing | `gsap.timeline()` position params | GSAP v2+ | Position params (`"<"`, `">"`, `"+=0.5"`) eliminate delay math |

**Deprecated/outdated:**
- `height: 100vh` on mobile scenes: Still works, but `dvh` is the correct current approach for dynamic viewport handling
- GSAP `TweenMax`/`TweenLite`: Replaced by unified `gsap` object in GSAP 3 — all CDN scripts already use GSAP 3 pattern

## Open Questions

1. **Photo image assets for clothesline**
   - What we know: Phase 2 requires five genre photos displayed as thumbnails (DARK-03). Phase 1 created `images/fashion/test-sample.webp` and `.jpg` for pipeline testing.
   - What's unclear: Are placeholder/sample images available for all five genres in time for Phase 2, or should Phase 2 use color-block placeholders and swap in real photos later?
   - Recommendation: Use placeholder colored `<div>` elements or low-res stand-ins for Phase 2 clothesline — Phase 2 success criteria is the scene and animation, not the specific photo content. Document the slot contract (expected image dimensions) in `gallery.json`.

2. **Silhouette and business card asset format**
   - What we know: User decided silhouette figure + business card are the in-world navigation elements (DARK-07, DARK-09). `filter: drop-shadow()` on PNG works cleanly for glow.
   - What's unclear: Whether to use SVG (scalable, styleable) or PNG for these elements. SVG allows CSS color control; PNG is simpler.
   - Recommendation: Use SVG for the silhouette (simple shape, scalable, CSS controllable) and PNG/SVG for business card. Both can use `filter: drop-shadow()` for the hover glow effect.

3. **Entrance image assets — photo layers vs. CSS construction**
   - What we know: User decided "photo-realistic layers composited as parallax elements — real photographic textures." This means actual photographic images of brick, concrete, metal door.
   - What's unclear: Should each parallax layer be a separate photograph file, or can CSS compositing (filters, gradients over a single photo) create sufficient depth?
   - Recommendation: Plan for separate image files per layer (sky/bg, building wall, door, ground) as that gives GSAP independent handles for the parallax animation. A single photo can't be split into independently moving layers. Dimensions ~1920×1080 per layer, exported as WebP with JPEG fallback. Planner should include an asset-creation task.

## Sources

### Primary (HIGH confidence)
- [GSAP Timeline docs](https://gsap.com/docs/v3/GSAP/Timeline/) — Timeline API, paused option, position parameters, methods
- [GSAP Staggers docs](https://gsap.com/resources/getting-started/Staggers/) — stagger parameter, configuration object
- [GSAP gsap.to() docs](https://gsap.com/docs/v3/GSAP/gsap.to()/) — vars properties, ease, callbacks
- Phase 1 source files (`index.html`, `js/main.js`, `js/router.js`, `js/store.js`, `css/tokens.css`, `css/grain.css`) — confirmed existing architecture and constraints

### Secondary (MEDIUM confidence)
- [Keith Clark Pure CSS Parallax](https://keithclark.co.uk/articles/pure-css-parallax-websites/) — overflow: hidden constraint with 3D perspective (why to avoid pure CSS 3D for this use case)
- [Chrome Developers — Performant Parallaxing](https://developer.chrome.com/blog/performant-parallaxing) — will-change, compositor thread, why to use transforms
- [MDN transform-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin) — pendulum sway transform-origin: top center
- [MDN animation-direction](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-direction) — alternate keyword for sway
- [CSS-Tricks Keyframe Syntax](https://css-tricks.com/snippets/css/keyframe-animation-syntax/) — keyframe animation patterns

### Tertiary (LOW confidence)
- GSAP community forum results on mousemove parallax patterns — general approach confirmed, specific code verified with official docs
- WebSearch results on mobile viewport dvh — corroborated by MDN documentation pattern (height: 100vh fallback + height: 100dvh)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GSAP 3.14.2 locked in Phase 1, verified via CDN in index.html; all patterns verified against official GSAP docs
- Architecture: HIGH — Layer-based scene composition is established pattern; GSAP timeline pattern verified against official docs; existing Phase 1 code architecture confirmed
- Pitfalls: HIGH — Double-click guard, flash of invisible content, overflow clipping issues are documented GSAP/CSS patterns; dvh fallback is MDN-documented pattern
- Asset dependency: MEDIUM — Image asset format and availability is project-specific, not a library question

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (GSAP 3 is stable; CSS animation specs are stable)
