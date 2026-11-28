// quiet-field.js — the background "quiet field": a dot grid, two slow lights, and a few
// signals that travel the grid the way work moves through a system.
//
// Framework-free port of the prototype logic (the fx* methods in prototypes/*.dc.html).
// Every movement is a Web Animation on transform/opacity of elements that already exist
// in the markup (pools of signals, dots and rings). No per-frame script.
//
// Usage (see code/astro/field/QuietField.astro):
//   const field = new QuietField(rootEl, { density: 3.5, idle: true, critGap: 6000, meet: true });
//   field.start();             // call after layout settles
//   field.pause('still', true) // the page's pause button
//   field.setMode('reveal')    // 'quiet' | 'reveal' | 'off'
//   field.stop();              // before a page swap

export const FIELD_DEFAULTS = {
  pitch: 32,          // grid spacing in px (4 x the 8-pt grid)
  density: 3.5,       // signals per 1440x900 of visible page
  idle: true,         // after idleMs without input, the stand-up easter egg
  idleMs: 60000,
  critGap: 6000,      // ms between critical-path (caramel) signals
  meet: true,         // "meeting halfway" pairs
  greet: false,       // console note on start
  keyboard: true,     // Konami code and "salam"
  focus: null,        // (W, H) => [x, y]: where eggs land when no section is visible
  quietSelector: 'p,h1,h2,h3,h4,a,button,label,li,dt,dd,figcaption,blockquote,input',
  glassSelector: '.fx,.fx-legend,.sp-win,.sp-orn,.sp-nav,.sp-status,.fx-glass',
  zoneSelector: '.fx-zone',          // whole boxes the signals stay out of (the post article)
  emptyBlockers: 'a,button,input,textarea,select,label,p,h1,h2,h3,h4,li,dt,dd,blockquote,figure,figcaption,img,svg,nav,[role],[tabindex],.sp-win,.sp-orn,.sp-nav,.sp-status,.fx-glass',
  onLights: null,     // ({ dz, fl, dzT, flT, dzW, flW }) => void, called on start and every 5 minutes
};

const KINDS_WITH_RESPONSE = new Set(['req']);
const KONAMI = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a';

export class QuietField {
  constructor(root, options = {}) {
    this.root = root;
    this.scope = options.scope || root.parentElement;
    this.cfg = Object.assign({}, FIELD_DEFAULTS, options);
    this.mode = options.mode || 'quiet';
    this.P = this.cfg.pitch;
    this.started = false;
  }

