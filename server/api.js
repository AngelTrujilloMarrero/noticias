import { getNews, getStatus } from './lib/feedService.js';

function sendJson(res, statusCode, payload) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.end(JSON.stringify(payload));
}

/**
 * Enrutador compartido por Vite (dev/preview) y por Express (producción).
 * @returns {Promise<boolean>} true si la petición era de la API.
 */
export async function handleApi(req, res, url) {
  if (!url.pathname.startsWith('/api/')) return false;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Método no permitido' });
    return true;
  }

  try {
    if (url.pathname === '/api/news') {
      const force = ['1', 'true', 'yes'].includes(
        String(url.searchParams.get('force') || '').toLowerCase(),
      );
      const snapshot = await getNews({ force });
      sendJson(res, 200, snapshot);
      return true;
    }

    if (url.pathname === '/api/health') {
      sendJson(res, 200, getStatus());
      return true;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada' });
    return true;
  } catch (error) {
    sendJson(res, 502, {
      error: 'No se pudieron actualizar los feeds',
      detail: error?.message || String(error),
    });
    return true;
  }
}
