/* ===========================================================
   Dashboard — gráficos, calculadora familiar, mapa y FAQ
   =========================================================== */
const soles = (n) => "S/ " + Number(n).toLocaleString("es-PE", { maximumFractionDigits: 0 });
const solesD = (n) => "S/ " + Number(n).toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ---------- tema ---------- */
(function theme() {
  const root = document.documentElement;
  // Claro por defecto; solo oscuro si el usuario lo eligió antes.
  const saved = localStorage.getItem("tema");
  root.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
  const btn = document.getElementById("theme");
  const btnM = document.getElementById("themeM");
  const isDark = () => root.getAttribute("data-theme") === "dark";
  const paint = () => {
    const ic = isDark() ? "☀" : "☾";
    if (btn) btn.innerHTML = ic + " <span>Tema</span>";
    if (btnM) btnM.textContent = ic;
  };
  paint();
  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("tema", next);
    paint();
    if (window.__charts) window.__charts.forEach((c) => c && c.update());
  };
  btn && btn.addEventListener("click", toggle);
  btnM && btnM.addEventListener("click", toggle);
})();

/* ---------- sidebar: toggle móvil + scrollspy ---------- */
(function nav() {
  const sb = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  const burger = document.getElementById("burger");
  const close = () => { sb.classList.remove("open"); scrim.classList.remove("show"); };
  const open = () => { sb.classList.add("open"); scrim.classList.add("show"); };
  burger && burger.addEventListener("click", () => (sb.classList.contains("open") ? close() : open()));
  scrim && scrim.addEventListener("click", close);
  const links = [...document.querySelectorAll(".side-nav a")];
  links.forEach((a) => a.addEventListener("click", () => { if (innerWidth <= 900) close(); }));
  const inti = document.getElementById("askInti");
  inti && inti.addEventListener("click", () => { document.getElementById("botfab").click(); if (innerWidth <= 900) close(); });
  // scrollspy
  const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = () => {
    let cur = secs[0];
    const y = scrollY + 120;
    secs.forEach((s) => { if (s.offsetTop <= y) cur = s; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + cur.id));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();
})();

const cssv = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- Chart.js defaults ---------- */
function chartDefaults() {
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = cssv("--ink-faint");
  Chart.defaults.borderColor = cssv("--line");
}
window.__charts = [];

/* ---------- Gráfico 1: ingreso por área vs línea familia ---------- */
function chartIngreso() {
  const ctx = document.getElementById("chIngreso");
  if (!ctx) return;
  const d = DATA.ingreso, linea = DATA.pobreza.fam4_consumo;
  const labels = ["Rural", "Nacional", "Urbano", "Lima (oficial)"];
  const vals = [d.rural, d.nacional, d.urbano, d.lima_oficial];
  const colors = vals.map((v) => (v >= linea ? cssv("--accent") : cssv("--danger")));
  // línea de umbral — plugin LOCAL solo para este gráfico
  const umbral = {
    id: "umbral",
    afterDraw(ch) {
      if (!ch.scales || !ch.scales.y) return;
      const y = ch.scales.y.getPixelForValue(linea);
      const { left, right } = ch.chartArea;
      const g = ch.ctx;
      g.save();
      g.strokeStyle = cssv("--warn"); g.lineWidth = 2; g.setLineDash([6, 4]);
      g.beginPath(); g.moveTo(left, y); g.lineTo(right, y); g.stroke();
      g.setLineDash([]); g.fillStyle = cssv("--warn"); g.font = "700 11px " + Chart.defaults.font.family;
      g.fillText("Línea pobreza familia de 4 · " + soles(linea), left + 6, y - 6);
      g.restore();
    },
  };
  const c = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderRadius: 7, maxBarThickness: 62 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (i) => solesD(i.raw) + " / mes" } },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: cssv("--line") }, ticks: { callback: (v) => soles(v) } },
        x: { grid: { display: false } },
      },
    },
    plugins: [umbral],
  });
  window.__charts.push(c);
}

/* ---------- Gráfico 2: pobreza y vulnerabilidad ---------- */
function chartPobreza() {
  const ctx = document.getElementById("chPobreza");
  if (!ctx) return;
  const p = DATA.pobreza;
  const noPobre = +(100 - p.tasa_pobreza).toFixed(1);
  const c = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pobreza extrema", "Pobreza no extrema", "Vulnerables", "No pobres / no vulnerables"],
      datasets: [{
        data: [p.pobreza_extrema, +(p.tasa_pobreza - p.pobreza_extrema).toFixed(1), p.vulnerables, +(noPobre - p.vulnerables).toFixed(1)],
        backgroundColor: [cssv("--danger"), cssv("--c3"), cssv("--c2"), cssv("--accent")],
        borderColor: cssv("--surface"), borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 12 } } },
        tooltip: { callbacks: { label: (i) => i.label + ": " + i.raw + "%" } },
      },
    },
  });
  window.__charts.push(c);
}

