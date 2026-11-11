import { FEEDS } from '../config/feeds.js';
import { fetchFeedXml } from './feedFetcher.js';
import { parseFeedXml } from './parseFeed.js';

const REFRESH_MS = 55_000;
const FORCE_THROTTLE_MS = 5_000;
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
 * Descarga el XML de la fuente probando sus espejos en orden y lo convierte
 * en artículos normalizados.
 */
async function loadFeed(feed, now = Date.now()) {
  const xml = await fetchFeedXml(feed, { now });

  return parseFeedXml(xml, feed, {
    fetchedAt: new Date().toISOString(),
  });
}

function refreshFeeds() {
  if (inflight) return inflight;
  lastAttemptAt = Date.now();

  inflight = (async () => {
    const now = Date.now();
    const feedsToLoad = FEEDS.filter((feed) => {
      const previous = cache.get(feed.id);
      const interval = feed.refreshIntervalMs || REFRESH_MS;
      return !previous?.fetchedAt || now - new Date(previous.fetchedAt).getTime() >= interval;
    });

    const results = await Promise.allSettled(feedsToLoad.map((feed) => loadFeed(feed)));

    let resultIndex = 0;
    for (const feed of FEEDS) {
      if (!feedsToLoad.includes(feed)) continue;
      const result = results[resultIndex];
      resultIndex += 1;

      if (result.status === 'fulfilled') {
        cache.set(feed.id, {
          articles: result.value.articles,
          fetchedAt: result.value.fetchedAt,
          error: null,
        });
        continue;
      }

      const previous = cache.get(feed.id);
      cache.set(feed.id, {
        articles: previous?.articles || [],
        fetchedAt: previous?.fetchedAt || null,
        error: result.reason?.message || 'No se pudo actualizar el feed',
      });
    }

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
};
