const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** En la lista se muestra solo la hora si la noticia es de hoy. */
export function formatNewsDate(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return '';
  if (isSameDay(date, now)) return timeFormatter.format(date);
  return shortDateFormatter.format(date);
}

export function formatClock(value) {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : '—';
}

export function formatLongDate(value) {
  const date = toDate(value);
  return date ? longDateFormatter.format(date) : 'Fecha desconocida';
}
