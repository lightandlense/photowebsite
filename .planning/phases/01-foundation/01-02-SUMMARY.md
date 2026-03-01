---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [spa-router, pub-sub, history-api, gsap, es-modules, gallery-json]

# Dependency graph
requires:
  - phase: 01-01
    provides: "index.html shell with GSAP CDN globals, gallery.json genre manifest, CSS design system"
provides:
  - js/router.js: History API SPA router with link interception, pushState navigation, popstate handling, route:change custom event dispatch
  - js/store.js: Minimal pub/sub state store tracking currentRoute, currentGenre, selectedPhotoIndex, transitionInProgress, genres
  - js/main.js: App entry point — registers GSAP plugins, inits router, loads gallery.json genres into store
affects: [02-entrance, 03-transitions, 04-filmstrip, 05-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - History API pushState/popstate SPA routing with click interception via event delegation on document
    - pub/sub state store with Set-based listeners, shallow copy snapshot on every set()
    - Custom events (route:change) on window as cross-module communication channel
    - GSAP accessed as CDN globals — never imported as ES module

key-files:
  created:
    - js/store.js
    - js/router.js
    - js/main.js
  modified: []

key-decisions:
  - "pushState does NOT fire popstate per HTML spec — manual CustomEvent dispatch after pushState is essential, not redundant"
  - "No navigateTo/pushState call on page load — breaks WebKit back button (anti-pattern per research)"
  - "store.set() does shallow copy before notifying listeners — prevents subscriber mutations from affecting shared state"
  - "GSAP accessed as window global, not ES module import — CDN scripts load before module script, globals guaranteed available"

patterns-established:
  - "State store pattern: all shared app state flows through store.get/set/subscribe — GSAP animation phases read/write this"
  - "Router event pattern: route:change CustomEvent on window decouples router from consumers — any module can listen without import"
  - "Link interception pattern: e.target.closest('a[href]') with href prefix checks for skip conditions before preventDefault"

requirements-completed: [INFR-03, INFR-04, INFR-05]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 1 Plan 02: SPA Router, State Store, and main.js Entry Point Summary

**Vanilla JS SPA router with History API link interception and popstate handling, pub/sub state store, and main.js entry point that registers GSAP plugins and loads gallery.json genres into shared state on init**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T04:22:50Z
- **Completed:** 2026-03-01T04:24:01Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- SPA router with document-level click interception, internal link detection (skips external, blank-target, mailto, tel), pushState navigation, and popstate back/forward handling
- route:change CustomEvent dispatched on window for both push and popstate triggers — decoupled cross-module communication
- Minimal pub/sub state store tracking five state properties: currentRoute, currentGenre, selectedPhotoIndex, transitionInProgress, genres
- main.js registers GSAP 3.14.2 with ScrollTrigger and ScrollSmoother plugins on load, fetches gallery.json and stores 5 genres in state
- Temporary test navigation links (Fashion, Beauty, About, Contact) appended to #app for manual router verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create state store and router modules** - `b152e49` (feat)
2. **Task 2: Create main.js entry point with GSAP init and gallery loading** - `a912324` (feat)

## Files Created/Modified

- `js/store.js` - Minimal pub/sub state store with get/set/subscribe, Set-based listeners, shallow copy snapshots
- `js/router.js` - History API SPA router: click interception, pushState, popstate, route:change CustomEvent dispatch
- `js/main.js` - App entry point: GSAP plugin registration, router init, gallery.json fetch, debug subscriber, test nav

## Decisions Made

- pushState does NOT fire popstate per HTML spec — the custom event dispatch after pushState in navigateTo is intentional and required
- No pushState/navigateTo call on initial page load — this would corrupt the WebKit back button stack (documented in router.js comments)
- Shallow copy in store.set() ensures listeners receive an immutable snapshot, preventing accidental state mutation by subscribers
- GSAP accessed as CDN window globals (not imported) — CDN scripts in index.html load without defer before the type=module script

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three JS modules ready — Phase 2 (entrance animation) can import from router.js and store.js immediately
- store.set/subscribe API ready for GSAP transition handlers to read/write transitionInProgress and currentRoute
- route:change window event ready for Phase 2 animation sequencer to listen on
- gallery.json genres loaded into store on init — Phase 4 filmstrip can read store.get().genres without additional fetch
- No blockers for Phase 2

---
*Phase: 01-foundation*
*Completed: 2026-03-01*

## Self-Check: PASSED

All 4 files verified present on disk. Both task commits verified in git log (b152e49, a912324).
