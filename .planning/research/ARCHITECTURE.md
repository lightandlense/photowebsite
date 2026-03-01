# Architecture Patterns

**Project:** Darkroom Portfolio
**Researched:** 2026-02-28
**Confidence:** MEDIUM — Core GSAP/ScrollTrigger patterns are HIGH confidence from official docs; SPA router pattern for static files is MEDIUM; contact form approach is HIGH.

---

## Recommended Architecture

This site is best built as a **pseudo-SPA with static HTML files** — not a true multi-page site with full reloads, and not a build-tool SPA. The darkroom experience requires seamless animation transitions between views. Full page reloads would shatter immersion. A JavaScript router intercepts navigation, handles animation sequences, and swaps view content without server round-trips. All files remain static HTML/CSS/JS deployable on cPanel.

### High-Level Structure

```
index.html          ← Shell + darkroom landing (clothesline scene)
gallery.html        ← Filmstrip gallery view (loaded per-genre)
about.html          ← About page
contact.html        ← Contact page (with PHP form handler)
contact.php         ← PHP mail handler (lives on same host)
/js/
  app.js            ← Router, state store, bootstrap
  scene-darkroom.js ← Clothesline scene, clothespin interactions
  scene-gallery.js  ← Filmstrip, horizontal scroll, hover zoom
  scene-about.js    ← About page animations
  scene-contact.js  ← Contact form, validation
  transitions.js    ← Shared enter/exit animation sequences
  state.js          ← Central state (active genre, scroll pos)
  media.js          ← Image/video preload manager
/css/
  base.css          ← Design tokens, darkroom theme variables
  darkroom.css      ← Clothesline scene styles
  gallery.css       ← Filmstrip styles
  about.css         ← About page styles
  contact.css       ← Contact page styles
  grain.css         ← Film grain overlay (SVG filter)
/data/
  gallery.json      ← Genre metadata, image manifests
/images/
  [genre]/          ← Per-genre image folders
/video/
  [clips]/          ← Video genre clips
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Router** (`app.js`) | Intercepts link clicks, manages History API, sequences transitions | Transitions, Scene modules, State |
| **State Store** (`state.js`) | Single source of truth: active genre, animation phase, scroll position | All scene modules read/write |
| **Darkroom Scene** (`scene-darkroom.js`) | Renders clothesline, manages clothespin click handlers, triggers pull-in transition | Router (navigation signal), Transitions, State |
| **Gallery Scene** (`scene-gallery.js`) | Builds filmstrip, owns horizontal scroll logic, hover zoom, inline video | State (active genre), Media Manager, Transitions |
| **Transition Controller** (`transitions.js`) | Library of named GSAP timelines: hand-grab, pull-in, wipe-out, enter-about | Router calls these; scenes do not own their own exit/enter sequences |
| **Media Manager** (`media.js`) | Preloads critical assets, lazy-loads filmstrip images via IntersectionObserver | Gallery Scene (signals ready), Darkroom Scene |
| **Contact Handler** (`contact.php`) | Accepts POST, sends email via PHP `mail()` / PHPMailer | Contact Scene sends `fetch()` POST |
| **Grain Overlay** (`grain.css`) | Always-on CSS pseudo-element using SVG noise filter | No communication — pure CSS |

---

## Data Flow

### Flow 1: Initial Load

```
Browser loads index.html
  → base.css + grain.css paint darkroom shell
  → app.js initializes: Router + State + MediaManager
  → MediaManager preloads clothesline 5 photos (critical path)
  → scene-darkroom.js builds clothesline DOM, attaches click handlers
  → Darkroom entrance animation plays (GSAP timeline: dim lights in)
  → User is in the darkroom