  // ---------------------------------------------------------------- lifecycle
  start() {
    if (this.started || !this.root) return;
    const root = this.root;
    if (typeof root.animate !== 'function') return;
    const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
    const css = getComputedStyle(document.documentElement);
    const usable = (ease, fallback) => {
      if (!ease) return fallback;
      try { root.animate([{ opacity: 1, easing: ease }, { opacity: 1 }], 1).cancel(); return ease; } catch (e) { return fallback; }
    };
    const all = (sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
    this.glide = usable((css.getPropertyValue('--spring-glide') || '').trim(), 'cubic-bezier(.2,.8,.2,1)');
    this.pop = usable((css.getPropertyValue('--spring-pop') || '').trim(), 'cubic-bezier(.3,1.3,.5,1)');
    this.sigs = all('.fx-sig').map((el) => ({ el, core: el.querySelector('.fx-core'), busy: false, kind: '', anim: null, run: 0, dt: 0 }));
    if (!this.sigs.length) return;
    this.dots = all('.fx-dot'); this.di = 0;
    this.rings = all('.fx-ring'); this.ri = 0;
    this.ear = root.querySelector('.fx-ear');
    this.wave = root.querySelector('.fx-ripple');
    this.bp = root.querySelector('.fx-bp');
    this.timers = new Set(); this.vis = new Map(); this.quiet = new Set(); this.why = new Set(); this.held = [];
    this.reduce = mq('(prefers-reduced-motion: reduce)');
    this.lite = !!(navigator.connection && navigator.connection.saveData);
    this.paused = false; this.last = Date.now(); this.critAt = 0; this.meetAt = Date.now() - 12000;
    this.rtl = 0; this.hush = 0; this.stand = null; this.hold = null; this.moveAt = 0; this.kc = []; this.word = '';
    this.started = true;

    const secs = this.scope ? this.scope.querySelectorAll('section') : [];
    if (secs.length && 'IntersectionObserver' in window) {
      this.io = new IntersectionObserver((list) => list.forEach((e) => {
        if (e.isIntersecting && e.intersectionRect.height > 0) {
          const b = e.boundingClientRect, r = e.intersectionRect;
          this.vis.set(e.target, { dt: r.top - b.top, dl: r.left - b.left, h: r.height, w: r.width });
        } else this.vis.delete(e.target);
      }), { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
      secs.forEach((s) => this.io.observe(s));
    }
    if ('ResizeObserver' in window && this.scope) {
      this.ro = new ResizeObserver(() => this.requestQuiet(300));
      this.ro.observe(this.scope);
    }
    this.onVis = () => this.pause('hidden', !!document.hidden);
    this.onScroll = () => this.poke();
    this.onDown = (e) => this.pointerDown(e);
    this.onUp = () => this.pointerUp();
    this.onMove = (e) => this.pointerMove(e);
    this.onLeave = () => this.pointerLeave();
    this.onKey = (e) => this.key(e);
    document.addEventListener('visibilitychange', this.onVis);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.scope.addEventListener('pointerdown', this.onDown);
    this.scope.addEventListener('pointerup', this.onUp);
    this.scope.addEventListener('pointercancel', this.onUp);
    this.scope.addEventListener('pointermove', this.onMove, { passive: true });
    this.scope.addEventListener('pointerleave', this.onLeave);
    if (this.cfg.keyboard) document.addEventListener('keydown', this.onKey);

    this.tick = setInterval(() => this.step(), 700);
    this.lights();
    this.lightsT = setInterval(() => this.lights(), 300000);
    this.computeQuiet();
    this.setMode(this.mode);
    this.pause('hidden', !!document.hidden);
    if (!this.reduce && new Date().getHours() < 5) this.later(() => this.nightOwl(), 9000);
    if (this.cfg.greet) this.consoleNote();
  }

  stop() {
    if (!this.started) return;
    this.started = false;
    clearInterval(this.tick); clearInterval(this.lightsT); clearTimeout(this.qT); clearTimeout(this.holdT);
    this.timers.forEach((id) => clearTimeout(id));
    if (this.io) this.io.disconnect();
    if (this.ro) this.ro.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
    window.removeEventListener('scroll', this.onScroll);
    this.scope.removeEventListener('pointerdown', this.onDown);
    this.scope.removeEventListener('pointerup', this.onUp);
    this.scope.removeEventListener('pointercancel', this.onUp);
    this.scope.removeEventListener('pointermove', this.onMove);
    this.scope.removeEventListener('pointerleave', this.onLeave);
    document.removeEventListener('keydown', this.onKey);
    try { this.root.getAnimations({ subtree: true }).forEach((a) => a.cancel()); } catch (e) { /* older engines */ }
  }

  later(fn, ms) {
    const id = setTimeout(() => { this.timers.delete(id); if (this.started) fn(); }, Math.max(0, ms));
    this.timers.add(id);
  }

  requestQuiet(ms = 450) {
    clearTimeout(this.qT);
    this.qT = setTimeout(() => this.computeQuiet(), ms);
  }

  pause(reason, on) {
    if (!this.started) return;
    if (on) this.why.add(reason); else this.why.delete(reason);
    const stop = this.why.size > 0;
    if (stop === this.paused) return;
    this.paused = stop;
    if (stop) {
      let list = [];
      try { list = this.root.getAnimations({ subtree: true }).filter((a) => a.playState === 'running'); } catch (e) { list = []; }
      list.forEach((a) => a.pause());
      this.held = list;
    } else {
      this.held.forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (e) { /* gone */ } });
      this.held = [];
      this.last = Date.now();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.root.classList.toggle('fx-off', mode === 'off');
    this.root.classList.toggle('fx-reveal', mode === 'reveal');
    if (!this.started) return;
    if (mode === 'off') {
      this.standup(false);
      this.sigs.forEach((s) => { s.run++; s.el.getAnimations().forEach((a) => a.cancel()); s.busy = false; s.kind = ''; s.anim = null; });
    }
  }

  poke() {
    if (!this.started) return;
    this.last = Date.now();
    if (this.stand) this.standup(false);
  }

  // ---------------------------------------------------------------- geometry
  // Text that sits straight on the page is a quiet zone: signals route around it,
  // so a halo never lowers the contrast of a heading, link or caption.
  computeQuiet() {
    if (!this.started || !this.scope) return;
    const rr = this.root.getBoundingClientRect();
    const P = this.P, pad = 22, q = new Set();
    const add = (b) => {
      if (!b.width || !b.height) return;
      const i0 = Math.floor((b.left - rr.left - pad - 16) / P), i1 = Math.ceil((b.right - rr.left + pad - 16) / P);
      const j0 = Math.floor((b.top - rr.top - pad - 16) / P), j1 = Math.ceil((b.bottom - rr.top + pad - 16) / P);
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) q.add(i + ',' + j);
    };
    this.scope.querySelectorAll(this.cfg.quietSelector).forEach((el) => {
      if (el.closest(this.cfg.glassSelector)) return;
      const r = document.createRange();
      r.selectNodeContents(el);
      const rects = r.getClientRects();
      if (rects.length) Array.prototype.forEach.call(rects, add); else add(el.getBoundingClientRect());
    });
    this.scope.querySelectorAll(this.cfg.zoneSelector).forEach((el) => add(el.getBoundingClientRect()));
    this.quiet = q;
  }

  region() {
    const root = this.root, W = root.clientWidth, H = root.clientHeight;
    if (!this.io) {
      const f = this.cfg.focus ? this.cfg.focus(W, H) : [W / 2, Math.min(H, 900) / 2];
      return { x0: 0, x1: W, y0: 0, y1: H, cx: f[0], cy: f[1] };
    }
    const rr = root.getBoundingClientRect();
    let y0 = Infinity, y1 = -Infinity, best = null, bestH = 0;
    this.vis.forEach((v, el) => {
      const b = el.getBoundingClientRect();
      const top = b.top - rr.top + v.dt;
      if (v.h <= 0) return;
      y0 = Math.min(y0, top); y1 = Math.max(y1, top + v.h);
      if (v.h > bestH) { bestH = v.h; best = { cx: b.left - rr.left + v.dl + v.w / 2, cy: top + v.h / 2 }; }
    });
    if (!best) { const h = Math.min(H, 900); return { x0: 0, x1: W, y0: 0, y1: h, cx: W / 2, cy: h / 2 }; }
    return { x0: 0, x1: W, y0: Math.max(0, y0 - 96), y1: Math.min(H, y1 + 96), cx: best.cx, cy: best.cy };
  }

  bounds(R) {
    const P = this.P;
    return { c0: Math.max(0, Math.ceil((R.x0 - 16) / P) + 1), c1: Math.floor((R.x1 - 16) / P) - 1,
      r0: Math.max(0, Math.ceil((R.y0 - 16) / P) + 1), r1: Math.floor((R.y1 - 16) / P) - 1 };
  }

  free() { return this.sigs.find((s) => !s.busy) || null; }

  pick(B) {
    for (let t = 0; t < 30; t++) {
      const i = B.c0 + Math.floor(Math.random() * (B.c1 - B.c0 + 1));
      const j = B.r0 + Math.floor(Math.random() * (B.r1 - B.r0 + 1));
      if (!this.quiet.has(i + ',' + j)) return [i, j];
    }
    return null;
  }

  // A route: straight runs of 2 to 6 dots, a quarter turn between runs,
  // never through a quiet zone and never back on itself.
  path(start, dir, segs, B, rtl) {
    const ok = (i, j) => i >= B.c0 && i <= B.c1 && j >= B.r0 && j <= B.r1 && !this.quiet.has(i + ',' + j);
    const pts = [[start[0], start[1]]];
    let cur = [start[0], start[1]];
    let d = dir || [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
    if (rtl && d[0] === 1) d = [-1, 0];
    for (let k = 0; k < segs; k++) {
      if (k > 0) {
        const turns = d[0] !== 0 ? [[0, 1], [0, -1]] : (rtl ? [[-1, 0], [-1, 0], [-1, 0], [1, 0]] : [[1, 0], [-1, 0]]);
        const first = turns[Math.floor(Math.random() * turns.length)];
        const other = [-first[0], -first[1]];
        d = ok(cur[0] + first[0], cur[1] + first[1]) ? first : (ok(cur[0] + other[0], cur[1] + other[1]) ? other : null);
        if (!d) break;
      }
      const want = 2 + Math.floor(Math.random() * 5);
      let n = 0;
      while (n < want && ok(cur[0] + d[0] * (n + 1), cur[1] + d[1] * (n + 1))) n++;
      if (n === 0) {
        if (k > 0) break;
        const alts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter((v) => ok(cur[0] + v[0], cur[1] + v[1]));
        if (!alts.length) break;
        d = alts[Math.floor(Math.random() * alts.length)];
        while (n < want && ok(cur[0] + d[0] * (n + 1), cur[1] + d[1] * (n + 1))) n++;
      }
      cur = [cur[0] + d[0] * n, cur[1] + d[1] * n];
      pts.push([cur[0], cur[1]]);
    }
    return pts;
  }

  // ---------------------------------------------------------------- the scheduler
  step() {
    if (!this.started || this.paused || this.mode === 'off' || this.reduce || this.lite) return;
    const now = Date.now(), cfg = this.cfg;
    if (cfg.idle && !this.stand && now - this.last > cfg.idleMs) { this.standup(true); return; }
    if (this.stand) return;
    const R = this.region();
    const want = Math.max(1, Math.min(this.sigs.length - 2, Math.round((R.x1 - R.x0) * (R.y1 - R.y0) / 1296000 * cfg.density)));
    let live = 0;
    this.sigs.forEach((s) => { if (s.busy) live++; });
    if (cfg.meet && now - this.meetAt > 23000 && live + 2 <= this.sigs.length) {
      this.meetAt = now;
      if (this.meeting(R)) return;
    }
    if (live < want) this.spawn(R, {});
  }

  spawn(R, o = {}) {
    // a paused field starts nothing, whoever asks: the "salam" egg asks half a second after the key press
    if (this.paused) return null;
    const s = this.free();
    if (!s) return null;
    const B = this.bounds(R);
    if (B.c1 - B.c0 < 6 || B.r1 - B.r0 < 3) return null;
    const now = Date.now(), rtl = now < this.rtl;
    let kind = o.kind;
    if (!kind) kind = (!this.sigs.some((x) => x.busy && x.kind === 'crit') && now - this.critAt > this.cfg.critGap) ? 'crit' : 'req';
    let start = o.at || null, dir = o.dir || null;
    if (!start) {
      if (rtl || Math.random() < 0.45) {
        const fromLeft = !rtl && Math.random() < 0.5;
        const i = fromLeft ? B.c0 : B.c1;
        for (let t = 0; t < 12 && !start; t++) {
          const j = B.r0 + Math.floor(Math.random() * (B.r1 - B.r0 + 1));
          if (!this.quiet.has(i + ',' + j)) start = [i, j];
        }
        dir = fromLeft ? [1, 0] : [-1, 0];
      }
      if (!start) { start = this.pick(B); dir = null; }
    }
    if (!start) return null;
    const segs = kind === 'crit' ? 6 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3);
    const pts = this.path(start, dir, segs, B, rtl);
    if (pts.length < 2) return null;
    if (kind === 'crit') this.critAt = now;
    this.run(s, pts, kind, o);
    return s;
  }

  run(s, pts, kind, o = {}) {
    const P = this.P, owl = kind === 'owl';
    const px = (n) => [n[0] * P + 16, n[1] * P + 16];
    const tr = (p) => 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)';
    const run = ++s.run;
    const way = (o.from ? [o.from] : []).concat(pts.map(px));
    const nodes = (o.from ? [null] : []).concat(pts);
    const speed = owl ? 0.34 : 0.085, hold = owl ? 0 : 150;
    const ease = owl ? 'cubic-bezier(.45,0,.55,1)' : this.glide;
    const kf = [{ transform: tr(way[0]), easing: ease }];
    const times = [0], segs = [];
    let t = 0;
    for (let k = 1; k < way.length; k++) {
      const len = Math.abs(way[k][0] - way[k - 1][0]) + Math.abs(way[k][1] - way[k - 1][1]);
      const d = (owl ? 60 : 240) + len / speed;
      segs.push({ t0: t, d, a: nodes[k - 1], b: nodes[k] });
      t += d;
      const mid = hold && k < way.length - 1;
      kf.push({ transform: tr(way[k]), easing: mid ? 'linear' : ease });
      times.push(t);
      if (mid) { t += hold; kf.push({ transform: tr(way[k]), easing: ease }); times.push(t); }
    }
    const total = Math.max(t, 1);
    kf.forEach((f, i) => { f.offset = i === kf.length - 1 ? 1 : times[i] / total; });
    s.el.getAnimations().forEach((a) => a.cancel());
    if (s.core) s.core.getAnimations().forEach((a) => a.cancel());
    s.el.setAttribute('data-kind', kind);
    s.busy = true; s.kind = kind;
    const peak = kind === 'res' ? 0.42 : 0.8;
    const fi = o.noIn ? 0 : Math.min(450, total * 0.18), fo = o.noOut ? 0 : Math.min(650, total * 0.2);
    const op = [{ opacity: o.noIn ? peak : 0 }];
    if (fi) op.push({ opacity: peak, offset: fi / total });
    if (fo) op.push({ opacity: peak, offset: 1 - fo / total });
    op.push({ opacity: o.noOut ? peak : 0 });
    const anim = s.el.animate(kf, { duration: total, fill: 'forwards' });
    s.el.animate(op, { duration: total, fill: 'forwards' });
    s.anim = anim;
    if (kind === 'grow' && s.core) s.core.animate([{ transform: 'scale(.3)' }, { transform: 'scale(1)' }], { duration: Math.min(total, 2400), easing: this.pop, fill: 'forwards' });
    // the dots it passes light up behind it and fade
    const tone = kind === 'crit' || owl ? 'crit' : kind === 'grow' ? 'grow' : '';
    const gl = { life: owl ? 3600 : kind === 'crit' ? 2800 : kind === 'res' ? 1500 : 2200, peak: kind === 'res' ? 0.28 : (kind === 'crit' || owl) ? 0.75 : 0.5 };
    segs.forEach((g) => {
      if (!g.a || !g.b) return;
      const n = Math.abs(g.b[0] - g.a[0]) + Math.abs(g.b[1] - g.a[1]);
      const di = Math.sign(g.b[0] - g.a[0]), dj = Math.sign(g.b[1] - g.a[1]);
      this.later(() => {
        if (s.run !== run || this.paused) return;
        for (let m = 1; m <= n; m++) {
          const u = owl ? m / n : 1 - Math.pow(1 - m / n, 1 / 2.4);
          this.glint(px([g.a[0] + di * m, g.a[1] + dj * m]), tone, g.d * u, gl);
        }
      }, g.t0);
    });
    // the critical path wakes a dim dot beside it, which sets off on its own
    if (kind === 'crit' && segs.length >= 3 && Math.random() < 0.65) {
      const g = segs[Math.floor(segs.length / 2)];
      if (g.a && g.b) {
        const flat = g.b[1] === g.a[1], side = Math.random() < 0.5 ? 1 : -1;
        const seed = flat ? [g.b[0], g.b[1] + side] : [g.b[0] + side, g.b[1]];
        this.later(() => {
          if (s.run !== run || this.paused || this.stand || this.quiet.has(seed[0] + ',' + seed[1])) return;
          this.glint(px(seed), 'grow', 0, { life: 2600, peak: 0.85, scale: 1.7 });
          this.later(() => {
            if (!this.paused && !this.stand && this.mode !== 'off') this.spawn(this.region(), { kind: 'grow', at: seed, dir: flat ? [0, side] : [side, 0] });
          }, 900);
        }, g.t0 + g.d);
      }
    }
    anim.onfinish = () => { if (s.run === run) this.done(s, pts, kind, o, run); };
  }

