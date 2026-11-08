const SEARCH_FIELDS = ['title', 'summary', 'author', 'feedName', 'categories'];

/** Comprueba si una vista coincide con el elemento de navegación indicado. */
export function isViewActive(view, type, value) {
  if (view.type !== type) return false;
  if (type === 'feed') return view.id === value;
  if (type === 'category') return view.name === value;
  return true;
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function articleMatchesSearch(article, query) {
  const needle = normalizeText(query);
  if (!needle) return true;

  return SEARCH_FIELDS.some((field) => {
    const value = article[field];
    if (Array.isArray(value)) return normalizeText(value.join(' ')).includes(needle);
    return normalizeText(value).includes(needle);
  });
}

export function filterArticles(articles, view, readIds, starredIds, query = '') {
  let result = articles;

  if (view.type === 'feed') {
    result = result.filter((article) => article.feedId === view.id);
  } else if (view.type === 'unread') {
    result = result.filter((article) => !readIds.has(article.id));
  } else if (view.type === 'starred') {
    result = result.filter((article) => starredIds.has(article.id));
  } else if (view.type === 'category') {
    result = result.filter((article) => article.categories?.includes(view.name));
  }

  if (query.trim()) {
    result = result.filter((article) => articleMatchesSearch(article, query));
  }

  return result;
}

export function excludeReadArticles(articles, readIds, keepId = null) {
  return articles.filter((article) => article.id === keepId || !readIds.has(article.id));
}

export function buildFeedCounts(articles, readIds) {
  const counts = new Map();
  for (const article of articles) {
    const current = counts.get(article.feedId) || { total: 0, unread: 0 };
    current.total += 1;
    if (!readIds.has(article.id)) current.unread += 1;
    counts.set(article.feedId, current);
  }
  return counts;
}

export function buildCategoryCounts(articles) {
  const counts = new Map();
  for (const article of articles) {
    for (const category of article.categories || []) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
}

export function countUnread(articles, readIds) {
  return articles.reduce((total, article) => total + (readIds.has(article.id) ? 0 : 1), 0);
}
