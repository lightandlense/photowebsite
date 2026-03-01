# Darkroom Portfolio

## What This Is

An immersive photography portfolio website that simulates walking into a real darkroom. Visitors first see a photo-realistic old photo studio building exterior, click the door to trigger a parallax walk-in, then enter a dimly lit darkroom where five photographs hang from a clothesline on clothespins. Clicking a photo triggers a hand animation that removes it, then the camera pulls into the image revealing a horizontal filmstrip gallery for that genre. A silhouette figure and business card in the darkroom serve as in-world navigation to About and Contact pages. The entire site maintains the analog film/darkroom aesthetic.

## Core Value

The site must deliver a "wow" experience — visitors feel like they've stepped into a darkroom and are interacting with physical photographs, not just browsing a website. The immersion is what makes this portfolio memorable and converts visitors into clients.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Photo-realistic building exterior with parallax walk-in entrance
- [ ] Darkroom landing page with dim ambient lighting aesthetic
- [ ] Five photographs displayed on a clothesline with clothespins
- [ ] Silhouette figure in darkroom background links to About page
- [ ] Business card on darkroom table links to Contact page
- [ ] Hand animation that reaches up and removes a photo from the clothespin on click
- [ ] Pull-in camera transition from clothesline photo into the filmstrip gallery
- [ ] Horizontal filmstrip gallery that scrolls with user scroll input
- [ ] Photos on filmstrip enlarge in-place on hover/stop
- [ ] Video thumbnails play inline on hover within the filmstrip
- [ ] Back button returns from filmstrip to the darkroom clothesline
- [ ] Five genres: Fashion, Beauty, Light Painting, Drone, Video
- [ ] 10-25 photos per genre
- [ ] About/bio page with full darkroom aesthetic
- [ ] Contact form with full darkroom aesthetic
- [ ] Static site (HTML/CSS/JS) — deployable on traditional hosting (cPanel/PHP host)
- [ ] Site converts visitors into booking inquiries

### Out of Scope

- Print shop / e-commerce — not needed for v1
- CMS / admin panel — manage photos by editing files directly
- Mobile app — web only
- Blog — portfolio focus only
- OAuth / user accounts — no login needed

## Context

- Russell is a photographer working across fashion, beauty, light painting, drone, and video
- The site needs to work as both a creative showcase ("coolest portfolio ever") and a professional tool (clients book shoots)
- Traditional hosting (GoDaddy/Bluehost type) — no Node.js server, static files only
- The analog film/darkroom metaphor is the creative foundation — every page stays in that world
- Video genre uses inline thumbnail playback on the filmstrip, not a separate video player

## Constraints

- **Hosting**: Static files only (HTML/CSS/JS) — no server-side runtime
- **Performance**: Heavy animations and high-res photos must still load fast
- **Browser**: Must work on modern browsers (Chrome, Safari, Firefox, Edge)
- **Responsive**: Needs to work on mobile even though the experience is desktop-optimized

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static site over framework | Traditional hosting, no build server needed | — Pending |
| Filmstrip as gallery metaphor | Ties to darkroom theme, enables horizontal scroll browsing | — Pending |
| Inline video playback on filmstrip | Keeps immersion, no modal/overlay breaking the experience | — Pending |
| Full darkroom aesthetic on all pages | Consistent world-building, not just a gimmick entrance | — Pending |
| Building exterior as entry point | Adds narrative arc — arriving at a place, not just loading a page | — Pending |
| In-world navigation (silhouette, business card) | No navbar — About/Contact discovered as objects in the darkroom | — Pending |

---
*Last updated: 2026-02-28 after requirements definition*
