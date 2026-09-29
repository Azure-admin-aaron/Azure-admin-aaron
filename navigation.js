(() => {
  const header = document.querySelector('.portfolio-header');
  if (!header) return;
  const nav = header.querySelector('.portfolio-nav');

  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const destination = new URL(link.href);
    if (destination.pathname === window.location.pathname && destination.hash) {
      // Move keyboard focus to the destination section.
      const section = document.getElementById(destination.hash.slice(1));
      if (section) {
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
      }
    }
  });

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
