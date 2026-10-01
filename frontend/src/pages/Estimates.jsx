import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { estimateService, clientService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import { Plus, Eye, Edit, Trash2, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';

const Estimates = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [estimates, setEstimates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    clientService.getActiveClients().then((res) => setClients(res.data?.data || [])).catch(() => {});
  }, []);

  const fetchEstimates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await estimateService.getEstimates({
        search,
        status: status || undefined,
        clientId: clientId || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setEstimates(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales estimates');
    } finally {
      setLoading(false);
    }
  }, [search, status, clientId, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEstimates();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEstimates]);

  const handleApprove = async (id, number) => {
    try {
      await estimateService.approveEstimate(id);
      toast.success(`Estimate ${number} marked as APPROVED`);
      fetchEstimates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve estimate');
    }
  };

  const handleReject = async (id, number) => {
    if (window.confirm(`Are you sure you want to mark estimate ${number} as REJECTED?`)) {
      try {
        await estimateService.rejectEstimate(id);
        toast.warning(`Estimate ${number} marked as REJECTED`);
        fetchEstimates();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reject estimate');
      }
    }
  };

  const handleConvertToInvoice = async (id, number) => {
    try {
      const res = await estimateService.convertToInvoice(id);
      toast.success(`Estimate ${number} successfully converted to Tax Invoice!`);
      if (res.data?.data?.invoiceId) {
        navigate(`/invoices/${res.data.data.invoiceId}`);
      } else {
        fetchEstimates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert estimate');
    }
  };

  const handleDelete = async (id, number) => {
    if (window.confirm(`Delete estimate ${number}? This action cannot be undone.`)) {
      try {
        await estimateService.deleteEstimate(id);
        toast.success(`Estimate ${number} deleted`);
        fetchEstimates();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete estimate');
      }
    }
  };

  const columns = [
    {
      header: 'Estimate Number',
      accessor: (r) => (
        <Link to={`/estimates/${r.estimateId}`} style={{ fontWeight: 700, color: '#4f46e5' }}>
          {r.estimateNumber}
        </Link>
      ),
      width: '150px',
    },
    {
      header: 'Client',
      accessor: (r) => (
        <div>
          <Link to={`/clients/${r.clientId}`} style={{ fontWeight: 600, color: '#0f172a' }}>
            {r.clientName}
          </Link>
          {r.chainName && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chain: {r.chainName}</div>}
        </div>
      ),
    },
    {
      header: 'Date / Validity',
      accessor: (r) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div>Issued: <strong>{r.estimateDate}</strong></div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Valid till: {r.validUntil}</div>
        </div>
      ),
    },
    {
      header: 'Sales Representative',
      accessor: (r) => <span style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{r.salespersonName || '-'}</span>,
    },
    {
      header: 'Grand Total',
      accessor: (r) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>
            INR {Number(r.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Taxable: {Number(r.taxableAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })} | GST: {Number(r.gst).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Status',
      accessor: (r) => (
        <span className={`badge badge-${r.status.toLowerCase()}`}>
          {r.status}
        </span>
      ),
      width: '110px',
    },
    {
      header: 'Actions',
      accessor: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Link to={`/estimates/${r.estimateId}`} className="btn-icon" title="View Estimate Details">
            <Eye size={15} />
          </Link>

          {r.status !== 'CONVERTED' && (
            <Link to={`/estimates/${r.estimateId}/edit`} className="btn-icon" title="Edit Estimate">
              <Edit size={15} />
            </Link>
          )}

          {r.status === 'SENT' || r.status === 'DRAFT' ? (
            <button
              onClick={() => handleApprove(r.estimateId, r.estimateNumber)}
              className="btn-icon"
              style={{ color: '#10b981' }}
              title="Approve Estimate"
            >
              <CheckCircle2 size={15} />
            </button>
          ) : null}

          {r.status === 'APPROVED' && (
            <button
              onClick={() => handleConvertToInvoice(r.estimateId, r.estimateNumber)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              title="Convert to Tax Invoice"
            >
              <FileText size={12} /> Convert
            </button>
          )}

          {isAdmin && r.status !== 'CONVERTED' && (
            <button
              onClick={() => handleDelete(r.estimateId, r.estimateNumber)}
              className="btn-icon"
              style={{ color: '#ef4444' }}
              title="Delete Estimate"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
      width: '180px',
    },
  ];

  const filterComponent = (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <select
        className="form-select"
        value={clientId}
        onChange={(e) => { setClientId(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Clients</option>
        {clients.map((c) => (
          <option key={c.clientId} value={c.clientId}>{c.clientName}</option>
        ))}
      </select>

      <select
        className="form-select"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Statuses</option>
        <option value="DRAFT">DRAFT</option>
        <option value="SENT">SENT</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="CONVERTED">CONVERTED</option>
      </select>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Sales Estimates</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Create client proposals, calculate GST automatically, monitor approval states, and convert to invoices
          </p>
        </div>

        <Link to="/estimates/new" className="btn btn-primary" id="btn-create-estimate">
          <Plus size={16} /> Create Estimate
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={estimates}
        loading={loading}
        error={error}
        page={page}
        size={size}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={setPage}
        onSizeChange={setSize}
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(0); }}
        searchPlaceholder="Search estimates by number, client, salesperson..."
        filterComponent={filterComponent}
        onRetry={fetchEstimates}
        emptyMessage="No sales estimates found matching the filter criteria."
      />
    </div>
  );
};

export default Estimates;
