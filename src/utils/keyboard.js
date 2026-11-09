const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** Indica si el evento nace en un campo donde las flechas deben editar texto. */
export function isTypingTarget(target) {
  return Boolean(target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable));
}

/**
 * Devuelve la dirección de navegación para ↑/↓, o null si la tecla no debe
 * mover la selección (modificadores, campos de texto o evento ya gestionado).
 */
export function navigationDirection(event) {
  if (!event || event.defaultPrevented) return null;
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (isTypingTarget(event.target)) return null;
  if (event.key === 'ArrowDown') return 'next';
  if (event.key === 'ArrowUp') return 'previous';
  return null;
}
