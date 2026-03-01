# Darkroom Portfolio

## What This Is

An immersive photography portfolio website that simulates a darkroom experience. Visitors enter a dimly lit darkroom where five photographs hang from a clothesline on clothespins. Clicking a photo triggers a hand animation that removes it, then the camera pulls into the image revealing a horizontal filmstrip gallery for that genre. The entire site maintains the analog film/darkroom aesthetic across all pages.

## Core Value

The site must deliver a "wow" experience — visitors feel like they've stepped into a darkroom and are interacting with physical photographs, not just browsing a website. The immersion is what makes this portfolio memorable and converts visitors into clients.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Darkroom landing page with dim ambient lighting aesthetic
- [ ] Five photographs displayed on a clothesline with clothespins
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

---
*Last updated: 2026-02-28 after initialization*
