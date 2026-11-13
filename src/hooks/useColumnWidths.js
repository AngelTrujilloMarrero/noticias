import { useCallback, useMemo } from 'react';
import { usePersistentState } from './usePersistentState.js';
import { COLUMN_KEYS, limitColumnWidth } from '../utils/columns.js';

const STORAGE_KEY = 'noticias:columnas';

/**
 * Anchos de las columnas de la tabla, guardados en el navegador.
 * Solo se guardan las columnas que el usuario ha ajustado a mano.
 */
export function useColumnWidths() {
  const [stored, setStored] = usePersistentState(STORAGE_KEY, {});

  const widths = useMemo(() => {
    const result = {};
    if (!stored || typeof stored !== 'object') return result;
    for (const column of COLUMN_KEYS) {
      const width = stored[column];
      if (typeof width === 'number' && Number.isFinite(width)) {
        result[column] = limitColumnWidth(column, width);
      }
    }
    return result;
  }, [stored]);

  const setColumnWidth = useCallback(
    (column, width) => {
      const value = limitColumnWidth(column, width);
      setStored((previous) => ({ ...(previous || {}), [column]: value }));
    },
    [setStored],
  );

  const resetColumn = useCallback(
    (column) => {
      setStored((previous) => {
        if (!previous || !(column in previous)) return previous;
        const next = { ...previous };
        delete next[column];
        return next;
      });
    },
    [setStored],
  );

  const resetColumns = useCallback(() => setStored({}), [setStored]);

  const hasCustomWidths = Object.keys(widths).length > 0;

  return { widths, setColumnWidth, resetColumn, resetColumns, hasCustomWidths };
}
