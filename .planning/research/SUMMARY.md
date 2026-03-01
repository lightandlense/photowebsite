# Project Research Summary

**Project:** Darkroom Portfolio — Immersive Photography Portfolio Website
**Domain:** Creative portfolio / static website with complex animation
**Researched:** 2026-02-28
**Confidence:** HIGH (stack and pitfalls), MEDIUM-HIGH (features), MEDIUM (architecture)

## Executive Summary

The Darkroom Portfolio is not a conventional photography website. It is an immersive experience built around a darkroom metaphor: a clothesline landing where the user removes hanging photographs to enter horizontal filmstrip galleries per genre. This is a static HTML/CSS/JS site hosted on cPanel, meaning no server-side framework and no build pipeline. The research is unanimous that GSAP 3.14 with ScrollTrigger and ScrollSmoother is the correct animation engine — it is the only toolchain with the depth (pinned horizontal scroll, sequenced timelines, scroll-scrubbing) required to execute this experience. The entire stack must remain vanilla to avoid dependency conflicts with GSAP. No React, no Tailwind, no jQuery.

The recommended approach is a pseudo-SPA architecture: static HTML files that never trigger full page reloads. A lightweight JavaScript router intercepts navigation, sequences GSAP transition timelines, and swaps scene modules. This is the only way to preserve animation continuity between the clothesline and the filmstrip. The build order is strictly bottom-up — design tokens and state management first, then the darkroom scene, then transition sequences, then the filmstrip gallery. The pull-in transition must be built before the filmstrip because it defines the visual contract of entry. Deviating from this order will require significant rework.

The most critical risks are performance collapse from unoptimized images, iOS Safari ScrollTrigger pin jitter breaking the filmstrip on iPhones, and navigation traps from scrolljacking without proper escape hatches. All three must be addressed before the filmstrip is populated with real photos. Secondary risks include the darkroom aesthetic fragmenting on utility pages (Contact, About) and the browser back button breaking animated state. Both require architectural decisions in the foundation phase, not as retrofits. The good news: GSAP is now fully free including all premium plugins (post-Webflow acquisition), meaning the entire recommended stack costs nothing beyond hosting.

## Key Findings

### Recommended Stack

The site requires no npm, no build step, and no framework. GSAP 3.14 loads from CDN (pinned to the minor version — never `@latest`). Vanilla CSS with custom properties handles all styling, with the darkroom color palette defined centrally in `:root`. Vanilla JavaScript ES2022+ handles all DOM manipulation. Images are exported as WebP with JPEG fallback, compressed through Squoosh to under 200KB per filmstrip photo. The contact form uses Formspree (free tier, 50 submissions/month) to eliminate the PHP backend entirely. Self-hosted fonts via `@font-face` avoid GDPR issues and external requests.

**Core technologies:**
- **GSAP 3.14 + ScrollTrigger + ScrollSmoother:** All animation — timelines, scroll-driven behavior, pinned horizontal scroll, smooth scroll. Free including commercial use since Webflow acquisition. The only toolchain that handles this complexity reliably.
- **Vanilla CSS with Custom Properties:** Darkroom aesthetic, layout, responsive breakpoints. No Tailwind (requires build step, fights hand-crafted aesthetic).
- **Vanilla JavaScript ES2022+:** DOM, events, gallery state, router. No jQuery (obsolete), no React (requires Node or build pipeline, incompatible with static cPanel hosting).
- **WebP + JPEG fallback via `<picture>`:** 30-50% smaller than JPEG at equivalent quality. Squoosh for batch compression — no build pipeline.
- **Formspree (free tier):** Contact form backend. Zero PHP, zero server config, built-in spam filtering.
- **Native `loading="lazy"`:** Filmstrip image lazy loading. 95%+ browser support, zero JavaScript overhead.

### Expected Features

The immersive experience IS the product. An MVP that strips the animations would defeat the entire purpose of the site. The MVP must prove the full end-to-end concept — clothesline through filmstrip — for at least one genre before scaling to all five.