  done(s, pts, kind, o, run) {
    if (!this.started || s.run !== run) return;
    s.busy = false; s.kind = ''; s.anim = null;
    if (o && o.then) { o.then(s); return; }
    if (KINDS_WITH_RESPONSE.has(kind) && Math.random() < 0.6 && !this.paused && !this.stand && this.mode !== 'off') {
      s.busy = true; s.kind = 'wait';
      this.later(() => {
        if (s.kind !== 'wait') return;
        if (this.paused || this.stand || this.mode === 'off') { s.busy = false; s.kind = ''; return; }
        this.run(s, pts.slice().reverse(), 'res', {});
      }, 420);
    }
  }

  glint(p, tone, delay, o = {}) {
    if (!this.dots.length) return;
    if (!o.force && (this.paused || Date.now() < this.hush)) return;
    if (!o.anywhere && this.quiet.has(Math.round((p[0] - 16) / this.P) + ',' + Math.round((p[1] - 16) / this.P))) return;
    const el = this.dots[this.di];
    this.di = (this.di + 1) % this.dots.length;
    el.getAnimations().forEach((a) => a.cancel());
    if (tone) el.setAttribute('data-tone', tone); else el.removeAttribute('data-tone');
    const at = 'translate(' + p[0] + 'px,' + p[1] + 'px) ';
    const sc = o.scale || 1, life = o.life || 2200, peak = o.peak == null ? 0.5 : o.peak;
    const s0 = this.reduce ? sc : sc * 0.3;
    const kf = o.hold
      ? [{ transform: at + 'scale(' + s0 + ')', opacity: 0, easing: this.reduce ? 'linear' : this.pop },
        { transform: at + 'scale(' + sc + ')', opacity: peak, offset: 0.08 },
        { transform: at + 'scale(' + sc + ')', opacity: peak, offset: 0.72, easing: 'ease-in' },
        { transform: at + 'scale(' + sc + ')', opacity: 0 }]
      : [{ transform: at + 'scale(' + (sc * 0.5) + ')', opacity: 0, easing: 'ease-out' },
        { transform: at + 'scale(' + sc + ')', opacity: peak, offset: Math.min(0.25, 160 / life), easing: 'cubic-bezier(.4,0,.7,1)' },
        { transform: at + 'scale(' + sc + ')', opacity: 0 }];
    el.animate(kf, { duration: life, delay: Math.max(0, delay || 0), fill: 'both' });
  }

