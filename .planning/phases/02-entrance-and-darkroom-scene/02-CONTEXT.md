# Phase 2: Entrance and Darkroom Scene - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors experience an immersive entrance sequence: a photo-realistic studio exterior with a door, a parallax walk-in animation, and arrival in a darkroom where five genre photographs hang on a clothesline. The darkroom includes in-world navigation (silhouette figure for About, business card for Contact). This phase delivers the visual scene and interactions — actual photo content and gallery browsing are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Entrance Visual Style
- Photo-realistic layers composited as parallax elements — real photographic textures (brick, concrete, metal) not illustrated or abstract
- Industrial metal door as focal point — heavy steel/iron door with handle, warehouse/loft studio vibe, warm light leaking from underneath and around edges
- Full building facade visible — brick wall, window, street number, ground/sidewalk. Feels like standing outside a real place
- "Step Inside" text in Playfair Display (matching site serif typography), centered near the door, gentle fade-in after 1-2 second delay

### Walk-in Animation Feel
- Slow and cinematic pacing (3-4 seconds total) — deliberate, dramatic entrance matching the site's "cinematic & slow" design language
- Depth layers shift forward — ground plane moves down, building walls move apart/aside, door grows larger as visitor "approaches" and walks through. Physical forward-motion feeling
- Transition through darkness — scene goes dark as visitor passes through the doorway, then darkroom lighting fades up, like eyes adjusting to the dark
- Always show entrance on every visit — the entrance IS the experience, sets the mood each time. No skip for returning visitors

### Darkroom Atmosphere
- Minimal but evocative detail level — clothesline with photos is the focus, plus one or two accent details (like a safe light or developing tray) to suggest a real darkroom without cluttering the view
- Slightly staggered photo heights on clothesline — natural variation in how they hang, some a bit higher/lower, like they were clipped on casually. Organic feel
- Barely perceptible ambient sway — very subtle, slow movement noticed if you stare, mostly about making the scene feel alive rather than actively animated
- Warm amber safe light illumination — classic darkroom amber/red safe light glow from one side, warm, moody, authentic to film photography

### In-World Navigation
- Clearly visible elements — obvious enough that visitors know they can click them, labels always visible, positioned where eyes naturally go
- Both elements positioned below the clothesline — silhouette figure standing on the floor, business card on a table/tray. Natural eye flow downward from photos
- Warm glow + label brightens on hover — consistent with door hover behavior, subtle warm glow effect and label text becomes more prominent
- Small serif text labels (Playfair Display) positioned right below each element — like gallery labels, always visible at reduced opacity

### Claude's Discretion
- Exact parallax layer count and z-depth values
- Safe light color temperature (amber vs red spectrum)
- Clothespin visual style and attachment point
- Business card design details
- Silhouette figure pose and proportions
- Specific easing curves for the walk-in animation
- Accent detail selection (which darkroom props to include)

</decisions>

<specifics>
## Specific Ideas

- The entrance should feel like approaching a real photographer's studio — not a generic door, but a place with character
- The walk-through-darkness moment is key — that beat where the screen goes dark before the darkroom lights up creates anticipation
- The darkroom should feel like a working space, not a gallery — the photos are "drying" not "displayed"
- Film grain overlay from Phase 1 should be visible throughout the darkroom scene

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-entrance-and-darkroom-scene*
*Context gathered: 2026-02-28*
