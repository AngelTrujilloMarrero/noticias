import { ColumnResizer } from './ColumnResizer.jsx';
import { COLUMN_LABELS } from '../utils/columns.js';

const HEAD_COLUMNS = [
  { key: 'titulo', label: COLUMN_LABELS.titulo, className: 'news-head-title' },
  { key: 'autor', label: COLUMN_LABELS.autor, className: 'news-head-author' },
  { key: 'categoria', label: COLUMN_LABELS.categoria, className: 'news-head-category' },
  { key: 'fuente', label: COLUMN_LABELS.fuente, className: 'news-head-source' },
  { key: 'publicado', label: COLUMN_LABELS.publicado, className: 'news-head-date' },
];

export function NewsHeader({
  headerRef,
  columnWidths,
  onResizeStart,
  onResize,
  onResizeEnd,
  onReset,
}) {
  return (
    <div className="news-header" role="row" ref={headerRef}>
      <span className="news-head-cell news-head-state" role="columnheader" data-column="estado" />
      {HEAD_COLUMNS.map((column) => (
        <span
          key={column.key}
          className={`news-head-cell ${column.className}`.trim()}
          role="columnheader"
          data-column={column.key}
        >
          {column.label}
          <ColumnResizer
            column={column.key}
            label={column.label}
            width={columnWidths?.[column.key]}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
            onReset={onReset}
          />
        </span>
      ))}
      <span className="news-head-cell news-head-star" role="columnheader" data-column="estrella" />
    </div>
  );
}
