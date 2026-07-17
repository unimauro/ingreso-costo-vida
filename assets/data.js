/* ============================================================
   Datos oficiales — INEI (Perú)
   Fuentes: ENAHO 2025, Censos Nacionales 2025, Informe de
   Pobreza Monetaria 2025 (publicado 2026), EPENE (Lima).
   Última verificación: 16 de julio de 2026.
   ============================================================ */

const DATA = {
  actualizado: "16 jul 2026",

  // --- Ingreso promedio mensual proveniente del trabajo (ENAHO) ---
  ingreso: {
    anio: 2025,
    nacional: 1887,        // S/ 1 887 en 2025 (+6,9% / +S/121,3 vs 2024 ≈ S/1 766)
    crecimiento: 6.9,
    urbano: 1966.5,        // creció +6,7% en 2025
    rural: 937.6,          // creció +4,4% en 2025
    lima_oficial: 2172,    // EPENE Lima, 2º trim. 2025 (+9,1%)
    lima_citada: 2486,     // cifra que circula — NO figura en reportes del INEI
    hombres: 2305.5,       // referencia 2024
    mujeres: 1713.8,       // referencia 2024
    prev_2024: 1765.7,
  },

  // --- Costo de vida: líneas de pobreza (canasta básica) ---
  pobreza: {
    anio: 2025,
    canasta_consumo_pc: 462,   // línea de pobreza total, por persona/mes
    canasta_alim_pc: 260,      // línea de pobreza extrema, por persona/mes
    fam4_consumo: 1848,        // 462 × 4
    fam4_alim: 1040,           // 260 × 4
    tasa_pobreza: 25.7,        // % población 2025 (−1,9 pp vs 27,6% 2024)
    tasa_pobreza_prev: 27.6,
    salieron: 567000,          // personas que salieron de pobreza en 2025
    pobreza_extrema: 4.7,      // % población
    pobreza_extrema_pers: 1614000,
    vulnerables: 32.8,         // % población en riesgo de recaer
    alza_5anios: 36,           // % de alza de la canasta alimentaria en 5 años
  },

  // --- Censos Nacionales 2025 (INEI) ---
  censo: {
    anio: 2025,
    poblacion_total: 34157732,
    poblacion_censada: 32706028,
    poblacion_omitida: 1451704,
    tasa_omision: 4.25,
    crecimiento_2017_2025: 2900000,
    tasa_anual: 1.11,
    viviendas: 13762606,
    hogares: 10570171,
    personas_por_hogar: 3.09,      // 32,706,028 / 10,570,171
    servicio_luz: 91.4,
    servicio_agua: 71.1,           // red pública dentro de la vivienda
    servicio_desague: 64.5,        // red pública dentro de la vivienda
    ejecucion: "agosto–octubre 2025 (recuperación en noviembre)",
    mujeres_pct: 50.4, hombres_pct: 49.6, indice_masculinidad: 98.3,
    edad_promedio: 33.8,
    menor15: 23.7, edad_15_59: 62.0, mayor60: 14.3,
    mayor60_1940: 6.4, mayor60_2017: 11.9,
  },

  // --- Niveles socioeconómicos (APEIM 2023–2024), por ingreso familiar mensual ---
  // Umbrales referenciales del ingreso TOTAL del hogar (S/ / mes).
  nse: [
    { k: "A", nombre: "Alto",       min: 12000, desc: "≈ 1% de los hogares" },
    { k: "B", nombre: "Medio alto", min: 7000,  desc: "≈ 11% de los hogares" },
    { k: "C", nombre: "Medio",      min: 3600,  desc: "≈ 30% de los hogares" },
    { k: "D", nombre: "Medio bajo", min: 2000,  desc: "≈ 33% de los hogares" },
    { k: "E", nombre: "Bajo",       min: 0,     desc: "≈ 25% de los hogares" },
  ],

  // --- Distribución del ingreso per cápita por decil (INEI/ENAHO, S/ / mes) ---
  // Punto medio aproximado de cada decil → percentil, para estimar posición.
  deciles_pc: [
    { p: 5, s: 277 }, { p: 15, s: 459 }, { p: 25, s: 598 }, { p: 35, s: 730 },
    { p: 45, s: 871 }, { p: 55, s: 1035 }, { p: 65, s: 1235 }, { p: 75, s: 1521 },
    { p: 85, s: 1994 }, { p: 95, s: 3805 },
  ],

  // --- Evolución poblacional por censo (INEI, millones) ---
  censos_hist: [
    { a: 1940, p: 7.0 }, { a: 1961, p: 10.4 }, { a: 1972, p: 14.1 },
    { a: 1981, p: 17.8 }, { a: 1993, p: 22.6 }, { a: 2007, p: 28.2 },
    { a: 2017, p: 31.2 }, { a: 2025, p: 34.16 },
  ],

  // --- Pirámide poblacional 2025 (% del total; estimación INEI, proyecciones) ---
  // Anclada a los totales oficiales: <15=23,7%; 15-59=62,0%; 60+=14,3%; mujeres 50,4%.
  piramide: [
    { g: "0–14",  h: 12.1, m: 11.6 },
    { g: "15–29", h: 12.4, m: 12.1 },
    { g: "30–44", h: 10.7, m: 10.8 },
    { g: "45–59", h: 7.8,  m: 8.2 },
    { g: "60–74", h: 4.7,  m: 5.3 },
    { g: "75+",   h: 1.9,  m: 2.4 },
  ],
};

