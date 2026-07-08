/* ============================================
   Border Glow — vanilla JS port of React Bits
   ============================================ */

function parseHSL(hslStr) {
  var match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  var hsl = parseHSL(glowColor);
  var base = hsl.h + 'deg ' + hsl.s + '% ' + hsl.l + '%';
  var opacities = [100, 60, 50, 40, 30, 20, 10];
  var keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  var vars = {};
  for (var i = 0; i < opacities.length; i++) {
    vars['--glow-color' + keys[i]] = 'hsl(' + base + ' / ' + Math.min(opacities[i] * intensity, 100) + '%)';
  }
  return vars;
}

var GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
var GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
var COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  var vars = {};
  for (var i = 0; i < 7; i++) {
    var c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = 'radial-gradient(at ' + GRADIENT_POSITIONS[i] + ', ' + c + ' 0px, transparent 50%)';
  }
  vars['--gradient-base'] = 'linear-gradient(var(--card-bg, #101218) 0 100%)';
  return vars;
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

var _fanStyle = null;
function setSweepFan(enabled) {
  if (!_fanStyle) {
    _fanStyle = document.createElement("style");
    _fanStyle.id = "glow-fan-mode";
    document.head.appendChild(_fanStyle);
  }
  _fanStyle.textContent = enabled ? "" :
    ".border-glow-card::before,.border-glow-card>.edge-light{mask-image:none!important;}";
}

function animateValue(opts) {
  var start = opts.start != null ? opts.start : 0;
  var end = opts.end != null ? opts.end : 100;
  var duration = opts.duration || 1000;
  var delay = opts.delay || 0;
  var ease = opts.ease || function(t) { return t; };
  var onUpdate = opts.onUpdate;
  var onEnd = opts.onEnd;

  function tick() {
    var elapsed = performance.now() - t0;
    var t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }

  var t0 = performance.now() + delay;
  if (delay > 0) {
    setTimeout(function() { requestAnimationFrame(tick); }, delay);
  } else {
    requestAnimationFrame(tick);
  }
}

function playSweepAnimation(card, opts) {
  if (card.dataset.sweepPlayed === 'true') return;
  card.dataset.sweepPlayed = 'true';
  opts = opts || {};

  var speed = opts.speed || 1;
  var fadeIn = (opts.fadeIn != null ? opts.fadeIn : 500) / speed;
  var rotateHalf = (opts.rotateHalf != null ? opts.rotateHalf : 1500) / speed;
  var rotateSecond = (opts.rotateSecond != null ? opts.rotateSecond : 2250) / speed;
  var fadeOut = (opts.fadeOut != null ? opts.fadeOut : 1500) / speed;
  var rotateDelay = (opts.rotateDelay != null ? opts.rotateDelay : 1500) / speed;
  var fadeOutDelay = (opts.fadeOutDelay != null ? opts.fadeOutDelay : 2500) / speed;
  var intensity = opts.intensity != null ? opts.intensity : 1;
  var peak = 100 * intensity;
  var fanHover = opts.fanHover;

  // ---- temporary style overrides for sweep color scheme ----
  var sweepColors = opts.colors;
  var sweepGlowColor = opts.glowColor;
  var saved = {};

  function applySweepVars() {
    if (fanHover) setSweepFan(false);
    if (!sweepColors && !sweepGlowColor) return;
    var s = card.style;
    var hoverKeys = ["--glow-color","--glow-color-60","--glow-color-50","--glow-color-40","--glow-color-30","--glow-color-20","--glow-color-10",
      "--gradient-one","--gradient-two","--gradient-three","--gradient-four","--gradient-five","--gradient-six","--gradient-seven","--gradient-base"];
    hoverKeys.forEach(function(k) {
      var cur = s.getPropertyValue(k);
      if (cur) { saved[k] = cur; }
    });
    if (sweepGlowColor) {
      var gv = buildGlowVars(sweepGlowColor, 1.5);
      for (var k in gv) { s.setProperty(k, gv[k]); }
    }
    if (sweepColors) {
      var gv2 = buildGradientVars(sweepColors);
      for (var k in gv2) { s.setProperty(k, gv2[k]); }
    }
  }

  function restoreHoverVars() {
    if (fanHover) setSweepFan(true);
    var s = card.style;
    for (var k in saved) { s.setProperty(k, saved[k]); }
    saved = {};
  }
  // -----------------------------------------------------------

  applySweepVars();
  card.dataset.glowSweeping = "true";

  var angleStart = 110;
  var angleEnd = 465;

  card.classList.add('sweep-active');
  card.style.setProperty('--cursor-angle', angleStart + 'deg');

  animateValue({ duration: fadeIn, end: peak, onUpdate: function(v) {
    card.style.setProperty('--edge-proximity', v);
  }});

  animateValue({ ease: easeInCubic, duration: rotateHalf, end: 50, onUpdate: function(v) {
    card.style.setProperty('--cursor-angle', ((angleEnd - angleStart) * (v / 100) + angleStart) + 'deg');
  }});

  animateValue({ ease: easeOutCubic, delay: rotateDelay, duration: rotateSecond, start: 50, end: 100, onUpdate: function(v) {
    card.style.setProperty('--cursor-angle', ((angleEnd - angleStart) * (v / 100) + angleStart) + 'deg');
  }});

  animateValue({ ease: easeInCubic, delay: fadeOutDelay, duration: fadeOut, start: peak, end: 0,
    onUpdate: function(v) { card.style.setProperty('--edge-proximity', v); },
    onEnd: function() {
      card.classList.remove('sweep-active');
      delete card.dataset.glowSweeping;
      restoreHoverVars();
    }
  });
}

