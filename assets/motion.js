/* ==========================================================================
   Motion layer for hafiz-afaq-portfolio — "The Lock", directed.
   Additive only: content is in the HTML for crawlers and no-JS readers; this
   file adds the camera work on top. Skipped entirely for reduced motion.
   Pieces: slate intro · film grain · viewfinder cursor · timecode HUD ·
   split-word reveals · slate scramble · shutter cards · magnetic buttons ·
   counters · velocity marquee · workflow film line · route-aware re-init.
   ========================================================================== */
(() => {
  "use strict";
  if (window.__mx) return; window.__mx = 1;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (RM) return;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const D = document, H = D.documentElement;
  const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
  const store = { get(k) { try { return sessionStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { sessionStorage.setItem(k, v) } catch (e) {} } };
  const GS = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/";
  const load = src => new Promise((res, rej) => { const s = D.createElement("script"); s.src = src; s.async = false; s.onload = res; s.onerror = rej; D.head.appendChild(s) });

  H.classList.add("mx");

  /* ---------------- 1. Slate intro: home page, first visit per session ---------------- */
  const isHome = !!$("header.hero#top");
  let slateDone = Promise.resolve(), slatePlayed = false;
  if (isHome && !store.get("mxSlate")) {
    store.set("mxSlate", "1"); slatePlayed = true;
    slateDone = new Promise(resolve => {
      const el = D.createElement("div");
      el.id = "mx-slate"; el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<div class="board"><div class="clap"></div><div class="base"></div><div class="body">
        <div class="cell full"><span>Production</span><b>Hafiz Afaq <em>AI Guy</em></b></div>
        <div class="cell"><span>Director</span><b>Hafiz Afaq</b></div>
        <div class="cell"><span>Format</span><b>AI video ads</b></div>
        <div class="cell"><span>Scene · Take</span><b>01 · 01</b></div>
        <div class="cell"><span>Timecode</span><b class="tc">00:00:00:00</b></div>
      </div></div><div class="sweep"></div><div class="skip">Click to skip</div>`;
      D.body.appendChild(el);
      const tc = $(".tc", el), clap = $(".clap", el), board = $(".board", el), sweep = $(".sweep", el);
      let f = 0, alive = true;
      const tick = () => { if (!alive) return; f += 2; const s = Math.floor(f / 24), fr = f % 24; tc.textContent = `00:00:${String(s).padStart(2, "0")}:${String(fr).padStart(2, "0")}`; requestAnimationFrame(tick) };
      requestAnimationFrame(tick);
      const A = (n, k, o) => n.animate(k, Object.assign({ fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" }, o));
      A(board, [{ opacity: 0, transform: "translateY(24px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 420 });
      A(clap, [{ transform: "rotate(-24deg)" }, { transform: "rotate(-24deg)", offset: .55 }, { transform: "rotate(0deg)" }], { duration: 780, easing: "cubic-bezier(.7,0,.9,.5)" });
      let finished = false;
      const end = () => {
        if (finished) return; finished = true; alive = false;
        A(board, [{ transform: "none" }, { transform: "translateY(-14px)", opacity: 0 }], { duration: 260 });
        A(sweep, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 300, delay: 120 }).onfinish = () => {
          el.style.background = "transparent"; board.remove();
          sweep.style.transformOrigin = "50% 0%";
          A(sweep, [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: 420 }).onfinish = () => { el.remove(); resolve() };
          resolve();
        };
      };
      const t = setTimeout(end, 1250);
      el.addEventListener("click", () => { clearTimeout(t); end() });
      addEventListener("keydown", () => { clearTimeout(t); end() }, { once: true });
    });
  }

  /* ---------------- 2. HUD, progress bar, cursor shells (no GSAP needed to exist) ---------------- */
  const bar = D.createElement("div"); bar.id = "mx-bar"; bar.setAttribute("aria-hidden", "true");
  const hud = D.createElement("div"); hud.id = "mx-hud"; hud.setAttribute("aria-hidden", "true");
  hud.innerHTML = `<span class="dot"></span><span>REC</span><span class="tc">00:00:00:00</span><span class="sc"></span>`;
  D.body.append(bar, hud);

  Promise.all([load(GS + "gsap.min.js").then(() => load(GS + "ScrollTrigger.min.js")), slateDone])
    .then(boot).catch(() => { /* CDN blocked: the site stays exactly as built */ H.classList.remove("mx") });

  function boot() {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);
    gsap.defaults({ ease: "power3.out", duration: .9 });
    const app = $("#app") || D.body;

    /* ---- timecode HUD: the whole page plays like ULTRA's 3:13 runtime ---- */
    const RUNTIME = 193, FPS = 24;
    const tcEl = $(".tc", hud), scEl = $(".sc", hud);
    gsap.to(hud, { opacity: 1, y: 0, duration: .6, delay: .3 });
    let lastSc = "";
    const sceneName = () => {
      const heads = $$("section h2, header h1", app).filter(h => h.offsetParent);
      let best = null;
      for (const h of heads) { const r = h.getBoundingClientRect(); if (r.top < innerHeight * .45) best = h; else break }
      if (!best) return "SC 01 · OPENING";
      const i = heads.indexOf(best) + 1;
      const txt = (best.textContent || "").replace(/\s+/g, " ").trim().split(" ").slice(0, 4).join(" ");
      return `SC ${String(i).padStart(2, "0")} · ${txt}`;
    };
    const hudUpdate = () => {
      const max = Math.max(1, D.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, Math.max(0, scrollY / max));
      bar.style.transform = `scaleX(${p})`;
      const tf = Math.round(p * RUNTIME * FPS), s = Math.floor(tf / FPS), fr = tf % FPS;
      tcEl.textContent = `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
      const sc = sceneName(); if (sc !== lastSc) { lastSc = sc; scEl.textContent = sc }
    };
    let hudRaf = 0;
    addEventListener("scroll", () => { if (!hudRaf) hudRaf = requestAnimationFrame(() => { hudRaf = 0; hudUpdate() }) }, { passive: true });
    addEventListener("resize", hudUpdate); hudUpdate();

    /* ---- nav hides on the way down, returns on the way up ---- */
    const nav = $(".nav");
    if (nav) {
      let navHidden = false;
      ST.create({ start: 0, end: "max", onUpdate: self => {
        const menuOpen = $("#mnav")?.classList.contains("open");
        const hide = self.direction === 1 && self.scroll() > 260 && !menuOpen;
        if (hide !== navHidden) { navHidden = hide; gsap.to(nav, { yPercent: hide ? -100 : 0, duration: .45, ease: "power2.out" }) }
      } });
    }

    /* ---- viewfinder cursor ---- */
    if (FINE) initCursor(gsap);

    /* ---- per-render scenes (home and every case/service/guide route) ---- */
    let ctx = null, first = true;
    const run = () => {
      if (ctx) ctx.revert();
      const intro = first && slatePlayed; first = false;
      ctx = gsap.context(() => scenes(gsap, ST, app, intro), app);
      requestAnimationFrame(() => ST.refresh());
      hudUpdate();
    };
    run();
    let mt = 0;
    new MutationObserver(muts => {
      if (!muts.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && !(n.id || "").startsWith("mx-") && !(n.classList && n.classList.contains("mx-marq"))))) return;
      clearTimeout(mt); mt = setTimeout(run, 160);
    }).observe(app, { childList: true });
    addEventListener("load", () => ST.refresh());
  }

  /* ---------------- scenes ---------------- */
  function splitWords(el) {
    if (!el || el.dataset.mxs) return el ? $$(".mx-word", el) : [];
    el.dataset.mxs = "1";
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = D.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(D.createTextNode(p)); return }
            const l = D.createElement("span"); l.className = "mx-line";
            const w = D.createElement("span"); w.className = "mx-word"; w.textContent = p;
            l.appendChild(w); frag.appendChild(l);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("mx-line")) {
          if (n.matches(".hl, b, em, strong, i, span, a") ) {
            const l = D.createElement("span"); l.className = "mx-line";
            if (n.classList.contains("hl")) { l.style.paddingRight = ".08em"; l.style.marginRight = "-.1em" }
            n.replaceWith(l); n.classList.add("mx-word"); l.appendChild(n);
          } else wrap(n);
        }
      });
    };
    wrap(el);
    return $$(".mx-word", el);
  }

  const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/·";
  function scramble(el) {
    if (el.dataset.mxsc) return; el.dataset.mxsc = "1";
    const nodes = [];
    const walk = n => n.childNodes.forEach(c => c.nodeType === 3 ? (c.textContent.trim() && nodes.push([c, c.textContent])) : walk(c));
    walk(el);
    if (!nodes.length) return;
    const t0 = performance.now(), dur = 650;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      nodes.forEach(([n, txt]) => {
        const keep = Math.floor(txt.length * k);
        n.textContent = txt.slice(0, keep) + txt.slice(keep).replace(/[^\s·]/g, () => SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]);
      });
      if (k < 1) requestAnimationFrame(step); else nodes.forEach(([n, txt]) => n.textContent = txt);
    };
    requestAnimationFrame(step);
  }

  function scenes(gsap, ST, app, intro) {
    const inReveal = el => !!el.closest(".reveal");

    /* hero: words rise out of a mask, then the lock box draws */
    const hero = $("header.hero", app);
    if (hero) {
      const h1 = $("h1", hero);
      /* the entrance only plays behind the slate, so the LCP headline is never hidden on normal loads */
      if (intro) {
      const words = splitWords(h1);
      const hl = $(".hl", h1);
      if (hl) hl.style.animation = "none";
      const tl = gsap.timeline({ delay: .05 });
      tl.from(words, { yPercent: 115, rotate: 4, duration: 1, stagger: .045, ease: "power4.out" })
        .fromTo(hl, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .7, ease: "power3.inOut" }, "-=.55")
        .from($$(".idc, .lede, .ctas > *", hero), { y: 26, opacity: 0, stagger: .08, duration: .8 }, "-=.7");
      }

      /* phones: depth parallax on the mouse, drift apart on scroll */
      const reel = $(".reel", hero), phones = $$(".phone", hero);
      if (reel && phones.length) {
        const depth = [.6, 1, .8];
        if (FINE) {
          const qx = phones.map((p, i) => gsap.quickTo(p, "x", { duration: .9, ease: "power3.out" }));
          const qy = phones.map((p, i) => gsap.quickTo(p, "y", { duration: .9, ease: "power3.out" }));
          const qr = phones.map(p => gsap.quickTo(p, "rotationY", { duration: 1, ease: "power3.out" }));
          gsap.set(reel, { perspective: 900 });
          const mm = e => {
            const r = reel.getBoundingClientRect();
            const nx = (e.clientX - (r.left + r.width / 2)) / innerWidth, ny = (e.clientY - (r.top + r.height / 2)) / innerHeight;
            phones.forEach((p, i) => { qx[i](nx * 46 * depth[i]); qy[i](ny * 30 * depth[i]); qr[i](nx * 14 * depth[i]) });
          };
          hero.addEventListener("mousemove", mm);
        }
        phones.forEach((p, i) => gsap.to(p, { yPercent: [-14, -28, -8][i] || -10, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .6 } }));
      }
    }

    /* section headings: word rise on enter */
    $$(".sec-head h2, .contact h2", app).forEach(h => {
      if (inReveal(h)) return;
      const w = splitWords(h);
      gsap.from(w, { yPercent: 110, duration: .9, stagger: .05, ease: "power4.out",
        scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });
    $$(".sec-head p", app).forEach(p => {
      if (inReveal(p)) return;
      gsap.from(p, { y: 22, opacity: 0, duration: .8, scrollTrigger: { trigger: p, start: "top 90%", once: true } });
    });

    /* mono slate labels decode like a timecode readout */
    $$(".slate", app).forEach(s => {
      if (s.closest(".nav, .mnav, .film, .stats") || (s.textContent || "").length > 48) return;
      ST.create({ trigger: s, start: "top 92%", once: true, onEnter: () => scramble(s) });
    });

    /* proof numbers count up */
    $$(".stats b", app).forEach(b => {
      const raw = (b.textContent || "").trim();
      let fmt = null, to = 0;
      if (/^\d+$/.test(raw)) { to = +raw; fmt = v => String(Math.round(v)) }
      else if (/^\d+:\d\d$/.test(raw)) { const [m, s] = raw.split(":").map(Number); to = m * 60 + s; fmt = v => { v = Math.round(v); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}` } }
      if (!fmt) return;
      const o = { v: 0 };
      b.textContent = fmt(0);
      gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => b.textContent = fmt(o.v), onComplete: () => b.textContent = raw,
        scrollTrigger: { trigger: b, start: "top 92%", once: true } });
    });

    /* case cards: a shutter opens on each frame */
    ST.batch($$(".film", app).filter(f => !inReveal(f)), {
      start: "top 90%", once: true,
      onEnter: els => els.forEach((f, i) => {
        const m = $(".media", f), v = $("video, img", m || f), info = $(".info", f);
        const tl = gsap.timeline({ delay: i * .09 });
        if (m) tl.fromTo(m, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "power4.inOut" });
        if (v) tl.fromTo(v, { scale: 1.28 }, { scale: 1, duration: 1.4, ease: "power3.out", clearProps: "transform,scale" }, 0);
        if (info) tl.from(info.children, { y: 18, opacity: 0, stagger: .06, duration: .6 }, .45);
      })
    });
    $$(".film", app).forEach(f => gsap.set($(".media", f), { clipPath: "inset(100% 0% 0% 0%)" }));
    ST.refresh();

    /* generic blocks rise in batches */
    const blocks = $$(".svcs > a, .pain, .tool, .build, .faq details, .gbody > *, .opts > *, .tl > *, .kit > *, .lab > *, .rules > *", app).filter(b => !inReveal(b));
    if (blocks.length) {
      gsap.set(blocks, { y: 34, opacity: 0 });
      ST.batch(blocks, { start: "top 92%", once: true, onEnter: els => gsap.to(els, { y: 0, opacity: 1, stagger: .07, duration: .8, overwrite: true, clearProps: "transform" }) });
    }

    /* workflow: a red film line draws across, steps follow it */
    const flow = $(".flow", app);
    if (flow && !inReveal(flow)) {
      const line = D.createElement("i"); line.className = "mx-flowline"; line.setAttribute("aria-hidden", "true"); flow.prepend(line);
      gsap.to(line, { scaleX: 1, ease: "none", scrollTrigger: { trigger: flow, start: "top 80%", end: "bottom 55%", scrub: .5 } });
      gsap.from($$(":scope > li", flow), { y: 40, opacity: 0, stagger: .12, duration: .8, scrollTrigger: { trigger: flow, start: "top 82%", once: true } });
    }

    /* about portrait: slow push-in like a dolly */
    const portrait = $(".portrait img, .portrait video", app);
    if (portrait) gsap.fromTo(portrait, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: portrait, start: "top bottom", end: "bottom top", scrub: true } });

    /* brand marquee after the proof band (home only), velocity reactive */
    const stats = $("section.stats", app);
    if (stats && !$(".mx-marq", app)) buildMarquee(gsap, ST, app, stats);

    /* magnetic buttons */
    if (FINE) $$(".btn", app).forEach(b => {
      const qx = gsap.quickTo(b, "x", { duration: .5, ease: "power3.out" }), qy = gsap.quickTo(b, "y", { duration: .5, ease: "power3.out" });
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .28); qy((e.clientY - r.top - r.height / 2) * .38) });
      b.addEventListener("mouseleave", () => { gsap.to(b, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)" }) });
    });
  }

  function buildMarquee(gsap, ST, app, after) {
    const seen = new Map();
    $$(".film", app).forEach(f => {
      const b = $(".info .slate b", f); if (!b) return;
      const name = b.textContent.split("·")[0].trim();
      if (!name || /own channel/i.test(name) || seen.has(name)) return;
      seen.set(name, f.getAttribute("href"));
    });
    if (seen.size < 4) return;
    const sec = D.createElement("div"); sec.className = "mx-marq"; sec.setAttribute("aria-label", "Brands in the case studies");
    const grp = () => { const g = D.createElement("div"); g.className = "grp";
      seen.forEach((href, name) => { const a = D.createElement("a"); a.href = href; a.style.textDecoration = "none"; const sp = D.createElement("span"); sp.textContent = name; a.appendChild(sp); g.appendChild(a); const s = D.createElement("b"); s.setAttribute("aria-hidden", "true"); g.appendChild(s) });
      return g };
    const trk = D.createElement("div"); trk.className = "trk";
    const g1 = grp(), g2 = grp(); g2.setAttribute("aria-hidden", "true"); g2.querySelectorAll("a").forEach(a => a.tabIndex = -1);
    trk.append(g1, g2);
    const lbl = D.createElement("span"); lbl.className = "lbl"; lbl.textContent = "On the slate";
    sec.append(lbl, trk);
    after.after(sec);

    let x = 0, vel = 0, dir = 1, w = g1.offsetWidth || 1;
    const setX = gsap.quickSetter(trk, "x", "px"), setSk = gsap.quickSetter(trk, "skewX", "deg");
    addEventListener("resize", () => { w = g1.offsetWidth || 1 });
    ST.create({ trigger: sec, start: "top bottom", end: "bottom top", onUpdate: s => { vel = gsap.utils.clamp(-40, 40, s.getVelocity() / 60); dir = s.direction } });
    let hover = false;
    sec.addEventListener("mouseenter", () => hover = true); sec.addEventListener("mouseleave", () => hover = false);
    const tick = () => {
      if (!sec.isConnected) { gsap.ticker.remove(tick); return }
      const base = hover ? .25 : 1.1;
      x -= (base + Math.abs(vel)) * dir;
      if (x <= -w) x += w; if (x > 0) x -= w;
      setX(x); setSk(-vel * .35);
      vel *= .9;
    };
    gsap.ticker.add(tick);

    /* names light up one by one as they pass the centre */
    gsap.from(sec, { opacity: 0, y: 20, duration: .8, scrollTrigger: { trigger: sec, start: "top 95%", once: true } });
  }

  function initCursor(gsap) {
    H.classList.add("mx-cur");
    const c = D.createElement("div"); c.id = "mx-cur"; c.setAttribute("aria-hidden", "true"); c.className = "hide";
    c.innerHTML = `<div class="vf"><i></i><i></i><i></i><i></i></div><span class="dot"></span><span class="lbl"></span>`;
    D.body.appendChild(c);
    const vf = $(".vf", c), dot = $(".dot", c), lbl = $(".lbl", c);
    gsap.set(vf, { xPercent: -50, yPercent: -50 });
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const dx = gsap.quickTo(dot, "x", { duration: .08, ease: "none" }), dy = gsap.quickTo(dot, "y", { duration: .08, ease: "none" });
    const lx = gsap.quickTo(lbl, "x", { duration: .25 }), ly = gsap.quickTo(lbl, "y", { duration: .25 });
    let target = null;
    const LABELS = [["[data-play], video", "Play"], [".film", "Open case"], ["[data-full]", "View"], [".btn-red", "Action"], [".mx-marq a", "Open case"]];
    const labelFor = el => { for (const [s, t] of LABELS) if (el.closest(s)) return t; return "" };
    const frame = () => {
      let x, y, w, h;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect(), pad = 6;
        const big = r.width > 260 || r.height > 260;
        if (big) { x = pos.x; y = pos.y; w = 56; h = 56 } else { x = r.left + r.width / 2; y = r.top + r.height / 2; w = r.width + pad * 2; h = r.height + pad * 2 }
      } else { x = pos.x; y = pos.y; w = 34; h = 34 }
      gsap.to(vf, { x, y, width: w, height: h, duration: .35, ease: "power3.out", overwrite: true });
    };
    addEventListener("mousemove", e => {
      c.classList.remove("hide"); pos.x = e.clientX; pos.y = e.clientY; dx(pos.x); dy(pos.y); lx(pos.x + 14); ly(pos.y + 14);
      const el = e.target.closest && e.target.closest("a, button, summary, [data-play], [data-full], label, .film");
      if (el !== target) {
        target = el;
        const t = el ? labelFor(el) : "";
        lbl.textContent = t; c.classList.toggle("has-lbl", !!t); c.classList.toggle("locked", !!el);
      }
      frame();
    }, { passive: true });
    addEventListener("scroll", () => { if (target) frame() }, { passive: true });
    addEventListener("mousedown", () => c.classList.add("down")); addEventListener("mouseup", () => c.classList.remove("down"));
    D.addEventListener("mouseleave", () => c.classList.add("hide")); D.addEventListener("mouseenter", () => c.classList.remove("hide"));
    /* the label sits next to the dot: position it with the dot's transform */
    lbl.style.left = "0"; lbl.style.top = "0";
  }
})();
