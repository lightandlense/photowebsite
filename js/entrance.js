/**
 * entrance.js — Entrance scene controller
 *
 * Handles the full entrance exterior experience:
 * - "Step Inside" CTA fade-in after 1.5s delay
 * - Door hover amber glow (mouseenter/mouseleave)
 * - Keyboard Enter support on door (role="button")
 * - Walk-in GSAP timeline (parallax surge + darkness fade) — built once, played on click
 * - Double-click guard via store.transitionInProgress
 * - showDarkroom transition: hides entrance, reveals darkroom, calls revealDarkroom
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { initEntrance }
 */

import { store } from './store.js';
import { revealDarkroom } from './darkroom.js';

/**
 * Transitions from the entrance scene to the darkroom scene.
 * Called by the walk-in timeline's onComplete callback.
 */
function showDarkroom() {
  const entrance = document.getElementById('entrance');
  const darkroom = document.getElementById('darkroom');

  gsap.set(entrance, { display: 'none' });
  darkroom.style.display = 'block';
  gsap.set(darkroom, { opacity: 0 });

  gsap.to(darkroom, {
    opacity: 1,
    duration: 1.5,
    ease: 'power2.out',
    onComplete: () => {
      gsap.set('.scene__overlay--darkness', { opacity: 0 });
      revealDarkroom(); // stagger photos in + enable interactions
    }
  });
}

/**
 * Initialises the entrance scene:
 * - Starts CTA fade-in with 1.5s delay
 * - Wires door hover glow (mouseenter/mouseleave)
 * - Wires keyboard Enter on door
 * - Builds the walk-in GSAP timeline (paused)
 * - Wires door click handler with double-click guard
 */
export function initEntrance() {
  const door = document.getElementById('door');
  if (!door) {
    console.warn('[entrance] #door element not found');
    return;
  }

  // 1. "Step Inside" CTA fade-in (ENTR-03)
  // Fades in after 1.5s delay — Playfair Display font set via CSS
  gsap.to('.entrance__cta', {
    opacity: 1,
    duration: 1.5,
    delay: 1.5,
    ease: 'power2.out'
  });

  // 2. Door hover glow (ENTR-04)
  door.addEventListener('mouseenter', () => {
    gsap.to(door, { filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.7))', duration: 0.3 });
    door.style.cursor = 'pointer';
  });
  door.addEventListener('mouseleave', () => {
    gsap.to(door, { filter: 'none', duration: 0.4 });
  });

  // Keyboard accessibility: Enter triggers click
  door.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') door.click();
  });

  // 3. Walk-in GSAP timeline — built once, paused (ENTR-05, ENTR-06)
  // Total timeline: ~2.3s + 1.5s darkroom fade = ~3.8s (within 3-4s user decision window)
  const darkness = document.querySelector('.scene__overlay--darkness');

  const walkIn = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      store.set({ transitionInProgress: false });
      showDarkroom();
    }
  });

  // Phase A: Approach (0s–1.5s) — layers surge toward viewer (parallax forward-motion)
  walkIn
    .to('[data-layer="ground"]',     { y: '25%', scale: 1.2,  duration: 1.5 }, 0)
    .to('[data-layer="building"]',   { scale: 1.15,            duration: 1.5 }, 0)
    .to('[data-layer="door-frame"]', { scale: 1.3,             duration: 1.5 }, 0)
    .to('[data-layer="door"]',       { scale: 1.6,             duration: 1.5 }, 0)
    .to('.entrance__cta',            { opacity: 0,             duration: 0.4 }, 0)
    .to('.entrance__light-leak',     { opacity: 0,             duration: 0.5 }, 0);

  // Phase B: Darkness (1.2s–1.9s) — overlapping with end of approach
  if (darkness) {
    walkIn.to(darkness, { opacity: 1, duration: 0.7 }, 1.2);

    // Phase C: Hold (1.9s–2.3s) — brief darkness hold before darkroom reveal
    walkIn.to(darkness, { opacity: 1, duration: 0.4 }, 1.9);
  }

  // 4. Door click handler — guarded against double-triggering (ENTR-06)
  door.addEventListener('click', () => {
    if (store.get().transitionInProgress) return;
    store.set({ transitionInProgress: true });
    walkIn.play();
  });

  console.log('[entrance] Entrance scene initialised');
}
