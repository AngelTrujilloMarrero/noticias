import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Inbox, Newspaper, Star, Tag } from 'lucide-react';
import { ArticlePane } from './components/ArticlePane.jsx';
import { FeedsSidebar } from './components/FeedsSidebar.jsx';
import { NewsList } from './components/NewsList.jsx';
import { Splitter } from './components/Splitter.jsx';
import { StatusBar } from './components/StatusBar.jsx';
import { TabBar } from './components/TabBar.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { MobileWorkspace } from './components/mobile/MobileWorkspace.jsx';
import { useArticleState } from './hooks/useArticleState.js';
import { useFeedData } from './hooks/useFeedData.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import { usePersistentState } from './hooks/usePersistentState.js';
import { useUnreadTitle } from './hooks/useUnreadTitle.js';
import {
  buildCategoryCounts,
  buildFeedCounts,
  countUnread,
  excludeReadArticles,
  filterArticles,
} from './utils/filters.js';

const EMPTY_LIST = [];
const ALL_VIEW = { type: 'all' };
const DEFAULT_LAYOUT = { sidebarOpen: true, sidebarWidth: 449, listRatio: 0.62 };
const VIEW_TYPES = new Set(['all', 'unread', 'starred', 'feed', 'category']);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeView(value) {
  return value && VIEW_TYPES.has(value.type) ? value : ALL_VIEW;
}

function getViewLabel(view, feedMap) {
  if (view.type === 'feed') return feedMap.get(view.id)?.name || 'Feed';
  if (view.type === 'unread') return 'Sin leer';
  if (view.type === 'starred') return 'Destacados';
  if (view.type === 'category') return view.name;
  return 'Todas las noticias';
}

function getViewIcon(view, feedMap) {
  if (view.type === 'feed') return { iconSrc: feedMap.get(view.id)?.icon };
  if (view.type === 'unread') return { icon: Inbox };
  if (view.type === 'starred') return { icon: Star };
  if (view.type === 'category') return { icon: Tag };
  return { icon: Newspaper };
}

