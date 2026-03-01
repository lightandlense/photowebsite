# Roadmap: Darkroom Portfolio

## Overview

Five phases build the immersive darkroom experience bottom-up: the foundation establishes the file structure, design system, and navigation architecture that everything else depends on; the entrance and darkroom scene deliver the emotional hook — walking into the studio and seeing photographs on a clothesline; the transition sequences animate the hand-grab and camera pull-in that carry visitors from the clothesline into the gallery; the filmstrip gallery delivers the horizontal scroll experience per genre; and the final phase wires the supporting pages and validates performance with real content in place.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffolding, CSS design system, router, state store, and image pipeline spec
- [ ] **Phase 2: Entrance and Darkroom Scene** - Building exterior walk-in, darkroom clothesline with ambient lighting, and in-world navigation
- [ ] **Phase 3: Transition Sequences** - Hand-grab animation and camera pull-in from clothesline to filmstrip
- [ ] **Phase 4: Filmstrip Gallery** - Horizontal filmstrip with all five genres, photo enlarge-in-place, and inline video
- [ ] **Phase 5: Pages and Performance** - About, Contact (Formspree), and full performance/mobile validation pass

## Phase Details

### Phase 1: Foundation
**Goal**: The project infrastructure exists and every subsequent phase can build on it without revisiting architecture decisions
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05
**Success Criteria** (what must be TRUE):
  1. Opening `index.html` in Chrome, Safari, Firefox, and Edge shows a page without errors and the darkroom color palette is visibly applied via CSS custom properties
  2. Clicking a navigation link intercepts the browser default, fires a console event, and updates the browser URL bar without a full page reload
  3. The browser back button after a link click returns to the previous URL state without a blank page
  4. A test image processed through the export spec (WebP + JPEG fallback, under 200KB) is served correctly from the project directory on a local HTTP server
  5. `gallery.json` schema exists with at least one placeholder genre entry and loads without error in the console
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — HTML scaffold, CSS design system, gallery.json, .htaccess, image folders
- [ ] 01-02-PLAN.md — SPA router, state store, main.js entry point with GSAP init

### Phase 2: Entrance and Darkroom Scene
**Goal**: Visitors can walk into the darkroom and see five photographs hanging on a clothesline with clickable in-world navigation to About and Contact
**Depends on**: Phase 1
**Requirements**: ENTR-01, ENTR-02, ENTR-03, ENTR-04, ENTR-05, ENTR-06, ENTR-07, DARK-01, DARK-02, DARK-03, DARK-04, DARK-07, DARK-08, DARK-09, DARK-10
**Success Criteria** (what must be TRUE):
  1. On page load, a photo-realistic studio building exterior is visible; a warm light glows under the door; "Step Inside" text fades in after a short delay
  2. Hovering the door changes the cursor and the door frame glows warmly; clicking triggers the parallax walk-in animation — ground and building layers shift — then the door opens and the darkroom interior fades in
  3. On mobile, the view crops to the door with a clear tap target and the walk-in animation completes without layout breaking
  4. Inside the darkroom, five photographs hang from a clothesline with clothespins, each with a subtle ambient sway; the scene has dim ambient lighting, warm tones, and a film grain texture overlay
  5. Clicking the silhouette figure in the background navigates to the About page route; clicking the business card navigates to the Contact page route; both have always-visible labels
**Plans**: TBD

### Phase 3: Transition Sequences
**Goal**: Clicking a clothesline photo plays a hand-grab animation that removes it and then pulls the camera into the image, arriving in the filmstrip gallery
**Depends on**: Phase 2
**Requirements**: DARK-05, DARK-06
**Success Criteria** (what must be TRUE):
  1. Clicking a clothesline photo triggers a hand entering the frame, grasping the clothespin, and the photo releasing — the animation reads as physically removing a photograph
  2. Immediately after the hand-grab, the camera pulls into the selected photo in a continuous motion that dissolves into the filmstrip gallery view — no hard cut or blank frame visible
  3. The reverse pull-out animation plays when the user navigates back from the filmstrip to the darkroom — the clothesline reappears with the selected photo absent from its pin
**Plans**: TBD

### Phase 4: Filmstrip Gallery
**Goal**: Visitors can scroll through a horizontal filmstrip of photographs per genre, see photos enlarge in-place on hover, and watch video thumbnails play inline — for all five genres
**Depends on**: Phase 3
**Requirements**: GLRY-01, GLRY-02, GLRY-03, GLRY-04, GLRY-05, GLRY-06, GLRY-07
**Success Criteria** (what must be TRUE):
  1. Scrolling vertically on the filmstrip page moves the filmstrip horizontally; sprocket holes are visible above and below the photos; 10-25 photos per genre are present
  2. Pausing on a photo or hovering over it causes it to enlarge in-place within the filmstrip — no modal or overlay appears
  3. In the Video genre, hovering over a video thumbnail starts inline playback without entering full-screen; moving away stops playback; videos are self-hosted
  4. A themed back button is always visible in the filmstrip view; clicking it returns to the darkroom clothesline with the reverse transition; browser back button produces the same result
  5. The filmstrip functions on a real iOS device without visible pin jitter or scroll sticking; all five genres (Fashion, Beauty, Light Painting, Drone, Video) are selectable from the clothesline
**Plans**: TBD

### Phase 5: Pages and Performance
**Goal**: The About and Contact pages maintain the darkroom aesthetic, the contact form submits to email via Formspree, and the site loads in under 3 seconds with optimized images
**Depends on**: Phase 4
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. The About page renders with full darkroom aesthetic — dark background, warm tones, film texture — at all breakpoints including mobile
  2. The Contact form collects name, email, project type, and message; submitting the form delivers the data to email via Formspree without any server-side code; a success/error state is shown to the user
  3. WebPageTest or Lighthouse shows a load time under 3 seconds on a broadband connection; filmstrip images for genres not yet viewed are not in the network log at page load
  4. Clothesline thumbnail images are visible immediately on the darkroom scene without waiting for a lazy-load trigger
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In progress | - |
| 2. Entrance and Darkroom Scene | 0/? | Not started | - |
| 3. Transition Sequences | 0/? | Not started | - |
| 4. Filmstrip Gallery | 0/? | Not started | - |
| 5. Pages and Performance | 0/? | Not started | - |
