# Reglas para agentes

Este repositorio contiene un lector de noticias RSS con React + Vite y un servidor
Node/Express que actúa como proxy de los feeds.

## Reglas obligatorias

1. **Ningún archivo de código supera las 400 líneas.** El límite se comprueba con
   `npm run check:lines` y también se ejecuta en CI. Si un archivo crece demasiado,
   divídelo por responsabilidad (componente, hook, utilidad o bloque de estilos).
2. **Todo debe estar modularizado.** Un componente por archivo, lógica reutilizable en
   `src/hooks` o `src/utils`, y acceso a datos en `src/services` o `server/lib`.
3. **Documenta los cambios importantes en `README.md`.** Añade una entrada fechada en
   la sección «Cambios importantes» cuando modifiques comportamiento, arquitectura,
   feeds, estilos globales, API o automatizaciones.
4. **Mantén el diseño de QuiteRSS.** La referencia visual es `docs/quiterss.png`
   (barra de pestañas, barra de herramientas, panel de feeds de 449 px, tabla de
   noticias y previsualización inferior). Evita introducir un sistema de diseño ajeno.
5. **No rompas la actualización automática.** El servidor cachea los feeds 55 s y el
   cliente consulta `/api/news` cada 60 s. Cualquier cambio en ese flujo debe probarse.
6. **Seguridad del contenido remoto.** El HTML de los artículos se limpia en el
   servidor con `sanitize-html` y se muestra en un iframe con `sandbox`. No elimines
   esas protecciones ni añadas `allow-scripts`.
7. **Antes de terminar:** ejecuta `npm run check` (lint, tests, límite de líneas y
   build). No dejes errores de consola provocados por el código de la aplicación.

## Mapa rápido

- `src/App.jsx`: estado principal, vistas, selección y atajos de teclado.
- `src/components/`: interfaz (barra lateral, lista, artículo, barras y divisores).
- `src/hooks/`: datos de feeds, estado persistente y estado de lectura/destacados.
- `src/utils/`: filtros, fechas y documento HTML del artículo.
- `src/styles/`: `global.css`, `layout.css`, `sidebar.css`, `news.css`, `article.css`.
- `server/config/feeds.js`: lista de fuentes RSS (único sitio para añadir/quitar feeds).
- `server/lib/`: descarga HTTP, parseo, limpieza de HTML, caché y servicio de feeds.
- `server/api.js`: rutas `/api/news` y `/api/health`, compartidas por Vite y Express.
- `tests/`: pruebas con el runner nativo de Node (`node --test`).

## Comandos

```bash
npm install
npm run dev        # Vite en http://127.0.0.1:5173 (API incluida)
npm run build      # genera dist/
npm start          # Express sirve dist/ y la API en el puerto 4173
npm run lint
npm test
npm run check:lines
npm run check      # todo lo anterior + build
```
