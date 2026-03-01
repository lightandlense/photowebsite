# Technology Stack

**Project:** Darkroom Portfolio — Immersive Photography Portfolio Website
**Researched:** 2026-02-28
**Overall confidence:** HIGH (core stack), MEDIUM (tooling)

---

## Recommended Stack

### Core Animation Engine

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GSAP (GreenSock) | 3.14.x | All animation sequencing — hand grab, camera pull-in, filmstrip transitions, stagger effects | Industry-standard for complex, sequenced animations. Acquired by Webflow in 2024, now 100% free including all bonus plugins (SplitText, ScrollSmoother, MorphSVG). ScrollTrigger handles all scroll-driven behavior. Nothing else matches its performance, timeline API, or cross-browser reliability for this complexity level. |
| GSAP ScrollTrigger | 3.14.x (bundled) | Filmstrip horizontal scroll, pull-in trigger points, scroll-based animation orchestration | Ships with GSAP free. The canonical solution for pinned horizontal scroll galleries. Handles the filmstrip-to-clothesline back transition scroll triggers. |
| GSAP ScrollSmoother | 3.14.x (bundled) | Smooth native scroll feel across the entire site | Now free. Built on native scroll (not CSS transforms), so it doesn't break layout. Integrates directly with ScrollTrigger unlike Lenis. Choose this over Lenis because the project is already deep in the GSAP ecosystem — a single coherent system beats mixing libraries. |

### Scroll & Motion

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Lenis | NOT RECOMMENDED | — | Lenis is excellent for simple sites. This project's horizontal filmstrip + pinned scroll + nested scroll triggers means Lenis would fight GSAP rather than help it. ScrollSmoother is architecturally compatible. Skip Lenis. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla CSS with Custom Properties | Native (no library) | All visual styling — darkroom aesthetic, layout, responsive breakpoints | No build step needed. CSS custom properties handle the entire darkroom color palette (dark browns, amber, shadow tones) from a single `:root` block. CSS Grid + Flexbox handle the clothesline layout and filmstrip rails. No framework overhead or class-name verbosity for what is fundamentally a hand-crafted aesthetic site. |
| Google Fonts (self-hosted) | Current | Typography — analog/film aesthetic fonts | Load via `@font-face` from local files (not Google CDN). Self-hosting avoids GDPR issues, adds no external request, and GoDaddy cPanel supports static font files. Suggested typefaces: a serif for editorial feel (e.g., Playfair Display), monospace for metadata (e.g., IBM Plex Mono). |

### Interactivity (No Framework)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JavaScript (ES2022+) | Native | DOM manipulation, event handling, gallery state management, video inline playback | jQuery is obsolete for new projects. ES6+ `querySelector`, `fetch`, `IntersectionObserver`, and `classList` cover every use case. No build step. No transpilation needed for modern browser targets. Keeping JS vanilla means zero dependency conflicts with GSAP. |

### Image Handling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native `loading="lazy"` | HTML attribute | Lazy loading of filmstrip photos | 95%+ browser support in 2026. Zero JavaScript, zero library, handles the heavy gallery load problem for free. Apply to all filmstrip images; exclude clothesline hero images (above the fold). |
| `<picture>` + WebP | HTML + convert once | Responsive image format | WebP delivers 30–50% smaller files than JPEG at equivalent quality. All modern browsers support it. Use `<picture>` with WebP source + JPEG fallback. AVIF offers better compression but conversion tooling is slower — WebP is the pragmatic choice. |
| Squoosh (squoosh.app) | Web app (no install) | Image compression during asset prep | Run every photo through Squoosh before deploying. No build pipeline, no npm. Compress to WebP + JPEG fallback. Targeting 150–300KB per portfolio image at display size. |

### Contact Form

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Formspree | Free tier | Contact form submissions on static hosting | 50 submissions/month free. Works on any static host including cPanel/GoDaddy — no PHP, no Node, just a `<form action="https://formspree.io/f/{id}">`. Built-in spam filtering, email notifications to Russell's inbox. The free tier is adequate for a photographer's inquiry volume. Upgrade path exists if needed. |

### Development Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| VS Code + Live Server extension | Current | Local development preview | No build step means Live Server is sufficient. Hot reload on file save. No Webpack, Vite, or Parcel needed — this would add complexity without benefit for a static HTML site. |
| Browser DevTools | Built-in | Animation debugging | GSAP's DevTools helper plugin (free, also in the 3.14 package) adds a visual animation inspector in Chrome DevTools. Essential for debugging the hand animation timeline. |

---

## CDN Links (Load Order Matters)

```html
<!-- 1. GSAP Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14/dist/gsap.min.js"></script>

<!-- 2. ScrollTrigger plugin (must come after core) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14/dist/ScrollTrigger.min.js"></script>

<!-- 3. ScrollSmoother plugin (must come after ScrollTrigger) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14/dist/ScrollSmoother.min.js"></script>

<!-- 4. Your JS last -->
<script src="/js/main.js" type="module"></script>
```

> **Note:** Pin GSAP to `@3.14` not `@latest`. CDN `@latest` resolves to whatever the registry reports, which can change unexpectedly and break your animations in production. Lock the minor version.

---

## Alternatives Considered and Rejected

