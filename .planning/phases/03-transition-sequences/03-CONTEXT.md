# Phase 3: Transition Sequences - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Clicking a clothesline photo plays a hand-grab animation that removes it from the line, then pulls the camera into the image, arriving in the filmstrip gallery. A reverse transition plays when navigating back. This phase delivers the forward and reverse animation sequences only — the filmstrip gallery itself is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Hand-grab animation
- Silhouette hand (dark shape, no detail — fits the dim darkroom)
- Hand reaches up from the bottom of the viewport, like the viewer reaching up to the clothesline
- After grabbing, the photo unclips and scales up to fill the screen — becoming the gateway into the gallery
- Medium pace (~1-1.5s) — deliberate but not slow, matches the walk-in timing

### Camera pull-in
- Camera zooms into the selected photo — it fills the screen and dissolves into the gallery view
- Darkroom stays visible in the background as the photo scales — feels like physically moving closer to the image
- The zoomed photo lands as the first visible photo in the filmstrip — continuous visual connection, no hard cut
- Full pull-in transition ~1.5-2s from grab to gallery visible — brisk but smooth

### Reverse transition
- Simplified reverse — gallery fades/zooms out back to darkroom, no hand replay on return
- Faster than forward (~50% quicker) — user wants to get back and pick another genre
- Photo is absent from its clothespin when returning — empty pin reinforces the physical metaphor
- Both themed back button and browser back button trigger the identical reverse animation

### Visual style
- Hand silhouette has a warm amber tint — dark but catching the safelight edge, matching the darkroom palette
- No extra effects during transition — clean zoom and cross-fade, no grain intensification or blur overlays
- Neighboring photos sway slightly when one is grabbed — as if the clothesline physically moved
- Clothesline bounces subtly when the clothespin releases — sells the physical interaction

### Claude's Discretion
- Exact GSAP easing curves for hand motion and zoom
- How the silhouette hand SVG is constructed
- Exact timing offsets between grab, scale, and dissolve phases
- How to manage the "absent photo" state on the clothesline (CSS class vs DOM removal)
- The themed back button design in the filmstrip view (Phase 3 just wires the transition trigger)

</decisions>

<specifics>
## Specific Ideas

- The hand reaching from below evokes the viewer's own hand — first-person perspective
- Photo scaling up to become the first filmstrip frame creates a continuous visual thread, no blank/black gap
- The clothesline sway on grab should match the existing ambient sway animation but be more pronounced — a physical disturbance, not just atmosphere
- Reverse is intentionally simplified and faster because users will go back and forth between genres — don't punish repeat navigation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-transition-sequences*
*Context gathered: 2026-02-28*
