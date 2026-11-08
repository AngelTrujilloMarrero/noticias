import { useEffect, useState } from 'react';
import { StatusBar } from '../StatusBar.jsx';
import { FeedDrawer } from './FeedDrawer.jsx';
import { MobileArticle } from './MobileArticle.jsx';
import { MobileHeader } from './MobileHeader.jsx';
import { MobileNewsList } from './MobileNewsList.jsx';

/**
 * Experiencia móvil: cabecera compacta, tarjetas cómodas, cajón de fuentes y
 * artículo a pantalla completa. El escritorio conserva el diseño de QuiteRSS.
 */
export function MobileWorkspace({
  view,
  viewLabel,
  viewIcon,
  feeds,
  feedCounts,
  categories,
  totalCount,
  totalUnread,
  starredCount,
  articles,
  visibleUnread,
  selectedArticle,
  selectedIndex,
  readIds,
  starredIds,
  loading,
  refreshing,
  error,
  query,
  updatedAt,
  nextRefreshAt,
  hideRead,
  onToggleHideRead,
  onSelectView,
  onQueryChange,
  onRefresh,
  onSelect,
  onMarkRead,
  onToggleRead,
  onToggleStar,
  onOpen,
  onRetry,
  onPrev,
  onNext,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [readTouched, setReadTouched] = useState(false);

  useEffect(() => {
    if (articleOpen && !selectedArticle) setArticleOpen(false);
  }, [articleOpen, selectedArticle]);

  const handleSelectView = (nextView) => {
    onSelectView(nextView);
    setDrawerOpen(false);
    setArticleOpen(false);
  };

  const activeArticle = articleOpen ? selectedArticle : null;

  const handleOpenArticle = (id) => {
    onSelect(id);
    setReadTouched(false);
    setArticleOpen(true);
  };

  const handleToggleRead = (id) => {
    setReadTouched(true);
    onToggleRead(id);
  };

  const handleCloseArticle = () => {
    if (activeArticle && !readTouched && !readIds.has(activeArticle.id)) {
      onMarkRead(activeArticle.id);
    }
    setArticleOpen(false);
  };

  const handlePrev = () => {
    setReadTouched(false);
    onPrev();
  };

  const handleNext = () => {
    setReadTouched(false);
    onNext();
  };

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex >= 0 && selectedIndex < articles.length - 1;

  return (
    <div className="m-shell">
      <MobileHeader
        label={viewLabel}
        iconSrc={viewIcon.iconSrc}
        icon={viewIcon.icon}
        view={view}
        unreadCount={totalUnread}
        starredCount={starredCount}
        query={query}
        onSelectView={handleSelectView}
        onQueryChange={onQueryChange}
        onOpenDrawer={() => setDrawerOpen(true)}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <MobileNewsList
        articles={articles}
        selectedId={selectedArticle?.id || null}
        readIds={readIds}
        starredIds={starredIds}
        loading={loading}
        error={error}
        hasQuery={Boolean(query.trim())}
        onOpenArticle={handleOpenArticle}
        onToggleRead={onToggleRead}
        onToggleStar={onToggleStar}
        onOpen={onOpen}
        onRetry={onRetry}
      />

      <StatusBar
        compact
        updatedAt={updatedAt}
        visibleCount={articles.length}
        unreadCount={visibleUnread}
        error={error}
        nextRefreshAt={nextRefreshAt}
        refreshing={refreshing}
      />

      <FeedDrawer
        open={drawerOpen}
        feeds={feeds}
        feedCounts={feedCounts}
        view={view}
        categories={categories}
        totalCount={totalCount}
        totalUnread={totalUnread}
        starredCount={starredCount}
        loading={loading}
        hideRead={hideRead}
        onToggleHideRead={onToggleHideRead}
        onSelectView={handleSelectView}
        onClose={() => setDrawerOpen(false)}
      />

      {activeArticle ? (
        <MobileArticle
          article={activeArticle}
          loading={loading}
          position={selectedIndex + 1}
          total={articles.length}
          canPrev={canPrev}
          canNext={canNext}
          read={readIds.has(activeArticle.id)}
          starred={starredIds.has(activeArticle.id)}
          onPrev={handlePrev}
          onNext={handleNext}
          onClose={handleCloseArticle}
          onToggleRead={handleToggleRead}
          onToggleStar={onToggleStar}
          onOpenOriginal={onOpen}
        />
      ) : null}
    </div>
  );
}
