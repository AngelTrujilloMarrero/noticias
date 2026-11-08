export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="empty-state">
      {Icon ? <Icon size={30} strokeWidth={1.4} aria-hidden="true" /> : null}
      <p className="empty-state-title">{title}</p>
      {children ? <div className="empty-state-text">{children}</div> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
