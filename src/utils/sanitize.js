import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'caption', 'cite',
  'code', 'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img',
  'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'picture', 'pre', 'q', 's', 'section',
  'small', 'source', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody',
  'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'video',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
  video: ['src', 'poster', 'controls', 'width', 'height', 'preload'],
  source: ['src', 'type', 'media'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
};

function resolveUrl(value, baseUrl) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.startsWith('#')) return trimmed;
  try {
    return new URL(trimmed, baseUrl || undefined).href;
  } catch {
    return trimmed;
  }
}

function resolveAttributes(attribs, baseUrl, fields) {
  const next = { ...attribs };
  for (const field of fields) {
    if (next[field]) next[field] = resolveUrl(next[field], baseUrl);
  }
  return next;
}

/**
 * Limpia el HTML de un artículo y resuelve enlaces/imágenes relativos.
 * No se permite ningún script, iframe, formulario ni estilo inline.
 */
export function sanitizeArticleHtml(html, baseUrl = '') {
  return sanitizeHtml(String(html || ''), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'], video: ['http', 'https'] },
    disallowedTagsMode: 'discard',
    transformTags: {
      a: (tagName, attribs) => {
        const next = resolveAttributes(attribs, baseUrl, ['href']);
        return {
          tagName,
          attribs: {
            ...(next.href ? { href: next.href } : {}),
            ...(next.title ? { title: next.title } : {}),
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        };
      },
      img: (tagName, attribs) => {
        const next = resolveAttributes(attribs, baseUrl, ['src']);
        return {
          tagName,
          attribs: {
            ...(next.src ? { src: next.src } : {}),
            ...(next.alt ? { alt: next.alt } : { alt: '' }),
            ...(next.title ? { title: next.title } : {}),
            ...(next.width ? { width: next.width } : {}),
            ...(next.height ? { height: next.height } : {}),
            loading: 'lazy',
            decoding: 'async',
          },
        };
      },
      video: (tagName, attribs) => ({
        tagName,
        attribs: resolveAttributes(attribs, baseUrl, ['src', 'poster']),
      }),
      source: (tagName, attribs) => ({
        tagName,
        attribs: resolveAttributes(attribs, baseUrl, ['src']),
      }),
    },
  });
}

export function htmlToText(html) {
  const text = sanitizeHtml(String(html || ''), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return text.replace(/\s+/g, ' ').trim();
}

export function extractFirstImage(html) {
  const match = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || '';
}

export function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
