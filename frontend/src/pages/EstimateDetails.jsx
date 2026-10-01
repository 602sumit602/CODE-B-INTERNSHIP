import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, ArrowLeft, CheckCircle, XCircle, ArrowRightCircle, 
  Printer, Edit2, Trash2, Calendar, User, Building, Mail, Phone,
  FileCheck, AlertCircle, Clock
} from 'lucide-react';
import { estimateService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function EstimateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      const res = await estimateService.getEstimateById(id);
      if (res.data?.success) {
        setEstimate(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load estimate details');
      navigate('/estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this estimate?')) return;
    try {
      setActionLoading(true);
      await estimateService.approveEstimate(id);
      toast.success('Estimate marked as APPROVED');
      fetchEstimate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve estimate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this estimate?')) return;
    try {
      setActionLoading(true);
      await estimateService.rejectEstimate(id);
      toast.info('Estimate marked as REJECTED');
      fetchEstimate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject estimate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!window.confirm('Are you sure you want to convert this estimate to an official invoice?')) return;
    try {
      setActionLoading(true);
      const res = await estimateService.convertToInvoice(id);
      toast.success('Successfully converted to Invoice!');
      if (res.data?.data?.id) {
        navigate(`/invoices/${res.data.data.id}`);
      } else {
        fetchEstimate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert estimate to invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this estimate? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await estimateService.deleteEstimate(id);
      toast.success('Estimate deleted successfully');
      navigate('/estimates');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete estimate');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-neutral"><Clock size={13} /> Draft</span>;
      case 'SENT':
        return <span className="badge badge-info"><Mail size={13} /> Sent</span>;
      case 'APPROVED':
        return <span className="badge badge-success"><CheckCircle size={13} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger"><XCircle size={13} /> Rejected</span>;
      case 'CONVERTED_TO_INVOICE':
        return <span className="badge badge-purple"><FileCheck size={13} /> Converted to Invoice</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="card loading-container" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
        <p>Loading estimate details...</p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="card text-center p-5">
        <AlertCircle size={48} className="text-muted mb-3" />
        <h3>Estimate Not Found</h3>
        <p className="text-muted">The requested estimate does not exist or has been removed.</p>
        <Link to="/estimates" className="btn btn-secondary mt-3">
          <ArrowLeft size={16} /> Back to Estimates
        </Link>
      </div>
    );
  }

  const items = estimate.items || [];
  const isApproved = estimate.status === 'APPROVED';
  const isConverted = estimate.status === 'CONVERTED_TO_INVOICE';
  const canEdit = estimate.status === 'DRAFT' || estimate.status === 'SENT';

  return (
    <div className="page-container">
      {/* Header & Actions */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/estimates')} className="btn btn-icon btn-secondary" title="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="page-title m-0">Estimate {estimate.estimateNumber}</h1>
              {getStatusBadge(estimate.status)}
            </div>
            <p className="text-muted m-0">Created on {estimate.estimateDate || 'N/A'}</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print
          </button>

          {canEdit && (
            <Link to={`/estimates/${estimate.id}/edit`} className="btn btn-secondary">
              <Edit2 size={16} /> Edit
            </Link>
          )}

          {estimate.status !== 'APPROVED' && estimate.status !== 'CONVERTED_TO_INVOICE' && (
            <button 
              onClick={handleApprove} 
              disabled={actionLoading} 
              className="btn btn-success"
            >
              <CheckCircle size={16} /> Approve
            </button>
          )}

          {estimate.status !== 'REJECTED' && estimate.status !== 'CONVERTED_TO_INVOICE' && (
            <button 
              onClick={handleReject} 
              disabled={actionLoading} 
              className="btn btn-outline-danger"
            >
              <XCircle size={16} /> Reject
            </button>
          )}

          {isApproved && (
            <button 
              onClick={handleConvertToInvoice} 
              disabled={actionLoading} 
              className="btn btn-primary"
            >
              <ArrowRightCircle size={16} /> Convert to Invoice
            </button>
          )}

          {isAdmin && !isConverted && (
            <button 
              onClick={handleDelete} 
              disabled={actionLoading} 
              className="btn btn-danger btn-icon"
              title="Delete Estimate"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Converted Alert Banner */}
      {isConverted && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <FileCheck size={20} />
            <span>This estimate has been successfully converted into an official invoice.</span>
          </div>
          {estimate.convertedInvoiceId && (
            <Link to={`/invoices/${estimate.convertedInvoiceId}`} className="btn btn-sm btn-primary">
              View Converted Invoice &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-2 gap-4 mb-4">
        {/* Client Card */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <Building size={18} /> Client Information
            </h3>
          </div>
          <div className="client-info-body">
            <h4 className="m-0 mb-1">{estimate.clientName || 'N/A'}</h4>
            {estimate.clientCompany && <p className="text-muted mb-2">{estimate.clientCompany}</p>}
            
            <div className="info-grid mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span className="text-muted text-xs d-block">GSTIN</span>
                <strong>{estimate.clientGstin || 'Unregistered / None'}</strong>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Email</span>
                <span>{estimate.clientEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Phone</span>
                <span>{estimate.clientPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted text-xs d-block">Address</span>
                <span>{estimate.clientAddress || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimate Details Card */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <FileText size={18} /> Estimate Metadata
            </h3>
          </div>
          <div className="meta-info-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <span className="text-muted text-xs d-block">Estimate Number</span>
              <strong>{estimate.estimateNumber}</strong>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Estimate Date</span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-muted" /> {estimate.estimateDate}
              </span>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Valid Until</span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-muted" /> {estimate.validUntil || 'Not Specified'}
              </span>
            </div>
            <div>
              <span className="text-muted text-xs d-block">Salesperson</span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} className="text-muted" /> {estimate.salespersonName || 'Unassigned'}
              </span>
            </div>
            {estimate.notes && (
              <div style={{ gridColumn: 'span 2' }}>
                <span className="text-muted text-xs d-block">Notes / Terms</span>
                <p className="m-0 text-sm bg-light p-2 rounded">{estimate.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title">Estimated Items & Services</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Item Description</th>
                <th className="text-right" style={{ width: '120px' }}>Qty</th>
                <th className="text-right" style={{ width: '150px' }}>Unit Price (₹)</th>
                <th className="text-right" style={{ width: '150px' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No items in this estimate</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.description}</strong>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
          <div style={{ width: '100%', maxWidth: '380px' }} className="bg-light p-3 rounded">
            <div className="d-flex justify-content-between py-1">
              <span className="text-muted">Gross Subtotal:</span>
              <span>₹{Number(estimate.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {Number(estimate.discount || 0) > 0 && (
              <div className="d-flex justify-content-between py-1 text-danger">
                <span>Discount ({estimate.discountPercentage || 0}%):</span>
                <span>- ₹{Number(estimate.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="d-flex justify-content-between py-1 border-top">
              <span className="text-muted">Taxable Amount:</span>
              <strong>₹{Number(estimate.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div className="d-flex justify-content-between py-1">
              <span className="text-muted">GST ({estimate.gstRate || 18}%):</span>
              <span>₹{Number(estimate.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-top border-2 mt-2 font-weight-bold text-lg text-primary">
              <span>Grand Total:</span>
              <span>₹{Number(estimate.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
