/** Columnas de la tabla de noticias que el usuario puede redimensionar. */
export const COLUMN_KEYS = ['titulo', 'autor', 'categoria', 'fuente', 'publicado'];

export const COLUMN_LABELS = {
  titulo: 'Título',
  autor: 'Autor',
  categoria: 'Categoría',
  fuente: 'Fuente',
  publicado: 'Publicado',
};

/** Anchura por defecto de las columnas fijas en la disposición ancha. */
export const DEFAULT_COLUMN_WIDTHS = {
  autor: 92,
  categoria: 86,
  fuente: 96,
  publicado: 70,
};

/** Anchura mínima de cada columna: por debajo el contenido deja de leerse. */
export const MIN_COLUMN_WIDTHS = {
  titulo: 60,
  autor: 44,
  categoria: 44,
  fuente: 44,
  publicado: 50,
  estrella: 24,
};

/** Anchura de las columnas fijas de los extremos. */
export const ESTADO_WIDTH = 20;
export const ESTRELLA_WIDTH = 24;

/** Anchura máxima de una columna, en píxeles. */
export const MAX_COLUMN_WIDTH = 1200;

/** Normaliza un ancho a un número de píxeles válido. */
export function clampColumnWidth(width, min = 0, max = MAX_COLUMN_WIDTH) {
  if (!Number.isFinite(width)) return min;
  return Math.min(max, Math.max(min, Math.round(width)));
}

/** ¿La columna tiene un ancho fijo elegido por el usuario? */
export function hasStoredWidth(stored, column) {
  return Number.isFinite(stored?.[column]);
}

/** Variables CSS para los anchos fijados a mano por el usuario. */
export function columnStyle(stored) {
  const result = {};
  if (!stored || typeof stored !== 'object') return result;
  for (const column of COLUMN_KEYS) {
    const width = stored[column];
    if (typeof width === 'number' && Number.isFinite(width)) {
      result[`--col-${column}`] = `${limitColumnWidth(column, width)}px`;
    }
  }
  return result;
}

/** Limita un ancho al intervalo permitido por su columna. */
export function limitColumnWidth(column, width) {
  const min = MIN_COLUMN_WIDTHS[column] ?? 0;
  return clampColumnWidth(width, min, MAX_COLUMN_WIDTH);
}

/**
 * Columna que absorbe el espacio sobrante de la tabla.
 * El título se estira mientras no tenga ancho propio; después el turno lo
 * asumen la columna de la fecha y, en último caso, la de la estrella.
 */
export function flexibleColumn(stored) {
  if (!hasStoredWidth(stored, 'titulo')) return 'titulo';
  if (!hasStoredWidth(stored, 'publicado')) return 'publicado';
  return 'estrella';
}

/**
 * Calcula la disposición de la tabla a partir de los anchos guardados.
 * Devuelve las variables CSS que hay que aplicar y la anchura mínima total,
 * para que la tabla haga scroll horizontal cuando no cabe en el panel.
 */
export function columnPlan(stored) {
  const flexible = flexibleColumn(stored);
  const vars = {
    '--col-estado': `${ESTADO_WIDTH}px`,
    '--col-estrella': `${ESTRELLA_WIDTH}px`,
  };
  let minWidth = ESTADO_WIDTH + ESTRELLA_WIDTH;

  for (const column of COLUMN_KEYS) {
    let min;
    if (hasStoredWidth(stored, column)) {
      vars[`--col-${column}`] = `${limitColumnWidth(column, stored[column])}px`;
      min = limitColumnWidth(column, stored[column]);
    } else if (column === flexible) {
      const floor = column === 'titulo' ? 0 : MIN_COLUMN_WIDTHS[column];
      vars[`--col-${column}`] = `minmax(${floor}px, 1fr)`;
      min = floor;
    } else {
      min = DEFAULT_COLUMN_WIDTHS[column] ?? 0;
    }
    minWidth += min;
  }

  if (flexible === 'estrella') {
    vars['--col-estrella'] = `minmax(${MIN_COLUMN_WIDTHS.estrella}px, 1fr)`;
  }

  return { vars, minWidth, flexible };
}

/** Clase del panel según la columna que absorbe el sobrante. */
export function layoutClass(stored) {
  const flexible = flexibleColumn(stored);
  if (flexible === 'publicado') return 'news-panel--flex-fecha';
  if (flexible === 'estrella') return 'news-panel--flex-estrella';
  return '';
}
