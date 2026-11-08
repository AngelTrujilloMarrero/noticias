import { FEEDS } from '../config/feeds.js';
import { parseFeedXml } from './parseFeed.js';

const REFRESH_MS = 55_000;
const FORCE_THROTTLE_MS = 5_000;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ARTICLES = 600;

const cache = new Map();
let snapshot = createEmptySnapshot();
let inflight = null;
let lastAttemptAt = 0;

function createEmptySnapshot() {
  return {
    updatedAt: null,
    lastAttemptAt: null,
    refreshIntervalMs: REFRESH_MS,
    feeds: FEEDS.map((feed) => ({
      id: feed.id,
      name: feed.name,
      icon: feed.icon,
      color: feed.color,
      siteUrl: feed.siteUrl,
      url: feed.url,
      articleCount: 0,
      lastFetchedAt: null,
      error: null,
    })),
    articles: [],
    stats: { feedCount: FEEDS.length, articleCount: 0, errorCount: 0 },
  };
}

function rebuildSnapshot() {
  const articles = [];
  const feeds = FEEDS.map((feed) => {
    const entry = cache.get(feed.id);
    if (entry?.articles?.length) articles.push(...entry.articles);
    return {
      id: feed.id,
      name: feed.name,
      icon: feed.icon,
      color: feed.color,
      siteUrl: feed.siteUrl,
      url: feed.url,
      articleCount: entry?.articles?.length || 0,
      lastFetchedAt: entry?.fetchedAt || null,
      error: entry?.error || null,
    };
  });

  articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  const limited = articles.slice(0, MAX_ARTICLES);
  const dates = [...cache.values()].map((entry) => entry.fetchedAt).filter(Boolean).sort();
  const updatedAt = dates.at(-1) || snapshot.updatedAt;

  snapshot = {
    updatedAt,
    lastAttemptAt: new Date(lastAttemptAt).toISOString(),
    refreshIntervalMs: REFRESH_MS,
    feeds,
    articles: limited,
    stats: {
      feedCount: FEEDS.length,
      articleCount: limited.length,
      errorCount: feeds.filter((feed) => feed.error).length,
    },
  };

  return snapshot;
}

/**
 * Añade un parámetro único a la ruta para que el edge de Vercel no reutilice
 * una copia cacheada del XML. La CDN de cada medio sigue mandando.
 */
function withCacheBuster(endpoint, now = Date.now()) {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}t=${now}`;
}

async function loadFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(withCacheBuster(feed.endpoint), {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    return parseFeedXml(await response.text(), feed, {
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Tiempo de espera agotado', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function refreshFeeds() {
  if (inflight) return inflight;
  lastAttemptAt = Date.now();

  inflight = (async () => {
    const results = await Promise.allSettled(FEEDS.map((feed) => loadFeed(feed)));

    results.forEach((result, index) => {
      const feed = FEEDS[index];
      if (result.status === 'fulfilled') {
        cache.set(feed.id, {
          articles: result.value.articles,
          fetchedAt: result.value.fetchedAt,
          error: null,
        });
        return;
      }

      const previous = cache.get(feed.id);
      cache.set(feed.id, {
        articles: previous?.articles || [],
        fetchedAt: previous?.fetchedAt || null,
        error: result.reason?.message || 'No se pudo actualizar el feed',
      });
    });

    return rebuildSnapshot();
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

/**
 * Descarga los feeds en el navegador a través de `/feed/<id>` y construye una
 * instantánea con la misma forma que consumía la antigua API.
 */
export async function getNews({ force = false } = {}) {
  if (inflight) return inflight;

  const age = Date.now() - lastAttemptAt;
  const needsRefresh = cache.size === 0 || age >= REFRESH_MS;
  const canForce = force && age >= FORCE_THROTTLE_MS;

  if (!needsRefresh && !canForce) return snapshot;

  const result = await refreshFeeds();
  if (result.stats.articleCount === 0 && result.stats.errorCount === FEEDS.length) {
    const detail = result.feeds.find((feed) => feed.error)?.error;
    throw new Error(detail || 'No se pudieron cargar los feeds');
  }

  return result;
}

export const __testing = {
  REFRESH_MS,
  MAX_ARTICLES,
  createEmptySnapshot,
  withCacheBuster,
};
