const BASE_TITLE = 'Noticias — AngelRSS';

/** Muestra las noticias no leídas delante del título de la pestaña. */
export function formatTabTitle(unreadCount) {
  const count = Number.isFinite(unreadCount) ? Math.max(0, Math.floor(unreadCount)) : 0;
  return count > 0 ? `(${count}) ${BASE_TITLE}` : BASE_TITLE;
}

export { BASE_TITLE };
