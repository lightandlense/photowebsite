# Phase 5: Pages and Performance - Research

**Researched:** 2026-03-01
**Domain:** Static-site page authoring (About/Contact), Formspree AJAX integration, WebP image optimization, native lazy loading, SPA route handling
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **About page:** Bio text + portrait photo, simple dark page style (dark background, warm tones, film texture, consistent darkroom colors but no elaborate scene metaphor), contact CTA + social links at bottom, placeholder content for now
- **Contact form fields:** Name, Email, Project Type (dropdown for shoot type), Message
- **Contact form submit UX:** Inline success message — form fades out, confirmation appears in same spot
- **Contact form backend:** Formspree with placeholder endpoint; real form ID added later
- **Page transitions:** Navigate via bottom clothesline photos (About Me, Contact) — simpler fade/dissolve, not full hand-grab sequence
- **Back navigation:** Themed back button (same style as gallery back button) + browser back also works
- **Scope:** About and Contact only; spare clothesline decorative photos are NOT wired up this phase

### Claude's Discretion
- Contact page visual treatment (what it looks like styled)
- Image optimization strategy (lazy loading, compression, format choices)
- Reverse transition animation style for About/Contact
- Mobile responsive breakpoints and adaptations
- Loading performance priorities

### Deferred Ideas (OUT OF SCOPE)
- Shop page — user mentioned spare clothesline photos will become a shop page eventually
- Other future pages from spare clothesline photos — to be defined later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-01 | About/bio page with photographer's story, maintaining full darkroom aesthetic | Dark-page CSS pattern with tokens.css variables; `css/pages.css` new file; GSAP fade-in for text reveal |
| PAGE-02 | Contact form with name, email, project type, and message fields | Plain HTML `<form>` with styled inputs matching darkroom palette; `<select>` for project type |
| PAGE-03 | Contact form submits via Formspree (no server-side code needed) | Fetch API + `Accept: application/json` pattern; `https://formspree.io/f/{form_id}` endpoint |
| PAGE-04 | All pages maintain consistent darkroom aesthetic (dark backgrounds, warm tones, film textures) | Extend existing CSS tokens; reuse grain.css overlay; Playfair Display font already loaded |
| PERF-01 | Site loads in under 3 seconds on broadband | `<link rel="preload">` for hero images; defer gallery.json fetch; critical CSS already inline via linked stylesheets |
| PERF-02 | Images served as optimized WebP with JPEG fallback | `<picture>` element with `<source type="image/webp">` + `<img>` JPEG fallback; manual conversion required (no build step) |
| PERF-03 | Lazy loading for filmstrip images (only load current genre) | Already partially implemented via `loading="lazy"` in `gallery.js createFrame()`; confirm filmstrip is only built after transition completes |
| PERF-04 | Clothesline thumbnail images preloaded on initial page load | `<link rel="preload" as="image" fetchpriority="high">` tags in `<head>` for the 9 clothesline background-image URLs currently inlined in index.html |
</phase_requirements>

---

## Summary

Phase 5 completes the site by adding the About and Contact pages and ensuring performance meets the under-3-second target. The codebase already has a working SPA router (router.js), a darkroom aesthetic design system (tokens.css, base.css, grain.css), and a GSAP animation stack. The main work is: (1) authoring two new page sections that render inside the existing `#app` SPA shell, (2) wiring the bottom clothesline nav photos to fade-transition to those sections, (3) integrating Formspree via a fetch-based AJAX submission, and (4) a targeted performance pass focused on WebP conversion and preload hints.

The performance goals are achievable without a build step. The biggest risk is PERF-02 — WebP conversion requires manual preprocessing of all gallery images (65+ files across 5 genres). A pragmatic approach is: convert clothesline thumbnails (9 images) and the About portrait to WebP for the biggest LCP impact; mark remaining gallery images as a follow-up task. PERF-03 is already largely satisfied by the existing `loading="lazy"` in gallery.js and the deferred `buildFilmstrip()` call. PERF-04 is a small targeted fix: adding `<link rel="preload">` tags for clothesline background images.

For the SPA architecture, About and Contact render as new `<section>` elements inside `#app`, just like `#entrance`, `#darkroom`, and `#gallery`. The existing `route:change` event system in main.js handles navigation. The fade/dissolve transition is a simple GSAP opacity sequence, not the hand-grab sequence — it can reuse the same forward/reverse pattern from transition.js but with a much simpler implementation.

