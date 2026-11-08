import { useMemo } from 'react';
import { LoaderCircle, Newspaper } from 'lucide-react';
import { buildArticleDocument } from '../utils/articleDoc.js';
import { EmptyState } from './EmptyState.jsx';

export function ArticlePane({ article, loading }) {
  const documentHtml = useMemo(() => buildArticleDocument(article), [article]);

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
