# Domain Pitfalls

**Domain:** Immersive photography portfolio — darkroom aesthetic, heavy animation, horizontal filmstrip gallery
**Researched:** 2026-02-28
**Confidence:** HIGH (verified against GSAP docs, MDN, NN/G, multiple authoritative sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken experiences, or total loss of immersion.

---

### Pitfall 1: Serving Full-Resolution Images Directly

**What goes wrong:** Camera-exported JPEGs (12–50 MB each) are placed in the web root and referenced directly. With 10–25 images across 5 genres (50–125 images), initial page weight can reach 1–3 GB. The site stalls before any animation fires.

**Why it happens:** Photographers work in full-res all day. It feels natural to just upload the same files to the hosting account. There is no build pipeline to catch this.

**Consequences:** Page abandonment before any "wow" moment. The entire immersive premise collapses because the darkroom never fully renders. Mobile users on cellular give up in seconds.

**Prevention:**
- Export web-optimized JPEGs at 2000px max on longest edge, 60–70% quality, under 500 KB each
- Serve WebP (30–50% smaller than JPEG) with `<picture>` element fallback to JPEG for any IE users (negligible in 2026, but `<picture>` costs nothing)
- Do NOT lazy-load the hero/landing image (the clothesline photograph visible immediately) — lazy loading the LCP element is a confirmed performance anti-pattern that delays the first impression
- DO lazy-load filmstrip images using `IntersectionObserver` — they are off-screen on arrival

**Detection warning signs:**
- Lighthouse performance score below 50
- LCP (Largest Contentful Paint) over 4 seconds
- Any single image file over 1 MB in the web directory

**Phase:** Image optimization strategy must be decided in the foundation phase before any gallery work begins. Retrofitting is painful.

---

### Pitfall 2: ScrollTrigger Pin Jitter on iOS Safari

**What goes wrong:** GSAP's `ScrollTrigger` with `pin: true` — the core mechanism for the horizontal filmstrip scroll — jitters, jumps, or scrolls-to-top on iOS Safari. The iOS address bar dynamically resizes the viewport, and Safari misreports position data. This is a documented, long-standing browser bug (reported since 2017 and unresolved).

**Why it happens:** The horizontal scroll technique freezes a section via `pin: true` and animates `x`/`xPercent` on the filmstrip container as the user scrolls vertically. iOS Safari's layout viewport changes during scroll (the browser chrome shows/hides), causing ScrollTrigger's pre-calculated intersection points to be wrong.

**Consequences:** On every iPhone and iPad — the dominant mobile photography client device — the filmstrip either jitters visibly or breaks entirely. The immersion shatters at the most critical moment of the experience.

**Prevention:**
- Use `ScrollTrigger.normalizeScroll(true)` — GSAP's built-in workaround that takes control of scroll normalization away from the browser
- Avoid mixing ScrollTrigger with `scroll-behavior: smooth` in CSS (causes scroll-to-top on iOS 16+)
- Set `overscroll-behavior: none` on the body for the gallery view
- Test on a real iOS device at every milestone, not just Chrome DevTools mobile emulation
- Use `anticipatePin: 1` on the ScrollTrigger config to reduce "jump" at pin start

**Detection warning signs:**
- Animation works perfectly in Chrome but has visible jitter on Safari
- Console showing rapid, repeated ScrollTrigger refresh events on mobile
- Users report "the gallery jumps" on iPhone

**Phase:** Must be validated in the gallery prototype phase (before adding all photos). Build the horizontal scroll with 3 dummy images first, fix iOS issues, then scale up.

---

### Pitfall 3: Scrolljacking Without an Escape Hatch

**What goes wrong:** The site intercepts the user's natural scroll to drive horizontal movement in the filmstrip. Users who want to scroll past the section or return to the top cannot. Nielsen Norman Group research shows users "quickly become very frustrated" with scrolljacking — they feel trapped.

**Why it happens:** The filmstrip design inherently requires redirecting vertical scroll to horizontal movement. Developers focus on making the happy path beautiful and forget that some users want to leave, go back, or skip.

**Consequences:** Users bounce. For a portfolio converting visitors to booking inquiries, a user who cannot figure out how to navigate back is a lost lead. The experience feels like a trap rather than a darkroom.

**Prevention:**
- Always provide a visible "Back" button within the filmstrip view that returns to the clothesline — do not rely on the browser back button alone
- Make the back navigation feel thematic (e.g., a film reel icon, or the hand animation in reverse) rather than a plain `<button>`
- Ensure keyboard navigation works: `tabindex="0"` on the scrollable container, arrow keys advance the filmstrip
- Add a subtle visual affordance (e.g., scroll indicator, film perforations animating) so users understand horizontal scroll is happening
- Test with users who have never seen the site before — does the "how to navigate" pattern click within 5 seconds?

**Detection warning signs:**
- Usability test sessions where testers ask "how do I go back?"
- Scroll container has no keyboard-accessible way to advance
- Mobile users cannot swipe back to the clothesline

**Phase:** Navigation model must be established in the UI architecture phase, before filmstrip styling is finalized.

---

### Pitfall 4: GPU Memory Overload from Excessive `will-change`

**What goes wrong:** Every animated element — clothespins, photographs, filmstrip frames, hand SVG, ambient particles — gets `will-change: transform` applied globally or permanently. On mobile devices, each composite layer consumes GPU memory. Too many layers crash the mobile browser tab.

**Why it happens:** `will-change` is the "make animations smooth" property. Developers apply it liberally to everything that animates. GSAP also promotes hardware acceleration, which can tempt developers to set `will-change` on entire containers.

**Consequences:** On mid-range Android and older iPhones, the browser tab crashes silently. The user sees a blank page or is kicked to the browser home screen. Impossible to diagnose without specific device testing.

**Prevention:**
- Apply `will-change: transform` only immediately before an animation begins (via JavaScript) and remove it immediately after (`element.style.willChange = 'auto'`)
- Never apply `will-change: all` — this is explicitly called out as a memory bomb
- GSAP automatically applies GPU-compositing transforms during animation; you generally do not need to manually set `will-change` when using GSAP
- Limit simultaneous animated elements to 10–15 at any given moment
- Test on a real mid-range Android device (not flagship) — Chrome DevTools does not expose GPU memory pressure accurately

**Detection warning signs:**
- Chrome DevTools Layers panel shows 30+ compositor layers active simultaneously
- `will-change` on elements that are not currently animating
- Performance tab showing GPU memory above 200 MB on mobile

**Phase:** Animation architecture phase. Establish the pattern once (apply/remove on animation lifecycle) and use it everywhere.

---

### Pitfall 5: Video Autoplay Fails on Mobile Due to Missing `playsinline`

**What goes wrong:** Video thumbnails in the Video genre filmstrip are set to play inline on hover. On iOS Safari, without `playsinline`, video elements trigger the native full-screen player — completely destroying the darkroom immersion with a white system UI overlay.

**Why it happens:** Desktop browsers play inline by default. iOS Safari does not. The attribute must be explicitly set. Developers test on desktop, ship, and discover the issue when a client opens the site on iPhone.

**Consequences:** The entire Video genre experience is broken on every iOS device. Given photographers' typical client base, this is a high-traffic user segment.

**Prevention:**
- All `<video>` elements must have `playsinline` attribute: `<video muted playsinline preload="none">`
- Also set `muted` — autoplay/hover-play without mute is blocked by all modern browsers
- Use `preload="none"` for filmstrip videos (off-screen); switch to `preload="metadata"` only when the video enters the viewport
- Implement hover-play via JavaScript: `video.play()` on `mouseenter`, `video.pause(); video.currentTime = 0` on `mouseleave`
- Test on actual iOS Safari before any milestone sign-off

**Detection warning signs:**
- Videos open in full-screen on iPhone instead of playing in the filmstrip
- Browser console showing `NotAllowedError: The request is not allowed by the user agent or the platform in the current context`
- Video tiles appear black on mobile (autoplay blocked silently)

**Phase:** Video playback implementation phase. The `playsinline`+`muted` pattern must be in the initial implementation, not a post-launch fix.

---

## Moderate Pitfalls

---

### Pitfall 6: The Darkroom Aesthetic Breaks on Utility Pages

**What goes wrong:** The landing page and filmstrip nail the darkroom atmosphere. The Contact and About pages are built later under time pressure and end up looking like a standard white-background web form with a dark header bolted on. The immersive world collapses the moment a potential client tries to book.

**Why it happens:** Atmospheric landing pages get the creative attention. Utility pages feel less exciting to design, so they receive minimal styling effort. The aesthetic system is never formally documented.

**Prevention:**
- Define the visual design system (colors, typography, component style — dim amber light, dark backgrounds, film grain texture) as a CSS custom properties file before building any page
- All pages share the same base atmospheric styles; utility pages add forms/content on top
- Create a "darkroom form element" style (inputs, textareas, buttons) that maintain the analog aesthetic
- Treat About and Contact as brand touchpoints, not afterthoughts — a client's decision to book often happens on the Contact page

**Detection warning signs:**
- White or light-colored backgrounds appearing on any page
- Default browser form element styling visible
- Brand review sessions where "it feels like a different site" is said

**Phase:** Design system must be established before Contact/About pages are built.

---

### Pitfall 7: `prefers-reduced-motion` Ignored, Accessibility Violation Risk

**What goes wrong:** The entire experience is built on motion. Users with vestibular disorders who have enabled `prefers-reduced-motion` in their OS receive the full animation treatment — the spinning clothesline entrance, the pull-in camera zoom, the sliding filmstrip. This can cause nausea or headaches, and is a WCAG 2.1 accessibility issue.

**Why it happens:** Motion is integral to this site's identity. It feels counterintuitive to disable it. Developers treat it as optional polish.

**Prevention:**
- Wrap all GSAP animations in a `prefers-reduced-motion` check:
  ```javascript
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) { /* play GSAP timeline */ } else { /* instant state change */ }
  ```
- For reduced-motion users: cross-fade transitions instead of zoom/slide, instant state changes instead of animated reveals
- The darkroom aesthetic is preserved; only movement is removed
- GSAP 3 has a `matchMedia()` integration specifically for this pattern

**Detection warning signs:**
- No `prefers-reduced-motion` handling anywhere in the codebase
- Full animation timelines play regardless of OS accessibility settings

**Phase:** Animation architecture phase — build the check in from the start, not after the site ships.

---

### Pitfall 8: Contact Form Has No Server-Side Processing on Static Host

**What goes wrong:** A beautifully styled contact form is built into the darkroom aesthetic. It has a `<form action="contact.php">`. The traditional cPanel host likely has PHP available, but there is no PHP file. Or worse, a PHP mailer is written without spam protection and immediately starts receiving 500 spam submissions per day.

**Why it happens:** Static site discipline is applied to HTML/CSS/JS but the form's backend need is overlooked until late.

**Prevention:**
- Use a third-party form backend: Formspree is the simplest integration (one `action` URL change, no PHP) with built-in spam filtering, reCAPTCHA support, and email delivery
- Alternatively, if the cPanel host has PHP: write a minimal PHP mailer with honeypot field spam protection and a reCAPTCHA token
- Never send form submissions directly from JavaScript to your personal email with an API key embedded in the HTML — the key will be scraped and abused
- Test form submission through to email delivery before any launch milestone

**Detection warning signs:**
- Form action pointing to a file that doesn't exist
- No spam protection mechanism visible in the form HTML
- API keys or email credentials visible in client-side JavaScript

**Phase:** Contact page implementation phase. Must be decided before styling the form — the backend determines the form structure.

---

### Pitfall 9: Browser Back Button Breaks the Animated World

**What goes wrong:** The experience uses animated transitions to move between the clothesline landing and the filmstrip gallery. These transitions are JavaScript-driven, not real browser navigations. When a user presses the hardware/browser back button from the filmstrip, they land on the clothesline but with no animation, mid-state, or on a blank page — depending on implementation.

**Why it happens:** Single-page-style animated transitions do not automatically integrate with the browser's history stack. This is only noticed during user testing.

**Prevention:**
- Decide early: multi-page (each genre is a separate HTML file with page transition animations via AJAX/fetch) or single-page (one HTML file, JavaScript-managed states)
- For multi-page: use the History API (`pushState`/`popstate`) to intercept navigation and run exit/enter animations before actual page change
- For single-page: push state on filmstrip open (`history.pushState({view: 'filmstrip', genre: 'fashion'}, '')`) and listen for `popstate` to trigger the reverse animation
- Both patterns have working GSAP examples available in GSAP Community forums
- Test the back button at every development milestone — it is easy to break without noticing

**Detection warning signs:**
- Clicking browser back after entering a filmstrip causes a blank white page flash
- Back button returns to clothesline without any transition (breaks immersion)
- URL does not change when moving between views (making the site impossible to share or bookmark at genre level)

**Phase:** Navigation architecture — must be decided in the foundation phase before any transition animations are built.

---

## Minor Pitfalls

---

### Pitfall 10: Image Theft Has No Deterrent

**What goes wrong:** High-quality, professionally styled photographs are served at full display resolution. Right-click save, browser DevTools network tab, or drag-and-drop gives anyone the full image. No attribution, no watermark, no friction.

**Why it happens:** Watermarks are seen as aesthetically damaging. "Who would steal portfolio photos?" is a rationalization. No additional effort feels urgent at build time.

**Prevention:**
- Serve images at a display-appropriate resolution (1920–2500px max) not full megapixel — enough quality for portfolio viewing, less useful for large prints
- Add subtle EXIF metadata: copyright notice, photographer name, website URL baked into every exported file
- Consider a transparent CSS overlay `pointer-events: none` on the image container to prevent drag (trivially bypassed via DevTools but removes the casual click-and-drag)
- No JavaScript `contextmenu` prevention — this is an accessibility violation and only annoys legitimate users while doing nothing against actual theft
- Note: No JS-only solution prevents determined image downloading. Accept this reality and focus on resolution limits + EXIF metadata.

**Phase:** Image export workflow — establish the export settings before any images are uploaded to the host.

---

### Pitfall 11: Dark Background Reveals Unoptimized PNG Transparencies

**What goes wrong:** Decorative elements (clothespin SVGs, film grain textures, grain overlays) are saved as PNGs with large file sizes. Against a dark background, any JPEG artifacts on transparent edges also become visible. A 2 MB PNG grain texture overlay loads before the background darkens, causing a white flash.

**Why it happens:** Designers export PNGs for transparency support without checking file sizes. The dark background makes any loading flash more jarring than it would be on a white background.

**Prevention:**
- Use SVG for all decorative line art (clothespins, film perforations, grain shapes) — infinitely scalable, tiny file size
- Film grain texture: use a CSS `filter` approach or a tiny, tiling SVG noise pattern rather than a large PNG overlay
- Any necessary PNG: compress with Squoosh or similar to under 50 KB
- Background color (`background-color: #0a0a0a` or similar dark) must be set in CSS immediately — never rely on an image to establish the darkroom background

**Phase:** Asset preparation phase, before any images are placed on pages.

---

### Pitfall 12: No Mobile Fallback for the Clothesline Hover/Hand Animation

**What goes wrong:** The clothesline landing has photographs that respond to hover with a subtle swing, and clicking triggers a hand animation that reaches up and removes the photo. Hover is a mouse-only event. Touch devices never see the hover state, and the interaction model may be confusing without the visual affordance that hover provides on desktop.

**Why it happens:** The site is described as desktop-optimized. Mobile testing is deferred. The hover interaction is designed only for mouse and the touch equivalent is assumed to "just work."

**Prevention:**
- Design touch equivalents for all hover interactions explicitly — do not assume they will translate
- On touch devices: tap triggers the hand animation and pull-in transition directly (skip the hover swing phase)
- Test on both iOS Safari and Android Chrome for touch events — `touchstart`/`touchend` behave differently than `mouseenter`/`mouseleave`
- Ensure touch targets on the clothesline photographs are at least 44x44px (Apple HIG minimum) — small clothespin-sized tap targets will cause mis-taps

**Phase:** Mobile responsiveness phase. Design the touch interaction model during the clothesline landing implementation.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Foundation / file structure | Serving full-res images from camera exports | Establish image export spec (2000px, 60% quality, WebP+JPEG) before any uploads |
| Darkroom landing page | GPU memory overload from too many animated elements simultaneously | Limit composite layers, apply/remove `will-change` dynamically |
| Clothesline interaction | Touch/hover mismatch on mobile | Design explicit touch fallback for hover states |
| Horizontal filmstrip gallery | iOS Safari ScrollTrigger pin jitter | Use `ScrollTrigger.normalizeScroll(true)`, test on real iPhone at prototype stage |
| Filmstrip navigation | User trapped with no escape route | Build visible, thematic back navigation before finalizing the filmstrip UI |
| Filmstrip navigation | Browser back button breaks animated state | Decide history strategy (pushState/popstate) in foundation phase, not as a retrofit |
| Video genre | `playsinline` missing, iOS full-screen override | All video elements require `muted playsinline preload="none"` from the first line |
| About / Contact pages | Darkroom aesthetic abandoned on utility pages | CSS design system (custom properties) established before any page is built |
| Contact form | No backend, or insecure PHP mailer | Use Formspree or equivalent; decide and implement before styling the form |
| All pages | `prefers-reduced-motion` ignored | Build the motion check pattern once, use it for every GSAP timeline |
| Asset creation | PNG file size, grain overlay flash | SVG for line art, CSS for grain, `background-color` set in CSS not images |
| Image display | Right-click save of full-res photos | Limit to 2000px display size, embed EXIF copyright metadata at export time |

---

## Sources

- GSAP ScrollTrigger iOS Issues: [gsap.com/community](https://gsap.com/community/forums/topic/40393-gsap-scrolltrigger-pin-position-is-jumping-on-ios-due-to-its-address-bar/) | [normalizeScroll docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll/)
- GSAP License (now fully free including commercial): [CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/) | [GSAP Standard License](https://gsap.com/community/standard-license/)
- Scrolljacking UX research: [NN/G Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- Horizontal scroll accessibility: [Cerovac A11y](https://cerovac.com/a11y/2024/02/consider-accessibility-when-using-horizontally-scrollable-regions-in-webpages-and-apps/) | [Adrian Roselli](https://adrianroselli.com/2025/08/horizontal-scrolling-containers-are-not-a-content-strategy.html)
- `will-change` GPU memory pitfalls: [Smashing Magazine GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) | [lexo.ch](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/)
- LCP lazy loading pitfall: [Core Web Vitals](https://www.corewebvitals.io/pagespeed/fix-largest-contentful-paint-image-was-lazily-loaded-lighthouse)
- WebP fallback / `<picture>` element: [Can I Use WebP](https://caniuse.com/webp) | [UltimateWB](https://www.ultimatewb.com/blog/5708/webp-vs-jpg-png-should-you-use-fallback-images-for-compatibility/)
- Video `playsinline` iOS requirement: [Mux Best Practices](https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025)
- `prefers-reduced-motion`: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | [Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)
- Contact form spam protection on static sites: [Formspree](https://formspree.io/) | [DEV Community](https://dev.to/fourtwentydev/solving-the-contact-form-security-dilemma-in-static-sites-and-spas-59n7)
- Image sizing for photography portfolios: [ForegroundWeb](https://www.foregroundweb.com/image-size/)
- Back button UX: [Baymard Institute](https://baymard.com/blog/back-button-expectations) | [Smashing Magazine](https://www.smashingmagazine.com/2022/08/back-button-ux-design/)
- History API page transitions: [Envato Tuts+](https://webdesign.tutsplus.com/lovely-smooth-page-transitions-with-the-history-web-api--cms-26405t)
