// Add an inline reading path around the unchanged, interactive landing-zone viewer.
(() => {
  const spots = [...document.querySelectorAll('.lz-spot')];
  if (!spots.length) return;
  let selected = 5;
  const label = document.querySelector('#detail-label');
  const title = document.querySelector('#detail-title');
  const text = document.querySelector('#detail-text');
  const prev = document.querySelector('#detail-prev');
  const next = document.querySelector('#detail-next');
  const headings = ['Organize the platform.', 'Give resources a shared identity.', 'Make platform changes repeatable.', 'Keep security data visible.', 'Build for ongoing operations.', 'Connect the platform to the workload.', 'Give shared services a home.', 'Follow the application’s needs.', 'Make room to experiment.'];
  function select(index) {
    selected = index;
    label.textContent = spots[index].querySelector('strong').textContent;
    title.textContent = headings[index];
    text.textContent = spots[index].dataset.work.split('|').join('. ').replace(/\.$/, '') + '.';
    prev.disabled = selected === 0;
    next.disabled = selected === spots.length - 1;
  }
  document.querySelectorAll('button[data-lz]').forEach(button => {
    button.addEventListener('click', () => select(Number(button.dataset.lz)));
  });
  prev.addEventListener('click', () => select(Math.max(0, selected-1)));
  next.addEventListener('click', () => select(Math.min(spots.length-1, selected+1)));
  function reset() {
    const mobile = document.querySelector('.lz-mobile-dialog');
    if (mobile?.open) mobile.close();
    const detail = document.querySelector('.lz-dialog');
    if (detail?.open) detail.close();
    const toggle = document.querySelector('.lz-magnify');
    if (document.querySelector('.lz-stage').classList.contains('is-zoomed')) toggle.click();
    select(5);
  }
  document.querySelector('.diagram-reset').addEventListener('click', reset);
  document.querySelector('#detail-whole').addEventListener('click', () => {
    reset();
    document.querySelector('.lz-frame').scrollIntoView({ block:'center', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth' });
  });
})();