**Must have (table stakes):**
- High-resolution image display at display-appropriate size (WebP, 2000px max)
- Five genre categories: Fashion, Beauty, Light Painting, Drone, Video
- About page maintaining darkroom aesthetic
- Contact form with darkroom styling and working submission backend
- Mobile responsiveness (horizontal filmstrip needs explicit touch fallback — swipe gesture, not mouse wheel)
- Fast load time under 3 seconds — significant challenge requiring lazy loading and image optimization discipline
- Open Graph meta tags, image alt text, sitemap.xml for SEO
- Clear back navigation from filmstrip to clothesline

**Should have (differentiators):**
- Darkroom ambient lighting on clothesline landing (near-black background, amber/red ambient tones)
- Clothesline with five hanging photos and clothespin elements
- Hand animation removing photo from clothespin on click
- Camera pull-in transition from clothesline to filmstrip
- Horizontal filmstrip gallery per genre (vertical scroll mapped to horizontal movement)
- Photo enlarge-in-place on hover/pause (no modal — scale transform in filmstrip context)
- Video inline playback in filmstrip (hover-to-play, no full-screen, no modal)
- Consistent darkroom aesthetic across all pages (not just landing)
- Ambient film grain texture overlay (CSS-only, near-zero cost)

**Defer to v2+:**
- Custom cursor (circle morphing to magnifier/hand on hover)
- Preloader / film leader countdown reveal animation
- Ambient darkroom sound (opt-in toggle — controversial, accessibility concern)
- Full SEO optimization pass (schema, alt text audit, sitemap)
- Remaining four genres after first genre proves the filmstrip pattern
- Print shop or e-commerce functionality

**Explicit anti-features (never build):**
- Lightbox/modal overlays — breaks filmstrip metaphor
- Standard navbar — destroys darkroom illusion
- White or light backgrounds on any page
- Infinite scroll or masonry grid
- Social media feed embeds
- Autoplay audio on page load
- CMS or admin panel

### Architecture Approach

The site uses a pseudo-SPA pattern with static HTML files and a JavaScript router that intercepts link clicks, sequences GSAP transitions, and swaps scene modules without page reloads. Each "page" is a scene module with `enter()` and `exit()` methods that own their own DOM, event listeners, and ScrollTrigger instances. All cross-scene transitions are centralized in a single `transitions.js` file. A lightweight pub/sub state store tracks active genre, animation phase, and scroll position. The only server-side component is the contact form — handled entirely by Formspree, eliminating any PHP requirement.

**Major components:**
1. **Router (`app.js`)** — Intercepts links, manages History API pushState/popstate, sequences transitions between scenes
2. **State Store (`state.js`)** — Single source of truth (active genre, animation phase); vanilla pub/sub pattern, no library
3. **Darkroom Scene (`scene-darkroom.js`)** — Clothesline DOM, clothespin click handlers, ambient lighting; fires genre-selected events
4. **Gallery Scene (`scene-gallery.js`)** — Filmstrip DOM builder, horizontal ScrollTrigger scroll, hover zoom, inline video
5. **Transition Controller (`transitions.js`)** — Named GSAP timelines (hand-grab, pull-in, filmstrip-reveal, pull-out); scenes request by name, do not own their own transitions
6. **Media Manager (`media.js`)** — Preloads clothesline photos on entry; lazy-loads filmstrip images via IntersectionObserver as user scrolls
7. **Gallery Data (`gallery.json`)** — Genre metadata and image manifests; adding a genre requires only a JSON entry, not a code change

### Critical Pitfalls

1. **Serving full-resolution camera exports** — A single genre at full res can reach 500MB+. Establish the image export spec (2000px max, 60-70% quality, WebP+JPEG) as the very first step, before any gallery work begins. Every image through Squoosh before upload.

2. **iOS Safari ScrollTrigger pin jitter** — The horizontal filmstrip's `pin: true` mechanism jitters or breaks on every iPhone and iPad due to iOS Safari's dynamic viewport resize. Fix: `ScrollTrigger.normalizeScroll(true)` + `anticipatePin: 1` + `overscroll-behavior: none` on body. Must be validated on a real iOS device before populating the gallery with real photos.

3. **Scrolljacking without escape hatches** — The filmstrip hijacks vertical scroll. Users who cannot find the back button bounce. Always provide a visible, thematic back navigation (not just browser back button). Keyboard navigation (arrow keys) required. Visual scroll affordance required. Decide this in the foundation phase.

