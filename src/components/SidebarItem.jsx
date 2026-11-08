import { AlertCircle } from 'lucide-react';

export function SidebarItem({
  icon: Icon,
  iconSrc,
  label,
  count,
  active = false,
  onClick,
  title,
  error,
}) {
  return (
    <button
      type="button"
      className={`sidebar-item ${active ? 'is-active' : ''}`.trim()}
      onClick={onClick}
      title={title || label}
      aria-pressed={active}
    >
      <span className="sidebar-item-icon">
        {iconSrc ? <img src={iconSrc} alt="" width="16" height="16" /> : Icon ? <Icon size={14} /> : null}
      </span>
      <span className="sidebar-item-label">{label}</span>
      {error ? (
        <span className="sidebar-item-error" title={error} aria-label={`Error: ${error}`}>
          <AlertCircle size={12} />
        </span>
      ) : null}
      {count > 0 ? <span className="sidebar-item-count">{count}</span> : null}
    </button>
  );
}