**Primary recommendation:** Implement About and Contact as SPA sections in index.html, wire the bottom clothesline photos with a dedicated `pages.js` module using simple GSAP crossfades, add a new `css/pages.css` that inherits the token system, and integrate Formspree via fetch with inline success/error state.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 (CDN) | Page fade transitions, form confirmation animation | Already loaded; CDN globals available |
| Formspree | Hosted SaaS | Contact form email delivery, no backend | Locked decision; eliminates all server-side code |
| Native `loading="lazy"` | Browser built-in | Deferred image loading for filmstrip | No library needed; 95%+ browser support as of 2025 |
| HTML `<picture>` element | HTML spec | WebP with JPEG fallback | Browser-native; works on cPanel static hosting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `<link rel="preload">` | HTML spec | Preload clothesline thumbnails + About portrait | Use for above-fold images that aren't in `<img>` tags |
| `fetchpriority="high"` | Browser hint | Elevate LCP image priority | Use alongside preload on the single most important above-fold image |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `loading="lazy"` | IntersectionObserver polyfill | No benefit — 95%+ browsers support native; polyfill adds JS weight |
| `<picture>` + manual WebP files | Server `.htaccess` mod_rewrite to serve WebP | .htaccess approach is cleaner but requires cPanel Apache config; `<picture>` is more explicit and portable |
| Formspree hosted | Custom PHP mailer | PHP requires server-side code — explicitly out of scope (INFR-01) |

**Installation:** No new npm packages. All tools are CDN globals or browser built-ins.

---

## Architecture Patterns

### Recommended Project Structure

```
js/
├── main.js          # Add: import pages.js, handle about/contact routes
├── pages.js         # NEW: About/Contact fade-in/out transitions and back logic
├── transition.js    # Existing — no changes needed
├── ...
css/
├── pages.css        # NEW: About and Contact page styles (inherits tokens)
├── ...
index.html           # Add: #about and #contact sections, preload hints
```

### Pattern 1: About/Contact as SPA Sections

**What:** About and Contact are `<section id="about">` and `<section id="contact">` elements added to `index.html`, initially `display:none`, shown/hidden by `pages.js` on route change. This mirrors how `#gallery` is handled.

**When to use:** Any time a new "page" needs to integrate with the existing router/history system without a full page load.

**Example:**
```html
<!-- In index.html, after #gallery section -->
<section id="about" class="scene" style="display: none;">
  <div class="page__inner">
    <button class="page__back" aria-label="Return to darkroom">&#8592; Back</button>
    <!-- content -->
  </div>
</section>

<section id="contact" class="scene" style="display: none;">
  <div class="page__inner">
    <button class="page__back" aria-label="Return to darkroom">&#8592; Back</button>
    <!-- form -->
  </div>
</section>
```

### Pattern 2: Fade Transition (pages.js)

**What:** When a bottom clothesline nav photo is clicked, the darkroom fades out (GSAP opacity 0), the target page section fades in. Back button/browser back reverses this. No hand animation, no photo scale-up.

**When to use:** Nav pages that don't require the gallery hand-grab spectacle.

**Example:**
```javascript
// Source: pattern derived from existing transition.js
// pages.js

import { navigateTo } from './router.js';
import { store } from './store.js';

let activePage = null; // 'about' | 'contact' | null

export function navigateToPage(pageId) {
  if (store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(pageId);

  // Pause CSS sway
  document.querySelectorAll('.clothesline__photo').forEach(el => {
    el.style.animationPlayState = 'paused';
  });

  const tl = gsap.timeline({
    onComplete: () => {
      activePage = pageId;
      store.set({ transitionInProgress: false });
      navigateTo('/' + pageId);
    }
  });

  tl.to(darkroomEl, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
    .set(pageEl, { display: 'flex' }, 0.5)
    .to(pageEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.5)
    .set(darkroomEl, { display: 'none' }, 1.0);
}

export function navigateFromPage() {
  if (!activePage || store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(activePage);

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(pageEl, { display: 'none', opacity: 0 });
      activePage = null;
      // Resume CSS sway
      document.querySelectorAll('.clothesline__photo').forEach(el => {
        el.style.animationPlayState = '';
      });
      store.set({ transitionInProgress: false });
    }
  });

  gsap.set(darkroomEl, { display: 'block', opacity: 0 });
  tl.to(pageEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
    .to(darkroomEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2);
}
```

