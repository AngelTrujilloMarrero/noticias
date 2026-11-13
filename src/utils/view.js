import { Inbox, Newspaper, Star, Tag } from 'lucide-react';

export const ALL_VIEW = { type: 'all' };
export const DEFAULT_LAYOUT = { sidebarOpen: true, sidebarWidth: 449, listRatio: 0.62 };

const VIEW_TYPES = new Set(['all', 'unread', 'starred', 'feed', 'category']);

export function normalizeView(value) {
  return value && VIEW_TYPES.has(value.type) ? value : ALL_VIEW;
}

export function getViewLabel(view, feedMap) {
  if (view.type === 'feed') return feedMap.get(view.id)?.name || 'Feed';
  if (view.type === 'unread') return 'Sin leer';
  if (view.type === 'starred') return 'Destacados';
  if (view.type === 'category') return view.name;
  return 'Todas las noticias';
}

export function getViewIcon(view, feedMap) {
  if (view.type === 'feed') return { iconSrc: feedMap.get(view.id)?.icon };
  if (view.type === 'unread') return { icon: Inbox };
  if (view.type === 'starred') return { icon: Star };
  if (view.type === 'category') return { icon: Tag };
  return { icon: Newspaper };
}
