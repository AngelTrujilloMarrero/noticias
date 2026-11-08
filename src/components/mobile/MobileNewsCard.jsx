import { useState } from 'react';
import { Circle, CircleCheck, ExternalLink, Star } from 'lucide-react';
import { formatNewsDate, formatLongDate } from '../../utils/dates.js';

/**
 * Tarjeta de noticia para el móvil. Mantiene la lectura en un solo toque y deja
 * las acciones secundarias (destacar, leída, original) en una fila discreta.
 */
export function MobileNewsCard({
  article,
  read,
  starred,
  onOpenArticle,
  onToggleRead,
  onToggleStar,
  onOpen,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.image) && !imageFailed;

  return (
    <article className={`m-card ${read ? 'is-read' : ''}`.trim()} data-id={article.id}>
      <button
        type="button"
        className="m-card-main"
        onClick={() => onOpenArticle(article.id)}
        aria-label={`Abrir ${article.title}`}
      >
        <span className="m-card-content">
          <span className="m-card-source">
            {article.feedIcon ? (
              <img className="m-card-feed" src={article.feedIcon} alt="" width="15" height="15" />
            ) : null}
            <span className="m-card-feed-name">{article.feedName}</span>
            <span className="m-card-dot" aria-hidden="true" />
            <time dateTime={article.published} title={formatLongDate(article.published)}>
              {formatNewsDate(article.published)}
            </time>
          </span>

          <span className="m-card-title">{article.title}</span>

          {article.summary ? <span className="m-card-summary">{article.summary}</span> : null}

          {article.categories?.length ? (
            <span className="m-card-tags">
              {article.categories.slice(0, 2).map((category) => (
                <span key={category} className="m-card-tag">
                  {category}
                </span>
              ))}
            </span>
          ) : null}
        </span>

        {showImage ? (
          <img
            className="m-card-image"
            src={article.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </button>

      <div className="m-card-actions">
        <button
          type="button"
          className={`m-card-action ${starred ? 'is-starred' : ''}`.trim()}
          onClick={() => onToggleStar(article.id)}
          aria-label={starred ? 'Quitar de destacadas' : 'Destacar noticia'}
          aria-pressed={starred}
        >
          <Star size={17} fill={starred ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={`m-card-action ${read ? 'is-read' : ''}`.trim()}
          onClick={() => onToggleRead(article.id)}
          aria-label={read ? 'Marcar como no leída' : 'Marcar como leída'}
          aria-pressed={read}
        >
          {read ? <CircleCheck size={17} /> : <Circle size={17} />}
        </button>
        <button
          type="button"
          className="m-card-action"
          onClick={() => onOpen(article.link)}
          aria-label="Abrir la noticia original"
        >
          <ExternalLink size={17} />
        </button>
      </div>
    </article>
  );
}
