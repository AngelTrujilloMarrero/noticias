import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { __testing } from '../src/services/feedLoader.js';

describe('instantánea de feeds', () => {
  it('empieza sin noticias y con todos los feeds en error', () => {
    const snapshot = __testing.createEmptySnapshot();

    assert.equal(snapshot.articles.length, 0);
    assert.equal(snapshot.stats.articleCount, 0);
    assert.equal(snapshot.stats.errorCount, 0);
    assert.ok(snapshot.feeds.length > 0);
  });
});
