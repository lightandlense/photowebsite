/**
 * darkroom.js — Darkroom scene controller
 *
 * Handles all darkroom interior interactivity:
 * - Clothesline photo hover: darkroom red → full color reveal
 * - Genre photo click placeholder log (hand-grab transition wired in Phase 3)
 * - Nav photo (About/Contact) click navigation via router
 * - Decorative photos are skipped (no interaction)
 * - Staggered photo reveal animation on first entrance
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { initDarkroom, revealDarkroom }
 */

import { startForward } from './transition.js';
import { navigateToPage } from './pages.js';

/**
 * Initialises darkroom interactivity — called once on page load.
 * Sets up all event listeners so they are ready when the scene becomes visible.
 */
export function initDarkroom() {
  // Wire interactive photos (genre + nav) — skip decorative
  document.querySelectorAll('.clothesline__photo').forEach(photo => {
    const genre = photo.dataset.genre;
    const nav = photo.dataset.nav;

    // Skip decorative photos — no interaction
    if (!genre && !nav) return;

    const img = photo.querySelector('.clothesline__image');

    // Hover — reveal full color from darkroom red tint
    photo.addEventListener('mouseenter', () => {
      gsap.to(img, {
        filter: 'sepia(0) saturate(1) hue-rotate(0deg) brightness(1)',
        scale: 1.05,
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        duration: 0.6,
        ease: 'power2.out'
      });
    });
    photo.addEventListener('mouseleave', () => {
      gsap.to(img, {
        filter: 'sepia(0.8) saturate(1.5) hue-rotate(-15deg) brightness(0.7)',
        scale: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        duration: 0.8,
        ease: 'power2.inOut'
      });
    });

    if (nav) {
      // Nav photo click — fade transition to page via pages.js
      photo.addEventListener('click', () => navigateToPage(nav));
      photo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigateToPage(nav);
      });
    } else {
      // Genre photo click — triggers hand-grab transition
      photo.addEventListener('click', () => {
        startForward(genre, photo);
      });
      // Keyboard accessibility: Enter key triggers the same transition
      photo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startForward(genre, photo);
      });
    }
  });

  console.log('[darkroom] Darkroom scene initialised');
}

/**
 * Reveals the darkroom with staggered entrance animations.
 * Called by entrance.js showDarkroom() after the walk-in transition completes.
 * Top row (5 photos) reveals first, then bottom row (4 photos).
 */
export function revealDarkroom() {
  // Top clothesline — 5 photos (start hidden via CSS opacity: 0)
  gsap.to('.clothesline--top .clothesline__photo', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: {
      each: 0.12,
      from: 'start',
      ease: 'power2.out'
    },
    ease: 'power2.out'
  });

  // Bottom clothesline — 4 photos, slightly after top
  gsap.to('.clothesline--bottom .clothesline__photo', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.65,
    stagger: {
      each: 0.12,
      from: 'start',
      ease: 'power2.out'
    },
    ease: 'power2.out'
  });

  console.log('[darkroom] Darkroom revealed — 5-top + 4-bottom photo stagger');
}
