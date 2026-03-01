/**
 * darkroom.js — Darkroom scene controller
 *
 * Handles all darkroom interior interactivity:
 * - Nav element hover glows (silhouette figure + business card)
 * - Nav element click navigation via router
 * - Clothesline photo hover scale lift (preview for Phase 3 hand-grab)
 * - Photo click placeholder log (hand-grab transition wired in Phase 3)
 * - Staggered photo + nav reveal animation on first entrance
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { initDarkroom, revealDarkroom }
 */

import { navigateTo } from './router.js';

/**
 * Wires hover glow and click navigation for a darkroom nav element.
 * Labels brighten from 0.5 to 1.0 opacity on hover.
 *
 * @param {string} elementId - ID of the nav element
 * @param {string} labelId - ID of the label span
 * @param {string} route - Route path to navigate to on click
 */
function wireNavElement(elementId, labelId, route) {
  const el = document.getElementById(elementId);
  const label = document.getElementById(labelId);
  if (!el || !label) return;

  el.addEventListener('mouseenter', () => {
    gsap.to(el, { filter: 'drop-shadow(0 0 15px rgba(255,140,0,0.6))', duration: 0.3 });
    gsap.to(label, { opacity: 1, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { filter: 'none', duration: 0.4 });
    gsap.to(label, { opacity: 0.5, duration: 0.4 });
  });
  el.addEventListener('click', () => navigateTo(route));

  // Keyboard accessibility
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateTo(route);
  });
}

/**
 * Initialises darkroom interactivity — called once on page load.
 * Sets up all event listeners so they are ready when the scene becomes visible.
 * Does NOT trigger any reveal animations (those are in revealDarkroom).
 */
export function initDarkroom() {
  // Nav element hover glows + click navigation (DARK-08, DARK-09, DARK-10)
  wireNavElement('silhouette-figure', 'label-about', '/about');
  wireNavElement('business-card', 'label-contact', '/contact');

  // Clothesline photo hover — subtle scale lift (DARK-07, preview for Phase 3)
  document.querySelectorAll('.clothesline__photo').forEach(photo => {
    photo.addEventListener('mouseenter', () => {
      gsap.to(photo.querySelector('.clothesline__image'), {
        scale: 1.05,
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        duration: 0.3
      });
    });
    photo.addEventListener('mouseleave', () => {
      gsap.to(photo.querySelector('.clothesline__image'), {
        scale: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        duration: 0.4
      });
    });
    // Photo click is a no-op for now — Phase 3 adds the hand-grab transition
    photo.addEventListener('click', () => {
      const genre = photo.dataset.genre;
      console.log(`[darkroom] Photo clicked: ${genre} (hand-grab transition in Phase 3)`);
    });
  });

  console.log('[darkroom] Darkroom scene initialised');
}

/**
 * Reveals the darkroom with staggered entrance animations (DARK-03).
 * Called by entrance.js showDarkroom() after the walk-in transition completes.
 * Plays once — not called on page load.
 */
export function revealDarkroom() {
  // Stagger-reveal the clothesline photos from top with opacity fade
  gsap.from('.clothesline__photo', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    stagger: {
      each: 0.15,
      from: 'start',
      ease: 'power2.out'
    },
    ease: 'power2.out'
  });

  // Fade in nav elements slightly after photos
  gsap.from('.nav-element', {
    opacity: 0,
    y: 10,
    duration: 0.6,
    delay: 1.0,
    stagger: 0.2,
    ease: 'power2.out'
  });

  console.log('[darkroom] Darkroom revealed — photo stagger + nav fade in');
}
