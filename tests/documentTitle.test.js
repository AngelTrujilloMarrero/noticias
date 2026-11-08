import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BASE_TITLE, formatTabTitle } from '../src/utils/documentTitle.js';

describe('formatTabTitle', () => {
  it('antepone el número de no leídas entre paréntesis', () => {
    assert.equal(formatTabTitle(12), `(12) ${BASE_TITLE}`);
  });

  it('deja el título base cuando no hay no leídas', () => {
    assert.equal(formatTabTitle(0), BASE_TITLE);
  });

  it('normaliza valores negativos o no numéricos', () => {
    assert.equal(formatTabTitle(-3), BASE_TITLE);
    assert.equal(formatTabTitle(undefined), BASE_TITLE);
    assert.equal(formatTabTitle(4.9), `(4) ${BASE_TITLE}`);
  });
});
