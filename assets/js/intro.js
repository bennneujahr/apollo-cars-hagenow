/* Apollo Cars Hagenow — Scroll-Intro: Runway-Film als WebP-Bildsequenz auf <canvas>,
   gescrubbt über die Scroll-Strecke (Vorlage: Skill website-scrollfilm).
   Jedes Element mit data-tl="name:von-bis; ..." bekommt --name = 0..1 je nach Scroll-Fortschritt.
   Daten kommen aus assets/intro/manifest.json (erzeugt von frames.sh).
   Ohne JS, bei "Bewegung reduzieren" oder wenn das erste Frame nicht lädt: statisches Schlussbild
   (poster.webp) mit Hero, siehe html.intro-js im <head> von index.html. */
(() => {
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!intro || !root.classList.contains('intro-js')) return;

  const stage = intro.querySelector('.intro-stage');
  const anchor = intro.querySelector('.intro-anchor');     // liegt auf dem Emblem im Film
  const wordmark = intro.querySelector('.intro-wordmark'); // Schriftzug unter dem Emblem
  const hero = document.getElementById('hero');
  const heroTarget = document.getElementById('top');       // Scroll-Ziel: Ende des Intros

  const NAV_FROM = 0.9;   // ab hier ist das Intro "durch", Header kommt
  const HERO_LIVE = 0.93; // ab hier sind die Hero-Buttons klickbar
  // Randfarbe = Schwarz des Films (Pixelprobe am ersten Frame)
  const FILL = 'rgb(3, 3, 5)';
  const FILL_CLEAR = 'rgba(3, 3, 5, 0)';
  // Hochkant-Film nur auf Touch-Geräten im Hochformat. Computer bekommen IMMER den ganzen Querfilm,
  // auch in schmalen/hohen Fenstern. Gleiche Abfragen in den <link rel="preload"> von index.html.
  const PORTRAIT_QUERY = '(max-width: 900px) and (orientation: portrait) and (hover: none) and (pointer: coarse)';
  const HD_QUERY = '(min-width: 1800px), (min-width: 1000px) and (min-resolution: 1.5dppx)';

  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = t => t * t * (3 - 2 * t);

  const tracks = [...intro.querySelectorAll('[data-tl]')].map(el => ({
    el,
    vars: el.dataset.tl.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const [name, range] = s.split(':');
      const [from, to] = range.split('-').map(Number);
      return { name: '--' + name.trim(), from, to };
    }),
  }));

  let frames = null;
  let queued = false;
  let active = true;

  function progress() {
    const r = intro.getBoundingClientRect();
    const len = r.height - innerHeight;
    return len > 0 ? clamp(-r.top / len) : 1;
  }

  function apply() {
    queued = false;
    if (!active) return;
    const p = progress();
    for (const { el, vars } of tracks) {
      for (const v of vars) el.style.setProperty(v.name, smooth(clamp((p - v.from) / (v.to - v.from))).toFixed(4));
    }
    stage.style.setProperty('--p', p.toFixed(4));
    root.classList.toggle('intro-active', p < NAV_FROM);
    if (hero) hero.classList.toggle('live', p >= HERO_LIVE);
    if (frames) frames.draw(p);
  }

  function request() {
    if (!queued) { queued = true; requestAnimationFrame(apply); }
  }

  // Film nicht verfügbar: zurück auf das statische Schlussbild.
  function fallback() {
    active = false;
    root.classList.remove('intro-js', 'intro-active');
    for (const { el, vars } of tracks) for (const v of vars) el.style.removeProperty(v.name);
    if (hero) hero.classList.add('live');
  }

  async function initFrames() {
    let manifest;
    try {
      const res = await fetch('assets/intro/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return fallback();
      manifest = await res.json();
    } catch (e) {
      return fallback();
    }

    const portrait = matchMedia(PORTRAIT_QUERY).matches;
    const hd = matchMedia(HD_QUERY).matches;
    const set = (portrait && manifest.portrait) || (hd && manifest.hd) || manifest.sd || manifest.hd;
    if (!set || !set.count) return fallback();

    const end = manifest.end ?? 0.92; // Fortschritt, bei dem das letzte Frame erreicht ist
    const canvas = document.getElementById('intro-canvas');
    const ctx = canvas.getContext('2d');
    const images = new Array(set.count);
    const src = i => 'assets/intro/' + set.path.replace('%04d', String(i + 1).padStart(4, '0'));
    let drawn = -1;
    let fit = null;

    function load(i) {
      return new Promise(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { images[i] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = src(i);
      });
    }

    // Grobe Stützstellen zuerst, dann verfeinern: Scrubben sieht früh schon brauchbar aus.
    // Das Schlussbild gleich als Zweites, weil "Überspringen" und das Header-Logo dorthin springen.
    function order(n) {
      const seen = new Set([n - 1]);
      const out = [n - 1];
      for (const step of [16, 8, 4, 2, 1]) {
        for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); out.push(i); }
      }
      if (!seen.has(n - 1)) out.push(n - 1);
      return out;
    }

    async function loadAll() {
      const queue = order(set.count).slice(1);
      const worker = async () => {
        while (queue.length) {
          await load(queue.shift());
          drawn = -1;
          request();
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    }

    function nearest(i) {
      for (let d = 0; d < set.count; d++) {
        if (images[i - d]) return i - d;
        if (images[i + d]) return i + d;
      }
      return -1;
    }

    // "contain": ganzer Film, volle Breite, Höhe aus dem Format (nur bei Fenstern breiter als das
    // Filmformat entscheidet die Höhe). "cover": Film füllt die Bühne (Hochkant-Film auf dem Handy).
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const cw = stage.clientWidth;
      const ch = stage.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      const iw = images[0].naturalWidth;
      const ih = images[0].naturalHeight;
      const s = set.fit === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
      fit = { dpr, s, w: iw * s, h: ih * s, x: (cw - iw * s) / 2, y: (ch - ih * s) / 2 };
      placeAnchor(ch);
      drawn = -1;
    }

    // Anker (Mittelpunkt x/y, Größe d als Anteil der Filmhöhe) auf den Bildschirm umrechnen.
    function placeAnchor(ch) {
      if (!set.anchor || !anchor) return;
      const size = set.anchor.d * fit.h;
      const cx = fit.x + set.anchor.x * fit.w;
      const cy = fit.y + set.anchor.y * fit.h;
      anchor.style.setProperty('--ax', (cx - size / 2).toFixed(1) + 'px');
      anchor.style.setProperty('--ay', (cy - size / 2).toFixed(1) + 'px');
      anchor.style.setProperty('--as', size.toFixed(1) + 'px');
      if (wordmark) {
        const overflow = cy + size / 2 + 14 + wordmark.offsetHeight + 16 - ch;
        wordmark.style.setProperty('--lift', Math.max(0, overflow).toFixed(1) + 'px');
      }
    }

    function draw(p) {
      const i = nearest(Math.round(clamp(p / end) * (set.count - 1)));
      if (i < 0 || i === drawn) return;
      drawn = i;
      const k = fit.dpr;
      const x = fit.x * k, y = fit.y * k, w = fit.w * k, h = fit.h * k;
      const barsY = y > 0.5, barsX = x > 0.5;
      if (barsX || barsY) {
        ctx.fillStyle = FILL;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(images[i], x, y, w, h);
      // Nur ein schmaler Saum: das ganze Bild muss sichtbar bleiben.
      if (barsY) fadeEdges(y, h, 0.03, false);
      if (barsX) fadeEdges(x, w, 0.02, true);
    }

    function fadeEdges(start, size, share, horizontal) {
      const fade = size * share;
      for (const [from, to] of [[start, start + fade], [start + size, start + size - fade]]) {
        const g = horizontal ? ctx.createLinearGradient(from, 0, to, 0) : ctx.createLinearGradient(0, from, 0, to);
        g.addColorStop(0, FILL);
        g.addColorStop(1, FILL_CLEAR);
        ctx.fillStyle = g;
        const a = Math.min(from, to) - 1;
        if (horizontal) ctx.fillRect(a, 0, fade + 2, canvas.height);
        else ctx.fillRect(0, a, canvas.width, fade + 2);
      }
    }

    await load(0);
    if (!images[0]) return fallback();
    intro.classList.add('intro-frames');
    frames = { draw, resize };
    resize();
    request();
    loadAll();
  }

  // Tastatur: Fokus auf einem Hero-Link springt ans Intro-Ende, damit er sichtbar ist.
  if (hero && heroTarget) {
    hero.addEventListener('focusin', () => {
      if (active && progress() < NAV_FROM) heroTarget.scrollIntoView({ block: 'start' });
    });
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { if (frames) frames.resize(); request(); });
  request();
  initFrames();
})();
