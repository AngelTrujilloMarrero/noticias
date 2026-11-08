import { useEffect } from 'react';
import { formatTabTitle } from '../utils/documentTitle.js';

/** Mantiene sincronizado el contador de no leídas con la pestaña del navegador. */
export function useUnreadTitle(unreadCount) {
  useEffect(() => {
    document.title = formatTabTitle(unreadCount);
  }, [unreadCount]);
}
