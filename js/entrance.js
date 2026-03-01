/**
 * entrance.js — Entrance scene controller
 *
 * CSS-built entrance — door with signs, red light leak.
 * - Door hover brightens the light leak
 * - "Step Inside" sign pulses via CSS animation
 * - Walk-in GSAP timeline (parallax surge + darkness fade)
 * - showDarkroom transition: hides entrance, reveals darkroom
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { initEntrance }
 */

import { store } from './store.js';
import { revealDarkroom } from './darkroom.js';

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
      revealDarkroom();
    }
  });
}

export function initEntrance() {
  const door = document.getElementById('door');
  if (!door) {
    console.warn('[entrance] #door element not found');
    return;
  }

  door.addEventListener('mouseenter', () => {
    door.style.cursor = 'pointer';
  });

  // Keyboard accessibility
  door.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') door.click();
  });

  // Walk-in timeline
  const darkness = document.querySelector('.scene__overlay--darkness');

  const walkIn = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      store.set({ transitionInProgress: false });
      showDarkroom();
    }
  });

  walkIn
    .to('[data-layer="building"]', { scale: 1.15,           duration: 1.5 }, 0)
    .to('[data-layer="door"]',     { scale: 1.8,            duration: 1.5 }, 0)
    .to('.entrance__step-inside',  { opacity: 0,            duration: 0.3 }, 0);

  if (darkness) {
    walkIn.to(darkness, { opacity: 1, duration: 0.7 }, 1.2);
    walkIn.to(darkness, { opacity: 1, duration: 0.4 }, 1.9);
  }

  door.addEventListener('click', () => {
    if (store.get().transitionInProgress) return;
    store.set({ transitionInProgress: true });
    walkIn.play();
  });

  console.log('[entrance] Entrance scene initialised');
}
