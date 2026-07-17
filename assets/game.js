/* ===========================================================
   Juego "Gánale a la pobreza" — medalla andina, confeti,
   compartir en redes, captura de nombre/correo y Yape.
   El envío real de correo se hace vía un backend seguro
   (api.tunky.net) cuando MEDAL_API esté configurado; si no,
   cae a mailto + guardado local (funciona en GitHub Pages).
   =========================================================== */
(function () {
  // Cuando el servicio seguro esté listo, poner la URL, p.ej.:
  // const MEDAL_API = "https://api.tunky.net/medalla";
  const MEDAL_API = "";
  const PAGE = "https://unimauro.github.io/ingreso-costo-vida/#reto";
  const track = (ev, params) => { try { window.gtag && gtag("event", ev, params || {}); } catch (e) {} };

  const CHAKANA = "M40 0h20v20h20v20h20v20H80v20H60v20H40V80H20V60H0V40h20V20h20z";

  const TIERS = {
    gana:  { emoji: "🏅", color: "#0f8a86", title: "¡Ampay! Le ganas a la pobreza",
      msg: "Tu hogar supera la canasta básica del INEI: <b>no es pobre</b>. 🎉",
      share: "🏅 ¡Ampay! Según el INEI, mi familia le gana a la pobreza. ¿Y la tuya? Evalúalo 👇" },
    linea: { emoji: "⚖️", color: "#cf8a1e", title: "Estás en la línea",
      msg: "Cubres los alimentos pero no toda la canasta. Estás en el <b>umbral de la pobreza</b>.",
      share: "⚖️ Estoy justo en la línea de la pobreza según el INEI. Mide tu ingreso familiar 👇" },
    lucha: { emoji: "🎗️", color: "#d5182f", title: "En la lucha",
      msg: "El ingreso per cápita no cubre la canasta de alimentos. Estás en <b>pobreza extrema</b> según el INEI. 💪",
      share: "🎗️ Estos son los números reales del costo de vida en el Perú (INEI). Míralos 👇" },
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    medal: $("medal"), svg: $("medalSvg"), emoji: $("medalEmoji"),
    title: $("medalTitle"), sub: $("medalSub"),
    hint: $("gameHint"), shareRow: $("shareRow"),
    wsp: $("shWsp"), fb: $("shFb"), x: $("shX"), copy: $("shCopy"), dl: $("shDl"),
    name: $("gName"), email: $("gEmail"), send: $("gSend"), optin: $("gOptin"),
  };
  if (!els.medal) return;

  let wasGana = false, unlocked = false;
  let current = null;

  function tierOf(st) {
    if (!st) return "lucha";
    return st.over ? "gana" : st.extreme ? "lucha" : "linea";
  }

  function paint() {
    const st = window.__calcState;
    const key = tierOf(st);
    const t = TIERS[key];
    current = key;
    els.svg.style.color = t.color;
    els.emoji.textContent = t.emoji;
    if (unlocked) {
      const name = (els.name.value || "").trim();
      els.title.textContent = (name ? name + ", " : "") + t.title;
      els.sub.innerHTML = t.msg + (st ? "<br><small>Superas al <b>" + st.pct +
        "%</b> del Perú · Nivel <b>NSE " + st.nse + "</b> (" + st.nseNombre + ")</small>" : "");
    }
  }

  function setShareLinks() {
    const st = window.__calcState;
    const t = TIERS[tierOf(st)];
    let extra = "";
    if (st && st.pct != null) extra = " Mi hogar supera al " + st.pct + "% del Perú por ingreso (NSE " + st.nse + ").";
    const text = t.share + extra + " " + PAGE;
    els.wsp.href = "https://wa.me/?text=" + encodeURIComponent(text);
    els.fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(PAGE) +
      "&quote=" + encodeURIComponent(t.share);
    els.x.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(t.share) +
      "&url=" + encodeURIComponent(PAGE);
  }

  function unlock() {
    unlocked = true;
    els.medal.classList.remove("pop"); void els.medal.offsetWidth; els.medal.classList.add("pop");
    els.hint.style.display = "none";
    paint();
    setShareLinks();
    const key = tierOf(window.__calcState);
    if (key === "gana" && !wasGana) { confetti(); track("medalla_gana"); }
    wasGana = key === "gana";
    track("medalla_desbloqueada", { nivel: key });
  }

  // se desbloquea al mover cualquier control de la calculadora
  const cMonto = $("cMonto"), cMiembros = $("cMiembros"), cIngresos = $("cIngresos");
  const onFirstUse = () => { if (!unlocked) unlock(); };
  [cMonto, cMiembros, cIngresos].forEach((el) => el && el.addEventListener("input", onFirstUse));

  document.addEventListener("calc:update", () => { if (unlocked) { paint(); setShareLinks(); const k = tierOf(window.__calcState); if (k === "gana" && !wasGana) confetti(); wasGana = k === "gana"; } });
  els.name.addEventListener("input", () => { if (unlocked) paint(); });

  // compartir
  els.copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(PAGE); els.copy.textContent = "✓ Copiado"; setTimeout(() => (els.copy.textContent = "🔗 Copiar enlace"), 1600); }
    catch (e) { prompt("Copia el enlace:", PAGE); }
    track("compartir", { canal: "copiar" });
  });
  els.wsp.addEventListener("click", () => track("compartir", { canal: "whatsapp" }));
  els.fb.addEventListener("click", () => track("compartir", { canal: "facebook" }));
  els.x.addEventListener("click", () => track("compartir", { canal: "x" }));
  els.dl.addEventListener("click", downloadMedal);

  // enviar nombre/correo
  els.send.addEventListener("click", async () => {
    const name = (els.name.value || "").trim();
    const email = (els.email.value || "").trim();
    if (!name) { els.name.focus(); els.name.placeholder = "Escribe tu nombre 👀"; return; }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { els.email.focus(); alert("Revisa tu correo, parece inválido."); return; }
    if (!unlocked) { alert("Primero completa los dos pasos con la calculadora 🙂"); return; }
    const payload = {
      nombre: name, correo: email, optin: els.optin.checked,
      nivel: current, percap: Math.round((window.__calcState || {}).percap || 0),
      fuente: "ingreso-costo-vida",
    };
    try { localStorage.setItem("medalla_lead", JSON.stringify(payload)); } catch (e) {}
    track("medalla_registro", { nivel: current, con_correo: !!email });
    els.send.disabled = true; els.send.textContent = "Enviando…";
    if (MEDAL_API) {
      try {
        const r = await fetch(MEDAL_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        els.send.textContent = r.ok ? "✓ ¡Enviada!" : "Reintentar";
        els.send.disabled = false;
        if (r.ok) paint();
        return;
      } catch (e) { els.send.disabled = false; els.send.textContent = "Reintentar"; }
    }
    // sin backend aún: fallback por correo del usuario + descarga
    const t = TIERS[current];
    const body = "¡Hola " + name + "! Esta es tu medalla del reto Gánale a la Pobreza.%0D%0A%0D%0A" +
      t.title + " " + t.emoji + "%0D%0A" + PAGE;
    if (email) location.href = "mailto:" + encodeURIComponent(email) + "?subject=" +
      encodeURIComponent("🏅 Tu medalla — Gánale a la pobreza") + "&body=" + body;
    els.send.disabled = false; els.send.textContent = "✓ ¡Listo!";
    setTimeout(() => (els.send.textContent = "Enviar"), 2200);
  });

  /* ---------- confeti (colores de la bandera del Perú + oro) ---------- */
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas");
    cv.style.cssText = "position:fixed;inset:0;z-index:80;pointer-events:none";
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const W = (cv.width = innerWidth), H = (cv.height = innerHeight);
    const cols = ["#d5182f", "#ffffff", "#cf8a1e", "#0f8a86"];
    const N = 140, P = [];
    for (let i = 0; i < N; i++) P.push({
      x: W / 2 + (Math.sin(i) * W) / 6, y: H / 3, r: 4 + (i % 5),
      c: cols[i % cols.length], vx: (i % 11 - 5) * 1.1, vy: -6 - (i % 7),
      a: 1, rot: i, vr: (i % 6 - 3) * 0.2,
    });
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      frames++;
      let alive = 0;
      P.forEach((p) => {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.a -= 0.006;
        if (p.a > 0 && p.y < H + 20) {
          alive++;
          ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.4); ctx.restore();
        }
      });
      if (alive > 0 && frames < 400) requestAnimationFrame(tick); else cv.remove();
    })();
  }

  /* ---------- descarga de la medalla (canvas) ---------- */
  function downloadMedal() {
    const t = TIERS[current || "lucha"];
    const S = 640, cv = document.createElement("canvas");
    cv.width = S; cv.height = S; const g = cv.getContext("2d");
    // fondo
    g.fillStyle = "#f6f1e6"; g.fillRect(0, 0, S, S);
    // franja textil
    const stripe = ["#d5182f", "#cf8a1e", "#f6f1e6", "#0f8a86", "#a2541f", "#f6f1e6"];
    let x = 0; while (x < S) stripe.forEach((c, i) => { g.fillStyle = c; g.fillRect(x, 0, 12, 14); g.fillRect(x, S - 14, 12, 14); x += 12; });
    // chakana
    g.save(); g.translate(S / 2 - 120, 120); g.scale(2.4, 2.4);
    g.fillStyle = t.color; g.fill(new Path2D(CHAKANA));
    g.fillStyle = "#f6f1e6"; g.fillRect(42, 42, 16, 16); g.restore();
    // emoji
    g.font = "90px serif"; g.textAlign = "center"; g.fillText(t.emoji, S / 2, 250);
    // textos
    const name = (els.name.value || "").trim();
    const st = window.__calcState;
    g.fillStyle = "#2b2015"; g.font = "700 38px Georgia, serif";
    g.fillText(t.title, S / 2, 420);
    if (name) { g.font = "italic 25px Georgia, serif"; g.fillStyle = "#5e5142"; g.fillText(name, S / 2, 458); }
    // badge NSE + percentil
    if (st && st.pct != null) {
      g.font = "700 22px Arial"; g.fillStyle = t.color;
      g.fillText("NSE " + st.nse + " · " + st.nseNombre, S / 2, 500);
      g.font = "18px Arial"; g.fillStyle = "#5e5142";
      g.fillText("Supera al " + st.pct + "% de los peruanos por ingreso", S / 2, 528);
    }
    g.font = "600 19px Arial"; g.fillStyle = "#a2541f";
    g.fillText("Reto: Gánale a la pobreza 🇵🇪 · INEI 2025", S / 2, 565);
    g.font = "15px Arial"; g.fillStyle = "#8c7e6b";
    g.fillText("unimauro.github.io/ingreso-costo-vida", S / 2, 595);
    const a = document.createElement("a");
    a.download = "medalla-ganale-a-la-pobreza.png"; a.href = cv.toDataURL("image/png"); a.click();
    track("medalla_descarga", { nivel: current });
  }

  /* ---------- Yape ---------- */
  const ym = $("yapeModal");
  $("yapeBtn") && $("yapeBtn").addEventListener("click", () => { ym.classList.add("open"); track("yape_abrir"); });
  $("yapeClose") && $("yapeClose").addEventListener("click", () => ym.classList.remove("open"));
  ym && ym.addEventListener("click", (e) => { if (e.target === ym) ym.classList.remove("open"); });

  paint();
})();
