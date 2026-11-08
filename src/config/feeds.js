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
 */
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
    id: 'midudev',
    name: 'midudev (X)',
    url: 'https://fxtwitter.com/midudev/feed.xml',
    siteUrl: 'https://x.com/midudev',
    icon: 'feeds/midudev.png',
    color: '#1da1f2',
    maxItems: 10,
    refreshIntervalMs: 5 * 60 * 1000,
  },
  {
    id: 'dotcsv',
    name: 'Carlos Santana (DotCSV)',
    url: 'https://fxtwitter.com/DotCSV/feed.xml',
    siteUrl: 'https://x.com/DotCSV',
    icon: 'feeds/dotcsv.png',
    color: '#1da1f2',
    maxItems: 10,
    refreshIntervalMs: 5 * 60 * 1000,
  },
  {
    id: 'llmmaster',
    name: 'LLM Master (X)',
    url: 'https://fxtwitter.com/llmmaster/feed.xml',
    siteUrl: 'https://x.com/llmmaster',
    icon: 'feeds/llmmaster.png',
    color: '#1da1f2',
    maxItems: 10,
    refreshIntervalMs: 5 * 60 * 1000,
  },
  {
    id: 'elhacker',
    name: 'El Hacker (Blog)',
    url: 'https://blog.elhacker.net/feeds/posts/default',
    siteUrl: 'https://blog.elhacker.net',
    icon: 'feeds/elhacker.png',
    color: '#ff8c00',
  },
];

export const FEEDS = SOURCES.map((feed) => ({
  ...feed,
  endpoint: `/feed/${feed.id}`,
}));

export const FEED_BY_ID = new Map(FEEDS.map((feed) => [feed.id, feed]));
