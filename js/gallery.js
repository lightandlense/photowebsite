/**
 * gallery.js — Filmstrip gallery controller
 *
 * Builds/teardowns a horizontal 35mm filmstrip inside #gallery.
 * Wheel events drive smooth horizontal scrolling via GSAP lerp.
 * Hover enlarges frames in-place. Touch drag for mobile.
 *
 * GSAP is a CDN global — do NOT import it.
 *
 * Exports: { initGallery, buildFilmstrip, teardownFilmstrip }
 */

import { store } from './store.js';

// --- Genre color palettes (match clothesline gradients) ---
const GENRE_COLORS = {
  fashion: [
    'linear-gradient(135deg, #4a3520 0%, #C8902A 50%, #3a2510 100%)',
    'linear-gradient(135deg, #8B6914 0%, #c8902a 60%, #4a3520 100%)',
    'linear-gradient(160deg, #3a2510 0%, #8B6914 40%, #C8902A 100%)',
  ],
  beauty: [
    'linear-gradient(135deg, #3a1830 0%, #D4698E 50%, #2a1020 100%)',
    'linear-gradient(135deg, #6B2D5B 0%, #D4698E 60%, #3a1830 100%)',
    'linear-gradient(160deg, #2a1020 0%, #6B2D5B 40%, #D4698E 100%)',
  ],
  'light-painting': [
    'linear-gradient(135deg, #0a1a2e 0%, #4A90D9 50%, #0e1e30 100%)',
    'linear-gradient(135deg, #1A3A5C 0%, #4A90D9 60%, #0a1a2e 100%)',
    'linear-gradient(160deg, #0e1e30 0%, #1A3A5C 40%, #4A90D9 100%)',
  ],
  drone: [
    'linear-gradient(135deg, #4a6a30 0%, #8aaa50 50%, #1a2e10 100%)',
    'linear-gradient(135deg, #6B8F3C 0%, #8aaa50 60%, #2D4A1A 100%)',
    'linear-gradient(160deg, #1a2e10 0%, #6B8F3C 40%, #8aaa50 100%)',
  ],
  gels: [
    'linear-gradient(135deg, #2a0e0e 0%, #B83C3C 50%, #1a0808 100%)',
    'linear-gradient(135deg, #4A1A1A 0%, #B83C3C 60%, #2a0e0e 100%)',
    'linear-gradient(160deg, #1a0808 0%, #4A1A1A 40%, #B83C3C 100%)',
  ],
};

const FRAME_COUNT = 14;
const SPROCKET_COUNT = 6;
const VERTICAL_SPROCKET_COUNT = 8;

// --- Scroll state ---
let targetPos = 0;   // target scroll position (X for horizontal, Y for vertical)
let trackPos = 0;    // current interpolated position
let isVertical = false;
let tickerActive = false;
let filmstripEl = null;
let trackEl = null;
let entranceTl = null;

// --- Touch state ---
let touchStartPos = 0;
let touchStartTrackPos = 0;
let lastTouchPos = 0;
let lastTouchTime = 0;
let velocityPos = 0;

/**
 * Creates sprocket holes HTML string.
 * @param {boolean} vertical — if true, uses more holes for the taller vertical columns
 */
function createSprockets(vertical) {
  const count = vertical ? VERTICAL_SPROCKET_COUNT : SPROCKET_COUNT;
  const holes = Array.from({ length: count }, () =>
    '<span class="filmstrip__sprocket-hole"></span>'
  ).join('');
  return `<div class="filmstrip__sprockets">${holes}</div>`;
}

/**
 * Gets the genre data (folder, photos) from the store.
 */
function getGenreData(genre) {
  const state = store.get();
  if (!state.genres) return null;
  return state.genres.find((g) => g.id === genre) || null;
}

/**
 * Creates a single filmstrip frame element.
 * Uses real photos from gallery.json when available, gradient fallback otherwise.
 */
