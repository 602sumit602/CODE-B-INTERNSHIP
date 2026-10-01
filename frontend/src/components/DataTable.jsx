import React from 'react';
import { ChevronLeft, ChevronRight, Search, Inbox, AlertTriangle, ArrowUpDown } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0,
  onPageChange,
  onSizeChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterComponent = null,
  actionButton = null,
  emptyMessage = 'No records found.',
  onRetry,
}) => {
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Bar: Search, Filters & Action Button */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {onSearchChange && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.8125rem' }}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {filterComponent}
        </div>

        {actionButton && <div>{actionButton}</div>}
      </div>

      {/* Table Container */}
      <div className="table-container">
        {error ? (
          <div className="empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <AlertTriangle size={36} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Failed to Load Data</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="btn btn-secondary btn-sm">
                Try Again
              </button>
            )}
          </div>
        ) : loading ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
              Loading records...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <Inbox size={42} className="empty-state-icon" />
            <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>No Data Available</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{emptyMessage}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} style={{ width: col.width || 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown size={12} style={{ color: '#94a3b8' }} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {!loading && !error && data.length > 0 && (
          <div className="pagination-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>
                Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalElements}</strong> entries
              </span>

              {onSizeChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>Rows:</span>
                  <select
                    value={size}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '28px' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>

            {totalPages > 1 && onPageChange && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={page === 0}
                  onClick={() => onPageChange(page - 1)}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.8125rem' }}>
                  Page {page + 1} of {totalPages}
                </div>

                <button
                  className="pagination-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => onPageChange(page + 1)}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
