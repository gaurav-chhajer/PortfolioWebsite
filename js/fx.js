/* Motion effects layer.
   Loaded before main.js, which calls SITE_FX.init(ctx) once the page is ready.
   Every effect is wrapped so that if one fails (no WebGL, old browser) the rest, and the site, carry on. */
(function () {
  "use strict";

  var FX = (window.SITE_FX = {});
  var C, root = document.documentElement;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lite = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData) || false;
  var ACC = { recruiter: [0.482, 0.588, 1.0], client: [0.18, 0.902, 0.714] };
  var shader = null;

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn("fx:", e && e.message); } }

  /* ------------------------------------------------------------------ */
  /* Hero: GPU data streams. Packets run along lines, bad ones die at    */
  /* the gate. The cursor pushes the lines apart.                        */
  /* ------------------------------------------------------------------ */
  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH", "precision highp float;", "#else", "precision mediump float;", "#endif",
    "#define N __N__",
    "uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uAcc; uniform float uFade;",
    "uniform vec4 uL[N];",
    "float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
    "float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);",
    "  return mix(mix(h21(i),h21(i+vec2(1.0,0.0)),f.x),mix(h21(i+vec2(0.0,1.0)),h21(i+vec2(1.0,1.0)),f.x),f.y); }",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y; float gx=0.72;",
    "  vec3 amber=vec3(1.0,0.69,0.125); vec3 dimc=vec3(0.20,0.31,0.46);",
    "  vec3 col=vec3(0.0); float a=0.0;",
    "  for(int i=0;i<N;i++){",
    "    vec4 L=uL[i]; float fi=float(i); float by=(fi+0.5)/float(N);",
    "    float y=by+(vn(vec2(uv.x*1.7+L.z*9.0,uTime*0.09+L.z*4.0))-0.5)*0.075;",
    "    vec2 dm=vec2((uv.x-uMouse.x)*asp,y-uMouse.y); float dd=length(dm);",
    "    y+=dm.y/max(dd,0.03)*smoothstep(0.32,0.0,dd)*0.05;",
    "    float d=abs(uv.y-y); float line=1.0-smoothstep(0.0,0.0032,d);",
    "    float prog=uTime*L.x+L.y; float px=fract(prog); float cyc=floor(prog);",
    "    float bad=step(h21(vec2(fi+1.0,cyc)),0.2);",
    "    float dx=px-uv.x; float tail=step(0.0,dx)*exp(-dx*18.0); float head=1.0-smoothstep(0.0,0.012,abs(dx));",
    "    float pk=(head*1.3+tail*0.55)*(1.0-smoothstep(0.0,0.0055,d));",
    "    float vis=mix(1.0,step(uv.x,gx),bad);",
    "    vec3 pc=mix(uAcc,amber,bad*step(gx-0.12,px));",
    "    float fl=bad*step(gx,px)*(1.0-smoothstep(0.0,0.07,px-gx))*(1.0-smoothstep(0.0,0.035,abs(uv.x-gx)))*(1.0-smoothstep(0.0,0.02,d));",
    "    float lf=smoothstep(0.0,0.2,uv.x)*0.45;",
    "    col+=dimc*line*lf+pc*pk*vis+amber*fl*1.5; a+=line*lf*0.7+pk*vis+fl;",
    "  }",
    "  float g=1.0-smoothstep(0.0,0.0022,abs(uv.x-gx)); col+=vec3(0.9,0.93,0.97)*g*0.2; a+=g*0.2;",
    "  a=clamp(a,0.0,1.0); gl_FragColor=vec4(min(col,vec3(1.0)),a)*uFade;",
    "}"
  ].join("\n");

  function initShader(staticOnly) {
    var cv = C.$("#flow");
    if (!cv) return;
    var gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) { cv.style.display = "none"; return; }
    var N = (window.innerWidth < 760 || lite) ? 14 : 26;

    function make(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, make(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }"));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG.replace("__N__", N)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link failed");
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ["uRes", "uTime", "uMouse", "uAcc", "uFade", "uL"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    var data = new Float32Array(N * 4);
    for (var i = 0; i < N; i++) {
      var r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1, r3 = Math.abs(Math.sin(i * 39.346) * 9876.54321) % 1;
      data[i * 4] = 0.07 + r1 * 0.09; data[i * 4 + 1] = r2 * 10; data[i * 4 + 2] = r3; data[i * 4 + 3] = 0;
    }
    gl.uniform4fv(U.uL, data);

    var a0 = ACC[C.getMode()], acc = { r: a0[0], g: a0[1], b: a0[2] }, mouse = { x: -1, y: -1, tx: -1, ty: -1 };
    var time = staticOnly ? 14 : 0, running = false, raf = 0, last = 0, onscreen = true;

    function resize() {
      var s = (lite || window.innerWidth < 760) ? 0.42 : 0.6;
      var w = Math.max(2, Math.round(cv.clientWidth * s)), h = Math.max(2, Math.round(cv.clientHeight * s));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.uRes, w, h);
    }
    function draw() {
      var fade = Math.max(0, Math.min(1, 1 - window.scrollY / (window.innerHeight * 0.9)));
      gl.uniform1f(U.uTime, time); gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.uniform3f(U.uAcc, acc.r, acc.g, acc.b); gl.uniform1f(U.uFade, fade);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; time += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.09; mouse.y += (mouse.ty - mouse.y) * 0.09;
      draw(); raf = requestAnimationFrame(frame);
    }
    function start() { if (running || staticOnly) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    resize(); draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(); draw(); });
    window.addEventListener("resize", function () { resize(); if (staticOnly || !running) draw(); });

    if (!staticOnly) {
      window.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom) { mouse.tx = mouse.ty = -1; return; }
        mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height;
      }, { passive: true });
      document.addEventListener("pointerleave", function () { mouse.tx = mouse.ty = -1; });
      new IntersectionObserver(function (en) { onscreen = en[0].isIntersecting; if (onscreen && !document.hidden) start(); else stop(); }).observe(cv);
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (onscreen) start(); });
      start();
    }
    shader = {
      setMode: function (m) {
        var to = ACC[m];
        if (window.gsap && !staticOnly) gsap.to(acc, { r: to[0], g: to[1], b: to[2], duration: 0.8, ease: "power2.out" });
        else { acc.r = to[0]; acc.g = to[1]; acc.b = to[2]; draw(); }
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */
  var GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+<>/";
  function scramble(el, text, dur, delay) {
    var o = { p: 0 };
    el.setAttribute("aria-label", text);
    gsap.to(o, {
      p: 1, duration: dur, delay: delay || 0, ease: "none",
      onUpdate: function () {
        var n = Math.floor(o.p * text.length), s = text.slice(0, n), i;
        for (i = n; i < text.length; i++) s += text.charAt(i) === " " ? " " : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
        el.textContent = s;
      },
      onComplete: function () { el.textContent = text; }
    });
  }
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e); return e;
  }
  function follow(el, path, dur, delay, repeatDelay) {
    var L = path.getTotalLength(), o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration: dur, delay: delay, repeat: -1, repeatDelay: repeatDelay || 0, ease: "none", paused: true,
      onUpdate: function () {
        var pt = path.getPointAtLength(o.p * L);
        el.setAttribute("cx", pt.x); el.setAttribute("cy", pt.y); el.setAttribute("opacity", Math.sin(Math.PI * o.p).toFixed(3));
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll progress, hero exit, scroll-lit statement                    */
  /* ------------------------------------------------------------------ */
  function initProgressAndHero() {
    gsap.to("#bar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
    gsap.to(".hero__copy", { yPercent: -14, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  function initStatement() {
    var st = C.$("#statement");
    if (!st) return;
    var text = st.textContent.replace(/\s+/g, " ").trim();
    st.setAttribute("aria-label", text); st.textContent = "";
    var words = text.split(" ").map(function (w, i, all) {
      var s = document.createElement("span"); s.className = "sw"; s.setAttribute("aria-hidden", "true"); s.textContent = w;
      st.appendChild(s); if (i < all.length - 1) st.appendChild(document.createTextNode(" ")); return s;
    });
    gsap.set(words, { opacity: 0.18 });
    gsap.to(words, { opacity: 1, ease: "none", duration: 0.3, stagger: 0.1, scrollTrigger: { trigger: st, start: "top 84%", end: "bottom 52%", scrub: true } });
  }

  /* ------------------------------------------------------------------ */
  /* Journey: a pinned scene where one record travels the four rules     */
  /* ------------------------------------------------------------------ */
  function initJourney() {
    var J = C.$("#journey");
    if (!J) return;
    var rules = C.$$(".rule", J), mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (min-height: 560px)", function () {
      J.classList.add("is-scene");
      var pkt = C.$("#j-pkt"), okR = C.$(".j-ok", pkt), badR = C.$(".j-bad", pkt), xm = C.$(".j-x", pkt);
      var prog = C.$("#j-prog"), rej = C.$("#j-rej"), nodes = C.$$(".j-node", J), lbls = C.$$(".j-lbl", J);
      var navH = C.navEl.offsetHeight;

      gsap.set(rules, { autoAlpha: 0 }); gsap.set(rules[0], { autoAlpha: 1 });
      gsap.set(pkt, { x: 100, y: 90, rotation: 0, opacity: 1 });
      gsap.set(prog, { strokeDashoffset: 1 });

      function swap(tl, i, at) {
        tl.to(rules[i - 1], { autoAlpha: 0, y: -28, duration: 0.3, ease: "power2.in" }, at - 0.3)
          .fromTo(rules[i], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, at);
      }
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: J, start: "top " + navH + "px", end: "+=330%", pin: true, scrub: 0.7, anticipatePin: 1, refreshPriority: 1 },
        onUpdate: function () {
          var t = tl.time(), n = t >= 4.8 ? 3 : t >= 3.0 ? 2 : t >= 1.6 ? 1 : 0;
          nodes.forEach(function (nd, i) { nd.classList.toggle("is-on", i <= n); });
          lbls.forEach(function (lb, i) { lb.style.fill = i === n ? "var(--text)" : ""; });
        }
      });
      tl.to(pkt, { x: 400, duration: 1 }, 0.6).to(prog, { strokeDashoffset: 1 - 300 / 900, duration: 1 }, 0.6);
      swap(tl, 1, 1.55);
      tl.to(pkt, { x: 668, duration: 1 }, 2.0).to(prog, { strokeDashoffset: 1 - 568 / 900, duration: 1 }, 2.0);
      tl.to(okR, { opacity: 0, duration: 0.15 }, 2.85).to(badR, { opacity: 1, duration: 0.15 }, 2.85).to(xm, { opacity: 1, duration: 0.15 }, 2.85);
      swap(tl, 2, 3.05);
      tl.to(rej, { opacity: 1, duration: 0.15 }, 3.0)
        .to(pkt, { y: 150, rotation: 32, opacity: 0, duration: 0.5, ease: "power2.in" }, 3.1)
        .to(rej, { opacity: 0, duration: 0.2 }, 3.55)
        .set(pkt, { x: 560, y: 90, rotation: 0 }, 3.6)
        .set(okR, { opacity: 1 }, 3.6).set(badR, { opacity: 0 }, 3.6).set(xm, { opacity: 0 }, 3.6)
        .to(pkt, { opacity: 1, duration: 0.15 }, 3.65)
        .to(pkt, { x: 1000, duration: 1.1 }, 3.8).to(prog, { strokeDashoffset: 0, duration: 1.1 }, 3.8);
      swap(tl, 3, 4.7);
      tl.to({}, { duration: 0.5 }, 4.95);

      return function () { J.classList.remove("is-scene"); };
    });

    mm.add("(max-width: 899px), (max-height: 559px)", function () {
      rules.forEach(function (r) {
        ScrollTrigger.create({ trigger: r, start: "top 55%", end: "bottom 55%", toggleClass: { targets: r, className: "is-active" } });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Tech ticker: drifts on its own, surges with scroll speed            */
  /* ------------------------------------------------------------------ */
  function initTape() {
    var track = C.$("#tape");
    if (!track) return;
    var group = C.$(".tape__group", track);
    track.appendChild(group.cloneNode(true));
    var x = 0, w = 0, cur = -50, dir = -1, vel = 0, slow = 1, visible = true;
    function measure() { w = group.offsetWidth; }
    measure(); window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    var wrap = function (v) { return w ? ((v % w) - w) % w : 0; };

    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) { dir = self.direction === 1 ? -1 : 1; vel = Math.min(Math.abs(self.getVelocity()), 6000); }
    });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(track.parentNode);
    track.parentNode.addEventListener("pointerenter", function () { slow = 0.3; });
    track.parentNode.addEventListener("pointerleave", function () { slow = 1; });

    gsap.ticker.add(function (time, delta) {
      if (!visible) return;
      var dt = Math.min(delta, 50) / 1000;
      var target = dir * (55 + vel * 0.22) * slow;
      cur += (target - cur) * Math.min(1, dt * 6);
      vel *= Math.pow(0.04, dt);
      x += cur * dt;
      track.style.transform = "translate3d(" + wrap(x).toFixed(2) + "px,0,0)";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Project diagrams: ambient loops, decode chips, tilt                 */
  /* ------------------------------------------------------------------ */
  var LOOPS = {
    pipeline: function (svg) {
      var t = [], feeds = C.$$("path.art-dim", svg).slice(0, 6), i, dot;
      feeds.forEach(function (p, i) {
        dot = svgEl("circle", { r: 4, fill: i === 2 ? "#FFB020" : "var(--accent-bright)", opacity: 0 }, svg);
        t.push(follow(dot, p, 2.4 + i * 0.12, i * 0.38, 0.2));
      });
      var out = C.$$("path.art-line", svg).filter(function (p) { return p.getAttribute("d") === "M262 180H350"; })[0];
      if (out) { dot = svgEl("circle", { r: 4.5, fill: "var(--accent-bright)", opacity: 0 }, svg); t.push(follow(dot, out, 0.9, 0.5, 0.7)); }
      return t;
    },
    emotion: function (svg) {
      var wave = C.$$("path.art-line", svg)[0], dot = svgEl("circle", { r: 8, fill: "#E8EEF6", opacity: 0 }, svg);
      return [follow(dot, wave, 6, 0, 0.4)];
    },
    translate: function (svg) {
      var bars = C.$$(".art-bar", svg);
      return [gsap.to(bars, { scaleY: "random(0.45, 1.3)", duration: 0.45, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true, stagger: { each: 0.04, from: "random" } })];
    },
    vision: function (svg) {
      var scan = svgEl("rect", { x: 62, y: 56, width: 356, height: 2, rx: 1, fill: "var(--accent-bright)", opacity: 0.7 }, svg);
      var dashed = C.$$("rect.art-dim", svg);
      return [
        gsap.fromTo(scan, { attr: { y: 56 } }, { attr: { y: 302 }, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }),
        gsap.to(dashed, { strokeDashoffset: -20, duration: 1.2, repeat: -1, ease: "none", paused: true })
      ];
    },
    grammar: function (svg) {
      var cells = C.$$("rect.art-fill.art-pop", svg), bars = C.$$(".art-bar", svg);
      var marker = C.$$("circle.art-fill", svg)[0];
      var t = [
        gsap.to(cells, { opacity: "random(0.15, 0.95)", duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true, stagger: { each: 0.03, from: "random" } }),
        gsap.to(bars, { scaleY: "random(0.6, 1.2)", duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true, stagger: { each: 0.03, from: "random" } })
      ];
      if (marker) t.push(gsap.fromTo(marker, { attr: { cx: 300 } }, { attr: { cx: 392 }, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));
      return t;
    },
    network: function (svg) {
      var t = [], lines = C.$$("path.art-line", svg).concat(C.$$("path.art-dim", svg)), i, dot;
      for (i = 0; i < lines.length; i += 1) {
        dot = svgEl("circle", { r: 3.6, fill: "var(--accent-bright)", opacity: 0 }, svg);
        t.push(follow(dot, lines[i], 1.8 + (i % 3) * 0.4, (i * 0.37) % 2.2, 0.6 + (i % 4) * 0.3));
      }
      return t;
    }
  };

  function initArt() {
    C.$$(".card").forEach(function (card) {
      var art = C.$("[data-art]", card);
      if (!art) return;
      var svg = C.$("svg", art), build = LOOPS[art.getAttribute("data-art")];
      var made = false, active = false, loops = [], decoded = false;

      ScrollTrigger.create({
        trigger: card, start: "top 85%", end: "bottom 15%",
        onToggle: function (self) {
          active = self.isActive;
          if (active && !decoded) {
            decoded = true;
            C.$$(".chips li", card).forEach(function (li, i) { scramble(li, li.textContent, 0.6, 0.15 + i * 0.07); });
          }
          if (active && !made && build && svg) {
            made = true;
            gsap.delayedCall(1.6, function () {
              safe(function () { loops = build(svg); });
              loops.forEach(function (tw) { if (active) tw.play(); });
            });
          } else loops.forEach(function (tw) { if (active) tw.play(); else tw.pause(); });
        }
      });

      if (finePointer) {
        var rx = gsap.quickTo(art, "rotationX", { duration: 0.5, ease: "power3" }), ry = gsap.quickTo(art, "rotationY", { duration: 0.5, ease: "power3" });
        gsap.set(art, { transformPerspective: 900 });
        art.addEventListener("pointermove", function (e) {
          var r = art.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 12); rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
        });
        art.addEventListener("pointerleave", function () { rx(0); ry(0); });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Services, process, timeline, footer, contact                        */
  /* ------------------------------------------------------------------ */
  function initSections() {
    C.$$(".service").forEach(function (s) {
      s.addEventListener("pointermove", function (e) {
        var r = s.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      var parts = C.$$(".svc-ic > *", s), lens = [];
      parts.forEach(function (p) { var l = 80; try { l = Math.ceil(p.getTotalLength()); } catch (e) {} lens.push(l); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
      ScrollTrigger.create({
        trigger: s, start: "top 88%", once: true,
        onEnter: function () { gsap.to(parts, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: 0.08, delay: 0.15 }); }
      });
    });

    C.$$(".proc__list li").forEach(function (li, i) {
      ScrollTrigger.create({ trigger: li, start: "top 88%", once: true, onEnter: function () { gsap.delayedCall(i * 0.18, function () { li.classList.add("is-on"); }); } });
    });

    C.$$(".tl__item").forEach(function (it) {
      ScrollTrigger.create({ trigger: it, start: "top 66%", toggleClass: { targets: it, className: "is-on" } });
      var when = C.$(".tl__when", it);
      if (when) ScrollTrigger.create({ trigger: it, start: "top 85%", once: true, onEnter: function () { scramble(when, when.textContent, 0.7); } });
    });

    var word = C.$("#word");
    if (word) {
      var wi = C.split(word);
      gsap.set(wi, { yPercent: 105 }); word.style.visibility = "visible";
      ScrollTrigger.create({ trigger: word, start: "top 98%", once: true, onEnter: function () { gsap.to(wi, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.12 }); } });
    }
  }

  function initCopy() {
    var btn = C.$("#copy-email");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var addr = C.email, label = btn.textContent;
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = "Copy"; }, 1800); }
      function fallback() {
        var span = C.$("[data-contact-text]");
        if (span && window.getSelection) { var r = document.createRange(); r.selectNodeContents(span); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        done("Press Ctrl+C");
      }
      if (!addr) return;
      try { navigator.clipboard.writeText(addr).then(function () { done("Copied"); }, fallback); } catch (e) { fallback(); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor ring and magnetic buttons (mouse only)                       */
  /* ------------------------------------------------------------------ */
  function initPointer() {
    if (!finePointer) return;
    var el = document.createElement("div"); el.className = "cur"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el);
    var xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" }), yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    var wasHot = false;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (!e.clientX && !e.clientY) return; /* synthetic first event at 0,0 */
      xTo(e.clientX); yTo(e.clientY); el.classList.add("is-on");
      var hot = !!(e.target.closest && e.target.closest("a, button, [role=radio], [data-cursor], input, select, textarea"));
      if (hot !== wasHot) {
        wasHot = hot;
        gsap.to(el, { scale: hot ? 1.7 : 1, duration: 0.3, ease: "power3.out", overwrite: "auto" });
        el.classList.toggle("is-hot", hot);
      }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () { el.classList.remove("is-on"); });

    C.$$(".hero .btn, .contact .btn, .brand__mark").forEach(function (b) {
      b.classList.add("is-mag");
      var mx = gsap.quickTo(b, "x", { duration: 0.45, ease: "power3" }), my = gsap.quickTo(b, "y", { duration: 0.45, ease: "power3" });
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect(); mx((e.clientX - (r.left + r.width / 2)) * 0.28); my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      b.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  FX.initStatic = function (ctx) { C = ctx; safe(function () { initShader(true); }); };
  FX.init = function (ctx) {
    C = ctx;
    safe(function () { initShader(false); });
    safe(initProgressAndHero);
    safe(initStatement);
    safe(initJourney);
    safe(initTape);
    safe(initArt);
    safe(initSections);
    safe(initCopy);
    safe(initPointer);
  };
  FX.onMode = function (m) { if (shader) shader.setMode(m); };
})();
