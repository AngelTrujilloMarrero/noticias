import { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, RotateCw } from 'lucide-react';
import { formatClock } from '../utils/dates.js';

function Countdown({ nextRefreshAt, refreshing }) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    function update() {
      setSeconds(Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000)));
    }
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [nextRefreshAt]);

  return (
    <span className="status-item" title="Próxima actualización automática">
      {refreshing ? <LoaderCircle size={12} className="spin" /> : <RotateCw size={11} />}
      {refreshing ? 'actualizando' : `${seconds} s`}
    </span>
  );
}

export function StatusBar({
  updatedAt,
  visibleCount,
  unreadCount,
  error,
  nextRefreshAt,
  refreshing,
}) {
  return (
    <footer className="statusbar" aria-live="polite">
      <div className="status-left" title={error || undefined}>
        {error ? (
          <>
            <AlertCircle size={12} className="status-error-icon" />
            <span className="status-error-text">{error}</span>
          </>
        ) : (
          <span className="status-item status-ready">Listo</span>
        )}
      </div>

      <div className="status-right">
        <span className="status-item">Actualizado: {formatClock(updatedAt)}</span>
        <span className="status-divider" />
        <span className="status-item">Todos: {visibleCount}</span>
        <span className="status-divider" />
        <span className="status-item">Sin leer: {unreadCount}</span>
        <span className="status-divider" />
        <Countdown nextRefreshAt={nextRefreshAt} refreshing={refreshing} />
      </div>
    </footer>
  );
}
