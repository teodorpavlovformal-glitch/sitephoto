import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const serviceTabs = {
  re: {
    label: "Недвижими имоти",
    lead: null,
    cards: [
      {
        name: "Базов",
        price: "150 EUR",
        suffix: "/ имот",
        popular: false,
        desc: null,
        items: [
          "До 20 финални снимки",
          "Стандартно ретуширане",
          "Web резолюция",
          "Доставка до 72 часа",
        ],
        ctaClass: "btn-ghost-sm",
      },
      {
        name: "Стандарт",
        price: "280 EUR",
        suffix: "/ имот",
        popular: true,
        desc: null,
        items: [
          "До 40 финални снимки",
          "HDR обработка",
          "Виртуална обиколка",
          "Print и web файлове",
          "Доставка до 48 часа",
        ],
        ctaClass: "btn-gold",
      },
      {
        name: "Премиум",
        price: "490 EUR",
        suffix: "/ имот",
        popular: false,
        desc: null,
        items: [
          "Неограничени снимки",
          "Дрон заснемане",
          "Видео обход 60 сек.",
          "Приоритетна доставка до 24 часа",
        ],
        ctaClass: "btn-ghost-sm",
      },
    ],
  },
  auto: {
    label: "Автомобили",
    lead: null,
    cards: [
      {
        name: "Студио",
        price: "50 EUR",
        suffix: "/ автомобил",
        popular: false,
        desc: null,
        items: ["10–15 студийни кадъра", "Бял или черен фон", "Базово ретуширане", "Web резолюция"],
        ctaClass: "btn-ghost-sm",
      },
      {
        name: "Локация",
        price: "70 EUR",
        suffix: "/ сесия",
        popular: true,
        desc: null,
        items: [
          "Заснемане на локация",
          "25+ финални кадъра",
          "Контекстни и детайлни кадри",
          "Пълен ретуш",
          "Print и web файлове",
        ],
        ctaClass: "btn-gold",
      },
      {
        name: "Рекламен",
        price: "100 EUR",
        suffix: "/ проект",
        popular: false,
        desc: null,
        items: [
          "Мулти-локация",
          "Видео и фото пакет",
          "Творческа режисура",
          "Лиценз за ползване включен",
        ],
        ctaClass: "btn-ghost-sm",
      },
    ],
  },
  prod: {
    label: "Продукти",
    lead: null,
    cards: [
      {
        name: "E-commerce",
        price: "40 EUR",
        suffix: "/ продукт",
        popular: false,
        desc: null,
        items: [
          "Бял фон",
          "5 ъгъла на заснемане",
          "Подготвено за marketplace платформи",
          "Доставка до 48 часа",
        ],
        ctaClass: "btn-ghost-sm",
      },
      {
        name: "Lifestyle",
        price: "50 EUR",
        suffix: "/ продукт",
        popular: true,
        desc: null,
        items: [
          "Контекстна среда",
          "10+ финални кадъра",
          "Пълен ретуш",
          "Формати за социални мрежи",
          "Print и web файлове",
        ],
        ctaClass: "btn-gold",
      },
      {
        name: "Каталог",
        price: "По договаряне",
        suffix: "",
        popular: false,
        desc: null,
        items: [
          "50+ продукта",
          "Batch обработка",
          "Голям обем за e-commerce",
          "Приоритетен график",
        ],
        ctaClass: "btn-ghost-sm",
      },
    ],
  },
  vid: {
    label: "Видеография",
    lead: {
      tag: "Видео формати",
      title: "Видео с ясна композиция и редакционен монтаж.",
      text: "От reels до по-дълги представяния: всяка продукция включва цветова корекция, лицензирана музика и доставки в готови за уеб и социални мрежи версии.",
    },
    cards: [
      {
        name: "Social Reel",
        price: "50 EUR",
        suffix: "/ видео",
        popular: false,
        desc: "Вертикален или квадратен формат, идеален за Instagram, Facebook и TikTok. Бързо заснемане и динамичен монтаж.",
        items: [
          "15–30 секунди готов клип",
          "9:16 и 1:1 формати",
          "Цветова корекция включена",
          "Лицензирана музика включена",
          "Доставка до 48 часа",
        ],
        ctaClass: "btn-ghost-sm",
      },
      {
        name: "Property / Product Tour",
        price: "50 EUR",
        suffix: "/ видео",
        popular: true,
        desc: "Пълноценна видео обиколка на имот или продуктова презентация, подходяща за сайт, реклама и имейл кампания.",
        items: [
          "60–90 секунди монтиран клип",
          "Широкоекранен формат 16:9",
          "Плавни движения и steady shots",
          "Надписи и брандиране",
          "MP4 и web-optimized версия",
        ],
        ctaClass: "btn-gold",
      },
      {
        name: "Cinematic Production",
        price: "По договаряне",
        suffix: "",
        popular: false,
        desc: "Пълна кинематографска продукция с дрон заснемане, творческа режисура и разширен монтаж за луксозни имоти и кампании.",
        items: [
          "2–4 минути финален клип",
          "Дрон аерозаснемане включено",
          "Мулти-ъглова камера",
          "Пълен цветови грейдинг",
          "Авторски саундтрак или voice-over",
          "Raw файлове по договаряне",
        ],
        ctaClass: "btn-ghost-sm",
      },
    ],
  },
};

