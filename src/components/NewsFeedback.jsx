import { AlertCircle, LoaderCircle, Newspaper, SearchX } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';

/**
 * Mensajes de carga, error y lista vacía compartidos por la tabla de escritorio
 * y la lista de tarjetas del móvil.
 */
export function NewsFeedback({
  showLoading,
  showError,
  showEmpty,
  hasQuery,
  error,
  onRetry,
  loadingText = 'Consultando los feeds RSS.',
}) {
  if (showLoading) {
    return (
      <EmptyState
        icon={LoaderCircle}
        title="Cargando noticias…"
        action={<span className="spin"><LoaderCircle size={16} /></span>}
      >
        {loadingText}
      </EmptyState>
    );
  }

  if (showError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No se pudieron cargar las noticias"
        action={
          <button type="button" className="text-button" onClick={onRetry}>
            Reintentar
          </button>
        }
      >
        {error}
      </EmptyState>
    );
  }

  if (showEmpty) {
    return (
      <EmptyState
        icon={hasQuery ? SearchX : Newspaper}
        title={hasQuery ? 'Sin resultados' : 'No hay noticias en esta vista'}
      >
        {hasQuery
          ? 'Prueba con otra búsqueda o limpia el filtro.'
          : 'Las noticias aparecerán aquí en cuanto se actualicen los feeds.'}
      </EmptyState>
    );
  }

  return null;
}
