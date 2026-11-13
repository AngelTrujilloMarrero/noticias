import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Circle,
  CircleCheck,
  Columns3,
  ExternalLink,
  Eye,
  EyeOff,
  Home,
  LoaderCircle,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCw,
  Search,
  Square,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { IconButton } from './IconButton.jsx';

export function Toolbar({
  query,
  onQueryChange,
  onRefresh,
  onStop,
  refreshing,
  loading,
  canPrev,
  canNext,
  onPrev,
  onNext,
  hasSelection,
  isStarred,
  isRead,
  hideRead,
  onToggleHideRead,
  onToggleStar,
  onToggleRead,
  onMarkAllRead,
  canMarkAllRead,
  onOpenOriginal,
  onHome,
  onResetColumns,
  canResetColumns,
  sidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <IconButton label="Noticia anterior" onClick={onPrev} disabled={!canPrev}>
          <ArrowLeft size={15} />
        </IconButton>
        <IconButton label="Noticia siguiente" onClick={onNext} disabled={!canNext}>
          <ArrowRight size={15} />
        </IconButton>
        <span className="toolbar-sep" />
        <IconButton
          label={refreshing ? 'Actualizando…' : 'Actualizar ahora'}
          onClick={onRefresh}
          disabled={loading}
        >
          {refreshing ? <LoaderCircle size={15} className="spin" /> : <RotateCw size={15} />}
        </IconButton>
        <IconButton label="Detener actualización" onClick={onStop} disabled={!refreshing}>
          <Square size={13} />
        </IconButton>
        <IconButton label="Todas las noticias" onClick={onHome}>
          <Home size={15} />
        </IconButton>
        <span className="toolbar-sep" />
        <IconButton
          label={isRead ? 'Marcar como no leída' : 'Marcar como leída'}
          onClick={onToggleRead}
          disabled={!hasSelection}
        >
          {isRead ? <Circle size={15} /> : <CircleCheck size={15} />}
        </IconButton>
        <IconButton
          label="Marcar todas como leídas"
          onClick={onMarkAllRead}
          disabled={!canMarkAllRead}
        >
          <CheckCheck size={15} />
        </IconButton>
        <IconButton
          label={hideRead ? 'Mostrar también las leídas' : 'Ocultar noticias leídas'}
          onClick={onToggleHideRead}
          active={hideRead}
        >
          {hideRead ? <EyeOff size={15} /> : <Eye size={15} />}
        </IconButton>
        <IconButton
          label={isStarred ? 'Quitar de destacadas' : 'Destacar noticia'}
          onClick={onToggleStar}
          disabled={!hasSelection}
          active={isStarred}
        >
          <Star size={15} fill={isStarred ? 'currentColor' : 'none'} />
        </IconButton>
        <IconButton
          label="Abrir noticia original"
          onClick={onOpenOriginal}
          disabled={!hasSelection}
        >
          <ExternalLink size={15} />
        </IconButton>
        <span className="toolbar-sep" />
        <IconButton
          label="Restablecer el ancho de las columnas"
          onClick={onResetColumns}
          disabled={!canResetColumns}
        >
          <Columns3 size={15} />
        </IconButton>
        <IconButton
          label={sidebarOpen ? 'Ocultar panel de feeds' : 'Mostrar panel de feeds'}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </IconButton>
      </div>

      <div className="toolbar-end">
        <label className="search-box">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar en noticias"
            aria-label="Buscar en noticias"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => onQueryChange('')}
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <X size={12} />
            </button>
          ) : null}
        </label>

        <IconButton
          label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          onClick={onToggleTheme}
          active={theme === 'dark'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>
      </div>
    </div>
  );
}
