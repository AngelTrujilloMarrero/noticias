export function IconButton({
  label,
  children,
  className = '',
  active = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? 'is-active' : ''} ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
