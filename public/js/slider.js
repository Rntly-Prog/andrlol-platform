(function () {
  'use strict';

  function initSlider(root) {
    const track = root.querySelector('.slider__track');
    const slides = root.querySelectorAll('.slider__slide');
    const prev = root.querySelector('.slider__prev');
    const next = root.querySelector('.slider__next');
    const dotsWrap = root.querySelector('.slider__dots');

    if (!track || slides.length === 0) return;

    let index = 0;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      root.querySelectorAll('.slider__dot').forEach((dot, di) => {
        dot.classList.toggle('is-active', di === index);
      });
    }

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));

    let autoplay = setInterval(() => goTo(index + 1), 6000);
    root.addEventListener('mouseenter', () => clearInterval(autoplay));
    root.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo(index + 1), 6000);
    });
  }

  function initStarInput(form) {
    const labels = form.querySelectorAll('.star-input label');
    const inputs = form.querySelectorAll('.star-input input');

    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        const val = Number(input.value);
        labels.forEach((label) => {
          const star = Number(label.dataset.star);
          label.classList.toggle('is-active', star <= val);
        });
      });
    });
  }

  function init() {
    document.querySelectorAll('[data-slider]').forEach(initSlider);
    document.querySelectorAll('[data-star-form]').forEach(initStarInput);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
