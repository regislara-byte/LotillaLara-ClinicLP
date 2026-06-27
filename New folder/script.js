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
   7. BOOKING FORM — Validation + GAS Submission (IMPLEMENTATION_009)
   Submits to Google Apps Script Web App → writes to Google Sheets
   → triggers Google Chat alert → fallback mailto if GAS unavailable
──────────────────────────────────────────────────────────────── */

/* ── IMPORTANT: Replace this URL after deploying gas_e009.gs ──
   Apps Script → Deploy → New deployment → Web App → Anyone
   Paste the /exec URL below.                                     */
const GAS_ENDPOINT = 'YOUR_GAS_ENDPOINT_URL_HERE';

window.submitBookingForm = function () {
  const name          = document.getElementById('name').value.trim();
  const phone         = document.getElementById('phone').value.trim();
  const reason        = document.getElementById('reason').value;
  const preferredDate = document.getElementById('preferred-date').value;
  const message       = document.getElementById('message').value.trim();

  let isValid = true;
  if (!name)  { highlightField('name');  isValid = false; }
  if (!phone) { highlightField('phone'); isValid = false; }
  if (!isValid) return;

  const submitBtn = document.querySelector('#bookingForm .btn-primary');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
  }

  const payload = {
    timestamp:     new Date().toISOString(),
    name,
    phone,
    reason:        reason        || 'Not specified',
    preferredDate: preferredDate || 'Not specified',
    message:       message       || '',
    source:        'Website Booking Form',
    status:        'New',
  };

  /* ── Attempt GAS submission ── */
  const gasAvailable = GAS_ENDPOINT && GAS_ENDPOINT !== 'YOUR_GAS_ENDPOINT_URL_HERE';

  if (gasAvailable) {
    fetch(GAS_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      mode:    'no-cors', /* GAS Web Apps require no-cors */
    })
    .then(() => {
      showBookingSuccess(name);
    })
    .catch(() => {
      /* GAS unreachable — fall through to mailto */
      mailtoFallback(payload);
    });
  } else {
    /* GAS not configured yet — use mailto fallback */
    mailtoFallback(payload);
    showBookingSuccess(name);
  }
};

