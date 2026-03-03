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

// Preload the open door image so swap is instant
const openDoorImg = new Image();
openDoorImg.src = '/images/entrance/building door open.png';

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

  // Walk-in: swap to open door image, pause, then fade to darkness
  const darkness = document.querySelector('.scene__overlay--darkness');
  const building = document.querySelector('[data-layer="building"]');

  door.addEventListener('click', () => {
    if (store.get().transitionInProgress) return;
    store.set({ transitionInProgress: true });

    // Swap building image to open door
    building.style.backgroundImage = "url('/images/entrance/building door open.png')";

    const walkIn = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        store.set({ transitionInProgress: false });
        showDarkroom();
      }
    });

    walkIn
      .to('.entrance__step-inside', { opacity: 0, duration: 0.3 }, 0)
      .to(darkness, { opacity: 1, duration: 0.8 }, 1.0);
  });

  console.log('[entrance] Entrance scene initialised');
}
