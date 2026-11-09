import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveArticleProxy } from '../server/lib/articleProxy.js';

test('resuelve el proxy de El Español', () => {
  assert.deepEqual(resolveArticleProxy('/elespanol/espana/2026/11/09/noticia_0.html'), {
    prefix: '/elespanol',
    origin: 'https://www.elespanol.com',
    path: '/espana/2026/11/09/noticia_0.html',
  });
});

test('resuelve el proxy de El Hacker', () => {
  assert.deepEqual(resolveArticleProxy('/elhacker/2026/11/noticia.html'), {
    prefix: '/elhacker',
    origin: 'https://blog.elhacker.net',
    path: '/2026/11/noticia.html',
  });
});

test('ignora las rutas que no son de artículo', () => {
  assert.equal(resolveArticleProxy('/feed/eldia'), null);
  assert.equal(resolveArticleProxy('/elespanol'), null);
  assert.equal(resolveArticleProxy('/'), null);
});
