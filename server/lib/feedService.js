import { FEEDS } from '../config/feeds.js';
import { fetchText } from './http.js';
import { parseFeedXml } from './parseFeed.js';

const REFRESH_MS = Math.max(15_000, Number(process.env.FEED_REFRESH_MS) || 55_000);
const FORCE_THROTTLE_MS = 5_000;
const MAX_ARTICLES = 600;
const FETCH_TIMEOUT_MS = 15_000;

/** @type {Map<string, {articles: any[], fetchedAt: string, error: string}>} */
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

async function loadFeed(feed) {
  const xml = await fetchText(feed.url, { timeoutMs: FETCH_TIMEOUT_MS });
  return parseFeedXml(xml, feed, { fetchedAt: new Date().toISOString() });
}

/**
 * Actualiza todos los feeds. Si uno falla se conservan sus últimas noticias.
 * Solo se permite una actualización simultánea.
 */
export function refreshFeeds({ force = false } = {}) {
  if (inflight) return inflight;

  const age = Date.now() - lastAttemptAt;
  if (!force && lastAttemptAt && age < REFRESH_MS) {
    return Promise.resolve(snapshot);
  }

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

export async function getNews({ force = false } = {}) {
  if (inflight) return inflight;

  const age = Date.now() - lastAttemptAt;
  const needsRefresh = cache.size === 0 || age >= REFRESH_MS;
  const canForce = force && age >= FORCE_THROTTLE_MS;

  if (needsRefresh || canForce) {
    return refreshFeeds({ force: canForce });
  }

  return snapshot;
}

export function getSnapshot() {
  return snapshot;
}

export function getStatus() {
  return {
    ok: true,
    cacheSize: cache.size,
    updatedAt: snapshot.updatedAt,
    lastAttemptAt: snapshot.lastAttemptAt,
    articleCount: snapshot.stats.articleCount,
    errorCount: snapshot.stats.errorCount,
    refreshIntervalMs: REFRESH_MS,
  };
}

export const __testing = { REFRESH_MS, MAX_ARTICLES };
