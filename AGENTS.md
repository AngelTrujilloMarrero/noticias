# Reglas para agentes

Este repositorio contiene un lector de noticias RSS con React + Vite. El navegador
descarga y parsea los feeds a través de `/feed/<id>`; Vite y Express solo actúan como
proxy local y Vercel lo resuelve con rewrites same-origin.

## Reglas obligatorias

1. **Ningún archivo de código supera las 400 líneas.** El límite se comprueba con
   `npm run check:lines` y también se ejecuta en CI. Si un archivo crece demasiado,
   divídelo por responsabilidad (componente, hook, utilidad o bloque de estilos).
2. **Todo debe estar modularizado.** Un componente por archivo, lógica reutilizable en
   `src/hooks` o `src/utils`, y acceso a datos en `src/services` o `server/lib`.
3. **Documenta los cambios importantes en `README.md`.** Añade una entrada fechada en
   la sección «Cambios importantes» cuando modifiques comportamiento, arquitectura,
   feeds, estilos globales, carga de feeds o automatizaciones.
4. **Mantén el diseño de QuiteRSS.** La referencia visual es `docs/quiterss.png`
   (barra de pestañas, barra de herramientas, panel de feeds de 449 px, tabla de
   noticias y previsualización inferior). Evita introducir un sistema de diseño ajeno.
5. **No rompas la actualización automática.** El navegador cachea los feeds 55 s y los
   vuelve a pedir cada 60 s. Cualquier cambio en ese flujo debe probarse. Las fuentes
   con `mirrors` recorren sus espejos cuando una falla: no cambies ese orden sin
   probarlo.
6. **Seguridad del contenido remoto.** El HTML de los artículos se limpia en el
   navegador con `sanitize-html` y se muestra en un iframe con `sandbox`. No elimines
   esas protecciones ni añadas `allow-scripts`.
7. **Antes de terminar:** ejecuta `npm run check` (lint, tests, límite de líneas y
   build). No dejes errores de consola provocados por el código de la aplicación.

## Mapa rápido

- `src/App.jsx`: estado principal, vistas, selección y atajos de teclado.
- `src/components/`: interfaz (barra lateral, lista, artículo, barras y divisores).
- `src/components/mobile/`: cabecera, tarjetas, artículo, cajón de fuentes y workspace de
  la interfaz móvil (≤ 760 px). El escritorio no usa estos componentes.
- `src/hooks/`: datos de feeds, estado persistente, estado de lectura/destacados y
  contador del título de la pestaña.
- `src/config/feeds.js`: lista de fuentes RSS, espejos (`mirrors`), enlace canónico
  (`canonical`) y ruta `/feed/<id>` (único sitio para añadir/quitar feeds; recuerda
  actualizar `vercel.json`, con un rewrite por espejo).
- `src/services/`: descarga concurrente, failover entre espejos, caché de 55 s y parseo
  RSS/Atom con `DOMParser`.
- `src/utils/sanitize.js`: limpieza del HTML remoto en el navegador.
- `src/utils/canonicalLink.js`: reconstruye el enlace original de los artículos (X).
- `src/utils/`: filtros, fechas y documento HTML del artículo.
- `src/styles/`: `global.css`, `layout.css`, `sidebar.css`, `news.css`, `article.css` y
  los bloques móviles `mobile.css`, `mobile-article.css`, `mobile-drawer.css` y
  `mobile-status.css`.
- `server/lib/feedProxy.js` y `server/lib/http.js`: proxy `/feed/<id>` en local, con
  failover entre espejos.
- `server/vitePlugin.js` y `server/index.js`: proxy `/feed/<id>` en local.
- `vercel.json`: rewrites same-origin de `/feed/<id>` hacia cada fuente.
- `tests/`: pruebas con el runner nativo de Node (`node --test`).

## Comandos

```bash
npm install
npm run dev        # Vite en http://127.0.0.1:5173 (proxy /feed incluido)
npm run build      # genera dist/
npm start          # Express sirve dist/ y el proxy /feed en el puerto 4173
npm run lint
npm test
npm run check:lines
npm run check      # todo lo anterior + build
```
