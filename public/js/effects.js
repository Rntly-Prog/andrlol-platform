(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initBackground() {
    if (document.querySelector('.site-bg')) return;

    const bg = document.createElement('div');
    bg.className = 'site-bg';
    bg.setAttribute('aria-hidden', 'true');

    const mesh = document.createElement('div');
    mesh.className = 'site-bg__mesh';
    bg.appendChild(mesh);

    const count = prefersReducedMotion ? 8 : 16;
    for (let i = 0; i < count; i++) {
      const cross = document.createElement('div');
      cross.className = 'bg-cross';
      cross.style.left = `${8 + Math.random() * 84}%`;
      cross.style.top = `${5 + Math.random() * 90}%`;
      cross.style.setProperty('--size', `${32 + Math.random() * 72}px`);
      cross.style.setProperty('--delay', `${Math.random() * 10}s`);
      cross.style.setProperty('--duration', `${16 + Math.random() * 18}s`);
      cross.style.setProperty('--opacity', `${0.035 + Math.random() * 0.055}`);
      cross.style.setProperty('--rotate', `${Math.random() * 360}deg`);
      bg.appendChild(cross);
    }

    document.body.prepend(bg);
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-on-scroll, .animate-in');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    initBackground();
    initScrollReveal();
    initNavbarScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
