import { X } from 'lucide-react';

export function TabBar({ label, iconSrc, icon: Icon, onClose, showClose = true }) {
  return (
    <div className="tabbar" role="tablist" aria-label="Vista actual">
      <div className="tab is-active" role="tab" aria-selected="true">
        <span className="tab-icon">
          {iconSrc ? <img src={iconSrc} alt="" width="14" height="14" /> : Icon ? <Icon size={14} /> : null}
        </span>
        <span className="tab-label" title={label}>
          {label}
        </span>
        {showClose && onClose ? (
          <button
            type="button"
            className="tab-close"
            onClick={onClose}
            title="Cerrar vista"
            aria-label="Cerrar vista"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>
      <div className="tabbar-filler" />
    </div>
  );
}