4. **Browser back button breaks animated state** — GSAP transitions are not real browser navigations. Without History API integration, the back button either shows a blank page or snaps to the clothesline without animation. Decision (pushState/popstate handling) must be made in the foundation phase, not retrofitted.

5. **Darkroom aesthetic collapses on utility pages** — Contact and About pages receive less creative attention and end up looking like standard web forms. Prevention: define the CSS design system (custom properties, form element styling, darkroom inputs) before building any page. All pages share the base atmospheric styles.

## Implications for Roadmap

Based on research, the architecture has six clear dependency layers that map directly to phases. The research is explicit: build bottom-up. Transitions must precede the filmstrip. The design system must precede Contact and About. Image optimization must precede gallery population.

### Phase 1: Foundation and Design System

**Rationale:** Everything else depends on this. CSS custom properties define the darkroom palette used by every page. State store and router skeleton establish the navigation architecture before any transitions are animated. Image export spec must be locked before a single photo is uploaded. History API strategy (pushState/popstate) must be decided here — impossible to retrofit cleanly.

**Delivers:** Project scaffolding (file structure, CSS tokens, router stub, state store), image export workflow, and non-negotiable decisions (navigation model, contact form backend choice)

**Addresses:** Fast load time, mobile responsiveness groundwork, darkroom consistency across pages (pitfall 6), browser back button (pitfall 9), contact form backend (pitfall 8)

**Avoids:** Serving full-res images (pitfall 1), async navigation breakdown (pitfall 9), utility page aesthetic collapse (pitfall 6)

**Research flag:** Standard patterns — well-documented. No deeper phase research needed.

### Phase 2: Darkroom Landing Scene (Clothesline)

**Rationale:** The clothesline is the entry point and the emotional hook. It must exist and function (statically, then with animation) before any transitions can be built — the pull-in transition launches FROM the clothesline. Ambient lighting, clothespin elements, and the photo arrangement are established here.

**Delivers:** Functioning darkroom landing with clothesline of five photos, clothespin elements, ambient lighting, and click handlers (without transition animation yet)

**Uses:** GSAP (entrance timeline), CSS custom properties from Phase 1, vanilla JS clothespin click handlers

**Implements:** Darkroom Scene module (`scene-darkroom.js`), Media Manager clothesline preload, grain overlay

**Avoids:** GPU memory overload (pitfall 4) — `will-change` pattern established here once and reused everywhere

**Research flag:** Standard GSAP patterns apply. No deeper research needed.

### Phase 3: Transition Sequences (Hand Animation and Pull-In)

**Rationale:** The pull-in transition defines the visual contract for how the gallery is entered. Building the gallery first and bolting the transition on later requires reworking the gallery's initial state. This is the most unique and high-risk animation in the project — it needs a prototype phase with time to iterate.

**Delivers:** Hand-grab animation, camera pull-in transition, filmstrip-reveal animation, and pull-out (back) animation — all as named timelines in `transitions.js`

**Uses:** GSAP timelines, GSAP `quickTo()` for spring physics, transitions.js pattern

**Implements:** Transition Controller (`transitions.js`), Router wired to fire transition sequences

**Avoids:** Animation logic scattered across files (architecture anti-pattern 1), CSS transitions conflicting with GSAP transforms (architecture anti-pattern 4)

**Research flag:** High complexity, custom animation work. No additional external research needed — GSAP docs are authoritative. Allow iteration time in planning.

### Phase 4: Horizontal Filmstrip Gallery

**Rationale:** Depends on the transition from Phase 3 (gallery entry is defined) and the state store from Phase 1 (active genre drives which photos load). This is the most technically complex phase — horizontal ScrollTrigger scroll with IntersectionObserver lazy loading and hover zoom. iOS Safari must be validated here with dummy content before real photos go in.

**Delivers:** Fully functional filmstrip for one genre, horizontal scroll via ScrollTrigger, photo enlarge-in-place on hover, IntersectionObserver lazy loading, back navigation to clothesline

**Uses:** GSAP ScrollTrigger (pin + scrub), `invalidateOnRefresh: true`, `ScrollTrigger.normalizeScroll(true)`, `anticipatePin: 1`, `gallery.json` data structure

