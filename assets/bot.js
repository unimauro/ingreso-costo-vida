/* ===========================================================
   Bot "Inti" — asistente de datos de ingresos y costo de vida
   · Modo local (por defecto): responde desde la base FAQ + datos,
     sin API key, funciona en GitHub Pages tal cual.
   · Modo IA (opcional): si el usuario pega su propia API key de
     OpenRouter, usa google/gemini-2.5-flash-lite con los datos
     del dashboard como contexto. La key se guarda solo en el
     navegador (localStorage), nunca se sube al repo.
   =========================================================== */
(function () {
  const MODEL = "google/gemini-2.5-flash-lite";
  const KEY_LS = "openrouter_key";

  const fab = document.getElementById("botfab");
  const win = document.getElementById("botwin");
  const body = document.getElementById("botBody");
  const input = document.getElementById("botInput");
  const send = document.getElementById("botSend");
  const chips = document.getElementById("botChips");
  const cfg = document.getElementById("botCfg");
  if (!fab) return;

  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function ctxResumen() {
    const d = DATA;
    return [
      "Ingreso promedio mensual nacional 2025: S/ " + d.ingreso.nacional + " (+" + d.ingreso.crecimiento + "% vs 2024).",
      "Ingreso urbano: S/ " + d.ingreso.urbano + "; rural: S/ " + d.ingreso.rural + "; Lima oficial (EPENE): S/ " + d.ingreso.lima_oficial + " (la cifra de S/ " + d.ingreso.lima_citada + " no figura en el INEI).",
      "Ingreso hombres (2024): S/ " + d.ingreso.hombres + "; mujeres: S/ " + d.ingreso.mujeres + ".",
      "Canasta básica de consumo: S/ " + d.pobreza.canasta_consumo_pc + " por persona/mes; familia de 4: S/ " + d.pobreza.fam4_consumo + ".",
      "Canasta alimentaria (pobreza extrema): S/ " + d.pobreza.canasta_alim_pc + " por persona; familia de 4: S/ " + d.pobreza.fam4_alim + ".",
      "Pobreza 2025: " + d.pobreza.tasa_pobreza + "% (baja desde " + d.pobreza.tasa_pobreza_prev + "% en 2024). Pobreza extrema: " + d.pobreza.pobreza_extrema + "%. Vulnerables: " + d.pobreza.vulnerables + "%.",
      "Censo 2025: población " + d.censo.poblacion_total.toLocaleString("es-PE") + "; viviendas " + d.censo.viviendas.toLocaleString("es-PE") + "; hogares " + d.censo.hogares.toLocaleString("es-PE") + "; ~" + d.censo.personas_por_hogar + " personas por hogar.",
      "Regiones con canasta más cara (referencial): Lima y Callao, luego Arequipa, Moquegua, Tacna, Ica, Cusco, Madre de Dios. Más baratas y con más pobreza: Cajamarca, Huancavelica, Ayacucho, Apurímac, Puno.",
    ].join(" ");
  }

  /* --- respuesta local por coincidencia de palabras --- */
  function respLocal(q) {
    const nq = norm(q);
    let best = null, score = 0;
    FAQ.forEach((f) => {
      let s = 0;
      f.tags.forEach((t) => { if (nq.includes(norm(t))) s += t.split(" ").length; });
      norm(f.q).split(/\W+/).forEach((w) => { if (w.length > 3 && nq.includes(w)) s += 0.5; });
      if (s > score) { score = s; best = f; }
    });
    if (best && score >= 1) return best.a;
    return "No estoy seguro de esa. Puedo ayudarte con: ingreso promedio, costo de vida y canasta básica, pobreza y vulnerabilidad, el Censo 2025 o las regiones más caras. Prueba con una de las sugerencias 👇 — o activa la IA para preguntas abiertas.";
  }

  /* --- respuesta IA vía OpenRouter (opcional) --- */
  async function respIA(q, key) {
    const sys = "Eres Inti, asistente del dashboard 'Ingresos por familia en el Perú'. Respondes en español, breve y claro, SOLO con base en estos datos oficiales del INEI. Si te preguntan algo fuera de esto, dilo. Datos: " + ctxResumen();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: sys }, { role: "user", content: q }],
        temperature: 0.3, max_tokens: 400,
      }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    return (j.choices && j.choices[0] && j.choices[0].message.content) || "Sin respuesta.";
  }

  /* --- UI --- */
  function bubble(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.innerHTML = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }
  function typing() {
    const el = document.createElement("div");
    el.className = "msg bot";
    el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  async function ask(q) {
    if (!q.trim()) return;
    bubble(q, "user");
    input.value = "";
    const key = localStorage.getItem(KEY_LS);
    const t = typing();
    try {
      let a;
      if (key) {
        try { a = await respIA(q, key); }
        catch (e) { a = respLocal(q) + "<br><small>(La IA no respondió: " + e.message + ". Usé la base local.)</small>"; }
      } else {
        await new Promise((r) => setTimeout(r, 350));
        a = respLocal(q);
      }
      t.remove();
      bubble(a, "bot");
    } catch (e) {
      t.remove();
      bubble("Ocurrió un error. Intenta de nuevo.", "bot");
    }
  }

  function renderChips() {
    const sug = ["¿Cuánto gana un peruano?", "¿Cuánto necesita una familia?", "Regiones más caras", "Censo 2025", "¿Un sueldo alcanza?"];
    chips.innerHTML = sug.map((s) => '<button class="chip">' + s + "</button>").join("");
    chips.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => ask(c.textContent)));
  }

  function renderCfg() {
    const has = !!localStorage.getItem(KEY_LS);
    cfg.innerHTML = has
      ? 'IA activada (Gemini Flash Lite) · <a id="cfgKey">quitar clave</a>'
      : 'Modo local · <a id="cfgKey">activar IA (tu clave OpenRouter)</a>';
    document.getElementById("cfgKey").addEventListener("click", () => {
      if (localStorage.getItem(KEY_LS)) {
        localStorage.removeItem(KEY_LS);
        bubble("Listo, volví al modo local (sin IA).", "bot");
      } else {
        const k = prompt("Pega tu API key de OpenRouter (se guarda solo en este navegador, no se sube a ningún servidor):");
        if (k && k.trim()) {
          localStorage.setItem(KEY_LS, k.trim());
          bubble("¡IA activada! Ahora respondo preguntas abiertas con " + MODEL + ".", "bot");
        }
      }
      renderCfg();
    });
  }

  fab.addEventListener("click", () => {
    win.classList.toggle("open");
    if (win.classList.contains("open") && !body.dataset.init) {
      bubble("¡Hola! Soy <b>Inti</b> 🌞. Te ayudo con los datos de ingresos y costo de vida en el Perú (INEI 2025). ¿Qué quieres saber?", "bot");
      body.dataset.init = "1";
    }
  });
  document.getElementById("botClose").addEventListener("click", () => win.classList.remove("open"));
  send.addEventListener("click", () => ask(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") ask(input.value); });

  renderChips();
  renderCfg();
})();
