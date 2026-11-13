import { useRef } from 'react';

const KEYBOARD_STEP = 8;
const KEYBOARD_STEP_LARGE = 32;

/**
 * Tirador que aparece en el borde derecho de una columna de la cabecera.
 * Permite redimensionarla arrastrando, con las flechas del teclado o
 * restableciéndola con doble clic.
 */
export function ColumnResizer({
  column,
  label,
  width,
  onResizeStart,
  onResize,
  onResizeEnd,
  onReset,
}) {
  const dragRef = useRef(null);

  function handlePointerDown(event) {
    const cell = event.currentTarget.closest('.news-head-cell');
    const startWidth = cell ? cell.getBoundingClientRect().width : 0;
    dragRef.current = { startX: event.clientX, startWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    onResizeStart?.(column, startWidth);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    onResize?.(column, drag.startWidth + (event.clientX - drag.startX));
  }

  function handlePointerUp(event) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onResizeEnd?.();
  }

  function handleKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const cell = event.currentTarget.closest('.news-head-cell');
    const current = cell ? cell.getBoundingClientRect().width : (width ?? 0);
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
    onResize?.(column, current + (event.key === 'ArrowLeft' ? -step : step));
  }

  function handleDoubleClick(event) {
    event.preventDefault();
    onReset?.(column);
  }

  return (
    <span
      className="column-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label={`Redimensionar la columna ${label}`}
      aria-valuenow={typeof width === 'number' ? Math.round(width) : undefined}
      title={`Arrastra para redimensionar la columna ${label}. Doble clic para restablecer.`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
    />
  );
}
