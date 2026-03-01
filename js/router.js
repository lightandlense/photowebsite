/**
 * router.js — History API SPA router
 *
 * Intercepts internal link clicks, updates browser history via pushState,
 * dispatches route:change custom events, and listens to popstate for
 * back/forward navigation.
 *
 * CRITICAL: pushState does NOT fire popstate (per HTML spec). The manual
 * CustomEvent dispatch after pushState is essential — not redundant.
 *
 * Do NOT call navigateTo or pushState on page load — breaks WebKit back button.
 *
 * Exports: { initRouter, navigateTo }
 */

import { store } from './store.js';

/**
 * Initialises the SPA router:
 * - Intercepts clicks on internal <a href> elements
 * - Listens for popstate (browser back/forward)
 */
export function initRouter() {
  // Intercept link clicks globally via event delegation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Skip external links and blank targets
    if (link.target === '_blank') return;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // Internal link — intercept and handle via router
    e.preventDefault();
    navigateTo(href);
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const path = window.location.pathname;
    store.set({ currentRoute: path });
    window.dispatchEvent(
      new CustomEvent('route:change', {
        detail: { path, state: e.state, trigger: 'popstate' },
      })
    );
    console.log(`[router] popstate → ${path}`);
  });

  console.log('[router] SPA router initialised');
}

/**
 * Programmatically navigates to a path.
 * Updates browser history, store, and dispatches route:change event.
 *
 * @param {string} path - The URL path to navigate to
 * @param {Object} [state={}] - Additional state to push alongside the path
 */
export function navigateTo(path, state = {}) {
  history.pushState({ path, ...state }, '', path);
  store.set({ currentRoute: path });
  window.dispatchEvent(
    new CustomEvent('route:change', {
      detail: { path, state, trigger: 'push' },
    })
  );
  console.log(`[router] navigateTo → ${path}`);
}
