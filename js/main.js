// ─────────── STATE ───────────
var currentLang = 'ru';
var typingDone = false;
var typingInterval = null;
var viewCount = null;

// ─────────── INIT ───────────
function runInit() {
  // Ensure modals are hidden on load
  document.querySelectorAll('.modal-overlay').forEach(function(el) {
    el.classList.remove('show');
  });

  var saved = localStorage.getItem('cv_lang');
  if (saved === 'ru' || saved === 'en') {
    currentLang = saved;
  } else {
    var browser = (navigator.language || 'ru').toLowerCase();
    currentLang = browser.startsWith('en') ? 'en' : 'ru';
  }

  // Apply lang to all i18n elements (skip top_title, typing handles it)
  applyLangInit();
  document.documentElement.lang = currentLang;
  localStorage.setItem('cv_lang', currentLang);

  // Initialize features
  initClosedPage();
  initViewCounter();
  initReactions();
  initExitIntent();

  // Start typing effect immediately
  runTypingEffect();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}

// ─────────── LANGUAGE ───────────
function applyLangInit() {
  var t = translations[currentLang] || translations.ru;
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key === 'top_title') return; // typing handles this
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.getElementById('langToggle').textContent = currentLang === 'ru' ? 'EN' : 'RU';
}

function applyLang(lang) {
  currentLang = lang;
  var t = translations[lang] || translations.ru;

  // Stop typing if in progress
  if (!typingDone) {
    typingDone = true;
    clearInterval(typingInterval);
  }

  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Update view counter
  updateViewCounter();

  document.getElementById('langToggle').textContent = lang === 'ru' ? 'EN' : 'RU';
  document.documentElement.lang = lang;
  localStorage.setItem('cv_lang', lang);
}

function toggleLang() {
  applyLang(currentLang === 'ru' ? 'en' : 'ru');
}

// ─────────── TYPING EFFECT ───────────
function runTypingEffect() {
  var el = document.getElementById('topTitleEl');
  var texts = {
    ru: 'Senior Affiliate Manager · Publisher Development · CPA-сети',
    en: 'Senior Affiliate Manager · Publisher Development · CPA Networks'
  };
  var full = texts[currentLang] || texts.ru;
  var SPAN_LEN = 'Senior Affiliate Manager'.length;

  typingDone = false;
  clearInterval(typingInterval);
  el.innerHTML = '<span></span>';
  var i = 0;

  typingInterval = setInterval(function() {
    if (typingDone) { clearInterval(typingInterval); return; }
    i++;
    var typed = full.slice(0, i);
    var a = typed.slice(0, SPAN_LEN);
    var b = typed.slice(SPAN_LEN);
    el.innerHTML = (a ? '<span>' + a + '</span>' : '<span></span>') + b + '<span class="type-cursor">|</span>';
    if (i >= full.length) {
      clearInterval(typingInterval);
      typingDone = true;
      setTimeout(function() {
        var cur = el.querySelector('.type-cursor');
        if (cur) { cur.style.animation = 'none'; cur.style.opacity = '0'; }
      }, 2000);
    }
  }, 40);
}

// ─────────── TAB TITLE TRICK ───────────
var originalTitle = document.title;
var titleReturnTimer = null;

document.addEventListener('visibilitychange', function() {
  clearTimeout(titleReturnTimer);
  if (document.hidden) {
    var hidTitle = translations[currentLang].title_hidden || translations.ru.title_hidden;
    document.title = hidTitle;
  } else {
    var retTitle = translations[currentLang].title_return || translations.ru.title_return;
    document.title = retTitle;
    titleReturnTimer = setTimeout(function() {
      document.title = originalTitle;
    }, 3000);
  }
});

// ─────────── EXIT INTENT TOAST ───────────
var exitToastShown = false;
var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function initExitIntent() {
  if (!isDesktop) return;
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 10 && !exitToastShown) {
      exitToastShown = true;
      var el = document.getElementById('exitToast');
      if (el) el.classList.add('show');
    }
  });
}

function closeExitToast() {
  document.getElementById('exitToast').classList.remove('show');
}