const testimonials = [
  {
    quote:
      "„Работихме с Теодор за цялото ни портфолио от луксозни апартаменти. Резултатите превишиха очакванията — имотите се реализираха по-бързо след публикуване.“",
    cite: "Мария Иванова",
    role: "Управител, Sofia Estates Premium",
  },
  {
    quote:
      "„Видеото на нашия showroom увеличи запитванията осезаемо още в първия месец. Монтажът е кинематографски, а не просто рекламен клип.“",
    cite: "Георги Петров",
    role: "Директор продажби, AutoBG Sofia",
  },
  {
    quote:
      "„Продуктовото ни портфолио се трансформира изцяло. Онлайн продажбите се засилиха след новите снимки и reels формати.“",
    cite: "Елена Стоева",
    role: "Основател, DesignCraft Studio",
  },
];

const faqs = [
  {
    q: "Колко бързо получавам материалите?",
    a: "Стандартната доставка е 48–72 часа след сесията. При Премиум пакет — до 24 часа. Видео материалите се доставят до 5 работни дни. Всички файлове пристигат чрез защитена облачна връзка.",
  },
  {
    q: "Работите ли извън София?",
    a: "Да, покривам цяла България. Командировъчните разходи се уточняват предварително за локации извън 30 км от центъра на София.",
  },
  {
    q: "Включено ли е ретуширането?",
    a: "Да — базово ретуширане е включено във всички пакети. Разширен ретуш, обектно премахване и композитни изображения се договарят допълнително.",
  },
  {
    q: "Как работи видеографията?",
    a: "Заснемането отнема 1–2 часа според пакета. Монтажът е включен и получавате готов клип с цветова корекция и лицензирана музика. За Cinematic пакет правим кратка предподготовка с ясна творческа посока.",
  },
  {
    q: "Как се осъществява плащането?",
    a: "50% депозит при потвърждение на сесията, останалото — при доставка. Приемам банков превод и карта. Издавам фактура при поискване.",
  },
  {
    q: "Мога ли да отменя или преместя сесията?",
    a: "Отмяна или преместване с повече от 48 часа предизвестие е без такса. При по-кратко предизвестие депозитът не се възстановява, но може да се прехвърли към бъдеща дата.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function SvgIcon({ type }) {
  if (type === "re") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 10.5 12 4l8.5 6.5" />
        <path d="M5.5 9.8V20h13V9.8" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    );
  }
  if (type === "auto") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 15.5 6.7 10h10.6l1.7 5.5" />
        <path d="M4 15.5h16" />
        <path d="M6.5 18.5h0" />
        <path d="M17.5 18.5h0" />
        <path d="M5.5 15.5V19" />
        <path d="M18.5 15.5V19" />
        <path d="M7.5 10 9 7.8h6L16.5 10" />
      </svg>
    );
  }
  if (type === "prod") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3.8 7 4.1v8.2l-7 4.1-7-4.1V7.9l7-4.1Z" />
        <path d="M12 12 5 7.9" />
        <path d="M12 12v8.2" />
        <path d="M19 7.9 12 12" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="6" width="12.5" height="12" rx="2" />
      <path d="m16 10.2 4.5-2.7v9L16 13.8" />
      <path d="M8.5 10.5v3" />
    </svg>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeService, setActiveService] = useState("re");
  const [activeHeroCat, setActiveHeroCat] = useState("re");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [formStatus, setFormStatus] = useState("");
  const [formStatusTone, setFormStatusTone] = useState("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const activeServiceData = useMemo(() => serviceTabs[activeService], [activeService]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", mobileOpen);
    return () => document.body.classList.remove("nav-open");
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const closeOnOutsideClick = (event) => {
      const navbar = document.getElementById("navbar");
      if (!navbar?.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const closeOnHashChange = () => setMobileOpen(false);

    window.addEventListener("hashchange", closeOnHashChange);
    return () => window.removeEventListener("hashchange", closeOnHashChange);
  }, []);

  useEffect(() => {
    const navMobile = document.getElementById("nav-mobile");
    if (!navMobile) {
      return undefined;
    }

    const closeOnMobileLinkClick = (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        setMobileOpen(false);
      }
    };

    navMobile.addEventListener("click", closeOnMobileLinkClick);
    return () => navMobile.removeEventListener("click", closeOnMobileLinkClick);
  }, []);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    if (revealItems.length === 0) {
      return undefined;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      for (const item of revealItems) {
        item.classList.add("is-visible");
      }
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    for (const item of revealItems) {
      observer.observe(item);
    }
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) {
      return undefined;
    }

    const magneticItems = Array.from(document.querySelectorAll(".magnetic"));
    const cleanups = magneticItems.map((item) => {
      const onPointerMove = (event) => {
        const rect = item.getBoundingClientRect();
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        item.style.setProperty("--mx", `${offsetX.toFixed(2)}px`);
        item.style.setProperty("--my", `${offsetY.toFixed(2)}px`);
      };

      const resetPosition = () => {
        item.style.setProperty("--mx", "0px");
        item.style.setProperty("--my", "0px");
      };

      item.addEventListener("pointermove", onPointerMove);
      item.addEventListener("pointerleave", resetPosition);

      return () => {
        item.removeEventListener("pointermove", onPointerMove);
        item.removeEventListener("pointerleave", resetPosition);
        resetPosition();
      };
    });

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || testimonialPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion, testimonialPaused]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!form.checkValidity()) {
      form.reportValidity();
      form.querySelector(":invalid")?.focus();
      setFormStatusTone("error");
      setFormStatus("Моля, попълнете името, имейла и кратко описание на проекта.");
      return;
    }

    setIsSubmitting(true);
    setFormStatus("");
    setFormStatusTone("idle");

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        setFormStatusTone("success");
        setFormStatus("Благодаря. Запитването е изпратено успешно и ще се свържа с вас скоро.");
      } else {
        setFormStatusTone("error");
        setFormStatus("Имаше проблем при изпращането. Моля, опитайте отново.");
      }
    } catch {
      setFormStatusTone("error");
      setFormStatus("Имаше проблем при изпращането. Моля, опитайте отново.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header id="navbar" className={isScrolled ? "scrolled" : ""}>
        <div className="nav-shell">
          <a href="#hero" className="nav-brand" aria-label="Pavlov Photography">
            <span className="sr-only">Pavlov Photography</span>
            <span className="brand-lockup" aria-hidden="true">
              <span className="brand-wordmark">
                <span className="brand-leading">Pavl</span>
                <span className="brand-aperture" />
                <span className="brand-trailing">v</span>
              </span>
              <span className="brand-sub">Photography</span>
            </span>
          </a>

          <nav className="nav-links" aria-label="Основна навигация">
            <a href="#portfolio">Портфолио</a>
            <a href="#services">Услуги</a>
            <a href="#testimonials">Отзиви</a>
            <a href="#faq">Въпроси</a>
            <a href="#contact">Контакт</a>
          </nav>

          <a href="#contact" className="btn-ghost-sm magnetic nav-cta">
            Запитване
          </a>

          <button
            id="hamburger"
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            type="button"
            aria-label="Меню"
            aria-controls="nav-mobile"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`nav-mobile ${mobileOpen ? "open" : ""}`} id="nav-mobile">
          <a href="#portfolio">Портфолио</a>
          <a href="#services">Услуги</a>
          <a href="#testimonials">Отзиви</a>
          <a href="#faq">Въпроси</a>
          <a href="#contact">Контакт</a>
        </div>
      </header>

      <main>
        <section id="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orb" aria-hidden="true" />
          <div className="hero-linework" aria-hidden="true" />

          <div className="container hero-layout">
            <div className="hero-copy">
              <motion.p
                className="eyebrow"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                Теодор Павлов · фотограф
              </motion.p>

              <motion.h1
                className="hero-title"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <span className="hero-line">Кадри за</span>
                <span className="hero-line hero-line-accent">брандове</span>
                <span className="hero-line">и пространства</span>
                <span className="hero-line">с ясно присъствие.</span>
              </motion.h1>

              <motion.p
                className="hero-sub"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                Търговска фотография и видеография за недвижими имоти, автомобили, продукти и
                кампании, които трябва да изглеждат премерено, модерно и готово за продажба.
              </motion.p>

              <motion.div
                className="hero-ctas"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <a href="#services" className="btn-gold magnetic">
                  Виж пакетите
                </a>
                <a href="#contact" className="btn-ghost magnetic">
                  Заяви проект
                </a>
              </motion.div>

              <motion.div
                className="hero-stats"
                aria-label="Ключови показатели"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <div className="hero-stat">
                  <strong>40+</strong>
                  <span>завършени проекта</span>
                </div>
                <div className="hero-stat">
                  <strong>48ч</strong>
                  <span>средна доставка</span>
                </div>
                <div className="hero-stat">
                  <strong>4</strong>
                  <span>категории</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hero-side"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="hero-cards">
                {[
                  ["re", "Недвижими имоти", "Листинги, интериори и видео обиколки", "Виж пакетите"],
                  ["auto", "Автомобили", "Студио, локация и рекламен кадър", "Отвори цените"],
                  [
                    "prod",
                    "Продукти",
                    "E-commerce, lifestyle и каталожни серии",
                    "Разгледай пакетите",
                  ],
                  ["vid", "Видеография", "Reels, турове и бранд видеа", "Към видео пакетите"],
                ].map(([key, label, note, link]) => (
                  <button
                    key={key}
                    type="button"
                    className={`hero-cat ${key === "re" ? "hero-cat-featured" : ""} ${activeHeroCat === key ? "active" : ""}`}
                    aria-pressed={activeHeroCat === key}
                    onClick={() => {
                      setActiveHeroCat(key);
                      setActiveService(key);
                      document.getElementById("services")?.scrollIntoView({
                        behavior: prefersReducedMotion ? "auto" : "smooth",
                      });
                    }}
                  >
                    <span
                      className={`hero-card-icon ${key === "auto" ? "hero-card-icon-auto" : ""}`}
                      aria-hidden="true"
                    >
                      <SvgIcon type={key} />
                    </span>
                    <span className="cat-label">{label}</span>
                    <span className="cat-note">{note}</span>
                    <span className="cat-link">{link}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="portfolio" className="section">
          <div className="container section-head solo-head">
            <div>
              <p className="section-tag">Портфолио</p>
              <h2 className="section-title">
                Серии, които оставят <em>следа</em>.
              </h2>
            </div>
          </div>

          <div className="container portfolio-grid">
            <article className="portfolio-card portfolio-card-featured reveal">
              <div className="portfolio-media portfolio-estate">
                <span className="portfolio-badge">Недвижими имоти</span>
                <span className="portfolio-meta">48 ч / готов листинг</span>
              </div>
              <div className="portfolio-body">
                <p className="portfolio-kicker">Акцентен проект</p>
                <h3>Skyline Residence Collection</h3>
                <p>
                  Редакционен подход за премиум апартаменти: широки композиции, контролирани
                  отблясъци и ритъм между общи и детайлни кадри.
                </p>
                <div className="portfolio-callout">
                  40+ финални снимки, видео обход и подготвени web версии
                </div>
                <a href="#services" className="portfolio-link">
                  Виж пакетите
                </a>
              </div>
            </article>

            <div className="portfolio-stack">
              <article className="portfolio-card reveal">
                <div className="portfolio-media portfolio-auto">
                  <span className="portfolio-badge">Автомобили</span>
                  <span className="portfolio-meta">Премиерна серия / 16:9</span>
                </div>
                <div className="portfolio-body">
                  <p className="portfolio-kicker">Кампанийна серия</p>
                  <h3>Midnight GT Editorial</h3>
                  <p>
                    Локационна сесия с контрастни повърхности, детайлни close-ups и динамични hero
                    кадри за showroom и кампания.
                  </p>
                  <div className="portfolio-callout">
                    25+ hero кадъра и подготвени рекламни формати
                  </div>
                  <a href="#contact" className="portfolio-link">
                    Заяви автомобилна сесия
                  </a>
                </div>
              </article>

              <article className="portfolio-card reveal reveal-delay">
                <div className="portfolio-media portfolio-product">
                  <span className="portfolio-badge">Продукти</span>
                  <span className="portfolio-meta">Студио / социален пакет</span>
                </div>
                <div className="portfolio-body">
                  <p className="portfolio-kicker">Търговска серия</p>
                  <h3>Atelier Objects Drop</h3>
                  <p>
                    Чисти студийни изображения и lifestyle композиции, подредени така, че каталогът
                    и социалните мрежи да говорят на един език.
                  </p>
                  <div className="portfolio-callout">
                    E-commerce и social-ready сет в една продукция
                  </div>
                  <a href="#services" className="portfolio-link">
                    Разгледай продуктовите услуги
                  </a>
                </div>
              </article>

              <article className="portfolio-card reveal reveal-delay-2">
                <div className="portfolio-media portfolio-video">
                  <span className="portfolio-badge">Видеография</span>
                  <span className="portfolio-meta">9:16 / 16:9 master файлове</span>
                </div>
                <div className="portfolio-body">
                  <p className="portfolio-kicker">Видео серия</p>
                  <h3>Social Film Capsules</h3>
                  <p>
                    Кратки видеа с плавен монтаж, текстови акценти и ритъм, пригоден за reels,
                    реклами и лендинг страници.
                  </p>
                  <div className="portfolio-callout">
                    Един shoot, няколко формата, готови за публикуване
                  </div>
                  <a href="#contact" className="portfolio-link">
                    Планирай видео проект
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container section-head solo-head">
            <div>
              <p className="section-tag">Услуги</p>
              <h2 className="section-title">
                Пакети с ясен <em>ритъм</em> и обхват.
              </h2>
            </div>
          </div>

          <div className="container services-shell">
            <div className="svc-tabs" role="tablist" aria-label="Категории услуги">
              {Object.entries(serviceTabs).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  id={`tab-${key}`}
                  className={`svc-tab ${activeService === key ? "active" : ""}`}
                  role="tab"
                  aria-selected={activeService === key}
                  aria-controls={`panel-${key}`}
                  onClick={() => setActiveService(key)}
                >
                  {value.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeService}
                className="svc-panel active"
                id={`panel-${activeService}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeService}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                {activeServiceData.lead && (
                  <div className="svc-lead">
                    <p className="svc-lead-tag">{activeServiceData.lead.tag}</p>
                    <h3>{activeServiceData.lead.title}</h3>
                    <p>{activeServiceData.lead.text}</p>
                  </div>
                )}

                {activeServiceData.cards.map((card) => (
                  <article key={card.name} className={`svc-card ${card.popular ? "popular" : ""}`}>
                    {card.popular && <span className="pop-badge">Най-популярен</span>}
                    <h3 className="svc-name">{card.name}</h3>
                    <p className="svc-price">
                      {card.price} {card.suffix ? <span>{card.suffix}</span> : null}
                    </p>
                    {card.desc ? <p className="svc-desc">{card.desc}</p> : null}
                    <ul className="svc-list">
                      {card.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <a href="#contact" className={`${card.ctaClass} magnetic`}>
                      Запитване
                    </a>
                  </article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section id="terms" className="section section-alt">
          <div className="container section-head solo-head">
            <div>
              <p className="section-tag">Процес</p>
              <h2 className="section-title">
                Ясен метод, кратки <em>срокове</em>.
              </h2>
            </div>
          </div>

          <div className="container terms-grid">
            {[
              [
                "01",
                "Резервация",
                "50% депозит при потвърждение на сесията. Датата се фиксира след получаването му.",
              ],
              [
                "02",
                "Доставка",
                "48–72 часа за стандартни пакети. До 24 часа при Премиум. Видеата се доставят до 5 работни дни.",
              ],
              [
                "03",
                "Ретуш",
                "Базово ретуширане е включено. Разширени корекции и обектно премахване се договарят допълнително.",
              ],
              [
                "04",
                "Файлове",
                "Доставка чрез защитена облачна връзка. Висока резолюция плюс web-оптимизирани версии за бърза публикация.",
              ],
              [
                "05",
                "Права",
                "Клиентът получава пълни права за търговска употреба. Авторът запазва право на публикуване в портфолио.",
              ],
              [
                "06",
                "Локация",
                "Покривам цяла България. Командировъчните за локации извън 30 км от София се уточняват предварително.",
              ],
            ].map(([num, title, text], idx) => (
              <article
                key={num}
                className={`term-card reveal ${idx % 3 === 1 ? "reveal-delay" : idx % 3 === 2 ? "reveal-delay-2" : ""}`}
              >
                <span className="term-number">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="section">
          <div className="container section-head">
            <div>
              <p className="section-tag">Отзиви</p>
              <h2 className="section-title">
                Как звучи работата <em>отвъд</em> кадъра.
              </h2>
            </div>
            <p className="section-copy">
              Бързина, спокойна комуникация и визуали, които влизат в реална употреба веднага след
              доставката.
            </p>
          </div>

          <div className="container">
            <div
              className="testimonial-featured reveal"
              onMouseEnter={() => setTestimonialPaused(true)}
              onMouseLeave={() => setTestimonialPaused(false)}
              onFocusCapture={() => setTestimonialPaused(true)}
              onBlurCapture={() => setTestimonialPaused(false)}
            >
              <p className="testimonial-kicker">Избрани думи от клиенти</p>

              <div className="test-quotes-wrap" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    className="test-slide active"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.25 }}
                  >
                    <blockquote>
                      <p>{testimonials[activeTestimonial].quote}</p>
                      <footer>
                        <cite>{testimonials[activeTestimonial].cite}</cite>{" "}
                        <span>{testimonials[activeTestimonial].role}</span>
                      </footer>
                    </blockquote>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="test-controls">
                <button
                  type="button"
                  className="test-btn"
                  aria-label="Предишен отзив"
                  onClick={prevTestimonial}
                >
                  ←
                </button>
                <div className="test-dots">
                  {testimonials.map((testimonial, i) => (
                    <button
                      key={testimonial.cite}
                      type="button"
                      className={`dot ${activeTestimonial === i ? "active" : ""}`}
                      aria-label={`Отзив ${i + 1}`}
                      aria-current={activeTestimonial === i}
                      onClick={() => setActiveTestimonial(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="test-btn"
                  aria-label="Следващ отзив"
                  onClick={nextTestimonial}
                >
                  →
                </button>
              </div>
            </div>

            <div className="test-mini-grid reveal reveal-delay">
              <article className="test-mini">
                <p>„Перфектни снимки за нашия showroom. Бързо, професионално и без компромиси.“</p>
                <span>AutoBG Sofia</span>
              </article>
              <article className="test-mini">
                <p>
                  „Доставката в рамките на 48 часа е реално предимство за нашия темп на работа.“
                </p>
                <span>ImmoMax Group</span>
              </article>
              <article className="test-mini">
                <p>„Social reels от последната сесия генерираха над 20 000 органични импресии.“</p>
                <span>MODO Furniture</span>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="section section-alt">
          <div className="container faq-shell">
            <div className="faq-intro">
              <p className="section-tag">FAQ</p>
              <h2 className="section-title faq-title">
                Кратко и <em>директно</em>.
              </h2>
              <p>
                Отговорите по-долу покриват най-честите въпроси около срокове, плащане, локации и
                начина, по който работя по фото и видео продукции.
              </p>
            </div>

            <div className="faq-list reveal">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="faq-q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${idx + 1}`}
                      onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    >
                      {faq.q} <span className="faq-ico">+</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-a-${idx + 1}`}
                          className="faq-a"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <p>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container contact-shell">
            <div className="contact-copy reveal">
              <p className="section-tag">Контакт</p>
              <h2 className="section-title contact-title">
                Нека построим следващата <em>серия</em>.
              </h2>
              <p className="contact-lead">
                Изпратете кратък brief, желан формат и ориентировъчна дата. Ще върна отговор с ясно
                предложение и следващи стъпки.
              </p>

              <div className="contact-badges">
                <span>Отговор до 2 работни часа</span>
                <span>София + проекти в страната</span>
                <span>Фото и видео в една продукция</span>
              </div>

              <ul className="contact-details">
                <li>
                  <small>Имейл</small>
                  <a href="mailto:teodorpavlovformal@gmail.com?subject=%D0%97%D0%B0%D0%BF%D0%B8%D1%82%D0%B2%D0%B0%D0%BD%D0%B5%20%D0%B7%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82">
                    teodorpavlovformal@gmail.com
                  </a>
                </li>
                <li>
                  <small>Телефон</small>
                  <a href="tel:+359889755406">+359 889 755 406</a>
                </li>
                <li>
                  <small>Локация</small>
                  <span>София, България</span>
                </li>
              </ul>
            </div>

            <form
              className="contact-form reveal reveal-delay"
              id="contact-form"
              action="https://formspree.io/f/mnjoooke"
              method="POST"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fname">Вашето име</label>
                  <input
                    type="text"
                    id="fname"
                    name="name"
                    placeholder="Име и компания"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="femail">Имейл адрес</label>
                  <input
                    type="email"
                    id="femail"
                    name="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="fservice">Вид услуга</label>
                <select id="fservice" name="service" defaultValue="">
                  <option value="">Изберете направление</option>
                  <option>Недвижими имоти — Базов</option>
                  <option>Недвижими имоти — Стандарт</option>
                  <option>Недвижими имоти — Премиум</option>
                  <option>Автомобили — Студио</option>
                  <option>Автомобили — Локация</option>
                  <option>Автомобили — Рекламен</option>
                  <option>Продукти — E-commerce</option>
                  <option>Продукти — Lifestyle</option>
                  <option>Продукти — Каталог</option>
                  <option>Видеография — Social Reel</option>
                  <option>Видеография — Property / Product Tour</option>
                  <option>Видеография — Cinematic Production</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="fdate">Предпочитана дата / период</label>
                <input
                  type="text"
                  id="fdate"
                  name="date"
                  placeholder="Пример: следващата седмица / 12 май"
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label htmlFor="fmsg">Детайли за проекта</label>
                <textarea
                  id="fmsg"
                  name="message"
                  rows="5"
                  placeholder="Какво снимаме, какъв е форматът и какви кадри са приоритет?"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gold magnetic btn-full"
                id="contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Изпращане..." : "Изпрати запитване"}
              </button>
              <output
                className={`form-feedback ${formStatusTone !== "idle" ? formStatusTone : ""}`}
                id="form-feedback"
                aria-live="polite"
              >
                {formStatus}
              </output>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-cta">
          <div className="container footer-cta-inner">
            <div>
              <p className="section-tag">Следваща стъпка</p>
              <h2>
                Готови за кадри, които работят и <em>след публикуване</em>?
              </h2>
            </div>
            <a href="#contact" className="btn-gold magnetic">
              Започни разговор
            </a>
          </div>
        </div>

        <div className="footer-bar">
          <div className="container footer-bar-inner">
            <a href="#hero" className="footer-logo" aria-label="Pavlov Photography">
              <span className="sr-only">Pavlov Photography</span>
              <span className="brand-lockup brand-lockup-footer" aria-hidden="true">
                <span className="brand-wordmark">
                  <span className="brand-leading">Pavl</span>
                  <span className="brand-aperture" />
                  <span className="brand-trailing">v</span>
                </span>
                <span className="brand-sub">Photography</span>
              </span>
            </a>

            <p className="footer-copy">
              © {currentYear} Pavlov Photography. Всички права запазени.
            </p>

            <nav className="footer-links" aria-label="Навигация във footer">
              <a href="#portfolio">Портфолио</a>
              <a href="#services">Услуги</a>
              <a href="#contact">Контакт</a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