var _lastX = 0, _lastY = 0;
document.addEventListener('pointermove', function(e) {
  _lastX = e.clientX;
  _lastY = e.clientY;
}, { passive: true });

function updateCardGlow(card, clientX, clientY) {
  var rect = card.getBoundingClientRect();
  var x = clientX - rect.left;
  var y = clientY - rect.top;
  var cx = rect.width / 2;
  var cy = rect.height / 2;
  var dx = x - cx;
  var dy = y - cy;

  var kx = Infinity;
  var ky = Infinity;
  if (dx !== 0) kx = cx / Math.abs(dx);
  if (dy !== 0) ky = cy / Math.abs(dy);
  var edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

  var angle = 0;
  if (dx !== 0 || dy !== 0) {
    var radians = Math.atan2(dy, dx);
    angle = radians * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
  }

  card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
  card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
}

function setupPointerTracking(card) {
  if (card.dataset.glowPointer === 'true') return;
  if (window.matchMedia('(hover: none)').matches) return;
  card.dataset.glowPointer = 'true';

  card.addEventListener('pointerenter', function(e) {
    if (card.dataset.glowSweeping) return;
    updateCardGlow(card, e.clientX, e.clientY);
  });

  card.addEventListener('pointermove', function(e) {
    if (card.dataset.glowSweeping) return;
    updateCardGlow(card, e.clientX, e.clientY);
  });

  card.addEventListener('pointerleave', function() {
    if (card.dataset.glowSweeping) return;
    card.style.setProperty('--edge-proximity', '0');
  });
}

function initBorderGlow(cards, options) {
  options = options || {};
  var edgeSensitivity = options.edgeSensitivity != null ? options.edgeSensitivity : 30;
  var glowColor = options.glowColor || '40 80 80';
  var glowRadius = options.glowRadius != null ? options.glowRadius : 40;
  var glowIntensity = options.glowIntensity != null ? options.glowIntensity : 1.0;
  var coneSpread = options.coneSpread != null ? options.coneSpread : 25;
  var animated = options.animated || false;
  var sweepSpeed = options.sweepSpeed != null ? options.sweepSpeed : 1;
  var sweepIntensity = options.sweepIntensity != null ? options.sweepIntensity : 1;
  var sweepFan = options.sweepFan !== false;
  var colors = options.colors || ['#c084fc', '#f472b6', '#38bdf8'];
  var sweepColors = options.sweepColors || null;
  var sweepGlowColor = options.sweepGlowColor || null;
  var fillOpacity = options.fillOpacity != null ? options.fillOpacity : 0.5;

  var glowVars = buildGlowVars(glowColor, glowIntensity);
  var gradVars = buildGradientVars(colors);

  cards.forEach(function(card) {
    card.style.setProperty('--edge-sensitivity', edgeSensitivity);
    card.style.setProperty('--glow-padding', glowRadius + 'px');
    card.style.setProperty('--cone-spread', coneSpread);
    card.style.setProperty('--fill-opacity', fillOpacity);

    for (var key in glowVars) { card.style.setProperty(key, glowVars[key]); }
    for (var key in gradVars) { card.style.setProperty(key, gradVars[key]); }

    setupPointerTracking(card);

    if (animated) {
      var sweepOpts = {};
      sweepOpts.speed = sweepSpeed;
      sweepOpts.intensity = sweepIntensity;
      sweepOpts.fanHover = sweepFan;
      if (sweepColors) sweepOpts.colors = sweepColors;
      if (sweepGlowColor) sweepOpts.glowColor = sweepGlowColor;
      if (options.sweepFadeIn != null) sweepOpts.fadeIn = options.sweepFadeIn;
      if (options.sweepRotate != null) {
        sweepOpts.rotateHalf = options.sweepRotate * 0.4;
        sweepOpts.rotateSecond = options.sweepRotate * 0.6;
        sweepOpts.rotateDelay = sweepOpts.rotateHalf;
        sweepOpts.fadeOutDelay = sweepOpts.rotateHalf + sweepOpts.rotateSecond;
      }
      if (options.sweepFadeOut != null) sweepOpts.fadeOut = options.sweepFadeOut;

      // use rAF to ensure card is laid out; if already visible, play immediately
      card.dataset.sweepOpts = JSON.stringify(sweepOpts);
      requestAnimationFrame(function() {
        var rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0) {
          playSweepAnimation(card, sweepOpts);
        } else {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                playSweepAnimation(card, sweepOpts);
                observer.unobserve(card);
              }
            });
          }, { threshold: 0.3 });
          observer.observe(card);
        }
      });
    }
  });

  setSweepFan(sweepFan);
}

var _scrollTimer = null;
window.addEventListener('scroll', function() {
  clearTimeout(_scrollTimer);
  _scrollTimer = setTimeout(function() {
    var cards = document.querySelectorAll('.border-glow-card');
    for (var i = 0; i < cards.length; i++) {
      var rect = cards[i].getBoundingClientRect();
      if (_lastX >= rect.left && _lastX <= rect.right && _lastY >= rect.top && _lastY <= rect.bottom) {
        updateCardGlow(cards[i], _lastX, _lastY);
      }
    }
  }, 50);
}, { passive: true });

function replayAllSweep() {
  var cards = document.querySelectorAll('.border-glow-card');
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (!c.dataset.sweepOpts) continue;
    delete c.dataset.sweepPlayed;
    c.classList.remove("sweep-active");
    try {
      var opts = JSON.parse(c.dataset.sweepOpts);
      playSweepAnimation(c, opts);
    } catch (e) { /* ignore */ }
  }
}
