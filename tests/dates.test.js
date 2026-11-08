import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatClock, formatLongDate, formatNewsDate } from '../src/utils/dates.js';

const now = new Date('2026-11-08T12:30:00');

describe('formatNewsDate', () => {
  it('muestra solo la hora para noticias de hoy', () => {
    assert.equal(formatNewsDate('2026-11-08T09:05:00', now), '09:05');
  });

  it('muestra la fecha corta para otros días', () => {
    assert.equal(formatNewsDate('2026-11-06T09:05:00', now), '06/11/26');
  });

  it('devuelve vacío para fechas inválidas', () => {
    assert.equal(formatNewsDate('no es una fecha', now), '');
    assert.equal(formatNewsDate(null, now), '');
  });
});

describe('formatClock', () => {
  it('formatea la hora y usa un guion para valores inválidos', () => {
    assert.equal(formatClock('2026-11-08T23:59:00'), '23:59');
    assert.equal(formatClock(undefined), '—');
  });
});

describe('formatLongDate', () => {
  it('incluye día, mes y hora', () => {
    const result = formatLongDate('2026-11-06T09:05:00');
    assert.match(result, /06/);
    assert.match(result, /nov/);
    assert.match(result, /09:05/);
  });

  it('señala fechas desconocidas', () => {
    assert.equal(formatLongDate('invalid'), 'Fecha desconocida');
  });
});
