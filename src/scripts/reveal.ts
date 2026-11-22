/**
 * Scroll-reveal system (WCAG 2.2 AA, reduced-motion aware).
 *
 * Loaded once from BaseLayout as a hoisted, bundled external module
 * (script-src 'self' CSP-safe — no inline script). On DOMContentLoaded:
 *
 * 1. If the user prefers reduced motion, do NOTHING: every [data-reveal]
 *    element stays fully visible (the global CSS kill switch also forces
 *    all animations off).
 * 2. Otherwise, hide only the [data-reveal] elements that are BELOW the
 *    fold at load time with .reveal-pending (above-the-fold content is
 *    never hidden, so there is no flash and no layout shift), then reveal
 *    each one with .is-visible the first time it intersects the viewport
 *    (threshold 0.15, rootMargin '0px 0px -10%') and stop observing it.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -10%',
};

function initReveal(): void {
  if (window.matchMedia(REDUCED_MOTION).matches) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, OBSERVER_OPTIONS);

  const viewportHeight = window.innerHeight;
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    // Only elements below the fold at load time start hidden.
    if (el.getBoundingClientRect().top >= viewportHeight) {
      el.classList.add('reveal-pending');
      observer.observe(el);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal, { once: true });
} else {
  initReveal();
}
