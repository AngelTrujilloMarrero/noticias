import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { FEEDS, feedEndpoints, feedUrls } from '../src/config/feeds.js';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

describe('configuración de feeds', () => {
  it('asigna un endpoint same-origin a cada feed', () => {
    for (const feed of FEEDS) {
      assert.equal(feed.endpoint, `/feed/${feed.id}`);
    }
  });

  it('descarga eldia directamente porque su WAF bloquea a Vercel', () => {
    const eldia = FEEDS.find((feed) => feed.id === 'eldia');
    assert.equal(eldia.direct, true);
    assert.match(eldia.url, /^https:\/\/www\.eldia\.es\//);
  });

  it('mantiene los rewrites de Vercel sincronizados con los feeds', () => {
    const rewrites = new Map(vercel.rewrites.map((rule) => [rule.source, rule.destination]));

    for (const feed of FEEDS) {
      assert.equal(rewrites.get(feed.endpoint), feed.url, `Falta el rewrite de ${feed.id}`);
    }

    assert.ok(rewrites.size >= FEEDS.length);
  });

  it('mantiene los rewrites de los espejos sincronizados con los feeds', () => {
    const rewrites = new Map(vercel.rewrites.map((rule) => [rule.source, rule.destination]));

    for (const feed of FEEDS) {
      const urls = feedUrls(feed);
      const endpoints = feedEndpoints(feed);

      assert.equal(endpoints.length, urls.length);

      endpoints.forEach((endpoint, index) => {
        assert.equal(rewrites.get(endpoint), urls[index], `Falta el rewrite de ${endpoint}`);
      });
    }
  });

  it('da espejos a las fuentes de X, que dependen de Nitter', () => {
    for (const id of ['midudev', 'dotcsv', 'llmmaster']) {
      const feed = FEEDS.find((item) => item.id === id);
      assert.ok(feed.mirrors?.length >= 1, `${id} necesita espejos`);
      assert.match(feed.canonical, /^https:\/\/x\.com\//);
    }
  });
});
