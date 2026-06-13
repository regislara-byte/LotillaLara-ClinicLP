/* ================================================================
   KROSBUD — Budownictwo Keramzytowe
   script.js · Interaction Layer
================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   1. SCROLL PROGRESS BAR
──────────────────────────────────────────────────────────────── */
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollTop / docHeight * 100) + '%';
}, { passive: true });


/* ────────────────────────────────────────────────────────────────
   2. NAV — scroll state + mobile toggle
──────────────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 60);
}, { passive: true });

window.toggleMenu = function () {
  const open = navMobile.classList.toggle('open');
  document.body.style.overflow = open ? 'hidden' : '';
};

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navMobile.classList.contains('open')) {
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  }
}, { passive: true });

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });


/* ────────────────────────────────────────────────────────────────
   3. HERO PARALLAX (subtle)
──────────────────────────────────────────────────────────────── */
const heroImg = document.querySelector('.hero-img');
const heroContent = document.querySelector('.hero-content');

if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = `translateY(${y * 0.3}px)`;
      heroContent.style.opacity = 1 - (y / (window.innerHeight * 0.8));
    }
  }, { passive: true });
}


/* ────────────────────────────────────────────────────────────────
   4. INTERSECTION OBSERVER — reveal on scroll
──────────────────────────────────────────────────────────────── */
const revealSelectors = [
  '.tech-card',
  '.service-item',
  '.process-step',
  '.gallery-card',
  '.about-fact',
  '.about-badge',
  '.section-title',
  '.section-intro',
];

const revealEls = document.querySelectorAll(revealSelectors.join(', '));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

// Stagger siblings of the same class
function staggerGroup(selector, delayStep = 80) {
  const els = document.querySelectorAll(selector);
  els.forEach((el, i) => {
    el.style.transitionDelay = `${i * delayStep}ms`;
  });
}

staggerGroup('.tech-card', 70);
staggerGroup('.service-item', 60);
staggerGroup('.process-step', 55);
staggerGroup('.gallery-card', 65);

revealEls.forEach(el => revealObserver.observe(el));

// Also reveal about-fact and about-badge with stagger
document.querySelectorAll('.about-fact, .about-badge').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
  revealObserver.observe(el);
});


/* ────────────────────────────────────────────────────────────────
   5. COUNTER ANIMATION — trust bar numbers
──────────────────────────────────────────────────────────────── */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutCubic(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterEls = document.querySelectorAll('.trust-number[data-target]');
let countersStarted = false;

const trustBar = document.querySelector('.trust-bar');
if (trustBar) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      counterEls.forEach((el, i) => {
        setTimeout(() => animateCounter(el), i * 120);
      });
    }
  }, { threshold: 0.4 }).observe(trustBar);
}


/* ────────────────────────────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLL with nav offset
──────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    // Close mobile menu if open
    if (navMobile.classList.contains('open')) {
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});


/* ────────────────────────────────────────────────────────────────
   7. GALLERY — image error fallbacks with placeholder text
──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.gallery-card img').forEach((img, i) => {
  const labels = [
    'Dom jednorodzinny · 2021',
    'Parter + poddasze · 2020',
    'Dom z garażem · 2022',
    'Stan surowy zamknięty · 2023',
    'Dom parterowy · 2019',
    'Budynek inwentarski · 2018',
  ];
  img.addEventListener('error', () => {
    const card = img.closest('.gallery-card');
    if (card) {
      card.dataset.label = labels[i] || 'Realizacja KROSBUD';
    }
  });
});


/* ────────────────────────────────────────────────────────────────
   8. QUOTE FORM SUBMIT
──────────────────────────────────────────────────────────────── */
window.submitQuoteForm = function () {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !phone) {
    // Simple inline validation
    if (!name) highlightField('name');
    if (!phone) highlightField('phone');
    return;
  }

  // In production: POST to backend / email service
  // For now: show success state
  const form = document.querySelector('.quote-form');
  form.innerHTML = `
    <div class="form-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px"><polyline points="20 6 9 17 4 12"/></svg>
      <h4>Zapytanie wysłane!</h4>
      <p>Dziękujemy, ${name}. Skontaktujemy się pod numer ${phone} w ciągu 24 godzin.</p>
    </div>
  `;
};

function highlightField(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.style.borderColor = '#C8780A';
  input.focus();
  input.addEventListener('input', () => {
    input.style.borderColor = '';
  }, { once: true });
}


/* ────────────────────────────────────────────────────────────────
   9. SECTION TITLE REVEAL — add initial hidden state via JS
      (avoids FOUC if CSS loads late)
──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.section-title, .section-intro').forEach(el => {
  if (!el.classList.contains('visible')) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  }
});

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
      titleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section-title, .section-intro').forEach(el => {
  titleObserver.observe(el);
});


/* ────────────────────────────────────────────────────────────────
   10. SERVICE ITEMS — hover line accent on desktop
──────────────────────────────────────────────────────────────── */
if (window.innerWidth > 768) {
  document.querySelectorAll('.service-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.querySelector('.service-num').style.color = 'var(--steel)';
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('.service-num').style.color = 'var(--amber)';
    });
  });
}


/* ────────────────────────────────────────────────────────────────
   11. INIT LOG
──────────────────────────────────────────────────────────────── */
console.log(
  '%c KROSBUD ',
  'background: #1A3A5C; color: #fff; font-size: 13px; padding: 5px 12px; border-radius: 4px; font-family: monospace; letter-spacing: 0.1em;'
);
console.log('%c Budownictwo keramzytowe · od 2008 · script.js loaded', 'color: #C8780A; font-size: 11px;');