// ─────────── COPY EASTER EGG ───────────
var copyMessages = {
  ru: ['Скопировали? Значит, уже думаете об оффере 😏', 'Хороший выбор 👀', 'Иван это оценит 🤝'],
  en: ['Copied? Must be thinking about an offer 😏', 'Good choice 👀', 'Ivan appreciates that 🤝']
};
var copyIdx = 0, copyEggTimer = null;

document.addEventListener('copy', function() {
  var msgs = copyMessages[currentLang] || copyMessages.ru;
  var toast = document.getElementById('copyToast');
  toast.textContent = msgs[copyIdx % msgs.length];
  copyIdx++;
  toast.classList.add('show');
  clearTimeout(copyEggTimer);
  copyEggTimer = setTimeout(function() { toast.classList.remove('show'); }, 2800);
});

// ─────────── SCROLL PROGRESS ───────────
window.addEventListener('scroll', function() {
  var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
  var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var pct = total > 0 ? (scrolled / total * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}, { passive: true });

// ─────────── CUSTOM CURSOR (desktop only) ───────────
if (isDesktop) {
  document.body.classList.add('has-custom-cursor');
  var cursorEl = document.getElementById('customCursor');
  document.addEventListener('mousemove', function(e) {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ─────────── CONFETTI ───────────
function tryConfetti(attempts) {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#2563eb', '#059669', '#ffffff'],
      origin: { y: 0.3 }
    });
  } else if (attempts > 0) {
    setTimeout(function() { tryConfetti(attempts - 1); }, 100);
  }
}
setTimeout(function() { tryConfetti(10); }, 300);

// ─────────── VIEW COUNTER ───────────
function initViewCounter() {
  var stored = sessionStorage.getItem('cv_views');
  if (stored) {
    viewCount = parseInt(stored);
  } else {
    viewCount = Math.floor(Math.random() * 41) + 40;
    sessionStorage.setItem('cv_views', viewCount);
  }
  updateViewCounter();
}

function updateViewCounter() {
  if (viewCount === null) return;
  var fmt = (translations[currentLang] || translations.ru).view_fmt;
  document.getElementById('viewCounter').textContent = fmt.replace('{n}', viewCount);
}

// ─────────── COPY CONTACT ───────────
var contactToastTimer = null;

function copyContact(text) {
  var doShow = function() {
    var t = (translations[currentLang] || translations.ru).copy_contact;
    var toast = document.getElementById('contactToast');
    toast.textContent = t;
    toast.classList.add('show');
    clearTimeout(contactToastTimer);
    contactToastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(doShow).catch(function() {
      fallbackCopy(text);
      doShow();
    });
  } else {
    fallbackCopy(text);
    doShow();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
}

// ─────────── EASTER EGG (triple click name) ───────────
var clickCount = 0, clickTimer = null;

document.getElementById('topName').addEventListener('click', function() {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(function() { clickCount = 0; }, 600);
  if (clickCount >= 3) {
    clickCount = 0;
    document.getElementById('easterModal').classList.add('show');
  }
});

// ─────────── MODALS ───────────
function closeModal(id, event) {
  if (!event || event.target === document.getElementById(id)) {
    document.getElementById(id).classList.remove('show');
  }
}

function openMinigame() {
  document.getElementById('minigameModal').classList.add('show');
}

// ─────────── REACTIONS ───────────
var reactBase = { fire: 12, muscle: 8, star: 15 };

function initReactions() {
  try {
    ['fire', 'muscle', 'star'].forEach(function(key) {
      var delta = parseInt(localStorage.getItem('react_' + key)) || 0;
      var voted = localStorage.getItem('react_' + key + '_v') === '1';

      var cntEl = document.getElementById('cnt-' + key);
      if (cntEl) cntEl.textContent = reactBase[key] + delta;

      var btn = document.getElementById('react-' + key);
      if (btn && voted) btn.classList.add('voted');
    });
  } catch(e) {
    console.error('Init reactions error:', e);
  }
}

function addReaction(key) {
  try {
    if (localStorage.getItem('react_' + key + '_v') === '1') return;
    var delta = (parseInt(localStorage.getItem('react_' + key)) || 0) + 1;
    localStorage.setItem('react_' + key, delta);
    localStorage.setItem('react_' + key + '_v', '1');

    var cntEl = document.getElementById('cnt-' + key);
    if (cntEl) cntEl.textContent = reactBase[key] + delta;

    var btn = document.getElementById('react-' + key);
    if (btn) {
      btn.classList.add('voted');
      btn.style.transform = 'scale(1.3)';
      setTimeout(function() { btn.style.transform = ''; }, 200);
    }
  } catch(e) {
    console.error('Reaction error:', e);
  }
}

// ─────────── CLOSED PAGE ───────────
var closedBadgeClicks = 0;
var closedBadgeTimer = null;

function applyClosed(closed) {
  var page = document.querySelector('.page');
  var closedPage = document.getElementById('closedPage');
  var progressBar = document.getElementById('progressBar');
  if (!page || !closedPage) return;

  if (closed) {
    page.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    closedPage.style.display = 'flex';
    document.title = 'Иван Поленок — Оффер принят ✓';
  } else {
    page.style.display = '';
    if (progressBar) progressBar.style.display = '';
    closedPage.style.display = 'none';
    document.title = 'Иван Поленок — Senior Affiliate Manager';
  }
}

function toggleClosed(isClosed) {
  localStorage.setItem('cv_closed', isClosed ? '1' : '0');
  applyClosed(isClosed);
  var label = document.getElementById('adminLabel');
  if (label) label.textContent = isClosed ? 'Резюме закрыто' : 'Резюме открыто';
}

function initClosedPage() {


  // ── 2. EYES FOLLOW CURSOR ──
  var eyeLeft = document.getElementById('eyeLeft');
  var eyeRight = document.getElementById('eyeRight');
  function moveEye(eyeEl, mx, my) {
    if (!eyeEl) return;
    var rect = eyeEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var angle = Math.atan2(my - cy, mx - cx);
    var dist = Math.min(8, rect.width / 4);
    var px = Math.cos(angle) * dist;
    var py = Math.sin(angle) * dist;
    var pupil = eyeEl.querySelector('.pupil');
    if (pupil) pupil.style.transform = 'translate(' + px + 'px,' + py + 'px)';
  }
  document.addEventListener('mousemove', function(e) {
    moveEye(eyeLeft, e.clientX, e.clientY);
    moveEye(eyeRight, e.clientX, e.clientY);
  }, { passive: true });

  // ── 3. PARTICLE TRAIL ──
  var particles = [];
  document.addEventListener('mousemove', function(e) {
    var p = document.createElement('span');
    p.textContent = ['✦','·','✧','★','•'][Math.floor(Math.random()*5)];
    p.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;pointer-events:none;z-index:9999998;font-size:' + (8 + Math.random()*8) + 'px;color:rgba(37,99,235,' + (0.4 + Math.random()*0.5) + ');transition:opacity 0.6s ease,transform 0.6s ease;transform:translate(-50%,-50%);';
    document.body.appendChild(p);
    requestAnimationFrame(function() {
      p.style.opacity = '0';
      p.style.transform = 'translate(-50%,-200%) scale(0.5)';
    });
    setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 650);
  }, { passive: true });

  // ── 4. KONAMI CODE → 30s ACCESS ──
  var konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiIdx = 0;
  document.addEventListener('keydown', function(e) {
    if (e.key === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        applyClosed(false);
        var notice = document.createElement('div');
        notice.id = 'konamiNotice';
        notice.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#059669;color:#fff;padding:12px 28px;border-radius:10px;z-index:9999999;font-family:Manrope,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.5px;';
        notice.textContent = '🔓 Konami-код активирован! Доступ: 30 секунд';
        document.body.appendChild(notice);
        var secs = 30;
        var ticker = setInterval(function() {
          secs--;
          if (notice.parentNode) notice.textContent = '🔓 Секретный доступ: ' + secs + ' сек';
          if (secs <= 0) {
            clearInterval(ticker);
            applyClosed(true);
            if (notice.parentNode) notice.parentNode.removeChild(notice);
          }
        }, 1000);
      }
    } else {
      konamiIdx = e.key === konamiSeq[0] ? 1 : 0;
    }
  });

  // Show admin panel if ?admin in URL
  var isAdmin = window.location.search.indexOf('admin') !== -1;
  if (isAdmin) {
    var panel = document.getElementById('adminPanel');
    if (panel) panel.style.display = 'block';
    var toggle = document.getElementById('closedToggle');
    var isClosed = localStorage.getItem('cv_closed') === '1';
    if (toggle) toggle.checked = isClosed;
    var label = document.getElementById('adminLabel');
    if (label) label.textContent = isClosed ? 'Резюме закрыто' : 'Резюме открыто';
  }

  // Apply closed state
  var isClosed = true; // offer accepted
  if (isClosed) applyClosed(true);

  // Badge easter egg: triple click
  var badge = document.getElementById('closedBadge');
  if (badge) {
    badge.addEventListener('click', function() {
      closedBadgeClicks++;
      badge.classList.remove('shake');
      void badge.offsetWidth; // reflow
      badge.classList.add('shake');
      clearTimeout(closedBadgeTimer);

      if (closedBadgeClicks === 3) {
        tryConfetti(5);
      }
      if (closedBadgeClicks === 7) {
        var secret = document.getElementById('closedSecret');
        if (secret) {
          secret.style.display = 'block';
          secret.style.animation = 'fadeIn 0.5s ease';
        }
        var hint = document.getElementById('closedClickHint');
        if (hint) hint.style.display = 'none';
      }
      if (closedBadgeClicks === 10) {
        // Konami-style: show resume for 5 seconds
        applyClosed(false);
        var notice = document.createElement('div');
        notice.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#059669;color:#fff;padding:10px 24px;border-radius:8px;z-index:9999999;font-family:Manrope,sans-serif;font-weight:700;font-size:13px;';
        notice.textContent = '🔓 Секретный доступ: 10 секунд';
        document.body.appendChild(notice);
        setTimeout(function() {
          applyClosed(true);
          document.body.removeChild(notice);
          closedBadgeClicks = 0;
        }, 10000);
      }
      closedBadgeTimer = setTimeout(function() { closedBadgeClicks = 0; }, 3000);
    });
  }
}