/* ============================================================
   Regiones — costo de vida (referencial) e incidencia de pobreza
   · costo: clasificación referencial por dominio geográfico del INEI
     (Lima/costa sur = canasta más cara; sierra rural = más barata).
     INEI no publica un precio de canasta uniforme por departamento,
     por eso el "costo" es un índice referencial, no un monto exacto.
   · pobreza: incidencia de pobreza monetaria por departamento,
     INEI 2024 (valores referenciales; el INEI los reporta en rangos).
   ============================================================ */
const NIVEL_COSTO = { 4: "Muy alto", 3: "Alto", 2: "Medio", 1: "Bajo" };

const REGIONES = [
  { r: "Lima",           cap: "Lima",            lat: -12.05, lng: -77.04, costo: 4, pobreza: 27.6 },
  { r: "Callao",         cap: "Callao",          lat: -12.06, lng: -77.12, costo: 4, pobreza: 24 },
  { r: "Arequipa",       cap: "Arequipa",        lat: -16.40, lng: -71.53, costo: 3, pobreza: 12 },
  { r: "Moquegua",       cap: "Moquegua",        lat: -17.19, lng: -70.93, costo: 3, pobreza: 11 },
  { r: "Tacna",          cap: "Tacna",           lat: -18.01, lng: -70.25, costo: 3, pobreza: 15 },
  { r: "Madre de Dios",  cap: "Pto. Maldonado",  lat: -12.60, lng: -69.19, costo: 3, pobreza: 11.1 },
  { r: "Ica",            cap: "Ica",             lat: -14.07, lng: -75.73, costo: 3, pobreza: 6 },
  { r: "Cusco",          cap: "Cusco",           lat: -13.53, lng: -71.97, costo: 3, pobreza: 24 },
  { r: "Tumbes",         cap: "Tumbes",          lat: -3.57,  lng: -80.46, costo: 3, pobreza: 20 },
  { r: "La Libertad",    cap: "Trujillo",        lat: -8.11,  lng: -79.03, costo: 2, pobreza: 24 },
  { r: "Lambayeque",     cap: "Chiclayo",        lat: -6.77,  lng: -79.84, costo: 2, pobreza: 24 },
  { r: "Piura",          cap: "Piura",           lat: -5.19,  lng: -80.63, costo: 2, pobreza: 30 },
  { r: "Junín",          cap: "Huancayo",        lat: -12.07, lng: -75.21, costo: 2, pobreza: 24 },
  { r: "Áncash",         cap: "Huaraz",          lat: -9.53,  lng: -77.53, costo: 2, pobreza: 22 },
  { r: "San Martín",     cap: "Moyobamba",       lat: -6.03,  lng: -76.97, costo: 2, pobreza: 25 },
  { r: "Ucayali",        cap: "Pucallpa",        lat: -8.38,  lng: -74.55, costo: 2, pobreza: 24 },
  { r: "Loreto",         cap: "Iquitos",         lat: -3.75,  lng: -73.25, costo: 2, pobreza: 43 },
  { r: "Cajamarca",      cap: "Cajamarca",       lat: -7.16,  lng: -78.51, costo: 1, pobreza: 45 },
  { r: "Huancavelica",   cap: "Huancavelica",    lat: -12.79, lng: -74.97, costo: 1, pobreza: 40 },
  { r: "Ayacucho",       cap: "Ayacucho",        lat: -13.16, lng: -74.22, costo: 1, pobreza: 38 },
  { r: "Apurímac",       cap: "Abancay",         lat: -13.63, lng: -72.88, costo: 1, pobreza: 34 },
  { r: "Huánuco",        cap: "Huánuco",         lat: -9.93,  lng: -76.24, costo: 1, pobreza: 34 },
  { r: "Puno",           cap: "Puno",            lat: -15.84, lng: -70.02, costo: 1, pobreza: 36 },
  { r: "Pasco",          cap: "Cerro de Pasco",  lat: -10.68, lng: -76.26, costo: 1, pobreza: 34 },
  { r: "Amazonas",       cap: "Chachapoyas",     lat: -6.23,  lng: -77.87, costo: 1, pobreza: 36 },
];

