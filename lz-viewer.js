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

  // Magnifier: off by default so the whole diagram stays in view. The button turns it on;
  // while on, the view follows the pointer. Escape or the button turns it off.
  const stage = document.querySelector('.lz-stage');
  const stageCanvas = stage && stage.querySelector('.lz-canvas');
  const toggle = document.querySelector('.lz-magnify');
  const ZOOM = 2;
  let on = false, pointer = null, frame = 0;

  // Phones use a full-screen, touch-scrollable diagram instead of hover panning.
  const mobile = matchMedia('(max-width: 850px)');
  const mobileDialog = document.createElement('dialog');
  mobileDialog.className = 'lz-mobile-dialog';
  mobileDialog.setAttribute('aria-labelledby', 'lz-mobile-title');
  mobileDialog.innerHTML = `<div class="lz-mobile-toolbar">
    <h2 id="lz-mobile-title">Landing zone diagram</h2>
    <button type="button" class="lz-mobile-close" aria-label="Close diagram">×</button>
    <p id="lz-mobile-help">Drag to explore. Use + and − to zoom.</p>
    <div class="lz-mobile-controls">
      <button type="button" class="lz-mobile-out" aria-label="Zoom out">−</button>
      <button type="button" class="lz-mobile-fit">Fit diagram</button>
      <button type="button" class="lz-mobile-in" aria-label="Zoom in">+</button>
    </div>
  </div><div class="lz-mobile-view" tabindex="0" aria-label="Scrollable landing zone diagram" aria-describedby="lz-mobile-help"><div class="lz-mobile-canvas"></div></div>`;
  document.body.append(mobileDialog);
  const mobileView = mobileDialog.querySelector('.lz-mobile-view');
  const mobileCanvas = mobileDialog.querySelector('.lz-mobile-canvas');
  const mobileArt = stageCanvas.querySelector('.lz-art').cloneNode(true);
  mobileCanvas.append(mobileArt);
  const zoomOut = mobileDialog.querySelector('.lz-mobile-out');
  const zoomIn = mobileDialog.querySelector('.lz-mobile-in');
  let diagramWidth = 0, savedOverflow = '', drag = null;

  function sizeMobile(width, centerX = null, centerY = null) {
    const previousWidth = diagramWidth || width;
    const x = centerX ?? (mobileView.scrollLeft + mobileView.clientWidth / 2) / previousWidth;
    const y = centerY ?? (mobileView.scrollTop + mobileView.clientHeight / 2) / (previousWidth / AR);
    diagramWidth = Math.min(Math.max(width, mobileView.clientWidth), Math.max(W, mobileView.clientWidth));
    mobileCanvas.style.width = `${diagramWidth}px`;
    mobileView.scrollLeft = x * diagramWidth - mobileView.clientWidth / 2;
    mobileView.scrollTop = y * diagramWidth / AR - mobileView.clientHeight / 2;
    zoomOut.disabled = diagramWidth <= mobileView.clientWidth;
    zoomIn.disabled = diagramWidth >= Math.max(W, mobileView.clientWidth);
  }

  function openMobile() {
    magnify(false);
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    mobileDialog.showModal();
    toggle.setAttribute('aria-pressed', 'true');
    // Fill the available screen height, with room to pan across the wide diagram.
    sizeMobile(Math.max(mobileView.clientWidth * 2, mobileView.clientHeight * AR), .5, .5);
  }

  zoomOut.addEventListener('click', () => sizeMobile(diagramWidth / 1.4));
  zoomIn.addEventListener('click', () => sizeMobile(diagramWidth * 1.4));
  mobileDialog.querySelector('.lz-mobile-fit').addEventListener('click', () => sizeMobile(mobileView.clientWidth, .5, .5));
  mobileDialog.querySelector('.lz-mobile-close').addEventListener('click', () => mobileDialog.close());
  mobileDialog.addEventListener('close', () => {
    document.documentElement.style.overflow = savedOverflow;
    toggle.setAttribute('aria-pressed', 'false');
    drag = null;
  });
  mobileArt.querySelectorAll('.lz-marker').forEach(marker => {
    marker.addEventListener('click', () => {
      mobileDialog.close();
      open(+marker.dataset.lz);
    });
  });
  // Touch uses native scrolling (including momentum); a mouse can drag too.
  mobileView.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, left: mobileView.scrollLeft, top: mobileView.scrollTop };
    mobileView.setPointerCapture(e.pointerId);
  });
  mobileView.addEventListener('pointermove', e => {
    if (!drag) return;
    mobileView.scrollLeft = drag.left - (e.clientX - drag.x);
    mobileView.scrollTop = drag.top - (e.clientY - drag.y);
  });
  mobileView.addEventListener('pointerup', () => { drag = null; });
  mobileView.addEventListener('pointercancel', () => { drag = null; });
  window.addEventListener('resize', () => {
    if (!mobileDialog.open) return;
    if (!mobile.matches) mobileDialog.close();
    else sizeMobile(diagramWidth);
  });

  function pan() {
    frame = 0;
    if (!on || !pointer) return;
    const r = stage.getBoundingClientRect();
    const x = Math.min(Math.max(pointer.x - r.left, 0), r.width);
    const y = Math.min(Math.max(pointer.y - r.top, 0), r.height);
    stageCanvas.style.transform = `translate(${x * (1 - ZOOM)}px, ${y * (1 - ZOOM)}px)`;
  }

  function magnify(state) {
    on = state;
    stage.classList.toggle('is-zoomed', on);
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Show whole diagram' : 'Magnify';
    stageCanvas.style.width = on ? `${ZOOM * 100}%` : '';
    if (on && !pointer) { const r = stage.getBoundingClientRect(); pointer = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    if (on) pan(); else stageCanvas.style.transform = '';
  }

  if (stage && stageCanvas && toggle) {
    toggle.addEventListener('click', () => mobile.matches ? openMobile() : magnify(!on));
    stage.addEventListener('pointermove', e => {
      pointer = { x: e.clientX, y: e.clientY };
      if (on && !frame) frame = requestAnimationFrame(pan);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && on) magnify(false); });
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
    if (el.closest('.lz-dialog, .lz-mobile-dialog')) return;
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
