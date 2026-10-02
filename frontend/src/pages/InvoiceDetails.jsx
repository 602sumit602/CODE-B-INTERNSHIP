import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, ArrowLeft, Download, Printer, CreditCard, Edit2, 
  Trash2, Ban, CheckCircle, Clock, AlertTriangle, Building, 
  Calendar, User, DollarSign, FileCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { invoiceService, paymentService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Payment Recording Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoiceById(id);
      if (res.data?.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load invoice details');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      toast.info('Generating official PDF...');
      const res = await invoiceService.downloadPdf(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoiceNumber || 'Invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancelInvoice(id);
      toast.success('Invoice cancelled');
      fetchInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this invoice? This action cannot be reversed.')) return;
    try {
      await invoiceService.deleteInvoice(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  // Payment Recording Handlers
  const openPaymentModal = () => {
    if (!invoice) return;
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
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (amt > Number(invoice.balanceDue)) {
      toast.error(`Payment cannot exceed outstanding balance of ₹${Number(invoice.balanceDue).toFixed(2)}`);
      return;
    }

    try {
      setPaymentSubmitting(true);
      const payload = {
        invoiceId: invoice.invoiceId || invoice.id,
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
        fetchInvoice();
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
        return <span className="badge badge-neutral"><Clock size={13} /> Draft</span>;
      case 'ISSUED':
        return <span className="badge badge-info"><FileText size={13} /> Issued</span>;
      case 'PARTIALLY_PAID':
        return <span className="badge badge-warning"><AlertTriangle size={13} /> Partially Paid</span>;
      case 'PAID':
        return <span className="badge badge-success"><CheckCircle size={13} /> Fully Paid</span>;
      case 'OVERDUE':
        return <span className="badge badge-danger"><AlertTriangle size={13} /> Overdue</span>;
      case 'CANCELLED':
        return <span className="badge badge-neutral"><Ban size={13} /> Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="card loading-container" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
        <p>Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="card text-center p-5">
        <AlertCircle size={48} className="text-muted mb-3" />
        <h3>Invoice Not Found</h3>
        <p className="text-muted">The requested invoice does not exist or has been removed.</p>
        <Link to="/invoices" className="btn btn-secondary mt-3">
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
      </div>
    );
  }

  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const balDue = Number(invoice.balanceDue || 0);
  const isPaid = invoice.status === 'PAID';
  const isCancelled = invoice.status === 'CANCELLED';

  return (
    <div className="page-container">
      {/* Header & Actions */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="btn btn-icon btn-secondary" title="Back to Invoices">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="page-title m-0">Invoice {invoice.invoiceNumber}</h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-muted m-0">Issue Date: {invoice.invoiceDate || 'N/A'} | Due Date: {invoice.dueDate || 'N/A'}</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button 
            onClick={handleDownloadPdf} 
            disabled={downloading} 
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Download size={16} /> {downloading ? 'Downloading...' : 'Download PDF'}
          </button>

          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print
          </button>

          {balDue > 0 && !isCancelled && (
            <button 
              onClick={openPaymentModal} 
              className="btn btn-success d-flex align-items-center gap-2"
            >
              <CreditCard size={16} /> Record Payment
            </button>
          )}

          {invoice.status === 'DRAFT' && (
            <Link to={`/invoices/${invoice.invoiceId || invoice.id}/edit`} className="btn btn-secondary">
              <Edit2 size={16} /> Edit
            </Link>
          )}

          {!isCancelled && !isPaid && (
            <button 
              onClick={handleCancel} 
              className="btn btn-outline-danger"
              title="Cancel Invoice"
            >
              <Ban size={16} /> Cancel
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={handleDelete} 
              className="btn btn-danger btn-icon"
              title="Delete Invoice"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Linked Estimate Banner if converted */}
      {invoice.estimateNumber && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <FileCheck size={20} />
            <span>Generated from Approved Sales Estimate <strong>{invoice.estimateNumber}</strong></span>
          </div>
          {invoice.estimateId && (
            <Link to={`/estimates/${invoice.estimateId}`} className="btn btn-sm btn-outline-primary">
              View Source Estimate &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Balance Due Notice */}
      {balDue > 0 && !isCancelled && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} />
            <span>
              Outstanding payment balance due of <strong>₹{balDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>. Due on {invoice.dueDate}.
            </span>
          </div>
          <button onClick={openPaymentModal} className="btn btn-sm btn-success">
            Pay Now
          </button>
        </div>
      )}

      {/* Client and Metadata Cards */}
      <div className="grid grid-2 gap-4 mb-4">
        {/* Client Info */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <Building size={18} /> Billed To (Client)
            </h3>
          </div>
          <div>
            <h4 className="m-0 mb-1">{invoice.clientName || 'N/A'}</h4>
            <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <span className="text-muted text-xs d-block">Client GSTIN</span>
                <strong>{invoice.clientGstin || 'Unregistered / None'}</strong>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Email</span>
                <span>{invoice.clientEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Phone</span>
                <span>{invoice.clientPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Billing City / State</span>
                <span>{invoice.clientCity ? `${invoice.clientCity}, ${invoice.clientState || ''}` : 'N/A'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span className="text-muted text-xs d-block">Address</span>
                <span>{invoice.clientAddress || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <FileText size={18} /> Invoice Details
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <span className="text-muted text-xs d-block">Invoice Number</span>
              <strong>{invoice.invoiceNumber}</strong>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Invoice Date</span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-muted" /> {invoice.invoiceDate}
              </span>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Due Date</span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-muted" /> {invoice.dueDate}
              </span>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Salesperson In Charge</span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} className="text-muted" /> {invoice.salespersonName || 'Unassigned'}
              </span>
            </div>
            {invoice.notes && (
              <div style={{ gridColumn: 'span 2' }}>
                <span className="text-muted text-xs d-block">Terms / Notes</span>
                <p className="m-0 text-sm bg-light p-2 rounded">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title">Particulars / Goods & Services</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Item Description</th>
                <th className="text-right" style={{ width: '120px' }}>Qty</th>
                <th className="text-right" style={{ width: '150px' }}>Unit Price (₹)</th>
                <th className="text-right" style={{ width: '120px' }}>Discount (₹)</th>
                <th className="text-right" style={{ width: '150px' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No items in this invoice</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.invoiceItemId || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.description}</strong>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right text-muted">
                      {Number(item.discount || 0) > 0 ? `- ₹${Number(item.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="text-right font-weight-bold">
                      ₹{Number(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="d-flex justify-content-end mt-4">
          <div style={{ width: '100%', maxWidth: '400px' }} className="bg-light p-3 rounded">
            <div className="d-flex justify-content-between py-1">
              <span className="text-muted">Subtotal:</span>
              <span>₹{Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {Number(invoice.discount || 0) > 0 && (
              <div className="d-flex justify-content-between py-1 text-danger">
                <span>Total Discount:</span>
                <span>- ₹{Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="d-flex justify-content-between py-1 border-top">
              <span className="text-muted">Taxable Value:</span>
              <strong>₹{Number(invoice.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div className="d-flex justify-content-between py-1">
              <span className="text-muted">GST ({invoice.gstRate || 18}%):</span>
              <span>₹{Number(invoice.gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-top border-2 mt-2 font-weight-bold text-lg">
              <span>Grand Total:</span>
              <span className="text-primary">₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="d-flex justify-content-between py-1 text-success border-top">
              <span>Amount Paid:</span>
              <strong>- ₹{Number(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div className={`d-flex justify-content-between py-2 border-top border-2 font-weight-bold text-lg ${balDue > 0 ? 'text-danger' : 'text-success'}`}>
              <span>Balance Due:</span>
              <span>₹{balDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="card">
        <div className="card-header border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
          <h3 className="card-title text-primary d-flex align-items-center gap-2">
            <DollarSign size={18} /> Payment Receipts & Transactions ({payments.length})
          </h3>
          {balDue > 0 && !isCancelled && (
            <button onClick={openPaymentModal} className="btn btn-sm btn-outline-success">
              + Record Payment
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <Clock size={32} className="mb-2" />
            <p>No payments recorded yet for this invoice.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Reference #</th>
                  <th>Method</th>
                  <th>Recorded By</th>
                  <th className="text-right">Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p.paymentId || idx}>
                    <td>{p.paymentDate}</td>
                    <td>
                      <code>{p.paymentReference || 'N/A'}</code>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{p.paymentMethod}</span>
                    </td>
                    <td>{p.recordedByName || 'System'}</td>
                    <td className="text-right font-weight-bold text-success">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className="badge badge-success">{p.status || 'SUCCESS'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <Modal 
          isOpen={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)}
          title={`Record Payment for ${invoice.invoiceNumber}`}
        >
          <form onSubmit={handlePaymentSubmit}>
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total Invoice:</span>
                <span>₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 text-success">
                <span className="text-muted">Already Paid:</span>
                <span>₹{Number(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between text-danger font-weight-bold border-top pt-1">
                <span>Remaining Balance Due:</span>
                <span>₹{balDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label required">Payment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balanceDue}
                className="form-control"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
              <small className="text-muted">Max allowed: ₹{balDue.toFixed(2)}</small>
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
              <label className="form-label">Reference / UTR / Cheque Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. UTR-99881122"
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Optional notes or remarks..."
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
                {paymentSubmitting ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