function mailtoFallback(payload) {
  let body = `Appointment Request from Lotilla-Lara Optical Clinic Website\n\n`;
  body += `Full Name: ${payload.name}\n`;
  body += `Contact Number: ${payload.phone}\n`;
  body += `Reason for Visit: ${payload.reason}\n`;
  body += `Preferred Date: ${payload.preferredDate}\n`;
  if (payload.message) body += `Additional Notes:\n${payload.message}\n`;
  body += `\nSource: ${payload.source}\nTimestamp: ${payload.timestamp}\n---`;

  const email   = 'laraeldie1956@gmail.com';
  const subject = encodeURIComponent(`Appointment Request - ${payload.name}`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

function showBookingSuccess(name) {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const firstName = name.split(' ')[0] || name;
  form.innerHTML = `
    <div class="form-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A2E4A" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <h4>Request Received!</h4>
      <p>Thank you, ${firstName}. Dr. Lara will confirm your appointment shortly.</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:20px;">
        Back to Form
      </button>
    </div>
  `;
  setTimeout(() => { if (form.querySelector('.form-success')) location.reload(); }, 8000);
}

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
   IMPLEMENTATION_008B — CURATED FRAMES EXPERIENCE ENHANCEMENT
   Gallery Modal + Atmosphere + Infinite Carousel + Identity Reveal
   Vanilla JS only · No external libraries · Performance-guarded
================================================================ */

(function () {
  'use strict';

  /* ── E004: Collection data — source of truth incl. identity layer ── */
  const COLLECTIONS = {
    rayban: {
      title:   'Ray-Ban Collection',
      folder:  'assets/images/curatedFrame/Ray-Ban_Collection/',
      prefix:  'rbframe',
      count:   10,
      ext:     'jpeg',
      tag:     'Timeless',
      desc:    'Heritage · Classic silhouettes',
      color:   '#B8924A',   /* gold */
      atmPick: [1, 3, 6],   /* which images to use as atmosphere floaters */
    },
    designer: {
      title:   'Designer Collection',
      folder:  'assets/images/curatedFrame/designercollection/',
      prefix:  'dcframe',
      count:   10,
      ext:     'jpeg',
      tag:     'Luxury',
      desc:    'Editorial · Contemporary',
      color:   '#8BA8C8',   /* cool silver-blue */
      atmPick: [2, 5, 8],
    },
    look: {
      title:   'Look Is Everything',
      folder:  'assets/images/curatedFrame/looksiseverything/',
      prefix:  'lookframe',
      count:   10,
      ext:     'jpeg',
      tag:     'Confidence',
      desc:    'Fashion · Statement',
      color:   '#C8A0B4',   /* rose */
      atmPick: [1, 4, 7],
    },
    pediatric: {
      title:   'Pediatric Collection',
      folder:  'assets/images/curatedFrame/pediatriccollection/',
      prefix:  'pediaframe',
      count:   10,
      ext:     'jpeg',
      tag:     'Playful',
      desc:    'Family · Built for childhood',
      color:   '#88BBA0',   /* soft green */
      atmPick: [2, 5, 9],
    },
    sports: {
      title:   'Sports & Active',
      folder:  'assets/images/curatedFrame/sports&active/',
      prefix:  'sportsframe',
      count:   10,
      ext:     'jpeg',
      tag:     'Performance',
      desc:    'Motion · Durable build',
      color:   '#A0B4D0',   /* steel blue */
      atmPick: [1, 3, 8],
    },
  };

  /* ── DOM references ── */
  const modal           = document.getElementById('frameModal');
  const backdrop        = document.getElementById('frameModalBackdrop');
  const closeBtn        = document.getElementById('frameModalClose');
  const modalTitle      = document.getElementById('frameModalTitle');
  const track           = document.getElementById('frameCarouselTrack');
  const prevBtn         = document.getElementById('frameCarouselPrev');
  const nextBtn         = document.getElementById('frameCarouselNext');
  const dotsContainer   = document.getElementById('frameCarouselDots');
  const counter         = document.getElementById('frameCarouselCounter');
  const identityEl      = document.getElementById('frameCollectionIdentity');
  const identityTag     = document.getElementById('frameIdentityTag');
  const identityDesc    = document.getElementById('frameIdentityDesc');
  const atmosphereEl    = document.getElementById('framesAtmosphere');
  const framesSection   = document.getElementById('frames');

  if (!modal) return;

  /* ── State ── */
  let realCount    = 0;    /* actual image count (not including clones) */
  let currentReal  = 0;    /* 0-based index within real slides */
  let isAnimating  = false;
  let dots         = [];
  let lastFocused  = null;
  let touchStartX  = 0;
  let touchStartY  = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── E001: FLOATING ATMOSPHERE ── */
  /* Inject once on page load — a set of blurred, drifting frame images */
  /* Uses 3 images from each collection (atmPick indices) = 15 total floaters */

  const ATM_ANIMS   = ['atm-drift-a','atm-drift-b','atm-drift-c','atm-drift-d','atm-drift-e','atm-drift-f'];
  const ATM_SPEEDS  = [18, 22, 26, 30, 24, 20]; /* seconds — slow drift */
  const ATM_SIZES   = [120, 90, 140, 100, 80, 110, 130, 95, 115, 85, 125, 105, 88, 118, 98]; /* px width */
  /* Pre-computed positions for 15 floaters (% left, % top) */
  const ATM_POS = [
    [4,10],[14,65],[88,8],[76,72],[50,5],[62,55],[22,82],[38,20],[82,42],
    [8,48],[68,15],[92,68],[30,60],[55,35],[18,28],
  ];
  /* Delay offsets to stagger so they don't all move in sync */
  const ATM_DELAYS = [0,-4,-8,-12,-3,-7,-11,-2,-6,-10,-1,-5,-9,-14,-16];

  function buildAtmosphere() {
    if (!atmosphereEl || reducedMotion) return;

    let floaterIndex = 0;
    Object.values(COLLECTIONS).forEach(col => {
      col.atmPick.forEach(imgNum => {
        const img = document.createElement('img');
        img.src = `${col.folder}${col.prefix}${imgNum}.${col.ext}`;
        img.alt = '';
        img.className = 'atm-frame';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy';
        img.decoding = 'async';

        const pos   = ATM_POS[floaterIndex % ATM_POS.length];
        const size  = ATM_SIZES[floaterIndex % ATM_SIZES.length];
        const anim  = ATM_ANIMS[floaterIndex % ATM_ANIMS.length];
        const speed = ATM_SPEEDS[floaterIndex % ATM_SPEEDS.length];
        const delay = ATM_DELAYS[floaterIndex % ATM_DELAYS.length];
        /* Three depth tiers: near (higher opacity, less blur), mid, far */
        const tier  = floaterIndex % 3;
        const opacity = [0.045, 0.030, 0.018][tier];
        const blur    = [2, 4, 6][tier];

        img.style.cssText = `
          left: ${pos[0]}%;
          top:  ${pos[1]}%;
          width: ${size}px;
          opacity: ${opacity};
          filter: blur(${blur}px);
          animation: ${anim} ${speed}s ease-in-out ${delay}s infinite;
        `;

        atmosphereEl.appendChild(img);
        floaterIndex++;
      });
    });
  }

  /* Only build atmosphere if section is in viewport vicinity — save perf */
  if (atmosphereEl && framesSection) {
    const atmObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        buildAtmosphere();
        atmObserver.disconnect();
      }
    }, { rootMargin: '200px' });
    atmObserver.observe(framesSection);
  }

  /* ── E003: INFINITE CAROUSEL — clone technique ── */
  /*
   * Layout: [clone-of-last] [slide-1] [slide-2] ... [slide-N] [clone-of-first]
   * Index in track:  0           1        2    ...     N         N+1
   * currentReal is always 0..(N-1). Track position = (currentReal + 1) * 100%.
   * On boundary cross, silently jump without transition to the real counterpart.
   */

  function buildSlides(key) {
    const col = COLLECTIONS[key];
    if (!col) return;

    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    dots = [];
    realCount   = col.count;
    currentReal = 0;

    /* E004 — identity layer */
    modalTitle.textContent = col.title;
    if (identityTag && identityDesc && identityEl) {
      identityTag.textContent = col.tag;
      identityDesc.textContent = col.desc;
      identityTag.style.setProperty('--id-color', col.color);
      /* Restart the appear animation */
      identityEl.classList.add('identity-reset');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          identityEl.classList.remove('identity-reset');
        });
      });
    }

    /* Build real slides */
    const slides = [];
    for (let i = 1; i <= col.count; i++) {
      const slide = makeSlide(col, i, i === 1);
      slides.push(slide);
    }

    /* Clone first and last for infinite loop */
    const cloneLast  = makeClone(slides[col.count - 1]);
    const cloneFirst = makeClone(slides[0]);

    /* Insert order: cloneLast, real slides, cloneFirst */
    track.appendChild(cloneLast);
    slides.forEach(s => track.appendChild(s));
    track.appendChild(cloneFirst);

    /* Position at first real slide (index 1 in track) — no animation */
    track.classList.add('no-transition');
    track.style.transform = `translateX(-100%)`;
    /* Force reflow before removing no-transition */
    track.offsetHeight; // eslint-disable-line no-unused-expressions
    track.classList.remove('no-transition');

    /* Dots */
    for (let i = 0; i < col.count; i++) {
      const dot = document.createElement('button');
      dot.className = 'frame-carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to frame ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }

    updateUI();
  }

  function makeSlide(col, num, isFirst) {
    const slide = document.createElement('div');
    slide.className = 'frame-carousel-slide' + (isFirst ? ' is-revealing' : '');
    slide.setAttribute('role', 'img');
    slide.setAttribute('aria-label', `${col.title} — frame ${num} of ${col.count}`);

    const img = document.createElement('img');
    img.src = `${col.folder}${col.prefix}${num}.${col.ext}`;
    img.alt = `${col.title} — frame ${num}`;
    img.loading = num === 1 ? 'eager' : 'lazy';
    img.decoding = 'async';

    slide.appendChild(img);
    return slide;
  }

  function makeClone(original) {
    const clone = original.cloneNode(true);
    clone.classList.add('frame-carousel-slide--clone');
    clone.classList.remove('is-revealing');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });
    return clone;
  }

  /* ── Navigation ── */
  function goTo(realIndex) {
    if (isAnimating) return;
    currentReal = ((realIndex % realCount) + realCount) % realCount;
    const trackIndex = currentReal + 1; /* +1 because cloneLast is at 0 */

    if (!reducedMotion) {
      track.style.transition = '';
    } else {
      track.classList.add('no-transition');
    }

    track.style.transform = `translateX(-${trackIndex * 100}%)`;
    updateUI();
  }

  /* After CSS transition ends, silently correct position on boundary */
  track.addEventListener('transitionend', () => {
    isAnimating = false;
    const trackIndex = currentReal + 1;
    /* At cloneFirst (last position in track) → jump to real first */
    if (currentReal === 0 && parseFloat(track.style.transform.replace('translateX(','')) < -realCount * 100 + 1) {
      /* We arrived at cloneFirst — jump to real slide 1 */
      track.classList.add('no-transition');
      track.style.transform = `translateX(-100%)`;
      track.offsetHeight;
      track.classList.remove('no-transition');
    }
    /* At cloneLast (position 0 in track) → jump to real last */
    const currentTranslate = Math.abs(parseFloat(track.style.transform.replace(/translateX\(|%\)/g,'')));
    if (currentTranslate < 1) {
      track.classList.add('no-transition');
      track.style.transform = `translateX(-${realCount * 100}%)`;
      track.offsetHeight;
      track.classList.remove('no-transition');
    }
  });

  function next() {
    if (isAnimating) return;
    isAnimating = true;
    const nextReal = (currentReal + 1) % realCount;
    const trackIndex = currentReal + 1;

    /* If at last real slide, go to cloneFirst (trackIndex = realCount + 1) */
    if (currentReal === realCount - 1) {
      if (!reducedMotion) track.style.transition = '';
      track.style.transform = `translateX(-${(realCount + 1) * 100}%)`;
      currentReal = 0;
      updateUI();
      /* After transition, silently jump to real first */
      setTimeout(() => {
        track.classList.add('no-transition');
        track.style.transform = `translateX(-100%)`;
        track.offsetHeight;
        track.classList.remove('no-transition');
        isAnimating = false;
      }, reducedMotion ? 0 : 430);
    } else {
      goTo(currentReal + 1);
      setTimeout(() => { isAnimating = false; }, reducedMotion ? 0 : 430);
    }
  }

  function prev() {
    if (isAnimating) return;
    isAnimating = true;

    /* If at first real slide, go to cloneLast (trackIndex = 0) */
    if (currentReal === 0) {
      if (!reducedMotion) track.style.transition = '';
      track.style.transform = `translateX(0%)`;
      currentReal = realCount - 1;
      updateUI();
      setTimeout(() => {
        track.classList.add('no-transition');
        track.style.transform = `translateX(-${realCount * 100}%)`;
        track.offsetHeight;
        track.classList.remove('no-transition');
        isAnimating = false;
      }, reducedMotion ? 0 : 430);
    } else {
      goTo(currentReal - 1);
      setTimeout(() => { isAnimating = false; }, reducedMotion ? 0 : 430);
    }
  }

  function updateUI() {
    counter.textContent = `${currentReal + 1} / ${realCount}`;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentReal));
    prevBtn.setAttribute('aria-label',
      `Previous frame (${currentReal === 0 ? realCount : currentReal} of ${realCount})`);
    nextBtn.setAttribute('aria-label',
      `Next frame (${currentReal === realCount - 1 ? 1 : currentReal + 2} of ${realCount})`);
  }

  /* ── E005: Open / Close — premium reveal ── */
  function openModal(key) {
    lastFocused = document.activeElement;
    buildSlides(key);
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 80);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) setTimeout(() => lastFocused.focus(), 80);
  }

  /* ── Focus trap ── */
  function trapFocus(e) {
    if (!modal.classList.contains('is-open')) return;
    const focusable = Array.from(modal.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  /* ── Keyboard ── */
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape')      closeModal();
    if (e.key === 'ArrowRight')  next();
    if (e.key === 'ArrowLeft')   prev();
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
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ── Event bindings ── */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.querySelectorAll('.frame-card[data-collection]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.collection));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.collection);
      }
    });
  });

  console.log('%c IMPLEMENTATION_008B · Frame Gallery + Experience Enhancements loaded', 'color: #B8924A; font-size: 11px;');

})();


