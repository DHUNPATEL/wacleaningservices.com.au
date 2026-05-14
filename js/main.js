// ============================================================
// NAVBAR — sticky shadow + mobile toggle + dropdowns
// ============================================================
(function () {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar && navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  toggle && toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks && navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Mobile dropdown
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown');
    if (!dropdown) return;
    link && link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks && toggle && !navLinks.contains(e.target) && !toggle.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ============================================================
// SCROLL FADE-IN ANIMATIONS
// ============================================================
(function () {
  const selectors = '.fade-in, .fade-in-left, .fade-in-right';
  const els = document.querySelectorAll(selectors);
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

// ============================================================
// STATS COUNTER ANIMATION
// ============================================================
(function () {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = prefix + Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ============================================================
// FAQ ACCORDION
// ============================================================
(function () {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ============================================================
// VISITOR BEHAVIOUR TRACKER
// ============================================================
(function () {
  const ACCESS_KEY  = 'c538fdf0-9474-49a5-a752-99f4f3d0274e'; // web3forms key — update if needed
  const SESSION_KEY = 'wacs_session'; // wa cleaning services
  const PAGE_NAME   = document.title.split('|')[0].trim();
  const PAGE_ENTRY  = Date.now();

  let session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') || {
    id: Date.now(),
    startTime: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' }),
    referrer: document.referrer || 'Direct / No referrer',
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    screen: screen.width + 'x' + screen.height,
    language: navigator.language,
    geo: null,
    pages: [],
    clicks: [],
    formSubmissions: [],
    sent: false
  };

  // Fetch geo/IP once per session
  if (!session.geo) {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(geo => {
        session.geo = {
          ip:       geo.ip,
          city:     geo.city,
          region:   geo.region,
          country:  geo.country_name,
          postcode: geo.postal || 'N/A',
          latlong:  geo.latitude + ', ' + geo.longitude,
          timezone: geo.timezone,
          isp:      geo.org
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }).catch(() => {});
  }

  const thisPage = { name: PAGE_NAME, path: window.location.pathname, timeSpent: 0, scrollDepth: 0 };
  session.pages.push(thisPage);
  save();

  // Scroll depth
  window.addEventListener('scroll', () => {
    const docH = document.body.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / docH) * 100));
    if (pct > thisPage.scrollDepth) { thisPage.scrollDepth = pct; save(); }
  });

  // Meaningful clicks
  document.addEventListener('click', e => {
    const el = e.target.closest('a, button, .service-card, .accordion-header, .trust-badge, .btn');
    if (!el) return;
    const label = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 60);
    if (!label) return;
    session.clicks.push({
      page:  PAGE_NAME,
      label,
      time:  new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Perth' })
    });
    save();
  });

  function save() {
    thisPage.timeSpent = Math.round((Date.now() - PAGE_ENTRY) / 1000);
    session.pages[session.pages.length - 1] = thisPage;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async function sendInsight(trigger) {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!s || s.sent) return;
    s.sent = true;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    save();

    const totalSecs  = Math.round((Date.now() - s.id) / 1000);
    const timeStr    = totalSecs >= 60 ? `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s` : `${totalSecs}s`;
    const pageCount  = s.pages.length;
    const clickCount = s.clicks.length;

    let insight;
    if (totalSecs < 8 && clickCount === 0) {
      insight = '⚡ Quick bounce — left almost immediately. Likely wrong page or bot.';
    } else if (s.formSubmissions && s.formSubmissions.length) {
      insight = '🎯 SUBMITTED A QUOTE REQUEST — hot lead, follow up ASAP!';
    } else if (clickCount >= 5 || pageCount >= 4) {
      insight = '🔥 Highly engaged visitor — explored thoroughly. Strong potential lead!';
    } else if (pageCount >= 3) {
      insight = '👀 Interested visitor — browsed multiple pages. Worth noting.';
    } else if (clickCount >= 2) {
      insight = '🤔 Curious visitor — clicked around, showing some interest.';
    } else {
      insight = '👁️ Passive viewer — spent time on site but didn\'t interact much.';
    }

    const pagesText = s.pages.map((p, i) =>
      `  ${i + 1}. ${p.name}\n     Path: ${p.path} | Time: ${p.timeSpent}s | Scrolled: ${p.scrollDepth}%`
    ).join('\n');

    const clicksText = s.clicks.length
      ? s.clicks.map(c => `  • [${c.page}] "${c.label}" at ${c.time}`).join('\n')
      : '  No clicks recorded';

    const formText = s.formSubmissions && s.formSubmissions.length
      ? s.formSubmissions.map(f =>
          Object.entries(f).map(([k, v]) => `  ${k.padEnd(16)}: ${v}`).join('\n')
        ).join('\n  ──\n')
      : '  No form submitted';

    const message = `
🧹 WA CLEANING SERVICES — VISITOR REPORT
Trigger: ${trigger}

──────────────────────────────
💡 INSIGHT
──────────────────────────────
${insight}

Total time on site : ${timeStr}
Pages visited      : ${pageCount}
Total clicks       : ${clickCount}

──────────────────────────────
📄 PAGE JOURNEY
──────────────────────────────
${pagesText}

──────────────────────────────
🖱️ WHAT THEY CLICKED
──────────────────────────────
${clicksText}

──────────────────────────────
📋 QUOTE FORM SUBMITTED
──────────────────────────────
${formText}

──────────────────────────────
📍 LOCATION
──────────────────────────────
IP Address  : ${s.geo ? s.geo.ip       : 'N/A'}
City        : ${s.geo ? s.geo.city     : 'N/A'}
Region      : ${s.geo ? s.geo.region   : 'N/A'}
Country     : ${s.geo ? s.geo.country  : 'N/A'}
Postcode    : ${s.geo ? s.geo.postcode : 'N/A'}
Lat / Long  : ${s.geo ? s.geo.latlong  : 'N/A'}
Timezone    : ${s.geo ? s.geo.timezone : 'N/A'}
ISP / Org   : ${s.geo ? s.geo.isp      : 'N/A'}

──────────────────────────────
💻 DEVICE & BROWSER
──────────────────────────────
Arrived from    : ${s.referrer}
Device          : ${s.device}
Screen          : ${s.screen}
Language        : ${s.language}
User Agent      : ${navigator.userAgent}
Cookies On      : ${navigator.cookieEnabled ? 'Yes' : 'No'}
Session started : ${s.startTime}
──────────────────────────────
    `.trim();

    const payload = JSON.stringify({
      access_key: ACCESS_KEY,
      subject:    `🧹 WA Cleaning Visitor — ${pageCount} page${pageCount > 1 ? 's' : ''}, ${clickCount} click${clickCount !== 1 ? 's' : ''}, ${timeStr}`,
      from_name:  'WA Cleaning Services Tracker',
      message
    });

    try {
      const sent = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: payload,
        keepalive: true
      }).then(r => r.ok).catch(() => false);

      if (!sent && navigator.sendBeacon) {
        navigator.sendBeacon('https://api.web3forms.com/submit', new Blob([payload], { type: 'application/json' }));
      }
    } catch (e) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('https://api.web3forms.com/submit', new Blob([payload], { type: 'application/json' }));
      }
    }
  }

  // Send after 45 seconds
  const elapsed   = Date.now() - session.id;
  const remaining = Math.max(0, 45000 - elapsed);
  setTimeout(() => sendInsight('45 seconds on site'), remaining);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendInsight('Left site / switched tab');
  });
  window.addEventListener('pagehide',      () => sendInsight('Tab closed / navigated away'));
  window.addEventListener('beforeunload',  () => sendInsight('Browser closing'));
})();

