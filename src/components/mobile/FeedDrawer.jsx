import { useEffect } from 'react';
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Inbox,
  Newspaper,
  Rss,
  Star,
  Tag,
  X,
} from 'lucide-react';
import { SidebarItem } from '../SidebarItem.jsx';
import { isViewActive } from '../../utils/filters.js';

/** Cajón lateral con todas las fuentes, vistas fijas y categorías. */
export function FeedDrawer({
  open,
  feeds,
  feedCounts,
  view,
  categories,
  totalCount,
  totalUnread,
  starredCount,
  loading,
  hideRead,
  canMarkAllRead,
  onToggleHideRead,
  onMarkAllRead,
  onSelectView,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="m-drawer" role="dialog" aria-modal="true" aria-label="Fuentes y categorías">
      <button
        type="button"
        className="m-drawer-backdrop"
        onClick={onClose}
        aria-label="Cerrar panel de fuentes"
      />

      <aside className="m-drawer-panel">
        <header className="m-drawer-header">
          <span className="m-drawer-title">Fuentes</span>
          <button type="button" className="m-icon-button" onClick={onClose} aria-label="Cerrar panel">
            <X size={20} />
          </button>
        </header>

        <div className="m-drawer-scroll">
          <div className="m-drawer-group">
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
              label="Destacadas"
              count={starredCount}
              active={isViewActive(view, 'starred')}
              onClick={() => onSelectView({ type: 'starred' })}
            />
          </div>

          <button
            type="button"
            className={`m-drawer-toggle ${hideRead ? 'is-on' : ''}`.trim()}
            onClick={onToggleHideRead}
            aria-pressed={hideRead}
          >
            <span className="m-drawer-toggle-icon">
              <EyeOff size={17} />
            </span>
            <span className="m-drawer-toggle-label">Ocultar leídas</span>
            <span className="m-switch" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="m-drawer-toggle m-drawer-action"
            onClick={onMarkAllRead}
            disabled={!canMarkAllRead}
          >
            <span className="m-drawer-toggle-icon">
              <CheckCheck size={17} />
            </span>
            <span className="m-drawer-toggle-label">Marcar todas como leídas</span>
          </button>

          <p className="m-drawer-heading">
            Feeds
            <ChevronDown size={12} aria-hidden="true" />
          </p>
          <div className="m-drawer-group">
            {feeds.length === 0 ? (
              <div className="m-drawer-empty">{loading ? 'Cargando feeds…' : 'Sin feeds'}</div>
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

          <p className="m-drawer-heading">
            Categorías
            <ChevronRight size={12} aria-hidden="true" />
          </p>
          <div className="m-drawer-group">
            {categories.length === 0 ? (
              <div className="m-drawer-empty">Sin etiquetas</div>
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
        </div>
      </aside>
    </div>
  );
}
