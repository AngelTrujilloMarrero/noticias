import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Newspaper } from 'lucide-react';
import { buildArticleDocument } from '../utils/articleDoc.js';
import { removeLeadImage } from '../utils/articleContent.js';
import { sanitizeArticleHtml } from '../utils/sanitize.js';
import { EmptyState } from './EmptyState.jsx';

const FULL_ARTICLE_ATTEMPTS = 2;

async function fetchFullArticle(path) {
  let lastError;
  for (let attempt = 0; attempt < FULL_ARTICLE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`/elhacker${path}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function ArticlePane({ article, loading, variant = 'desktop' }) {
  const [fullContent, setFullContent] = useState(null);

  useEffect(() => {
    setFullContent(null);
    if (!article || article.feedId !== 'elhacker') return undefined;

    let cancelled = false;
    let path = '';
    try {
      path = new URL(article.link).pathname;
    } catch {
      return undefined;
    }

    (async () => {
      try {
        const html = await fetchFullArticle(path);
        const document = new DOMParser().parseFromString(html, 'text/html');
        const container = document.querySelector('.art-PostContent');
        removeLeadImage(container);
        const content = container ? sanitizeArticleHtml(container.innerHTML, article.link) : '';
        if (!cancelled) setFullContent(content || article.content);
      } catch {
        if (!cancelled) setFullContent(article.content);
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
