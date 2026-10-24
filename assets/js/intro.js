/* Apollo Cars Hagenow — Intro: Logo-Scroll-Animation (aus Runway übernommen)
   Das Logo baut sich über die Intro-Strecke auf: Buchstaben, rollendes O,
   „Hagenow“, Auto von rechts, Glanz. Der rAF-Loop läuft nur, solange sich
   etwas bewegt. Ohne JS / bei „Bewegung reduzieren“ bleibt das fertige Logo. */
(function () {
  "use strict";

  var intro = document.getElementById("intro");
  var svg = document.getElementById("introLogo");
  if (!intro || !svg || !svg.getBBox) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  intro.classList.add("is-animated");

  /* ---- Hilfsfunktionen ---- */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function easeOutBack(t, s) { var u = t - 1; return 1 + u * u * ((s + 1) * u + s); }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ---- Elemente ---- */
  var wrap = document.getElementById("introLogoWrap");
  var cue = document.getElementById("introCue");
  var glyphs = ["A1", "P", "O1", "L1", "L2", "O2", "C", "A2", "R", "S"].map(function (id) {
    return document.getElementById(id);
  });
  var disc = document.getElementById("O1");
  var hgs = Array.prototype.slice.call(intro.querySelectorAll("#hagenow .hg"));
  var hgRect = document.getElementById("clipHagRect");
  var lowRect = document.getElementById("clipLowRect");
  var lowerG = document.getElementById("car-lower");
  var upper = document.getElementById("car-upper");
  var shineUse = document.getElementById("shineUse");
  var shine = document.getElementById("shine");

  // Maße einmalig messen (getBBox ignoriert die eigene Transformation)
  var ub = upper.getBBox();
  var discR = disc.getBBox().width / 2;
  var STEP = 0.045, DUR = 0.145;

  /* ---- Zeichnen für Fortschritt p (0 … 1) ---- */
  function render(p) {
    // Buchstaben nacheinander
    for (var i = 0; i < glyphs.length; i++) {
      var g = glyphs[i], t = seg(p, i * STEP, i * STEP + DUR);
      if (t <= 0) { g.style.opacity = 0; g.style.transform = "translate(-9999px,0)"; continue; }
      if (t >= 1) { g.style.opacity = ""; g.style.transform = ""; continue; }
      var e = easeOutQuart(t), inv = 1 - e;
      if (g === disc) {
        // O rollt wie ein Rad herein
        var dx = -520 * inv, rot = (dx / discR) * 180 / Math.PI;
        g.style.transform = "translate(" + dx + "px,0) rotate(" + rot + "deg)";
      } else {
        var dir = i % 2 ? 1 : -1;
        g.style.transform = "translate(" + dir * 40 * inv + "px," + 70 * inv + "px) rotate(" +
          dir * -14 * inv + "deg) scale(" + (0.55 + 0.45 * e) + ")";
      }
      g.style.opacity = clamp(t * 3.2, 0, 1);
    }

    // „Hagenow“ wird eingezeichnet
    var th = seg(p, 0.55, 0.62);
    hgRect.setAttribute("width", th >= 1 ? 900 : easeInOut(th) * 800);
    for (var k = 0; k < hgs.length; k++) {
      var tk = seg(th, k * 0.09, k * 0.09 + 0.4);
      hgs[k].style.opacity = tk >= 1 ? "" : tk;
    }

    // Auto unten: Wisch kurz vor dem oberen Teil
    var tl = seg(p, 0.5, 0.615);
    lowRect.setAttribute("width", tl >= 1 ? 1500 : easeOutCubic(tl) * 1360);
    lowerG.style.opacity = tl >= 1 ? "" : clamp(tl * 4, 0, 1);

    // Auto oben: vom rechten Bildschirmrand, mit Überschwinger
    var tu = seg(p, 0.62, 0.92);
    if (tu <= 0) { upper.style.opacity = 0; upper.style.transform = "translate(9999px,0)"; }
    else if (tu >= 1) { upper.style.opacity = ""; upper.style.transform = ""; }
    else {
      var r = wrap.getBoundingClientRect(), scale = r.width / 2172;
      var start = (window.innerWidth - r.left) / scale - ub.x + 30; // rechter Rand in SVG-Einheiten
      var e2 = easeOutBack(1 - Math.pow(1 - tu, 2.6), 1.35);
      upper.style.opacity = 1;
      upper.style.transform = "translate(" + start * (1 - e2) + "px,0)";
    }

    // Abschluss: Glanz + leichter Puls
    var ts = seg(p, 0.92, 1);
    if (ts > 0 && ts < 1) {
      shineUse.setAttribute("opacity", Math.sin(Math.PI * clamp(ts * 1.4, 0, 1)) * 0.9);
      shine.setAttribute("gradientTransform", "translate(" + (-700 + easeInOut(clamp(ts * 1.25, 0, 1)) * 3300) + " 0) skewX(-20)");
      svg.style.transform = "scale(" + (1 + 0.012 * Math.sin(Math.PI * ts)) + ")";
    } else {
      shineUse.setAttribute("opacity", 0);
      svg.style.transform = "";
    }

    cue.style.opacity = (0.85 * (1 - seg(p, 0, 0.06))).toFixed(3);
  }

  /* ---- Scroll → Fortschritt, weich nachgezogen ---- */
  var target = 0, cur = 0, last = 0, raf = 0;

  function readTarget() {
    var max = intro.offsetHeight - window.innerHeight;
    return clamp(-intro.getBoundingClientRect().top / Math.max(max, 1), 0, 1);
  }

  function loop(now) {
    var dt = Math.min((now - last) / 1000 || 0.016, 0.1);
    last = now;
    target = readTarget();
    cur += (target - cur) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    // Loop beenden, sobald alles steht — spart Akku auf dem Handy
    raf = cur === target ? 0 : requestAnimationFrame(loop);
  }

  function wake() {
    if (raf || readTarget() === cur) return;
    raf = requestAnimationFrame(function (now) { last = now; loop(now); });
  }

  cur = target = readTarget();
  render(cur);
  window.addEventListener("scroll", wake, { passive: true });
  // iOS-Adressleiste / Drehen: Auto-Startpunkt und Strecke neu berechnen
  window.addEventListener("resize", function () { render(cur); wake(); });
})();
