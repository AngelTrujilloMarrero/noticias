import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { FEED_BY_ID } from '../src/config/feeds.js';
import { proxyArticle } from './lib/articleProxy.js';
import { fetchText } from './lib/http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(distDir, 'index.html');
const port = Number(process.env.PORT) || 4173;

const app = express();
app.disable('x-powered-by');

app.use(async (req, res, next) => {
  if (await proxyArticle(req, res)) return;
  next();
});

app.get('/feed/:id', async (req, res) => {
  const feed = FEED_BY_ID.get(req.params.id);
  if (!feed) {
    res.status(404).json({ error: 'Feed no encontrado' });
    return;
  }

  try {
    const xml = await fetchText(feed.url);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(xml);
  } catch (error) {
    res.status(502).json({ error: error?.message || 'No se pudo descargar el feed' });
  }
});

app.use(express.static(distDir, { index: false, maxAge: '1h' }));

app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) return next();
  if (!existsSync(indexFile)) {
    res
      .status(503)
      .type('text/plain')
      .send('Falta la carpeta dist. Ejecuta "npm run build" antes de "npm start".');
    return;
  }
  res.sendFile(indexFile, (error) => {
    if (error) next(error);
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(500).json({ error: error?.message || 'Error interno' });
});

app.listen(port, () => {
  console.log(`Noticias disponible en http://localhost:${port}`);
});
