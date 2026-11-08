import { createHash } from 'node:crypto';
import Parser from 'rss-parser';
import {
  escapeHtml,
  extractFirstImage,
  htmlToText,
  sanitizeArticleHtml,
} from './sanitize.js';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
    ],
  },
});

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function asText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') return String(value._ || value['#text'] || '');
  return '';
}

function extractMediaUrl(value) {
  const entry = first(value);
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  return entry.url || entry.$?.url || entry['@_url'] || '';
}

function extractFeedImage(feed) {
  const image = feed.image;
  if (!image) return '';
  if (typeof image === 'string') return image;
  return asText(first(image.url)) || asText(image['@_href']);
}

function normalizeCategories(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return [...new Set(list.map((entry) => asText(entry)).filter(Boolean))].slice(0, 12);
}

function pickContent(item) {
  const candidates = [
    item.contentEncoded,
    item['content:encoded'],
    item.content,
    item.summary,
    item.description,
  ].filter((value) => typeof value === 'string' && value.trim());

  return candidates.sort((a, b) => b.length - a.length)[0] || '';
}

function parseDate(item, fallback) {
  const raw = item.isoDate || item.pubDate || item.published || item.updated;
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function buildId(feedId, item, link, published) {
  const seed = item.guid || item.id || link || `${item.title}|${published}`;
  return createHash('sha1').update(`${feedId}|${seed}`).digest('hex').slice(0, 20);
}

function normalizeItem(item, feed, baseUrl, fetchedAt) {
  const title = htmlToText(asText(item.title)) || 'Sin título';
  const link = asText(item.link) || asText(item.guid) || asText(item.id) || feed.siteUrl;
  const published = parseDate(item, fetchedAt);
  const rawContent = pickContent(item);
  const content = sanitizeArticleHtml(rawContent, link || baseUrl);
  const summary =
    htmlToText(item.contentSnippet || item['content:encodedSnippet'] || rawContent).slice(0, 320) ||
    title;
  const author = htmlToText(asText(item.creator) || asText(item.author) || '');
  const enclosureUrl = item.enclosure?.url || '';
  const enclosureType = item.enclosure?.type || '';
  const image =
    extractFirstImage(content) ||
    (enclosureType.startsWith('image/') ? enclosureUrl : '') ||
    extractMediaUrl(item.mediaThumbnail) ||
    extractMediaUrl(item.mediaContent);

  return {
    id: buildId(feed.id, item, link, published),
    feedId: feed.id,
    title,
    link,
    author,
    published,
    summary,
    content: content || `<p>${escapeHtml(summary)}</p>`,
    image: image || '',
    categories: normalizeCategories(item.categories),
  };
}

/**
 * Convierte el XML de un feed en artículos normalizados.
 * @param {string} xml
 * @param {import('../config/feeds.js').FEEDS[number]} feed
 */
export async function parseFeedXml(xml, feed, { fetchedAt = new Date().toISOString() } = {}) {
  const parsed = await parser.parseString(xml);
  const baseUrl = parsed.link || feed.siteUrl || feed.url;
  const articles = [];
  const seen = new Set();

  for (const item of parsed.items || []) {
    const article = normalizeItem(item, feed, baseUrl, fetchedAt);
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    articles.push(article);
  }

  return {
    feed: {
      ...feed,
      name: asText(parsed.title) || feed.name,
      siteUrl: parsed.link || feed.siteUrl,
      image: extractFeedImage(parsed) || '',
    },
    articles: articles.sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
    ),
    fetchedAt,
  };
}

export const __testing = { normalizeItem, parseDate, buildId };
