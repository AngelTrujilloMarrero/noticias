import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildArticleDocument } from '../src/utils/articleDoc.js';

describe('buildArticleDocument', () => {
  it('genera un documento completo con base y contenido', () => {
    const document = buildArticleDocument({
      title: 'Título <con> caracteres',
      link: 'https://example.com/noticia?a=1&b=2',
      content: '<p>Contenido</p>',
    });

    assert.match(document, /^<!doctype html>/);
    assert.match(document, /<title>Título &lt;con&gt; caracteres<\/title>/);
    assert.match(document, /<base href="https:\/\/example\.com\/noticia\?a=1&amp;b=2" target="_blank">/);
    assert.match(document, /<p>Contenido<\/p>/);
  });

  it('usa el resumen cuando no hay contenido y escapa el texto', () => {
    const document = buildArticleDocument({
      title: 'Noticia',
      link: 'https://example.com/',
      summary: 'Resumen con <b>etiquetas</b>',
    });

    assert.match(document, /<p>Resumen con &lt;b&gt;etiquetas&lt;\/b&gt;<\/p>/);
  });

  it('devuelve una cadena vacía sin artículo', () => {
    assert.equal(buildArticleDocument(null), '');
  });

  it('adapta el contenido a la lectura en móvil', () => {
    const document = buildArticleDocument(
      { title: 'Noticia', link: 'https://example.com/', content: '<p>Texto</p>' },
      { mobile: true },
    );

    assert.match(document, /padding: 14px 16px 40px/);
    assert.match(document, /font-size: 16px/);
  });
});
