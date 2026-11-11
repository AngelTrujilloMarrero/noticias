import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fetchFeedXml, resolveFeedRequest } from '../server/lib/feedProxy.js';

const RSS = '<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>';

describe('resolveFeedRequest', () => {
  it('resuelve la ruta principal de un feed', () => {
    const request = resolveFeedRequest('/feed/midudev');
    assert.equal(request.feed.id, 'midudev');
    assert.equal(request.index, null);
  });

  it('resuelve la ruta de un espejo', () => {
    const request = resolveFeedRequest('/feed/midudev/1');
    assert.equal(request.feed.id, 'midudev');
    assert.equal(request.index, 1);
    assert.match(request.urls[1], /\/midudev\/rss$/);
  });

  it('ignora las rutas que no son de feed', () => {
    assert.equal(resolveFeedRequest('/'), null);
    assert.equal(resolveFeedRequest('/elespanol/noticia.html'), null);
  });

  it('devuelve un feed inexistente para responder con 404', () => {
    assert.equal(resolveFeedRequest('/feed/inventado').feed, null);
    assert.equal(resolveFeedRequest('/feed/midudev/99').feed, null);
  });
});

describe('fetchFeedXml', () => {
  it('prueba los espejos en orden hasta encontrar un feed', async () => {
    const calls = [];
    const download = async (url) => {
      calls.push(url);
      if (calls.length === 1) throw new Error('sin conexión');
      return RSS;
    };

    const feed = resolveFeedRequest('/feed/midudev').feed;
    assert.equal(await fetchFeedXml(feed, { fetchText: download }), RSS);
    assert.equal(calls.length, 2);
  });

  it('descarta las respuestas que no son un feed', async () => {
    const download = async (url) => (url.includes('ip6arpa') ? '<html>bot</html>' : RSS);

    const feed = resolveFeedRequest('/feed/midudev').feed;
    assert.equal(await fetchFeedXml(feed, { fetchText: download }), RSS);
  });

  it('descarga solo el espejo indicado', async () => {
    const calls = [];
    const download = async (url) => {
      calls.push(url);
      return RSS;
    };

    const feed = resolveFeedRequest('/feed/midudev').feed;
    await fetchFeedXml(feed, { index: 2, fetchText: download });

    assert.equal(calls.length, 1);
    assert.match(calls[0], /jaydenha/);
  });
});
