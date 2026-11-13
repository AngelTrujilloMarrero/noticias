import { useCallback, useEffect, useRef, useState } from 'react';
import { NewsFeedback } from './NewsFeedback.jsx';
import { NewsHeader } from './NewsHeader.jsx';
import { NewsRow } from './NewsRow.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { columnPlan, layoutClass, limitColumnWidth } from '../utils/columns.js';

export function NewsList({
  articles,
  selectedId,
  readIds,
  starredIds,
  loading,
  error,
  hasQuery,
  columnWidths,
  onColumnResize,
  onColumnReset,
  onSelect,
  onMarkRead,
  onToggleRead,
  onToggleStar,
  onRetry,
}) {
  const bodyRef = useRef(null);
  const headerRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const wide = useMediaQuery('(min-width: 901px)');

  useEffect(() => {
    if (!selectedId || !bodyRef.current) return;
    const row = bodyRef.current.querySelector(`[data-id="${CSS.escape(selectedId)}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const applied = wide ? columnWidths : undefined;
  const plan = columnPlan(applied);
  const panelClass = ['news-panel', layoutClass(applied), resizing ? 'is-resizing' : '']
    .filter(Boolean)
    .join(' ');

  const handleResizeStart = useCallback(() => {
    setResizing(true);
  }, []);

  const handleResize = useCallback(
    (column, width) => {
      onColumnResize(column, limitColumnWidth(column, width));
    },
    [onColumnResize],
  );

  const handleResizeEnd = useCallback(() => {
    setResizing(false);
  }, []);

  const handleReset = useCallback(
    (column) => {
      onColumnReset(column);
    },
    [onColumnReset],
  );

  const showLoading = loading && articles.length === 0;
  const showError = !loading && Boolean(error) && articles.length === 0;

  return (
    <section
      className={panelClass}
      style={wide ? { ...plan.vars, '--news-min-width': `${plan.minWidth}px` } : undefined}
      aria-label="Lista de noticias"
    >
      <div className="news-body" ref={bodyRef} role="rowgroup">
        <NewsHeader
          headerRef={headerRef}
          columnWidths={applied}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onReset={handleReset}
        />

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
              />
            ))
          : null}
      </div>
    </section>
  );
}
