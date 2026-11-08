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
