/* ============================================================
   JV DIESEL — JAVASCRIPT
   Interactions, Animations, Sliders, Counters
   ============================================================ */

(function () {
  'use strict';

  // ─── NAVBAR ───────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav-link:not(.nav-cta)');

  const backToTop = document.getElementById('backToTop');

  // Throttle global scroll events for 60fps performance
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        
        // Navbar
        if (scrolled > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        
        // Back to top
        if (scrolled > 400) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
        
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll (IntersectionObserver prevents layout thrashing)
  const sections = document.querySelectorAll('section[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(section => navObserver.observe(section));

  // ─── INTERSECTION OBSERVER (Animations) ────────────────────
  const animateEls = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  animateEls.forEach(el => observer.observe(el));

  // ─── COUNTER ANIMATION ─────────────────────────────────────
  function animateCounter(el, target, duration = 2000) {
    let startTime = null;
    const startValue = 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('pt-BR');
    }
    requestAnimationFrame(step);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  // ─── TESTIMONIALS SLIDER ───────────────────────────────────
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testimPrev');
  const nextBtn = document.getElementById('testimNext');
  const dotsContainer = document.getElementById('testimDots');

  if (track) {
    const cards = Array.from(track.children);
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    const totalSlides = Math.ceil(cards.length / cardsPerView);

    function getCardsPerView() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 4;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const cpv = getCardsPerView();
      const total = Math.ceil(cards.length / cpv);
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goTo(index) {
      cardsPerView = getCardsPerView();
      const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
      currentIndex = Math.max(0, Math.min(index, maxIndex));

      // On large screens, all cards visible (no sliding needed)
      if (cardsPerView >= 4) {
        currentIndex = 0;
      }

      // Calculate scroll position
      if (cardsPerView < 4) {
        const cardWidth = track.querySelector('.testimonial-card').offsetWidth;
        const gap = 24;
        track.style.transform = `translateX(-${currentIndex * (cardWidth + gap) * cardsPerView}px)`;
      }
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Auto-play
    let autoPlay = setInterval(() => {
      cardsPerView = getCardsPerView();
      if (cardsPerView >= 4) return;
      const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        cardsPerView = getCardsPerView();
        if (cardsPerView >= 4) return;
        const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
        goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
      }, 5000);
    });

    buildDots();
    window.addEventListener('resize', () => {
      buildDots();
      goTo(0);
    });
  }

  // ─── BACK TO TOP ───────────────────────────────────────────
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── PARALLAX HERO ─────────────────────────────────────────
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    let heroTicking = false;
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          if (scrolled < window.innerHeight) {
            heroImg.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0) scale(1.08)`;
          }
          heroTicking = false;
        });
        heroTicking = true;
      }
    }, { passive: true });
  }

  // ─── SMOOTH HOVER TILT on Service Cards ────────────────────
  document.querySelectorAll('.service-card, .why-card').forEach(card => {
    let tiltTicking = false;
    card.addEventListener('mousemove', (e) => {
      if (!tiltTicking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const dx = (x - cx) / cx;
          const dy = (y - cy) / cy;
          card.style.transform = `translate3d(0, -6px, 0) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
          tiltTicking = false;
        });
        tiltTicking = true;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  // ─── GALLERY LIGHTBOX ──────────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery-item');

  function createLightbox() {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.95);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
      cursor: zoom-out;
      backdrop-filter: blur(10px);
    `;
    const img = document.createElement('img');
    img.style.cssText = `
      max-width: 92vw; max-height: 88vh;
      object-fit: contain; border-radius: 8px;
      transform: scale(0.92); transition: transform 0.3s ease;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8);
    `;
    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.cssText = `
      position: absolute; top: 1.5rem; right: 1.5rem;
      font-size: 1.5rem; color: white; background: none; border: none;
      cursor: pointer; width: 44px; height: 44px;
      border: 1px solid rgba(255,255,255,0.3); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease;
    `;
    close.onmouseenter = () => { close.style.background = 'rgba(200,16,46,0.7)'; close.style.borderColor = 'transparent'; };
    close.onmouseleave = () => { close.style.background = 'none'; close.style.borderColor = 'rgba(255,255,255,0.3)'; };

    lb.appendChild(img);
    lb.appendChild(close);
    document.body.appendChild(lb);

    function open(src, alt) {
      img.src = src;
      img.alt = alt;
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        lb.style.opacity = '1';
        img.style.transform = 'scale(1)';
      });
    }

    function closeLb() {
      lb.style.opacity = '0';
      img.style.transform = 'scale(0.92)';
      setTimeout(() => {
        lb.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }

    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    close.addEventListener('click', closeLb);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

    return open;
  }

  const openLightbox = createLightbox();

  galleryItems.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const label = item.querySelector('.gallery-overlay span');
      openLightbox(img.src, label ? label.textContent : '');
    });
  });

  // ─── INIT ──────────────────────────────────────────────────
  // Initialization logic is handled by Observers asynchronously.

})();