/* Preguntas frecuentes — base de conocimiento del bot y del acordeón */
const FAQ = [
  {
    q: "¿Cuánto gana en promedio un peruano al mes en 2025?",
    a: "Según el INEI (ENAHO), el ingreso promedio mensual proveniente del trabajo a nivel nacional fue de S/ 1 887 en 2025, un aumento de 6,9% (S/ 121,3) frente a 2024. En el área urbana llegó a S/ 1 966,5 y en la rural a S/ 937,6.",
    tags: ["ingreso", "promedio", "sueldo", "salario", "gana", "2025", "nacional"],
  },
  {
    q: "¿Cuánto necesita una familia para no ser pobre?",
    a: "La canasta básica de consumo (línea de pobreza total) es de S/ 462 por persona al mes en 2025. Para una familia de 4 integrantes eso equivale a S/ 1 848 mensuales. Por debajo de ese monto, el hogar es considerado pobre por el INEI.",
    tags: ["familia", "pobre", "pobreza", "canasta", "linea", "462", "1848", "costo de vida"],
  },
  {
    q: "¿Qué es la pobreza extrema y cuánto cuesta la canasta alimentaria?",
    a: "La pobreza extrema afecta a quienes no cubren la canasta básica de alimentos, valorizada en S/ 260 por persona al mes (S/ 1 040 para una familia de 4). En 2025 la pobreza extrema alcanzó al 4,7% de la población, cerca de 1 millón 614 mil personas.",
    tags: ["pobreza extrema", "alimentaria", "260", "1040", "hambre", "alimentos"],
  },
  {
    q: "¿Un solo sueldo alcanza para mantener a una familia?",
    a: "Apenas. El ingreso promedio nacional (S/ 1 887) supera por solo S/ 39 lo que necesita una familia de 4 para no ser pobre (S/ 1 848). En el área rural, un ingreso de S/ 937,6 no cubre siquiera a una familia de 3 (S/ 1 386). Por eso muchos hogares dependen de dos o más ingresos.",
    tags: ["un sueldo", "alcanza", "mantener", "familia", "margen", "rural"],
  },
  {
    q: "¿Cuántos habitantes tiene el Perú según el Censo 2025?",
    a: "Los Censos Nacionales 2025 registraron una población total de 34 157 732 habitantes (32 706 028 censados + 1 451 704 de omisión estimada, tasa de omisión de 4,25%). Entre 2017 y 2025 el país creció en 2,9 millones de personas, a una tasa anual de 1,11%.",
    tags: ["censo", "poblacion", "habitantes", "34 millones", "2025", "cuantos"],
  },
  {
    q: "¿Cuántas viviendas y hogares hay en el Perú?",
    a: "El Censo 2025 identificó 13 762 606 viviendas particulares y 10 570 171 hogares. Esto da un promedio de aproximadamente 3,1 personas por hogar, menor que la 'familia de 4' que suele usarse como referencia.",
    tags: ["viviendas", "hogares", "personas por hogar", "13 millones", "censo"],
  },
  {
    q: "¿Qué porcentaje de peruanos es pobre o vulnerable?",
    a: "En 2025 la pobreza monetaria afectó al 25,7% de la población (1,9 puntos menos que en 2024, cuando fue 27,6%): 567 mil personas salieron de la pobreza. Además, el 32,8% es vulnerable: cubre la canasta hoy, pero puede recaer ante una crisis, pérdida de empleo o problema de salud.",
    tags: ["porcentaje", "pobres", "vulnerables", "25.7", "32.8", "tasa"],
  },
  {
    q: "¿Cuánto gana una mujer frente a un hombre?",
    a: "Como referencia (INEI 2024), el ingreso promedio de los hombres fue de S/ 2 305,5 y el de las mujeres de S/ 1 713,8: una brecha de aproximadamente 26% a favor de los hombres.",
    tags: ["mujer", "hombre", "brecha", "genero", "desigualdad"],
  },
  {
    q: "¿La cifra de S/ 2 486 para Lima es correcta?",
    a: "Esa cifra circula, pero NO aparece en los reportes del INEI. Las cifras oficiales de Lima Metropolitana (encuesta EPENE) son menores: alrededor de S/ 2 172 en el 2º trimestre de 2025 y S/ 2 035 como promedio de 2024. Conviene usar el dato oficial y tratar el S/ 2 486 con cautela.",
    tags: ["lima", "2486", "2172", "verificacion", "correcto", "cifra"],
  },
  {
    q: "¿Cuáles son las regiones más caras para vivir?",
    a: "La canasta básica más cara está en Lima Metropolitana y el Callao, seguidas del sur y la costa (Arequipa, Moquegua, Tacna, Ica, Cusco, Madre de Dios). Las más baratas —pero con mayor pobreza— son las de la sierra rural: Cajamarca, Huancavelica, Ayacucho, Apurímac y Puno. El INEI no publica un precio de canasta uniforme por departamento, así que esta clasificación es referencial, basada en sus dominios geográficos.",
    tags: ["regiones", "caras", "costo de vida", "lima", "mapa", "departamento", "barata"],
  },
  {
    q: "¿Qué regiones tienen más pobreza?",
    a: "Según el INEI (2024), Cajamarca (≈45%) y Loreto (≈43%) tienen la mayor incidencia de pobreza monetaria. Las de menor pobreza son Ica (≈6%), Moquegua (≈11%) y Madre de Dios (≈11%). Lima Metropolitana está cerca del promedio nacional.",
    tags: ["regiones", "pobreza", "cajamarca", "loreto", "ica", "departamento", "mapa"],
  },
  {
    q: "¿Qué nivel socioeconómico (NSE A, B, C, D, E) tengo?",
    a: "Según APEIM (con datos de la ENAHO), los niveles por ingreso familiar mensual son aproximadamente: NSE A ≥ S/ 12 000 (≈1% de hogares); NSE B S/ 7 000–12 000 (≈11%); NSE C S/ 3 600–7 000 (≈30%); NSE D S/ 2 000–3 600 (≈33%); NSE E < S/ 2 000 (≈25%). Usa la calculadora: al ingresar el ingreso total del hogar te muestra tu NSE estimado.",
    tags: ["nse", "nivel socioeconomico", "a b c d e", "apeim", "clase", "estrato"],
  },
  {
    q: "¿A cuántos peruanos les gano por ingreso?",
    a: "La calculadora estima tu percentil según el ingreso per cápita del hogar, usando la distribución por deciles del INEI. Por ejemplo, un ingreso per cápita de ~S/ 1 000 supera a cerca del 55% de la población; ~S/ 2 000 supera a más del 85%. El decil más alto (10% más rico) promedia S/ 3 805 per cápita.",
    tags: ["percentil", "cuantos", "gano", "supero", "deciles", "top", "poblacion", "85%"],
  },
  {
    q: "¿De dónde salen estos datos?",
    a: "Todo proviene del INEI (Instituto Nacional de Estadística e Informática): la ENAHO para ingresos y pobreza, los Censos Nacionales 2025 para población y vivienda, y la EPENE para Lima Metropolitana. Los enlaces oficiales están al pie del dashboard.",
    tags: ["fuente", "de donde", "inei", "enaho", "censo", "oficial"],
  },
];
