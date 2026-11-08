import {
  ArrowLeft,
  ArrowRight,
  Circle,
  CircleCheck,
  ExternalLink,
  Star,
} from 'lucide-react';
import { ArticlePane } from '../ArticlePane.jsx';
import { formatLongDate } from '../../utils/dates.js';

/**
 * Artículo a pantalla completa. El contenido remoto sigue viviendo en el iframe
 * saneado de `ArticlePane`; aquí solo se añade la cabecera y la navegación.
 */
export function MobileArticle({
  article,
  loading,
  position,
  total,
  canPrev,
  canNext,
  read,
  starred,
  onPrev,
  onNext,
  onClose,
  onToggleRead,
  onToggleStar,
  onOpenOriginal,
}) {
  if (!article) return null;

  return (
    <section className="m-article" aria-label="Noticia abierta">
      <header className="m-article-bar">
        <button type="button" className="m-icon-button" onClick={onClose} aria-label="Volver a la lista">
          <ArrowLeft size={22} />
        </button>
        <span className="m-article-counter">
          {position} de {total}
        </span>
        <button
          type="button"
          className={`m-icon-button ${starred ? 'is-starred' : ''}`.trim()}
          onClick={() => onToggleStar(article.id)}
          aria-label={starred ? 'Quitar de destacadas' : 'Destacar noticia'}
          aria-pressed={starred}
        >
          <Star size={18} fill={starred ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={`m-icon-button ${read ? 'is-read' : ''}`.trim()}
          onClick={() => onToggleRead(article.id)}
          aria-label={read ? 'Marcar como no leída' : 'Marcar como leída'}
          aria-pressed={read}
        >
          {read ? <CircleCheck size={19} /> : <Circle size={19} />}
        </button>
        <button
          type="button"
          className="m-icon-button"
          onClick={() => onOpenOriginal(article.link)}
          aria-label="Abrir la noticia original"
        >
          <ExternalLink size={18} />
        </button>
      </header>

      <div className="m-article-head">
        <p className="m-article-source">
          {article.feedIcon ? <img src={article.feedIcon} alt="" width="16" height="16" /> : null}
          <span>{article.feedName}</span>
          <span className="m-card-dot" aria-hidden="true" />
          <time dateTime={article.published}>{formatLongDate(article.published)}</time>
        </p>
        <h1 className="m-article-title">{article.title}</h1>
      </div>

      <ArticlePane article={article} loading={loading} variant="mobile" />

      <nav className="m-article-nav" aria-label="Navegar entre noticias">
        <button type="button" onClick={onPrev} disabled={!canPrev}>
          <ArrowLeft size={16} />
          Anterior
        </button>
        <button type="button" onClick={onNext} disabled={!canNext}>
          Siguiente
          <ArrowRight size={16} />
        </button>
      </nav>
    </section>
  );
}