export default function App() {
  const { snapshot, loading, refreshing, error, refresh, stop, nextRefreshAt } = useFeedData();
  const [storedView, setView] = usePersistentState('noticias:vista', ALL_VIEW);
  const [layout, setLayout] = usePersistentState('noticias:disposicion', DEFAULT_LAYOUT);
  const [hideRead, setHideRead] = usePersistentState('noticias:ocultar-leidas', false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { readIds, starredIds, markRead, markManyRead, toggleRead, toggleStar } = useArticleState();
  const isMobile = useMediaQuery('(max-width: 760px)');
  const mainRef = useRef(null);

  const view = normalizeView(storedView);
  const feeds = snapshot?.feeds ?? EMPTY_LIST;
  const articles = snapshot?.articles ?? EMPTY_LIST;

  const feedMap = useMemo(() => new Map(feeds.map((feed) => [feed.id, feed])), [feeds]);
  const enrichedArticles = useMemo(
    () =>
      articles.map((article) => {
        const feed = feedMap.get(article.feedId);
        return {
          ...article,
          feedName: feed?.name || 'Feed',
          feedIcon: feed?.icon || '',
        };
      }),
    [articles, feedMap],
  );

  const feedCounts = useMemo(
    () => buildFeedCounts(articles, readIds),
    [articles, readIds],
  );
  const categoryCounts = useMemo(
    () => buildCategoryCounts(enrichedArticles).slice(0, 14),
    [enrichedArticles],
  );
  const filtered = useMemo(() => {
    const result = filterArticles(enrichedArticles, view, readIds, starredIds, query);
    if (!hideRead || view.type === 'starred') return result;
    return excludeReadArticles(
      result,
      readIds,
      result.some((article) => article.id === selectedId) ? selectedId : null,
    );
  }, [enrichedArticles, view, readIds, starredIds, query, hideRead, selectedId]);

  const selectedIndex = filtered.findIndex((article) => article.id === selectedId);
  const selectedArticle = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const totalUnread = countUnread(articles, readIds);
  const visibleUnread = countUnread(filtered, readIds);
  useUnreadTitle(totalUnread);
  const starredCount = articles.reduce(
    (total, article) => total + (starredIds.has(article.id) ? 1 : 0),
    0,
  );

  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!filtered.some((article) => article.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (view.type === 'feed' && feeds.length > 0 && !feedMap.has(view.id)) {
      setView(ALL_VIEW);
    }
  }, [view, feeds.length, feedMap, setView]);

  const selectView = useCallback(
    (nextView) => {
      setView(nextView);
      setQuery('');
    },
    [setView],
  );

  const goPrevious = useCallback(() => {
    if (filtered.length === 0) return;
    const index = selectedIndex <= 0 ? 0 : selectedIndex - 1;
    setSelectedId(filtered[index].id);
  }, [filtered, selectedIndex]);

  const goNext = useCallback(() => {
    if (filtered.length === 0) return;
    const index = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, filtered.length - 1);
    setSelectedId(filtered[index].id);
  }, [filtered, selectedIndex]);

  const openLink = useCallback((link) => {
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }, []);

  const toggleSelectedRead = useCallback(() => {
    if (selectedArticle) toggleRead(selectedArticle.id);
  }, [selectedArticle, toggleRead]);

  const markAllRead = useCallback(() => {
    if (filtered.length === 0) return;
    markManyRead(filtered.map((article) => article.id));
  }, [filtered, markManyRead]);

  const toggleSelectedStar = useCallback(() => {
    if (selectedArticle) toggleStar(selectedArticle.id);
  }, [selectedArticle, toggleStar]);

  const openSelected = useCallback(() => {
    if (selectedArticle) {
      markRead(selectedArticle.id);
      openLink(selectedArticle.link);
    }
  }, [selectedArticle, markRead, openLink]);

  const toggleSidebar = useCallback(() => {
    setLayout((previous) => ({ ...previous, sidebarOpen: !previous.sidebarOpen }));
  }, [setLayout]);

  const resizeSidebar = useCallback(
    (delta) => {
      setLayout((previous) => ({
        ...previous,
        sidebarWidth: clamp(previous.sidebarWidth + delta, 230, 620),
      }));
    },
    [setLayout],
  );

  const resizeNewsPanel = useCallback(
    (delta) => {
      const height = mainRef.current?.clientHeight || 1;
      setLayout((previous) => ({
        ...previous,
        listRatio: clamp(previous.listRatio + delta / height, 0.2, 0.82),
      }));
    },
    [setLayout],
  );

  const resetSidebar = useCallback(
    () =>
      setLayout((previous) => ({
        ...previous,
        sidebarWidth: DEFAULT_LAYOUT.sidebarWidth,
      })),
    [setLayout],
  );

  const resetNewsPanel = useCallback(
    () =>
      setLayout((previous) => ({
        ...previous,
        listRatio: DEFAULT_LAYOUT.listRatio,
      })),
    [setLayout],
  );

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        goPrevious();
      } else if (event.key === 'Escape') {
        setQuery('');
      } else if (event.key.toLowerCase() === 'm') {
        toggleSelectedRead();
      } else if (event.key.toLowerCase() === 's') {
        toggleSelectedStar();
      } else if (event.key.toLowerCase() === 'r') {
        refresh();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, toggleSelectedRead, toggleSelectedStar, refresh]);

  const viewLabel = getViewLabel(view, feedMap);
  const viewIcon = getViewIcon(view, feedMap);
  const sidebarOpen = layout.sidebarOpen !== false;

  if (isMobile) {
    return (
      <MobileWorkspace
        view={view}
        viewLabel={viewLabel}
        viewIcon={viewIcon}
        feeds={feeds}
        feedCounts={feedCounts}
        categories={categoryCounts}
        totalCount={articles.length}
        totalUnread={totalUnread}
        starredCount={starredCount}
        articles={filtered}
        visibleUnread={visibleUnread}
        selectedArticle={selectedArticle}
        selectedIndex={selectedIndex}
        readIds={readIds}
        starredIds={starredIds}
        loading={loading}
        refreshing={refreshing}
        error={error}
        query={query}
        updatedAt={snapshot?.updatedAt}
        nextRefreshAt={nextRefreshAt}
        hideRead={hideRead}
        onToggleHideRead={() => setHideRead((previous) => !previous)}
        onSelectView={selectView}
        onQueryChange={setQuery}
        onRefresh={refresh}
        onSelect={setSelectedId}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onToggleRead={toggleRead}
        onToggleStar={toggleStar}
        onOpen={openLink}
        onRetry={refresh}
        onPrev={goPrevious}
        onNext={goNext}
      />
    );
  }

  return (
    <div className="app">
      <TabBar
        label={viewLabel}
        iconSrc={viewIcon.iconSrc}
        icon={viewIcon.icon}
        showClose={view.type !== 'all'}
        onClose={() => selectView(ALL_VIEW)}
      />

      <Toolbar
        query={query}
        onQueryChange={setQuery}
        onRefresh={refresh}
        onStop={stop}
        refreshing={refreshing}
        loading={loading}
        canPrev={selectedIndex > 0}
        canNext={selectedIndex >= 0 && selectedIndex < filtered.length - 1}
        onPrev={goPrevious}
        onNext={goNext}
        hasSelection={Boolean(selectedArticle)}
        isStarred={selectedArticle ? starredIds.has(selectedArticle.id) : false}
        isRead={selectedArticle ? readIds.has(selectedArticle.id) : false}
        hideRead={hideRead}
        onToggleHideRead={() => setHideRead((previous) => !previous)}
        onToggleStar={toggleSelectedStar}
        onToggleRead={toggleSelectedRead}
        onMarkAllRead={markAllRead}
        canMarkAllRead={visibleUnread > 0}
        onOpenOriginal={openSelected}
        onHome={() => selectView(ALL_VIEW)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={`workspace ${sidebarOpen ? '' : 'workspace--without-sidebar'}`.trim()}
        style={{ '--sidebar-width': `${layout.sidebarWidth}px` }}
      >
        {sidebarOpen ? (
          <>
            <FeedsSidebar
              feeds={feeds}
              feedCounts={feedCounts}
              view={view}
              onSelectView={selectView}
              onCollapse={toggleSidebar}
              categories={categoryCounts}
              totalCount={articles.length}
              totalUnread={totalUnread}
              starredCount={starredCount}
              loading={loading}
            />
            <Splitter
              orientation="vertical"
              onDrag={resizeSidebar}
              onReset={resetSidebar}
            />
          </>
        ) : null}

        <main className="main" ref={mainRef}>
          <div className="news-slot" style={{ height: `${layout.listRatio * 100}%` }}>
            <NewsList
              articles={filtered}
              selectedId={selectedId}
              readIds={readIds}
              starredIds={starredIds}
              loading={loading}
              error={error}
              hasQuery={Boolean(query.trim())}
              onSelect={setSelectedId}
              onMarkRead={markRead}
              onToggleRead={toggleRead}
              onToggleStar={toggleStar}
              onRetry={refresh}
            />
          </div>
          <Splitter
            orientation="horizontal"
            onDrag={resizeNewsPanel}
            onReset={resetNewsPanel}
          />
          <ArticlePane article={selectedArticle} loading={loading} />
        </main>
      </div>

      <StatusBar
        updatedAt={snapshot?.updatedAt}
        visibleCount={filtered.length}
        unreadCount={countUnread(filtered, readIds)}
        error={error}
        nextRefreshAt={nextRefreshAt}
        refreshing={refreshing}
      />
    </div>
  );
}
