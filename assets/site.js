/*
 * Progressive enhancement only. The content is visible by default; this
 * file adds the trail rail, the sticky-header hairline, and sections that
 * arrive as you reach them. If it fails to load, nothing is hidden.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* The hero mark draws itself: the path's own length drives the dash. */
  var drawn = document.querySelector('.draw path');
  if (drawn && typeof drawn.getTotalLength === 'function') {
    drawn.parentNode.style.setProperty('--len', Math.ceil(drawn.getTotalLength()));
  }

  var rail = document.querySelector('.rail span');
  var head = document.querySelector('.site-head');
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var ticking = false;

  if (reduced.matches) {
    pending.forEach(function (el) {
      el.classList.add('in');
    });
    pending = [];
  }

  /* Reveal is driven by the same rAF pass as the rail: one source of truth,
   * no IntersectionObserver to depend on, identical behaviour everywhere. */
  function sweep() {
    if (!pending.length) return;
    var trigger = window.innerHeight * 0.88;
    var due = [];
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top >= trigger) return true;
      due.push(el);
      return false;
    });
    due.forEach(function (el) {
      var siblings = Array.prototype.filter.call(
        el.parentNode ? el.parentNode.children : [],
        function (n) {
          return n.classList && n.classList.contains('reveal');
        },
      );
      var i = siblings.indexOf(el);
      el.style.setProperty('--delay', Math.max(0, Math.min(i, 8)) * 70 + 'ms');
      el.classList.add('in');
    });
  }

  function frame() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;
    if (rail) {
      var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
      rail.style.setProperty('--progress', pct.toFixed(2) + '%');
    }
    if (head) head.setAttribute('data-scrolled', y > 8 ? 'true' : 'false');
    sweep();
  }

  /* The sweep runs straight away rather than waiting for a frame: a tab
   * restored in the background has no animation frames to wait for, and
   * nothing should stay invisible because of that. The rail and the header
   * are only decoration, so they can wait for rAF. */
  function onScroll() {
    sweep();
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  document.addEventListener('visibilitychange', onScroll);
  frame();
})();
