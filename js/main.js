/**
 * main.js — App entry point
 *
 * Registers GSAP plugins (loaded as CDN globals before this module runs),
 * initialises the SPA router, loads gallery.json into the state store,
 * and sets up debug logging.
 *
 * Temporary test navigation links are appended to #app so the router
 * can be verified manually in the browser (removed in Phase 2).
 */

import { initRouter } from './router.js';
import { store } from './store.js';

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
 * Appends temporary test navigation links to #app.
 * These prove the router intercepts clicks and updates the URL bar.
 * Will be removed when Phase 2 builds real navigation.
 */
function appendTestNav() {
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <a href="/gallery/fashion">Fashion</a> |
    <a href="/gallery/beauty">Beauty</a> |
    <a href="/about">About</a> |
    <a href="/contact">Contact</a>
  `;
  nav.style.cssText = 'margin-top: 2rem; font-size: var(--font-size-lg);';
  document.getElementById('app').appendChild(nav);
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

  appendTestNav();
}

// Listen for route changes and log them
window.addEventListener('route:change', (e) => {
  console.log(`[main] Route changed: ${e.detail.path} (${e.detail.trigger})`);
});

// Boot when DOM is ready
document.addEventListener('DOMContentLoaded', init);
