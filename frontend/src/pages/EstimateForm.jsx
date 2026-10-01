import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { estimateService, clientService, chainService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, ArrowLeft, Save, Send, CheckCircle2 } from 'lucide-react';

const EstimateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const isEdit = Boolean(id);

  const [clients, setClients] = useState([]);
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Form State
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [chainId, setChainId] = useState('');
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('DRAFT');
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState([
    { description: 'POS Barcode Scanner Enterprise Edition', quantity: 5, unitPrice: 8500, discount: 2500 },
  ]);

  // Load clients and chains
  useEffect(() => {
    clientService.getActiveClients().then((res) => {
      setClients(res.data?.data || []);
      if (!isEdit && !clientId && res.data?.data?.length > 0) {
        setClientId(String(res.data.data[0].clientId));
        if (res.data.data[0].chainId) setChainId(String(res.data.data[0].chainId));
      }
    }).catch(() => {});

    chainService.getActiveChains().then((res) => setChains(res.data?.data || [])).catch(() => {});
  }, [isEdit, clientId]);

  // Load existing estimate if edit mode
  useEffect(() => {
    if (isEdit) {
      estimateService.getEstimateById(id)
        .then((res) => {
          if (res.data?.success) {
            const est = res.data.data;
            setClientId(String(est.clientId));
            if (est.chainId) setChainId(String(est.chainId));
            setEstimateDate(est.estimateDate);
            setValidUntil(est.validUntil);
            setStatus(est.status);
            setGstRate(Number(est.gstRate) || 18);
            setNotes(est.notes || '');
            if (est.items?.length > 0) {
              setItems(
                est.items.map((i) => ({
                  description: i.description,
                  quantity: i.quantity,
                  unitPrice: Number(i.unitPrice),
                  discount: Number(i.discount) || 0,
                }))
              );
            }
          }
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Failed to load estimate');
          navigate('/estimates');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate, toast]);

  // When client changes, auto-fill client's chain if available
  const handleClientChange = (cId) => {
    setClientId(cId);
    const selected = clients.find((c) => String(c.clientId) === String(cId));
    if (selected && selected.chainId) {
      setChainId(String(selected.chainId));
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.warning('At least one line item is required in the estimate.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Live client-side financial calculations preview
  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const totalDiscount = items.reduce((acc, item) => acc + (Number(item.discount) || 0), 0);
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const gstAmount = (taxableAmount * Number(gstRate)) / 100;
  const grandTotal = taxableAmount + gstAmount;

  const handleSubmit = async (targetStatus) => {
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      toast.error('All line items must have a description');
      return;
    }

    if (items.some((i) => Number(i.quantity) <= 0)) {
      toast.error('Quantity must be greater than zero for all items');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        clientId: Number(clientId),
        chainId: chainId ? Number(chainId) : null,
        estimateDate,
        validUntil,
        status: targetStatus || status,
        gstRate: Number(gstRate),
        notes,
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount) || 0,
        })),
      };

      if (isEdit) {
        await estimateService.updateEstimate(id, payload);
        toast.success('Estimate updated successfully');
      } else {
        const res = await estimateService.createEstimate(payload);
        toast.success(`Estimate ${res.data?.data?.estimateNumber} created successfully!`);
      }

      navigate('/estimates');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving estimate');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '0.75rem', color: '#64748b' }}>Loading estimate form...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Back link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/estimates" className="btn-icon">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {isEdit ? 'Edit Sales Proposal' : 'Create Sales Estimate'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Configure line items, automatic GST computation, client associations, and terms
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
          >
            <Save size={16} /> Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit('SENT')}
            disabled={loading}
          >
            <Send size={16} /> Send to Client
          </button>
        </div>
      </div>

      {/* Basic Metadata Card */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>
          1. Client & Proposal Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="clientSelect">Client Organization *</label>
            <select
              id="clientSelect"
              className="form-select"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              required
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.clientName} {c.gstin ? `(${c.gstin})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="chainSelect">Store Chain (Optional)</label>
            <select
              id="chainSelect"
              className="form-select"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
            >
              <option value="">None / Standalone</option>
              {chains.map((c) => (
                <option key={c.chainId} value={c.chainId}>{c.chainName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="estimateDate">Estimate Date *</label>
            <input
              id="estimateDate"
              type="date"
              className="form-control"
              value={estimateDate}
              onChange={(e) => setEstimateDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="validUntil">Valid Until *</label>
            <input
              id="validUntil"
              type="date"
              className="form-control"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gstRate">Applicable GST Rate (%)</label>
            <select
              id="gstRate"
              className="form-select"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
            >
              <option value={0}>0% (Exempt)</option>
              <option value={5}>5% GST</option>
              <option value={12}>12% GST</option>
              <option value={18}>18% GST (Standard)</option>
              <option value={28}>28% GST</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="statusSelect">Estimate Status</label>
            <select
              id="statusSelect"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Line Items Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>2. Estimate Line Items</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Itemized bill of materials, software licenses, or hardware terminals</p>
          </div>

          <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm" id="btn-add-item">
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Description *</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Qty *</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Unit Price (INR) *</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Discount (INR)</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total (INR)</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const lineTotal = Math.max(0, (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) - (Number(item.discount) || 0));
                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Item or service description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        style={{ textAlign: 'right' }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        style={{ textAlign: 'right' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        style={{ textAlign: 'right' }}
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      INR {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Remove Line Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <label className="form-label" htmlFor="notes">Proposal Terms & Notes</label>
            <textarea
              id="notes"
              className="form-control"
              rows={4}
              placeholder="Terms of delivery, payment milestones, scope inclusions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Financial Calculation Summary
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>Gross Subtotal:</span>
              <span style={{ fontWeight: 600 }}>INR {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>Item Discounts:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>- INR {totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>Taxable Amount:</span>
              <span style={{ fontWeight: 700 }}>INR {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>GST ({gstRate}%):</span>
              <span style={{ fontWeight: 600 }}>INR {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '0.75rem', fontSize: '1.1rem' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>Grand Total:</span>
              <span style={{ fontWeight: 800, color: '#4f46e5' }}>INR {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;
