/**
 * transition.js — Forward and reverse transition controller
 *
 * Manages the cinematic bridge from the darkroom clothesline into the gallery:
 * - startForward(genre, photoEl): 3-act GSAP timeline (grab → pull-in → dissolve)
 * - startReverse(): Reversed forward timeline at 2x speed, hand hidden
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { startForward, startReverse }
 */

import { store } from './store.js';
import { navigateTo } from './router.js';

/** Stored forward timeline — rebuilt per click since photo position varies */
let forwardTl = null;

/** Reference to the photo element currently being transitioned */
let activePhotoEl = null;

/**
 * Returns sibling .clothesline__photo elements within the same .clothesline,
 * excluding the grabbed photo itself and decorative photos.
 *
 * @param {Element} photoEl - The grabbed photo element
 * @returns {Element[]} Array of neighbor photo elements
 */
function getNeighborPhotos(photoEl) {
  const parent = photoEl.closest('.clothesline');
  if (!parent) return [];
  return Array.from(parent.querySelectorAll('.clothesline__photo')).filter(
    (el) => el !== photoEl && !el.classList.contains('clothesline__photo--decorative')
  );
}

/**
 * Starts the forward transition: hand grabs the photo, photo scales to fill
 * the viewport, darkroom dissolves, gallery fades in.
 *
 * @param {string} genre - The genre identifier (e.g. 'fashion')
 * @param {Element} photoEl - The .clothesline__photo element that was clicked
 */
export function startForward(genre, photoEl) {
  // Guard: prevent double-trigger during an active transition
  if (store.get().transitionInProgress) return;

  store.set({ transitionInProgress: true, currentGenre: genre });

  // Pitfall 1: Pause CSS sway on ALL clothesline photos BEFORE any GSAP transform
  document.querySelectorAll('.clothesline__photo').forEach((el) => {
    el.style.animationPlayState = 'paused';
  });

  // Pitfall 2: Snap grabbed photo to neutral rotation, THEN measure position
  gsap.set(photoEl, { rotate: 0 });

  // Scale-to-fill calculation (Pattern 2 from RESEARCH.md)
  const rect = photoEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / rect.width, vh / rect.height);
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);

  // DOM references
  const handEl = document.getElementById('hand-silhouette');
  const pinEl = photoEl.querySelector('.clothesline__pin');
  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');
  const genreNameEl = document.getElementById('gallery-genre-name');

  // Store reference for reverse transition
  activePhotoEl = photoEl;

  // Prep gallery placeholder: set genre name, add visible class, prep for dissolve-in
  if (genreNameEl) {
    const display = genre.replace(/-/g, ' ');
    genreNameEl.textContent = display.charAt(0).toUpperCase() + display.slice(1);
  }
  galleryEl.classList.add('gallery--visible');
  gsap.set(galleryEl, { display: 'flex', opacity: 0 });

  // Ensure darkroom is fully visible at transition start
  gsap.set(darkroomEl, { display: 'block', opacity: 1 });

  // Calculate hand target Y: position hand near the clothespin
  // The pin is at the top of the photo; target brings the top of the hand SVG (~20px) to that level
  const targetY = rect.top - 160; // hand 180px tall, top 20px of SVG is fingers tip

  // Build and play the forward timeline (rebuilt per click — position varies)
  forwardTl = gsap.timeline({
    onComplete: () => {
      store.set({ transitionInProgress: false });
      // Mark photo as absent — CSS hides contents, layout is preserved
      photoEl.classList.add('clothesline__photo--empty');
      // Update URL bar after gallery is visible (no premature navigation)
      navigateTo('/gallery/' + genre);
    }
  });

  // --- ACT 1: GRAB (~0–1.3s) ---

  // Hand enters from bottom toward the clothespin
  forwardTl
    .set(handEl, { display: 'block', y: '100vh', opacity: 1 }, 0)
    .to(handEl, { y: targetY, duration: 0.8, ease: 'power2.out' }, 0)
    // Clothespin releases at ~0.6s
    .to(pinEl, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.6)
    // Neighbor photos sway — physical disturbance on the wire
    .to(
      getNeighborPhotos(photoEl),
      {
        rotate: (i) => (i % 2 === 0 ? 3 : -3),
        duration: 0.4,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0.7
    )
    // Clothesline wire bounces from the release
    .to(
      photoEl.closest('.clothesline') && photoEl.closest('.clothesline').querySelector('.clothesline__wire'),
      { y: 2, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 },
      0.7
    )
    // Hand retreats back below viewport
    .to(handEl, { y: '100vh', opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.9)
    .set(handEl, { display: 'none' }, 1.3);

  // --- ACT 2: PULL-IN (~0.9–2.1s) ---

  forwardTl
    .to(
      photoEl,
      {
        scale: scale,
        x: '+=' + dx,
        y: '+=' + dy,
        transformOrigin: '50% 50%',
        duration: 1.2,
        ease: 'power2.inOut',
      },
      0.9
    )
    // Darkroom fades out behind the growing photo
    .to(darkroomEl, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 1.4);

  // --- ACT 3: DISSOLVE (~1.8–2.1s) ---

  forwardTl
    .to(galleryEl, { opacity: 1, duration: 0.3, ease: 'none' }, 1.8)
    .set(darkroomEl, { display: 'none' }, 2.1);
}

/**
 * Starts the reverse transition: gallery dissolves, photo shrinks back to the
 * clothesline, darkroom fades in. Plays at 2x speed. No hand replay.
 *
 * Must be called after startForward has completed at least once.
 */
export function startReverse() {
  // Guard: require an existing timeline and no active transition
  if (!forwardTl || store.get().transitionInProgress) return;

  store.set({ transitionInProgress: true });

  const handEl = document.getElementById('hand-silhouette');
  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');

  // Pitfall 5: Hide hand BEFORE calling reverse() to prevent hand replay on return
  gsap.set(handEl, { display: 'none', y: '100vh' });

  // Ensure darkroom is ready to fade back in
  gsap.set(darkroomEl, { display: 'block' });

  // Set reverse-complete callback BEFORE reversing
  forwardTl.eventCallback('onReverseComplete', () => {
    // Restore the absent photo state
    if (activePhotoEl) {
      activePhotoEl.classList.remove('clothesline__photo--empty');
      // Clear all GSAP-set transforms so the photo snaps cleanly back
      gsap.set(activePhotoEl, { clearProps: 'scale,x,y,rotate,opacity,transform' });
      // Restore clothespin
      const pinEl = activePhotoEl.querySelector('.clothesline__pin');
      if (pinEl) gsap.set(pinEl, { clearProps: 'y,opacity' });
    }

    // Hide gallery and remove visible class
    if (galleryEl) {
      galleryEl.classList.remove('gallery--visible');
      gsap.set(galleryEl, { display: 'none', opacity: 0 });
    }

    // Resume CSS sway on all non-empty photos
    document.querySelectorAll('.clothesline__photo:not(.clothesline__photo--empty)').forEach((el) => {
      el.style.animationPlayState = 'running';
    });

    // Reset timeline speed
    if (forwardTl) forwardTl.timeScale(1);

    store.set({ transitionInProgress: false, currentGenre: null });
    activePhotoEl = null;
    // Null out timeline — fresh one will be built on next genre click
    forwardTl = null;
  });

  // Play forward timeline in reverse at 2x speed (~1s total vs ~2.1s forward)
  forwardTl.timeScale(2).reverse();
}
