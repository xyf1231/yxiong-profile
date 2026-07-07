(function () {
  'use strict';

  var CARD_SELECTORS = [
    '.feature-card',
    '.detail-item',
    '.publication-item',
    '.profile-publication-item',
    '.profile-combo',
    '.timeline li',
    '.profile-view-all-papers .button.secondary',
    '.home-bento-card'
  ];

  function isTouchDevice() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }

  function animateValue(opts) {
    var start = opts.start || 0;
    var end = opts.end || 100;
    var duration = opts.duration || 1000;
    var delay = opts.delay || 0;
    var ease = opts.ease || easeOutCubic;
    var onUpdate = opts.onUpdate;
    var onEnd = opts.onEnd;
    var t0 = performance.now() + delay;

    function tick() {
      var elapsed = performance.now() - t0;
      var t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }

    setTimeout(function () { requestAnimationFrame(tick); }, delay);
  }

  function getCenter(el) {
    var rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    var c = getCenter(el);
    var cx = c[0], cy = c[1];
    var dx = x - cx, dy = y - cy;
    var kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    var ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    var c = getCenter(el);
    var cx = c[0], cy = c[1];
    var dx = x - cx, dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    var deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }

  function initBorderGlow(card) {
    card.classList.add('border-glow-card');

    var edgeLight = document.createElement('span');
    edgeLight.className = 'edge-light';
    card.insertBefore(edgeLight, card.firstChild);

    var computedStyle = window.getComputedStyle(card);
    var br = computedStyle.borderRadius;
    if (br && br !== '0px' && br !== '0') {
      card.style.setProperty('--border-radius', br);
    }

    var overflowVal = computedStyle.overflow;
    if (overflowVal === 'hidden' || overflowVal === 'clip') {
      card.style.overflow = 'visible';
    }

    card.style.borderColor = 'transparent';
    card.style.boxShadow = 'none';

    card.style.background = 'transparent';

    function onPointerMove(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var edge = getEdgeProximity(card, x, y);
      var angle = getCursorAngle(card, x, y);
      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
    }

    card.addEventListener('pointermove', onPointerMove, { passive: true });
    card._borderGlowOnPointerMove = onPointerMove;

    requestAnimationFrame(function () {
      card.classList.add('sweep-active');
      var angleStart = 110;
      var angleEnd = 465;
      card.style.setProperty('--cursor-angle', angleStart + 'deg');

      animateValue({
        duration: 500,
        onUpdate: function (v) { card.style.setProperty('--edge-proximity', v.toFixed(1)); }
      });
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: function (v) {
          card.style.setProperty('--cursor-angle', ((angleEnd - angleStart) * (v / 100) + angleStart).toFixed(1) + 'deg');
        }
      });
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: function (v) {
          card.style.setProperty('--cursor-angle', ((angleEnd - angleStart) * (v / 100) + angleStart).toFixed(1) + 'deg');
        }
      });
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: function (v) { card.style.setProperty('--edge-proximity', v.toFixed(1)); },
        onEnd: function () { card.classList.remove('sweep-active'); }
      });
    });
  }

  function initAll() {
    if (isTouchDevice()) return;

    CARD_SELECTORS.forEach(function (sel) {
      var cards = document.querySelectorAll(sel);
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('border-glow-card')) continue;
        initBorderGlow(card);
      }
    });
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    initAll();
    var retries = 5;
    var interval = setInterval(function () {
      initAll();
      retries -= 1;
      if (retries <= 0) clearInterval(interval);
    }, 800);
  });
})();
