import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { __testing } from '../src/services/feedLoader.js';

describe('withCacheBuster', () => {
  it('añade un parámetro único a la ruta del feed', () => {
    assert.equal(__testing.withCacheBuster('/feed/xataka', 1234), '/feed/xataka?t=1234');
  });

  it('usa & cuando la ruta ya lleva parámetros', () => {
    assert.equal(
      __testing.withCacheBuster('/feed/xataka?x=1', 99),
      '/feed/xataka?x=1&t=99',
    );
  });
});

describe('feedRequestUrl', () => {
  const proxyFeed = { endpoint: '/feed/xataka', url: 'https://www.xataka.com/feedburner.xml' };
  const directFeed = { ...proxyFeed, direct: true };

  it('usa la ruta same-origin con anticaché para los feeds proxificados', () => {
    assert.equal(__testing.feedRequestUrl(proxyFeed, 7), '/feed/xataka?t=7');
  });

  it('usa la URL original para los feeds con CORS', () => {
    assert.equal(
      __testing.feedRequestUrl(directFeed, 7),
      'https://www.xataka.com/feedburner.xml',
    );
  });
});