  ringAt(p, tone, o = {}) {
    if (!this.rings.length) return null;
    const el = this.rings[this.ri];
    this.ri = (this.ri + 1) % this.rings.length;
    el.getAnimations().forEach((a) => a.cancel());
    if (tone) el.setAttribute('data-tone', tone); else el.removeAttribute('data-tone');
    const at = 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px) ';
    if (o.loop) {
      el.animate([{ transform: at + 'scale(.6)', opacity: 0.35 }, { transform: at + 'scale(.95)', opacity: 0.85 }, { transform: at + 'scale(.6)', opacity: 0.35 }],
        { duration: 3400, iterations: Infinity, easing: 'ease-in-out' });
      return el;
    }
    el.animate([{ transform: at + 'scale(.3)', opacity: 0.8 }, { transform: at + 'scale(1.6)', opacity: 0 }],
      { duration: this.reduce ? 600 : 1500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    return el;
  }

  pos(s) {
    try {
      const m = getComputedStyle(s.el).transform;
      const v = m && m.match(/matrix\(([^)]+)\)/);
      if (!v) return null;
      const a = v[1].split(',').map(Number);
      return [a[4], a[5]];
    } catch (e) { return null; }
  }

  center() {
    const P = this.P, R = this.region(), B = this.bounds(R);
    const ci = Math.round((R.cx - 16) / P), cj = Math.round((R.cy - 16) / P);
    const roomy = (i, j) => {
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (this.quiet.has((i + a) + ',' + (j + b))) return false;
      return true;
    };
    for (let r = 0; r < 9; r++) {
      for (let a = -r; a <= r; a++) {
        for (let b = -r; b <= r; b++) {
          if (Math.max(Math.abs(a), Math.abs(b)) !== r) continue;
          const i = ci + a, j = cj + b;
          if (i >= B.c0 + 2 && i <= B.c1 - 2 && j >= B.r0 + 2 && j <= B.r1 - 2 && roomy(i, j)) return [i * P + 16, j * P + 16];
        }
      }
    }
    return [ci * P + 16, cj * P + 16];
  }

