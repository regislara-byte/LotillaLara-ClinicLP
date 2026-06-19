/* ================================================================
   LOTILLA-LARA OPTICAL CLINIC — LL-OPTICALV2
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

window.toggleMenu = function (hamburger) {
  const open = navMobile.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
};

window.closeMenu = function () {
  navMobile.classList.remove('open');
  document.body.style.overflow = '';
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
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
   3. IMPLEMENTATION_007 MOTION SYSTEM
   ML-003 · Hover Tilt (desktop only)
   ML-004 · Scroll Parallax
──────────────────────────────────────────────────────────────── */
const heroBg    = document.querySelector('.hero-bg');
const heroSection = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ML-004 · Scroll Parallax — translates hero-bg on scroll for depth */
if (heroBg && !reducedMotion) {
  let bobBase = 0; // track CSS animation offset separately via scroll only
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      /* Parallax shift — gentle 0.15 factor, no bob interference */
      heroBg.style.backgroundPositionY = `calc(center + ${y * 0.15}px)`;
      heroContent.style.opacity = Math.max(0.4, 1 - (y / (window.innerHeight * 0.85)));
    }
  }, { passive: true });
}

/* ML-003 · Hover Tilt — desktop pointer follow, max ±3deg */
if (heroSection && heroBg && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
  let tiltActive = false;
  let rafId = null;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    /* Normalise to -1 → +1 */
    targetX = ((e.clientX - cx) / (rect.width  / 2)) * 3;  /* max 3deg */
    targetY = ((e.clientY - cy) / (rect.height / 2)) * 1.5; /* max 1.5deg */
    if (!tiltActive) {
      tiltActive = true;
      animateTilt();
    }
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  }, { passive: true });

  function animateTilt() {
    /* Lerp for smooth easing */
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    heroBg.style.transform = `rotate3d(${-currentY * 0.1}, ${currentX * 0.1}, 0, ${Math.sqrt(currentX**2 + currentY**2) * 0.4}deg)`;
    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      rafId = requestAnimationFrame(animateTilt);
    } else {
      tiltActive = false;
      heroBg.style.transform = '';
    }
  }
}


/* ────────────────────────────────────────────────────────────────
   4. INTERSECTION OBSERVER — reveal on scroll
──────────────────────────────────────────────────────────────── */
const revealSelectors = [
  '.service-card',
  '.frame-card',
  '.journey-step',
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
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Journey steps stagger
document.querySelectorAll('.journey-step').forEach((step, i) => {
  step.style.transitionDelay = `${i * 100}ms`;
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
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    // Close mobile menu if open
    if (navMobile.classList.contains('open')) {
      closeMenu();
    }
  });
});


/* ────────────────────────────────────────────────────────────────
   7. BOOKING FORM — Validation + mailto (IMPLEMENTATION_004)
──────────────────────────────────────────────────────────────── */
window.submitBookingForm = function () {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const reason = document.getElementById('reason').value;
  const preferredDate = document.getElementById('preferred-date').value;
  const message = document.getElementById('message').value.trim();

  // Basic validation
  let isValid = true;

  if (!name) {
    highlightField('name');
    isValid = false;
  }
  if (!phone) {
    highlightField('phone');
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // Build mailto body
  let body = `Appointment Request from Lotilla-Lara Optical Clinic Website\n\n`;
  body += `Full Name: ${name}\n`;
  body += `Contact Number: ${phone}\n`;
  if (reason) body += `Reason for Visit: ${reason}\n`;
  if (preferredDate) body += `Preferred Date: ${preferredDate}\n`;
  if (message) body += `Additional Notes:\n${message}\n`;

  body += `\n---\nSent via website booking form.`;

  const email = 'laraeldie1956@gmail.com';
  const subject = encodeURIComponent(`Appointment Request - ${name}`);
  const encodedBody = encodeURIComponent(body);

  // Open mail client
  window.location.href = `mailto:${email}?subject=${subject}&body=${encodedBody}`;

  // Show success feedback
  const form = document.getElementById('bookingForm');
  const originalHTML = form.innerHTML;
  form.innerHTML = `
    <div class="form-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A2E4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px"><polyline points="20 6 9 17 4 12"/></svg>
      <h4>Request Sent!</h4>
      <p>Thank you, ${name.split(' ')[0] || name}. Dr. Lara will confirm your appointment shortly.</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">Back to Form</button>
    </div>
  `;

  // Auto refresh fallback
  setTimeout(() => {
    if (form.querySelector('.form-success')) {
      location.reload();
    }
  }, 8000);
};

function highlightField(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.classList.add('error');
  input.focus();
  const removeError = () => input.classList.remove('error');
  input.addEventListener('input', removeError, { once: true });
  input.addEventListener('blur', removeError, { once: true });
}


/* ────────────────────────────────────────────────────────────────
   8. INIT LOG
──────────────────────────────────────────────────────────────── */
console.log(
  '%c LOTILLA-LARA OPTICAL ',
  'background: #1A2E4A; color: #fff; font-size: 13px; padding: 5px 12px; border-radius: 4px; font-family: monospace; letter-spacing: 0.1em;'
);
console.log('%c Optical Clinic · Dr. Elsie L. Lara · script.js loaded', 'color: #B8924A; font-size: 11px;');

// Google Apps Script preparation (future implementation)
// Replace mailto with fetch to GAS endpoint when ready