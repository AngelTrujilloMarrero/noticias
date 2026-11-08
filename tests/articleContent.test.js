import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DOMParser } from 'linkedom';
import { removeLeadImage } from '../src/utils/articleContent.js';

function parse(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('removeLeadImage', () => {
  it('quita la primera imagen y su enlace vacío', () => {
    const document = parse(
      '<div class="art-PostContent"><p>Resumen</p><p class="imagen"><a href="https://example.com"><img src="https://example.com/hero.webp" alt="Portada"></a></p><p>Texto extendido</p></div>',
    );
    const container = document.querySelector('.art-PostContent');

    removeLeadImage(container);

    assert.equal(container.querySelector('img'), null);
    assert.equal(container.querySelector('a'), null);
    assert.match(container.innerHTML, /Resumen/);
    assert.match(container.innerHTML, /Texto extendido/);
  });

  it('conserva las imágenes posteriores y el texto', () => {
    const document = parse(
      '<div class="art-PostContent"><p><img src="https://example.com/hero.webp" alt=""></p><p>Texto</p><p><img src="https://example.com/detalle.webp" alt="Detalle"></p></div>',
    );
    const container = document.querySelector('.art-PostContent');

    removeLeadImage(container);

    const images = container.querySelectorAll('img');
    assert.equal(images.length, 1);
    assert.equal(images[0].getAttribute('src'), 'https://example.com/detalle.webp');
    assert.match(container.innerHTML, /Texto/);
  });

  it('no elimina el contenedor completo ni el texto', () => {
    const document = parse('<div class="art-PostContent"><img src="https://example.com/hero.webp" alt="">Texto suelto</div>');
    const container = document.querySelector('.art-PostContent');

    removeLeadImage(container);

    assert.equal(container.querySelector('img'), null);
    assert.match(container.innerHTML, /Texto suelto/);
  });

  it('no falla sin contenedor ni sin imágenes', () => {
    assert.doesNotThrow(() => removeLeadImage(null));
    const document = parse('<div class="art-PostContent"><p>Sin imágenes</p></div>');
    const container = document.querySelector('.art-PostContent');

    removeLeadImage(container);

    assert.match(container.innerHTML, /Sin imágenes/);
  });
});
