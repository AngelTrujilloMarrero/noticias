import { useEffect, useRef } from 'react';
import { NewsFeedback } from './NewsFeedback.jsx';
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
  onMarkRead,
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

  const showLoading = loading && articles.length === 0;
  const showError = !loading && Boolean(error) && articles.length === 0;

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
          <span className="news-head-cell news-head-source" role="columnheader">
            Fuente
          </span>
          <span className="news-head-cell news-head-date" role="columnheader">
            Publicado
          </span>
          <span className="news-head-cell news-head-star" role="columnheader" />
        </div>

        <NewsFeedback
          showLoading={showLoading}
          showError={showError}
          showEmpty={!showLoading && !showError && articles.length === 0}
          hasQuery={hasQuery}
          error={error}
          onRetry={onRetry}
        />

        {!showLoading && !showError
          ? articles.map((article) => (
              <NewsRow
                key={article.id}
                article={article}
                selected={article.id === selectedId}
                read={readIds.has(article.id)}
                starred={starredIds.has(article.id)}
                onSelect={onSelect}
                onMarkRead={onMarkRead}
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
