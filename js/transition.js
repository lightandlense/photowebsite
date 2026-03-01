/**
 * transition.js — Forward and reverse transition controller
 *
 * Forward: photo detaches from clothesline, scales to fill viewport,
 * darkroom dissolves, gallery appears.
 *
 * Reverse: separate timeline — gallery fades, photo shrinks back, darkroom
 * returns. No timeline.reverse() (avoids GSAP callback bugs).
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { startForward, startReverse }
 */

import { store } from './store.js';
import { navigateTo } from './router.js';
import { buildFilmstrip, teardownFilmstrip } from './gallery.js';

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
 * Starts the forward transition: photo detaches from clothesline,
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

  // Kill any previous timeline
  if (forwardTl) forwardTl.kill();

  forwardTl = gsap.timeline();

  // --- ACT 1: PHOTO DETACHES (~0–0.6s) ---

  forwardTl
    // Clothespin releases
    .to(pinEl, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    // Neighbors sway from the release
    .to(
      getNeighborPhotos(photoEl),
      {
        rotate: (i) => (i % 2 === 0 ? 3 : -3),
        duration: 0.4,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0.1
    )
    // Wire bounces
    .to(
      photoEl.closest('.clothesline')?.querySelector('.clothesline__wire'),
      { y: 2, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 },
      0.1
    );

  // --- ACT 2: PHOTO SCALES UP (~0.3–1.5s) ---

  // Allow photo to visually escape the darkroom's overflow:hidden
  darkroomEl.style.overflow = 'visible';
  // Elevate the photo above all darkroom layers
  photoEl.style.zIndex = '50';
  photoEl.closest('.clothesline').style.zIndex = '100';

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
      0.3
    )
    // Darkroom fades behind
    .to(darkroomEl, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.7);

  // --- ACT 3: GALLERY DISSOLVE IN (~1.3–1.6s) ---

  forwardTl
    .to(galleryEl, { opacity: 1, duration: 0.3, ease: 'none' }, 1.3)
    .set(darkroomEl, { display: 'none' }, 1.6)
    // Final: mark complete
    .call(() => {
      inGallery = true;
      photoEl.classList.add('clothesline__photo--empty');
      store.set({ transitionInProgress: false });
      buildFilmstrip(genre);
      navigateTo('/gallery/' + genre);
    }, null, 1.6);
}

/**
 * Reverse transition — separate timeline.
 * Gallery fades out, photo shrinks back to clothesline, darkroom returns.
 */
export function startReverse() {
  if (!inGallery || !activePhotoEl || store.get().transitionInProgress) return;

  store.set({ transitionInProgress: true });

  // Teardown filmstrip before reverse animation
  teardownFilmstrip();

  // Kill forward timeline entirely — we're building a new reverse
  if (forwardTl) {
    forwardTl.kill();
    forwardTl = null;
  }

  const darkroomEl = document.getElementById('darkroom');
  const galleryEl = document.getElementById('gallery');
  // Prep darkroom to fade back in
  gsap.set(darkroomEl, { display: 'block', opacity: 0 });

  // Store ref before async timeline completes
  const photoToRestore = activePhotoEl;

  // Grab child refs before timeline starts
  const pinToRestore = photoToRestore.querySelector('.clothesline__pin');
  const imgToRestore = photoToRestore.querySelector('.clothesline__image');

  // Prep: remove empty class now so we can animate children back in.
  // Set image and pin to opacity 0 / visibility visible so they can fade in.
  photoToRestore.classList.remove('clothesline__photo--empty');
  if (imgToRestore) {
    gsap.set(imgToRestore, { opacity: 0, visibility: 'visible' });
  }
  if (pinToRestore) {
    gsap.set(pinToRestore, { opacity: 0, visibility: 'visible' });
  }

  const reverseTl = gsap.timeline({
    onComplete: () => {
      // Final cleanup — clear only GSAP-touched props, preserve background gradient
      if (photoToRestore) {
        gsap.set(photoToRestore, { clearProps: 'scale,x,y,rotate,transformOrigin,transform' });
        photoToRestore.style.zIndex = '';
        const clothesline = photoToRestore.closest('.clothesline');
        if (clothesline) clothesline.style.zIndex = '';
        darkroomEl.style.overflow = '';
        gsap.set(photoToRestore, { opacity: 1 });

        if (pinToRestore) gsap.set(pinToRestore, { clearProps: 'y,transform' });

        if (imgToRestore) {
          gsap.set(imgToRestore, { clearProps: 'scale,boxShadow,transform,visibility' });
          gsap.set(imgToRestore, {
            filter: 'sepia(0.8) saturate(1.5) hue-rotate(-15deg) brightness(0.7)',
          });
        }
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

  // Fade gallery out, bring darkroom back, shrink photo, fade image+pin back in
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
    )
    // Fade the photo image and pin back in as it settles on the clothesline
    .to(imgToRestore, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5)
    .to(pinToRestore, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.6);
}
