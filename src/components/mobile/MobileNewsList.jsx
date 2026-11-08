import { useEffect, useRef } from 'react';
import { NewsFeedback } from '../NewsFeedback.jsx';
import { MobileNewsCard } from './MobileNewsCard.jsx';

/** Lista de tarjetas del móvil; comparte los estados vacíos con el escritorio. */
export function MobileNewsList({
  articles,
  selectedId,
  readIds,
  starredIds,
  loading,
  error,
  hasQuery,
  onOpenArticle,
  onToggleRead,
  onToggleStar,
  onOpen,
  onRetry,
}) {
  const listRef = useRef(null);
  const showLoading = loading && articles.length === 0;
  const showError = !loading && Boolean(error) && articles.length === 0;
  const showEmpty = !showLoading && !showError && articles.length === 0;

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const card = listRef.current.querySelector(`[data-id="${CSS.escape(selectedId)}"]`);
    card?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  return (
    <section className="m-list" aria-label="Lista de noticias" ref={listRef}>
      <NewsFeedback
        showLoading={showLoading}
        showError={showError}
        showEmpty={showEmpty}
        hasQuery={hasQuery}
        error={error}
        onRetry={onRetry}
      />

      {!showLoading && !showError
        ? articles.map((article) => (
            <MobileNewsCard
              key={article.id}
              article={article}
              read={readIds.has(article.id)}
              starred={starredIds.has(article.id)}
              onOpenArticle={onOpenArticle}
              onToggleRead={onToggleRead}
              onToggleStar={onToggleStar}
              onOpen={onOpen}
            />
          ))
        : null}
    </section>
  );
}
