/**
 * Descarga el XML de una fuente probando sus espejos en orden.
 *
 * Los mirrors de Nitter (fuentes de X) caen con frecuencia: unos rechazan el
 * tráfico del edge y otros desaparecen. Cada candidato tiene su propia ruta
 * same-origin, así que el failover funciona igual en local y en Vercel.
 */

const FETCH_TIMEOUT_MS = 20_000;
const TOTAL_BUDGET_MS = 25_000;
const RETRY_DELAY_MS = 1_500;
const SINGLE_URL_ATTEMPTS = 3;

/**
 * Añade un parámetro único a la ruta para que el edge de Vercel no reutilice
 * una copia cacheada del XML. La CDN de cada medio sigue mandando.
 */
export function withCacheBuster(endpoint, now = Date.now()) {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}t=${now}`;
}

/**
 * Las fuentes con CORS se piden directamente para evitar proxies que su WAF
 * rechaza. El resto pasa por `/feed/<id>` y sus espejos, saltando la caché
 * del edge.
 */
export function feedRequestUrls(feed, now = Date.now()) {
  if (feed.direct) return [feed.url];
  const endpoints = feed.endpoints?.length ? feed.endpoints : [feed.endpoint];
  return endpoints.map((endpoint) => withCacheBuster(endpoint, now));
}

/**
 * Un mirror puede devolver HTML (un reto anti-bot) con respuesta 200. Solo
 * aceptamos documentos que parezcan un feed.
 */
export function looksLikeFeed(xml) {
  return /<(rss|feed|rdf:RDF)[\s>]/i.test(String(xml || ''));
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Devuelve el XML de la fuente. Recorre los candidatos hasta que uno responde
 * con un feed válido y se respeta un presupuesto total de tiempo para no
 * dejar la interfaz esperando.
 */
export async function fetchFeedXml(feed, { now = Date.now(), retryDelayMs = RETRY_DELAY_MS } = {}) {
  const candidates = feedRequestUrls(feed, now);
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const maxAttempts = candidates.length > 1 ? candidates.length : SINGLE_URL_ATTEMPTS;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (Date.now() >= deadline) break;

    const url = candidates[attempt % candidates.length];
    const timeout = Math.max(1_000, Math.min(FETCH_TIMEOUT_MS, deadline - Date.now()));

    try {
      const xml = await fetchText(url, timeout);
      if (!looksLikeFeed(xml)) throw new Error('La respuesta no es un feed');
      return xml;
    } catch (error) {
      lastError = error;
      const pending = attempt < maxAttempts - 1 && Date.now() < deadline;
      if (pending) await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError || new Error('No se pudo actualizar el feed');
}

export const __testing = {
  FETCH_TIMEOUT_MS,
  TOTAL_BUDGET_MS,
  RETRY_DELAY_MS,
};
