/**
 * transition.js — Forward and reverse transition controller
 *
 * Forward: hand reaches up (open), grabs photo (swap to grab), photo scales
 * to fill viewport, hand fades, darkroom dissolves, gallery appears.
 *
 * Reverse: separate timeline — gallery fades, photo shrinks back, darkroom
 * returns. No hand replay. No timeline.reverse() (avoids GSAP callback bugs).
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { startForward, startReverse }
 */

import { store } from './store.js';
import { navigateTo } from './router.js';

/** Track the currently active forward timeline so we can kill it */
let forwardTl = null;

/** Reference to the photo element currently being transitioned */
let activePhotoEl = null;

/** Snapshot of the photo's original position — used by reverse */
let photoSnapshot = null;

/** Whether a forward transition has completed and we're in gallery view */
let inGallery = false;

/**
 * Returns sibling .clothesline__photo elements within the same .clothesline,
 * excluding the grabbed photo itself and decorative photos.
 */
function getNeighborPhotos(photoEl) {
  const parent = photoEl.closest('.clothesline');
  if (!parent) return [];
  return Array.from(parent.querySelectorAll('.clothesline__photo')).filter(
    (el) => el !== photoEl && !el.classList.contains('clothesline__photo--decorative')
  );
}

/**
 * Starts the forward transition: hand reaches up, grabs the photo,
 * photo scales to fill viewport, darkroom dissolves, gallery fades in.
 */
export function startForward(genre, photoEl) {
  // Guard: prevent double-trigger
  if (store.get().transitionInProgress || inGallery) return;

  store.set({ transitionInProgress: true, currentGenre: genre });
  inGallery = false;

  // Pause CSS sway on ALL clothesline photos before any GSAP transform
  document.querySelectorAll('.clothesline__photo').forEach((el) => {
    el.style.animationPlayState = 'paused';
  });

  // Snap grabbed photo to neutral rotation, THEN measure position
  gsap.set(photoEl, { rotate: 0 });

  // Measure photo position
  const rect = photoEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / rect.width, vh / rect.height);
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);

  // Save snapshot for reverse
  photoSnapshot = { scale, dx, dy };
  activePhotoEl = photoEl;

  // DOM references
  const handEl = document.getElementById('hand-container');
  const handOpen = document.getElementById('hand-open');
  const handGrab = document.getElementById('hand-grab');
  const pinEl = photoEl.querySelector('.clothesline__pin');
  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');
  const genreNameEl = document.getElementById('gallery-genre-name');

  // Prep gallery
  if (genreNameEl) {
    const display = genre.replace(/-/g, ' ');
    genreNameEl.textContent = display.charAt(0).toUpperCase() + display.slice(1);
  }
  galleryEl.classList.add('gallery--visible');
  gsap.set(galleryEl, { display: 'flex', opacity: 0 });
  gsap.set(darkroomEl, { display: 'block', opacity: 1 });

  // Hand positioning — the pinch point (thumb meets index finger) is at roughly
  // 35% from left and 15% from top of the hand image (from grasp reference).
  // We want the pinch to land on the top-left area of the photo.
  const handSize = 420;
  const pinchOffsetX = handSize * 0.35; // where the pinch is horizontally in the hand image
  const pinchOffsetY = handSize * 0.15; // where the pinch is vertically in the hand image
  // Target: pinch meets the top-left corner area of the photo
  const photoGrabX = rect.left + rect.width * 0.25; // grab point on the photo (left quarter)
  const photoGrabY = rect.top; // top edge of photo
  const handTargetX = photoGrabX - pinchOffsetX;
  const handTargetY = photoGrabY - pinchOffsetY;

  // Reset hand state — starts below viewport
  gsap.set(handEl, { display: 'block', left: handTargetX, top: vh + 50, opacity: 1 });
  gsap.set(handOpen, { opacity: 1 });
  gsap.set(handGrab, { opacity: 0 });

  // Kill any previous timeline
  if (forwardTl) forwardTl.kill();

  forwardTl = gsap.timeline();

  // --- ACT 1: HAND REACHES UP AND GRABS (~0–1.1s) ---

  forwardTl
    // Hand rises from below to the photo
    .to(handEl, { top: handTargetY, duration: 0.8, ease: 'power2.out' }, 0)
    // At 0.6s — swap open hand to grab hand
    .to(handOpen, { opacity: 0, duration: 0.15 }, 0.6)
    .to(handGrab, { opacity: 1, duration: 0.15 }, 0.6)
    // Clothespin releases
    .to(pinEl, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.65)
    // Neighbors sway
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
    // Wire bounces
    .to(
      photoEl.closest('.clothesline')?.querySelector('.clothesline__wire'),
      { y: 2, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 },
      0.7
    );

  // --- ACT 2: PHOTO SCALES UP, HAND FADES (~1.0–2.2s) ---

  forwardTl
    .to(
      photoEl,
      {
        scale: scale,
        x: dx,
        y: dy,
        transformOrigin: '50% 50%',
        duration: 1.2,
        ease: 'power2.inOut',
      },
      1.0
    )
    // Hand fades as photo takes over
    .to(handEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.3)
    .set(handEl, { display: 'none' }, 1.7)
    // Darkroom fades behind
    .to(darkroomEl, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 1.4);

  // --- ACT 3: GALLERY DISSOLVE IN (~2.0–2.3s) ---

  forwardTl
    .to(galleryEl, { opacity: 1, duration: 0.3, ease: 'none' }, 2.0)
    .set(darkroomEl, { display: 'none' }, 2.3)
    // Final: mark complete
    .call(() => {
      inGallery = true;
      photoEl.classList.add('clothesline__photo--empty');
      store.set({ transitionInProgress: false });
      navigateTo('/gallery/' + genre);
    }, null, 2.3);
}

