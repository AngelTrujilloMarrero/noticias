import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState.js';

const THEME_KEY = 'noticias:tema';

/** Tema visual del escritorio; el móvil conserva siempre la interfaz clara. */
export function useTheme() {
  const [stored, setStored] = usePersistentState(THEME_KEY, 'light');
  const theme = stored === 'dark' ? 'dark' : 'light';
  const toggleTheme = useCallback(() => {
    setStored(theme === 'dark' ? 'light' : 'dark');
  }, [setStored, theme]);

  return [theme, toggleTheme];
}
