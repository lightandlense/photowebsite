# Phase 5: Pages and Performance - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

About page, Contact page (Formspree integration), and performance/mobile optimization pass. All pages maintain the darkroom aesthetic. No new gallery features or navigation restructuring.

</domain>

<decisions>
## Implementation Decisions

### About page content & layout
- Bio text + portrait photo — classic photographer about page
- Simple dark page style — dark background, warm tones, film texture, consistent with darkroom colors but no elaborate scene metaphor
- Both contact CTA and social media links at bottom
- Placeholder content for now — real bio text and portrait swapped in later

### Contact form experience
- Fields: Name, Email, Project Type (dropdown for shoot type), Message
- After submit: inline success message — form fades out, confirmation appears in same spot
- Visual style: Claude's discretion — whatever fits the darkroom aesthetic best
- Formspree: placeholder endpoint for now, real form ID added later

### Page transitions & navigation
- Navigate via clothesline photos on bottom line (About Me, Contact) — simpler fade/dissolve transition, not full hand-grab sequence
- Back navigation: themed back button visible (same style as gallery) + browser back also works
- Reverse transition: Claude's discretion based on forward transition chosen

### Performance & mobile
- Desktop-first, mobile needs to be acceptable (not broken) but not the primary experience
- Image optimization: Claude's discretion (lazy loading, compression, format choices)
- Browser/device testing: Claude determines reasonable support based on project

### Claude's Discretion
- Contact page visual treatment
- Image optimization strategy
- Reverse transition animation style for About/Contact
- Mobile responsive breakpoints and adaptations
- Loading performance priorities

</decisions>

<specifics>
## Specific Ideas

- About and Contact are "utility" pages — they stay in the darkroom world but don't need the same elaborate interactions as genre galleries
- The bottom clothesline already has About Me and Contact photos in place — transition from those directly
- Decorative/spare photos on bottom clothesline are future pages (shop, etc.) — don't wire those up

</specifics>

<deferred>
## Deferred Ideas

- Shop page — user mentioned spare clothesline photos will become a shop page eventually
- Other future pages from spare clothesline photos — to be defined later

</deferred>

---

*Phase: 05-pages-and-performance*
*Context gathered: 2026-03-01*
