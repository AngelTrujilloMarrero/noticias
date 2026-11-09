import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { extractArticleContent } from '../src/services/articleLoader.js';

const ELDIA_BASE = 'https://www.eldia.es/islas/2026/11/09/noticia.html';

test('extrae párrafos y subtítulos de eldia y descarta bloques ajenos', () => {
  const { document } = parseHTML(`
    <article>
      <p class="ft-text">Primer párrafo con <a href="/otra">enlace</a>.</p>
      <aside class="ft-ad">Publicidad</aside>
      <h3 class="ft-helper-fontSize-heading-XS">Subtítulo</h3>
      <p class="ft-text">Segundo párrafo.</p>
      <div class="_mo_recs_tpi">
        <h3 class="ft-helper-fontSize-heading-XS">Noticia relacionada</h3>
      </div>
      <p class="subscribeHideForDisplay">Suscríbete para seguir leyendo</p>
      <script>alert(1)</script>
    </article>
  `);

  const content = extractArticleContent(
    document,
    {
      selector: 'p.ft-text, h3.ft-helper-fontSize-heading-XS',
      exclude: 'aside, ._mo_recs_tpi, .ft-mol-modNews, .closedContent, .subscribeHideForDisplay',
    },
    ELDIA_BASE,
  );

  assert.match(content, /Primer párrafo/);
  assert.match(content, /Segundo párrafo/);
  assert.match(content, /Subtítulo/);
  assert.match(content, /href="https:\/\/www\.eldia\.es\/otra"/);
  assert.doesNotMatch(content, /Publicidad/);
  assert.doesNotMatch(content, /Noticia relacionada/);
  assert.doesNotMatch(content, /Suscríbete/);
  assert.doesNotMatch(content, /alert/);
});

test('usa el contenedor configurado y elimina el ruido y la imagen de cabecera', () => {
  const { document } = parseHTML(`
    <div class="art-PostContent">
      <p><img src="/cabecera.jpg" alt=""></p>
      <p>Texto del artículo.</p>
      <aside>Ruido</aside>
    </div>
  `);

  const content = extractArticleContent(
    document,
    { container: '.art-PostContent', remove: ['aside'], removeLeadImage: true },
    'https://blog.elhacker.net/2026/11/noticia.html',
  );

  assert.match(content, /Texto del artículo/);
  assert.doesNotMatch(content, /cabecera/);
  assert.doesNotMatch(content, /Ruido/);
});

test('usa el contenedor alternativo cuando falta el de escritorio', () => {
  const { document } = parseHTML(`
    <div class="post-body entry-content">
      <p><img src="/foto.jpg" alt=""></p>
      <p>Texto de la plantilla móvil de Blogger.</p>
    </div>
  `);

  const content = extractArticleContent(
    document,
    { container: ['.art-PostContent', '.post-body'], removeLeadImage: true },
    'https://blog.elhacker.net/2026/11/noticia.html',
  );

  assert.match(content, /plantilla móvil de Blogger/);
  assert.doesNotMatch(content, /foto\.jpg/);
});

test('devuelve una cadena vacía si no hay contenedor ni selector', () => {
  const { document } = parseHTML('<p>Hola</p>');
  assert.equal(extractArticleContent(document, {}, ELDIA_BASE), '');
  assert.equal(extractArticleContent(null, { selector: 'p' }, ELDIA_BASE), '');
});
