(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navbar = document.getElementById('navbar');
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('nav-mobile');
  const mobileLinks = mob ? mob.querySelectorAll('a') : [];
  const heroCats = Array.from(document.querySelectorAll('.hero-cat'));
  const serviceTabs = Array.from(document.querySelectorAll('.svc-tab'));
  const servicePanels = Array.from(document.querySelectorAll('.svc-panel'));
  const servicesSection = document.getElementById('services');
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  const slides = Array.from(document.querySelectorAll('.test-slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('is-ready');
    });
  });

  function closeMobileNav() {
    if (!ham || !mob) return;
    ham.classList.remove('open');
    mob.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function toggleMobileNav() {
    if (!ham || !mob) return;
    const isOpen = ham.classList.toggle('open');
    mob.classList.toggle('open', isOpen);
    ham.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  }

  if (ham && mob) {
    ham.addEventListener('click', toggleMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));

    document.addEventListener('click', (event) => {
      if (!mob.classList.contains('open')) return;
      if (mob.contains(event.target) || ham.contains(event.target)) return;
      closeMobileNav();
    });
  }

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 32);
    }, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (event) => {
      const targetSelector = link.getAttribute('href');
      const target = document.querySelector(targetSelector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function setServiceState(tabId) {
    serviceTabs.forEach(tab => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    servicePanels.forEach(panel => {
      const isActive = panel.id === 'panel-' + tabId;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });

    heroCats.forEach(cat => {
      const isActive = cat.dataset.cat === tabId;
      cat.classList.toggle('active', isActive);
      cat.setAttribute('aria-pressed', String(isActive));
    });
  }

  if (serviceTabs.length > 0) {
    const initialTab = serviceTabs.find(tab => tab.classList.contains('active')) || serviceTabs[0];
    setServiceState(initialTab.dataset.tab);
  }

  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => setServiceState(tab.dataset.tab));
  });

  heroCats.forEach(cat => {
    cat.addEventListener('click', () => {
      setServiceState(cat.dataset.cat);
      if (!servicesSection) return;
      servicesSection.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  let currentSlide = 0;

  function goToSlide(nextIndex) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    dots[currentSlide].setAttribute('aria-current', 'false');

    currentSlide = (nextIndex + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-current', 'true');
  }

  if (slides.length > 0) {
    const prevBtn = document.getElementById('test-prev');
    const nextBtn = document.getElementById('test-next');

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
      nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(Number(dot.dataset.i)));
    });
  }

  let autoSlide = null;
  if (!reduceMotion && slides.length > 1) {
    autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5200);
    const slider = document.getElementById('test-slider');

    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
      slider.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5200);
      });
    }
  }

  function closeFaqItem(item) {
    const button = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    item.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0px';
  }

  function openFaqItem(item) {
    const button = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    item.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');

    if (item.classList.contains('open')) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = '0px';
    }

    button.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      faqItems.forEach(closeFaqItem);
      if (!wasOpen) openFaqItem(item);
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach(item => {
      if (!item.classList.contains('open')) return;
      const answer = item.querySelector('.faq-a');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  });

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -12% 0px' });

    revealItems.forEach(item => observer.observe(item));
  }

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(item => {
      item.addEventListener('pointermove', (event) => {
        const rect = item.getBoundingClientRect();
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        item.style.setProperty('--mx', offsetX.toFixed(2) + 'px');
        item.style.setProperty('--my', offsetY.toFixed(2) + 'px');
      });

      item.addEventListener('pointerleave', () => {
        item.style.setProperty('--mx', '0px');
        item.style.setProperty('--my', '0px');
      });
    });
  }

  if (!contactForm || !submitBtn) return;

  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const feedback = document.getElementById('form-feedback');
    const name = this.name.value.trim();
    const email = this.email.value.trim();

    if (!name || !email) {
      feedback.textContent = 'Моля, попълнете задължителните полета.';
      feedback.className = 'form-feedback error';
      return;
    }

    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-disabled', 'true');
    feedback.textContent = 'Изпращане...';
    feedback.className = 'form-feedback';

    try {
      const formData = new FormData(this);
      const response = await fetch(this.action, {
        method: this.method,
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      feedback.textContent = 'Благодаря. Ще се свържа с вас съвсем скоро.';
      feedback.className = 'form-feedback success';
      this.reset();
    } catch (error) {
      feedback.textContent = 'Изпращането не успя. Опитайте отново или пишете на teodorpavlovformal@gmail.com.';
      feedback.className = 'form-feedback error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-disabled');
    }
  });
})();