**Implements:** Gallery Scene module (`scene-gallery.js`), Media Manager filmstrip lazy-load

**Avoids:** iOS Safari pin jitter (pitfall 2) — must test on real device, `ScrollTrigger.normalizeScroll(true)` required; scrolljacking trap (pitfall 3) — visible back button and keyboard nav built here; loading all images upfront (architecture anti-pattern 2)

**Research flag:** Needs care — iOS Safari behavior is documented but device-specific. Test on hardware at every milestone.

### Phase 5: Video Genre and Remaining Genres

**Rationale:** Video inline playback is explicitly deferred until the filmstrip pattern is proven solid. The `playsinline` + `muted` + `preload="none"` pattern for iOS is a critical requirement. Remaining four genres are populated once the filmstrip code is validated — `gallery.json` entries, no code changes.

**Delivers:** Video genre with hover-to-play inline playback, all five genres populated in the filmstrip

**Uses:** `<video muted playsinline preload="none">`, JavaScript hover-play handlers, `gallery.json` entries per genre

**Avoids:** iOS full-screen video override (pitfall 5) — `playsinline` is non-negotiable from the first line of video markup

**Research flag:** Video element behavior on iOS is well-documented. Standard patterns apply.

### Phase 6: Supporting Pages (About and Contact)

**Rationale:** These pages are independent of the gallery flow but must consume the design system from Phase 1. Building them after the gallery means the darkroom aesthetic is well-established and can be consistently applied. The contact form backend (Formspree) must be wired and tested through to email delivery.

**Delivers:** About page with darkroom styling, Contact page with darkroom form elements, working Formspree submission pipeline, router wired for all four routes

**Implements:** About Scene (`scene-about.js`), Contact Scene (`scene-contact.js`), Formspree integration

**Avoids:** Darkroom aesthetic collapse on utility pages (pitfall 6) — CSS design system from Phase 1 makes this straightforward

**Research flag:** Standard patterns. Formspree integration is trivial. No deeper research needed.

### Phase 7: Polish, Performance, and SEO

**Rationale:** Performance audit and mobile pass come last because they require real content to be meaningful. Lighthouse scores on placeholder images are not representative. `prefers-reduced-motion` wiring, cross-browser testing, animation timing fine-tuning, and the SEO layer (Open Graph, sitemap, alt text audit, JSON-LD schema) all happen here.

**Delivers:** Lighthouse performance score target (>80 on mobile), `prefers-reduced-motion` fallbacks for all GSAP timelines, cross-browser validation, full SEO layer, mobile touch interaction polish

**Avoids:** `prefers-reduced-motion` ignored (pitfall 7), image theft (pitfall 10 — EXIF metadata baked into exports, display resolution capped at 2000px), PNG transparency flash on dark background (pitfall 11)

**Research flag:** Performance audit patterns are well-documented. No deeper research needed.

### Phase Ordering Rationale

- Design system before everything: CSS custom properties and the darkroom palette must exist before any page is styled. Retrofitting a design system after pages are built is expensive.
- Transitions before filmstrip: The pull-in transition is the visual contract for gallery entry. The filmstrip's initial reveal state is defined by this transition.
- One genre before five genres: Proves the filmstrip end-to-end. Avoids building all five and discovering a structural problem in the scroll architecture that requires reworking all five.
- Supporting pages after gallery: The darkroom aesthetic is most fully realized in the gallery. Applying it to About and Contact after the gallery exists means you are matching a known target, not inventing in parallel.
- Polish last: Real performance numbers require real content. Premature optimization on placeholder images misleads.

### Research Flags

Phases needing attention during planning:
- **Phase 3 (Transitions):** Allow iteration time — hand animation and pull-in are the highest-craft animations on the site. The creative execution will require experimentation. No external research needed; the risk is craftsmanship time, not unknown patterns.
- **Phase 4 (Filmstrip):** Test on real iOS hardware at the prototype stage (3 dummy images). iOS Safari ScrollTrigger jitter is well-documented but device behavior varies. Do not advance to full content population without hardware validation.

