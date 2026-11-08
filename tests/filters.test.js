import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  articleMatchesSearch,
  buildCategoryCounts,
  buildFeedCounts,
  countUnread,
  filterArticles,
  normalizeText,
} from '../src/utils/filters.js';

const articles = [
  {
    id: 'a1',
    feedId: 'f1',
    feedName: 'Xataka',
    title: 'El Alpine A390 GT',
    summary: 'Un coche eléctrico',
    author: 'Ana Pérez',
    categories: ['Motor', 'Actualidad'],
  },
  {
    id: 'a2',
    feedId: 'f1',
    feedName: 'Xataka',
    title: 'Nuevo móvil',
    summary: 'Análisis',
    author: 'Luis Gómez',
    categories: ['Móviles'],
  },
  {
    id: 'a3',
    feedId: 'f2',
    feedName: 'Genbeta',
    title: 'Aplicación de notas',
    summary: 'Software libre',
    author: 'Marta',
    categories: ['Portada'],
  },
];

const noIds = new Set();
const readA1 = new Set(['a1']);

describe('normalizeText', () => {
  it('quita acentos y mayúsculas', () => {
    assert.equal(normalizeText('  Aplicación ELÉCTRICA '), 'aplicacion electrica');
  });
});

describe('articleMatchesSearch', () => {
  it('busca sin acentos en título, resumen, autor y categorías', () => {
    assert.equal(articleMatchesSearch(articles[0], 'ALPINE'), true);
    assert.equal(articleMatchesSearch(articles[0], 'electrico'), true);
    assert.equal(articleMatchesSearch(articles[0], 'perez'), true);
    assert.equal(articleMatchesSearch(articles[2], 'portada'), true);
    assert.equal(articleMatchesSearch(articles[2], 'inexistente'), false);
  });

  it('acepta cualquier artículo con una consulta vacía', () => {
    assert.equal(articleMatchesSearch(articles[0], '   '), true);
  });
});

describe('filterArticles', () => {
  it('filtra por feed', () => {
    const result = filterArticles(articles, { type: 'feed', id: 'f1' }, noIds, noIds);
    assert.deepEqual(result.map((article) => article.id), ['a1', 'a2']);
  });

  it('filtra por no leídas y destacadas', () => {
    assert.deepEqual(
      filterArticles(articles, { type: 'unread' }, readA1, noIds).map((a) => a.id),
      ['a2', 'a3'],
    );
    assert.deepEqual(
      filterArticles(articles, { type: 'starred' }, noIds, readA1).map((a) => a.id),
      ['a1'],
    );
  });

  it('filtra por categoría y combina con la búsqueda', () => {
    const result = filterArticles(
      articles,
      { type: 'category', name: 'Actualidad' },
      noIds,
      noIds,
      'alpine',
    );
    assert.deepEqual(result.map((article) => article.id), ['a1']);
  });
});

describe('contadores', () => {
  it('cuenta no leídas por feed', () => {
    const counts = buildFeedCounts(articles, readA1);
    assert.deepEqual(counts.get('f1'), { total: 2, unread: 1 });
    assert.deepEqual(counts.get('f2'), { total: 1, unread: 1 });
  });

  it('ordena categorías por frecuencia y nombre', () => {
    const counts = buildCategoryCounts(articles);
    assert.deepEqual(counts, [
      { name: 'Actualidad', count: 1 },
      { name: 'Motor', count: 1 },
      { name: 'Móviles', count: 1 },
      { name: 'Portada', count: 1 },
    ]);
  });

  it('cuenta el total de no leídas', () => {
    assert.equal(countUnread(articles, readA1), 2);
    assert.equal(countUnread(articles, noIds), 3);
  });
});
