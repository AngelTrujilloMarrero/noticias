import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, Newspaper } from 'lucide-react';
import { fetchFullArticle } from '../services/articleLoader.js';
import { buildArticleDocument } from '../utils/articleDoc.js';
import { navigationDirection } from '../utils/keyboard.js';
import { EmptyState } from './EmptyState.jsx';

export function ArticlePane({ article, loading, variant = 'desktop', onPrev, onNext }) {
  const [fullContent, setFullContent] = useState(null);
  const frameRef = useRef(null);
  const cleanupRef = useRef(null);
  const prevRef = useRef(onPrev);
  const nextRef = useRef(onNext);

  useEffect(() => {
    prevRef.current = onPrev;
    nextRef.current = onNext;
  }, [onPrev, onNext]);

  useEffect(
    () => () => {
      cleanupRef.current?.();
    },
    [],
  );

  const attachKeyboard = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!prevRef.current && !nextRef.current) return;

    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      const handleKeyDown = (event) => {
        const direction = navigationDirection(event);
        if (!direction) return;
        event.preventDefault();
        if (direction === 'next') nextRef.current?.();
        else prevRef.current?.();
      };
      doc.addEventListener('keydown', handleKeyDown);
      cleanupRef.current = () => doc.removeEventListener('keydown', handleKeyDown);
    } catch {
      // Si el iframe deja de ser accesible, se mantiene la navegación global.
    }
  }, []);

  useEffect(() => {
    if (!article) {
      cleanupRef.current?.();
      cleanupRef.current = null;
    }
  }, [article]);

  useEffect(() => {
    setFullContent(null);
    if (!article) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const content = await fetchFullArticle(article);
        if (!cancelled) setFullContent(content);
      } catch {
        // Si la descarga falla se mantiene el contenido que trae el feed.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [article]);

  const documentHtml = useMemo(() => {
    if (!article) return '';
    const enriched = fullContent ? { ...article, content: fullContent } : article;
    return buildArticleDocument(enriched, { mobile: variant === 'mobile' });
  }, [article, fullContent, variant]);

  if (!article) {
    return (
      <section className="article-panel" aria-label="Previsualización de la noticia">
        <EmptyState
          icon={loading ? LoaderCircle : Newspaper}
          title={loading ? 'Cargando noticias…' : 'Selecciona una noticia'}
        >
          {loading
            ? 'En cuanto lleguen los feeds se mostrará la primera noticia.'
            : 'El contenido del artículo aparecerá en este panel.'}
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="article-panel" aria-label="Previsualización de la noticia">
      <iframe
        key={article.id}
        ref={frameRef}
        className="article-frame"
        title={`Contenido de ${article.title}`}
        srcDoc={documentHtml}
        onLoad={attachKeyboard}
        // `allow-same-origin` solo permite escuchar ↑/↓ desde el padre; los
        // scripts del artículo siguen bloqueados porque falta `allow-scripts`.
        sandbox={
          onPrev || onNext
            ? 'allow-popups allow-popups-to-escape-sandbox allow-same-origin'
            : 'allow-popups allow-popups-to-escape-sandbox'
        }
      />
    </section>
  );
}
