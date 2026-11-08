import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { FEEDS } from '../src/config/feeds.js';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

describe('configuración de feeds', () => {
  it('asigna un endpoint same-origin a cada feed', () => {
    for (const feed of FEEDS) {
      assert.equal(feed.endpoint, `/feed/${feed.id}`);
    }
  });

  it('mantiene los rewrites de Vercel sincronizados con los feeds', () => {
    const rewrites = new Map(vercel.rewrites.map((rule) => [rule.source, rule.destination]));

    for (const feed of FEEDS) {
      assert.equal(rewrites.get(feed.endpoint), feed.url, `Falta el rewrite de ${feed.id}`);
    }

    assert.equal(rewrites.size, FEEDS.length);
  });
});
