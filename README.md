# Noticias

Lector de noticias RSS con la estética de QuiteRSS: barra de pestañas, panel de feeds,
tabla compacta de titulares y previsualización del artículo, todo actualizado
automáticamente cada minuto.

La referencia visual del proyecto es [`docs/quiterss.png`](docs/quiterss.png).

![Referencia de diseño](docs/quiterss.png)

## Funciones

- Ocho feeds RSS importados de la instalación de QuiteRSS del autor.
- Panel lateral con feeds, categorías, no leídas y destacadas.
- Tabla con título, autor, categoría y fecha de publicación.
- Previsualización del artículo saneada y aislada en un iframe sin scripts.
- Búsqueda sin acentos en título, resumen, autor, feed y categorías.
- Marcado de leídas y destacadas guardado en `localStorage`.
- Opción persistente «Ocultar leídas» para que las noticias ya leídas dejen de aparecer
  en todas las vistas salvo «Destacados».
- Actualización manual y automática cada 60 segundos con cuenta atrás visible.
- Barras divisorias arrastrables (ancho del panel y altura de la lista).
- Atajos de teclado: `↑`/`↓` para moverse, `Enter` para abrir la noticia original.
- Interfaz adaptable a pantallas estrechas.

## Requisitos

- Node.js 24 o superior (véase `.nvmrc`).
- npm 11 o superior.

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación queda disponible en <http://127.0.0.1:5173>. El servidor de desarrollo de
Vite incluye la API de feeds, por lo que no hace falta arrancar nada más.

### Producción

```bash
npm run build
npm start
```

`npm start` levanta Express en el puerto `4173` (configurable con `PORT`), sirve la
carpeta `dist/` y expone la misma API. Es necesario un entorno Node: los feeds no
envían cabeceras CORS, así que la aplicación no funciona como sitio puramente estático.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con API integrada. |
| `npm run build` | Genera la aplicación de producción en `dist/`. |
| `npm start` | Servidor Express de producción. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm test` | Pruebas con el runner nativo de Node. |
| `npm run check:lines` | Falla si algún archivo de código supera 400 líneas. |
| `npm run check` | Lint + tests + límite de líneas + build. |

## Arquitectura

```text
src/
  App.jsx              estado principal, vistas y atajos
  components/          barra de pestañas, toolbar, sidebar, lista, artículo, estado
  hooks/               datos de feeds, estado persistente, lectura y destacados
  services/api.js      llamadas a /api
  utils/               filtros, fechas y documento HTML del artículo
  styles/              global, layout, sidebar, news y article
server/
  config/feeds.js      lista de fuentes RSS
  lib/http.js          descarga HTTP con timeout y user-agent
  lib/parseFeed.js     normalización de RSS/Atom
  lib/sanitize.js      limpieza del HTML remoto
  lib/feedService.js   caché de 55 s y actualización concurrente
  api.js               rutas /api/news y /api/health
  index.js             servidor Express de producción
  vitePlugin.js        middleware de la API para Vite
tests/                 pruebas unitarias de utilidades y saneado
```

### API

- `GET /api/news`: instantánea completa (feeds y artículos). Acepta `?force=1` para
  forzar una actualización, con un límite de una petición forzada cada 5 segundos.
- `GET /api/health`: estado de la caché, número de artículos y errores por feed.

El servidor cachea los feeds 55 segundos y conserva las últimas noticias de un feed si
su descarga falla. El cliente consulta la API cada 60 segundos y también al recuperar
el foco de la pestaña.

### Feeds

Las fuentes se definen en `server/config/feeds.js`: Xataka, ADSLZone, Genbeta,
eldia.es, MuyLinux, BandaAncha, El Español y Diario de Avisos. Para añadir una fuente
basta con incluir una entrada con `id`, `name`, `url`, `siteUrl`, `icon` y `color`, y
colocar su icono en `public/feeds/`.

### Estado local

| Clave | Contenido |
| --- | --- |
| `noticias:vista` | Vista activa (todo, no leídas, destacadas, feed o categoría). |
| `noticias:leidas` | Identificadores de noticias leídas. |
| `noticias:destacadas` | Identificadores de noticias destacadas. |
| `noticias:ocultar-leidas` | Si está activo, las noticias leídas no se muestran. |
| `noticias:disposicion` | Ancho del panel, altura de la lista y visibilidad del sidebar. |

## Mantenimiento automatizado

- `.github/dependabot.yml` revisa a diario, a las 04:00 de Europa/Madrid, las
  dependencias de npm y de GitHub Actions, y abre las actualizaciones contra `main`.
- `.github/workflows/update-node.yml` se ejecuta a diario a las 03:00 UTC (madrugada
  en España). Consulta la última versión LTS de Node.js y abre un PR que actualiza
  `.nvmrc`, `package.json` y el README cuando hay una versión mayor nueva. Dependabot
  no admite `.nvmrc`, por eso este flujo lo complementa.
- `.github/workflows/ci.yml` ejecuta lint, tests, el límite de 400 líneas y el build
  en cada push y pull request dirigido a `main`.

## Cambios importantes

### 2026-11-08

- Versión inicial: importación de los ocho feeds de QuiteRSS, proxy Node con caché de
  55 s, actualización automática cada minuto y saneado del HTML de los artículos.
- Diseño reconstruido a partir de `docs/quiterss.png`: sidebar de 449 px, toolbar de
  30 px, filas de 21 px, selección `#308cc6`, tabla con cabecera fija y
  previsualización inferior con el contenido original del artículo.
- Estado de lectura, destacados y disposición persistidos en `localStorage`.
- Añadido el conmutador «Ocultar leídas» (icono de ojo), persistido en
  `noticias:ocultar-leidas`; se aplica a todas las vistas menos «Destacados» y
  mantiene visible la noticia seleccionada hasta cambiar de selección.
- Añadidos tests, comprobación del límite de 400 líneas por archivo, CI, Dependabot
  diario y flujo automático de actualización de Node.js LTS.