function createFrame(genre, index, genreData) {
  const frame = document.createElement('div');
  frame.className = 'filmstrip__frame';
  frame.dataset.index = index;

  const colors = GENRE_COLORS[genre] || GENRE_COLORS.fashion;
  const gradient = colors[index % colors.length];

  let photoContent;
  if (genreData && index < genreData.photos.length) {
    const filename = genreData.photos[index];
    const label = genre.replace(/-/g, ' ');
    photoContent = `<img src="/${genreData.folder}/${filename}" alt="${label} photo ${index + 1}" loading="lazy">`;
  } else {
    photoContent = `<div class="filmstrip__placeholder" style="background: ${gradient};"></div>`;
  }

  const frameNum = String(index + 1).padStart(2, '0') + 'A';

  const vertical = genre === 'drone';
  frame.innerHTML =
    createSprockets(vertical) +
    `<div class="filmstrip__photo-area">${photoContent}</div>` +
    `<div class="filmstrip__frame-number">${frameNum}</div>` +
    createSprockets(vertical);

  return frame;
}

/**
 * Computes the min/max scroll bounds for the track.
 */
function getScrollBounds() {
  if (!trackEl || !filmstripEl) return { min: 0, max: 0 };
  if (isVertical) {
    const trackHeight = trackEl.scrollHeight;
    const viewHeight = filmstripEl.clientHeight;
    return { min: -(trackHeight - viewHeight), max: 0 };
  }
  const trackWidth = trackEl.scrollWidth;
  const viewWidth = filmstripEl.clientWidth;
  return { min: -(trackWidth - viewWidth), max: 0 };
}

/**
 * Clamps targetPos within scroll bounds.
 */
function clampTarget() {
  const { min, max } = getScrollBounds();
  targetPos = Math.max(min, Math.min(max, targetPos));
}

/**
 * GSAP ticker lerp — smoothly animates track position.
 */
function onTick() {
  if (!trackEl) return;
  const diff = targetPos - trackPos;
  if (Math.abs(diff) < 0.5) {
    trackPos = targetPos;
  } else {
    trackPos += diff * 0.1;
  }
  if (isVertical) {
    gsap.set(trackEl, { y: trackPos });
  } else {
    gsap.set(trackEl, { x: trackPos });
  }
}

/**
 * Wheel handler — maps deltaY to scroll axis.
 */
function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY || e.deltaX;
  targetPos -= delta * 1.5;
  clampTarget();
}

/**
 * Touch handlers for mobile drag with inertia.
 */
function onTouchStart(e) {
  const touch = e.touches[0];
  touchStartPos = isVertical ? touch.clientY : touch.clientX;
  touchStartTrackPos = targetPos;
  lastTouchPos = touchStartPos;
  lastTouchTime = Date.now();
  velocityPos = 0;
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const pos = isVertical ? touch.clientY : touch.clientX;
  const now = Date.now();
  const dt = now - lastTouchTime;
  if (dt > 0) {
    velocityPos = (pos - lastTouchPos) / dt;
  }
  lastTouchPos = pos;
  lastTouchTime = now;
  targetPos = touchStartTrackPos + (pos - touchStartPos);
  clampTarget();
}

function onTouchEnd() {
  targetPos += velocityPos * 300;
  clampTarget();
}

// --- Lightbox state ---
let lightboxEl = null;
let lightboxImgEl = null;
let lightboxOpen = false;
let currentLightboxIndex = -1;
let currentGenrePhotos = []; // array of { src, alt } for nav

/**
 * Opens the lightbox with a full-size image.
 */