// ============================================================
// QUOTE FORM — Web3Forms + session tracking
// ============================================================
(function () {
  const form = document.querySelector('#quote-form');
  if (!form) return;

  // Replace QUOTE_ACCESS_KEY with a new key from web3forms.com
  // configured to send to quote@wacleaningservices.com.au
  const QUOTE_KEY = 'c538fdf0-9474-49a5-a752-99f4f3d0274e';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn        = form.querySelector('.form-submit-btn');
    const successMsg = document.querySelector('#form-success');
    const errorMsg   = document.querySelector('#form-error');
    const origText   = btn.textContent;

    btn.textContent = 'Sending your request…';
    btn.disabled = true;
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg)   errorMsg.style.display   = 'none';

    try {
      const data = new FormData(form);
      data.set('access_key', QUOTE_KEY);
      data.set('subject', `New Quote Request — ${data.get('service') || 'General'} — ${data.get('name') || 'Unknown'}`);
      data.set('from_name', 'WA Cleaning Services Website');

      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const result   = await response.json();

      if (result.success) {
        // Record in tracker session
        try {
          const s = JSON.parse(sessionStorage.getItem('wacs_session'));
          if (s) {
            const formData = {};
            new FormData(form).forEach((v, k) => {
              if (!['access_key', 'subject', 'from_name'].includes(k) && v) formData[k] = v;
            });
            formData['submitted_at'] = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Perth' });
            s.formSubmissions = s.formSubmissions || [];
            s.formSubmissions.push(formData);
            s.sent = false; // allow re-send with form data
            sessionStorage.setItem('wacs_session', JSON.stringify(s));
          }
        } catch (_) {}

        if (successMsg) successMsg.style.display = 'block';
        form.reset();
        btn.textContent = '✓ Quote Request Sent!';
        btn.style.background = '#22c55e';

        setTimeout(() => {
          btn.textContent   = origText;
          btn.style.background = '';
          btn.disabled      = false;
          if (successMsg) successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 3000);

      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      if (errorMsg) errorMsg.style.display = 'block';
      btn.textContent   = '✗ Failed — Please try again';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.textContent   = origText;
        btn.style.background = '';
        btn.disabled      = false;
      }, 4000);
    }
  });
})();

// ============================================================
// CONTACT FORM — Web3Forms
// ============================================================
(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const CONTACT_KEY = 'c538fdf0-9474-49a5-a752-99f4f3d0274e';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn      = form.querySelector('.form-submit-btn');
    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      data.set('access_key', CONTACT_KEY);
      data.set('subject', `Contact Message — ${data.get('name') || 'Unknown'}`);
      data.set('from_name', 'WA Cleaning Services Website');

      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const result   = await response.json();

      if (result.success) {
        btn.textContent   = '✓ Message Sent!';
        btn.style.background = '#22c55e';
        form.reset();
        setTimeout(() => {
          btn.textContent   = origText;
          btn.style.background = '';
          btn.disabled      = false;
        }, 4000);
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      btn.textContent   = '✗ Failed — Try Again';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.textContent   = origText;
        btn.style.background = '';
        btn.disabled      = false;
      }, 4000);
    }
  });
})();
