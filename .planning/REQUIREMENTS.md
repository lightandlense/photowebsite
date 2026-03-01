# Requirements: Darkroom Portfolio

**Defined:** 2026-02-28
**Core Value:** The site must deliver an immersive darkroom experience that wows visitors and converts them into booking clients.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Entrance

- [x] **ENTR-01**: Visitor sees a photo-realistic old photo studio building exterior on page load
- [x] **ENTR-02**: Warm light leaks from under the studio door, inviting entry
- [x] **ENTR-03**: "Step Inside" text fades in near the door after a short delay
- [x] **ENTR-04**: Door handle/frame glows warmly on hover with cursor change
- [x] **ENTR-05**: Clicking the door triggers a parallax walk-in animation (layered ground/building shift)
- [x] **ENTR-06**: Door opens and fades into the darkroom interior
- [x] **ENTR-07**: On mobile, view is cropped to focus on the door area with clear tap target

### Darkroom

- [x] **DARK-01**: Darkroom scene has dim ambient lighting with warm tones
- [x] **DARK-02**: Film grain texture overlay on the darkroom scene
- [x] **DARK-03**: Five genre photographs displayed hanging from a clothesline with clothespins
- [x] **DARK-04**: Clothesline photos have subtle ambient sway animation
- [ ] **DARK-05**: Clicking a photo triggers a hand-grab animation that removes it from the clothespin
- [ ] **DARK-06**: Camera pulls into the selected photo (pull-in transition) leading to the filmstrip gallery
- [x] **DARK-07**: Silhouette figure visible in the darkroom background — click navigates to About page
- [x] **DARK-08**: Silhouette has a small always-visible "About" label near it
- [x] **DARK-09**: Business card on the darkroom table — click navigates to Contact page
- [x] **DARK-10**: Business card has a small always-visible "Contact" label near it

### Gallery

- [ ] **GLRY-01**: Horizontal filmstrip with sprocket holes that scrolls with user scroll input
- [ ] **GLRY-02**: Filmstrip contains 10-25 photos per genre
- [ ] **GLRY-03**: Photos enlarge in-place when user hovers or stops scrolling on them
- [ ] **GLRY-04**: Themed back button returns visitor from filmstrip to darkroom clothesline
- [ ] **GLRY-05**: Five genres: Fashion, Beauty, Light Painting, Drone, Video
- [ ] **GLRY-06**: Video genre thumbnails play inline when hovered/stopped on
- [ ] **GLRY-07**: Videos are self-hosted on the server

### Pages

- [ ] **PAGE-01**: About/bio page with photographer's story, maintaining full darkroom aesthetic
- [ ] **PAGE-02**: Contact form with name, email, project type, and message fields
- [ ] **PAGE-03**: Contact form submits via Formspree (no server-side code needed)
- [ ] **PAGE-04**: All pages maintain consistent darkroom aesthetic (dark backgrounds, warm tones, film textures)

### Performance

- [ ] **PERF-01**: Site loads in under 3 seconds on broadband
- [ ] **PERF-02**: Images served as optimized WebP with JPEG fallback
- [ ] **PERF-03**: Lazy loading for filmstrip images (only load current genre)
- [ ] **PERF-04**: Clothesline thumbnail images preloaded on initial page load

### Infrastructure

- [x] **INFR-01**: Static site (HTML/CSS/JS) — no server-side runtime required
- [x] **INFR-02**: Deployable on traditional cPanel/shared hosting
- [x] **INFR-03**: Browser history integration (back/forward buttons work with animated transitions)
- [x] **INFR-04**: Works on modern browsers (Chrome, Safari, Firefox, Edge)
- [x] **INFR-05**: Responsive — functions on mobile with adapted interactions (tap instead of hover)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish

- **PLSH-01**: Custom cursor that morphs on hover over interactive elements
- **PLSH-02**: Preloader / initial reveal animation (film leader countdown)
- **PLSH-03**: `prefers-reduced-motion` fallback for accessibility
- **PLSH-04**: Ambient sound toggle (darkroom audio atmosphere)

### SEO

- **SEO-01**: Open Graph meta tags on every page
- **SEO-02**: Image alt text on all photos
- **SEO-03**: sitemap.xml with image sitemap
- **SEO-04**: JSON-LD schema (LocalBusiness + ImageGallery)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Print shop / e-commerce | Requires backend infrastructure; scope creep for v1 |
| CMS / admin panel | Static site — manage photos by editing files directly |
| Blog | Adds maintenance burden with no clear conversion benefit |
| OAuth / user accounts | No login needed for a portfolio |
| Social media feed embeds | Hurts performance, goes stale, external dependencies |
| Lightbox / modal overlays | Breaks the filmstrip metaphor — enlarge in-place instead |
| Standard navigation bar | Destroys darkroom illusion — use minimal themed UI instead |
| Pricing page | Invites price shopping before establishing value |
| Infinite scroll / masonry grid | Expected and forgettable — filmstrip is the differentiator |
| Mobile app | Web only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | Phase 1 | Complete (01-01) |
| INFR-02 | Phase 1 | Complete (01-01) |
| INFR-03 | Phase 1 | Complete |
| INFR-04 | Phase 1 | Complete (01-01) |
| INFR-05 | Phase 1 | Complete (01-01) |
| ENTR-01 | Phase 2 | Complete |
| ENTR-02 | Phase 2 | Complete |
| ENTR-03 | Phase 2 | Complete |
| ENTR-04 | Phase 2 | Complete |
| ENTR-05 | Phase 2 | Complete |
| ENTR-06 | Phase 2 | Complete |
| ENTR-07 | Phase 2 | Complete |
| DARK-01 | Phase 2 | Complete |
| DARK-02 | Phase 2 | Complete |
| DARK-03 | Phase 2 | Complete |
| DARK-04 | Phase 2 | Complete |
| DARK-07 | Phase 2 | Complete |
| DARK-08 | Phase 2 | Complete |
| DARK-09 | Phase 2 | Complete |
| DARK-10 | Phase 2 | Complete |
| DARK-05 | Phase 3 | Pending |
| DARK-06 | Phase 3 | Pending |
| GLRY-01 | Phase 4 | Pending |
| GLRY-02 | Phase 4 | Pending |
| GLRY-03 | Phase 4 | Pending |
| GLRY-04 | Phase 4 | Pending |
| GLRY-05 | Phase 4 | Pending |
| GLRY-06 | Phase 4 | Pending |
| GLRY-07 | Phase 4 | Pending |
| PAGE-01 | Phase 5 | Pending |
| PAGE-02 | Phase 5 | Pending |
| PAGE-03 | Phase 5 | Pending |
| PAGE-04 | Phase 5 | Pending |
| PERF-01 | Phase 5 | Pending |
| PERF-02 | Phase 5 | Pending |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 37 total (note: original count of 32 was a miscounting — actual count from requirements list is 37)
- Mapped to phases: 37
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 — traceability populated after roadmap creation*
