import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { handleApi } from './api.js';
import { refreshFeeds } from './lib/feedService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(distDir, 'index.html');
const port = Number(process.env.PORT) || 4173;

const app = express();
app.disable('x-powered-by');

app.use('/api', async (req, res, next) => {
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host || 'localhost'}`);
    const handled = await handleApi(req, res, url);
    if (!handled) next();
  } catch (error) {
    if (res.writableEnded) return;
    res.status(500).json({ error: error?.message || 'Error interno' });
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
  refreshFeeds().catch((error) => {
    console.error('No se pudieron precargar los feeds:', error.message);
  });
});
