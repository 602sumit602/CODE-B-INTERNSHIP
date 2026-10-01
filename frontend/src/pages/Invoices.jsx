import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Search, Filter, Download, Eye, CreditCard, 
  Trash2, Ban, CheckCircle, Clock, AlertTriangle, ArrowUpDown, X
} from 'lucide-react';
import { invoiceService, paymentService, reportService, clientService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Invoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Summary Metrics
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    count: 0
  });

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    notes: '',
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, search, statusFilter, clientId, startDate, endDate]);

  const fetchClients = async () => {
    try {
      const res = await clientService.getActiveClients();
      if (res.data?.success) {
        setClients(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients for filter', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (clientId) params.clientId = clientId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await invoiceService.getInvoices(params);
      if (res.data?.success) {
        const data = res.data.data;
        const list = data.content || [];
        setInvoices(list);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);

        // Compute summary metrics
        let totalInv = 0;
        let totalPd = 0;
        let totalOut = 0;
        list.forEach(inv => {
          totalInv += Number(inv.totalAmount || 0);
          totalPd += Number(inv.amountPaid || 0);
          totalOut += Number(inv.balanceDue || 0);
        });
        setSummary({
          totalInvoiced: totalInv,
          totalPaid: totalPd,
          totalOutstanding: totalOut,
          count: data.totalElements || list.length
        });
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      toast.info(`Preparing PDF for ${invoiceNumber}...`);
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.info('Exporting Invoices CSV...');
      const res = await reportService.exportInvoicesCsv();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoices_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoices CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleCancelInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancelInvoice(id);
      toast.success('Invoice cancelled');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this invoice?')) return;
    try {
      await invoiceService.deleteInvoice(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  // Payment Recording Handlers
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceDue ? String(invoice.balanceDue) : '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: '',
      notes: '',
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (amt > Number(selectedInvoice.balanceDue)) {
      toast.error(`Amount cannot exceed remaining balance of ₹${Number(selectedInvoice.balanceDue).toFixed(2)}`);
      return;
    }

    try {
      setPaymentSubmitting(true);
      const payload = {
        invoiceId: selectedInvoice.invoiceId || selectedInvoice.id,
        amount: amt,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.paymentReference,
        notes: paymentForm.notes,
        status: 'SUCCESS'
      };

      const res = await paymentService.recordPayment(payload);
      if (res.data?.success) {
        toast.success('Payment recorded successfully!');
        setPaymentModalOpen(false);
        fetchInvoices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-neutral"><Clock size={12} /> Draft</span>;
      case 'ISSUED':
        return <span className="badge badge-info"><FileText size={12} /> Issued</span>;
      case 'PARTIALLY_PAID':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> Partially Paid</span>;
      case 'PAID':
        return <span className="badge badge-success"><CheckCircle size={12} /> Paid</span>;
      case 'OVERDUE':
        return <span className="badge badge-danger"><AlertTriangle size={12} /> Overdue</span>;
      case 'CANCELLED':
        return <span className="badge badge-neutral"><Ban size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title m-0">Invoices</h1>
          <p className="text-muted m-0">Manage billing, collect payments, and download GST invoices</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/invoices/new" className="btn btn-primary">
            <Plus size={16} /> Create Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4 gap-3 mb-4">
        <div className="card stat-card border-left-primary">
          <span className="text-muted text-xs font-weight-bold uppercase">Total Invoiced</span>
          <h3 className="m-0 text-primary mt-1">₹{summary.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-muted mt-1">{summary.count} Total Invoices</span>
        </div>

        <div className="card stat-card border-left-success">
          <span className="text-muted text-xs font-weight-bold uppercase">Collected / Paid</span>
          <h3 className="m-0 text-success mt-1">₹{summary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-muted mt-1">Recorded Collections</span>
        </div>

        <div className="card stat-card border-left-danger">
          <span className="text-muted text-xs font-weight-bold uppercase">Outstanding Balance</span>
          <h3 className="m-0 text-danger mt-1">₹{summary.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-muted mt-1">Receivables Due</span>
        </div>

        <div className="card stat-card border-left-info">
          <span className="text-muted text-xs font-weight-bold uppercase">Collection Rate</span>
          <h3 className="m-0 text-info mt-1">
            {summary.totalInvoiced > 0 ? ((summary.totalPaid / summary.totalInvoiced) * 100).toFixed(1) + '%' : '0%'}
          </h3>
          <span className="text-xs text-muted mt-1">Cash Realization</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card mb-4 p-3">
        <div className="d-flex align-items-center flex-wrap gap-3">
          {/* Search */}
          <div className="form-group m-0" style={{ flex: '1 1 250px' }}>
            <div className="input-group">
              <span className="input-prefix"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search invoice # or client..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="form-group m-0" style={{ width: '180px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="form-group m-0" style={{ width: '200px' }}>
            <select
              className="form-control"
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Clients</option>
              {clients.map(c => (
                <option key={c.clientId || c.id} value={c.clientId || c.id}>
                  {c.clientName}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
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

          {(search || statusFilter || clientId || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setClientId('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(0);
              }}
              className="btn btn-sm btn-ghost text-muted"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container py-5">
            <div className="spinner"></div>
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-5">
            <FileText size={48} className="text-muted mb-2" />
            <h3>No Invoices Found</h3>
            <p className="text-muted">Create an invoice or convert an approved estimate to start billing.</p>
            <Link to="/invoices/new" className="btn btn-primary mt-2">
              <Plus size={16} /> Create First Invoice
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th className="text-right">Total (₹)</th>
                    <th className="text-right">Paid (₹)</th>
                    <th className="text-right">Balance Due (₹)</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const invId = inv.invoiceId || inv.id;
                    const balDue = Number(inv.balanceDue || 0);
                    return (
                      <tr key={invId}>
                        <td>
                          <Link to={`/invoices/${invId}`} className="font-weight-bold text-primary">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td>
                          <div className="font-weight-medium">{inv.clientName}</div>
                          {inv.clientGstin && (
                            <small className="text-muted text-xs">GST: {inv.clientGstin}</small>
                          )}
                        </td>
                        <td>{inv.invoiceDate || 'N/A'}</td>
                        <td>{inv.dueDate || 'N/A'}</td>
                        <td className="text-right font-weight-medium">
                          ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right text-success">
                          ₹{Number(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right font-weight-bold ${balDue > 0 ? 'text-danger' : 'text-muted'}`}>
                          ₹{balDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>{getStatusBadge(inv.status)}</td>
                        <td className="text-right">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <Link 
                              to={`/invoices/${invId}`} 
                              className="btn btn-icon btn-sm btn-ghost" 
                              title="View Invoice Details"
                            >
                              <Eye size={16} />
                            </Link>

                            <button
                              onClick={() => handleDownloadPdf(invId, inv.invoiceNumber)}
                              className="btn btn-icon btn-sm btn-ghost"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>

                            {balDue > 0 && inv.status !== 'CANCELLED' && (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                title="Record Payment"
                              >
                                <CreditCard size={14} /> Pay
                              </button>
                            )}

                            {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                              <button
                                onClick={() => handleCancelInvoice(invId)}
                                className="btn btn-icon btn-sm btn-ghost text-muted hover-danger"
                                title="Cancel Invoice"
                              >
                                <Ban size={16} />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteInvoice(invId)}
                                className="btn btn-icon btn-sm btn-ghost text-muted hover-danger"
                                title="Delete Invoice"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
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
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} invoices
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
      {paymentModalOpen && selectedInvoice && (
        <Modal 
          isOpen={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handlePaymentSubmit}>
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Client:</span>
                <strong>{selectedInvoice.clientName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total Invoice:</span>
                <span>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between text-danger font-weight-bold">
                <span>Remaining Balance Due:</span>
                <span>₹{Number(selectedInvoice.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label required">Payment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice.balanceDue}
                className="form-control"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
              <small className="text-muted">Enter exact or partial payment up to balance due</small>
            </div>

            <div className="grid grid-2 gap-3 mb-3">
              <div className="form-group">
                <label className="form-label required">Payment Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Method</label>
                <select
                  className="form-control"
                  required
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Payment Reference / Transaction ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. UTR12345678, CHQ-998822"
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Notes / Remarks</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Optional payment notes..."
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setPaymentModalOpen(false)}
                disabled={paymentSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={paymentSubmitting}
              >
                {paymentSubmitting ? 'Recording...' : 'Confirm & Record Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