Phases with standard patterns (no deeper research needed):
- **Phase 1 (Foundation):** CSS custom properties, vanilla JS router, and History API are all well-documented.
- **Phase 2 (Darkroom Landing):** GSAP entrance timelines are standard. Clothesline layout is CSS.
- **Phase 5 (Video + Genres):** Video `playsinline` pattern is documented. Additional genres are data-driven.
- **Phase 6 (Supporting Pages):** Formspree integration is trivial. Darkroom form styling is CSS.
- **Phase 7 (Polish):** Lighthouse audit, `prefers-reduced-motion`, SEO — all established patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | GSAP official docs, jsDelivr CDN, npm registry all confirmed. Rejection rationale for alternatives (Lenis, Tailwind, React) is well-reasoned and cross-validated. |
| Features | MEDIUM-HIGH | Table stakes are well-documented from industry sources. Differentiator features (clothesline, hand animation, pull-in) are novel but logically derived from analogous award-winning portfolio patterns. |
| Architecture | MEDIUM | Core GSAP/ScrollTrigger patterns are HIGH confidence from official docs. Pseudo-SPA router pattern for static files is MEDIUM — less documented, but the approach is sound. Contact form via Formspree is HIGH confidence. |
| Pitfalls | HIGH | iOS Safari ScrollTrigger jitter, LCP lazy-loading anti-pattern, `playsinline` requirement, and `will-change` GPU memory — all verified against GSAP community forums, MDN, and NN/G. |

**Overall confidence:** HIGH

### Gaps to Address

- **Mobile clothesline layout:** The research identifies that the horizontal clothesline does not translate to mobile and suggests a vertical stack or 2-column grid with clothespin motif, but does not specify exact breakpoints or layout proportions. Decide during Phase 2.
- **Hand animation specifics:** The research describes the animation conceptually (hand enters frame, grasps clothespin, photo releases). The exact SVG asset design, animation timing, and easing curve are left to implementation. Budget creative iteration time in Phase 3.
- **gallery.json schema:** The data structure for genre metadata and image manifests is referenced but not fully specified in the research. Define the schema in Phase 1 before any gallery code is written.
- **PHP vs. Formspree:** Both are viable. The research leans toward Formspree for simplicity. The final choice should be made in Phase 1 and implemented in Phase 6. Recommend Formspree unless there is a specific reason to control the backend.

## Sources

### Primary (HIGH confidence)
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Horizontal scroll, pin behavior, normalizeScroll, anticipatePin
- [GSAP Timeline Docs](https://gsap.com/docs/v3/GSAP/Timeline/) — Named timelines, sequencing, Router.then() pattern
- [GSAP Plugins Docs](https://gsap.com/docs/v3/Plugins/) — Free plugin confirmation post-Webflow acquisition
- [GSAP ScrollTrigger normalizeScroll](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll/) — iOS Safari fix
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — Accessibility media query
- [web.dev browser-level-image-lazy-loading](https://web.dev/articles/browser-level-image-lazy-loading) — Native lazy loading strategy
- [Awwwards portfolio examples](https://www.awwwards.com/websites/portfolio/) — Feature benchmark

### Secondary (MEDIUM confidence)
- [GSAP Community — iOS pin jitter](https://gsap.com/community/forums/topic/40393-gsap-scrolltrigger-pin-position-is-jumping-on-ios-due-to-its-address-bar/) — iOS Safari ScrollTrigger bug confirmation
- [Smashing Magazine GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — will-change pitfall
- [NN/G Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/) — UX scrolljacking research
- [Formspree plans](https://formspree.io/plans) — Free tier limits (50 submissions/month)
- [squoosh.app](https://squoosh.app/) — Image compression workflow
- [Zun Creative ScrollSmoother vs Lenis](https://zuncreative.com/en/blog/smooth_scroll_meditation/) — Library comparison
- [Mux video best practices](https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025) — playsinline iOS requirement

### Tertiary (LOW confidence)
- [Framer Blog: photography portfolio websites](https://www.framer.com/blog/photography-portfolio-websites/) — Feature inspiration (illustrative)
- [10+ Must See Dark Photography Websites](https://flothemes.com/dark-photography-websites/) — Aesthetic reference (illustrative)

---
*Research completed: 2026-02-28*
*Ready for roadmap: yes*
