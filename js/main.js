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
  initViewCounter();
  initReactions();

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

if (isDesktop) {
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 10 && !exitToastShown) {
      exitToastShown = true;
      document.getElementById('exitToast').classList.add('show');
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
