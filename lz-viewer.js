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

  // Reuse the page's flowing-dot layer inside the zoom view.
  const flow = document.querySelector('.lz-canvas .lz-flow');
  if (flow) {
    const copy = flow.cloneNode(true);
    // The zoom view is already magnified, so use smaller dots there.
    copy.querySelectorAll('circle').forEach(c => c.setAttribute('r', c.getAttribute('r') * 0.55));
    canvas.insertBefore(copy, layer);
  }

  // Hover to magnify the page diagram around the pointer (mouse and trackpad only).
  const stage = document.querySelector('.lz-stage');
  const stageCanvas = stage && stage.querySelector('.lz-canvas');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ZOOM = 2.2;
  let pointer = null, frame = 0;

  function pan() {
    frame = 0;
    if (!pointer) return;
    const r = stage.getBoundingClientRect();
    const x = Math.min(Math.max(pointer.x - r.left, 0), r.width);
    const y = Math.min(Math.max(pointer.y - r.top, 0), r.height);
    stageCanvas.style.transform = `translate(${x * (1 - ZOOM)}px, ${y * (1 - ZOOM)}px)`;
  }

  if (stage && stageCanvas) {
    stage.classList.toggle('is-zoomable', fine.matches);
    fine.addEventListener('change', () => stage.classList.toggle('is-zoomable', fine.matches));
    stage.addEventListener('pointerenter', e => {
      if (!fine.matches || e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      stageCanvas.style.width = `${ZOOM * 100}%`;
      pan();
    });
    stage.addEventListener('pointermove', e => {
      if (!pointer) return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(pan);
    });
    stage.addEventListener('pointerleave', () => {
      pointer = null;
      stageCanvas.style.width = '';
      stageCanvas.style.transform = '';
    });
  }

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
    const v = fit(spots[i].box);
    canvas.style.width = `${W / v.w * 100}%`;
    canvas.style.left = `${-v.left / v.w * 100}%`;
    canvas.style.top = `${-v.top / v.h * 100}%`;
    layer.querySelectorAll('.lz-marker').forEach((m, j) => m.classList.toggle('is-active', j === i));
    kicker.textContent = `${i + 1} of ${spots.length}`;
    title.textContent = spots[i].title;
    work.replaceChildren(...spots[i].work.map(item => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    text.textContent = spots[i].text;
    prev.disabled = i === 0;
    next.disabled = i === spots.length - 1;
  }

  function open(i) {
    show(i);
    if (!dialog.open) dialog.showModal();
  }

  // Close the zoom and bring the full diagram on the page into view.
  function showWhole() {
    dialog.close();
    const frame = document.querySelector('.lz-frame');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    frame.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    frame.focus({ preventScroll: true });
    frame.classList.remove('is-flash');
    void frame.offsetWidth;
    frame.classList.add('is-flash');
  }

  document.querySelectorAll('.lz-spot, .lz-marker').forEach(el => {
    if (el.closest('.lz-dialog')) return;
    el.addEventListener('click', () => open(+el.dataset.lz));
  });
  prev.addEventListener('click', () => show(Math.max(current - 1, 0)));
  next.addEventListener('click', () => show(Math.min(current + 1, spots.length - 1)));
  dialog.querySelector('.lz-d-all').addEventListener('click', showWhole);
  dialog.querySelector('.lz-d-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next.click();
    if (e.key === 'ArrowLeft') prev.click();
  });
})();
