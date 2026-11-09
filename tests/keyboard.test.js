import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isTypingTarget, navigationDirection } from '../src/utils/keyboard.js';

function keyEvent(key, overrides = {}) {
  return {
    key,
    defaultPrevented: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: { tagName: 'BODY', isContentEditable: false },
    ...overrides,
  };
}

describe('navegación con flechas', () => {
  it('traduce ↓ y ↑ a siguiente y anterior', () => {
    assert.equal(navigationDirection(keyEvent('ArrowDown')), 'next');
    assert.equal(navigationDirection(keyEvent('ArrowUp')), 'previous');
  });

  it('ignora otras teclas y los eventos ya gestionados', () => {
    assert.equal(navigationDirection(keyEvent('Enter')), null);
    assert.equal(navigationDirection(keyEvent('ArrowDown', { defaultPrevented: true })), null);
  });

  it('ignora los modificadores para no pisar atajos del navegador', () => {
    assert.equal(navigationDirection(keyEvent('ArrowDown', { ctrlKey: true })), null);
    assert.equal(navigationDirection(keyEvent('ArrowDown', { metaKey: true })), null);
    assert.equal(navigationDirection(keyEvent('ArrowDown', { altKey: true })), null);
  });

  it('no navega mientras se escribe en un campo', () => {
    for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
      assert.equal(navigationDirection(keyEvent('ArrowDown', { target: { tagName } })), null);
    }
    assert.equal(
      navigationDirection(keyEvent('ArrowDown', { target: { tagName: 'DIV', isContentEditable: true } })),
      null,
    );
  });

  it('detecta campos editables', () => {
    assert.equal(isTypingTarget({ tagName: 'INPUT' }), true);
    assert.equal(isTypingTarget({ tagName: 'DIV', isContentEditable: true }), true);
    assert.equal(isTypingTarget({ tagName: 'DIV' }), false);
    assert.equal(isTypingTarget(null), false);
  });
});
