(() => {
  'use strict';

  /* ================= DATA ================= */
  const WORKS = [
    { id: 'minecraft', yt: '', isLandscape: true, title: 'Minecraft — Story & Pacing', tag: 'Gaming / Long-Form', desc: 'High-retention Minecraft gameplay edit cut in Adobe Premiere Pro. Multi-cam pacing, sound design, visual humor, zoom dynamics, and storytelling.', meta: ['Gaming', '1080p • 60fps', '8:51'] },
    { id: 'khushal',   yt: 'Za1h1el6vDI', title: 'Khushal Sharma — Intro',   tag: 'Creator Intro',     desc: 'High-retention talking-head intro with punchy zooms, neon UI cards and animated screen mockups to hook viewers instantly.', meta: ['Creator', '1080p • 60fps', '1:35'] },
    { id: 'carphonk',  yt: 'AfXHTWNqvWM', title: 'Car Phonk — Speed Ramp',   tag: 'Phonk / Car Edit',  desc: 'Aggressive speed-ramps, red light streaks and shake — every cut locked to the phonk drop. Delivered in 2K.', meta: ['Phonk', '1440p 2K', '0:15'] },
    { id: 'animation', yt: 'lGs4GHSQ1iY', title: 'Blood Moon — Animation',   tag: 'After Effects',     desc: 'A cinematic motion piece: bow, arrow, blood-red moon and a piercing eye — composited and animated in After Effects.', meta: ['Motion', '1080p • 60fps', '0:10'] },
    { id: 'minimal',   yt: 'dmycXz_fXcQ', title: 'Minimal Shape Animation',  tag: 'Motion Graphics',   desc: 'Clean, minimal shape animation: pure physics, rhythm and satisfying loops with a black & white palette.', meta: ['Motion', '1080p • 60fps', '0:29'] }
  ];
  const pad = n => String(n + 1).padStart(2, '0');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isTouch = matchMedia('(hover:none)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  /* ================= LOADER ================= */
  (function loader() {
    const num = $('#loader-num'), bar = $('#loader-bar'), el = $('#loader');
    let p = 0, done = false;
    const finish = () => {
      if (done) return; done = true;
      num.textContent = '100'; bar.style.width = '100%';
      setTimeout(() => { el.classList.add('done'); document.body.classList.add('ready'); setTimeout(() => el.remove(), 1000); }, 350);
    };
    const t = setInterval(() => {
      p = Math.min(p + Math.random() * 14 + 4, 92);
      num.textContent = Math.floor(p); bar.style.width = p + '%';
    }, 120);
    const go = () => { clearInterval(t); finish(); };
    // wait for fonts + first posters
    const imgs = WORKS.slice(0, 3).map(w => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = `media/${w.id}.jpg`; }));
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), ...imgs]).then(() => setTimeout(go, 500));
    setTimeout(go, 3500); // safety
  })();

  /* ================= HEADER ================= */
  const header = $('#site-header');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('hide', y > lastY && y > 400 && !$('#nav-links').classList.contains('open'));
    lastY = y;
  }, { passive: true });
  const burger = $('#burger'), links = $('#nav-links');
  burger.addEventListener('click', () => {
    const o = links.classList.toggle('open');
    burger.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o);
  });
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); burger.classList.remove('open'); }));

  /* ================= CAROUSEL ================= */
  const stage = $('#carousel-stage'), dotsEl = $('#car-dots'), carousel = $('#carousel');
  let cur = 0, slides = [], autoplay = null, userPaused = false;

  WORKS.forEach((w, i) => {
    const s = document.createElement('div');
    s.className = 'slide';
    s.setAttribute('role', 'button');
    s.setAttribute('aria-label', `Open ${w.title}`);
    s.innerHTML = `
      <div class="slide-in">
        <img src="media/${w.id}.jpg" alt="${w.title}" draggable="false" ${i > 2 ? 'loading="lazy"' : ''}/>
        <video muted loop playsinline preload="none" data-src="media/${w.id}-preview.mp4"></video>
        <span class="slide-num">${pad(i)}</span>
        <span class="slide-play">${ICON_PLAY}</span>
        <div class="slide-cap"><b>${w.title}</b><span>${w.tag}</span></div>
      </div>
      <div class="slide-ref"><img src="media/${w.id}.jpg" alt="" draggable="false" loading="lazy"/></div>`;
    stage.appendChild(s); slides.push(s);

    const d = document.createElement('button');
    d.setAttribute('aria-label', `Go to edit ${i + 1}`);
    d.addEventListener('click', () => { go(i); });
    dotsEl.appendChild(d);
  });
  const dots = $$('button', dotsEl);

  function slideW() { return slides[0].getBoundingClientRect().width || 280; }
  function layout() {
    const n = slides.length, w = slideW();
    const mobile = innerWidth < 700;
    const gap = w * (mobile ? .62 : .78);
    slides.forEach((s, i) => {
      let off = i - cur;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      const abs = Math.abs(off);
      const x = off * gap;
      const z = -abs * (mobile ? 120 : 190);
      const ry = off === 0 ? 0 : (off > 0 ? -1 : 1) * (mobile ? 34 : 42);
      const sc = off === 0 ? 1 : Math.max(.7, 1 - abs * .1);
      const vis = abs <= (mobile ? 1 : 2);
      s.style.transform = `translate3d(calc(-50% + ${x}px),0,${z}px) rotateY(${ry}deg) scale(${sc})`;
      s.style.opacity = vis ? (abs === 0 ? 1 : Math.max(.35, 1 - abs * .3)) : 0;
      s.style.filter = abs === 0 ? 'none' : `brightness(${Math.max(.35, .7 - abs * .12)}) saturate(.9)`;
      s.style.zIndex = 100 - abs;
      s.style.pointerEvents = vis ? 'auto' : 'none';
      s.classList.toggle('active', off === 0);
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    playActive();
  }
  function playActive() {
    slides.forEach((s, i) => {
      const v = $('video', s);
      if (i === cur) {
        if (!v.src) v.src = v.dataset.src;
        v.addEventListener('playing', () => v.classList.add('ready'), { once: true });
        v.play().catch(() => {});
      } else { v.pause(); v.classList.remove('ready'); }
    });
  }
  function go(i) { cur = (i + slides.length) % slides.length; layout(); restartAuto(); }
  $('#car-prev').addEventListener('click', () => go(cur - 1));
  $('#car-next').addEventListener('click', () => go(cur + 1));
  function restartAuto() {
    clearInterval(autoplay);
    if (reduce) return;
    autoplay = setInterval(() => { if (!userPaused && !document.hidden && !$('#modal').offsetParent) go(cur + 1); }, 5200);
  }
  carousel.addEventListener('mouseenter', () => userPaused = true);
  carousel.addEventListener('mouseleave', () => userPaused = false);

  // click on slide: side => focus, active => open modal
  slides.forEach((s, i) => s.addEventListener('click', () => {
    if (dragMoved) return;
    if (i === cur) openModal(i); else go(i);
  }));

  // drag / swipe
  let startX = 0, dragging = false, dragMoved = false;
  const down = x => { dragging = true; dragMoved = false; startX = x; carousel.classList.add('drag'); };
  const move = x => { if (dragging && Math.abs(x - startX) > 8) dragMoved = true; };
  const up = x => {
    if (!dragging) return; dragging = false; carousel.classList.remove('drag');
    const dx = x - startX;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    setTimeout(() => dragMoved = false, 30);
  };
  carousel.addEventListener('mousedown', e => down(e.clientX));
  addEventListener('mousemove', e => move(e.clientX));
  addEventListener('mouseup', e => up(e.clientX));
  carousel.addEventListener('touchstart', e => down(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchmove', e => move(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchend', e => up(e.changedTouches[0].clientX));
  addEventListener('keydown', e => {
    if ($('#modal').hidden === false) return;
    if (e.key === 'ArrowLeft') go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });
  addEventListener('resize', layout);
  layout(); restartAuto();

  /* ================= WORK GRID ================= */
  const grid = $('#work-grid');
  WORKS.forEach((w, i) => {
    const c = document.createElement('article');
    c.className = 'card reveal';
    c.style.setProperty('--d', (i % 3) * 0.1 + 's');
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', `Play ${w.title}`);
    c.dataset.cursor = 'play';
    c.innerHTML = `
      <div class="card-media">
        <img src="media/${w.id}.jpg" alt="${w.title}" loading="lazy"/>
        <video muted loop playsinline preload="none" data-src="media/${w.id}-preview.mp4"></video>
      </div>
      <div class="card-top"><span class="chip">${w.tag}</span><span class="card-play">${ICON_PLAY}</span></div>
      <div class="card-info">
        <h3>${w.title}</h3>
        <p>${pad(i)} / ${String(WORKS.length).padStart(2, '0')}</p>
        <div class="meta">${w.meta.map(m => `<i>${m}</i>`).join('')}</div>
      </div>`;
    const v = $('video', c);
    c.addEventListener('mouseenter', () => { if (!v.src) v.src = v.dataset.src; v.addEventListener('playing', () => v.classList.add('ready'), { once: true }); v.play().catch(() => {}); });
    c.addEventListener('mouseleave', () => { v.pause(); v.classList.remove('ready'); });
    c.addEventListener('click', () => openModal(i));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); } });
    // tilt
    if (!isTouch && !reduce) {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.transition = 'transform .1s linear,border-color .4s,box-shadow .6s';
        c.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transition = ''; c.style.transform = ''; });
    }
    grid.appendChild(c);
  });

  /* ================= MODAL ================= */
  const modal = $('#modal'), mv = $('#modal-video');
  let mi = 0;
  function fillModal(i) {
    mi = (i + WORKS.length) % WORKS.length;
    const w = WORKS[mi];
    mv.pause(); mv.poster = `media/${w.id}.jpg`; mv.src = `media/${w.id}.mp4`;
    const playerEl = $('.modal-player');
    if (playerEl) playerEl.classList.toggle('landscape', !!w.isLandscape);
    $('#modal-index').textContent = pad(mi);
    $('#modal-tag').textContent = w.tag;
    $('#modal-title').textContent = w.title;
    $('#modal-desc').textContent = w.desc;
    $('#modal-meta').innerHTML = w.meta.map(m => `<li>${m}</li>`).join('');
    const ytBtn = $('#modal-yt');
    if (w.yt) {
      ytBtn.style.display = '';
      ytBtn.href = `https://youtube.com/shorts/${w.yt}`;
      ytBtn.textContent = 'Watch on YouTube';
    } else {
      ytBtn.href = 'https://youtube.com/@hollow4u_02';
      ytBtn.textContent = 'Channel Link';
    }
    mv.play().catch(() => {});
  }
  function openModal(i) {
    modal.hidden = false; document.body.classList.add('lock');
    slides.forEach(s => $('video', s).pause());
    fillModal(i);
  }
  function closeModal() {
    modal.hidden = true; document.body.classList.remove('lock');
    mv.pause(); mv.removeAttribute('src'); mv.load();
    const playerEl = $('.modal-player');
    if (playerEl) playerEl.classList.remove('landscape');
    playActive();
  }
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
  $('#modal-prev').addEventListener('click', () => fillModal(mi - 1));
  $('#modal-next').addEventListener('click', () => fillModal(mi + 1));
  addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') fillModal(mi - 1);
    if (e.key === 'ArrowRight') fillModal(mi + 1);
  });

  /* ================= REVEAL ================= */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (el.classList.contains('hero-sub') ? .5 : el.classList.contains('hero-cta') ? .65 : el.classList.contains('pill') ? 0 : 0) + 's'); io.observe(el); });
  // stagger siblings in grids
  ['.services', '.steps', '.stats', '.faq'].forEach(sel => $$(`${sel} .reveal`).forEach((el, i) => el.style.setProperty('--d', i * .08 + 's')));

  /* ================= COUNTERS ================= */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1600;
    const tick = t => { const k = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v + suf; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('.count').forEach(c => cio.observe(c));

  /* ================= CURSOR ================= */
  if (!isTouch) {
    const cur_ = $('#cursor'), lab = $('#cursor-label');
    let cx = 0, cy = 0, tx = 0, ty = 0, sc = 0, tsc = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur_.classList.add('on'); });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { tsc = 1; lab.textContent = t.dataset.cursor === 'drag' ? 'Drag' : 'Play'; } else tsc = 0;
    });
    // active slide in carousel => "Play", others => "Drag"
    carousel.addEventListener('mousemove', e => { const s = e.target.closest('.slide'); lab.textContent = s && s.classList.contains('active') ? 'Play' : 'Drag'; });
    (function loop() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2; sc += (tsc - sc) * .18;
      cur_.style.transform = `translate3d(${cx}px,${cy}px,0) scale(${sc})`;
      requestAnimationFrame(loop);
    })();
    // hide cursor over modal
    modal.addEventListener('mouseenter', () => tsc = 0);
  }

  /* ================= MAGNETIC BUTTONS ================= */
  if (!isTouch && !reduce) {
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* ================= SPOTLIGHT ================= */
  $$('.spot').forEach(el => el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ================= CONTACT FORM -> mailto ================= */
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#cf-name').value.trim(), m = $('#cf-email').value.trim(), msg = $('#cf-msg').value.trim();
    const body = `Hi Rajan,\n\n${msg}\n\n— ${n}\n${m}`;
    location.href = `mailto:lostsoul706706@gmail.com?subject=${encodeURIComponent('Video editing project — ' + n)}&body=${encodeURIComponent(body)}`;
  });

  $('#year').textContent = new Date().getFullYear();
})();
