import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DOMParser } from 'linkedom';
import { parseFeedXml } from '../src/services/parseFeed.js';

const feed = {
  id: 'demo',
  name: 'Demo',
  url: 'https://example.com/feed.xml',
  siteUrl: 'https://example.com',
};

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Demo Noticias</title>
    <link>https://example.com/portada</link>
    <image><url>https://example.com/logo.png</url></image>
    <item>
      <title>Noticia &lt;principal&gt;</title>
      <link>https://example.com/noticia/1</link>
      <guid>noticia-1</guid>
      <pubDate>Sun, 08 Nov 2026 10:00:00 GMT</pubDate>
      <dc:creator>Ana Pérez</dc:creator>
      <category>Actualidad</category>
      <category>Tenerife</category>
      <description><![CDATA[<p>Resumen con <a href="/detalle">enlace</a>.</p>]]></description>
      <content:encoded><![CDATA[
        <p onclick="alert(1)">Contenido <a href="/detalle">completo</a>.</p>
        <script>alert(2)</script>
        <img src="/foto.jpg" alt="Foto">
      ]]></content:encoded>
    </item>
  </channel>
</rss>`;

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Demo</title>
  <link rel="alternate" href="https://atom.example.com"/>
  <icon>https://atom.example.com/icon.png</icon>
  <entry>
    <title>Entrada Atom</title>
    <link rel="alternate" href="https://atom.example.com/entrada"/>
    <id>tag:atom.example.com,2026:1</id>
    <updated>2026-11-08T09:30:00Z</updated>
    <author><name>Luis Gómez</name></author>
    <category term="Software"/>
    <content type="html">&lt;p&gt;Texto &lt;em&gt;rico&lt;/em&gt;.&lt;/p&gt;</content>
  </entry>
</feed>`;

function parse(xml, options = {}) {
  return parseFeedXml(xml, feed, { domParser: DOMParser, ...options });
}

describe('parseFeedXml', () => {
  it('normaliza un RSS con contenido saneado y URLs resueltas', () => {
    const result = parse(rss, { fetchedAt: '2026-11-08T10:05:00.000Z' });
    assert.equal(result.feed.name, 'Demo Noticias');
    assert.equal(result.feed.siteUrl, 'https://example.com/portada');
    assert.equal(result.feed.image, 'https://example.com/logo.png');
    assert.equal(result.articles.length, 1);

    const [article] = result.articles;
    assert.equal(article.title, 'Noticia <principal>');
    assert.equal(article.link, 'https://example.com/noticia/1');
    assert.equal(article.author, 'Ana Pérez');
    assert.equal(article.published, '2026-11-08T10:00:00.000Z');
    assert.deepEqual(article.categories, ['Actualidad', 'Tenerife']);
    assert.equal(article.content.includes('onclick'), false);
    assert.equal(article.content.includes('<script'), false);
    assert.equal(
      article.content.includes('href="https://example.com/detalle"'),
      true,
    );
    assert.equal(article.content.includes('src="https://example.com/foto.jpg"'), true);
    assert.equal(article.image, 'https://example.com/foto.jpg');
    assert.equal(article.summary, 'Contenido completo.');
  });

  it('normaliza Atom con enlaces, autor y fechas', () => {
    const result = parse(atom);
    const [article] = result.articles;

    assert.equal(result.feed.name, 'Atom Demo');
    assert.equal(result.feed.siteUrl, 'https://atom.example.com');
    assert.equal(result.feed.image, 'https://atom.example.com/icon.png');
    assert.equal(article.link, 'https://atom.example.com/entrada');
    assert.equal(article.author, 'Luis Gómez');
    assert.equal(article.published, '2026-11-08T09:30:00.000Z');
    assert.deepEqual(article.categories, ['Software']);
    assert.equal(article.content, '<p>Texto <em>rico</em>.</p>');
  });

  it('genera identificadores estables para la misma noticia', () => {
    const first = parse(rss).articles[0];
    const second = parse(rss).articles[0];
    assert.equal(first.id, second.id);
    assert.notEqual(first.id, parse(atom).articles[0].id);
  });

  it('devuelve una lista vacía para un XML sin noticias', () => {
    assert.deepEqual(parse('<rss><channel><title>Vacío</title></channel></rss>').articles, []);
  });
});