/**
 * Reverse transition — separate timeline, no hand.
 * Gallery fades out, photo shrinks back to clothesline, darkroom returns.
 */
export function startReverse() {
  if (!inGallery || !activePhotoEl || store.get().transitionInProgress) return;

  store.set({ transitionInProgress: true });

  // Kill forward timeline entirely — we're building a new reverse
  if (forwardTl) {
    forwardTl.kill();
    forwardTl = null;
  }

  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');
  const handEl = document.getElementById('hand-container');

  // Ensure hand is hidden
  gsap.set(handEl, { display: 'none' });

  // Prep darkroom to fade back in
  gsap.set(darkroomEl, { display: 'block', opacity: 0 });

  // Store ref before async timeline completes
  const photoToRestore = activePhotoEl;

  const reverseTl = gsap.timeline({
    onComplete: () => {
      // Restore photo — remove empty class and clear ALL inline styles
      if (photoToRestore) {
        photoToRestore.classList.remove('clothesline__photo--empty');
        gsap.set(photoToRestore, { clearProps: 'all' });
        // Restore children too
        const pinEl = photoToRestore.querySelector('.clothesline__pin');
        if (pinEl) gsap.set(pinEl, { clearProps: 'all' });
        const imgEl = photoToRestore.querySelector('.clothesline__image');
        if (imgEl) gsap.set(imgEl, { clearProps: 'all' });
      }

      // Hide gallery
      galleryEl.classList.remove('gallery--visible');
      gsap.set(galleryEl, { display: 'none', opacity: 0 });

      // Resume CSS sway on ALL photos
      document.querySelectorAll('.clothesline__photo').forEach((el) => {
        el.style.animationPlayState = '';
      });

      // Reset state
      inGallery = false;
      store.set({ transitionInProgress: false, currentGenre: null });
      activePhotoEl = null;
      photoSnapshot = null;
    }
  });

  // Fade gallery out, bring darkroom back, shrink photo
  reverseTl
    .to(galleryEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to(darkroomEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    .to(
      activePhotoEl,
      {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.inOut',
      },
      0.2
    );
}
