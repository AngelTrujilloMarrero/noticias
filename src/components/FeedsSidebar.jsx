import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  Newspaper,
  PanelLeftClose,
  Rss,
  Star,
  Tag,
} from 'lucide-react';
import { IconButton } from './IconButton.jsx';
import { SidebarItem } from './SidebarItem.jsx';
import { isViewActive } from '../utils/filters.js';

export function FeedsSidebar({
  feeds,
  feedCounts,
  view,
  onSelectView,
  onCollapse,
  categories,
  totalCount,
  totalUnread,
  starredCount,
  loading,
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  return (
    <aside className="sidebar" aria-label="Feeds y categorías">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <Rss size={13} />
          </span>
          <span>QuiteRSS</span>
        </div>
        <IconButton label="Ocultar panel de feeds" onClick={onCollapse} className="sidebar-collapse">
          <PanelLeftClose size={13} />
        </IconButton>
      </div>

      <div className="sidebar-scroll">
        <div className="feed-list">
          {feeds.length === 0 ? (
            <div className="sidebar-empty">{loading ? 'Cargando feeds…' : 'Sin feeds'}</div>
          ) : (
            feeds.map((feed) => {
              const counts = feedCounts.get(feed.id);
              return (
                <SidebarItem
                  key={feed.id}
                  icon={Rss}
                  iconSrc={feed.icon || undefined}
                  label={feed.name}
                  count={counts?.unread || 0}
                  active={isViewActive(view, 'feed', feed.id)}
                  onClick={() => onSelectView({ type: 'feed', id: feed.id })}
                  error={feed.error || undefined}
                  title={feed.error ? `${feed.name} — ${feed.error}` : feed.name}
                />
              );
            })
          )}
        </div>

        <div className="sidebar-section">
          <button
            type="button"
            className="sidebar-section-title"
            onClick={() => setCategoriesOpen((open) => !open)}
            aria-expanded={categoriesOpen}
          >
            {categoriesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Categorías</span>
          </button>

          {categoriesOpen ? (
            <div className="sidebar-section-body">
              <SidebarItem
                icon={Newspaper}
                label="Todas las noticias"
                count={totalCount}
                active={isViewActive(view, 'all')}
                onClick={() => onSelectView({ type: 'all' })}
              />
              <SidebarItem
                icon={Inbox}
                label="Sin leer"
                count={totalUnread}
                active={isViewActive(view, 'unread')}
                onClick={() => onSelectView({ type: 'unread' })}
              />
              <SidebarItem
                icon={Star}
                label="Destacados"
                count={starredCount}
                active={isViewActive(view, 'starred')}
                onClick={() => onSelectView({ type: 'starred' })}
              />

              <div className="sidebar-subtitle">
                <Tag size={12} />
                <span>Etiquetas</span>
              </div>

              {categories.length === 0 ? (
                <div className="sidebar-empty sidebar-empty--small">Sin etiquetas</div>
              ) : (
                categories.map((category) => (
                  <SidebarItem
                    key={category.name}
                    icon={Tag}
                    label={category.name}
                    count={category.count}
                    active={isViewActive(view, 'category', category.name)}
                    onClick={() => onSelectView({ type: 'category', name: category.name })}
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
