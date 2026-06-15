/* Federleicht — shared interactions */
(function () {
  if (window.lucide) lucide.createIcons();

  /* current year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* nav: solid on scroll */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('solid', window.scrollY > 30); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile overlay menu */
  var ov = document.getElementById('overlay');
  var openBtn = document.getElementById('menuBtn');
  var closeBtn = document.getElementById('ovClose');
  function openMenu() { if (!ov) return; ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { if (!ov) return; ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (ov) ov.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* hero intro */
  var hero = document.querySelector('.hero');
  if (hero) { requestAnimationFrame(function () { hero.classList.add('lit'); }); window.addEventListener('load', function () { hero.classList.add('lit'); }); }

  /* reveal on scroll */
  var revs = document.querySelectorAll('.r');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revs.forEach(function (el) { ro.observe(el); });
  } else { revs.forEach(function (el) { el.classList.add('in'); }); }

  /* smooth in-page anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); var off = 84; var y = t.getBoundingClientRect().top + window.scrollY - off; window.scrollTo({ top: y, behavior: 'smooth' }); closeMenu(); }
    });
  });

  /* self-test */
  var items = document.querySelectorAll('.st-item');
  if (items.length) {
    var res = { 1: document.getElementById('res1'), 2: document.getElementById('res2'), 3: document.getElementById('res3') };
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        it.classList.toggle('on');
        var c = document.querySelectorAll('.st-item.on').length;
        Object.keys(res).forEach(function (k) { if (res[k]) res[k].classList.remove('show'); });
        if (c >= 1 && c <= 2 && res[1]) res[1].classList.add('show');
        else if (c >= 3 && c <= 4 && res[2]) res[2].classList.add('show');
        else if (c >= 5 && res[3]) res[3].classList.add('show');
      });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var faq = q.closest('.faq');
      var a = faq.querySelector('.faq-a');
      var open = faq.classList.contains('open');
      if (open) { faq.classList.remove('open'); a.style.maxHeight = null; q.setAttribute('aria-expanded', 'false'); }
      else { faq.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; q.setAttribute('aria-expanded', 'true'); }
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq.open .faq-a').forEach(function (a) { a.style.maxHeight = a.scrollHeight + 'px'; });
  });

  /* sticky mobile CTA */
  var sc = document.getElementById('stickyCta');
  if (sc) {
    window.addEventListener('scroll', function () {
      if (window.innerWidth > 860) { sc.classList.remove('show'); return; }
      var contact = document.getElementById('kontakt-anker') || document.querySelector('footer');
      var trigger = window.scrollY > 480;
      var nearFoot = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      sc.classList.toggle('show', trigger && !nearFoot);
    }, { passive: true });
  }
})();
