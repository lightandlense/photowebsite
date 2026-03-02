/**
 * pages.js — About/Contact page transitions and form logic
 *
 * Handles fade transitions between darkroom and About/Contact pages,
 * Formspree form submission, and page back navigation.
 *
 * GSAP is a CDN global — do NOT import it.
 */

import { navigateTo } from './router.js';
import { store } from './store.js';

let activePage = null; // 'about' | 'contact' | null
let activePagePhotoEl = null; // clothesline photo that was clicked
let pagePhotoSnapshot = null; // { scale, dx, dy } for reverse
let trayFloatTweens = []; // ambient float tweens for tray prints

export function getActivePage() { return activePage; }

/**
 * Returns sibling .clothesline__photo elements within the same .clothesline,
 * excluding the clicked photo itself and decorative photos.
 */
function getNeighborPhotos(photoEl) {
  const parent = photoEl.closest('.clothesline');
  if (!parent) return [];
  return Array.from(parent.querySelectorAll('.clothesline__photo')).filter(
    (el) => el !== photoEl && !el.classList.contains('clothesline__photo--decorative')
  );
}

export function navigateToPage(pageId, photoEl) {
  if (store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(pageId);

  // Pause CSS sway
  document.querySelectorAll('.clothesline__photo').forEach(el => {
    el.style.animationPlayState = 'paused';
  });

  // Snap photo to neutral rotation, then measure
  gsap.set(photoEl, { rotate: 0 });

  const rect = photoEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / rect.width, vh / rect.height);
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);

  // Save for reverse
  pagePhotoSnapshot = { scale, dx, dy };
  activePagePhotoEl = photoEl;

  const pinEl = photoEl.querySelector('.clothesline__pin');

  // Allow photo to escape darkroom overflow:hidden
  darkroomEl.style.overflow = 'visible';
  photoEl.style.zIndex = '50';
  photoEl.closest('.clothesline').style.zIndex = '100';

  gsap.set(pageEl, { display: 'block', opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(darkroomEl, { display: 'none' });
      photoEl.classList.add('clothesline__photo--empty');
      activePage = pageId;
      store.set({ transitionInProgress: false });
      navigateTo('/' + pageId);
      if (pageId === 'about') startTrayAnimations();
    }
  });

  // ACT 1: Pin releases, neighbors sway, wire bounces
  tl.to(pinEl, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to(
      getNeighborPhotos(photoEl),
      {
        rotate: (i) => (i % 2 === 0 ? 3 : -3),
        duration: 0.4,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0.1
    )
    .to(
      photoEl.closest('.clothesline')?.querySelector('.clothesline__wire'),
      { y: 2, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 },
      0.1
    );

  // ACT 2: Photo scales to fill viewport, darkroom fades
  tl.to(
      photoEl,
      {
        scale: scale,
        x: dx,
        y: dy,
        transformOrigin: '50% 50%',
        duration: 1.2,
        ease: 'power2.inOut',
      },
      0.3
    )
    .to(darkroomEl, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.7);

  // ACT 3: Page dissolves in
  tl.to(pageEl, { opacity: 1, duration: 0.3, ease: 'none' }, 1.3);
}

export function navigateFromPage() {
  if (!activePage || store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(activePage);

  // Reset contact form if leaving contact page
  if (activePage === 'contact') {
    resetContactForm();
  }

  // Kill tray animations if leaving about page
  if (activePage === 'about') {
    stopTrayAnimations();
  }

  const photoToRestore = activePagePhotoEl;
  const pinToRestore = photoToRestore ? photoToRestore.querySelector('.clothesline__pin') : null;
  const imgToRestore = photoToRestore ? photoToRestore.querySelector('.clothesline__image') : null;

  // Prep: remove empty class, set image/pin to invisible so they can fade in
  if (photoToRestore) {
    photoToRestore.classList.remove('clothesline__photo--empty');
    if (imgToRestore) gsap.set(imgToRestore, { opacity: 0, visibility: 'visible' });
    if (pinToRestore) gsap.set(pinToRestore, { opacity: 0, visibility: 'visible' });
  }

  gsap.set(darkroomEl, { display: 'block', opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(pageEl, { display: 'none', opacity: 0 });

      if (photoToRestore) {
        gsap.set(photoToRestore, { clearProps: 'scale,x,y,rotate,transformOrigin,transform' });
        photoToRestore.style.zIndex = '';
        const clothesline = photoToRestore.closest('.clothesline');
        if (clothesline) clothesline.style.zIndex = '';
        darkroomEl.style.overflow = '';
        gsap.set(photoToRestore, { opacity: 1 });

        if (pinToRestore) gsap.set(pinToRestore, { clearProps: 'y,transform' });
        if (imgToRestore) {
          gsap.set(imgToRestore, { clearProps: 'scale,boxShadow,transform,visibility' });
          gsap.set(imgToRestore, {
            filter: 'sepia(0.8) saturate(1.5) hue-rotate(-15deg) brightness(0.7)',
          });
        }
      }

      // Resume CSS sway
      document.querySelectorAll('.clothesline__photo').forEach(el => {
        el.style.animationPlayState = '';
      });

      activePage = null;
      activePagePhotoEl = null;
      pagePhotoSnapshot = null;
      store.set({ transitionInProgress: false });
    }
  });

  // Page fades out, darkroom fades in, photo shrinks back, image+pin fade in
  tl.to(pageEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to(darkroomEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1);

  if (photoToRestore) {
    tl.to(
        photoToRestore,
        { scale: 1, x: 0, y: 0, duration: 0.7, ease: 'power2.inOut' },
        0.2
      )
      .to(imgToRestore, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5)
      .to(pinToRestore, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.6);
  }
}

/** Reset contact form to initial state — show form, hide success/stamp, clear fields */
function resetContactForm() {
  const formEl = document.getElementById('contact-form');
  const successEl = document.getElementById('contact-success');
  const errorEl = document.getElementById('contact-error');
  const stampEl = document.getElementById('order-stamp');
  const orderForm = document.querySelector('.order-form');
  if (formEl) {
    formEl.reset();
    gsap.set(formEl, { display: 'block', opacity: 1 });
  }
  if (successEl) gsap.set(successEl, { display: 'none', opacity: 0 });
  if (errorEl) errorEl.textContent = '';
  if (stampEl) gsap.set(stampEl, { display: 'none', opacity: 0, scale: 2 });
  if (orderForm) gsap.set(orderForm, { opacity: 1 });
}

/* ---- Tray print animations ---- */

/** Start tray develop-in and ambient float animations */
function startTrayAnimations() {
  const prints = gsap.utils.toArray('#about .tray__print');
  if (!prints.length) return;

  // Enable drag immediately (even while developing in)
  initPrintDrag();

  // Develop-in: prints start invisible/blurry, stagger to sharp
  const tl = gsap.timeline({
    onComplete: () => startTrayFloat(prints),
  });

  tl.fromTo(prints,
    { opacity: 0, filter: 'blur(3px) brightness(1.5)' },
    {
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      duration: 2.5,
      stagger: 0.4,
      ease: 'power1.out',
    }
  );
}

/** Ambient float — perpetual gentle drift on each print */
function startTrayFloat(prints) {
  const driftParams = [
    { x: 12, y: -10, rotation: -1.5, duration: 14 },
    { x: -14, y: 8,  rotation: 2,    duration: 17 },
    { x: 10, y: 12,  rotation: -2,   duration: 13 },
    { x: -12, y: -8, rotation: 1.5,  duration: 16 },
    { x: 14, y: 6,   rotation: -1.5, duration: 15 },
    { x: -10, y: 10, rotation: 2,    duration: 18 },
    { x: 8,  y: -12, rotation: -2,   duration: 14 },
  ];

  prints.forEach((print, i) => {
    const p = driftParams[i % driftParams.length];
    // Use two independent tweens per axis for a more organic, non-linear feel
    trayFloatTweens.push(
      gsap.to(print, {
        x: `+=${p.x}`,
        y: `+=${p.y}`,
        duration: p.duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
      gsap.to(print, {
        rotation: `+=${p.rotation}`,
        duration: p.duration * 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    );
  });
}

/* ---- Drag interaction for prints ---- */

let dragCleanups = [];
const DRAG_LERP = 0.15; // water resistance — 0 = frozen, 1 = instant (0.15 = heavy drag)

/**
 * Clamp x/y so the print stays within the .tray__prints basin.
 * Uses the print's own bounding rect + the container rect
 * to prevent any edge from leaving the container.
 */
function clampToBounds(print, desiredX, desiredY) {
  const container = print.closest('.tray__prints');
  if (!container) return { x: desiredX, y: desiredY };

  const cRect = container.getBoundingClientRect();
  const pRect = print.getBoundingClientRect();

  // Current GSAP x/y values
  const curX = gsap.getProperty(print, 'x') || 0;
  const curY = gsap.getProperty(print, 'y') || 0;

  // The print's "natural" position (without GSAP transform) in container coords
  const naturalLeft = pRect.left - curX;
  const naturalTop = pRect.top - curY;

  // Where the print edges would be at desiredX/Y
  const newLeft = naturalLeft + desiredX;
  const newTop = naturalTop + desiredY;
  const newRight = newLeft + pRect.width;
  const newBottom = newTop + pRect.height;

  let clampedX = desiredX;
  let clampedY = desiredY;

  // Clamp left edge
  if (newLeft < cRect.left) clampedX = desiredX + (cRect.left - newLeft);
  // Clamp right edge
  if (newRight > cRect.right) clampedX = desiredX - (newRight - cRect.right);
  // Clamp top edge
  if (newTop < cRect.top) clampedY = desiredY + (cRect.top - newTop);
  // Clamp bottom edge
  if (newBottom > cRect.bottom) clampedY = desiredY - (newBottom - cRect.bottom);

  return { x: clampedX, y: clampedY };
}

function initPrintDrag() {
  const prints = document.querySelectorAll('#about .tray__print');

  prints.forEach(print => {
    let isDragging = false;
    let startX, startY, startPrintX, startPrintY;
    let targetX, targetY; // where the cursor wants the print
    let currentX, currentY; // where the print actually is (lerped)
    let floatTweensForPrint = [];
    let lerpRaf = null;

    // Lerp loop — runs every frame while dragging to create water resistance
    function lerpLoop() {
      if (!isDragging) return;
      currentX += (targetX - currentX) * DRAG_LERP;
      currentY += (targetY - currentY) * DRAG_LERP;

      const clamped = clampToBounds(print, currentX, currentY);
      currentX = clamped.x;
      currentY = clamped.y;

      gsap.set(print, { x: currentX, y: currentY });
      lerpRaf = requestAnimationFrame(lerpLoop);
    }

    function onPointerDown(e) {
      // Don't intercept clicks on links or buttons
      if (e.target.closest('a, button')) return;

      isDragging = true;
      print.classList.add('is-dragging');
      print.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;

      // Get current GSAP-applied transform values
      startPrintX = gsap.getProperty(print, 'x') || 0;
      startPrintY = gsap.getProperty(print, 'y') || 0;
      targetX = startPrintX;
      targetY = startPrintY;
      currentX = startPrintX;
      currentY = startPrintY;

      // Pause this print's float tweens
      floatTweensForPrint = trayFloatTweens.filter(t => t.targets().includes(print));
      floatTweensForPrint.forEach(t => t.pause());

      // Start lerp loop
      lerpRaf = requestAnimationFrame(lerpLoop);

      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      // Just update the target — lerp loop does the actual movement
      targetX = startPrintX + (e.clientX - startX);
      targetY = startPrintY + (e.clientY - startY);
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      print.classList.remove('is-dragging');
      if (lerpRaf) cancelAnimationFrame(lerpRaf);

      // Let the print glide to its final target position with easing
      const clamped = clampToBounds(print, targetX, targetY);
      gsap.to(print, {
        x: clamped.x,
        y: clamped.y,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          // Resume float tweens from the new position
          floatTweensForPrint.forEach(t => {
            t.invalidate();
            t.restart();
          });
        }
      });
    }

    print.addEventListener('pointerdown', onPointerDown);
    print.addEventListener('pointermove', onPointerMove);
    print.addEventListener('pointerup', onPointerUp);
    print.addEventListener('pointercancel', onPointerUp);

    dragCleanups.push(() => {
      print.removeEventListener('pointerdown', onPointerDown);
      print.removeEventListener('pointermove', onPointerMove);
      print.removeEventListener('pointerup', onPointerUp);
      print.removeEventListener('pointercancel', onPointerUp);
      if (lerpRaf) cancelAnimationFrame(lerpRaf);
    });
  });
}

function cleanupPrintDrag() {
  dragCleanups.forEach(fn => fn());
  dragCleanups = [];
}

/** Kill all tray animations and reset prints */
function stopTrayAnimations() {
  trayFloatTweens.forEach(t => t.kill());
  trayFloatTweens = [];
  cleanupPrintDrag();

  gsap.killTweensOf('#about .tray__print');

  // Reset prints to default state
  gsap.set('#about .tray__print', { clearProps: 'opacity,filter,x,y,rotation' });
}

/** Wire back buttons and contact form submission */
export function initPages() {
  // Back buttons on both pages
  document.querySelectorAll('.page__back').forEach(btn => {
    btn.addEventListener('click', () => {
      history.back();
    });
  });

  // Contact form — Formspree AJAX submission with RECEIVED stamp
  const formEl = document.getElementById('contact-form');
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formEl.querySelector('.order-form__submit');
      const errorEl = document.getElementById('contact-error');
      const successEl = document.getElementById('contact-success');
      const stampEl = document.getElementById('order-stamp');

      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      errorEl.textContent = '';

      try {
        const response = await fetch(formEl.action, {
          method: 'POST',
          body: new FormData(formEl),
          headers: { 'Accept': 'application/json' }
        });
        const json = await response.json();

        if (response.ok) {
          // Success: stamp slams in, holds, form fades, success appears
          const tl = gsap.timeline();

          // Show stamp and slam it in
          tl.set(stampEl, { display: 'block' })
            .fromTo(stampEl,
              { scale: 3, opacity: 0, rotation: -25, xPercent: -50, yPercent: -50 },
              { scale: 1, opacity: 0.85, rotation: -15, duration: 0.3, ease: 'back.out(2)' }
            )
            // Hold for a beat
            .to({}, { duration: 1.5 })
            // Fade out the entire form slip
            .to('.order-form', { opacity: 0, duration: 0.5, ease: 'power2.in' })
            // Show success message
            .set(successEl, { display: 'block', opacity: 0 })
            .to(successEl, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        } else {
          const msgs = (json.errors || []).map(err => err.message).join(' ');
          errorEl.textContent = msgs || 'Something went wrong. Please try again.';
          gsap.fromTo(errorEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Please check your connection.';
        gsap.fromTo(errorEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }

  // Handle "Get in Touch" CTA button on About page — uses <button> not <a> to avoid
  // router link interception conflict (initRouter intercepts all same-origin anchors)
  const aboutCta = document.querySelector('.about__cta');
  if (aboutCta) {
    aboutCta.addEventListener('click', () => {
      // Direct swap — fade About out, fade Contact in
      if (store.get().transitionInProgress) return;
      store.set({ transitionInProgress: true });

      const aboutEl = document.getElementById('about');
      const contactEl = document.getElementById('contact');
      resetContactForm();

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(aboutEl, { display: 'none', opacity: 0 });
          activePage = 'contact';
          store.set({ transitionInProgress: false });
          navigateTo('/contact');
        }
      });

      tl.to(aboutEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
        .set(contactEl, { display: 'block', opacity: 0 }, 0.3)
        .to(contactEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
    });
  }

  console.log('[pages] Pages module initialised');
}
