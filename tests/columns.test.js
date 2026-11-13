import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTHS,
  columnPlan,
  flexibleColumn,
  hasStoredWidth,
  layoutClass,
  limitColumnWidth,
} from '../src/utils/columns.js';

describe('limitColumnWidth', () => {
  it('aplica el mínimo de cada columna', () => {
    assert.equal(limitColumnWidth('titulo', 10), MIN_COLUMN_WIDTHS.titulo);
    assert.equal(limitColumnWidth('autor', 10), MIN_COLUMN_WIDTHS.autor);
    assert.equal(limitColumnWidth('publicado', 10000), MAX_COLUMN_WIDTH);
  });

  it('normaliza valores inválidos', () => {
    assert.equal(limitColumnWidth('autor', Number.NaN), 44);
  });
});

describe('hasStoredWidth', () => {
  it('detecta anchos guardados', () => {
    assert.equal(hasStoredWidth({ autor: 140 }, 'autor'), true);
    assert.equal(hasStoredWidth({ autor: 140 }, 'titulo'), false);
    assert.equal(hasStoredWidth(undefined, 'autor'), false);
  });
});

describe('flexibleColumn', () => {
  it('elige el título por defecto', () => {
    assert.equal(flexibleColumn({}), 'titulo');
    assert.equal(flexibleColumn(undefined), 'titulo');
  });

  it('pasa a la fecha cuando el título está fijado', () => {
    assert.equal(flexibleColumn({ titulo: 500 }), 'publicado');
  });

  it('pasa a la estrella cuando ambos están fijados', () => {
    assert.equal(flexibleColumn({ titulo: 500, publicado: 90 }), 'estrella');
  });
});

describe('columnPlan', () => {
  it('deja el título flexible por defecto', () => {
    const plan = columnPlan({});
    assert.equal(plan.vars['--col-titulo'], 'minmax(0px, 1fr)');
    assert.equal(plan.flexible, 'titulo');
  });

  it('fija el título y hace flexible la fecha cuando se da un ancho al título', () => {
    const plan = columnPlan({ titulo: 500 });
    assert.equal(plan.vars['--col-titulo'], '500px');
    assert.equal(plan.vars['--col-publicado'], 'minmax(50px, 1fr)');
    assert.equal(plan.flexible, 'publicado');
  });

  it('hace flexible la estrella cuando el título y la fecha están fijos', () => {
    const plan = columnPlan({ titulo: 500, publicado: 90 });
    assert.equal(plan.vars['--col-estrella'], 'minmax(24px, 1fr)');
    assert.equal(plan.flexible, 'estrella');
  });

  it('no incluye las columnas sin ancho propio', () => {
    const plan = columnPlan({});
    assert.equal(plan.vars['--col-autor'], undefined);
  });
});

describe('layoutClass', () => {
  it('añade la clase adecuada según el modo', () => {
    assert.equal(layoutClass({ titulo: 500 }), 'news-panel--flex-fecha');
    assert.equal(layoutClass({ titulo: 500, publicado: 90 }), 'news-panel--flex-estrella');
    assert.equal(layoutClass({}), '');
  });
});
