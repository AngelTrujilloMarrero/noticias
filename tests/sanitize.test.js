import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  escapeHtml,
  extractFirstImage,
  htmlToText,
  sanitizeArticleHtml,
} from '../src/utils/sanitize.js';

describe('sanitizeArticleHtml', () => {
  it('elimina scripts, estilos y atributos peligrosos', () => {
    const html =
      '<p onclick="alert(1)">Hola</p><script>alert(2)</script><style>p{}</style>' +
      '<iframe src="https://example.com"></iframe>';
    const result = sanitizeArticleHtml(html, 'https://example.com/noticia');
    assert.equal(result.includes('<script'), false);
    assert.equal(result.includes('onclick'), false);
    assert.equal(result.includes('<style'), false);
    assert.equal(result.includes('<iframe'), false);
    assert.equal(result, '<p>Hola</p>');
  });

  it('resuelve enlaces e imágenes relativos y añade seguridad', () => {
    const result = sanitizeArticleHtml(
      '<a href="/otra">Ir</a><img src="foto.jpg" alt="Foto">',
      'https://example.com/seccion/noticia',
    );
    assert.match(result, /href="https:\/\/example\.com\/otra"/);
    assert.match(result, /target="_blank"/);
    assert.match(result, /rel="noopener noreferrer"/);
    assert.match(result, /src="https:\/\/example\.com\/seccion\/foto\.jpg"/);
    assert.match(result, /loading="lazy"/);
  });

  it('fuerza https en las imágenes y vídeos para evitar contenido mixto', () => {
    const result = sanitizeArticleHtml(
      '<img src="http://example.com/a.jpg" alt="Foto">' +
        '<video src="http://example.com/v.mp4" poster="http://example.com/p.jpg" controls></video>',
      'https://example.com/',
    );

    assert.match(result, /src="https:\/\/example\.com\/a\.jpg"/);
    assert.match(result, /src="https:\/\/example\.com\/v\.mp4"/);
    assert.match(result, /poster="https:\/\/example\.com\/p\.jpg"/);
    assert.match(result, /controls/);
  });

  it('descarta enlaces con esquemas no permitidos', () => {
    const result = sanitizeArticleHtml(
      '<a href="javascript:alert(1)">Pulsa</a>',
      'https://example.com/',
    );
    assert.equal(result.includes('javascript:'), false);
  });
});

describe('utilidades de texto', () => {
  it('convierte HTML en texto plano', () => {
    assert.equal(htmlToText('<p>Hola <strong>mundo</strong></p>'), 'Hola mundo');
  });

  it('extrae la primera imagen', () => {
    assert.equal(
      extractFirstImage('<p>x</p><img src="https://example.com/a.jpg" alt="">'),
      'https://example.com/a.jpg',
    );
    assert.equal(extractFirstImage('<p>sin imagen</p>'), '');
  });

  it('escapa caracteres HTML', () => {
    assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});
