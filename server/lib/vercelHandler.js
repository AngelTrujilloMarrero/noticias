import { handleApi } from '../api.js';

/**
 * Adaptador para las funciones serverless de Vercel, que reciben `req` y `res`
 * de Node igual que Express. Reutiliza el enrutador compartido de la API.
 */
export async function vercelHandler(req, res) {
  const host = req.headers?.host || 'localhost';
  const url = new URL(req.url || '/', `https://${host}`);
  const handled = await handleApi(req, res, url);

  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
}