```

### Flow 2: Photo Click → Gallery

```
User clicks clothesline photo [N]
  → scene-darkroom.js fires "genre-selected" with genre ID
  → State.set({ activeGenre: [id], phase: 'transitioning' })
  → transitions.js plays "hand-grab" timeline (GSAP)
      → hand SVG/element animates into frame, grasps photo
  → transitions.js plays "pull-in" timeline
      → selected photo scales up, camera zooms into image
      → overlay fades to black (covers transition seam)
  → Router.navigate('/gallery/[genre]')
  → gallery.json fetched (or already in memory)
  → scene-gallery.js builds filmstrip DOM offscreen
  → MediaManager begins lazy-loading filmstrip images
  → transitions.js plays "filmstrip-reveal" timeline
      → overlay fades out, filmstrip slides in
  → State.set({ phase: 'idle' })
  → ScrollTrigger initializes horizontal scroll on filmstrip
```

### Flow 3: Filmstrip Scroll + Hover

```
User scrolls vertically
  → ScrollTrigger converts vertical scroll → horizontal x translate
  → Filmstrip container moves left
  → IntersectionObserver triggers MediaManager to load next batch

User hovers photo on filmstrip
  → CSS transition (scale 1 → 1.15) — no JS needed for basic zoom
  → OR GSAP quickTo() for spring-feel zoom if CSS insufficient

User hovers video thumbnail (Video genre)
  → scene-gallery.js detects [data-type="video"]
  → Paused <video> element inside thumbnail starts playing
  → Mouse-leave pauses + resets to poster frame
```

### Flow 4: Gallery → Darkroom (Back)

```
User clicks back button
  → transitions.js plays "pull-out" timeline (reverse of pull-in)
  → Router.navigate('/')
  → scene-darkroom.js restores clothesline (photo back on pin or replaced)
  → State.set({ activeGenre: null, phase: 'idle' })
```

### Flow 5: Contact Form Submission

```
User fills form, clicks Submit
  → scene-contact.js validates fields (HTML5 + custom JS)
  → fetch() POST to contact.php
  → PHP mail() / PHPMailer sends email
  → Response JSON { success: true/false }
  → scene-contact.js shows success or error state
  → No page reload