| Category | Recommended | Alternative | Why Alternative Rejected |
|----------|-------------|-------------|--------------------------|
| Animation engine | GSAP 3.14 | Anime.js v4 | Anime.js v4 (April 2025) is competent but lacks ScrollTrigger's pinning/scrubbing depth. You would spend weeks rebuilding what ScrollTrigger gives you for free. GSAP is the industry standard for this class of animation. |
| Animation engine | GSAP 3.14 | Motion One | Motion One is built on the Web Animations API — excellent for simple UI micro-animations, not built for complex sequenced timelines with scroll-scrubbing and pinning. |
| Smooth scroll | GSAP ScrollSmoother | Lenis 1.3.x | Lenis pairs better with non-GSAP stacks. When you already have GSAP, mixing Lenis adds a dependency and creates potential RAF (requestAnimationFrame) loop conflicts. ScrollSmoother is the native choice. |
| Styling | Vanilla CSS | Tailwind CSS | Tailwind requires a build step (PostCSS). The darkroom aesthetic demands precise custom styling — utility classes fight that. Tailwind adds 30KB overhead. No benefit for a hand-crafted visual experience. |
| JS approach | Vanilla ES2022+ | jQuery | jQuery is a solved problem. Adds ~30KB, adds nothing that vanilla JS doesn't provide natively in 2026. |
| Framework | None (static HTML) | React / Next.js | Project constraint is explicit: static files on cPanel hosting. React requires a Node server or static export. Even static exports add complexity and a build pipeline. The animations don't require component state management. |
| Contact form | Formspree | PHP mail() on cPanel | PHP mail() requires server-side code, spam filtering setup, and is frequently blocked by hosting providers. Formspree is zero-maintenance. |
| Image format | WebP + JPEG fallback | AVIF first | AVIF offers better compression but browser support at edge cases (older Safari) is still lower. AVIF encoding is CPU-intensive and slow in Squoosh for bulk processing. WebP is the pragmatic 2026 choice for a solo developer. |

---

## Installation

This is a static site — no `npm install` required. GSAP is loaded from CDN. No build step.

**Pre-development checklist:**
```bash
# 1. Verify local dev works
# Install VS Code + Live Server extension

# 2. No package.json needed — but if you want one for future tooling:
# echo '{"name":"darkroom-portfolio","version":"1.0.0"}' > package.json

# 3. Folder structure
mkdir -p css js images/fashion images/beauty images/lightpainting images/drone images/video fonts
```

**Project file structure:**
```
/
├── index.html              # Darkroom clothesline landing
├── gallery.html            # Filmstrip view (JS handles genre switching)
├── about.html              # Bio page
├── contact.html            # Contact form
├── css/
│   ├── base.css            # Reset, custom properties, typography
│   ├── darkroom.css        # Darkroom aesthetic, clothesline layout
│   ├── filmstrip.css       # Horizontal gallery, filmstrip rail
│   └── animations.css      # CSS-only animation states (no GSAP)
├── js/
│   ├── main.js             # GSAP registration, global setup
│   ├── clothesline.js      # Hand animation, photo removal
│   ├── transition.js       # Camera pull-in between pages
│   ├── filmstrip.js        # Horizontal scroll, zoom on hover
│   └── video.js            # Inline video thumbnail playback
├── images/
│   ├── ui/                 # Hand SVG, clothespin sprites
│   └── [genre]/            # Per-genre WebP + JPEG
└── fonts/                  # Self-hosted webfonts
```

---

## GSAP Plugin Registration

GSAP requires plugins to be registered before use. This is a common gotcha:

```javascript
// js/main.js — MUST run before any other GSAP code
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Initialize ScrollSmoother once globally
const smoother = ScrollSmoother.create({
  smooth: 1.2,
  effects: true,
  smoothTouch: 0.1
});
```

---

## Performance Budget

| Asset Type | Target Size | Strategy |
|------------|-------------|----------|
| Hero/clothesline photos (5) | < 100KB each | WebP, 800px wide, Squoosh |
| Filmstrip photos (10–25 per genre) | < 200KB each | WebP, 1200px wide, lazy loaded |
| GSAP + plugins (CDN) | ~68KB gzipped | CDN cached, one-time load |
| Total JS (custom) | < 30KB | Vanilla JS, no framework |
| Total CSS | < 20KB | Custom, no framework |

---

## Sources

- GSAP current version and free plugins confirmation: [jsDelivr GSAP CDN](https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/) | [GSAP GitHub](https://github.com/greensock/GSAP) | [npm gsap](https://www.npmjs.com/package/gsap)
- GSAP ScrollTrigger horizontal scroll: [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- GSAP Plugins now free (post-Webflow acquisition): [GSAP Plugins Docs](https://gsap.com/docs/v3/Plugins/)
- Anime.js v4 release: [Anime.js Installation Docs](https://animejs.com/documentation/getting-started/installation/) | [GitHub Releases](https://github.com/juliangarnier/anime/releases)
- Lenis smooth scroll: [Lenis GitHub](https://github.com/darkroomengineering/lenis) | [Lenis CDN jsDelivr](https://www.jsdelivr.com/package/npm/lenis)
- ScrollSmoother vs Lenis comparison: [Zun Creative comparison article](https://zuncreative.com/en/blog/smooth_scroll_meditation/) | [Born Digital comparison](https://www.borndigital.be/blog/our-smooth-scrolling-libraries)
- WebP browser support 2025-2026: [Image Format Guide 2025](https://oneimage.co/blogs/image-format-guide-2025/) | [Frontend Tools WebP guide](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025)
- Native lazy loading best practice: [vanilla-lazyload GitHub](https://github.com/verlok/vanilla-lazyload) | [DebugBear lazy load article](https://www.debugbear.com/blog/lazy-load-background-images-intersection-observer)
- Squoosh image optimization: [squoosh.app](https://squoosh.app/) | [GoogleChromeLabs/squoosh](https://github.com/GoogleChromeLabs/squoosh)
- Formspree free tier: [Formspree plans](https://formspree.io/plans) | [Formspree account limits](https://help.formspree.io/hc/en-us/articles/47605896654227-Account-limits)
- Vanilla JS vs jQuery 2025: [WaspDev article](https://waspdev.com/articles/2025-07-07/is-it-still-worth-using-jquery-in-2025)
