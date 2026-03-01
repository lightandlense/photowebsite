# Phase 1: Foundation - Research

**Researched:** 2026-02-28
**Domain:** Static site scaffolding, CSS design system, vanilla JS SPA router, image pipeline, gallery data manifest
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Color Palette & Mood
- Warm amber/sepia dominant tone — like darkroom safelight, orange-amber glow on deep black
- Dark but visible backgrounds — dim but walls/surfaces are discernible, not pure black
- Warm off-white text — slightly cream/amber tinted, not pure white
- Subtle film grain overlay — felt more than seen, adds texture without distracting from photos

#### Typography
- Vintage serif font throughout (Playfair Display / Bodoni type)
- Same serif for all text: headings, labels ("About", "Contact", genre names), "Step Inside" text, body
- "Step Inside" text rendered as elegant serif with a subtle glow effect
- Warm off-white text color to match the amber palette

#### Photo Data Structure
- One folder per genre (fashion/, beauty/, light-painting/, drone/, video/)
- No titles or captions on photos — images speak for themselves
- No config file needed — folder structure IS the organization

#### Page Transitions
- Cinematic & slow pacing — deliberate 1-2 second transitions throughout
- Door-to-darkroom: slow fade through black (door opens → screen goes dark for a beat → darkroom gradually appears)
- Camera pull-in to filmstrip: smooth glide, steady forward motion gradually filling the screen — not a dramatic snap zoom

### Claude's Discretion
- Photo ordering logic on the filmstrip (alphabetical, date-based, or numbered filenames)
- Clothesline hero shot selection (specific designated file vs first-in-folder)
- Clothesline sway intensity (calibrate what looks natural)
- Accent/interactive hint color (warm gold/amber recommended to match palette)
- Film grain intensity calibration
- CSS custom property naming conventions
- Router and state store architecture

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | Static site (HTML/CSS/JS) — no server-side runtime required | File structure pattern, no build step CDN loading |
| INFR-02 | Deployable on traditional cPanel/shared hosting | `public_html` root, `index.html` entry point, no `.htaccess` rewrite needed for root-only SPA |
| INFR-03 | Browser history integration (back/forward buttons work with animated transitions) | History API pushState/popstate pattern, pitfall documentation |
| INFR-04 | Works on modern browsers (Chrome, Safari, Firefox, Edge) | CSS custom properties universally supported; GSAP cross-browser; Playfair Display via Google Fonts |
| INFR-05 | Responsive — functions on mobile with adapted interactions (tap instead of hover) | CSS media query breakpoints, touch event handling via GSAP Observer |
</phase_requirements>

---

## Summary

Phase 1 establishes the invisible skeleton that all visual phases depend on. The technical scope is narrow but the decisions here lock in patterns used across every subsequent phase: the CSS custom property naming scheme becomes the design language, the router architecture determines how GSAP transitions wire up to navigation, and the gallery.json schema determines how adding new genres works in Phase 4 without code changes.

The stack is simple on purpose — no build step, no bundler, no framework. This is not a compromise but a hard constraint driven by cPanel hosting. Every tool chosen must load via `<script>` tag or be vendored. GSAP 3.14.2 (as of December 2025) is the sole animation engine and is now completely free including ScrollSmoother, removing the previous Club GSAP gate. The History API SPA router is hand-rolled but deliberately minimal — its sole job is intercept clicks, call `history.pushState`, trigger GSAP transitions, and respond to `popstate` for back/forward. No routing library is needed or appropriate.

The largest practical risk in this phase is the server-side 404 issue: a History API SPA served from file:// or a misconfigured server will produce blank pages on hard reload of non-root URLs. The solution is either (a) restricting all `pushState` paths to hashes or (b) configuring the server to return `index.html` for all paths. For cPanel hosting, option (b) is achieved via `.htaccess` rewrite rules.