  // ---------------------------------------------------------------- habits
  // Two signals start from opposite sides, meet in the middle and go on together.
  meeting(R) {
    const P = this.P, B = this.bounds(R);
    if (B.c1 - B.c0 < 18 || B.r1 - B.r0 < 6) return false;
    const k = Math.min(9, Math.max(5, Math.floor((B.c1 - B.c0) / 5)));
    let row = -1, m = 0;
    for (let t = 0; t < 16 && row < 0; t++) {
      const mm = Math.round(B.c0 + k + Math.random() * (B.c1 - B.c0 - 2 * k));
      const j = B.r0 + 1 + Math.floor(Math.random() * Math.max(1, B.r1 - B.r0 - 1));
      let clear = true;
      for (let i = mm - k; i <= mm + k && clear; i++) if (this.quiet.has(i + ',' + j)) clear = false;
      if (clear) { row = j; m = mm; }
    }
    if (row < 0) return false;
    const a = this.free();
    if (!a) return false;
    a.busy = true;
    const b = this.free();
    a.busy = false;
    if (!b) return false;
    const mid = [m, row];
    const vert = row - B.r0 > B.r1 - row ? -1 : 1;
    const shared = this.path(mid, [0, vert], 3, B, false);
    if (shared.length < 2) return false;
    this.run(a, [[m - k, row], mid], 'meet', { noOut: true, then: (s) => {
      this.ringAt([m * P + 16, row * P + 16], 'grow');
      this.run(s, shared, 'meet', { noIn: true });
    } });
    this.run(b, [[m + k, row], mid], 'meet', { noOut: true, then: (s) => {
      s.busy = true; s.kind = 'wait';
      this.later(() => {
        if (s.kind !== 'wait') return;
        if (this.paused || this.stand || this.mode === 'off') { s.busy = false; s.kind = ''; return; }
        this.run(s, shared, 'meet', { noIn: true });
      }, 300);
    } });
    return true;
  }