### Pattern 3: Formspree AJAX Submission

**What:** `fetch()` POST to `https://formspree.io/f/{form_id}` with `Accept: application/json` header. `response.ok` signals success; `data.errors` array contains field-level messages on failure.

**When to use:** Any HTML form that needs to deliver to email without a backend.

**Example:**
```javascript
// Source: Formspree official docs — help.formspree.io/hc/en-us/articles/360013470814
async function submitForm(formEl) {
  const data = new FormData(formEl);
  const response = await fetch('https://formspree.io/f/PLACEHOLDER', {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  });
  const json = await response.json();
  if (response.ok) {
    // success
    return { ok: true };
  } else {
    // json.errors is an array of { message: string }
    const msgs = (json.errors || []).map(e => e.message).join(', ');
    return { ok: false, error: msgs || 'Submission failed.' };
  }
}
```

### Pattern 4: Inline Success/Error State

**What:** On success, GSAP fades the `<form>` to opacity 0, then fades in a sibling `.contact__success` element in the same container. On error, show inline validation text without hiding the form.

**Example:**
```javascript
// On success
const tl = gsap.timeline();
tl.to(formEl, { opacity: 0, duration: 0.4, ease: 'power2.in' })
  .set(formEl, { display: 'none' })
  .set(successEl, { display: 'block', opacity: 0 })
  .to(successEl, { opacity: 1, duration: 0.5, ease: 'power2.out' });

// On error
errorEl.textContent = error;
gsap.fromTo(errorEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
```

### Pattern 5: WebP Preload for Clothesline Thumbnails

**What:** The 9 clothesline photos are rendered as CSS `background-image` — they can't use native `loading="lazy"`, so the browser doesn't know about them until CSS is parsed. Adding `<link rel="preload">` in `<head>` tells the browser to fetch them early, satisfying PERF-04.

**Example:**
```html
<!-- In <head>, after CSS links -->
<!-- Preload clothesline thumbnails — these are above-fold background images -->
<link rel="preload" as="image" href="/images/fashion/high-fashion-gobo-Photography.jpg" fetchpriority="high">
<link rel="preload" as="image" href="/images/beauty/DSC5447-Edit-min.jpg">
<link rel="preload" as="image" href="/images/light-painting/Russell-Klimas-Lightpainting-min.jpg">
<!-- ... remaining 6 clothesline images -->
```

Note: if WebP versions are produced, add `type="image/webp"` and use the `.webp` href.

### Anti-Patterns to Avoid

- **Calling navigateTo() on page load for About/Contact routes:** The same rule applies here — check `window.location.pathname` on init and restore state, do NOT push history. (See STATE.md: "Never call navigateTo on page load — breaks WebKit back button")
- **Using history.back() from page back button:** Unlike the gallery (which relies on history.back() to trigger popstate + startReverse), the About/Contact pages should call `navigateFromPage()` directly, then `history.back()` if needed — or simply call `history.back()` and handle popstate in main.js just as gallery does. Keep it consistent with the gallery pattern.
- **Loading all gallery images on initial page load:** The filmstrip's `buildFilmstrip()` call is already deferred to after the forward transition completes. Don't add any preloading of filmstrip images in main.js.
- **Blocking GSAP global access:** All new JS files must access `gsap` as a CDN window global, not an ES import. Same rule as all other modules.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery from contact form | Custom PHP mailer, SMTP handler | Formspree | cPanel hosting has spam/security restrictions; Formspree handles CORS, ratelimiting, spam filtering, GDPR compliance |
| Image lazy loading | IntersectionObserver JS implementation | Native `loading="lazy"` on `<img>` | Browser-native since Chrome 77, Firefox 75, Safari 15.4 — zero JS overhead |
| WebP browser detection | JS `canPlayType` / Canvas test | `<picture>` element with `<source type="image/webp">` | Browser-native format negotiation; no JS required |
| Form validation | Custom regex validators | HTML5 `required`, `type="email"` attributes | Browser-native; works before JS loads; accessible |

