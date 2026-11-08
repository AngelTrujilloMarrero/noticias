import { useState } from 'react';
import { Menu, RefreshCw, Search, X } from 'lucide-react';

const FILTERS = [
  { type: 'all', label: 'Todo' },
  { type: 'unread', label: 'Sin leer' },
  { type: 'starred', label: 'Destacadas' },
];

/**
 * Cabecera compacta del móvil: navegación, búsqueda plegable y filtros rápidos.
 * Los filtros por feed o categoría viven en el cajón de fuentes.
 */
export function MobileHeader({
  label,
  iconSrc,
  icon: Icon,
  view,
  unreadCount,
  starredCount,
  query,
  onSelectView,
  onQueryChange,
  onOpenDrawer,
  onRefresh,
  refreshing,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const counts = { all: null, unread: unreadCount, starred: starredCount };

  const toggleSearch = () => {
    if (searchOpen) onQueryChange('');
    setSearchOpen((open) => !open);
  };

  return (
    <header className="m-header">
      <div className="m-header-row">
        <button
          type="button"
          className="m-icon-button"
          onClick={onOpenDrawer}
          aria-label="Abrir fuentes y categorías"
        >
          <Menu size={21} />
        </button>

        <div className="m-header-title">
          <span className="m-header-icon">
            {iconSrc ? (
              <img src={iconSrc} alt="" width="16" height="16" />
            ) : Icon ? (
              <Icon size={16} />
            ) : null}
          </span>
          <span className="m-header-label">{label}</span>
        </div>

        <button
          type="button"
          className={`m-icon-button ${searchOpen ? 'is-active' : ''}`.trim()}
          onClick={toggleSearch}
          aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar noticias'}
          aria-expanded={searchOpen}
        >
          {searchOpen ? <X size={20} /> : <Search size={19} />}
        </button>

        <button
          type="button"
          className="m-icon-button"
          onClick={onRefresh}
          aria-label="Actualizar noticias"
          aria-busy={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
        </button>
      </div>

      {searchOpen ? (
        <div className="m-search">
          <Search size={16} className="m-search-icon" aria-hidden="true" />
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar en las noticias"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Buscar noticias"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              className="m-search-clear"
              onClick={() => onQueryChange('')}
              aria-label="Borrar búsqueda"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="m-chips" role="tablist" aria-label="Filtrar noticias">
        {FILTERS.map((filter) => {
          const active = view.type === filter.type;
          const count = counts[filter.type];
          return (
            <button
              key={filter.type}
              type="button"
              role="tab"
              aria-selected={active}
              className={`m-chip ${active ? 'is-active' : ''}`.trim()}
              onClick={() => onSelectView({ type: filter.type })}
            >
              {filter.label}
              {count ? <span className="m-chip-count">{count}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}
