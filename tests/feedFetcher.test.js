import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import {
  feedRequestUrls,
  fetchFeedXml,
  looksLikeFeed,
  withCacheBuster,
} from '../src/services/feedFetcher.js';

const RSS = '<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>';

function response(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
  return { ok, status, statusText, text: async () => body };
}

describe('withCacheBuster', () => {
  it('añade un parámetro único a la ruta del feed', () => {
    assert.equal(withCacheBuster('/feed/xataka', 1234), '/feed/xataka?t=1234');
  });

  it('usa & cuando la ruta ya lleva parámetros', () => {
    assert.equal(
      withCacheBuster('/feed/xataka?x=1', 99),
      '/feed/xataka?x=1&t=99',
    );
  });
});

describe('feedRequestUrls', () => {
  const proxyFeed = {
    endpoint: '/feed/xataka',
    endpoints: ['/feed/xataka'],
    url: 'https://www.xataka.com/feedburner.xml',
  };
  const directFeed = { ...proxyFeed, direct: true };

  it('usa la ruta same-origin con anticaché para los feeds proxificados', () => {
    assert.deepEqual(feedRequestUrls(proxyFeed, 7), ['/feed/xataka?t=7']);
  });

  it('usa la URL original para los feeds con CORS', () => {
    assert.deepEqual(feedRequestUrls(directFeed, 7), [
      'https://www.xataka.com/feedburner.xml',
    ]);
  });

  it('enumera la ruta principal y las de los espejos', () => {
    const feed = {
      endpoint: '/feed/midudev',
      endpoints: ['/feed/midudev', '/feed/midudev/1', '/feed/midudev/2'],
      url: 'https://a.example/rss',
    };

    assert.deepEqual(feedRequestUrls(feed, 5), [
      '/feed/midudev?t=5',
      '/feed/midudev/1?t=5',
      '/feed/midudev/2?t=5',
    ]);
  });
});

describe('looksLikeFeed', () => {
  it('acepta RSS y Atom', () => {
    assert.equal(looksLikeFeed('<rss version="2.0">'), true);
    assert.equal(looksLikeFeed('<feed xmlns="http://www.w3.org/2005/Atom">'), true);
  });

  it('descarta las páginas de protección anti-bot', () => {
    assert.equal(looksLikeFeed('<html><body>Making sure you\'re not a bot!</body></html>'), false);
    assert.equal(looksLikeFeed(''), false);
  });
});

describe('fetchFeedXml', () => {
  it('prueba el siguiente espejo cuando el principal falla', async () => {
    const calls = [];
    mock.method(globalThis, 'fetch', async (url) => {
      calls.push(url);
      if (url.startsWith('/feed/midudev?')) {
        return response('error', { ok: false, status: 500, statusText: 'Server Error' });
      }
      return response(RSS);
    });

    const feed = {
      endpoint: '/feed/midudev',
      endpoints: ['/feed/midudev', '/feed/midudev/1'],
      url: 'https://a.example/rss',
    };

    const xml = await fetchFeedXml(feed, { now: 1, retryDelayMs: 0 });

    assert.equal(xml, RSS);
    assert.deepEqual(calls, ['/feed/midudev?t=1', '/feed/midudev/1?t=1']);
  });

  it('descarta un espejo que devuelve HTML en lugar de un feed', async () => {
    const calls = [];
    mock.method(globalThis, 'fetch', async (url) => {
      calls.push(url);
      if (url.startsWith('/feed/midudev?')) {
        return response('<html><body>not a bot!</body></html>');
      }
      return response(RSS);
    });

    const feed = {
      endpoint: '/feed/midudev',
      endpoints: ['/feed/midudev', '/feed/midudev/1'],
      url: 'https://a.example/rss',
    };

    assert.equal(await fetchFeedXml(feed, { now: 1, retryDelayMs: 0 }), RSS);
    assert.equal(calls.length, 2);
  });

  it('falla cuando ningún espejo responde', async () => {
    mock.method(globalThis, 'fetch', async () => response('error', { ok: false, status: 503 }));

    const feed = {
      endpoint: '/feed/midudev',
      endpoints: ['/feed/midudev', '/feed/midudev/1'],
      url: 'https://a.example/rss',
    };

    await assert.rejects(() => fetchFeedXml(feed, { now: 1, retryDelayMs: 0 }), /HTTP 503/);
  });

  it('reintenta la misma ruta cuando la fuente no tiene espejos', async () => {
    const calls = [];
    mock.method(globalThis, 'fetch', async (url) => {
      calls.push(url);
      return response(RSS);
    });

    const feed = {
      endpoint: '/feed/xataka',
      endpoints: ['/feed/xataka'],
      url: 'https://www.xataka.com/feedburner.xml',
    };

    assert.equal(await fetchFeedXml(feed, { now: 1, retryDelayMs: 0 }), RSS);
    assert.deepEqual(calls, ['/feed/xataka?t=1']);
  });
});
