/**
 * store.js — Minimal pub/sub state store
 *
 * Tracks shared application state (current route, genre, transitions).
 * GSAP animation handlers in later phases read and write this state.
 *
 * Exports: { store }
 */

const state = {
  currentRoute: '/',
  currentGenre: null,
  selectedPhotoIndex: null,
  transitionInProgress: false,
  genres: [],
};

const listeners = new Set();

export const store = {
  /**
   * Returns a shallow copy of current state.
   * @returns {Object}
   */
  get() {
    return { ...state };
  },

  /**
   * Merges updates into state and notifies all subscribers.
   * @param {Object} updates - Partial state to merge
   */
  set(updates) {
    Object.assign(state, updates);
    const snapshot = { ...state };
    listeners.forEach(fn => fn(snapshot));
  },

  /**
   * Subscribes to state changes.
   * @param {Function} fn - Called with shallow state copy on every change
   * @returns {Function} Unsubscribe function
   */
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
