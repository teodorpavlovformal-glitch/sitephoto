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

/* ── Inquiry form (mailto) ── */
const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
  const emailTo = 'teodorpavlovformal@gmail.com';
  const nameEl = document.getElementById('inqName');
  const phoneEl = document.getElementById('inqPhone');
  const typeEl = document.getElementById('inqType');
  const msgEl = document.getElementById('inqMsg');
  const submitEl = document.getElementById('inqSubmit');
  const statusEl = document.getElementById('inqStatus');

  const setStatus = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.classList.remove('ok', 'err');
    if (kind) statusEl.classList.add(kind);
  };

  const setFieldError = (el, on) => {
    if (!el) return;
    el.classList.toggle('field-error', Boolean(on));
  };

  const readValue = (el) => (el?.value || '').trim();

  const validate = () => {
    const name = readValue(nameEl);
    const type = readValue(typeEl);
    const msg = readValue(msgEl);

    setFieldError(nameEl, !name);
    setFieldError(typeEl, !type);
    setFieldError(msgEl, !msg);

    return Boolean(name && type && msg);
  };

  const clearErrorsOnInput = (el) => {
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => setFieldError(el, false));
  };
  clearErrorsOnInput(nameEl);
  clearErrorsOnInput(typeEl);
  clearErrorsOnInput(msgEl);

  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    setStatus('', null);

    if (!validate()) {
      setStatus('Моля, попълнете: име, вид фотография и съобщение.', 'err');
      return;
    }

    const name = readValue(nameEl);
    const phone = readValue(phoneEl);
    const type = readValue(typeEl);
    const msg = readValue(msgEl);

    const subject = `Запитване от сайта — ${type}`;
    const bodyLines = [
      `Име: ${name}`,
      `Телефон: ${phone || '-'}`,
      `Вид фотография: ${type}`,
      '',
      'Съобщение:',
      msg,
      '',
      `Изпратено от: ${location.href}`,
    ];

    // RFC 6068: encode only query params, not the address.
    const mailto = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    if (submitEl) submitEl.disabled = true;
    setStatus('Отварям имейл за изпращане…', 'ok');

    // This will open the user's email app with a pre-filled message.
    window.location.href = mailto;

    setTimeout(() => {
      if (submitEl) submitEl.disabled = false;
    }, 1200);
  });
}
