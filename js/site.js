/* Optional motion: content is visible by default, even if this script fails. */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const mobile = window.matchMedia('(max-width: 720px)');
  const setMenu = (open, restoreFocus = false) => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = mobile.matches && !open;
    if (restoreFocus) toggle.focus();
  };
  if (toggle && nav) {
    const sync = () => { toggle.hidden = !mobile.matches; setMenu(false); };
    sync();
    mobile.addEventListener('change', sync);
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Decorative ribbon responds gently to scrolling and a nearby pointer.
  // No ongoing animation loop, and no motion when the visitor requests less.
  const artwork = document.querySelector('.ribbon-art');
  const artArea = document.querySelector('.selected-art');
  if (artwork && artArea) {
    let scheduled = false;
    let pointerLean = 0;
    const updateArt = () => {
      scheduled = false;
      if (reduceMotion.matches) {
        artwork.style.removeProperty('--art-y');
        artwork.style.removeProperty('--art-angle');
        return;
      }
      const bounds = artArea.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1,
        (window.innerHeight / 2 - bounds.top - bounds.height / 2) / window.innerHeight));
      artwork.style.setProperty('--art-y', `${progress * 22}px`);
      artwork.style.setProperty('--art-angle', `${progress * .65 + pointerLean}deg`);
    };
    const scheduleArt = () => {
      if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateArt); }
    };
    window.addEventListener('scroll', scheduleArt, { passive: true });
    window.addEventListener('resize', scheduleArt, { passive: true });
    reduceMotion.addEventListener('change', scheduleArt);
    artArea.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reduceMotion.matches) return;
      const bounds = artArea.getBoundingClientRect();
      pointerLean = ((event.clientX - bounds.left) / bounds.width - .5) * .7;
      scheduleArt();
    });
    artArea.addEventListener('pointerleave', () => { pointerLean = 0; scheduleArt(); });
    scheduleArt();
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!reduceMotion.matches) entry.target.classList.add('entering');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }
})();