**Key insight:** This phase's "don't hand-roll" pattern is to leverage browser-native capabilities first (lazy loading, form validation, picture element) and only use JS where animation/UX requires it.

---

## Common Pitfalls

### Pitfall 1: About/Contact Back Button Conflicts with Gallery Back Button

**What goes wrong:** The `route:change` listener in main.js currently calls `startReverse()` on any popstate that isn't a gallery route. If About/Contact pages are added, a browser back from About/Contact would also incorrectly trigger the gallery reverse transition.

**Why it happens:** The current main.js popstate handler is:
```javascript
if (e.detail.trigger === 'popstate' && !e.detail.path.startsWith('/gallery/')) {
  startReverse();
}
```
This condition catches `/about` and `/contact` popstate events too.

**How to avoid:** Update the popstate handler to be more specific:
```javascript
window.addEventListener('route:change', (e) => {
  if (e.detail.trigger !== 'popstate') return;
  const path = e.detail.path;
  if (path.startsWith('/gallery/')) return; // forward transition already handled
  // Gallery reverse — only if we were in gallery
  if (store.get().inGallery) { startReverse(); return; }
  // Page reverse — only if we were on a page
  if (activePage) { navigateFromPage(); return; }
});
```
Or export a `getActivePage()` from pages.js and check in main.js.

**Warning signs:** Back button from About/Contact causes the gallery reverse animation to run (photo flies back to clothesline but no gallery was shown).

### Pitfall 2: CSS background-image Not Preloaded

**What goes wrong:** Clothesline photos are rendered via `background-image` in inline `style` attributes. Preload hints in `<head>` must exactly match the path string — including root-relative vs relative. The existing HTML uses relative paths (e.g., `url('images/fashion/...')`) but the preload `href` should use root-relative (`/images/fashion/...`) to match the server path.

**Why it happens:** CSS background-image relative URLs resolve from the CSS file location; HTML `style=""` attribute resolves from the document. On cPanel, both typically resolve the same way, but using root-relative `/images/...` in preload hrefs is safer and consistent with the existing pattern in gallery.js (which already uses `/images/...`).

**How to avoid:** Use `/images/...` (root-relative) in all preload `href` attributes. Check that the 9 clothesline image filenames in the preload tags exactly match the filenames in `index.html`'s inline style attributes.

**Warning signs:** Preload tags appear in DevTools Network panel but images still load late (200 vs 200 from preload cache — check for mismatched URL strings).

### Pitfall 3: Formspree CORS and Referer Restriction

**What goes wrong:** Formspree free tier allows submissions only from the registered domain. During local development (`localhost:8080`), submissions to a production Formspree endpoint will fail with CORS errors or a 403.

**Why it happens:** Formspree's domain restriction blocks submissions from unregistered origins to prevent spam.

**How to avoid:** During development, either (a) use a test/sandbox Formspree form that allows localhost, or (b) use a placeholder endpoint and note in code comments that submission testing requires deployment. The CONTEXT.md already specifies a placeholder endpoint — document this expectation in the code.

**Warning signs:** `fetch()` to Formspree returns 403 or CORS error in DevTools console during local `python -m http.server` testing.

### Pitfall 4: Form State Not Reset on Back Navigation

**What goes wrong:** If a user submits the contact form (showing the success state), navigates away, then navigates back, the success message is still showing instead of the blank form.

**Why it happens:** The GSAP-hidden form and shown success element persist in the DOM; `display:none` changes survive navigation without explicit cleanup.

**How to avoid:** In the `navigateFromPage()` cleanup (or `navigateToPage()` setup), always reset the form to its initial state: show form, hide success message, clear field values. Add a `resetContactForm()` helper in pages.js.

**Warning signs:** Second visit to Contact page shows "Thank you" message with no form visible.

### Pitfall 5: `<select>` Styling Differences Across Browsers

**What goes wrong:** The Project Type `<select>` element is notoriously difficult to style consistently — especially on iOS Safari, which overrides many CSS properties with native UI.

**Why it happens:** iOS Safari uses native picker UI for `<select>` regardless of CSS styling, and ignores `appearance: none` for some properties.

**How to avoid:** Use `appearance: none; -webkit-appearance: none;` to remove native chrome, then style with a CSS background-image arrow indicator. Accept that iOS will display a native picker for options — this is expected behavior and maintains accessibility. Don't attempt a custom JS dropdown for this phase; it's Claude's discretion and the native select is sufficient.