  detour(s, p, ptr) {
    const P = this.P, B = this.bounds(this.region());
    const n = [Math.min(B.c1, Math.max(B.c0, Math.round((p[0] - 16) / P))), Math.min(B.r1, Math.max(B.r0, Math.round((p[1] - 16) / P)))];
    const vx = p[0] - ptr[0], vy = p[1] - ptr[1];
    const away = Math.abs(vx) > Math.abs(vy) ? [Math.sign(vx) || 1, 0] : [0, Math.sign(vy) || 1];
    const route = this.path(n, away, 3, B, Date.now() < this.rtl);
    if (route.length < 2) return;
    this.run(s, route, 'detour', { from: p, noIn: true });
  }

  standup(on) {
    if (!this.started) return;
    const tr = (p) => 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)';
    if (on) {
      if (this.stand || this.reduce || this.mode === 'off') return;
      const c = this.center();
      const team = this.sigs.slice(0, 6), R = 58;
      this.stand = { c, team, mid: this.ringAt(c, 'crit', { loop: true }) };
      team.forEach((s, k) => {
        const was = s.busy ? this.pos(s) : null;
        s.run++;
        s.el.getAnimations().forEach((a) => a.cancel());
        if (s.core) s.core.getAnimations().forEach((a) => a.cancel());
        s.busy = true; s.kind = 'stand'; s.anim = null;
        s.el.setAttribute('data-kind', 'stand');
        const th = (k / team.length) * Math.PI * 2 - Math.PI / 2;
        const seat = [c[0] + Math.cos(th) * R, c[1] + Math.sin(th) * R];
        const from = was || [c[0] + Math.cos(th) * 220, c[1] + Math.sin(th) * 220];
        const walk = s.el.animate([{ transform: tr(from), opacity: was ? 0.75 : 0 }, { transform: tr(seat), opacity: 0.75 }],
          { duration: 1800 + k * 140, easing: this.glide, fill: 'forwards' });
        walk.onfinish = () => {
          if (!this.stand || s.kind !== 'stand') return;
          const kf = [];
          for (let q = 0; q <= 48; q++) {
            const a = th + (q / 48) * Math.PI * 2;
            kf.push({ transform: tr([c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]), opacity: 0.75 });
          }
          s.el.getAnimations().forEach((a) => a.cancel());
          s.el.animate(kf, { duration: 30000, iterations: Infinity });
        };
      });
      return;
    }
    if (!this.stand) return;
    const st = this.stand;
    this.stand = null;
    if (st.mid) st.mid.getAnimations().forEach((a) => a.cancel());
    st.team.forEach((s) => {
      if (s.kind !== 'stand') return;
      const p = this.pos(s) || st.c;
      s.el.getAnimations().forEach((a) => a.cancel());
      const n = [Math.round((p[0] - 16) / this.P) * this.P + 16, Math.round((p[1] - 16) / this.P) * this.P + 16];
      const out = s.el.animate([{ transform: tr(p), opacity: 0.75 }, { transform: tr(n), opacity: 0 }], { duration: 650, easing: this.pop, fill: 'forwards' });
      out.onfinish = () => { if (s.kind === 'stand') { s.busy = false; s.kind = ''; } };
    });
  }

  // ---------------------------------------------------------------- input
  isEmpty(t) {
    return !(t && t.closest && t.closest(this.cfg.emptyBlockers));
  }

  pointerMove(e) {
    if (!this.started) return;
    this.last = Date.now();
    if (this.stand) this.standup(false);
    if (this.hold && Math.abs(e.clientX - this.hold.sx) + Math.abs(e.clientY - this.hold.sy) > 12) this.pointerUp();
    if (this.mode === 'off' || (e.pointerType && e.pointerType !== 'mouse')) return;
    const now = performance.now();
    if (now - this.moveAt < 50) return;
    this.moveAt = now;
    const rr = this.root.getBoundingClientRect();
    const x = e.clientX - rr.left, y = e.clientY - rr.top;
    if (this.ear) {
      const open = this.isEmpty(e.target);
      this.ear.style.opacity = open ? '1' : '0';
      if (open) {
        this.ear.style.transform = 'translate(' + (x - 144) + 'px,' + (y - 144) + 'px)';
        this.ear.style.backgroundPosition = (144 - x) + 'px ' + (144 - y) + 'px';
      }
    }
    if (this.paused || this.reduce || this.stand) return;
    this.sigs.forEach((s) => {
      if (!s.busy || !s.anim || s.kind === 'stand' || s.kind === 'wait' || s.kind === 'owl' || now - s.dt < 1800) return;
      const p = this.pos(s);
      if (!p) return;
      const dx = p[0] - x, dy = p[1] - y;
      if (dx * dx + dy * dy > 100 * 100) return;
      s.dt = now;
      this.detour(s, p, [x, y]);
    });
  }

  pointerLeave() {
    if (!this.started) return;
    if (this.ear) this.ear.style.opacity = '0';
    this.pointerUp();
  }

  // Press and hold empty background: the grid draws the engine under the page.
  pointerDown(e) {
    if (!this.started) return;
    this.poke();
    if (this.mode === 'off' || e.button !== 0 || !this.isEmpty(e.target)) return;
    const rr = this.root.getBoundingClientRect();
    const x = e.clientX - rr.left, y = e.clientY - rr.top;
    this.hold = { x, y, sx: e.clientX, sy: e.clientY };
    clearTimeout(this.holdT);
    if (this.wave) {
      this.wave.getAnimations().forEach((a) => a.cancel());
      const at = 'translate(' + x + 'px,' + y + 'px) ';
      this.wave.animate([{ transform: at + 'scale(.02)', opacity: 0 }, { transform: at + 'scale(.1)', opacity: 0.9 }],
        { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
    this.holdT = setTimeout(() => {
      const h = this.hold;
      this.hold = null;
      if (h && this.started) this.hiddenEngine(h.x, h.y);
    }, 650);
  }

  pointerUp() {
    if (!this.hold) return;
    this.hold = null;
    clearTimeout(this.holdT);
    if (this.wave) this.wave.getAnimations().forEach((a) => a.cancel());
  }

  key(e) {
    if (!this.started) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return; // never while typing in a field
    this.poke();
    const k = e.key || '';
    this.kc = this.kc.concat(k.length === 1 ? k.toLowerCase() : k).slice(-10);
    if (this.kc.join(' ') === KONAMI) { this.kc = []; this.hello(); }
    if (k.length === 1) {
      this.word = (this.word + k.toLowerCase()).slice(-6);
      if (/salam$/.test(this.word) || /سلام$/.test(this.word)) { this.word = ''; this.rightToLeft(); }
    }
  }

  // ---------------------------------------------------------------- easter eggs
  hiddenEngine(x, y) {
    if (!this.bp) return;
    const P = this.P, W = 448, H = 352, life = 6400;
    const left = Math.round((x - W / 2) / P) * P, top = Math.round((y - H / 2) / P) * P;
    const cx = Math.round(x - left), cy = Math.round(y - top);
    const pos = 'translate(' + left + 'px,' + top + 'px)';
    this.hush = Date.now() + 5600;
    this.bp.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    const lines = Array.prototype.slice.call(this.bp.querySelectorAll('.d'));
    const fade = [{ transform: pos, opacity: 0 }, { transform: pos, opacity: 1, offset: 0.12 }, { transform: pos, opacity: 1, offset: 0.78, easing: 'ease-in' }, { transform: pos, opacity: 0 }];
    if (this.reduce) {
      // the press ring has done its job; without this it stays on screen until the next press
      if (this.wave) this.wave.getAnimations().forEach((a) => a.cancel());
      this.bp.animate(fade, { duration: life, fill: 'forwards' });
      lines.forEach((p) => p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 0 }], { duration: life, fill: 'forwards' }));
      return;
    }
    const c0 = 'circle(0px at ' + cx + 'px ' + cy + 'px)', c1 = 'circle(600px at ' + cx + 'px ' + cy + 'px)';
    try {
      this.bp.animate([
        { transform: pos, opacity: 1, clipPath: c0, easing: 'cubic-bezier(.2,.7,.2,1)' },
        { transform: pos, opacity: 1, clipPath: c1, offset: 0.2 },
        { transform: pos, opacity: 1, clipPath: c1, offset: 0.78, easing: 'ease-in' },
        { transform: pos, opacity: 0, clipPath: c1 }
      ], { duration: life, fill: 'forwards' });
    } catch (err) {
      this.bp.animate(fade, { duration: life, fill: 'forwards' });
    }
    lines.forEach((p, k) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 1100, delay: 200 + k * 55, easing: 'cubic-bezier(.3,.6,.2,1)', fill: 'both' }));
    if (this.wave) {
      this.wave.getAnimations().forEach((a) => a.cancel());
      const at = 'translate(' + x + 'px,' + y + 'px) ';
      this.wave.animate([{ transform: at + 'scale(.1)', opacity: 0.9 }, { transform: at + 'scale(1.6)', opacity: 0 }],
        { duration: 1300, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
  }

  // ↑ ↑ ↓ ↓ ← → ← → B A: the dots light up into the Joe Inz DS bubble and say Hi!
  hello() {
    const P = this.P, c = this.center();
    const i0 = Math.round((c[0] - 16) / P) - 7, j0 = Math.round((c[1] - 16) / P) - 5;
    this.hush = Date.now() + 4800;
    const pts = [];
    for (let x = 1; x <= 13; x++) pts.push([x, 0, ''], [x, 8, '']);
    for (let y = 1; y <= 7; y++) pts.push([0, y, ''], [14, y, '']);
    pts.push([3, 9, ''], [2, 10, '']);
    for (let y = 2; y <= 6; y++) pts.push([4, y, 'crit'], [6, y, 'crit']);
    pts.push([5, 4, 'crit'], [8, 2, 'crit'], [8, 4, 'crit'], [8, 5, 'crit'], [8, 6, 'crit'], [10, 2, 'crit'], [10, 3, 'crit'], [10, 4, 'crit'], [10, 6, 'crit']);
    pts.forEach((q) => this.glint([(i0 + q[0]) * P + 16, (j0 + q[1]) * P + 16], q[2], this.reduce ? 0 : q[0] * 38 + q[1] * 10,
      { life: 4400, peak: q[2] ? 0.95 : 0.6, scale: q[2] ? 2.2 : 1.5, hold: true, force: true, anywhere: true }));
  }

  // "salam": a row of dots sweeps right to left, and new signals read right to left for 20 seconds.
  rightToLeft() {
    this.rtl = Date.now() + 20000;
    const P = this.P, B = this.bounds(this.region()), c = this.center();
    const j = Math.round((c[1] - 16) / P);
    for (let i = B.c1, k = 0; i >= B.c0; i--, k++) {
      this.glint([i * P + 16, j * P + 16], k % 7 === 0 ? 'crit' : '', this.reduce ? 0 : k * 26, { life: 1600, peak: 0.6, force: true });
    }
    if (!this.reduce && !this.lite) {
      this.later(() => this.spawn(this.region(), {}), 500);
      this.later(() => this.spawn(this.region(), {}), 1300);
    }
  }

  // Between midnight and 5 am, once per visit: one fast caramel signal crosses the screen.
  nightOwl() {
    if (this.mode === 'off' || this.paused || this.lite) return; // pause and Save-Data hold the owl, as they hold every other signal
    const s = this.free();
    if (!s) return;
    const B = this.bounds(this.region());
    if (B.c1 - B.c0 < 12 || B.r1 - B.r0 < 4) return;
    const mid = Math.round(B.c0 + (B.c1 - B.c0) * 0.58);
    const clear = (j, i0, i1) => { for (let i = i0; i <= i1; i++) if (this.quiet.has(i + ',' + j)) return false; return true; };
    for (let t = 0; t < 24; t++) {
      const j = B.r0 + Math.floor(Math.random() * Math.max(1, B.r1 - B.r0 - 2));
      const j2 = Math.min(B.r1, j + 2);
      if (clear(j, B.c0, mid) && clear(j2, mid, B.c1) && !this.quiet.has(mid + ',' + (j + 1))) {
        this.run(s, [[B.c0, j], [mid, j], [mid, j2], [B.c1, j2]], 'owl', {});
        return;
      }
    }
  }

  consoleNote() {
    try {
      console.log('%cEvery great application starts with a hidden engine.', 'font: 600 15px/1.6 Literata, Georgia, serif; color: #C68A45;');
      console.log('%cYou found the console, so here are the doors:\n  · press and hold an empty part of the page\n  · ↑ ↑ ↓ ↓ ← → ← → b a\n  · say salam\n  · step away for a minute\n  · come back after midnight\n  · switch the theme, and watch the signals\n\nBuilding something? abdellahaddoun.com/#contact',
        'font: 12px/1.7 "JetBrains Mono", ui-monospace, monospace;');
    } catch (e) { /* no console */ }
  }

  // Two lights, six hours apart: warm follows Algeria, cool follows Florida.
  lights() {
    const v = QuietField.clock();
    if (this.cfg.onLights) this.cfg.onLights(v);
    else {
      document.documentElement.style.setProperty('--fx-dz', String(v.dz));
      document.documentElement.style.setProperty('--fx-fl', String(v.fl));
    }
    return v;
  }

  static clock(now = new Date()) {
    const get = (tz) => {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).formatToParts(now);
        const hp = parts.find((p) => p.type === 'hour'), mp = parts.find((p) => p.type === 'minute');
        const h = hp ? Number(hp.value) % 24 : 12;
        return { h, t: String(h).padStart(2, '0') + ':' + (mp ? mp.value : '00') };
      } catch (e) { return { h: 12, t: '12:00' }; }
    };
    const dz = get('Africa/Algiers'), fl = get('America/New_York');
    const lvl = (h) => (h >= 8 && h < 18 ? 1 : h >= 6 && h < 21 ? 0.72 : 0.45);
    const word = (h) => (h >= 8 && h < 18 ? 'working hours' : h >= 6 && h < 8 ? 'morning' : h >= 18 && h < 21 ? 'evening' : 'night');
    return { dz: lvl(dz.h), fl: lvl(fl.h), dzT: dz.t, flT: fl.t, dzW: word(dz.h), flW: word(fl.h) };
  }
}
