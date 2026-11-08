import { Star } from 'lucide-react';
import { formatLongDate, formatNewsDate } from '../utils/dates.js';

export function NewsRow({
  article,
  selected,
  read,
  starred,
  onSelect,
  onToggleRead,
  onToggleStar,
  onOpen,
}) {
  return (
    <div
      className={`news-row ${selected ? 'is-selected' : ''} ${read ? 'is-read' : ''}`.trim()}
      role="row"
      aria-selected={selected}
      data-id={article.id}
      onClick={() => onSelect(article.id)}
      onDoubleClick={() => onOpen(article.link)}
      title={`${article.title} — ${article.feedName}`}
    >
      <span className="news-cell news-state" role="gridcell">
        <button
          type="button"
          className={`feed-toggle ${read ? 'is-read' : 'is-unread'}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleRead(article.id);
          }}
          title={read ? 'Marcar como no leída' : 'Marcar como leída'}
          aria-label={read ? 'Marcar como no leída' : 'Marcar como leída'}
          aria-pressed={read}
        >
          {article.feedIcon ? (
            <img
              className="feed-logo"
              src={article.feedIcon}
              alt=""
              width="14"
              height="14"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="read-dot" aria-hidden="true" />
          )}
        </button>
      </span>

      <span className={`news-cell news-title ${read ? 'is-read' : ''}`.trim()} role="gridcell">
        {article.title}
      </span>

      <span className={`news-cell news-author ${article.author ? '' : 'is-muted'}`.trim()} role="gridcell">
        {article.author || '—'}
      </span>

      <span className={`news-cell news-category ${article.categories?.length ? '' : 'is-muted'}`.trim()} role="gridcell">
        {article.categories?.[0] || '—'}
      </span>

      <span className="news-cell news-source" role="gridcell" title={article.feedName}>
        {article.feedName}
      </span>

      <span className="news-cell news-date" role="gridcell" title={formatLongDate(article.published)}>
        {formatNewsDate(article.published)}
      </span>

      <span className="news-cell news-star" role="gridcell">
        <button
          type="button"
          className={`star-toggle ${starred ? 'is-starred' : ''}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleStar(article.id);
          }}
          title={starred ? 'Quitar de destacadas' : 'Destacar noticia'}
          aria-label={starred ? 'Quitar de destacadas' : 'Destacar noticia'}
        >
          <Star size={12} fill={starred ? 'currentColor' : 'none'} />
        </button>
      </span>
    </div>
  );
}
