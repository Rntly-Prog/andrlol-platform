(function () {
  'use strict';

  const scrollBtn = document.getElementById('scroll-top-btn');
  const supportBtn = document.getElementById('support-btn');
  const supportModal = document.getElementById('support-modal');

  if (scrollBtn) {
    const toggleScrollBtn = () => {
      if (window.scrollY > 300) {
        scrollBtn.removeAttribute('hidden');
      } else {
        scrollBtn.setAttribute('hidden', '');
      }
    };

    toggleScrollBtn();
    window.addEventListener('scroll', toggleScrollBtn, { passive: true });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (supportBtn && supportModal) {
    const openModal = () => {
      supportModal.removeAttribute('hidden');
      supportModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      supportModal.setAttribute('hidden', '');
      supportModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    supportBtn.addEventListener('click', openModal);

    supportModal.querySelectorAll('[data-close-support]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !supportModal.hasAttribute('hidden')) {
        closeModal();
      }
    });
  }
})();
