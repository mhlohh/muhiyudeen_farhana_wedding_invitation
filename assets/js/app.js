/**
 * Wedding Invitation Web App Interaction Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initParallaxTilt();
  initNavigation();
  initRSVP();
  initCalendar();
});

/* ===================================================================
   COUNTDOWN TIMER (Target: Monday, 28 Dec 2026 09:00:00 IST)
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
   3D PARALLAX TILT EFFECT ON FLOATING CARDS
   =================================================================== */
function initParallaxTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
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
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
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
  });
}

/* ===================================================================
   RSVP INTERACTION & WISHES BOARD
   =================================================================== */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const wishesList = document.getElementById('wishes-list');

  // Default blessed wishes
  const defaultWishes = [
    { name: 'Ameen & Family', message: 'Barakallahu lakuma wa baraka alaykuma wa jama\'a baynakuma fee khayr! Wishing you both a lifetime of happiness, peace and love.' },
    { name: 'Dr. Shakeer & Dr. Nihala', message: 'Heartiest congratulations to Muhiyudeen and Fathima! May Allah shower His infinite blessings upon your new journey together.' },
    { name: 'Irfan & Jasmine', message: 'So happy for you both! Can\'t wait to celebrate this special day with you at BM Convention Center.' }
  ];

  function renderWishes() {
    if (!wishesList) return;
    const saved = JSON.parse(localStorage.getItem('wedding_wishes') || 'null') || defaultWishes;
    wishesList.innerHTML = saved.map(w => `
      <div class="wish-item">
        <div class="wish-author">${escapeHtml(w.name)}</div>
        <div class="wish-text">“${escapeHtml(w.message)}”</div>
      </div>
    `).join('');
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value.trim();
      const attendance = document.getElementById('rsvp-attendance').value;
      const guests = document.getElementById('rsvp-guests').value;
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name) {
        showToast('Please enter your name.');
        return;
      }

      if (message) {
        const saved = JSON.parse(localStorage.getItem('wedding_wishes') || 'null') || defaultWishes;
        saved.unshift({ name: name, message: message });
        localStorage.setItem('wedding_wishes', JSON.stringify(saved.slice(0, 20)));
        renderWishes();
      }

      showToast(`Jazakallah Khair, ${name}! Your RSVP has been confirmed.`);
      form.reset();
    });
  }

  renderWishes();
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
      const details = encodeURIComponent("Nikah and Wedding Celebration of Muhiyudeen NR & Fathima Farhana. Departure from Groom House at 09:00 AM.");
      const location = encodeURIComponent("BM Convention Center, Ambalathara, Trivandrum, Kerala, India");
      const dates = "20261228T033000Z/20261228T123000Z"; // UTC for 09:00 AM to 06:00 PM IST
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
        "DESCRIPTION:Nikah and Wedding Celebration of Muhiyudeen NR & Fathima Farhana. Departure from Groom House at 09:00 AM.",
        "LOCATION:BM Convention Center, Ambalathara, Trivandrum, Kerala, India",
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