**Primary recommendation:** Build the router, design system, and gallery.json schema as standalone ES modules loaded with `type="module"` script tags — this keeps code organized without any build step and works in all modern browsers.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 | All animations, transitions, timelines | Sole animation engine per roadmap decision; most capable JS animation library |
| ScrollTrigger | 3.14.2 (bundled with GSAP) | Scroll-linked animations (Phase 4 filmstrip) | Required plugin for horizontal scroll gallery |
| ScrollSmoother | 3.14.2 (bundled with GSAP) | Smooth scrolling wrapper | Required for filmstrip smooth scroll experience |
| Playfair Display | via Google Fonts | Typography | User-locked decision: vintage serif throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Python http.server | built-in | Local development server | `python -m http.server 8080` — required for CORS-safe fetch of gallery.json |
| cwebp | latest from Google | WebP image conversion | Converting JPEG/PNG source images to WebP with JPEG fallback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Google Fonts CDN (Playfair Display) | Self-host font files | Self-hosting avoids external CDN call; acceptable for cPanel hosting; Google Fonts CDN simpler to set up first |
| Python http.server | live-server (npm), VS Code Live Server extension | Live-server adds auto-reload; acceptable developer convenience; either works |
| cwebp CLI | FFmpeg, Sharp (Node) | FFmpeg and Sharp require Node install; cwebp is purpose-built and lighter for image-only pipeline |

**Installation — no npm required, CDN only:**
```html
<!-- Load order matters: GSAP core first, then plugins -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollSmoother.min.js"></script>
```

Then in your JS (after GSAP loads):
```javascript
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
```

---

## Architecture Patterns

### Recommended Project Structure
```
/ (project root / public_html on cPanel)
├── index.html              # Single HTML entry point
├── .htaccess               # URL rewrite rules for SPA routing on Apache
├── css/
│   ├── tokens.css          # CSS custom properties (design tokens only)
│   ├── base.css            # Reset, typography, global rules
│   └── grain.css           # Film grain overlay
├── js/
│   ├── router.js           # History API SPA router (ES module)
│   ├── store.js            # Minimal state store (ES module)
│   └── main.js             # Entry point — imports router + store
├── images/
│   ├── fashion/            # Genre folder (WebP + JPEG pairs)
│   ├── beauty/
│   ├── light-painting/
│   ├── drone/
│   └── video/
├── gallery.json            # Genre data manifest
└── fonts/                  # Optional: self-hosted Playfair Display
```

### Pattern 1: CSS Custom Properties (Design Tokens)

**What:** All colors, spacing, font sizes, and timing values defined as custom properties on `:root`. No magic numbers anywhere in component CSS.

**When to use:** Every value that expresses the darkroom aesthetic — colors, grain opacity, transition durations. These are the single source of truth for the visual language all later phases inherit.

**Example:**
```css
/* css/tokens.css */
/* Source: CSS Custom Properties spec — https://developer.mozilla.org/en-US/docs/Web/CSS/--* */

:root {
  /* Palette — darkroom amber */
  --color-bg:          #1a1208;   /* Deep warm black, not pure black */
  --color-bg-surface:  #241a0e;   /* Slightly lighter — walls, surfaces */
  --color-text:        #e8d5b0;   /* Warm off-white, cream/amber tint */
  --color-accent:      #c8902a;   /* Warm gold — interactive hints */
  --color-amber-glow:  #ff8c00;   /* Safelight orange — glow effects */

  /* Typography */
  --font-serif:        'Playfair Display', Georgia, serif;
  --font-size-base:    1rem;
  --font-size-lg:      1.5rem;
  --font-size-xl:      2.5rem;

  /* Transitions — cinematic, deliberate pacing */
  --duration-fast:     0.3s;
  --duration-normal:   0.8s;
  --duration-cinematic: 1.5s;

  /* Film grain */
  --grain-opacity:     0.04;   /* Felt, not seen — calibrate per Claude's discretion */
  --grain-size:        0.65;   /* SVG feTurbulence baseFrequency */
}
```

### Pattern 2: History API SPA Router

**What:** Minimal vanilla JS router — intercepts `<a>` clicks, calls `history.pushState`, fires a custom `navigate` event that GSAP transition handlers listen to. Responds to `popstate` for back/forward.

**When to use:** Every link click on the site. This is what prevents full page reloads and enables GSAP-animated transitions between views.