/* ---------- Gráfico 3: pirámide poblacional ---------- */
function chartPiramide() {
  const ctx = document.getElementById("chPiramide");
  if (!ctx) return;
  const p = DATA.piramide;
  const c = new Chart(ctx, {
    type: "bar",
    data: {
      labels: p.map((x) => x.g),
      datasets: [
        { label: "Hombres", data: p.map((x) => -x.h), backgroundColor: cssv("--c2"), borderRadius: 4 },
        { label: "Mujeres", data: p.map((x) => x.m), backgroundColor: cssv("--rojo"), borderRadius: 4 },
      ],
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } },
        tooltip: { callbacks: { label: (i) => i.dataset.label + ": " + Math.abs(i.raw) + "%" } },
      },
      scales: {
        x: { stacked: true, grid: { color: cssv("--line") }, ticks: { callback: (v) => Math.abs(v) + "%" }, min: -14, max: 14 },
        y: { stacked: true, grid: { display: false } },
      },
    },
  });
  window.__charts.push(c);
}

/* ---------- Gráfico 4: evolución poblacional por censo ---------- */
function chartCensos() {
  const ctx = document.getElementById("chCensos");
  if (!ctx) return;
  const h = DATA.censos_hist;
  const c = new Chart(ctx, {
    type: "line",
    data: {
      labels: h.map((x) => x.a),
      datasets: [{
        data: h.map((x) => x.p), label: "Población (millones)",
        borderColor: cssv("--accent"), backgroundColor: "transparent",
        pointBackgroundColor: cssv("--rojo"), pointRadius: 4, tension: 0.3, borderWidth: 3,
        fill: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (i) => i.raw + " M habitantes (" + h[i.dataIndex].a + ")" } },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: cssv("--line") }, ticks: { callback: (v) => v + " M" } },
        x: { grid: { display: false } },
      },
    },
  });
  window.__charts.push(c);
}

/* ---------- Calculadora familiar ---------- */
function calculadora() {
  const rMiembros = document.getElementById("cMiembros");
  const rIngresos = document.getElementById("cIngresos");
  const rMonto = document.getElementById("cMonto");
  if (!rMiembros) return;
  const out = {
    miembros: document.getElementById("vMiembros"),
    ingresos: document.getElementById("vIngresos"),
    monto: document.getElementById("vMonto"),
    lab: document.getElementById("verLab"),
    big: document.getElementById("verBig"),
    exp: document.getElementById("verExp"),
    box: document.getElementById("verBox"),
    linea: document.getElementById("mLinea"),
    total: document.getElementById("mTotal"),
    percap: document.getElementById("mPercap"),
    percentil: document.getElementById("mPercentil"),
    nse: document.getElementById("mNse"),
    nseScale: document.getElementById("nseScale"),
    nseNote: document.getElementById("mNseNote"),
  };
  // Escala NSE de menor a mayor (E … A++), generada desde los datos
  if (els.nseScale && !els.nseScale.children.length) {
    els.nseScale.style.gridTemplateColumns = "repeat(" + DATA.nse.length + ",1fr)";
    [...DATA.nse].reverse().forEach((n) => {
      const s = document.createElement("span");
      s.dataset.k = n.k; s.textContent = n.k;
      els.nseScale.appendChild(s);
    });
  }
  // Nivel socioeconómico según ingreso total del hogar (primero cuyo umbral cumple)
  const nseDe = (total) => DATA.nse.find((n) => total >= n.min) || DATA.nse[DATA.nse.length - 1];
  // Percentil estimado según ingreso per cápita (deciles INEI)
  const percentilPC = (x) => {
    const pts = DATA.deciles_pc;
    if (x <= pts[0].s) return Math.max(1, Math.round((pts[0].p * x) / pts[0].s));
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (x <= b.s) return Math.round(a.p + ((b.p - a.p) * (x - a.s)) / (b.s - a.s));
    }
    return Math.min(99, Math.round(pts[pts.length - 1].p + (4 * x) / pts[pts.length - 1].s));
  };
  function render() {
    const m = +rMiembros.value, monto = +rMonto.value;
    // los que aportan no pueden superar a los integrantes
    let ing = +rIngresos.value;
    if (ing > m) { ing = m; rIngresos.value = m; }
    const total = ing * monto;
    const linea = m * DATA.pobreza.canasta_consumo_pc;
    const lineaExt = m * DATA.pobreza.canasta_alim_pc;
    const percap = total / m;
    out.miembros.textContent = m;
    out.ingresos.textContent = ing;
    out.monto.textContent = soles(monto);
    out.linea.textContent = soles(linea);
    out.total.textContent = soles(total);
    out.percap.textContent = soles(percap);
    // Percentil (por persona) y NSE (por hogar)
    const pct = percentilPC(percap);
    out.percentil.innerHTML = pct + "% de las personas 🇵🇪";
    const nse = nseDe(total);
    out.nse.textContent = "NSE " + nse.k + " · " + nse.nombre;
    if (out.nseNote) out.nseNote.textContent = nse.desc;
    if (out.nseScale)
      [...out.nseScale.children].forEach((el) => el.classList.toggle("on", el.dataset.k === nse.k));
    let lab, big, exp, cls;
    if (percap < DATA.pobreza.canasta_alim_pc) {
      cls = "bad"; lab = "Pobreza extrema";
      big = soles(lineaExt - total) + " por debajo";
      exp = "El ingreso per cápita (" + soles(percap) + ") no cubre ni la canasta de alimentos de " + soles(DATA.pobreza.canasta_alim_pc) + " por persona.";
    } else if (percap < DATA.pobreza.canasta_consumo_pc) {
      cls = "bad"; lab = "Bajo la línea de pobreza";
      big = soles(linea - total) + " por debajo";
      exp = "Faltan " + soles(linea - total) + " al mes para que el hogar supere la línea de pobreza de " + soles(linea) + ".";
    } else {
      cls = "ok"; lab = "Sobre la línea";
      big = soles(total - linea) + " de margen";
      exp = "El hogar cubre la canasta básica (" + soles(linea) + ") con " + soles(total - linea) + " de margen. Per cápita: " + soles(percap) + ".";
    }
    out.box.className = "verdict " + cls;
    out.lab.textContent = lab; out.big.textContent = big; out.exp.textContent = exp;
    // expone el estado para el juego de medallas
    window.__calcState = {
      miembros: m, ingresos: ing, monto, total, linea, percap,
      over: percap >= DATA.pobreza.canasta_consumo_pc,
      extreme: percap < DATA.pobreza.canasta_alim_pc,
      pct, nse: nse.k, nseNombre: nse.nombre,
    };
    document.dispatchEvent(new CustomEvent("calc:update", { detail: window.__calcState }));
  }
  [rMiembros, rIngresos, rMonto].forEach((r) => r.addEventListener("input", render));
  render();
}