```

---

## Patterns to Follow

### Pattern 1: Scene Module Pattern

Each "page" or "view" is a module that owns its own DOM build, animation setup, and teardown. The router calls `scene.enter()` and `scene.exit()` — scenes do not navigate themselves.

```javascript
// scene-gallery.js
export const GalleryScene = {
  enter(genre) {
    this.buildFilmstrip(genre);
    this.initScrollTrigger();
    this.initHoverZoom();
  },
  exit() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    this.teardownHoverZoom();
  },
  buildFilmstrip(genre) { /* ... */ },
  initScrollTrigger() {
    gsap.to('.filmstrip-track', {
      x: () => -(filmstripTrack.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '.filmstrip-container',
        pin: true,
        scrub: 1,
        end: () => `+=${filmstripTrack.scrollWidth - window.innerWidth}`
      }
    });
  }
};
```

**Why:** Keeps animation logic co-located with the view it controls. Avoids global animation soup. Enables clean teardown when navigating away (ScrollTrigger instances must be killed to prevent memory leaks).

### Pattern 2: Named Transition Timelines

All cross-scene transitions live in `transitions.js` as named GSAP timelines. Scenes request transitions by name, not by implementing them.

```javascript
// transitions.js
export const Transitions = {
  handGrab(targetEl) {
    const tl = gsap.timeline();
    tl.fromTo('.hand', { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to('.hand', { x: targetEl.getBoundingClientRect().left, duration: 0.3 })
      .to(targetEl, { rotation: -5, y: -20, duration: 0.2 });
    return tl; // Router awaits tl.then()
  },
  pullIn(targetEl) { /* scale + zoom timeline */ },
  filmstripReveal() { /* overlay fade + slide in */ }
};
```

**Why:** Transition logic is reusable and testable in isolation. Router orchestrates sequences without knowing animation details.

### Pattern 3: Central State Store (Pub/Sub)

A small reactive store using the Observer pattern. No library needed.

```javascript
// state.js
const _state = { activeGenre: null, phase: 'idle', scrollPos: 0 };
const _subscribers = {};

export const State = {
  get: (key) => _state[key],
  set(updates) {
    Object.assign(_state, updates);
    Object.entries(updates).forEach(([key, val]) => {
      (_subscribers[key] || []).forEach(fn => fn(val));
    });
  },
  on(key, fn) {
    (_subscribers[key] ??= []).push(fn);
  }
};
```

**Why:** Scenes need to react to genre changes and animation phase. Direct coupling between scenes creates fragile code. State.on('activeGenre', ...) lets scenes respond without knowing about each other.

### Pattern 4: Film Grain as Always-On CSS Layer

```css
/* grain.css */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,..."); /* SVG feTurbulence noise */
  animation: grain 0.2s steps(1) infinite;
}

@keyframes grain {
  0%  { transform: translate(0, 0); }
  25% { transform: translate(-2%, 1%); }
  50% { transform: translate(1%, -1%); }
  75% { transform: translate(-1%, 2%); }
  100%{ transform: translate(2%, -2%); }
}
```

**Why:** Fixed position pseudo-element is the lightest implementation — zero JS, zero DOM nodes, GPU-composited. The animation shifts the noise texture to simulate analog film grain flutter.

### Pattern 5: Horizontal Scroll via ScrollTrigger Pin

```javascript
// Standard GSAP horizontal scroll pattern (HIGH confidence — from gsap.com)
gsap.to('.filmstrip-track', {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.filmstrip-container',
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true, // recalculate on resize
    end: () => `+=${track.scrollWidth - window.innerWidth}`
  }
});
```

`invalidateOnRefresh: true` is required so the scroll distance recalculates if the window resizes.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Animation Logic Scattered Across Files

**What:** Putting transition code in scene files, click handlers, and global scope simultaneously.

**Why bad:** GSAP timelines that overlap from different sources cause visual glitches. Impossible to sequence reliably. ScrollTrigger instances from dead scenes conflict with live ones.

**Instead:** All timelines flow through `transitions.js`. All ScrollTrigger instances are killed in `scene.exit()`.

### Anti-Pattern 2: Loading All Gallery Images Upfront

**What:** Preloading all 75–125 photos (5 genres × 10–25 photos) on initial load.

**Why bad:** Could easily exceed 50–100MB of images, causing 10–30 second initial loads. Kills the "wow" experience before it starts.

**Instead:** Preload only the 5 clothesline thumbnails on entry. When a genre is selected, preload first 5 filmstrip images immediately, then IntersectionObserver lazy-loads the rest as the user scrolls.

### Anti-Pattern 3: Inline Event Listeners in HTML

**What:** `<div onclick="handleClick()">` scattered throughout HTML.

**Why bad:** Tight coupling between markup and behavior. Impossible to manage animation state from inline handlers. Breaks when DOM is rebuilt during transitions.

**Instead:** All event listeners attached by scene modules in their `enter()` method and removed in `exit()`.

### Anti-Pattern 4: CSS Transitions on Transform While GSAP Also Animates Transform

**What:** Applying `transition: transform 0.3s` in CSS on elements that GSAP also animates.

**Why bad:** CSS transitions and GSAP both modifying `transform` simultaneously causes jitter. GSAP sets `will-change` and manages its own timing.

**Instead:** If GSAP owns an element's animation, remove CSS transition on that property. Use GSAP's `quickTo()` for hover effects on GSAP-controlled elements.

### Anti-Pattern 5: Full Page Reload Navigation

**What:** Using `<a href="gallery.html">` links that trigger full browser navigation.

**Why bad:** Full reload destroys every animation state, unmounts the darkroom, and shatters immersion. There is no way to animate a full-page navigation.

**Instead:** Router intercepts all internal links. The HTML files serve as fallback only (deep-link recovery).

---

## Scalability Considerations

| Concern | At Launch | If Content Grows |
|---------|-----------|------------------|
| Image volume | 5 genres × 10–25 = 50–125 photos | Add `gallery.json` entries — no code change |
| New genre added | Add entry to `gallery.json`, add images | Scene reads from data, not hardcoded |
| Video performance | Lazy-load video src, only set on hover | Consider poster-only approach + load video on demand |
| Mobile | CSS media queries, disable pin scroll on touch | Consider vertical scroll gallery as alternate layout |
| Contact spam | Basic honeypot field in form | Add reCAPTCHA v3 if needed (pure client-side) |

---

## Build Order (Phase Dependencies)

The architecture has clear dependency layers. Build bottom-up:

```
Layer 0 — Foundation (no dependencies)
  → base.css, grain.css, design tokens
  → state.js (pure data, no DOM)
  → app.js skeleton (router stub, no transitions yet)

