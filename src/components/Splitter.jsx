import { useRef } from 'react';

export function Splitter({ orientation = 'vertical', onDrag, onReset }) {
  const lastPosition = useRef(null);

  function handlePointerDown(event) {
    lastPosition.current = orientation === 'vertical' ? event.clientX : event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (lastPosition.current === null) return;
    const position = orientation === 'vertical' ? event.clientX : event.clientY;
    const delta = position - lastPosition.current;
    if (!delta) return;
    lastPosition.current = position;
    onDrag(delta);
  }

  function handlePointerUp(event) {
    lastPosition.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className={`splitter splitter--${orientation}`}
      role="separator"
      aria-orientation={orientation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onReset}
      title="Arrastra para redimensionar. Doble clic para restablecer."
    />
  );
}
