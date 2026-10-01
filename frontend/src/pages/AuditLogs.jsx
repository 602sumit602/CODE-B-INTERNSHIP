import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Filter, Clock, User, 
  FileText, ArrowUpDown, X, Activity 
} from 'lucide-react';
import { auditService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export default function AuditLogs() {
  const { toast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [currentPage, search, moduleFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (moduleFilter) params.module = moduleFilter;

      const res = await auditService.getAuditLogs(params);
      if (res.data?.success) {
        const data = res.data.data;
        setLogs(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <span className="badge badge-success">CREATE</span>;
      case 'UPDATE':
        return <span className="badge badge-info">UPDATE</span>;
      case 'DELETE':
        return <span className="badge badge-danger">DELETE</span>;
      case 'CONVERT_TO_INVOICE':
        return <span className="badge badge-purple">CONVERT</span>;
      case 'LOGIN':
        return <span className="badge badge-primary">LOGIN</span>;
      case 'RECORD_PAYMENT':
        return <span className="badge badge-success">PAYMENT</span>;
      case 'APPROVE':
        return <span className="badge badge-success">APPROVE</span>;
      case 'REJECT':
        return <span className="badge badge-danger">REJECT</span>;
      default:
        return <span className="badge badge-neutral">{action}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title m-0">Audit Trail & Activity Log</h1>
          <p className="text-muted m-0">Immutable compliance log of all system transactions, security events, and edits</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card mb-4 p-3">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="form-group m-0" style={{ flex: '1 1 250px' }}>
            <div className="input-group">
              <span className="input-prefix"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search action or details..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              />
            </div>
          </div>

          <div className="form-group m-0" style={{ width: '180px' }}>
            <select
              className="form-control"
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Modules</option>
              <option value="INVOICES">Invoices</option>
              <option value="ESTIMATES">Estimates</option>
              <option value="PAYMENTS">Payments</option>
              <option value="CLIENTS">Clients</option>
              <option value="USERS">Users</option>
              <option value="AUTH">Authentication</option>
            </select>
          </div>

          {(search || moduleFilter) && (
            <button 
              onClick={() => { setSearch(''); setModuleFilter(''); setCurrentPage(0); }}
              className="btn btn-sm btn-ghost text-muted"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container py-5">
            <div className="spinner"></div>
            <p>Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5">
            <Activity size={48} className="text-muted mb-2" />
            <h3>No Audit Logs Found</h3>
            <p className="text-muted">User activities and state changes will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Details</th>
                    <th>IP / Session</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const logId = log.id || log.logId;
                    return (
                      <tr key={logId}>
                        <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td>
                          <div className="font-weight-medium">{log.performedByName || 'System'}</div>
                          <span className="text-xs text-muted">{log.performedByEmail || ''}</span>
                        </td>
                        <td>{getActionBadge(log.action)}</td>
                        <td>
                          <span className="badge badge-neutral">{log.module}</span>
                        </td>
                        <td className="text-sm">
                          {log.details}
                          {log.entityId && (
                            <span className="text-xs text-muted ml-2">(Entity ID: #{log.entityId})</span>
                          )}
                        </td>
                        <td className="text-xs text-muted">
                          <code>{log.ipAddress || '127.0.0.1'}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-top d-flex justify-content-between align-items-center">
                <span className="text-sm text-muted">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} logs
                </span>
                <div className="pagination gap-1">
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-3 d-flex align-items-center text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
