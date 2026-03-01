/**
 * main.js — App entry point
 *
 * Registers GSAP plugins (loaded as CDN globals before this module runs),
 * initialises the SPA router, loads gallery.json into the state store,
 * initialises the entrance and darkroom scene controllers, and sets up
 * debug logging.
 */

import { initRouter } from './router.js';
import { store } from './store.js';
import { initEntrance } from './entrance.js';
import { initDarkroom } from './darkroom.js';
import { startReverse } from './transition.js';
import { initGallery } from './gallery.js';
import { initPages, getActivePage, navigateFromPage } from './pages.js';

// GSAP globals are available via CDN scripts loaded before this module.
// Do NOT import GSAP — access as window globals.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
console.log(`[main] GSAP ${gsap.version} registered with ScrollTrigger, ScrollSmoother`);

/**
 * Fetches gallery.json and stores genre data in the state store.
 * @returns {Promise<Object>} Parsed gallery data
 */
async function loadGallery() {
  try {
    const res = await fetch('./gallery.json');
    if (!res.ok) {
      throw new Error(`Failed to load gallery.json: HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data.genres)) {
      throw new Error('gallery.json: expected data.genres to be an array');
    }
    store.set({ genres: data.genres });
    console.log(`[gallery] Loaded ${data.genres.length} genres`);
    return data;
  } catch (err) {
    console.error('[gallery] Error loading gallery.json:', err);
    throw err;
  }
}

/**
 * Main init function — wires together all app subsystems.
 */
async function init() {
  initRouter();
  await loadGallery();

  // Debug subscriber — logs every state change to console
  store.subscribe(state => console.log('[store] state updated:', state));

  console.log('[main] Darkroom Portfolio initialized');

  // Set initial route from current URL (do NOT call navigateTo — breaks WebKit back button)
  store.set({ currentRoute: window.location.pathname });

  // Initialize scenes
  initEntrance();  // CTA fade-in, door hover, walk-in timeline
  initDarkroom();  // Wire darkroom hover glows and nav click handlers (photos reveal later)
  initGallery();   // Filmstrip gallery module (builds on demand via transition.js)
  initPages();     // Wire page back buttons and contact form handler

  // Gallery back button — triggers history.back() so popstate fires and startReverse() runs
  const galleryBack = document.getElementById('gallery-back');
  if (galleryBack) {
    galleryBack.addEventListener('click', () => {
      history.back();
    });
  }
}

// Listen for route changes
window.addEventListener('route:change', (e) => {
  console.log(`[main] Route changed: ${e.detail.path} (${e.detail.trigger})`);

  if (e.detail.trigger !== 'popstate') return;

  const path = e.detail.path;

  // If we're in gallery view and navigating away, reverse gallery transition
  if (store.get().currentGenre && !path.startsWith('/gallery/')) {
    startReverse();
    return;
  }

  // If we're on a page (About/Contact) and navigating away, reverse page transition
  if (getActivePage()) {
    navigateFromPage();
    return;
  }
});

// Boot when DOM is ready
document.addEventListener('DOMContentLoaded', init);