function openLightbox(src, alt, index) {
  if (!lightboxEl) createLightboxDOM();

  currentLightboxIndex = index;
  lightboxImgEl.src = src;
  lightboxImgEl.alt = alt || '';
  lightboxOpen = true;

  // Update nav button visibility
  updateLightboxNav();

  gsap.set(lightboxEl, { display: 'flex', opacity: 0 });
  gsap.to(lightboxEl, { opacity: 1, duration: 0.25, ease: 'power2.out' });
  gsap.fromTo(lightboxImgEl, { scale: 0.92 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
}

/**
 * Closes the lightbox.
 */
function closeLightbox() {
  if (!lightboxOpen) return;
  lightboxOpen = false;
  gsap.to(lightboxEl, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => gsap.set(lightboxEl, { display: 'none' }),
  });
}

/**
 * Navigate to prev/next image in lightbox.
 */
function lightboxNav(direction) {
  const next = currentLightboxIndex + direction;
  if (next < 0 || next >= currentGenrePhotos.length) return;
  currentLightboxIndex = next;
  const photo = currentGenrePhotos[next];

  // Crossfade
  gsap.to(lightboxImgEl, {
    opacity: 0,
    duration: 0.12,
    ease: 'power2.in',
    onComplete: () => {
      lightboxImgEl.src = photo.src;
      lightboxImgEl.alt = photo.alt;
      updateLightboxNav();
      gsap.to(lightboxImgEl, { opacity: 1, duration: 0.15, ease: 'power2.out' });
    },
  });
}

/**
 * Show/hide prev/next buttons based on position.
 */
function updateLightboxNav() {
  if (!lightboxEl) return;
  const prev = lightboxEl.querySelector('.lightbox__prev');
  const next = lightboxEl.querySelector('.lightbox__next');
  if (prev) prev.style.display = currentLightboxIndex > 0 ? '' : 'none';
  if (next) next.style.display = currentLightboxIndex < currentGenrePhotos.length - 1 ? '' : 'none';
}

/**
 * Creates the lightbox DOM (once, reused across opens).
 */
function createLightboxDOM() {
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.style.display = 'none';

  lightboxEl.innerHTML = `
    <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
    <button class="lightbox__prev" aria-label="Previous image">&#8249;</button>
    <img class="lightbox__img" src="" alt="">
    <button class="lightbox__next" aria-label="Next image">&#8250;</button>
  `;

  lightboxImgEl = lightboxEl.querySelector('.lightbox__img');

  // Close on backdrop click
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });

  // Close button
  lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);

  // Nav buttons
  lightboxEl.querySelector('.lightbox__prev').addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxNav(-1);
  });
  lightboxEl.querySelector('.lightbox__next').addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxNav(1);
  });

  // Keyboard: Escape, left/right arrows
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  document.body.appendChild(lightboxEl);
}

/**
 * Delegated click handler on the track — finds the closest frame and opens lightbox.
 */
function onTrackClick(e) {
  const frame = e.target.closest('.filmstrip__frame');
  if (!frame) return;

  const img = frame.querySelector('.filmstrip__photo-area img');
  if (!img) return; // skip placeholder-only frames

  const index = parseInt(frame.dataset.index, 10);
  openLightbox(img.src, img.alt, index);
}

/**
 * Hover handlers — GSAP scale + desaturate.
 */
