import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Newspaper } from 'lucide-react';
import { fetchFullArticle } from '../services/articleLoader.js';
import { buildArticleDocument } from '../utils/articleDoc.js';
import { EmptyState } from './EmptyState.jsx';

export function ArticlePane({ article, loading, variant = 'desktop' }) {
  const [fullContent, setFullContent] = useState(null);

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
        className="article-frame"
        title={`Contenido de ${article.title}`}
        srcDoc={documentHtml}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
      />
    </section>
  );
}