**Critical implementation detail:** `pushState` does NOT trigger `popstate`. You must manually update the view after calling pushState. `popstate` only fires on user back/forward navigation.

**Example:**
```javascript
// js/router.js
// Source: MDN History API — https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API

export function initRouter() {
  // Intercept all link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // Only intercept internal links
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault();
      navigateTo(href);
    }
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const path = window.location.pathname;
    // Dispatch custom event — GSAP handlers listen for this
    window.dispatchEvent(new CustomEvent('route:change', {
      detail: { path, state: e.state, trigger: 'popstate' }
    }));
  });
}

export function navigateTo(path, state = {}) {
  history.pushState({ path, ...state }, '', path);
  // pushState does NOT fire popstate — dispatch manually
  window.dispatchEvent(new CustomEvent('route:change', {
    detail: { path, state, trigger: 'push' }
  }));
}
```

### Pattern 3: Minimal State Store

**What:** Simple observable object using the Pub/Sub pattern. No Redux, no Proxy magic — just a plain object with a subscribe/emit mechanism. Tracks current route, current genre, transition state.

**When to use:** Whenever a GSAP animation handler needs to know what the current application state is (which photo was selected, which genre is active, is a transition in progress).

**Example:**
```javascript
// js/store.js
const state = {
  currentRoute: '/',
  currentGenre: null,
  selectedPhotoIndex: null,
  transitionInProgress: false,
};

const listeners = new Set();

export const store = {
  get: () => ({ ...state }),
  set: (updates) => {
    Object.assign(state, updates);
    listeners.forEach(fn => fn({ ...state }));
  },
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn); // returns unsubscribe
  },
};
```

### Pattern 4: Film Grain Overlay

**What:** CSS pseudo-element using an inline SVG data URI with `<feTurbulence>` filter. No external image dependency, procedurally generated, seamless.

**When to use:** Applied as `::before` on `body` or a wrapper element with `pointer-events: none` so it doesn't block interactions.

**Example:**
```css
/* css/grain.css */
/* Source: CSS-Tricks Grainy Gradients — https://css-tricks.com/grainy-gradients/ */

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}
```

### Pattern 5: gallery.json Schema

**What:** A JSON manifest file declaring the five genres and their metadata. The router uses this to know which genres exist and what folder to load images from. Adding a genre requires only a new JSON entry.

**When to use:** Loaded once at app init via `fetch('./gallery.json')`. Stored in the state store.

**Example:**
```json
{
  "version": 1,
  "genres": [
    {
      "id": "fashion",
      "label": "Fashion",
      "folder": "images/fashion/",
      "clotheslineIndex": 0,
      "photoCount": 0
    },
    {
      "id": "beauty",
      "label": "Beauty",
      "folder": "images/beauty/",
      "clotheslineIndex": 1,
      "photoCount": 0
    },
    {
      "id": "light-painting",
      "label": "Light Painting",
      "folder": "images/light-painting/",
      "clotheslineIndex": 2,
      "photoCount": 0
    },
    {
      "id": "drone",
      "label": "Drone",
      "folder": "images/drone/",
      "clotheslineIndex": 3,
      "photoCount": 0
    },
    {
      "id": "video",
      "label": "Video",
      "folder": "images/video/",
      "clotheslineIndex": 4,
      "photoCount": 0
    }
  ]
}
```

### Pattern 6: WebP + JPEG Picture Element

**What:** The `<picture>` element serves WebP to browsers that support it and falls back to JPEG for all others. No JavaScript detection needed — the browser handles format selection natively.

**When to use:** Every `<img>` tag in the project. Established in Phase 1 as the standard — all future phases use this pattern.

**Example:**
```html
<!-- Source: MDN <picture> element — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture -->
<picture>
  <source srcset="images/fashion/photo-01.webp" type="image/webp">
  <img src="images/fashion/photo-01.jpg" alt="" loading="lazy" width="800" height="1200">
</picture>
```

