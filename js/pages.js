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

/** Reset contact form to initial state — show form, hide success, clear fields */
function resetContactForm() {
  const formEl = document.getElementById('contact-form');
  const successEl = document.getElementById('contact-success');
  const errorEl = document.getElementById('contact-error');
  if (formEl) {
    formEl.reset();
    gsap.set(formEl, { display: 'block', opacity: 1 });
  }
  if (successEl) gsap.set(successEl, { display: 'none', opacity: 0 });
  if (errorEl) errorEl.textContent = '';
}

/** Wire back buttons and contact form submission */
export function initPages() {
  // Back buttons on both pages
  document.querySelectorAll('.page__back').forEach(btn => {
    btn.addEventListener('click', () => {
      history.back();
    });
  });

  // Contact form — Formspree AJAX submission
  const formEl = document.getElementById('contact-form');
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formEl.querySelector('.contact__submit');
      const errorEl = document.getElementById('contact-error');
      const successEl = document.getElementById('contact-success');

      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      errorEl.textContent = '';

      try {
        const response = await fetch(formEl.action, {
          method: 'POST',
          body: new FormData(formEl),
          headers: { 'Accept': 'application/json' }
        });
        const json = await response.json();

        if (response.ok) {
          // Success: fade form out, fade confirmation in
          const tl = gsap.timeline();
          tl.to(formEl, { opacity: 0, duration: 0.4, ease: 'power2.in' })
            .set(formEl, { display: 'none' })
            .set(successEl, { display: 'block', opacity: 0 })
            .to(successEl, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        } else {
          const msgs = (json.errors || []).map(err => err.message).join(' ');
          errorEl.textContent = msgs || 'Something went wrong. Please try again.';
          gsap.fromTo(errorEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Please check your connection.';
        gsap.fromTo(errorEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
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
