/* ============================================================
   Portfolio — Main Script
   Vanilla JavaScript · No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----------------------------------------------------------
     0. UTILITY HELPERS
  ---------------------------------------------------------- */

  /** Shorthand selectors */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Clamp a number between min and max */
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /** Ease-out quad curve (t in 0-1) */
  const easeOutQuad = (t) => t * (2 - t);

  /* ----------------------------------------------------------
     1. PRELOADER
  ---------------------------------------------------------- */

  const preloader = $('.preloader');

  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');

        // Remove from DOM once the CSS fade completes (~500ms)
        setTimeout(() => preloader.remove(), 500);
      }, 1500);
    });
  }

  /* ----------------------------------------------------------
     2. NAVBAR  (scroll class + hamburger toggle)
  ---------------------------------------------------------- */

  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const navLinks = $('.nav-links');

  // Add 'scrolled' class when user scrolls past 50px
  const handleNavbarScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  // Hamburger menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when any nav link is clicked
    $$('a', navLinks).forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  /* ----------------------------------------------------------
     3. TYPING ANIMATION
  ---------------------------------------------------------- */

  const typedEl = $('#typed-text');

  if (typedEl) {
    const strings = ['Web Developer', 'Frontend Developer', 'Data Science Student'];
    const TYPE_SPEED = 100;   // ms per character typed
    const DELETE_SPEED = 50;  // ms per character deleted
    const PAUSE_AFTER_TYPE = 2000;
    const PAUSE_AFTER_DELETE = 500;

    let strIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const tick = () => {
      const current = strings[strIdx];

      if (!isDeleting) {
        // Typing forward
        charIdx++;
        typedEl.textContent = current.substring(0, charIdx);

        if (charIdx === current.length) {
          // Finished typing — pause then start deleting
          isDeleting = true;
          setTimeout(tick, PAUSE_AFTER_TYPE);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        // Deleting backward
        charIdx--;
        typedEl.textContent = current.substring(0, charIdx);

        if (charIdx === 0) {
          // Finished deleting — move to next string
          isDeleting = false;
          strIdx = (strIdx + 1) % strings.length;
          setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    // Kick off
    tick();
  }

  /* ----------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS  (IntersectionObserver)
  ---------------------------------------------------------- */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;

          // Stagger with data-delay (ms)
          setTimeout(() => el.classList.add('active'), Number(delay));
        }
      });
    },
    { threshold: 0.15 }
  );

  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     5. SMOOTH SCROLLING  (anchor links)
  ---------------------------------------------------------- */

  const NAVBAR_OFFSET = 80; // px — accounts for fixed navbar height

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return; // ignore bare "#"

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     6. SKILL BAR ANIMATION
  ---------------------------------------------------------- */

  const skillObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.dataset.width || '0%';

          // Trigger CSS transition by setting the width
          requestAnimationFrame(() => {
            bar.style.width = targetWidth;
          });

          observer.unobserve(bar); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  $$('.skill-progress').forEach((bar) => {
    bar.style.width = '0'; // ensure initial state
    skillObserver.observe(bar);
  });

  /* ----------------------------------------------------------
     7. COUNTER ANIMATION
  ---------------------------------------------------------- */

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const duration = 2000; // ms
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const easedProgress = easeOutQuad(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current + '+';

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  $$('.stat-number').forEach((el) => counterObserver.observe(el));

  /* ----------------------------------------------------------
     8. PROJECT FILTER
  ---------------------------------------------------------- */

  const filterButtons = $$('.filter-btn');
  const projectCards = $$('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter || 'all';

      projectCards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.style.display = '';
          // Trigger reflow so the transition replays
          void card.offsetHeight;
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          // Hide after transition ends
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });

  /* ----------------------------------------------------------
     9. SCROLL TO TOP
  ---------------------------------------------------------- */

  const scrollTopBtn = $('#scrollToTop');

  if (scrollTopBtn) {
    window.addEventListener(
      'scroll',
      () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
      },
      { passive: true }
    );

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     10. PARALLAX EFFECT  (hero section)
  ---------------------------------------------------------- */

  const hero = $('.hero');
  const heroImageContainer = $('.hero-image-container');

  if (hero) {
    // Subtle vertical parallax on scroll
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        // Only apply while hero is in view
        if (scrolled < hero.offsetHeight + hero.offsetTop) {
          hero.style.backgroundPositionY = `${scrolled * 0.4}px`;
        }
      },
      { passive: true }
    );

    // Mouse-move tilt on hero image container
    if (heroImageContainer) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 … 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        heroImageContainer.style.transform =
          `translate(${x * 20}px, ${y * 20}px)`;
      });

      hero.addEventListener('mouseleave', () => {
        heroImageContainer.style.transform = 'translate(0, 0)';
      });
    }
  }

  /* ----------------------------------------------------------
     11. CONTACT FORM  (front-end validation + toast)
  ---------------------------------------------------------- */

  const contactForm = $('form#contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather required fields
      const required = $$('[required]', contactForm);
      let isValid = true;

      required.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // "Submit" — no backend, so just show success
      showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
      contactForm.reset();
    });
  }

  /* ----------------------------------------------------------
     12. PARTICLE ANIMATION  (hero background dots)
  ---------------------------------------------------------- */

  const particleContainer = $('.hero-bg-animation');

  if (particleContainer) {
    const PARTICLE_COUNT = 50;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dot = document.createElement('div');
      dot.classList.add('particle');

      const size = Math.random() * 4 + 2; // 2-6 px
      const left = Math.random() * 100;    // 0-100 %
      const top = Math.random() * 100;     // 0-100 %  (start position)
      const duration = Math.random() * 10 + 5; // 5-15 s
      const delay = Math.random() * duration;  // stagger start

      Object.assign(dot.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        borderRadius: '50%',
        background: 'rgba(255, 215, 0, 0.6)', // gold accent
        opacity: '0',
        pointerEvents: 'none',
        animation: `particleFloat ${duration}s ${delay}s linear infinite`,
      });

      particleContainer.appendChild(dot);
    }

    // Inject keyframes once (if not already present)
    if (!$('#particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes particleFloat {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          10%  { opacity: 0.8; }
          90%  { opacity: 0; }
          100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ----------------------------------------------------------
     13. TILT EFFECT ON PROJECT CARDS
  ---------------------------------------------------------- */

  $$('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0-1
      const y = (e.clientY - rect.top) / rect.height;    // 0-1

      const rotateY = (x - 0.5) * 12;  // ±6 deg
      const rotateX = (0.5 - y) * 12;  // ±6 deg

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  /* ----------------------------------------------------------
     14. NAVBAR ACTIVE LINK  (highlight on scroll)
  ---------------------------------------------------------- */

  const sections = $$('section[id]');
  const navItems = $$('.nav-links a[href^="#"]');

  const highlightNavLink = () => {
    const scrollPos = window.scrollY + NAVBAR_OFFSET + 10;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNavLink, { passive: true });
  highlightNavLink(); // run once on load

  /* ----------------------------------------------------------
     15. LIGHTBOX / MODAL  (cert-card & gallery-item images)
  ---------------------------------------------------------- */

  // Build lightbox DOM once
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    <img class="lightbox-img" src="" alt="Full-size preview">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = $('.lightbox-img', lightbox);
  const lightboxClose = $('.lightbox-close', lightbox);

  // Inject lightbox styles (scoped)
  if (!$('#lightbox-styles')) {
    const lbStyle = document.createElement('style');
    lbStyle.id = 'lightbox-styles';
    lbStyle.textContent = `
      .lightbox-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000;
        opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .lightbox-overlay.active {
        opacity: 1; pointer-events: auto;
      }
      .lightbox-img {
        max-width: 90vw; max-height: 85vh;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      .lightbox-overlay.active .lightbox-img {
        transform: scale(1);
      }
      .lightbox-close {
        position: absolute; top: 20px; right: 28px;
        background: none; border: none;
        color: #fff; font-size: 2.5rem;
        cursor: pointer; line-height: 1;
        transition: color 0.2s;
      }
      .lightbox-close:hover { color: #ffd700; }
    `;
    document.head.appendChild(lbStyle);
  }

  const openLightbox = (src) => {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Open on image click inside cert-card or gallery-item
  $$('.cert-card img, .gallery-item img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(img.src));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ----------------------------------------------------------
     16. TOAST NOTIFICATION
  ---------------------------------------------------------- */

  // Create a persistent toast container (top-right)
  let toastContainer = $('#toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    Object.assign(toastContainer.style, {
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    });
    document.body.appendChild(toastContainer);
  }

  // Inject toast styles once
  if (!$('#toast-styles')) {
    const tStyle = document.createElement('style');
    tStyle.id = 'toast-styles';
    tStyle.textContent = `
      .toast {
        min-width: 280px; max-width: 380px;
        padding: 14px 22px;
        border-radius: 8px;
        font-family: inherit; font-size: 0.95rem;
        color: #fff;
        pointer-events: auto;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        opacity: 0; transform: translateX(40px);
        transition: opacity 0.35s ease, transform 0.35s ease;
      }
      .toast.show {
        opacity: 1; transform: translateX(0);
      }
      .toast.success {
        background: linear-gradient(135deg, #0a1628, #1a2a4a);
        border-left: 4px solid #ffd700;
      }
      .toast.error {
        background: linear-gradient(135deg, #2a0a0a, #4a1a1a);
        border-left: 4px solid #ff4444;
      }
    `;
    document.head.appendChild(tStyle);
  }

  /**
   * Show a toast notification.
   * @param {string} message - Text to display.
   * @param {'success'|'error'} type - Visual style.
   */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger enter transition (next frame)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  }

  // Expose globally so other scripts can call it if needed
  window.showToast = showToast;

  /* ----------------------------------------------------------
     END — All features initialised.
  ---------------------------------------------------------- */
});