**Conversion command (one-time per image):**
```bash
# cwebp — quality 80, under 200KB target
cwebp -q 80 input.jpg -o output.webp

# Batch convert all JPEGs in a folder
for f in images/fashion/*.jpg; do cwebp -q 80 "$f" -o "${f%.jpg}.webp"; done
```

### Anti-Patterns to Avoid

- **Using `hash routing` (#) as a shortcut:** Hash routing avoids the server 404 problem but breaks the URL aesthetic and complicates GSAP transition sequencing. Use real path routing with `.htaccess`.
- **Calling `navigateTo` or `pushState` on page load:** WebKit treats pushState calls during page load as dummy entries, which breaks back-button behavior. Only call pushState in response to user interaction.
- **Loading GSAP plugins before core:** `ScrollTrigger.min.js` must load after `gsap.min.js` or auto-registration fails silently. Always load in dependency order.
- **Serving `index.html` directly via `file://`:** `fetch('./gallery.json')` will fail with CORS errors when served as a file URL. Always use a local HTTP server during development.
- **Putting all CSS in one file:** By Phase 5, design tokens cascade into dozens of component styles. A monolithic CSS file becomes unmaintainable. Start with `tokens.css` / `base.css` separation from day one.
- **Using `window.location.href = ...` for navigation:** This triggers a full page reload and kills GSAP animation state. Always use `history.pushState` + custom event dispatch.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation timelines | Custom CSS transitions + JS callbacks | GSAP timelines | GSAP handles cross-browser easing, sequencing, and interruption reliably; CSS transitions cannot be paused/reversed mid-animation |
| Cross-browser smooth scroll | Manual scroll event math | ScrollSmoother (GSAP) | iOS Safari momentum scroll + desktop inertia requires 200+ lines of edge-case handling; ScrollSmoother solves this |
| Image format detection | JS userAgent sniffing | `<picture>` element with WebP source | Native browser feature selection is more reliable and needs no JS |
| Pub/Sub event bus | jQuery or custom EventEmitter class | Native `CustomEvent` + `addEventListener` | Already in the browser, zero dependencies, sufficient for this use case |
| Font rendering normalization | Manual `@font-face` optimization | Google Fonts with `display=swap` | Handles FOUT, WOFF2 delivery, and subsetting without configuration |

**Key insight:** The "no build step" constraint means every dependency must either be trivially loadable via CDN or trivially implementable in under 50 lines. If a problem requires more than 50 lines to solve correctly, a library exists and should be used.

---

## Common Pitfalls

### Pitfall 1: Hard Reload 404 on Non-Root Paths

**What goes wrong:** User navigates to `/gallery/fashion` via the SPA router (pushState). Works perfectly. User refreshes the page or shares the URL. The Apache server on cPanel looks for a file at `/gallery/fashion/index.html`, finds nothing, and returns 404.

**Why it happens:** pushState creates a browser history entry but does not create a server-side file. The server has no knowledge of client-side routing.

**How to avoid:** Create an `.htaccess` file at the project root with an Apache mod_rewrite rule:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Warning signs:** Works on localhost when opened as a file, breaks immediately when deployed to cPanel; or works from root URL but breaks on any other URL.

### Pitfall 2: pushState Does Not Fire popstate

**What goes wrong:** Developer calls `history.pushState(...)` and listens for `popstate` to update the view. The popstate handler never fires. The URL updates but the page content stays the same.

**Why it happens:** The `popstate` event only fires when the user navigates with browser back/forward buttons or `history.go()`. Calling `pushState` or `replaceState` directly does NOT fire popstate (this is per the HTML spec).

**How to avoid:** After calling `pushState`, manually dispatch a custom event to trigger view updates. The router pattern in Code Examples above demonstrates this correctly.

**Warning signs:** URL changes in the address bar when clicking links but the page content (scene, route) does not change.

### Pitfall 3: GSAP Loaded Before DOM Ready

**What goes wrong:** GSAP script loaded in `<head>`, JS modules try to `gsap.registerPlugin()` and target DOM elements before the document is parsed. Animations fail silently or throw "Cannot tween a null target" errors.

**Why it happens:** Scripts in `<head>` execute before `<body>` content is parsed unless `defer` or `DOMContentLoaded` is used.

**How to avoid:** Either load GSAP scripts just before `</body>`, or use `defer` attribute on all script tags, or wrap initialization in `DOMContentLoaded`.

**Warning signs:** Console errors mentioning null targets; works intermittently depending on browser caching speed.

### Pitfall 4: fetch('./gallery.json') Fails on file:// Protocol

**What goes wrong:** Developer opens `index.html` directly in browser (double-click). The `fetch('./gallery.json')` call fails with a CORS or "not allowed" error in the console.

**Why it happens:** Browsers block fetch requests under the `file://` protocol as a security measure.

**How to avoid:** Always run a local HTTP server during development. `python -m http.server 8080` from the project root is zero-configuration.

**Warning signs:** "Failed to fetch" or "Cross-Origin Request Blocked" in console when file was opened from Finder/Explorer, not localhost.

### Pitfall 5: Google Fonts Request Blocked by Browser/Privacy Tools

**What goes wrong:** Playfair Display loads correctly in development but falls back to Georgia on some users' machines. Page looks less polished.

**Why it happens:** Privacy-focused browsers and extensions (uBlock, Firefox strict mode) block third-party font requests from Google's servers.

**How to avoid:** Self-host Playfair Display files as a fallback strategy. Use the `display=swap` parameter to prevent FOUT while fonts load. For Phase 1, Google Fonts CDN is acceptable; self-hosting can be added in Phase 5 during the performance pass.

**Warning signs:** Font looks different in testing on Firefox with strict privacy settings enabled.

---

## Code Examples

### Google Fonts — Playfair Display

```html
<!-- Source: https://fonts.google.com/specimen/Playfair+Display -->
<!-- In <head> — preconnect reduces latency -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

```css
/* Apply globally via design token */
body {
  font-family: var(--font-serif);
}
```

### GSAP Setup — CDN Script Tags + Plugin Registration

```html
<!-- Source: https://www.jsdelivr.com/package/npm/gsap — v3.14.2 (latest as of 2025-12-12) -->
<!-- Load order: core first, then plugins -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollSmoother.min.js"></script>
<script type="module" src="js/main.js"></script>
```

```javascript
// js/main.js — entry point
// GSAP loaded as global via CDN; register plugins before use
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
```

### .htaccess SPA Fallback for cPanel/Apache

```apache
# Source: Apache mod_rewrite docs — https://httpd.apache.org/docs/current/mod/mod_rewrite.html
RewriteEngine On
RewriteBase /
# Serve existing files and directories as-is
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
# All other paths → index.html (client-side router handles them)
RewriteRule . /index.html [L]
```

### gallery.json — Fetch and Validate

```javascript
// js/main.js
async function loadGallery() {
  try {
    const res = await fetch('./gallery.json');
    if (!res.ok) throw new Error(`gallery.json HTTP ${res.status}`);
    const data = await res.json();
    if (!data.genres || !Array.isArray(data.genres)) {
      throw new Error('gallery.json missing required "genres" array');
    }
    console.log(`[gallery] Loaded ${data.genres.length} genres`);
    store.set({ genres: data.genres });
    return data;
  } catch (err) {
    console.error('[gallery] Failed to load gallery.json:', err);
    throw err;
  }
}
```

### Minimal index.html Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Darkroom Portfolio</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Design system -->
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/grain.css">
</head>
<body>

  <!-- App root — scenes are injected/shown/hidden here -->
  <div id="app"></div>

  <!-- GSAP via CDN (before module scripts) -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollSmoother.min.js"></script>

  <!-- App entry (module) -->
  <script type="module" src="js/main.js"></script>

</body>
</html>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Club GSAP subscription required for ScrollSmoother/SplitText | All GSAP plugins free including commercial | May 2025 (v3.13 release, Webflow acquisition) | No licensing gate; use ScrollSmoother freely |
| Hash routing (#/page) for SPAs on static hosting | Path routing + .htaccess rewrite | ~2015, widely adopted | Clean URLs, better UX; requires server config |
| Separate `gsap-trial` npm package for premium plugins | Single `gsap` package includes all plugins | May 2025 | One script tag, no trial watermark |
| CSS animations for complex sequences | GSAP timelines | Established, confirmed best practice | Cross-browser consistency, reversible, pausable |

**Deprecated/outdated:**
- `gsap-trial` package: Replaced by the main `gsap` package which now includes all plugins for free
- Club GSAP membership: No longer required for any plugin; standard "no charge" license covers all use cases

---

## Open Questions

1. **Serving gallery.json without a real file list**
   - What we know: `gallery.json` lists genre folders; the spec says "folder structure IS the organization"; `photoCount: 0` is acceptable for Phase 1
   - What's unclear: In Phase 4 (filmstrip), the gallery needs to know which image files exist in each folder — static hosting cannot generate a directory listing. Either the JSON must list filenames explicitly, or filenames must follow a strict numbered convention (photo-001.webp, photo-002.webp) so JS can probe for them.
   - Recommendation: Add an optional `photos` array to the gallery.json schema now so Phase 4 can populate it. Numbered filename convention is the fallback. Decide during Phase 4 planning.

2. **ES module `<script type="module">` and GSAP as global**
   - What we know: GSAP loaded via CDN `<script>` tags is global (`window.gsap`). ES modules run in strict mode and don't automatically see globals.
   - What's unclear: Whether module scripts can access `gsap`, `ScrollTrigger`, `ScrollSmoother` as globals when the CDN scripts are loaded before them in the same HTML file.
   - Recommendation: Test in Phase 1 immediately. If globals are accessible, no change needed. If not, either (a) use non-module script tags for all JS, or (b) use `import` from jsDelivr ESM builds. CDN globals ARE accessible to module scripts loaded in the same document — this should work.

3. **Google Fonts availability on cPanel deployment**
   - What we know: Google Fonts are blocked by privacy tools on some browsers
   - What's unclear: Whether the target audience (photography clients) commonly uses such tools
   - Recommendation: Use Google Fonts CDN for Phase 1; add self-hosted font fallback in Phase 5 performance pass

---

## Sources

### Primary (HIGH confidence)
- https://www.jsdelivr.com/package/npm/gsap — GSAP 3.14.2 current version, confirmed December 12, 2025
- https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ — Available plugin files including ScrollTrigger.min.js and ScrollSmoother.min.js
- https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API — pushState/popstate behavior
- https://developer.mozilla.org/en-US/docs/Web/API/History/pushState — pushState spec (does not fire popstate)
- https://css-tricks.com/grainy-gradients/ — SVG feTurbulence grain technique
- https://fonts.google.com/specimen/Playfair+Display — Font availability and CSS import

### Secondary (MEDIUM confidence)
- https://fhaladin-dev.medium.com/good-news-gsap-is-finally-free/ — GSAP free announcement (verified against jsDelivr license field showing "Standard 'no charge' license")
- https://gsap.com/community/forums/topic/32997-gsap-with-cdn/ — GreenSock admin confirming global availability of CDN-loaded GSAP
- https://blog.pixelfreestudio.com/how-to-use-html5-history-api-for-single-page-apps/ — SPA router pattern with 404 pitfall
- https://support.reclaimhosting.com/hc/en-us/articles/1500004804522 — cPanel public_html folder structure

### Tertiary (LOW confidence)
- WebSearch results for vanilla JS state store patterns — corroborated by multiple consistent sources but not verified against a single authoritative spec

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GSAP version confirmed via jsDelivr CDN page (December 2025); font confirmed via Google Fonts; no-build CDN approach confirmed via official GSAP forum
- Architecture: HIGH — History API pattern from MDN (authoritative); CSS custom properties from MDN; GSAP plugin registration from official docs
- Pitfalls: HIGH — pushState/popstate behavior documented in HTML spec via MDN; cPanel .htaccess confirmed via hosting documentation; CORS/file:// restriction well-established browser behavior

**Research date:** 2026-02-28
**Valid until:** 2026-03-28 (stable domain — CSS/JS platform APIs change slowly; GSAP minor updates won't affect patterns)