/* ────────────────────────────────────────────────────────────────
   9. IMPLEMENTATION_009-B — INIT LOG
──────────────────────────────────────────────────────────────── */
console.log('%c IMPLEMENTATION_009-B · Operations Layer active', 'color: #88BBA0; font-size: 11px;');
console.log('%c GAS: Inquiries/Appointments/Reports/Analytics/FollowUps/AuditLog/Settings', 'color: #B8924A; font-size: 10px;');
console.log('%c Admin dashboard → /admin/admin.html (access-code protected)', 'color: #8BA8C8; font-size: 10px;');


/* ================================================================
   IMPLEMENTATION_010 — CURATED FRAMES INTERACTIVE SHOWCASE
   E010-001 3D Tilt · E010-002 Accent Bar Wire · E010-003 Spotlight
   E010-004 Modal Accent Wire
   Vanilla JS only · Surgical patch · No touch interference
================================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  /* ── DOM ── */
  const spotlight     = document.getElementById('framesSpotlight');
  const framesSection = document.getElementById('frames');
  const frameModal    = document.getElementById('frameModal');
  const modalPanel    = document.querySelector('.frame-modal-panel');

  /* ── Collection accent colors — mirrors COLLECTIONS in 008B ── */
  const ACCENT_COLORS = {
    rayban:    '#B8924A',
    designer:  '#8BA8C8',
    look:      '#C8A0B4',
    pediatric: '#88BBA0',
    sports:    '#A0B4D0',
  };

  /* ── Utility: hex → rgba ── */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ── E010-001 + E010-002 + E010-003: Per-card effects ── */

  document.querySelectorAll('.frame-card[data-collection]').forEach(card => {
    const accent = card.dataset.accent || 'rgba(255,255,255,0.25)';

    /* Wire accent bar color */
    card.style.setProperty('--card-accent', accent);

    /* ── E010-001: 3D Tilt — desktop pointer only ── */
    if (!isTouchDevice && !reducedMotion) {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const nx    = (e.clientX - cx) / (rect.width  / 2);
        const ny    = (e.clientY - cy) / (rect.height / 2);
        /* Max ±4deg — luxury feel, not a toy */
        const tiltX = Math.max(-4, Math.min(4, -ny * 4));
        const tiltY = Math.max(-4, Math.min(4,  nx * 4));
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    }

    /* ── E010-003: Spotlight tracking ── */
    if (!isTouchDevice && spotlight && framesSection) {
      card.addEventListener('mouseenter', () => {
        const sectionRect = framesSection.getBoundingClientRect();
        const cardRect    = card.getBoundingClientRect();

        /* Card center relative to section, accounting for scroll */
        const relLeft = cardRect.left + cardRect.width  / 2 - sectionRect.left;
        const relTop  = cardRect.top  + cardRect.height / 2 - sectionRect.top
                        + framesSection.scrollTop;

        const spotColor = hexToRgba(accent, 0.09);
        spotlight.style.setProperty('--spotlight-color', spotColor);
        spotlight.style.left = `${relLeft}px`;
        spotlight.style.top  = `${relTop}px`;
        spotlight.classList.add('is-visible');
      });

      card.addEventListener('mouseleave', () => {
        spotlight.classList.remove('is-visible');
      });
    }

    /* ── E010-004: Stamp active collection on modal for observer ── */
    card.addEventListener('click', () => {
      if (frameModal) frameModal.dataset.activeCollection = card.dataset.collection;
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && frameModal) {
        frameModal.dataset.activeCollection = card.dataset.collection;
      }
    });
  });

  /* ── E010-004: Modal panel accent border — MutationObserver ── */

  if (frameModal && modalPanel) {
    const modalObserver = new MutationObserver(() => {
      if (frameModal.classList.contains('is-open')) {
        const key = frameModal.dataset.activeCollection;
        if (key && ACCENT_COLORS[key]) {
          modalPanel.style.setProperty(
            '--modal-accent',
            hexToRgba(ACCENT_COLORS[key], 0.60)
          );
        }
      } else {
        /* Reset on close */
        modalPanel.style.setProperty('--modal-accent', 'rgba(255,255,255,0.07)');
      }
    });

    modalObserver.observe(frameModal, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  console.log('%c IMPLEMENTATION_010 · Curated Frames Interactive Showcase loaded', 'color: #88BBA0; font-size: 11px;');

})();
