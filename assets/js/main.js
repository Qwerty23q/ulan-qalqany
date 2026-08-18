/* ═══════════════════════════════════════════════════════════════════
   ҰЛАН ҚАЛҚАНЫ — скрипты
   Номер WhatsApp меняется в одной строке ниже.
   ═══════════════════════════════════════════════════════════════════ */

var WHATSAPP = '77074102815';   // ← номер фонда, без «+» и пробелов
var SPLASH_MS = 2400;           // ← сколько длится заставка, мс (совпадает с CSS)
var SPLASH_ONCE_PER_VISIT = false;  // true — показывать один раз за посещение, а не при каждой перезагрузке

(function () {
  'use strict';

  /* ── 1. Переключение языка RU / KZ ────────────────────────────── */
  var html = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('uq-lang'); } catch (e) {}

  function setLang(code) {
    html.setAttribute('data-lang', code);
    html.setAttribute('lang', code === 'kk' ? 'kk' : 'ru');
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      var on = b.dataset.setLang === code;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem('uq-lang', code); } catch (e) {}
  }

  setLang(saved === 'kk' ? 'kk' : 'ru');

  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.setLang); });
  });

  /* ── 2. Мобильное меню ────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  var navBack = document.getElementById('navBack');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    navBack.classList.toggle('is-on', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  }
  function closeNav() { setNav(false); }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    setNav(!nav.classList.contains('is-open'));
  });

  // тап мимо меню — закрыть
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !e.target.closest('#nav') && !e.target.closest('#burger')) closeNav();
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ── 3. Подсветка активного пункта меню ───────────────────────── */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── 4. Заставка при загрузке ─────────────────────────────────── */
  var splash = document.getElementById('splash');
  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = SPLASH_ONCE_PER_VISIT && sessionStorage.getItem('uq-splash') === '1'; } catch (e) {}

  function endSplash() {
    if (!splash) return;
    splash.classList.add('is-done');
    html.classList.remove('splash-on');
    splash = null;
    startReveal();
  }

  if (splash && motionOk && !seen) {
    html.classList.add('splash-on');
    try { if (SPLASH_ONCE_PER_VISIT) sessionStorage.setItem('uq-splash', '1'); } catch (e) {}

    // анимация стартует, когда логотип реально загружен, — иначе на медленной
    // сети движение проиграет по пустому месту. 1,5 с — предохранитель.
    var mark = splash.querySelector('.splash__mark');
    var started = false;
    function start() {
      if (started || !splash) return;
      started = true;
      splash.classList.add('is-ready');
      setTimeout(endSplash, SPLASH_MS);
    }
    if (mark.complete && mark.naturalWidth) start();
    else { mark.addEventListener('load', start); mark.addEventListener('error', start); }
    setTimeout(start, 1500);
    // тап или любая клавиша — пропустить, не заставляем ждать
    splash.addEventListener('click', endSplash);
    document.addEventListener('keydown', function k(e) {
      if (!splash) { document.removeEventListener('keydown', k); return; }
      endSplash();
    });
  } else {
    if (splash) splash.style.display = 'none';
    html.classList.remove('splash-on');
    splash = null;
    startReveal();
  }

  /* ── 5. Плавное появление блоков ──────────────────────────────── */
  function startReveal() {
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && motionOk) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en, i) {
          if (!en.isIntersecting) return;
          setTimeout(function () { en.target.classList.add('is-in'); }, i * 80);
          obs.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ── 6. Форма → WhatsApp ──────────────────────────────────────── */
  var form = document.getElementById('form');
  var err = document.getElementById('formErr');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var f = form.elements;
    var bad = false;

    ['name', 'contact', 'msg'].forEach(function (k) {
      var ok = f[k].value.trim() !== '';
      f[k].classList.toggle('is-bad', !ok);
      if (!ok) bad = true;
    });

    err.hidden = !bad;
    if (bad) return;

    var kk = html.getAttribute('data-lang') === 'kk';
    var L = kk
      ? { hi: 'Сәлеметсіз бе! «Ұлан Қалқаны» қорының сайты арқылы жазып отырмын.', n: 'Аты-жөні', o: 'Ұйым', c: 'Байланыс', m: 'Хабарлама' }
      : { hi: 'Здравствуйте! Пишу с сайта фонда «Ұлан Қалқаны».', n: 'Имя', o: 'Организация', c: 'Контакт', m: 'Сообщение' };

    var lines = [L.hi, ''];
    lines.push(L.n + ': ' + f.name.value.trim());
    if (f.org.value.trim()) lines.push(L.o + ': ' + f.org.value.trim());
    lines.push(L.c + ': ' + f.contact.value.trim());
    lines.push('', L.m + ': ' + f.msg.value.trim());

    window.open(
      'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')),
      '_blank',
      'noopener'
    );
  });

  form.addEventListener('input', function (e) {
    e.target.classList.remove('is-bad');
    err.hidden = true;
  });

  /* ── 7. Копирование реквизитов ────────────────────────────────── */
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // .catch: клипборд может быть запрещён политикой — тогда запасной путь
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    fallback();
    return Promise.resolve();
  }

  document.querySelectorAll('.req__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // отклик сразу, не дожидаясь промиса: запись в буфер мгновенна,
      // а зависший промис не должен оставлять кнопку немой
      copyText(btn.getAttribute('data-copy'));
      btn.classList.add('is-done');
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8.5l3.2 3.2L13 5"/></svg>';
      setTimeout(function () {
        btn.classList.remove('is-done');
        btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"/></svg>';
      }, 1600);
    });
  });

  var copyAll = document.getElementById('copyAll');
  if (copyAll) {
    copyAll.addEventListener('click', function () {
      var kk = html.getAttribute('data-lang') === 'kk';
      var text = kk
        ? ['«Ұлан Қалқаны» жеке қоры',
           'БСН: 260740000334',
           'Банк: «Фридом Банк Казахстана» АҚ',
           'БСК: KZNVKZKA',
           'ЖСК (IBAN): KZ68551Z600006311040',
           'Төлем мақсаты: Қайырымдылық қайырмалдығы'].join('\n')
        : ['Частный фонд «Ұлан Қалқаны»',
           'БИН: 260740000334',
           'Банк: АО «Фридом Банк Казахстана»',
           'БИК: KZNVKZKA',
           'ИИК (IBAN): KZ68551Z600006311040',
           'Назначение платежа: Благотворительное пожертвование'].join('\n');
      copyText(text);
      copyAll.classList.add('is-done');
      copyAll.querySelectorAll('span').forEach(function (sp) { sp.textContent = sp.getAttribute('data-done'); });
      setTimeout(function () {
        copyAll.classList.remove('is-done');
        copyAll.querySelectorAll('span').forEach(function (sp) { sp.textContent = sp.getAttribute('data-idle'); });
      }, 1800);
    });
  }

  /* ── 7. Год в подвале ─────────────────────────────────────────── */
  document.getElementById('yr').textContent = new Date().getFullYear();
})();
