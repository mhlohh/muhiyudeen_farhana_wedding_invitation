/**
 * High Performance Antigravity Interaction Controller
 * - Desktop: Lightweight cursor-tracking parallax with inverse shift (max 15-20px) on cards & florals
 * - Mobile: Strictly disables all pointer tracking JS; delegates to pure CSS 6s-8s keyframe float
 * - Zero backdrop-filter load on touch devices for locked 60fps
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCountdown();
  initDesktopParallax();
  initNavigation();
  initCalendar();
});

/* ===================================================================
   SMOOTH SCROLL REVEAL (Exclusively Transform & Opacity)
   =================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

/* ===================================================================
   DESKTOP CURSOR-TRACKING PARALLAX (Pointer devices only)
   =================================================================== */
function initDesktopParallax() {
  // Strictly enforce pointer / hover desktop check
  const isPointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isPointerDevice) {
    return; // Exit completely on mobile/touch devices
  }

  const cards = document.querySelectorAll('.tilt-card');
  const florals = document.querySelectorAll('.floral-frame');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isTicking = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Normalize coordinates (-1 to 1) from viewport center
    const normX = (mouseX / window.innerWidth - 0.5) * 2;
    const normY = (mouseY / window.innerHeight - 0.5) * 2;

    // Invert shift direction with maximum translation of 15px to 20px
    targetX = -normX * 18;
    targetY = -normY * 18;

    if (!isTicking) {
      requestAnimationFrame(updateParallax);
      isTicking = true;
    }
  }, { passive: true });

  function updateParallax() {
    // Smooth lerp (linear interpolation) for fluid motion
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Shift foreground floral frames inversely with slight depth factor
    florals.forEach((floral, idx) => {
      const depth = 0.6 + (idx % 3) * 0.35;
      const fx = currentX * depth;
      const fy = currentY * depth;
      floral.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
    });

    // Check if target is close enough to rest
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      requestAnimationFrame(updateParallax);
    } else {
      isTicking = false;
    }
  }

  // Individual 3D Card Tilt on Hover
  cards.forEach(card => {
    let cardTicking = false;
    let rotateX = 0;
    let rotateY = 0;

    function applyCardTilt() {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -6px, 0)`;
      cardTicking = false;
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      rotateX = ((y - cy) / cy) * -4;
      rotateY = ((x - cx) / cx) * 4;

      if (!cardTicking) {
        requestAnimationFrame(applyCardTilt);
        cardTicking = true;
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
    }, { passive: true });
  });
}

/* ===================================================================
   COUNTDOWN TIMER (Monday, 28 Dec 2026 09:00:00 IST)
   =================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-12-28T09:00:00+05:30').getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => n.toString().padStart(2, '0');

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl) minsEl.textContent = pad(minutes);
    if (secsEl) secsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* ===================================================================
   NAVIGATION & ACTIVE LINKS
   =================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    links.forEach(l => {
      l.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Active section scroll spy
  const sections = document.querySelectorAll('section[id]');
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
          const sectionTop = section.offsetTop - 160;
          const sectionHeight = section.offsetHeight;
          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        links.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

/* ===================================================================
   CALENDAR EXPORT & CLIPBOARD
   =================================================================== */
function initCalendar() {
  const gcalBtn = document.getElementById('add-gcal-btn');
  const icalBtn = document.getElementById('add-ical-btn');
  const copyBtn = document.getElementById('copy-address-btn');

  if (gcalBtn) {
    gcalBtn.addEventListener('click', () => {
      const title = encodeURIComponent("Wedding: Muhiyudeen NR & Fathima Farhana");
      const details = encodeURIComponent("Nikah: 11:30 AM - 12:30 PM at Poonthura Puthan Palli. Reception: BM Convention Center, Ambalathara, Trivandrum.");
      const location = encodeURIComponent("BM Convention Center, Ambalathara, Trivandrum");
      const dates = "20261228T033000Z/20261228T123000Z";
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(url, '_blank');
    });
  }

  if (icalBtn) {
    icalBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Muhiyudeen & Fathima//Wedding Invitation//EN",
        "BEGIN:VEVENT",
        "UID:wedding-muhiyudeen-fathima-20261228@antigravity",
        "DTSTAMP:20261002T000000Z",
        "DTSTART:20261228T033000Z",
        "DTEND:20261228T123000Z",
        "SUMMARY:Wedding of Muhiyudeen NR & Fathima Farhana",
        "DESCRIPTION:Nikah: 11:30 AM - 12:30 PM at Poonthura Puthan Palli. Reception: BM Convention Center, Ambalathara, Trivandrum.",
        "LOCATION:BM Convention Center, Ambalathara, Trivandrum",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Muhiyudeen_Fathima_Wedding.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar event downloaded (.ics)');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = "BM Convention Center, Ambalathara, Trivandrum";
      navigator.clipboard.writeText(text).then(() => {
        showToast('Venue address copied to clipboard!');
      }).catch(() => {
        showToast('Venue: BM Convention Center, Ambalathara, Trivandrum');
      });
    });
  }
}

/* ===================================================================
   HELPERS & TOAST NOTIFICATION
   =================================================================== */
function showToast(text) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${text}</span>`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
