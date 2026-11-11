/**
 * Fuentes RSS importadas desde QuiteRSS.
 * El orden es el que se muestra en la barra lateral.
 *
 * `endpoint` es la ruta same-origin que usa el navegador. En Vercel se resuelve
 * con los rewrites de `vercel.json`; en local, con el proxy de Vite o Express.
 * Los iconos son relativos para funcionar también bajo un subdirectorio.
 *
 * `direct: true` hace que el navegador descargue la URL original: solo vale para
 * fuentes que envían `Access-Control-Allow-Origin`, como eldia.es, cuyo WAF
 * bloquea las peticiones del proxy de Vercel.
 *
 * `article` activa la carga del artículo completo desde su página original.
 * `direct` lo descarga el navegador (la web debe enviar CORS), `proxy` usa una
 * ruta same-origin, `params` añade parámetros a la petición, `container` toma el
 * HTML de un contenedor (o del primero que exista si es una lista) y `selector`
 * recoge elementos concretos descartando los que estén dentro de `exclude`.
 *
 * `mirrors` son URL alternativas para la misma fuente. Si la principal falla, el
 * navegador prueba las siguientes por orden. Cada espejo tiene su propia ruta
 * same-origin (`/feed/<id>/1`, `/feed/<id>/2`…), así que el failover funciona
 * igual en local y en Vercel. Hay que añadir un rewrite por espejo.
 *
 * `canonical` reconstruye el enlace de cada artículo sobre el sitio original
 * (`{id}` se sustituye por el identificador del estado). Los mirrors de X
 * enlazan a su propio dominio, a veces por http, así que sin esto se abriría
 * una instancia de Nitter en lugar del tweet.
 */
const X_INSTANCES = [
  'https://nitter.ip6arpa.uk',
  'https://nitter.mie.foundation',
  'https://nitter.jaydenha.uk',
  'https://nitter.netbub.com',
];

/**
 * Crea una fuente de X a partir de su usuario. Todos los mirrors de Nitter
 * sirven el mismo RSS, así que solo cambia el host.
 */
function xSource({ id, name, username, icon }) {
  const urls = X_INSTANCES.map((origin) => `${origin}/${username}/rss`);

  return {
    id,
    name,
    url: urls[0],
    mirrors: urls.slice(1),
    siteUrl: `https://x.com/${username}`,
    icon,
    color: '#1da1f2',
    maxItems: 10,
    refreshIntervalMs: 5 * 60 * 1000,
    canonical: `https://x.com/${username}/status/{id}`,
  };
}

const SOURCES = [
  {
    id: 'xataka',
    name: 'Xataka',
    url: 'https://www.xataka.com/feedburner.xml',
    siteUrl: 'https://www.xataka.com',
    icon: 'feeds/xataka.png',
    color: '#e94b35',
  },
  {
    id: 'adslzone',
    name: 'ADSLZone',
    url: 'https://feeds.feedburner.com/adslzone/adslzone',
    siteUrl: 'https://www.adslzone.net',
    icon: 'feeds/adslzone.png',
    color: '#1b74c9',
  },
  {
    id: 'genbeta',
    name: 'Genbeta',
    url: 'https://www.genbeta.com/feedburner.xml',
    siteUrl: 'https://www.genbeta.com',
    icon: 'feeds/genbeta.png',
    color: '#3a7f3f',
  },
  {
    id: 'eldia',
    name: 'eldia.es - General',
    url: 'https://www.eldia.es/rss/',
    siteUrl: 'https://www.eldia.es',
    icon: 'feeds/eldia.png',
    color: '#0b5fa5',
    direct: true,
    article: {
      direct: true,
      selector: 'p.ft-text, h3.ft-helper-fontSize-heading-XS',
      exclude: 'aside, ._mo_recs_tpi, .ft-mol-modNews, .closedContent, .subscribeHideForDisplay',
    },
  },
  {
    id: 'muylinux',
    name: 'MuyLinux',
    url: 'https://www.muylinux.com/feed/',
    siteUrl: 'https://www.muylinux.com',
    icon: 'feeds/muylinux.png',
    color: '#2d7d46',
  },
  {
    id: 'bandaancha',
    name: 'BandaAncha: Noticias y guías sobre fibra y móvil',
    url: 'https://bandaancha.eu/articulos.rss',
    siteUrl: 'https://bandaancha.eu/articulos',
    icon: 'feeds/bandaancha.png',
    color: '#e58b2a',
  },
  {
    id: 'elespanol',
    name: 'El Español - Home',
    url: 'https://www.elespanol.com/rss/',
    siteUrl: 'https://www.elespanol.com',
    icon: 'feeds/elespanol.png',
    color: '#c8102e',
    article: {
      proxy: '/elespanol',
      container: '.article-body__content',
      remove: [
        '.container--widgets',
        '.explainer',
        '.article-body__adv',
        '.article-inline',
        '.article-adv',
        '.single-link',
        '.article-body__tags',
        '.article-body__sidebar',
        '.full-article',
        '.article__related',
        '.article-inline_top',
        '.article-inline_final',
      ],
    },
  },
  {
    id: 'diariodeavisos',
    name: 'Diario de Avisos (todo)',
    url: 'https://diariodeavisos.elespanol.com/feed/',
    siteUrl: 'https://diariodeavisos.elespanol.com',
    icon: 'feeds/diariodeavisos.png',
    color: '#e30613',
  },
  {
    ...xSource({
      id: 'midudev',
      name: 'midudev (X)',
      username: 'midudev',
      icon: 'feeds/midudev.png',
    }),
  },
  {
    ...xSource({
      id: 'dotcsv',
      name: 'Carlos Santana (DotCSV)',
      username: 'DotCSV',
      icon: 'feeds/dotcsv.png',
    }),
  },
  {
    ...xSource({
      id: 'llmmaster',
      name: 'LLM Master (X)',
      username: 'llmmaster',
      icon: 'feeds/llmmaster.png',
    }),
  },
  {
    id: 'elhacker',
    name: 'El Hacker (Blog)',
    url: 'https://blog.elhacker.net/feeds/posts/default',
    siteUrl: 'https://blog.elhacker.net',
    icon: 'feeds/elhacker.png',
    color: '#ff8c00',
    article: {
      proxy: '/elhacker',
      params: { m: '1' },
      container: ['.art-PostContent', '.post-body'],
      removeLeadImage: true,
    },
  },
];

/** Todas las URL candidatas de una fuente: la principal y sus espejos. */
export function feedUrls(feed) {
  return [feed.url, ...(feed.mirrors || [])].filter(Boolean);
}

/**
 * Ruta same-origin de cada URL candidata. La principal usa `/feed/<id>` y los
 * espejos añaden el índice: `/feed/<id>/1`, `/feed/<id>/2`…
 */
export function feedEndpoints(feed) {
  return feedUrls(feed).map((_, index) =>
    index === 0 ? `/feed/${feed.id}` : `/feed/${feed.id}/${index}`,
  );
}

export const FEEDS = SOURCES.map((feed) => ({
  ...feed,
  endpoint: `/feed/${feed.id}`,
  endpoints: feedEndpoints(feed),
}));

export const FEED_BY_ID = new Map(FEEDS.map((feed) => [feed.id, feed]));
