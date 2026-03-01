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

export function getActivePage() { return activePage; }

export function navigateToPage(pageId) {
  if (store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(pageId);

  // Pause CSS sway
  document.querySelectorAll('.clothesline__photo').forEach(el => {
    el.style.animationPlayState = 'paused';
  });

  const tl = gsap.timeline({
    onComplete: () => {
      activePage = pageId;
      store.set({ transitionInProgress: false });
      navigateTo('/' + pageId);
    }
  });

  tl.to(darkroomEl, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
    .set(darkroomEl, { display: 'none' }, 0.5)
    .set(pageEl, { display: 'flex', opacity: 0 }, 0.5)
    .to(pageEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.5);
}

export function navigateFromPage() {
  if (!activePage || store.get().transitionInProgress) return;
  store.set({ transitionInProgress: true });

  const darkroomEl = document.getElementById('darkroom');
  const pageEl = document.getElementById(activePage);

  // Reset contact form if leaving contact page (form state persists between visits)
  if (activePage === 'contact') {
    resetContactForm();
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(pageEl, { display: 'none', opacity: 0 });
      activePage = null;
      // Resume CSS sway
      document.querySelectorAll('.clothesline__photo').forEach(el => {
        el.style.animationPlayState = '';
      });
      store.set({ transitionInProgress: false });
    }
  });

  gsap.set(darkroomEl, { display: 'block', opacity: 0 });
  tl.to(pageEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
    .to(darkroomEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2);
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
        .set(contactEl, { display: 'flex', opacity: 0 }, 0.3)
        .to(contactEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
    });
  }

  console.log('[pages] Pages module initialised');
}