**Warning signs:** Select element looks styled on desktop/Chrome but shows native iOS picker appearance on Safari mobile — this is acceptable.

### Pitfall 6: About Portrait Image Not Preloaded

**What goes wrong:** The About page portrait photo is a large-ish image that will be above-the-fold when the About page is shown. If it's a regular `<img>` without preload, it may flash in late.

**Why it happens:** About page is hidden initially (`display:none`), so the browser doesn't discover the `<img>` src until the page is shown — by which time the transition animation has already begun.

**How to avoid:** Add the About portrait to the preload hints in `<head>`. Since it's a real `<img>` (not background), `loading="eager"` combined with a preload link is the right approach.

---

## Code Examples

Verified patterns from official sources:

### Formspree AJAX with Fetch
```javascript
// Source: Formspree official docs (help.formspree.io/hc/en-us/articles/360013470814)
// Endpoint: https://formspree.io/f/{form_id}
// Must set Accept: application/json to get JSON response

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  try {
    const response = await fetch('https://formspree.io/f/PLACEHOLDER', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });
    const json = await response.json();

    if (response.ok) {
      // show success state
    } else {
      // json.errors = [{ message: '...' }, ...]
      const msg = (json.errors || []).map(e => e.message).join(' ');
      // show error msg
    }
  } catch (err) {
    // network failure
  }
});
```

### WebP with JPEG Fallback
```html
<!-- Source: MDN + web.dev (verified 2025) -->
<!-- <picture> browser picks first <source> it supports -->
<picture>
  <source srcset="/images/about/portrait.webp" type="image/webp">
  <img src="/images/about/portrait.jpg" alt="Photographer portrait" loading="eager">
</picture>
```

### Preloading Background Images (clothesline thumbnails)
```html
<!-- Source: web.dev/articles/preload-responsive-images -->
<!-- Placed in <head> after CSS links -->
<link rel="preload" as="image" href="/images/fashion/high-fashion-gobo-Photography.jpg" fetchpriority="high">
<link rel="preload" as="image" href="/images/beauty/DSC5447-Edit-min.jpg">
<link rel="preload" as="image" href="/images/light-painting/Russell-Klimas-Lightpainting-min.jpg">
<link rel="preload" as="image" href="/images/drone/Balance-Steamboat-Garden-of-the-Gods-drone-light-painting.jpg">
<link rel="preload" as="image" href="/images/gels/DSC7601-Edit.jpg">
<!-- Bottom clothesline nav photos -->
<link rel="preload" as="image" href="/images/about/about-thumbnail.jpg">
<link rel="preload" as="image" href="/images/contact/contact-thumbnail.jpg">
```

### Styled Dark Form Input Pattern
```css
/* Source: Project conventions from tokens.css */
.contact__input,
.contact__select,
.contact__textarea {
  width: 100%;
  background: rgba(36, 26, 14, 0.8);     /* --color-bg-surface with alpha */
  border: 1px solid rgba(200, 144, 42, 0.3); /* --color-accent faded */
  border-radius: 3px;
  color: var(--color-text);
  font-family: var(--font-serif);
  font-size: var(--font-size-base);
  padding: 0.75rem 1rem;
  transition: border-color var(--duration-fast) ease;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.contact__input:focus,
.contact__select:focus,
.contact__textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(200, 144, 42, 0.15);
}
```

