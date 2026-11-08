import { useEffect, useRef } from 'react';
import { AlertCircle, LoaderCircle, Newspaper, SearchX } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';
import { NewsRow } from './NewsRow.jsx';

export function NewsList({
  articles,
  selectedId,
  readIds,
  starredIds,
  loading,
  error,
  hasQuery,
  onSelect,
  onToggleRead,
  onToggleStar,
  onOpen,
  onRetry,
}) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!selectedId || !bodyRef.current) return;
    const row = bodyRef.current.querySelector(`[data-id="${CSS.escape(selectedId)}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const showInitialLoading = loading && articles.length === 0;
  const showError = !loading && error && articles.length === 0;

  return (
    <section className="news-panel" aria-label="Lista de noticias">
      <div className="news-body" ref={bodyRef} role="rowgroup">
        <div className="news-header" role="row">
          <span className="news-head-cell news-head-state" role="columnheader" />
          <span className="news-head-cell" role="columnheader">
            Título
          </span>
          <span className="news-head-cell news-head-author" role="columnheader">
            Autor
          </span>
          <span className="news-head-cell news-head-category" role="columnheader">
            Categoría
          </span>
          <span className="news-head-cell news-head-date" role="columnheader">
            Publicado
          </span>
          <span className="news-head-cell news-head-star" role="columnheader" />
        </div>

        {showInitialLoading ? (
          <EmptyState
            icon={LoaderCircle}
            title="Cargando noticias…"
            action={<span className="spin"><LoaderCircle size={16} /></span>}
          >
            Consultando los feeds RSS.
          </EmptyState>
        ) : null}

        {showError ? (
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
        ) : null}

        {!showInitialLoading && !showError && articles.length === 0 ? (
          <EmptyState
            icon={hasQuery ? SearchX : Newspaper}
            title={hasQuery ? 'Sin resultados' : 'No hay noticias en esta vista'}
          >
            {hasQuery
              ? 'Prueba con otra búsqueda o limpia el filtro.'
              : 'Las noticias aparecerán aquí en cuanto se actualicen los feeds.'}
          </EmptyState>
        ) : null}

        {!showInitialLoading && !showError
          ? articles.map((article) => (
              <NewsRow
                key={article.id}
                article={article}
                selected={article.id === selectedId}
                read={readIds.has(article.id)}
                starred={starredIds.has(article.id)}
                onSelect={onSelect}
                onToggleRead={onToggleRead}
                onToggleStar={onToggleStar}
                onOpen={onOpen}
              />
            ))
          : null}
      </div>
    </section>
  );
}