// ─────────── SHARE ───────────
var shareToastTimer = null;

function shareResume() {
  var url = window.location.href;
  var t = translations[currentLang] || translations.ru;

  if (navigator.share) {
    navigator.share({ title: document.title, url: url }).catch(function() {});
    return;
  }

  var fn = function() {
    var toast = document.getElementById('contactToast');
    toast.textContent = t.share_toast;
    toast.classList.add('show');
    clearTimeout(shareToastTimer);
    shareToastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(fn).catch(function() { fallbackCopy(url); fn(); });
  } else {
    fallbackCopy(url);
    fn();
  }
}

// ─────────── DOWNLOAD PDF ───────────
function downloadPDF() {
  var t = translations[currentLang] || translations.ru;
  var btn = document.getElementById('btnPdf');
  btn.disabled = true;
  btn.innerHTML = '⏳ ' + t.pdf_loading;

  var page = document.querySelector('.page');

  // Show PDF footer
  var footer = document.getElementById('pdfUrlFooter');
  if (footer) footer.style.display = 'block';

  // Fix overflow so full content is captured
  var prevOverflow = page.style.overflow;
  var prevRadius = page.style.borderRadius;
  page.style.overflow = 'visible';
  page.style.borderRadius = '0';

  // Hide interactive elements
  var style = document.createElement('style');
  style.id = 'pdf-hide';
  style.textContent = [
    '#progressBar,#customCursor,#exitToast,#copyToast,#contactToast',
    '.topbar-controls,.reactions-block,.minigame-wrap',
    '.view-counter,.type-cursor'
  ].join(',') + '{ display:none !important; }';
  document.head.appendChild(style);

  var lang = currentLang === 'ru' ? 'RU' : 'EN';
  var filename = 'Ivan-Polenok-CV-' + lang + '.pdf';

  var opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.97 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  var cleanup = function() {
    var s = document.getElementById('pdf-hide');
    if (s) s.remove();
    if (footer) footer.style.display = '';
    page.style.overflow = prevOverflow;
    page.style.borderRadius = prevRadius;
    btn.disabled = false;
    btn.innerHTML = '📥 <span data-i18n="btn_pdf">' + t.btn_pdf + '</span>';
  };

  html2pdf().set(opt).from(page).save()
    .then(cleanup).catch(function(e) { console.error('PDF error:', e); cleanup(); });
}
