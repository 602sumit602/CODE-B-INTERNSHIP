import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, Plus, Search, Filter, Download, Eye, 
  CheckCircle, Clock, XCircle, ArrowUpDown, X, DollarSign
} from 'lucide-react';
import { paymentService, invoiceService, reportService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Payments() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Unpaid Invoices for modal
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [currentPage, search, methodFilter, statusFilter, startDate, endDate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (methodFilter) params.paymentMethod = methodFilter;
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await paymentService.getPayments(params);
      if (res.data?.success) {
        const data = res.data.data;
        setPayments(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const openNewPaymentModal = async () => {
    try {
      // Load invoices with outstanding balance
      const res = await invoiceService.getInvoices({ size: 100 });
      if (res.data?.success) {
        const list = (res.data.data?.content || []).filter(
          inv => Number(inv.balanceDue || 0) > 0 && inv.status !== 'CANCELLED'
        );
        setUnpaidInvoices(list);
        if (list.length > 0) {
          setForm({
            invoiceId: list[0].invoiceId || list[0].id,
            amount: String(list[0].balanceDue),
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'BANK_TRANSFER',
            paymentReference: '',
            notes: '',
          });
        }
      }
      setRecordModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch eligible invoices');
    }
  };

  const handleInvoiceChange = (invId) => {
    const selected = unpaidInvoices.find(inv => String(inv.invoiceId || inv.id) === String(invId));
    setForm({
      ...form,
      invoiceId: invId,
      amount: selected ? String(selected.balanceDue) : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoiceId) {
      toast.error('Please select an invoice');
      return;
    }

    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const selected = unpaidInvoices.find(inv => String(inv.invoiceId || inv.id) === String(form.invoiceId));
    if (selected && amt > Number(selected.balanceDue)) {
      toast.error(`Amount cannot exceed invoice balance due of ₹${Number(selected.balanceDue).toFixed(2)}`);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        invoiceId: Number(form.invoiceId),
        amount: amt,
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        paymentReference: form.paymentReference,
        notes: form.notes,
        status: 'SUCCESS'
      };

      const res = await paymentService.recordPayment(payload);
      if (res.data?.success) {
        toast.success('Payment recorded successfully');
        setRecordModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.info('Exporting Payments CSV...');
      const res = await reportService.exportPaymentsCsv();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Payments CSV exported');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  // Metric Calculation
  const totalCollected = payments.reduce((acc, curr) => acc + (curr.status === 'SUCCESS' ? Number(curr.amount || 0) : 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="badge badge-success"><CheckCircle size={12} /> Success</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
      case 'FAILED':
        return <span className="badge badge-danger"><XCircle size={12} /> Failed</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title m-0">Payments</h1>
          <p className="text-muted m-0">Track collections, settlements, and payment transactions</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={openNewPaymentModal} className="btn btn-primary">
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-3 gap-3 mb-4">
        <div className="card stat-card border-left-success">
          <span className="text-muted text-xs font-weight-bold uppercase">Total Payments Collected</span>
          <h3 className="m-0 text-success mt-1">₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-muted mt-1">{totalElements} Total Transactions</span>
        </div>

        <div className="card stat-card border-left-primary">
          <span className="text-muted text-xs font-weight-bold uppercase">Successful Collections</span>
          <h3 className="m-0 text-primary mt-1">
            {payments.filter(p => p.status === 'SUCCESS').length}
          </h3>
          <span className="text-xs text-muted mt-1">Recorded on current view</span>
        </div>

        <div className="card stat-card border-left-info">
          <span className="text-muted text-xs font-weight-bold uppercase">Payment Channels</span>
          <h3 className="m-0 text-info mt-1">UPI & NetBanking</h3>
          <span className="text-xs text-muted mt-1">Primary Realization Methods</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-3">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="form-group m-0" style={{ flex: '1 1 250px' }}>
            <div className="input-group">
              <span className="input-prefix"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search reference # or client..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              />
            </div>
          </div>

          <div className="form-group m-0" style={{ width: '180px' }}>
            <select
              className="form-control"
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Methods</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div className="form-group m-0" style={{ width: '150px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <input 
              type="date" 
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
              title="Start Date"
            />
            <span className="text-muted text-xs">to</span>
            <input 
              type="date" 
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
              title="End Date"
            />
          </div>

          {(search || methodFilter || statusFilter || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearch('');
                setMethodFilter('');
                setStatusFilter('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(0);
              }}
              className="btn btn-sm btn-ghost text-muted"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container py-5">
            <div className="spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-5">
            <CreditCard size={48} className="text-muted mb-2" />
            <h3>No Payments Recorded</h3>
            <p className="text-muted">Record client payments against open invoices.</p>
            <button onClick={openNewPaymentModal} className="btn btn-primary mt-2">
              <Plus size={16} /> Record First Payment
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Invoice #</th>
                    <th>Client Name</th>
                    <th>Method</th>
                    <th>Reference / UTR</th>
                    <th className="text-right">Amount (₹)</th>
                    <th>Recorded By</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const payId = p.paymentId || p.id;
                    return (
                      <tr key={payId}>
                        <td>{p.paymentDate}</td>
                        <td>
                          <Link to={`/invoices/${p.invoiceId}`} className="font-weight-bold text-primary">
                            {p.invoiceNumber}
                          </Link>
                        </td>
                        <td className="font-weight-medium">{p.clientName}</td>
                        <td>
                          <span className="badge badge-neutral">{p.paymentMethod}</span>
                        </td>
                        <td>
                          <code>{p.paymentReference || 'N/A'}</code>
                        </td>
                        <td className="text-right font-weight-bold text-success">
                          ₹{Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-muted text-sm">{p.recordedByName || 'System'}</td>
                        <td>{getStatusBadge(p.status)}</td>
                        <td className="text-right">
                          <Link 
                            to={`/invoices/${p.invoiceId}`} 
                            className="btn btn-icon btn-sm btn-ghost"
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </Link>
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
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} payments
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

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <Modal
          isOpen={recordModalOpen}
          onClose={() => setRecordModalOpen(false)}
          title="Record New Client Payment"
        >
          {unpaidInvoices.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-success mb-2" />
              <h4>All Invoices Are Fully Settled!</h4>
              <p className="text-muted">There are currently no unpaid or partially paid invoices requiring payment.</p>
              <button 
                type="button" 
                className="btn btn-secondary mt-2" 
                onClick={() => setRecordModalOpen(false)}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="form-label required">Select Open Invoice</label>
                <select
                  className="form-control"
                  required
                  value={form.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                >
                  {unpaidInvoices.map(inv => (
                    <option key={inv.invoiceId || inv.id} value={inv.invoiceId || inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} (Bal: ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label required">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div className="grid grid-2 gap-3 mb-3">
                <div className="form-group">
                  <label className="form-label required">Payment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Payment Method</label>
                  <select
                    className="form-control"
                    required
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Payment Reference / UTR Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UTR12345678, CHQ-998822"
                  value={form.paymentReference}
                  onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Optional internal remarks..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRecordModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
