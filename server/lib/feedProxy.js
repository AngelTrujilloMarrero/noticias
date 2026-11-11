import { FEED_BY_ID, feedUrls } from '../../src/config/feeds.js';
import { fetchText } from './http.js';

/**
 * Resuelve la ruta `/feed/<id>` o `/feed/<id>/<espejo>`.
 *
 * Sin índice devuelve la fuente con todos sus espejos para que el proxy
 * pueda reintentar; con índice fija una URL concreta, que es lo que hace el
 * failover del navegador en Vercel (donde cada espejo es un rewrite).
 *
 * Devuelve `null` si la ruta no es de feed y `feed: null` si el identificador
 * o el espejo no existen.
 */
export function resolveFeedRequest(pathname) {
  const match = /^\/feed\/([\w-]+)(?:\/(\d+))?$/.exec(pathname || '');
  if (!match) return null;

  const feed = FEED_BY_ID.get(match[1]);
  const index = match[2] === undefined ? null : Number(match[2]);
  if (!feed) return { feed: null, index, urls: [] };

  const urls = feedUrls(feed);
  if (index !== null && !urls[index]) return { feed: null, index, urls };

  return { feed, index, urls };
}

/**
 * Un mirror puede devolver HTML (un reto anti-bot) con respuesta 200. Solo
 * aceptamos documentos que parezcan un feed.
 */
export function looksLikeFeed(xml) {
  return /<(rss|feed|rdf:RDF)[\s>]/i.test(String(xml || ''));
}

/**
 * Descarga el XML de la fuente. Sin índice prueba los espejos en orden; con
 * índice descarga solo esa URL.
 */
export async function fetchFeedXml(
  feed,
  { index = null, fetchText: download = fetchText } = {},
) {
  const urls = feedUrls(feed);
  const candidates = index === null ? urls : [urls[index]];
  let lastError = null;

  for (const url of candidates) {
    try {
      const xml = await download(url);
      if (!looksLikeFeed(xml)) throw new Error('La respuesta no es un feed');
      return xml;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No se pudo descargar el feed');
}
