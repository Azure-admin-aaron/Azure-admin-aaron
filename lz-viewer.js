// Zoomable viewer for the landing zone diagram on the home page.
(() => {
  const dialog = document.querySelector('.lz-dialog');
  if (!dialog) return;
  const W = 3693, H = 1718, AR = W / H;
  const spots = [...document.querySelectorAll('.lz-spot')].map(b => ({
    title: b.querySelector('strong').textContent,
    text: b.dataset.what,
    x: +b.dataset.x, y: +b.dataset.y,
    box: b.dataset.box.split(',').map(Number),
    work: (b.dataset.work || '').split('|').filter(Boolean)
  }));
  const canvas = dialog.querySelector('.lz-d-canvas');
  const layer = dialog.querySelector('.lz-d-markers');
  const kicker = dialog.querySelector('.lz-d-kicker');
  const title = dialog.querySelector('#lz-d-title');
  const text = dialog.querySelector('.lz-d-text');
  const prev = dialog.querySelector('.lz-d-prev');
  const next = dialog.querySelector('.lz-d-next');
  const work = dialog.querySelector('.lz-d-work ul');
  let current = -1;

  layer.innerHTML = spots.map((s, i) =>
    `<span class="lz-marker" style="left:${s.x}%;top:${s.y}%">${i + 1}</span>`).join('');

  // Expand a box (in % of the diagram) to the diagram's aspect ratio, kept inside the edges.
  function fit([x0, y0, x1, y1]) {
    let w = (x1 - x0) / 100 * W, h = (y1 - y0) / 100 * H;
    const cx = (x0 + x1) / 200 * W, cy = (y0 + y1) / 200 * H;
    if (w / h < AR) w = h * AR; else h = w / AR;
    const left = Math.min(Math.max(cx - w / 2, 0), W - w);
    const top = Math.min(Math.max(cy - h / 2, 0), H - h);
    return { left, top, w, h };
  }

  function show(i) {
    current = i;
    const whole = i < 0;
    const v = whole ? { left: 0, top: 0, w: W, h: H } : fit(spots[i].box);
    canvas.style.width = `${W / v.w * 100}%`;
    canvas.style.left = `${-v.left / v.w * 100}%`;
    canvas.style.top = `${-v.top / v.h * 100}%`;
    layer.querySelectorAll('.lz-marker').forEach((m, j) => m.classList.toggle('is-active', j === i));
    kicker.textContent = whole ? 'Azure landing zone · hub and spoke' : `${i + 1} of ${spots.length}`;
    title.textContent = whole ? 'The whole diagram' : spots[i].title;
    dialog.classList.toggle('is-whole', whole);
    work.replaceChildren(...(whole ? [] : spots[i].work).map(item => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    text.textContent = whole ? 'Select a number below the diagram, or use Previous and Next, to zoom into where my work fits.' : spots[i].text;
    prev.disabled = i <= 0 && !whole ? true : false;
    next.disabled = i === spots.length - 1;
    if (whole) prev.disabled = true;
  }

  function open(i) {
    show(i);
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll('.lz-spot, .lz-marker, .lz-open').forEach(el => {
    if (el.closest('.lz-dialog')) return;
    el.addEventListener('click', () => open(+el.dataset.lz));
  });
  prev.addEventListener('click', () => show(Math.max(current - 1, 0)));
  next.addEventListener('click', () => show(Math.min(current + 1, spots.length - 1)));
  dialog.querySelector('.lz-d-all').addEventListener('click', () => show(-1));
  dialog.querySelector('.lz-d-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next.click();
    if (e.key === 'ArrowLeft') prev.click();
  });
})();
