import { handleApi } from './api.js';

function apiMiddleware(req, res, next) {
  const url = new URL(req.originalUrl || req.url || '/', 'http://localhost');

  handleApi(req, res, url)
    .then((handled) => {
      if (!handled) next();
    })
    .catch((error) => {
      if (res.writableEnded) return;
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: error?.message || 'Error interno' }));
    });
}

/** Sirve /api/news durante `vite` y `vite preview`. */
export function feedApiPlugin() {
  return {
    name: 'noticias-feed-api',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