/* ---------- Mapa de costo de vida / pobreza ---------- */
function mapa() {
  const el = document.getElementById("map");
  if (!el || typeof L === "undefined") return;
  const map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView([-9.8, -74.5], 5);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 10,
  }).addTo(map);

  const costoColor = { 4: "#8f1020", 3: "#d5182f", 2: "#cf8a1e", 1: "#0f8a86" };
  const pobColor = (p) => (p >= 40 ? "#8f1020" : p >= 30 ? "#d5182f" : p >= 20 ? "#cf8a1e" : "#0f8a86");
  let modo = "costo";
  let layer = L.layerGroup().addTo(map);

  function draw() {
    layer.clearLayers();
    REGIONES.forEach((r) => {
      const color = modo === "costo" ? costoColor[r.costo] : pobColor(r.pobreza);
      const radius = modo === "costo" ? 6 + r.costo * 2.5 : 5 + r.pobreza / 4;
      const m = L.circleMarker([r.lat, r.lng], {
        radius, color: "#fff", weight: 1.4, fillColor: color, fillOpacity: 0.85,
      }).addTo(layer);
      m.bindPopup(
        "<b>" + r.r + "</b><br>" + r.cap +
        "<br>Costo de vida: <b>" + NIVEL_COSTO[r.costo] + "</b>" +
        "<br>Pobreza (INEI 2024): <b>≈ " + r.pobreza + "%</b>"
      );
      m.bindTooltip(r.r, { direction: "top", offset: [0, -4] });
    });
  }
  draw();

  document.querySelectorAll(".tgl").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".tgl").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      modo = b.dataset.modo;
      document.getElementById("legendCosto").style.display = modo === "costo" ? "flex" : "none";
      document.getElementById("legendPob").style.display = modo === "pobreza" ? "flex" : "none";
      draw();
    })
  );
}

/* ---------- FAQ ---------- */
function renderFAQ() {
  const box = document.getElementById("faqList");
  if (!box) return;
  box.innerHTML = FAQ.map((f) =>
    "<details><summary>" + f.q + "</summary><p>" + f.a + "</p></details>"
  ).join("");
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = "2026";
  document.getElementById("upd").textContent = DATA.actualizado;
  chartDefaults();
  chartIngreso();
  chartPobreza();
  chartPiramide();
  chartCensos();
  calculadora();
  mapa();
  renderFAQ();
  // Re-medir los charts cuando el layout/tipografías terminen de cargar
  const relayout = () => (window.__charts || []).forEach((c) => { try { c.resize(); c.update(); } catch (e) {} });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  addEventListener("load", relayout);
  setTimeout(relayout, 250);
  setTimeout(relayout, 900);
});
