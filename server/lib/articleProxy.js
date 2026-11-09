import { fetchText } from './http.js';

export const ARTICLE_PROXY_ORIGINS = {
  '/elhacker': 'https://blog.elhacker.net',
  '/elespanol': 'https://www.elespanol.com',
};

/** Devuelve el destino del proxy para una ruta `/elhacker/...` o `/elespanol/...`. */
export function resolveArticleProxy(pathname) {
  for (const [prefix, origin] of Object.entries(ARTICLE_PROXY_ORIGINS)) {
    if (pathname.startsWith(`${prefix}/`)) {
      return { prefix, origin, path: pathname.slice(prefix.length) };
    }
  }
  return null;
}

/**
 * Reenvía las rutas de artículo a la web original. El navegador las pide
 * same-origin para evitar el bloqueo CORS de las fuentes.
 */
export async function proxyArticle(req, res) {
  const url = new URL(req.originalUrl || req.url || '/', 'http://localhost');
  const match = resolveArticleProxy(url.pathname);
  if (!match) return false;

  const target = `${match.origin}${match.path}${url.search}`;
  try {
    const html = await fetchText(target, { timeoutMs: 15000 });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(html);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error?.message || 'No se pudo descargar el artículo' }));
  }
  return true;
}
