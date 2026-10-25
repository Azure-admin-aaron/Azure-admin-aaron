// Navigation and small enhancements; the pages remain readable without JavaScript.
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const destination = document.getElementById(link.hash.slice(1));
      if (!destination) return;
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
    });
  });
  const copy = document.querySelector('.copy-code');
  copy?.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(document.querySelector('#bicep-code').textContent);
      copy.textContent = 'Copied';
      status.textContent = 'Bicep example copied to clipboard.';
      setTimeout(() => { copy.textContent = 'Copy'; }, 2500);
    } catch {
      status.textContent = 'Clipboard access is unavailable. Select the code to copy it.';
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('#bicep-code'));
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  const sections = [...document.querySelectorAll('.case-body section[id], #results')];
  const toc = [...document.querySelectorAll('.case-toc a')];
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (!visible.length) return;
      toc.forEach(link => {
        if (link.hash === '#' + visible[0].target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-10% 0px -50% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
