/* Gaurav Chhajer portfolio: interactions and motion.
   Order of concerns: helpers, contact, mode, motion setup, hero, scroll effects, form. */
(function () {
  "use strict";

  var C = window.SITE_CONFIG || {};
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  window.__siteReady = true;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.classList.contains("anim-failed");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  var navEl = $("#nav");
  var lenis = null;
  var mode = root.getAttribute("data-mode") || "recruiter";
  var pipeline = null;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ */
  /* Contact details and optional links (kept out of the static HTML)    */
  /* ------------------------------------------------------------------ */
  function initContact() {
    var e = C.email, p = C.phone, addr = "";
    if (e && e.user && e.domain) {
      addr = e.user + "@" + e.domain;
      var a = $('[data-contact="email"]');
      if (a) { a.href = "mailto:" + addr; $("[data-contact-text]", a).textContent = addr; }
    }
    if (p && p.dial) {
      var w = $('[data-contact="wa"]');
      if (w) { w.href = "https://wa.me/" + p.dial; $("[data-contact-phone]", w).textContent = p.display || ""; }
    }
    if (p && p.dial) {
      var t = $('[data-contact="tel"]');
      if (t) { t.href = "tel:+" + p.dial; $("[data-contact-phone]", t).textContent = p.display || ""; }
    }
    $$("[data-live]").forEach(function (el) {
      var u = C.live && C.live[el.getAttribute("data-live")];
      if (u) { el.href = u; el.hidden = false; }
    });
    $$("[data-live-note]").forEach(function (el) {
      var u = C.live && C.live[el.getAttribute("data-live-note")];
      if (u) el.hidden = false;
    });
    var paper = $("[data-paper]");
    if (paper && C.paper) { paper.href = C.paper; paper.hidden = false; }
    return addr;
  }
  var emailAddr = initContact();

  /* ------------------------------------------------------------------ */
  /* Word-mask splitting                                                 */
  /* ------------------------------------------------------------------ */
  function split(el) {
    if (el.getAttribute("data-split-done")) return $$(".wi", el);
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    text.split(" ").forEach(function (word, i, all) {
      var w = document.createElement("span");
      w.className = "w"; w.setAttribute("aria-hidden", "true");
      var wi = document.createElement("span");
      wi.className = "wi"; wi.textContent = word;
      w.appendChild(wi); el.appendChild(w);
      if (i < all.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.setAttribute("data-split-done", "1");
    return $$(".wi", el);
  }

  /* ------------------------------------------------------------------ */
  /* Smooth scroll                                                       */
  /* ------------------------------------------------------------------ */
  if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    ev.preventDefault();
    var offset = 0; /* Lenis already honours html { scroll-padding-top }, so no extra nav offset */
    if (lenis) lenis.scrollTo(t, { offset: offset, duration: 1.2 });
    else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
  });

  window.addEventListener("scroll", function () {
    navEl.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Mode: recruiter / client                                            */
  /* ------------------------------------------------------------------ */
  var radios = $$("[data-set-mode]");

  function reflectMode() {
    radios.forEach(function (b) {
      var on = b.getAttribute("data-set-mode") === mode;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
  }

  function commitMode(next) {
    mode = next;
    root.setAttribute("data-mode", mode);
    reflectMode();
    try { localStorage.setItem("gc-mode", mode); } catch (e) {}
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("for", mode);
      history.replaceState(null, "", u);
    } catch (e) {}
    if (pipeline) { pipeline.readColors(); setTimeout(pipeline.readColors, 700); }
    if (window.SITE_FX && SITE_FX.onMode) SITE_FX.onMode(mode);
  }

  var switching = false;
  function setMode(next) {
    if (next === mode || switching) return;
    if (!animate) { commitMode(next); window.scrollTo(0, 0); if (hasGsap) ScrollTrigger.refresh(); return; }
    switching = true;
    var wipe = $("#wipe"), label = $("#wipe-t");
    label.textContent = next === "client" ? "For clients" : "For recruiters";
    gsap.set(wipe, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)", backgroundColor: next === "client" ? "#2EE6B6" : "#7B96FF" });
    gsap.set(label, { opacity: 0, y: 36 });
    gsap.timeline({ onComplete: function () { switching = false; gsap.set(wipe, { visibility: "hidden" }); } })
      .to(wipe, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.inOut" })
      .to(label, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.2")
      .add(function () {
        commitMode(next);
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
        buildStack();
        ScrollTrigger.refresh();
      }, ">")
      .to(label, { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, "+=0.35")
      .add(function () { introHero(false); }, ">-0.05")
      .to(wipe, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.65, ease: "expo.inOut" }, "<");
  }

  radios.forEach(function (b) {
    b.addEventListener("click", function () { setMode(b.getAttribute("data-set-mode")); });
    b.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var other = radios.filter(function (x) { return x !== b; })[0];
      other.focus();
      setMode(other.getAttribute("data-set-mode"));
    });
  });
  reflectMode();

  /* ------------------------------------------------------------------ */
  /* Hero pipeline (canvas)                                              */
  /* ------------------------------------------------------------------ */
  function initPipeline() {
    var cv = $("#pipe");
    if (!cv || !cv.getContext) return null;
    var ctx = cv.getContext("2d");
    var okEl = $("#c-ok"), badEl = $("#c-bad"), btn = $("#inject");
    var col = { ac: "#7B96FF", amber: "#FFB020", dim: "#27405F", txt: "#9FB0C6", on: "#E8EEF6", ink: "#0B1626", ink3: "#1C3250" };
    var W = 0, H = 0, padX = 28, xs = [0, 0, 0, 0], gateX = 0, railY = 0, speed = 120;
    var packets = [], okN = 0, badN = 0, clock = 0, spawnN = 0, flash = 0;
    var running = false, raf = 0, last = 0, onscreen = true;
    var labels = ["Fetch", "Score", "Validate", "Deliver"];

    function readColors() {
      var cs = getComputedStyle(root);
      var v = cs.getPropertyValue("--accent-bright").trim();
      if (v) col.ac = v;
    }

    function resize() {
      var r = cv.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      padX = W < 520 ? 30 : 40;
      for (var i = 0; i < 4; i++) xs[i] = padX + i * (W - 2 * padX) / 3;
      gateX = xs[2]; railY = H * 0.38; speed = (W - 2 * padX) / 5.2;
    }

    function counts() { okEl.textContent = okN; badEl.textContent = badN; }

    function spawn(bad) { packets.push({ x: xs[0], y: railY, vy: 0, bad: bad, state: "run", a: 1, rot: 0, passed: false }); }

    function update(dt) {
      clock += dt;
      if (clock >= 0.95) { clock = 0; spawnN++; spawn(spawnN % 4 === 2); }
      for (var i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        if (p.state === "run") {
          p.x += speed * dt;
          if (!p.passed && p.x >= gateX - 6) {
            if (p.bad) { p.state = "reject"; p.vy = -170; badN++; flash = 1; counts(); }
            else p.passed = true;
          }
          if (p.state === "run" && p.x >= xs[3]) { p.state = "done"; okN++; counts(); }
        } else if (p.state === "reject") {
          p.vy += 620 * dt; p.y += p.vy * dt; p.x += speed * dt * 0.25; p.rot += dt * 4; p.a -= dt * 0.9;
        } else { p.a -= dt * 3; }
        if (p.a <= 0) packets.splice(i, 1);
      }
      flash = Math.max(0, flash - dt * 2.2);
    }

    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.strokeStyle = col.dim; line(xs[0], railY, gateX, railY);
      ctx.strokeStyle = col.ac; ctx.globalAlpha = 0.55; line(gateX, railY, xs[3], railY); ctx.globalAlpha = 1;

      [0, 1, 3].forEach(function (i) {
        ctx.beginPath(); ctx.arc(xs[i], railY, 7, 0, 6.2832);
        ctx.fillStyle = col.ink; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = i === 3 ? col.ac : col.txt; ctx.stroke();
      });

      var gc = flash > 0 ? col.amber : col.on;
      ctx.strokeStyle = gc; ctx.lineWidth = 3;
      line(gateX - 14, railY - 30, gateX - 14, railY + 30);
      line(gateX + 14, railY - 30, gateX + 14, railY + 30);

      ctx.font = "500 12px JetBrainsMono, ui-monospace, monospace"; ctx.textAlign = "center";
      for (var i = 0; i < 4; i++) {
        ctx.fillStyle = i === 2 ? (flash > 0 ? col.amber : col.on) : col.txt;
        ctx.fillText(labels[i], xs[i], railY + 52);
      }
      if (flash > 0) { ctx.globalAlpha = Math.min(1, flash * 1.4); ctx.fillStyle = col.amber; ctx.fillText("rejected", gateX, railY - 44); ctx.globalAlpha = 1; }

      packets.forEach(function (p) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.a));
        var fill = col.ink3, stroke = col.txt;
        if (p.state === "reject") { fill = col.amber; stroke = col.amber; }
        else if (p.passed || p.state === "done") { fill = col.ac; stroke = col.ac; }
        rr(-13, -7.5, 26, 15, 4); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = stroke; ctx.stroke();
        if (p.state === "reject") { ctx.strokeStyle = col.ink; ctx.lineWidth = 2; line(-4, -3, 4, 3); line(4, -3, -4, 3); }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      update(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function warm(seconds) { for (var t = 0; t < seconds; t += 1 / 30) update(1 / 30); }

    readColors(); resize();

    if (reduce) {
      warm(5.6); counts(); btn.hidden = true;
      var paint = function () { draw(); };
      paint();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      window.addEventListener("resize", function () { resize(); packets = []; okN = badN = 0; clock = 0; spawnN = 0; warm(5.6); counts(); draw(); });
    } else {
      warm(6); okN = badN = 0; flash = 0; counts();
      new ResizeObserver(function () { resize(); }).observe(cv);
      new IntersectionObserver(function (en) { onscreen = en[0].isIntersecting; if (onscreen && !document.hidden) start(); else stop(); }).observe(cv);
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (onscreen) start(); });
      btn.addEventListener("click", function () {
        var bad = packets.filter(function (p) { return p.bad && p.state === "run"; }).length;
        if (bad < 5) spawn(true);
      });
      start();
    }
    return { readColors: readColors };
  }
  pipeline = initPipeline();

  /* ------------------------------------------------------------------ */
  /* Hero intro                                                          */
  /* ------------------------------------------------------------------ */
  var heroTween = null;
  function introHero(first) {
    var h1 = $('.hero__title[data-for="' + mode + '"]');
    if (!h1) return;
    var words = split(h1);
    var sub = $('.hero__sub[data-for="' + mode + '"]');
    var cta = $('.hero__cta[data-for="' + mode + '"]');
    if (heroTween) heroTween.kill();
    gsap.set(words, { yPercent: 112 });
    gsap.set([sub, cta], { opacity: 0, y: 18 });
    h1.style.visibility = "visible";
    var tl = heroTween = gsap.timeline({ delay: first ? 0.1 : 0.22 });
    tl.to(words, { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.055 })
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", clearProps: "opacity,transform" }, "-=0.75")
      .to(cta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", clearProps: "opacity,transform" }, "-=0.65");
    if (first) {
      tl.from(".pipe", { opacity: 0, y: 28, duration: 1.1, ease: "power3.out", clearProps: "opacity,transform" }, "-=0.9")
        .from(navEl, { yPercent: -100, opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "opacity,transform" }, 0.1);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Card artwork (decorative SVG, built here to keep the HTML small)    */
  /* ------------------------------------------------------------------ */
  function bars(x0, n, gap, w, cy, seed, cls, amp) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var h = 8 + Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6 + seed * 2)) * (amp || 64);
      s += '<rect class="' + cls + ' art-bar" x="' + (x0 + i * gap) + '" y="' + (cy - h / 2).toFixed(1) + '" width="' + w + '" height="' + h.toFixed(1) + '" rx="' + (w / 2) + '"/>';
    }
    return s;
  }
  var ART = {
    pipeline: function () {
      var feeds = ["Greenhouse", "Lever", "Ashby", "Workday", "Oracle", "Custom"], s = "";
      feeds.forEach(function (f, i) {
        var y = 34 + i * 50;
        s += '<rect class="art-soft art-pop" x="20" y="' + y + '" width="104" height="28" rx="7"/>' +
             '<text class="art-txt art-pop" x="32" y="' + (y + 18) + '">' + f + '</text>' +
             '<path class="art-dim art-draw" d="M124 ' + (y + 14) + 'C190 ' + (y + 14) + ' 190 180 246 180"/>';
      });
      s += '<path class="art-line art-draw" d="M240 130V230M258 130V230"/>' +
           '<text class="art-txt art-txt--a art-pop" x="249" y="254" text-anchor="middle">validate</text>' +
           '<path class="art-line art-draw" d="M262 180H350"/>' +
           '<rect class="art-line art-draw" x="350" y="150" width="112" height="60" rx="12"/>' +
           '<text class="art-txt art-txt--a art-pop" x="406" y="185" text-anchor="middle">ranked matches</text>' +
           '<g class="art-pop"><path class="art-bad" d="M243 98l12 12M255 98l-12 12"/><text class="art-txt" style="fill:var(--amber)" x="249" y="86" text-anchor="middle">rejected</text></g>';
      return s;
    },
    emotion: function () {
      var d = "", dots = "", i, x, y;
      for (i = 0; i <= 60; i++) { x = 20 + i * 7.33; y = 226 + Math.sin(i / 7.5) * 52 + Math.sin(i / 3.1) * 12; d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
      [8, 19, 31, 43, 54].forEach(function (k, n) {
        var px = 20 + k * 7.33, py = 226 + Math.sin(k / 7.5) * 52 + Math.sin(k / 3.1) * 12;
        dots += '<circle class="art-fill art-pop" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + (6 + (n % 3) * 2) + '"/>';
      });
      return '<rect class="art-soft art-pop" x="20" y="40" width="210" height="9" rx="4.5"/><rect class="art-soft art-pop" x="20" y="62" width="170" height="9" rx="4.5"/><rect class="art-soft art-pop" x="20" y="84" width="190" height="9" rx="4.5"/>' +
             '<text class="art-txt art-pop" x="20" y="28">entry</text>' +
             '<path class="art-line art-draw" d="' + d + '"/>' + dots +
             '<text class="art-txt art-txt--a art-pop" x="20" y="336">emotion over time</text>';
    },
    translate: function () {
      return bars(20, 20, 8, 4, 180, 1, "art-soft", 90).replace(/art-soft/g, "art-fill") +
             '<text class="art-txt art-pop" x="20" y="262">speech in</text>' +
             '<path class="art-dim art-draw" d="M184 180H206"/><rect class="art-line art-draw" x="206" y="150" width="68" height="60" rx="12"/>' +
             '<text class="art-txt art-txt--a art-pop" x="240" y="185" text-anchor="middle">text</text>' +
             '<path class="art-dim art-draw" d="M274 180H296"/>' +
             bars(300, 20, 8, 4, 180, 4.2, "art-bar-b", 90).replace(/art-bar-b/g, "art-soft") +
             '<text class="art-txt art-pop" x="300" y="262">speech out</text>';
    },
    vision: function () {
      return '<path class="art-line art-draw" d="M60 100V54h46M420 100V54h-46M60 260v46h46M420 260v46h-46"/>' +
             '<rect class="art-dim art-draw" x="96" y="190" width="120" height="84" rx="8" stroke-dasharray="5 5"/><text class="art-txt art-pop" x="104" y="184">object</text>' +
             '<rect class="art-dim art-draw" x="250" y="98" width="130" height="52" rx="8" stroke-dasharray="5 5"/><text class="art-txt art-pop" x="258" y="92">text</text>' +
             '<path class="art-dim art-draw" d="M240 170v20M230 180h20"/>' +
             '<path class="art-line art-draw" d="M236 252a30 30 0 0 1 0 40M252 240a50 50 0 0 1 0 64"/><text class="art-txt art-txt--a art-pop" x="276" y="276">spoken aloud</text>';
    },
    grammar: function () {
      var cells = "", r, c;
      for (r = 0; r < 4; r++) for (c = 0; c < 16; c++) {
        cells += '<rect class="art-fill art-pop" style="opacity:' + (0.15 + Math.abs(Math.sin(r * 2.1 + c * 0.9)) * 0.75).toFixed(2) + '" x="' + (20 + c * 28) + '" y="' + (134 + r * 22) + '" width="22" height="16" rx="3"/>';
      }
      return bars(20, 56, 8, 4, 70, 2.2, "art-soft", 56).replace(/art-soft/g, "art-fill") +
             '<text class="art-txt art-pop" x="20" y="22">audio</text><text class="art-txt art-pop" x="20" y="124">speech features</text>' + cells +
             '<text class="art-txt art-pop" x="20" y="262">score</text>' +
             '<path class="art-dim art-draw" d="M20 290H460"/><path class="art-line art-draw" d="M20 290H334"/><circle class="art-fill art-pop" cx="334" cy="290" r="9"/>';
    },
    network: function () {
      var L = [[70, 90], [70, 180], [70, 270]], M = [[240, 130], [240, 230]], R = [[410, 70], [410, 180], [410, 290]], s = "";
      L.forEach(function (a) { M.forEach(function (b) { s += '<path class="art-dim art-draw" d="M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + '"/>'; }); });
      M.forEach(function (a) { R.forEach(function (b) { s += '<path class="art-line art-draw" d="M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + '"/>'; }); });
      L.concat(M, R).forEach(function (n, i) { s += '<circle class="' + (i >= 3 && i < 5 ? "art-fill" : "art-soft") + ' art-pop" cx="' + n[0] + '" cy="' + n[1] + '" r="' + (i >= 3 && i < 5 ? 14 : 11) + '"/>'; });
      return s + '<text class="art-txt art-pop" x="70" y="40" text-anchor="middle">resources</text><text class="art-txt art-txt--a art-pop" x="240" y="86" text-anchor="middle">shipments</text><text class="art-txt art-pop" x="410" y="36" text-anchor="middle">relief sites</text>';
    }
  };

  var artEls = $$("[data-art]");
  artEls.forEach(function (el) {
    var fn = ART[el.getAttribute("data-art")];
    if (fn) el.innerHTML = '<svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + fn() + "</svg>";
  });

  /* ------------------------------------------------------------------ */
  /* Scroll effects                                                      */
  /* ------------------------------------------------------------------ */
  function initScroll() {
    root.classList.add("anim-on");

    /* Section headings: same word-mask reveal as the hero. */
    $$("[data-split-h]").forEach(function (h) {
      var words = split(h);
      gsap.set(words, { yPercent: 112 });
      h.style.visibility = "visible";
      ScrollTrigger.create({
        trigger: h, start: "top 88%", once: true,
        onEnter: function () { gsap.to(words, { yPercent: 0, duration: 0.95, ease: "expo.out", stagger: 0.05 }); }
      });
    });

    /* Nav highlight. */
    $$("[data-nav]").forEach(function (link) {
      var sec = document.getElementById(link.getAttribute("data-nav"));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 45%", end: "bottom 45%",
        onToggle: function (self) { link.setAttribute("aria-current", self.isActive ? "true" : "false"); }
      });
    });

    /* Card artwork draws in once. */
    $$(".card").forEach(function (card) {
      var art = $("[data-art]", card);
      if (!art) return;
      var draws = $$(".art-draw", art), pops = $$(".art-pop", art), bs = $$(".art-bar", art);
      draws.forEach(function (p) {
        var len = 600;
        try { len = Math.ceil(p.getTotalLength()); } catch (e) {}
        p.style.strokeDasharray = p.getAttribute("stroke-dasharray") ? "" : len;
        p.setAttribute("data-len", len);
        if (!p.getAttribute("stroke-dasharray")) p.style.strokeDashoffset = len;
      });
      if (pops.length) gsap.set(pops, { opacity: 0 });
      if (bs.length) gsap.set(bs, { scaleY: 0 });
      ScrollTrigger.create({
        trigger: card, start: "top 80%", once: true,
        onEnter: function () {
          var tl = gsap.timeline();
          if (draws.length) tl.to(draws, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.04 });
          if (bs.length) tl.to(bs, { scaleY: 1, duration: 0.7, ease: "back.out(1.6)", stagger: { each: 0.015, from: "start" } }, 0.1);
          if (pops.length) tl.to(pops, { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.03 }, 0.3);
        }
      });
    });

    /* Counters on the lead card. */
    $$("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10), sfx = el.getAttribute("data-suffix") || "", o = { v: 0 };
      el.textContent = "0";
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () {
          gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v) + sfx; }, onComplete: function () { el.textContent = target + sfx; } });
        }
      });
    });

    /* Timeline line draws with scroll. */
    var fill = $(".tl__fill");
    if (fill) {
      gsap.set(fill, { scaleY: 0 });
      gsap.to(fill, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 72%", end: "bottom 62%", scrub: true } });
    }

    /* Services and skills ease in. */
    var items = $$(".service, .skill");
    gsap.set(items, { opacity: 0, y: 22 });
    ScrollTrigger.batch(items, {
      start: "top 92%", once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out", clearProps: "opacity,transform" }); }
    });

    if (window.SITE_FX) SITE_FX.init(fxCtx);
    buildStack();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildStack(); ScrollTrigger.refresh(); }, 200);
    });
  }

  /* Stacking cards: earlier cards recede as the next one slides over.
     Only used when the viewport is wide enough and the tallest card fits on screen;
     otherwise the cards simply flow one after another. */
  var stackCtx = null;
  function buildStack() {
    var stack = $(".stack");
    if (!stack) return;
    if (stackCtx) { stackCtx.revert(); stackCtx = null; }
    stack.classList.remove("is-stacked");
    stack.style.removeProperty("--card-h");
    if (window.innerWidth < 960) return;
    var cards = $$(".card", stack), navH = navEl.offsetHeight, tallest = 0;
    cards.forEach(function (c) { tallest = Math.max(tallest, c.offsetHeight); });
    if (tallest + navH + 20 + (cards.length - 1) * 14 + 16 > window.innerHeight) return;
    stack.style.setProperty("--card-h", tallest + "px");
    stack.classList.add("is-stacked");
    stackCtx = gsap.context(function () {
      cards.forEach(function (card, i) {
        var next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.95, "--dim": 0.55, ease: "none",
          scrollTrigger: {
            trigger: next, start: "top 92%",
            end: function () { return "top " + (navH + 20 + (i + 1) * 14) + "px"; },
            scrub: true
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Contact form                                                        */
  /* ------------------------------------------------------------------ */
  function initForm() {
    var form = $("#form"), status = $("#status"), send = $("#send");
    if (!form) return;
    function say(msg, cls) { status.textContent = msg; status.className = "form__status" + (cls ? " " + cls : ""); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
      var bad = [];
      [["name", !name], ["email", !/^\S+@\S+\.\S+$/.test(email)], ["message", !msg]].forEach(function (r) {
        var el = f[r[0]]; el.setAttribute("aria-invalid", r[1] ? "true" : "false"); if (r[1]) bad.push(el);
      });
      if (bad.length) { say("Add your name, a valid email and a message.", "is-err"); bad[0].focus(); return; }
      if (f.botcheck.checked) { say("Sent. I'll reply by email.", "is-ok"); form.reset(); return; }

      var extra = mode === "client" ? (f.work_type.value ? "Type of work: " + f.work_type.value : "") : (f.company.value.trim() ? "Company or role: " + f.company.value.trim() : "");
      var subject = (mode === "client" ? "Project enquiry from " : "Role enquiry from ") + name;
      var body = msg + (extra ? "\n\n" + extra : "");

      if (C.formKey) {
        send.disabled = true; say("Sending...", "");
        fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: C.formKey, subject: subject, from_name: name, name: name, email: email, message: body, botcheck: "" })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.success) { say("Sent. I'll reply by email.", "is-ok"); form.reset(); }
          else throw new Error("rejected");
        }).catch(function () {
          say("That didn't send. Email me directly at " + emailAddr + " instead.", "is-err");
        }).then(function () { send.disabled = false; });
      } else {
        var href = "mailto:" + emailAddr + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent("From: " + name + " <" + email + ">\n\n" + body);
        say("Opening your email app with the message filled in. If nothing opens, write to " + emailAddr + ".", "is-ok");
        window.location.href = href;
      }
    });
  }
  initForm();

  /* ------------------------------------------------------------------ */
  /* Boot intro: a bad record is rejected, a good one passes. Once per   */
  /* session, click to skip.                                             */
  /* ------------------------------------------------------------------ */
  function playBoot(done) {
    var boot = $("#boot");
    if (!boot) { done(); return; }
    var n = $("#boot-n"), lbl = $("#boot-l"), bad = $(".b-bad", boot), ok = $(".b-ok", boot);
    var rail = $(".b-rail", boot), gate = $(".b-gate", boot), cnt = { v: 0 }, finished = false;
    function finish() {
      if (finished) return; finished = true;
      root.classList.remove("is-booting");
      try { sessionStorage.setItem("gc-booted", "1"); } catch (e) {}
      boot.style.display = "none";
      done();
    }
    gsap.set(rail, { strokeDasharray: 160, strokeDashoffset: 160 });
    var tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.to(cnt, { v: 100, duration: 1.7, ease: "power1.inOut", onUpdate: function () {
        var v = Math.round(cnt.v); n.textContent = v;
        lbl.textContent = v >= 100 ? "Valid" : v > 44 && v < 64 ? "Rejected" : "Validating";
      } }, 0)
      .to(rail, { strokeDashoffset: 0, duration: 0.5 }, 0)
      .fromTo(gate, { opacity: 0, scaleY: 0, transformOrigin: "50% 50%" }, { opacity: 1, scaleY: 1, duration: 0.35, ease: "back.out(2)" }, 0.2)
      .to(bad, { x: 96, duration: 0.55, ease: "power2.in" }, 0.55)
      .to(bad, { y: 40, rotation: 40, opacity: 0, duration: 0.45, ease: "power2.in", transformOrigin: "50% 50%" }, 1.1)
      .to(ok, { x: 250, duration: 0.85, ease: "power2.inOut" }, 1.0)
      .to(boot, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 1.95)
      .add(finish, 2.45);
    boot.addEventListener("click", function () { tl.progress(1); });
  }

  /* ------------------------------------------------------------------ */
  /* Start                                                               */
  /* ------------------------------------------------------------------ */
  var fxCtx = {
    $: $, $$: $$, split: split, navEl: navEl, email: emailAddr,
    getMode: function () { return mode; },
    get lenis() { return lenis; }
  };

  if (animate) {
    initScroll();
    var go = false;
    var ready = function () { introHero(true); buildStack(); ScrollTrigger.refresh(); };
    var begin = function () {
      if (go) return; go = true;
      if (root.classList.contains("is-booting")) playBoot(ready); else ready();
    };
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(begin); setTimeout(begin, 1200); } else begin();
    window.addEventListener("load", function () { buildStack(); ScrollTrigger.refresh(); });
  } else {
    $$("[data-split], [data-split-h]").forEach(function (el) { el.style.visibility = "visible"; });
    if (hasGsap && !root.classList.contains("anim-failed") && window.SITE_FX) SITE_FX.initStatic(fxCtx);
  }
})();
