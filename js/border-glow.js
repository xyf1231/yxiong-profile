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
  vars['--gradient-base'] = 'linear-gradient(' + colors[0] + ' 0 100%)';
  return vars;
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

function isTouchLikeDevice() {
  return !!(
    (window.matchMedia && (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    )) ||
    "ontouchstart" in window
  );
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
    onEnd: function() { card.classList.remove('sweep-active'); }
  });
}

function restartSweepAnimation(card, opts) {
  if (!card) return;
  delete card.dataset.sweepPlayed;
  card.classList.remove('sweep-active');
  requestAnimationFrame(function() {
    playSweepAnimation(card, opts);
  });
}

function setupPointerTracking(card) {
  if (card.dataset.glowPointer === 'true') return;
  card.dataset.glowPointer = 'true';

  card.addEventListener('pointermove', function(e) {
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
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
  });

  card.addEventListener('pointerleave', function() {
    card.style.setProperty('--edge-proximity', '0');
  });
}

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
  var hoverEnabled = options.hoverEnabled !== false;
  var colors = options.colors || ['#c084fc', '#f472b6', '#38bdf8'];
  var fillOpacity = options.fillOpacity != null ? options.fillOpacity : 0.5;
  var hoverFadeIn = options.hoverFadeIn != null ? options.hoverFadeIn : 180;
  var hoverFadeOut = options.hoverFadeOut != null ? options.hoverFadeOut : 750;
  var touchLike = isTouchLikeDevice();

  var glowVars = buildGlowVars(glowColor, glowIntensity);
  var gradVars = buildGradientVars(colors);
  var sweepOpts = {
    speed: sweepSpeed,
    intensity: sweepIntensity,
    fadeIn: options.sweepFadeIn != null ? options.sweepFadeIn : 500,
    rotateHalf: options.sweepRotate != null ? options.sweepRotate * 0.4 : 1500,
    rotateSecond: options.sweepRotate != null ? options.sweepRotate * 0.6 : 2250,
    rotateDelay: options.sweepRotate != null ? options.sweepRotate * 0.4 : 1500,
    fadeOutDelay: options.sweepRotate != null ? options.sweepRotate : 2500,
    fadeOut: options.sweepFadeOut != null ? options.sweepFadeOut : 1500,
  };

  cards.forEach(function(card) {
    card.style.setProperty('--edge-sensitivity', edgeSensitivity);
    card.style.setProperty('--glow-padding', glowRadius + 'px');
    card.style.setProperty('--cone-spread', coneSpread);
    card.style.setProperty('--fill-opacity', fillOpacity);
    card.style.setProperty('--hover-fade-in', hoverFadeIn + 'ms');
    card.style.setProperty('--hover-fade-out', hoverFadeOut + 'ms');

    for (var key in glowVars) { card.style.setProperty(key, glowVars[key]); }
    for (var key in gradVars) { card.style.setProperty(key, gradVars[key]); }

    var edgeLight = null;
    for (var child = card.firstElementChild; child; child = child.nextElementSibling) {
      if (child.classList && child.classList.contains('edge-light')) {
        edgeLight = child;
        break;
      }
    }
    if (!edgeLight) {
      edgeLight = document.createElement('span');
      edgeLight.className = 'edge-light';
      card.appendChild(edgeLight);
    }

    if (hoverEnabled) setupPointerTracking(card);
    if (touchLike && card.dataset.glowTapReady !== 'true') {
      card.dataset.glowTapReady = 'true';
      card.addEventListener('pointerdown', function(event) {
        if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
        restartSweepAnimation(card, sweepOpts);
      }, { passive: true });
    }

    if (animated) {
      if (options.sweepFadeIn != null) sweepOpts.fadeIn = options.sweepFadeIn;
      if (options.sweepRotate != null) {
        sweepOpts.rotateHalf = options.sweepRotate * 0.4;
        sweepOpts.rotateSecond = options.sweepRotate * 0.6;
        sweepOpts.rotateDelay = sweepOpts.rotateHalf;
        sweepOpts.fadeOutDelay = sweepOpts.rotateHalf + sweepOpts.rotateSecond;
      }
      if (options.sweepFadeOut != null) sweepOpts.fadeOut = options.sweepFadeOut;

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

  setSweepFan(sweepFan);
}