function onFrameEnter(e) {
  const frame = e.currentTarget;
  const img = frame.querySelector('img');
  const placeholder = frame.querySelector('.filmstrip__placeholder');
  const target = img || placeholder;

  gsap.to(frame, {
    scale: 1.08,
    zIndex: 10,
    duration: 0.3,
    ease: 'power2.out',
    boxShadow: '0 0 20px rgba(200, 144, 42, 0.3)',
  });

  if (target) {
    gsap.to(target, {
      filter: 'sepia(0) saturate(1.4) brightness(1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  }
}

function onFrameLeave(e) {
  const frame = e.currentTarget;
  const img = frame.querySelector('img');
  const placeholder = frame.querySelector('.filmstrip__placeholder');
  const target = img || placeholder;

  gsap.to(frame, {
    scale: 1,
    zIndex: 1,
    duration: 0.3,
    ease: 'power2.in',
    boxShadow: 'none',
  });

  if (target) {
    gsap.to(target, {
      filter: 'sepia(0.3) saturate(1.2) brightness(0.85)',
      duration: 0.3,
      ease: 'power2.in',
    });
  }
}

/**
 * Builds the filmstrip for a given genre inside #gallery.
 */
export function buildFilmstrip(genre) {
  const galleryEl = document.getElementById('gallery');
  if (!galleryEl) return;

  // Clean up any existing filmstrip
  teardownFilmstrip();

  // Determine if vertical layout (drone = landscape photos)
  isVertical = genre === 'drone';

  // Add filmstrip class to gallery for layout override
  galleryEl.classList.add('gallery--filmstrip');

  // Look up genre data for real photos
  const genreData = getGenreData(genre);
  const frameCount = genreData ? Math.max(genreData.photos.length, FRAME_COUNT) : FRAME_COUNT;

  // Create filmstrip container
  filmstripEl = document.createElement('div');
  filmstripEl.className = 'filmstrip' + (isVertical ? ' filmstrip--vertical' : '');

  trackEl = document.createElement('div');
  trackEl.className = 'filmstrip__track';

  // Build frames — one per photo, minimum FRAME_COUNT
  for (let i = 0; i < frameCount; i++) {
    const frame = createFrame(genre, i, genreData);
    trackEl.appendChild(frame);
  }

  filmstripEl.appendChild(trackEl);
  // Insert filmstrip before back button
  const backBtn = galleryEl.querySelector('#gallery-back');
  galleryEl.insertBefore(filmstripEl, backBtn);

  // Reset scroll position
  targetPos = 0;
  trackPos = 0;
  gsap.set(trackEl, { x: 0, y: 0 });

  // Bind events
  filmstripEl.addEventListener('wheel', onWheel, { passive: false });
  filmstripEl.addEventListener('touchstart', onTouchStart, { passive: true });
  filmstripEl.addEventListener('touchmove', onTouchMove, { passive: false });
  filmstripEl.addEventListener('touchend', onTouchEnd, { passive: true });

  // Build lightbox photo list for this genre
  currentGenrePhotos = [];
  if (genreData) {
    const label = genre.replace(/-/g, ' ');
    genreData.photos.forEach((filename, i) => {
      currentGenrePhotos.push({
        src: `/${genreData.folder}/${filename}`,
        alt: `${label} photo ${i + 1}`,
      });
    });
  }

  // Hover on frames
  trackEl.querySelectorAll('.filmstrip__frame').forEach((frame) => {
    frame.addEventListener('mouseenter', onFrameEnter);
    frame.addEventListener('mouseleave', onFrameLeave);
  });

  // Click via event delegation on track (more reliable through transforms)
  trackEl.addEventListener('click', onTrackClick);

  // Start GSAP ticker for smooth scroll
  if (!tickerActive) {
    gsap.ticker.add(onTick);
    tickerActive = true;
  }

  // Entrance animation — frames stagger in, ripple from center
  const frames = trackEl.querySelectorAll('.filmstrip__frame');
  const center = Math.floor(frames.length / 2);

  // Sort by distance from center
  const sorted = Array.from(frames).sort((a, b) => {
    const ai = parseInt(a.dataset.index);
    const bi = parseInt(b.dataset.index);
    return Math.abs(ai - center) - Math.abs(bi - center);
  });

  // Vertical: slide in from right; Horizontal: slide in from below
  const fromProps = isVertical ? { x: 40, opacity: 0 } : { y: 40, opacity: 0 };
  const toProps = isVertical
    ? { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    : { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' };

  gsap.set(frames, fromProps);

  entranceTl = gsap.timeline();
  entranceTl.to(sorted, toProps);

  console.log(`[gallery] Built filmstrip for "${genre}" with ${frameCount} frames`);
}

/**
 * Tears down the filmstrip, removing DOM and event listeners.
 */
export function teardownFilmstrip() {
  // Close lightbox if open
  closeLightbox();

  // Kill entrance animation
  if (entranceTl) {
    entranceTl.kill();
    entranceTl = null;
  }

  // Remove GSAP ticker
  if (tickerActive) {
    gsap.ticker.remove(onTick);
    tickerActive = false;
  }

  // Remove events and DOM
  if (filmstripEl) {
    filmstripEl.removeEventListener('wheel', onWheel);
    filmstripEl.removeEventListener('touchstart', onTouchStart);
    filmstripEl.removeEventListener('touchmove', onTouchMove);
    filmstripEl.removeEventListener('touchend', onTouchEnd);

    if (trackEl) {
      trackEl.removeEventListener('click', onTrackClick);
      trackEl.querySelectorAll('.filmstrip__frame').forEach((frame) => {
        frame.removeEventListener('mouseenter', onFrameEnter);
        frame.removeEventListener('mouseleave', onFrameLeave);
      });
    }

    filmstripEl.remove();
    filmstripEl = null;
    trackEl = null;
  }

  // Remove filmstrip class
  const galleryEl = document.getElementById('gallery');
  if (galleryEl) {
    galleryEl.classList.remove('gallery--filmstrip');
  }

  targetPos = 0;
  trackPos = 0;
  isVertical = false;

  console.log('[gallery] Filmstrip torn down');
}

/**
 * Init — no-op for now, but available for future setup.
 */
export function initGallery() {
  console.log('[gallery] Gallery module initialized');
}
