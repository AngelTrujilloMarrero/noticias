import {
  escapeHtml,
  extractFirstImage,
  htmlToText,
  sanitizeArticleHtml,
} from '../utils/sanitize.js';

function directChildren(parent, name) {
  if (!parent) return [];
  return Array.from(parent.children || []).filter(
    (child) => child.nodeName === name || child.localName === name,
  );
}

function childByNames(parent, names) {
  if (!parent) return null;
  return (
    Array.from(parent.children || []).find(
      (child) => names.includes(child.nodeName) || names.includes(child.localName),
    ) || null
  );
}

function walkElements(parent, visit) {
  for (const child of parent?.children || []) {
    visit(child);
    walkElements(child, visit);
  }
}

function descendantsByNames(parent, names) {
  const result = [];
  walkElements(parent, (element) => {
    if (names.includes(element.nodeName) || names.includes(element.localName)) {
      result.push(element);
    }
  });
  return result;
}

function textOf(parent, names) {
  const element = childByNames(parent, names);
  return element ? element.textContent.trim() : '';
}

function plainText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function elementHtml(element) {
  if (!element) return '';
  if (element.children?.length) {
    if (typeof XMLSerializer !== 'undefined') {
      const serializer = new XMLSerializer();
      return Array.from(element.children)
        .map((child) => serializer.serializeToString(child))
        .join('');
    }
    return element.textContent || '';
  }
  return element.textContent || '';
}

function pickContent(item) {
  const candidates = ['content:encoded', 'encoded', 'content', 'description', 'summary']
    .map((name) => childByNames(item, [name]))
    .filter(Boolean)
    .map((element) => elementHtml(element).trim())
    .filter(Boolean);

  return candidates.sort((a, b) => b.length - a.length)[0] || '';
}

function extractLink(item, isAtom) {
  const links = directChildren(item, 'link');
  if (isAtom) {
    const alternate = links.find((link) => (link.getAttribute('rel') || 'alternate') === 'alternate');
    return (
      alternate?.getAttribute('href') ||
      links[0]?.getAttribute('href') ||
      textOf(item, ['guid', 'id']) ||
      ''
    );
  }

  return (
    links.map((link) => link.textContent.trim()).find(Boolean) ||
    links[0]?.getAttribute('href') ||
    textOf(item, ['guid', 'id']) ||
    ''
  );
}

function extractEnclosure(item) {
  const enclosure = childByNames(item, ['enclosure']);
  if (enclosure) {
    return {
      url: enclosure.getAttribute('url') || '',
      type: enclosure.getAttribute('type') || '',
    };
  }

  const link = directChildren(item, 'link').find(
    (entry) => entry.getAttribute('rel') === 'enclosure',
  );
  return {
    url: link?.getAttribute('href') || '',
    type: link?.getAttribute('type') || '',
  };
}

function extractMediaUrl(item) {
  const media = [];
  walkElements(item, (element) => {
    if (
      element.namespaceURI?.includes('search.yahoo.com/mrss') ||
      element.nodeName.startsWith('media:')
    ) {
      media.push(element);
    }
  });
  const preferred =
    media.find((element) => element.localName === 'thumbnail') ||
    media.find((element) => element.localName === 'content');
  return preferred?.getAttribute('url') || '';
}

function normalizeCategories(item) {
  const names = directChildren(item, 'category')
    .map((element) => (element.getAttribute('term') || element.textContent || '').trim())
    .filter(Boolean);
  return [...new Set(names)].slice(0, 12);
}

function parseDate(item, fallback) {
  const raw = textOf(item, ['pubDate', 'published', 'updated', 'dc:date', 'date']);
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function hashSeed(seed) {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    const code = seed.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

function buildId(feedId, item, link, published) {
  const seed =
    textOf(item, ['guid', 'id']) || link || `${textOf(item, ['title'])}|${published}`;
  return hashSeed(`${feedId}|${seed}`);
}

function normalizeItem(item, feed, isAtom, fetchedAt) {
  const title = plainText(textOf(item, ['title'])) || 'Sin título';
  const link = extractLink(item, isAtom) || feed.siteUrl;
  const published = parseDate(item, fetchedAt);
  const rawContent = pickContent(item);
  const content = sanitizeArticleHtml(rawContent, link || feed.url);
  const summary = htmlToText(content).slice(0, 320) || title;
  const author = plainText(textOf(item, ['dc:creator', 'creator', 'author']));
  const enclosure = extractEnclosure(item);
  const image =
    extractFirstImage(content) ||
    (enclosure.type.startsWith('image/') ? enclosure.url : '') ||
    extractMediaUrl(item);

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
    categories: normalizeCategories(item),
  };
}

function feedMetadata(root, feed, isAtom) {
  const scope = isAtom ? root : childByNames(root, ['channel']) || root;
  const title = plainText(textOf(scope, ['title'])) || feed.name;
  let siteUrl = feed.siteUrl;
  let image;

  if (isAtom) {
    const links = directChildren(scope, 'link');
    const alternate = links.find((link) => (link.getAttribute('rel') || 'alternate') === 'alternate');
    siteUrl = alternate?.getAttribute('href') || siteUrl;
    image = textOf(scope, ['icon', 'logo']) || '';
  } else {
    siteUrl = textOf(scope, ['link']) || siteUrl;
    const imageElement = childByNames(scope, ['image']);
    image = textOf(imageElement, ['url']) || '';
  }

  return { ...feed, name: title, siteUrl, image };
}

/**
 * Convierte el XML de un feed en artículos normalizados usando DOMParser.
 * Funciona en el navegador; en los tests se le puede inyectar un DOMParser.
 */
export function parseFeedXml(
  xml,
  feed,
  { fetchedAt = new Date().toISOString(), domParser = globalThis.DOMParser } = {},
) {
  if (!domParser) throw new Error('DOMParser no está disponible');

  const document = new domParser().parseFromString(String(xml || ''), 'application/xml');
  if (!document?.documentElement) throw new Error('El feed no contiene XML válido');
  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new Error('El feed no es un XML válido');
  }

  const root = document.documentElement;
  const isAtom = root.localName === 'feed';
  const items = isAtom
    ? descendantsByNames(root, ['entry'])
    : descendantsByNames(root, ['item']);
  const seen = new Set();
  const articles = [];

  for (const item of items) {
    const article = normalizeItem(item, feed, isAtom, fetchedAt);
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    articles.push(article);
  }

  articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  if (Number.isInteger(feed?.maxItems) && feed.maxItems > 0) {
    articles.splice(feed.maxItems);
  }

  return {
    feed: feedMetadata(root, feed, isAtom),
    articles,
    fetchedAt,
  };
}

export const __testing = { buildId, parseDate, normalizeItem };
