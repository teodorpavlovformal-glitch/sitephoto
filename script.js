/* ── Hamburger menu ── */
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── Tabs ── */
function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
}

function goToTab(id) {
  const btn = document.querySelector('.tab-btn[data-tab="' + id + '"]');
  switchTab(id, btn);
  setTimeout(() => {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Custom Cursor (desktop only) ── */
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor    = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.id    = 'cur';
  cursorDot.id = 'cur-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mx = -200, my = -200, cx = -200, cy = -200;

  const TRAIL = 8;
  const trail = Array.from({ length: TRAIL }, () => {
    const el = document.createElement('div');
    el.className = 'cur-trail';
    document.body.appendChild(el);
    return { el, x: -200, y: -200 };
  });

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.transform = `translate(${mx}px,${my}px)`;
  });

  const clickables = 'a,button,[role=button],input,textarea,select,summary,.price-card,.review-card,.photo-slot,.feat-box,.tab-btn,.term-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(clickables)) cursor.classList.add('hov');
    else cursor.classList.remove('hov');
  });

  let prev = [];
  function loop() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursor.style.transform = `translate(${cx}px,${cy}px)`;

    if (!prev.length) prev = Array.from({ length: TRAIL }, () => ({ x: cx, y: cy }));
    prev.unshift({ x: cx, y: cy });
    prev = prev.slice(0, TRAIL + 1);

    trail.forEach((t, i) => {
      const p = prev[i + 1] || prev[prev.length - 1];
      t.x += (p.x - t.x) * 0.35;
      t.y += (p.y - t.y) * 0.35;
      const s  = (1 - i / TRAIL) * 0.7;
      const op = (1 - i / TRAIL) * 0.3;
      t.el.style.transform = `translate(${t.x}px,${t.y}px) scale(${s})`;
      t.el.style.opacity   = op;
    });

    requestAnimationFrame(loop);
  }
  loop();
}
