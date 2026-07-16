# Ingreso y Costo de Vida en el Perú 🇵🇪

Dashboard interactivo con **datos oficiales del INEI (2025)**: cuánto gana en promedio un
peruano, cuánto cuesta mantener a una familia, quiénes son pobres o vulnerables, y qué
regiones son las más caras.

🔗 **Live:** https://unimauro.github.io/ingreso-costo-vida/

## ¿Qué incluye?

- **Ingreso por área** — nacional, urbano, rural y Lima, frente a la línea de pobreza familiar.
- **Calculadora familiar** — ajusta integrantes e ingresos y comprueba si el hogar supera la
  canasta básica (S/ 462 por persona).
- **Mapa de regiones** (Leaflet) — costo de vida (referencial) e incidencia de pobreza por
  departamento.
- **Pobreza y vulnerabilidad 2025** — 25,7% de pobreza, 32,8% de población vulnerable.
- **Censo 2025** — 34,2 M de habitantes, 10,6 M de hogares.
- **FAQ** + **bot "Inti"** — asistente que responde sobre los datos.

## El bot Inti

- **Modo local (por defecto):** responde desde la base de conocimiento (FAQ + datos), sin API
  key. Funciona en GitHub Pages tal cual.
- **Modo IA (opcional):** el usuario pega su propia clave de [OpenRouter](https://openrouter.ai)
  y el bot usa `google/gemini-2.5-flash-lite`. La clave se guarda **solo en el navegador**
  (localStorage); **nunca** se sube al repositorio.

## Datos y fuentes

Cifras nominales del **INEI**: ENAHO (ingresos y pobreza), Censos Nacionales 2025 (población y
vivienda) y EPENE (Lima Metropolitana). El ingreso nacional/urbano/rural (ENAHO, anual) y el de
Lima (EPENE, trimestral) no son estrictamente comparables. El "costo de vida" por región es una
clasificación referencial basada en los dominios geográficos del INEI. Enlaces oficiales al pie
del dashboard.

## Stack

HTML + CSS + JS (sin build). [Chart.js](https://www.chartjs.org/) para gráficos,
[Leaflet](https://leafletjs.com/) para el mapa. Tema claro/oscuro, responsive, SEO + Open Graph.

---

Hecho por **Carlos Mauro Cárdenas**. Uso informativo; verifica siempre en las fuentes oficiales.
