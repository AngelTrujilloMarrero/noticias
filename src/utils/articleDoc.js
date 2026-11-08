const DEFAULT_DOC_STYLE = `
  :root { color-scheme: light; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    padding: 7px 10px 48px 6px;
    color: #1a1a1a;
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-size: 15px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  img, video { max-width: 100%; height: auto; }
  figure { margin: 1em 0; }
  figcaption { color: #666; font-size: 0.85em; }
  h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.2em 0 0.5em; }
  h1 { font-size: 1.6em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.2em; }
  p { margin: 0 0 0.9em; }
  ul, ol { padding-left: 1.4em; margin: 0 0 1em; }
  blockquote {
    margin: 1em 0;
    padding: 0.2em 0 0.2em 1em;
    border-left: 3px solid #d6e4f5;
    color: #444;
  }
  pre, code {
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 0.88em;
    background: #f4f5f7;
  }
  pre { padding: 10px; overflow-x: auto; }
  table { border-collapse: collapse; max-width: 100%; }
  td, th { border: 1px solid #ddd; padding: 4px 6px; }
  iframe, script, style, form, input, button { display: none !important; }
`;

const MOBILE_DOC_STYLE = `
  body {
    padding: 14px 16px 40px;
    font-size: 16px;
    line-height: 1.45;
  }
  h1 { font-size: 1.35em; }
  h2 { font-size: 1.2em; }
`;

function escapeAttribute(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function buildArticleDocument(article, { mobile = false } = {}) {
  if (!article) return '';

  const baseUrl = article.link || '';
  const title = escapeAttribute(article.title || 'Noticia');
  const content = article.content || `<p>${escapeAttribute(article.summary || '')}</p>`;
  const style = mobile ? `${DEFAULT_DOC_STYLE}${MOBILE_DOC_STYLE}` : DEFAULT_DOC_STYLE;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${escapeAttribute(baseUrl)}" target="_blank">
<title>${title}</title>
<style>${style}</style>
</head>
<body>${content}</body>
</html>`;
}