### Lazy Loading (already in gallery.js — pattern to confirm)
```javascript
// Source: gallery.js createFrame() — already implemented
// loading="lazy" on dynamically created img elements
photoContent = `<img src="/${genreData.folder}/${filename}" alt="${label} photo ${index + 1}" loading="lazy">`;
// PERF-03 is already satisfied: filmstrip builds only on demand (after transition completes)
// Confirm: buildFilmstrip() is only called from transition.js onComplete callback — correct.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| IntersectionObserver polyfill for lazy loading | Native `loading="lazy"` attribute | Safari 15.4 (2021) | Zero JS required for image lazy loading |
| `<picture>` + JS WebP detection | `<picture>` element alone | Chrome 25, Safari 9.1+ | Browser-native format selection; no JS |
| Custom PHP contact form | Formspree / similar SaaS | ~2015 onwards | No server required for static sites |
| `fetchpriority` not available | `fetchpriority="high"` on preload links | Chrome 101+ (2022), Safari 17.2+ | Prioritize LCP images without JS |

**Deprecated/outdated:**
- `data-src` + JS intersection observer lazy loading: Replaced by `loading="lazy"` — do not implement for this project.
- Base64 blur placeholder (LQIP) technique: Adds complexity; not needed for this project's performance goals.

---

## Open Questions

1. **WebP conversion tooling**
   - What we know: Images are currently all JPEGs on disk; PERF-02 requires WebP with JPEG fallback; no build step exists
   - What's unclear: Whether the user will provide WebP versions or expects them to be generated; what tooling is available on the developer's machine (cwebp, ImageMagick, Squoosh, etc.)
   - Recommendation: The planner should add a Wave 0 task to convert the 5 clothesline thumbnails + About portrait to WebP using a one-time command (e.g., `cwebp` or Squoosh web app). Gallery images can be addressed in a follow-up wave since they're lazy-loaded. State the requirement explicitly in the plan so the user knows manual conversion is needed.

2. **About page portrait photo**
   - What we know: CONTEXT.md specifies "placeholder content for now — real bio text and portrait swapped in later"
   - What's unclear: Should the placeholder be a gradient (like the bottom clothesline photos currently) or an empty rectangle? Does the user want the portrait to be a real photo or an illustrated/stylized element?
   - Recommendation: Use a CSS placeholder with the darkroom color palette (similar to existing clothesline gradient placeholders) and add a HTML comment noting where the portrait `<img>` src should be updated.

3. **About/Contact clothesline thumbnail images**
   - What we know: The bottom clothesline About Me and Contact photos currently show CSS gradient backgrounds (no real photos)
   - What's unclear: Does the user want real photos for these clothesline thumbnails, or is the gradient look acceptable for Phase 5?
   - Recommendation: Keep the gradient backgrounds as-is for Phase 5 (consistent with "placeholder content" decision). The preload hints for these can be skipped since gradients have no external image to preload.

4. **Social media links on About page**
   - What we know: CONTEXT.md says "social media links at bottom"; current router.js already handles mailto: and external links correctly (passes them through without SPA interception)
   - What's unclear: Which platforms? What URLs?
   - Recommendation: Use placeholder `href="#"` links with icon labels (Instagram, etc.) and a TODO comment. The router already handles external links correctly.

---

## Sources

### Primary (HIGH confidence)
- `https://formspree.io/html` — Formspree endpoint format and basic integration
- `https://help.formspree.io/hc/en-us/articles/360013470814-Submit-forms-with-JavaScript-AJAX` — AJAX fetch pattern with JSON response and errors array (referenced via search result; official Formspree docs)
- `https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading` — Native `loading="lazy"` browser support
- `https://web.dev/articles/preload-responsive-images` — `<link rel="preload" as="image">` with `fetchpriority` pattern
- Existing codebase: `js/router.js`, `js/transition.js`, `js/gallery.js`, `js/darkroom.js`, `css/tokens.css` — verified architecture, design tokens, and animation patterns

### Secondary (MEDIUM confidence)
- WebSearch results on `<picture>` element WebP/JPEG fallback — consistent with MDN spec; multiple sources agree
- WebSearch results on `fetchpriority="high"` for LCP images — supported by addyosmani.com, web.dev, MDN

### Tertiary (LOW confidence)
- Specific Formspree `errors` array structure (`[{ message: string }]`) — cited from official help article via search summary; could not directly fetch the page due to 403. Pattern is widely documented in community examples and consistent across sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Formspree, native lazy loading, `<picture>` element are all well-documented browser/SaaS standards. GSAP pattern is verified against existing codebase.
- Architecture: HIGH — SPA section pattern is directly derived from existing `#gallery` implementation in the codebase. Fade transition pattern mirrors `transition.js` conventions.
- Pitfalls: HIGH — popstate handler conflict (Pitfall 1) is verified by reading main.js; CSS background-image preload (Pitfall 2) is verified from existing index.html; Formspree CORS issue (Pitfall 3) is documented behavior.
- Formspree error format: MEDIUM — official docs exist but couldn't be fetched directly.

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Formspree API is stable; web standards are stable)
