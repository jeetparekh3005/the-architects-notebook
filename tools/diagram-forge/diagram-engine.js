/*
 * diagram-engine.js — The Architect's Notebook house diagram engine.
 *
 * One function renders a spec into an animated, self-contained SVG in the
 * locked house style: Neo-brutal cards on graph paper, Line-Mono labels, and a
 * two-motion semantic language.
 *
 *   KEY            pulse = a call (sync) · dashed = async · thick = hot path
 *
 * No dependencies, no build step, no network. Drop this file on a page and call
 * Diagram.render(hostElement, spec). See README.md for the spec format.
 *
 * Public API
 *   Diagram.render(host, spec, opts) -> { stop() }
 *     host : a DOM element to render into (its contents are replaced)
 *     spec : the diagram spec object (see README)
 *     opts : { animate=true, t=2.2, inViewOnly=false }
 *            animate=false renders a single frozen frame at time t (for export)
 *   Diagram.ICONS  -> the glyph registry (names usable as node.icon)
 *   Diagram.STYLE  -> the house-style tokens (colours, speed); tweak before render
 */
(function (global) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var STYLE = {
    sig: "#0f9b8e",      // the one signal colour (a call in flight)
    ink: "#111",         // strokes, borders, labels
    paper: "#fbfdf7",    // graph-paper ground / label backing
    gridMinor: "#cfe0d8",
    gridMajor: "#bcd3c8",
    tierColor: "#9a9a94",
    subColor: "#8a8a8a",
    badgeBg: "#ffd23f",
    speed: 0.5,          // global speed multiplier (lower is slower)
    nodeSize: 58,        // square node side; wide nodes are 150
  };

  // ---- glyphs: each draws line art into a group; stroke is currentColor ----
  function mk(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function P(d, g) { mk("path", { d: d, class: "df-gl" }, g); }
  function R(x, y, w, h, r, g) { mk("rect", { x: x, y: y, width: w, height: h, rx: r, class: "df-gl" }, g); }
  function C(cx, cy, r, g, filled) { mk("circle", { cx: cx, cy: cy, r: r, class: "df-gl" + (filled ? " df-f" : "") }, g); }

  var ICONS = {
    phone: function (g) { R(-11, -18, 22, 36, 4, g); P("M-4 12 h8", g); },
    monitor: function (g) { R(-18, -14, 36, 24, 3, g); P("M-6 10 l-2 7 M6 10 l2 7 M-11 17 h22", g); },
    gate: function (g) { P("M-6 -16 h-8 v32 h8 M6 -16 h8 v32 h-8", g); C(0, 0, 3, g, true); },
    branch: function (g) { C(0, -14, 4.5, g); P("M0 -9 L-14 10 M0 -9 L0 10 M0 -9 L14 10", g); [-14, 0, 14].forEach(function (x) { C(x, 14, 3.6, g); }); },
    hub: function (g) { C(0, 0, 16, g); C(0, 0, 6, g); P("M0 -16 v-5 M0 16 v5 M-16 0 h-5 M16 0 h5", g); },
    box: function (g) { R(-16, -13, 32, 26, 4, g); P("M-9 -4 h18 M-9 4 h12", g); },
    server: function (g) { [-14, 2].forEach(function (y) { R(-18, y, 36, 12, 3, g); C(-12, y + 6, 1.6, g, true); P("M-4 " + (y + 6) + " h12", g); }); },
    surge: function (g) { P("M-16 12 L-5 -2 L3 6 L16 -12", g); P("M9 -12 h7 v7", g); },
    hex: function (g) { P("M0 -17 L15 -8 L15 9 L0 18 L-15 9 L-15 -8 Z", g); C(0, 1, 3, g, true); },
    route: function (g) { C(-11, -11, 3.5, g); C(12, 12, 3.5, g); P("M-11 -7 v10 a7 7 0 0 0 7 7 h9 a7 7 0 0 1 7 7", g); },
    bell: function (g) { P("M-11 8 a11 13 0 0 1 22 0 Z", g); P("M-4 11 a4 4 0 0 0 8 0 M0 -5 v-6", g); },
    map: function (g) { P("M-15 -11 l10 -4 l10 4 l10 -4 v26 l-10 4 l-10 -4 l-10 4 Z", g); P("M-5 -15 v26 M5 -11 v26", g); },
    card: function (g) { R(-16, -11, 32, 22, 3, g); P("M-16 -3 h32 M-11 6 h8", g); },
    stream: function (g) { [-7, 0, 7].forEach(function (y) { P("M-24 " + y + " q 8 -5 16 0 t 16 0 t 16 0", g); }); },
    cyl: function (g) { mk("ellipse", { cx: 0, cy: -11, rx: 15, ry: 5, class: "df-gl" }, g); P("M-15 -11 V11 a15 5 0 0 0 30 0 V-11 M-15 0 a15 5 0 0 0 30 0", g); },
    stack: function (g) { [6, -3, -12].forEach(function (y) { R(-15, y, 30, 9, 2.5, g); }); },
    bars: function (g) { [[-11, 4], [-3, -6], [5, -14]].forEach(function (b) { R(b[0], b[1], 6, 14 - b[1], 1.5, g); }); P("M-15 18 h30", g); },
    journal: function (g) { R(-14, -17, 28, 34, 3, g); [-9, -3, 3, 9].forEach(function (y) { P("M-8 " + y + " h16", g); }); },
    grid: function (g) { [[-13, -13], [1, -13], [-13, 1], [1, 1]].forEach(function (c) { R(c[0], c[1], 12, 12, 1.5, g); }); },
    bloom: function (g) { for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) C(-11 + c * 11, -11 + r * 11, 3, g, (r + c) % 2 === 0); },
    merge: function (g) { P("M-15 -13 L0 2 L15 -13", g); P("M0 2 V15 M-6 9 L0 15 L6 9", g); },
    cloud: function (g) { P("M-14 8 a9 9 0 0 1 3 -17 a11 11 0 0 1 20 4 a7 7 0 0 1 -1 13 Z", g); },
    lock: function (g) { R(-12, -2, 24, 18, 3, g); P("M-7 -2 v-6 a7 7 0 0 1 14 0 v6", g); C(0, 7, 2, g, true); },
  };

  // ---- geometry: orthogonal routing (Manhattan) ----
  function routePts(N, a, b, trim) {
    var A = N[a], B = N[b], r = STYLE.nodeSize / 2 + 2;
    if (Math.abs(A.x - B.x) < 1) {
      var s = Math.sign(B.y - A.y) || 1;
      return trim ? [[A.x, A.y + s * r], [B.x, B.y - s * r]] : [[A.x, A.y], [B.x, B.y]];
    }
    if (Math.abs(A.y - B.y) < 1) {
      var sx = Math.sign(B.x - A.x) || 1;
      return trim ? [[A.x + sx * r, A.y], [B.x - sx * r, B.y]] : [[A.x, A.y], [B.x, B.y]];
    }
    var m = (A.y + B.y) / 2, da = Math.sign(m - A.y), db = Math.sign(B.y - m);
    return trim
      ? [[A.x, A.y + da * r], [A.x, m], [B.x, m], [B.x, B.y - db * r]]
      : [[A.x, A.y], [A.x, m], [B.x, m], [B.x, B.y]];
  }
  function dOf(pts) { return "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L "); }
  function polyAt(pts, cum, len, d) {
    d = Math.max(0, Math.min(len, d));
    for (var i = 1; i < cum.length; i++) {
      if (d <= cum[i]) {
        var t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
    }
    return pts[pts.length - 1];
  }

  // ---- style injection (once per document) ----
  function injectCSS() {
    if (document.getElementById("df-style")) return;
    var css = [
      ".df-wrap{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111}",
      ".df-badge{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#111;background:" + STYLE.badgeBg + ";display:inline-block;padding:4px 9px;border:2px solid #111;border-radius:4px;box-shadow:2px 2px 0 #111}",
      ".df-title{font-size:clamp(22px,3.3vw,33px);letter-spacing:-.02em;margin:12px 0 6px;font-weight:800}",
      ".df-sub{color:#444;font-size:14.5px;max-width:82ch;margin:0 0 14px;line-height:1.5}",
      ".df-legend{display:inline-flex;flex-wrap:wrap;gap:0;align-items:stretch;background:#fff;border:2px solid #111;border-radius:8px;box-shadow:3px 3px 0 #111;overflow:hidden;font-family:ui-monospace,Menlo,monospace}",
      ".df-legend .k{display:flex;align-items:center;gap:9px;padding:11px 15px;border-right:2px solid #111;font-size:12.5px;font-weight:700;white-space:nowrap}",
      ".df-legend .k:last-child{border-right:0}",
      ".df-legend .g{font-weight:400;color:#777;font-size:11px}",
      ".df-legend .lbl{font-size:10px;letter-spacing:.16em;text-transform:uppercase;padding:11px 12px;background:#111;color:#fff;display:flex;align-items:center}",
      ".df-svg{display:block;width:100%;height:auto;margin-top:14px}",
      ".df-gl{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}",
      ".df-gl.df-f{fill:currentColor}",
      ".df-nm{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;font-weight:700;letter-spacing:.01em;fill:#111}",
      ".df-ns{font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.02em;fill:" + STYLE.subColor + "}",
      ".df-tl{font-family:ui-monospace,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:.16em;fill:" + STYLE.tierColor + "}",
    ].join("\n");
    var s = document.createElement("style");
    s.id = "df-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function text(parent, x, y, str, cls, anchor) {
    var t = mk("text", { x: x, y: y, class: cls, "text-anchor": anchor || "middle" }, parent);
    t.textContent = str;
    return t;
  }

  function legendHTML() {
    function cell(sw, term, gloss) {
      return '<span class="k">' + sw + term + (gloss ? ' <span class="g">' + gloss + "</span>" : "") + "</span>";
    }
    var sig = STYLE.sig, ink = STYLE.ink;
    return '<span class="lbl">Key</span>' +
      cell('<svg width="22" height="14"><circle cx="15" cy="7" r="4" fill="' + sig + '"/><circle cx="15" cy="7" r="7" fill="' + sig + '" opacity=".22"/></svg>', "Pulse", "a call") +
      cell('<svg width="26" height="14"><line x1="2" y1="7" x2="24" y2="7" stroke="' + ink + '" stroke-width="2.2"/></svg>', "Solid", "sync") +
      cell('<svg width="26" height="14"><line x1="2" y1="7" x2="24" y2="7" stroke="' + ink + '" stroke-width="2.2" stroke-dasharray="4 3"/></svg>', "Dashed", "async") +
      cell('<svg width="26" height="14"><line x1="2" y1="7" x2="24" y2="7" stroke="' + ink + '" stroke-width="4.5"/></svg>', "Thick", "hot path");
  }

  // ---- the renderer ----
  function render(host, spec, opts) {
    opts = opts || {};
    var animate = opts.animate !== false;
    injectCSS();

    // resolve node y from tier index; keep explicit x
    var N = {};
    Object.keys(spec.nodes).forEach(function (id) {
      var n = spec.nodes[id];
      N[id] = {
        x: n.x, y: (n.y != null ? n.y : spec.tiers[n.tier].y),
        label: n.label, sub: n.sub || "", icon: n.icon || "box", wide: !!n.wide,
      };
    });
    var W = spec.width || 1160, H = spec.height || 940;

    host.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "df-wrap";
    if (spec.badge) { var b = document.createElement("span"); b.className = "df-badge"; b.textContent = spec.badge; wrap.appendChild(b); }
    if (spec.title) { var h1 = document.createElement("h1"); h1.className = "df-title"; h1.textContent = spec.title; wrap.appendChild(h1); }
    if (spec.subtitle) { var p = document.createElement("p"); p.className = "df-sub"; p.textContent = spec.subtitle; wrap.appendChild(p); }
    var lg = document.createElement("div"); lg.className = "df-legend"; lg.innerHTML = legendHTML(); wrap.appendChild(lg);
    var svg = mk("svg", { viewBox: "0 0 " + W + " " + H, class: "df-svg", role: "img", "aria-label": (spec.title || "diagram") }); wrap.appendChild(svg);
    host.appendChild(wrap);

    var defs = mk("defs", {}, svg);
    var glow = mk("filter", { id: "df-glow", x: "-200%", y: "-200%", width: "500%", height: "500%" }, defs);
    mk("feGaussianBlur", { stdDeviation: "5" }, glow);
    var pMinor = mk("pattern", { id: "df-gp", width: 20, height: 20, patternUnits: "userSpaceOnUse" }, defs);
    mk("path", { d: "M20 0 H0 V20", fill: "none", stroke: STYLE.gridMinor, "stroke-width": "1" }, pMinor);
    var pMajor = mk("pattern", { id: "df-gp2", width: 100, height: 100, patternUnits: "userSpaceOnUse" }, defs);
    mk("path", { d: "M100 0 H0 V100", fill: "none", stroke: STYLE.gridMajor, "stroke-width": "1.4" }, pMajor);
    mk("rect", { x: 0, y: 0, width: W, height: H, fill: STYLE.paper }, svg);
    mk("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#df-gp)" }, svg);
    mk("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#df-gp2)" }, svg);

    spec.tiers.forEach(function (t) { text(svg, 40, t.y - 24, t.label.toUpperCase(), "df-tl", "start"); });

    // flows carry pulses (solid/thick wires); async/weak are static wires
    var flows = (spec.flows || []).map(function (f) { return { seq: f.seq, hot: !!f.hot }; });
    var hotEdge = {};
    flows.forEach(function (f) { if (f.hot) for (var i = 0; i < f.seq.length - 1; i++) hotEdge[[f.seq[i], f.seq[i + 1]].sort().join("|")] = 1; });

    flows.forEach(function (f) {
      var pts = [], idx = [];
      for (var i = 0; i < f.seq.length - 1; i++) {
        var r = routePts(N, f.seq[i], f.seq[i + 1], false);
        if (i === 0) idx.push(0);
        for (var k = (i === 0 ? 0 : 1); k < r.length; k++) pts.push(r[k]);
        idx.push(pts.length - 1);
      }
      var cum = [0];
      for (var j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
      f.pts = pts; f.cum = cum; f.len = cum[cum.length - 1]; f.nodeCum = idx.map(function (ix) { return cum[ix]; });
      f.speed = (spec.pulseSpeed || 290);
      f.period = (spec.pulsePeriod || 4.8);
      f.offset = (f.offset != null ? f.offset : (f._off = (flows.indexOf(f) % 5) * 0.8 + 0.2));
    });

    var drawn = {};
    function wire(a, b, kind) {
      var key = [a, b].sort().join("|");
      if (drawn[key]) return;
      drawn[key] = 1;
      var hot = hotEdge[key];
      mk("path", {
        d: dOf(routePts(N, a, b, true)), fill: "none", stroke: STYLE.ink,
        "stroke-width": hot ? 4 : (kind === "weak" ? 1.4 : 2),
        "stroke-opacity": kind === "weak" ? 0.45 : 1,
        "stroke-dasharray": kind === "async" ? "6 7" : (kind === "weak" ? "2 7" : "none"),
        "stroke-linecap": "round",
      }, svg);
    }
    flows.forEach(function (f) { for (var i = 0; i < f.seq.length - 1; i++) wire(f.seq[i], f.seq[i + 1], "sync"); });
    (spec.async || []).forEach(function (e) { wire(e[0], e[1], "async"); });
    (spec.weak || []).forEach(function (e) { wire(e[0], e[1], "weak"); });

    var gref = {};
    Object.keys(N).forEach(function (id) {
      var n = N[id], bw = n.wide ? 150 : STYLE.nodeSize, bh = n.wide ? 46 : STYLE.nodeSize;
      var g = mk("g", { transform: "translate(" + n.x + "," + n.y + ")" }, svg);
      mk("rect", { x: -bw / 2 + 4, y: -bh / 2 + 5, width: bw, height: bh, rx: 5, fill: STYLE.ink }, g);         // hard shadow
      mk("rect", { x: -bw / 2, y: -bh / 2, width: bw, height: bh, rx: 5, fill: "#fff", stroke: STYLE.ink, "stroke-width": 2 }, g);
      var gg = mk("g", { "stroke-width": 2, style: "color:" + STYLE.ink }, g);
      (ICONS[n.icon] || ICONS.box)(gg);
      gref[id] = gg;
      // label with a paper backing so wires never cross the text
      var lw = Math.max(n.label.length * 7.6, n.sub.length * 6.0) + 16;
      mk("rect", { x: n.x - lw / 2, y: n.y + bh / 2 + 7, width: lw, height: n.sub ? 31 : 18, rx: 4, fill: STYLE.paper }, svg);
      text(svg, n.x, n.y + bh / 2 + 20, n.label, "df-nm");
      if (n.sub) text(svg, n.x, n.y + bh / 2 + 33, n.sub, "df-ns");
    });
    function recolour(id, c) { gref[id].style.color = c || STYLE.ink; }

    var dyn = mk("g", {}, svg);
    function frame(T) {
      while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
      var ign = {};
      flows.forEach(function (f) {
        var sp = f.speed * STYLE.speed, travT = f.len / sp, nP = Math.ceil(travT / f.period) + 1, kHi = Math.floor((T - f.offset) / f.period);
        for (var k = kHi; k > kHi - nP - 1; k--) {
          var age = T - (f.offset + k * f.period);
          if (age < 0 || age > travT) continue;
          var d = age * sp, hd = polyAt(f.pts, f.cum, f.len, d);
          mk("circle", { cx: hd[0], cy: hd[1], r: f.hot ? 9 : 7, fill: STYLE.sig, filter: "url(#df-glow)", "fill-opacity": 0.5 }, dyn);
          mk("circle", { cx: hd[0], cy: hd[1], r: f.hot ? 4.2 : 3.6, fill: STYLE.sig }, dyn);
          mk("circle", { cx: hd[0], cy: hd[1], r: 1.3, fill: "#fff" }, dyn);
          for (var si = 0; si < f.seq.length; si++) {
            var near = 1 - Math.abs(d - f.nodeCum[si]) / 40;
            if (near > 0 && (!ign[f.seq[si]] || ign[f.seq[si]] < near)) ign[f.seq[si]] = near;
          }
        }
      });
      for (var id in N) {
        var n = N[id];
        if (ign[id]) {
          recolour(id, STYLE.sig);
          mk("circle", { cx: n.x, cy: n.y, r: 30 + (1 - ign[id]) * 18, fill: "none", stroke: STYLE.sig, "stroke-width": 2, "stroke-opacity": (ign[id] * 0.55).toFixed(3) }, dyn);
        } else recolour(id, STYLE.ink);
      }
    }

    if (!animate) { frame(opts.t != null ? opts.t : 2.2); return { stop: function () {} }; }

    var raf = 0, t0 = null, T = 0, stopped = false;
    function inView() {
      if (!opts.inViewOnly) return true;
      var r = svg.getBoundingClientRect();
      return r.bottom > -80 && r.top < (window.innerHeight + 80);
    }
    function loop(ts) {
      if (stopped) return;
      if (t0 === null) t0 = ts;
      T += (ts - t0) / 1000; t0 = ts;
      if (inView()) frame(T);
      raf = requestAnimationFrame(loop);
    }
    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion:reduce)").matches) frame(2.2);
    else raf = requestAnimationFrame(loop);
    return { stop: function () { stopped = true; if (raf) cancelAnimationFrame(raf); } };
  }

  global.Diagram = { render: render, ICONS: ICONS, STYLE: STYLE };
})(typeof window !== "undefined" ? window : this);