Layer 1 — Shell (depends on Layer 0)
  → index.html shell structure
  → Darkroom scene: clothesline DOM, CSS, ambient lighting
  → No animations yet — just static rendering of the scene

Layer 2 — Darkroom Interactions (depends on Layer 1)
  → Clothespin click handlers
  → Hand-grab animation (transitions.js)
  → Pull-in transition (transitions.js)
  → Media manager: clothesline photo preloading

Layer 3 — Gallery Scene (depends on Layer 2)
  → gallery.json data structure
  → Filmstrip DOM builder (scene-gallery.js)
  → Horizontal scroll (ScrollTrigger)
  → Hover zoom
  → Router wired to navigate Darkroom → Gallery

Layer 4 — Video Support (depends on Layer 3)
  → Video thumbnail inline playback
  → Video lazy-loading strategy

Layer 5 — Supporting Pages (depends on Layer 0, partial Layer 1)
  → About page (scene-about.js, about.html)
  → Contact page (scene-contact.js, contact.html, contact.php)
  → Router wired for all four routes

Layer 6 — Polish (depends on all layers)
  → Performance audit (image optimization, lazy loading tuning)
  → Mobile responsive pass
  → Cross-browser testing
  → Animation fine-tuning (easing, timing)
```

**Critical dependency note:** The pull-in transition (Layer 2) must be built before the gallery (Layer 3) because it defines the visual contract of how gallery entry works. Building the gallery first and bolting on the transition later typically requires reworking the gallery's initial state.

---

## Contact Form Architecture (cPanel hosting)

Since cPanel hosts typically have PHP available, the contact form can use a thin PHP script as a backend without needing Node.js:

```
contact.html → fetch() POST JSON → contact.php → php mail() / PHPMailer → inbox
```

The contact form is the **only server-side component** in the entire site. Everything else is pure client-side.

For improved deliverability on shared hosts, use PHPMailer with SMTP (cPanel email account) rather than bare `mail()`. This correctly sets From/Reply-To headers and avoids spam filters.

**Alternative:** Formspree (free tier, 50 submissions/month) eliminates the PHP script entirely. Tradeoff is a third-party service dependency. For a portfolio with moderate contact volume, Formspree is adequate and simpler.

---

## Sources

- GSAP ScrollTrigger horizontal scroll: [gsap.com/docs/v3/Plugins/ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — HIGH confidence
- GSAP Timeline docs: [gsap.com/docs/v3/GSAP/Timeline](https://gsap.com/docs/v3/GSAP/Timeline/) — HIGH confidence
- Horizontal pin gallery CodePen: [codepen.io/GreenSock/pen/dydpJzY](https://codepen.io/GreenSock/pen/dydpJzY) — HIGH confidence
- Async page transitions vanilla JS: [tympanus.net/codrops/2026/02/26](https://tympanus.net/codrops/2026/02/26/building-async-page-transitions-in-vanilla-javascript/) — MEDIUM confidence
- View Transitions API: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — HIGH confidence (considered but not recommended — too limited for custom GSAP sequences)
- CSS grainy gradients technique: [css-tricks.com/grainy-gradients](https://css-tricks.com/grainy-gradients/) — MEDIUM confidence
- PHP contact form for static sites: [marclewis.com/2025/05/22/self-hosted-contact-form](https://marclewis.com/2025/05/22/self-hosted-contact-form/) — MEDIUM confidence
- Image lazy loading strategy: [web.dev/articles/browser-level-image-lazy-loading](https://web.dev/articles/browser-level-image-lazy-loading) — HIGH confidence
- State management vanilla JS patterns: [css-tricks.com/build-a-state-management-system-with-vanilla-javascript](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/) — MEDIUM confidence
