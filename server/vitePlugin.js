import { FEED_BY_ID } from '../src/config/feeds.js';
import { fetchText } from './lib/http.js';

async function elhackerMiddleware(req, res, next) {
  const url = new URL(req.originalUrl || req.url || '/', 'http://localhost');
  if (!url.pathname.startsWith('/elhacker/')) {
    next();
    return;
  }

  const target = `https://blog.elhacker.net${url.pathname}${url.search}`;
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
}

async function feedMiddleware(req, res, next) {
  const url = new URL(req.originalUrl || req.url || '/', 'http://localhost');
  const match = /^\/feed\/([\w-]+)$/.exec(url.pathname);
  if (!match) {
    next();
    return;
  }

  const feed = FEED_BY_ID.get(match[1]);
  if (!feed) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Feed no encontrado' }));
    return;
  }

  try {
    const xml = await fetchText(feed.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(xml);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error?.message || 'No se pudo descargar el feed' }));
  }
}

/** Proxy same-origin de `/feed/<id>` durante `vite` y `vite preview`. */
export function feedProxyPlugin() {
  return {
    name: 'noticias-feed-proxy',
    configureServer(server) {
      server.middlewares.use(elhackerMiddleware);
      server.middlewares.use(feedMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(elhackerMiddleware);
      server.middlewares.use(feedMiddleware);
    },
  };
}
