# Phase 1: Foundation - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffolding, CSS design system (custom properties, typography, grain overlay), vanilla JS router with History API, state store, image pipeline spec, and gallery data structure. This phase delivers the invisible infrastructure every visual phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Color Palette & Mood
- Warm amber/sepia dominant tone — like darkroom safelight, orange-amber glow on deep black
- Dark but visible backgrounds — dim but walls/surfaces are discernible, not pure black
- Warm off-white text — slightly cream/amber tinted, not pure white
- Subtle film grain overlay — felt more than seen, adds texture without distracting from photos

### Typography
- Vintage serif font throughout (Playfair Display / Bodoni type)
- Same serif for all text: headings, labels ("About", "Contact", genre names), "Step Inside" text, body
- "Step Inside" text rendered as elegant serif with a subtle glow effect
- Warm off-white text color to match the amber palette

### Photo Data Structure
- One folder per genre (fashion/, beauty/, light-painting/, drone/, video/)
- No titles or captions on photos — images speak for themselves
- No config file needed — folder structure IS the organization

### Page Transitions
- Cinematic & slow pacing — deliberate 1-2 second transitions throughout
- Door-to-darkroom: slow fade through black (door opens → screen goes dark for a beat → darkroom gradually appears)
- Camera pull-in to filmstrip: smooth glide, steady forward motion gradually filling the screen — not a dramatic snap zoom

### Claude's Discretion
- Photo ordering logic on the filmstrip (alphabetical, date-based, or numbered filenames)
- Clothesline hero shot selection (specific designated file vs first-in-folder)
- Clothesline sway intensity (calibrate what looks natural)
- Accent/interactive hint color (warm gold/amber recommended to match palette)
- Film grain intensity calibration
- CSS custom property naming conventions
- Router and state store architecture

</decisions>

<specifics>
## Specific Ideas

- The darkroom should feel like a real room you can make out, not a black void with floating elements
- Everything is warm — amber light, cream text, sepia tones — no cool blues or stark whites
- Transitions are cinematic and deliberate, never snappy — the site is an experience to savor
- The vintage serif font choice reinforces the analog/film photography heritage

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-28*
