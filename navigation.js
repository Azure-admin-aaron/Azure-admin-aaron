(() => {
  const header = document.querySelector('.portfolio-header');
  if (!header) return;
  const toggle = header.querySelector('.navigation-toggle');
  const nav = header.querySelector('.portfolio-nav');
  const mobile = window.matchMedia('(max-width: 760px)');
  header.setAttribute('data-nav-ready', '');

  function closeMenu(returnFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });

  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    closeMenu();
    const destination = new URL(link.href);
    if (destination.pathname === window.location.pathname && destination.hash) {
      // Move keyboard focus to the destination before hiding the mobile menu.
      const section = document.getElementById(destination.hash.slice(1));
      if (section) {
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  header.addEventListener('focusout', event => {
    if (!header.contains(event.relatedTarget)) closeMenu();
  });
  mobile.addEventListener('change', () => closeMenu());

  const links = [...nav.querySelectorAll('a')];
  function markCurrentLink() {
    const currentPath = window.location.pathname.replace(/\/$/, '/index.html');
    const hash = window.location.hash;
    links.forEach(link => {
      const destination = new URL(link.href);
      const matches = destination.pathname === currentPath && destination.hash === hash;
      if (matches) link.setAttribute('aria-current', hash ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', markCurrentLink);
  markCurrentLink();

  let queued = false;
  function updateHeader() {
    // Hysteresis keeps the shrinking header stable near its scroll threshold.
    if (window.scrollY > 80) header.classList.add('is-compact');
    else if (window.scrollY < 24) header.classList.remove('is-compact');
    queued = false;
  }
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
})();
