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

/* ── SHARED TRANSFORM STATE — ML-003 + ML-004 compose here ── */
let _parallaxY  = 0;  // set by ML-004
let _tiltTransform = ''; // set by ML-003

function applyHeroBgTransform() {
  heroBg.style.transform = `translateY(${_parallaxY}px) ${_tiltTransform}`;
}

/* ML-004 · Scroll Parallax — translateY only, never touches X anchor */
if (heroBg && !reducedMotion) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      _parallaxY = y * 0.12;
      applyHeroBgTransform();
      heroContent.style.opacity = Math.max(0.4, 1 - (y / (window.innerHeight * 0.85)));
    }
  }, { passive: true });
}

/* ML-003 · Hover Tilt — desktop pointer follow, max ±3deg */
if (heroSection && heroBg && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
  let tiltActive = false;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    targetX = ((e.clientX - cx) / (rect.width  / 2)) * 3;
    targetY = ((e.clientY - cy) / (rect.height / 2)) * 1.5;
    if (!tiltActive) { tiltActive = true; animateTilt(); }
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
  }, { passive: true });

  function animateTilt() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    const settling = Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01;
    _tiltTransform = settling
      ? `rotate3d(${-currentY * 0.1}, ${currentX * 0.1}, 0, ${Math.sqrt(currentX**2 + currentY**2) * 0.4}deg)`
      : '';
    applyHeroBgTransform();
    if (settling) {
      requestAnimationFrame(animateTilt);
    } else {
      tiltActive = false;
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

/* ================================================================
   IMPLEMENTATION_008 — CURATED FRAME GALLERY MODAL
   Premium carousel lightbox for frame collection discovery.
   Touch/swipe · Keyboard nav · Focus trap · Accessible
================================================================ */

(function () {
  'use strict';

  /* ── Collection data ── */
  const COLLECTIONS = {
    rayban: {
      title: 'Ray-Ban Collection',
      folder: 'assets/images/curatedFrame/Ray-Ban_Collection/',
      prefix: 'rbframe',
      count: 10,
      ext: 'jpeg',
    },
    designer: {
      title: 'Designer Collection',
      folder: 'assets/images/curatedFrame/designercollection/',
      prefix: 'dcframe',
      count: 10,
      ext: 'jpeg',
    },
    look: {
      title: 'Look Is Everything',
      folder: 'assets/images/curatedFrame/looksiseverything/',
      prefix: 'lookframe',
      count: 10,
      ext: 'jpeg',
    },
    pediatric: {
      title: 'Pediatric Collection',
      folder: 'assets/images/curatedFrame/pediatriccollection/',
      prefix: 'pediaframe',
      count: 10,
      ext: 'jpeg',
    },
    sports: {
      title: 'Sports & Active',
      folder: 'assets/images/curatedFrame/sports&active/',
      prefix: 'sportsframe',
      count: 10,
      ext: 'jpeg',
    },
  };

  /* ── DOM references ── */
  const modal          = document.getElementById('frameModal');
  const backdrop       = document.getElementById('frameModalBackdrop');
  const closeBtn       = document.getElementById('frameModalClose');
  const modalTitle     = document.getElementById('frameModalTitle');
  const track          = document.getElementById('frameCarouselTrack');
  const prevBtn        = document.getElementById('frameCarouselPrev');
  const nextBtn        = document.getElementById('frameCarouselNext');
  const dotsContainer  = document.getElementById('frameCarouselDots');
  const counter        = document.getElementById('frameCarouselCounter');

  if (!modal) return; // guard

  /* ── State ── */
  let currentIndex  = 0;
  let totalSlides   = 0;
  let dots          = [];
  let lastFocused   = null; // element to return focus to on close
  let touchStartX   = 0;
  let touchStartY   = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Build slides for a collection ── */
  function buildSlides(key) {
    const col = COLLECTIONS[key];
    if (!col) return;

    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    dots = [];
    totalSlides = col.count;
    currentIndex = 0;

    modalTitle.textContent = col.title;

    for (let i = 1; i <= col.count; i++) {
      /* Slide */
      const slide = document.createElement('div');
      slide.className = 'frame-carousel-slide';
      slide.setAttribute('role', 'img');
      slide.setAttribute('aria-label', `${col.title} — frame ${i} of ${col.count}`);

      const img = document.createElement('img');
      img.src = `${col.folder}${col.prefix}${i}.${col.ext}`;
      img.alt = `${col.title} — frame ${i}`;
      img.loading = i === 1 ? 'eager' : 'lazy';
      img.decoding = 'async';

      slide.appendChild(img);
      track.appendChild(slide);

      /* Dot */
      const dot = document.createElement('button');
      dot.className = 'frame-carousel-dot' + (i === 1 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to frame ${i}`);
      dot.dataset.index = i - 1;
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }

    updateUI();
  }

  /* ── Navigation ── */
  function goTo(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;

    if (reducedMotion) {
      /* Instant switch — no transform animation */
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    updateUI();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function updateUI() {
    /* counter */
    counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    /* dots */
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
    /* arrow aria */
    prevBtn.setAttribute('aria-label', `Previous frame (${currentIndex === 0 ? totalSlides : currentIndex} of ${totalSlides})`);
    nextBtn.setAttribute('aria-label', `Next frame (${currentIndex === totalSlides - 1 ? 1 : currentIndex + 2} of ${totalSlides})`);
  }

  /* ── Open / Close ── */
  function openModal(key) {
    lastFocused = document.activeElement;
    buildSlides(key);
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    /* Focus close button after transition */
    setTimeout(() => closeBtn.focus(), 60);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    /* Return focus to triggering card */
    if (lastFocused) {
      setTimeout(() => lastFocused.focus(), 60);
    }
  }

  /* ── Focus trap ── */
  function trapFocus(e) {
    if (!modal.classList.contains('is-open')) return;
    const focusable = modal.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  /* ── Keyboard ── */
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape')       closeModal();
    if (e.key === 'ArrowRight')   next();
    if (e.key === 'ArrowLeft')    prev();
    trapFocus(e);
  });

  /* ── Touch / Swipe ── */
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    /* Only register horizontal swipes (>40px) that aren't scroll gestures */
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  }, { passive: true });

  /* ── Event bindings ── */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  /* Frame card clicks */
  document.querySelectorAll('.frame-card[data-collection]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.collection));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.collection);
      }
    });
  });

  console.log('%c IMPLEMENTATION_008 · Frame Gallery Modal loaded', 'color: #B8924A; font-size: 11px;');

})();
