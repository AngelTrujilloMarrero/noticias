import { FEED_BY_ID } from '../config/feeds.js';
import { removeLeadImage } from '../utils/articleContent.js';
import { sanitizeArticleHtml } from '../utils/sanitize.js';

const FULL_ARTICLE_ATTEMPTS = 2;
const contentCache = new Map();

function articleRequestUrl(article, config) {
  if (config.direct) return article.link;
  if (!config.proxy) return '';

  try {
    const url = new URL(article.link);
    return `${config.proxy}${url.pathname}${url.search}`;
  } catch {
    return '';
  }
}

function prepareContainer(container, config) {
  for (const selector of config.remove || []) {
    for (const node of container.querySelectorAll(selector)) node.remove();
  }
  if (config.removeLeadImage) removeLeadImage(container);
}

/**
 * Extrae el HTML del artículo desde el documento de la página original.
 * Con `container` conserva todo su interior; con `selector` recoge solo esos
 * elementos (párrafos y subtítulos) y descarta los que caen en `exclude`.
 */
export function extractArticleContent(document, config, baseUrl) {
  if (!document || !config) return '';

  if (config.container) {
    const container = document.querySelector(config.container);
    if (!container) return '';
    prepareContainer(container, config);
    return sanitizeArticleHtml(container.innerHTML, baseUrl);
  }

  if (!config.selector) return '';
  const nodes = Array.from(document.querySelectorAll(config.selector)).filter(
    (node) => !(config.exclude && node.closest(config.exclude)),
  );
  return sanitizeArticleHtml(nodes.map((node) => node.outerHTML).join(''), baseUrl);
}

/**
 * Descarga y extrae el artículo completo de las fuentes que lo configuran.
 * Devuelve `null` cuando la fuente no define extracción propia. Los aciertos se
 * cachean por id para no repetir la descarga al volver a la misma noticia.
 */
export async function fetchFullArticle(article, { domParser = globalThis.DOMParser } = {}) {
  const config = FEED_BY_ID.get(article?.feedId)?.article;
  if (!config || !article?.link) return null;
  if (contentCache.has(article.id)) return contentCache.get(article.id);

  const requestUrl = articleRequestUrl(article, config);
  if (!requestUrl) return null;

  let lastError;
  for (let attempt = 0; attempt < FULL_ARTICLE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(requestUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const document = new domParser().parseFromString(html, 'text/html');
      const content = extractArticleContent(document, config, article.link);
      if (!content) throw new Error('El artículo no contiene texto');
      contentCache.set(article.id, content);
      return content;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
