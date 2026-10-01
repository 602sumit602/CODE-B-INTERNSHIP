import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, FileText, Building, 
  Calendar, AlertCircle, Info, Calculator 
} from 'lucide-react';
import { invoiceService, clientService, settingService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export default function InvoiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [clients, setClients] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    chainId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'ISSUED',
    gstRate: 18.00,
    notes: '',
    items: [
      { description: '', quantity: 1, unitPrice: '', discount: 0 }
    ]
  });

  useEffect(() => {
    fetchPrerequisites();
  }, [id]);

  const fetchPrerequisites = async () => {
    try {
      const clientRes = await clientService.getActiveClients();
      if (clientRes.data?.success) {
        setClients(clientRes.data.data || []);
      }

      // If Edit mode, load existing invoice
      if (isEdit) {
        const invRes = await invoiceService.getInvoiceById(id);
        if (invRes.data?.success) {
          const inv = invRes.data.data;
          setFormData({
            clientId: inv.clientId || '',
            chainId: inv.chainId || '',
            invoiceDate: inv.invoiceDate || '',
            dueDate: inv.dueDate || '',
            status: inv.status || 'ISSUED',
            gstRate: inv.gstRate || 18.00,
            notes: inv.notes || '',
            items: inv.items && inv.items.length > 0 ? inv.items.map(it => ({
              description: it.description || '',
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || '',
              discount: it.discount || 0
            })) : [{ description: '', quantity: 1, unitPrice: '', discount: 0 }]
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load initial data');
    } finally {
      setInitialLoading(false);
    }
  };

  // Item management
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, unitPrice: '', discount: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      toast.warning('Invoice must have at least one line item');
      return;
    }
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // Live Calculations
  const calculateTotals = () => {
    let grossSubtotal = 0;
    let totalItemDiscount = 0;

    formData.items.forEach(item => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      const d = parseFloat(item.discount) || 0;
      const lineTotal = q * p;
      grossSubtotal += lineTotal;
      totalItemDiscount += d;
    });

    const taxable = Math.max(0, grossSubtotal - totalItemDiscount);
    const rate = parseFloat(formData.gstRate) || 0;
    const gstAmt = (taxable * rate) / 100;
    const grandTotal = taxable + gstAmt;

    return {
      grossSubtotal,
      totalItemDiscount,
      taxable,
      gstAmt,
      grandTotal
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const it = formData.items[i];
      if (!it.description.trim()) {
        toast.error(`Item #${i + 1} requires a description`);
        return;
      }
      if (!it.quantity || it.quantity <= 0) {
        toast.error(`Item #${i + 1} quantity must be 1 or more`);
        return;
      }
      if (it.unitPrice === '' || parseFloat(it.unitPrice) < 0) {
        toast.error(`Item #${i + 1} unit price must be 0 or more`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        clientId: Number(formData.clientId),
        chainId: formData.chainId ? Number(formData.chainId) : null,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        status: formData.status,
        gstRate: parseFloat(formData.gstRate),
        notes: formData.notes,
        items: formData.items.map(it => ({
          description: it.description.trim(),
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
          discount: parseFloat(it.discount || 0)
        }))
      };

      if (isEdit) {
        await invoiceService.updateInvoice(id, payload);
        toast.success('Invoice updated successfully');
        navigate(`/invoices/${id}`);
      } else {
        const res = await invoiceService.createInvoice(payload);
        toast.success('Invoice created successfully');
        const newId = res.data?.data?.invoiceId || res.data?.data?.id;
        if (newId) {
          navigate(`/invoices/${newId}`);
        } else {
          navigate('/invoices');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="card loading-container" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
        <p>Loading invoice information...</p>
      </div>
    );
  }

  const selectedClient = clients.find(c => String(c.clientId || c.id) === String(formData.clientId));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn btn-icon btn-secondary"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title m-0">{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
            <p className="text-muted m-0">Generate a tax-compliant GST commercial invoice</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-3 gap-4 mb-4">
          {/* Main Info (2 cols) */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="card mb-4">
              <div className="card-header border-bottom pb-2 mb-3">
                <h3 className="card-title text-primary d-flex align-items-center gap-2">
                  <Building size={18} /> Client & Billing Setup
                </h3>
              </div>

              <div className="grid grid-2 gap-3 mb-3">
                <div className="form-group">
                  <label className="form-label required">Select Client</label>
                  <select
                    className="form-control"
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.clientId || c.id} value={c.clientId || c.id}>
                        {c.clientName} {c.companyName ? `(${c.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ISSUED">Issued</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>

              {/* Client Preview Details */}
              {selectedClient && (
                <div className="bg-light p-3 rounded mb-3 text-sm">
                  <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <span className="text-muted text-xs d-block">GSTIN:</span>
                      <strong>{selectedClient.gstin || 'Unregistered'}</strong>
                    </div>
                    <div>
                      <span className="text-muted text-xs d-block">Email:</span>
                      <span>{selectedClient.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted text-xs d-block">Phone:</span>
                      <span>{selectedClient.phone || 'N/A'}</span>
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                      <span className="text-muted text-xs d-block">Billing Address:</span>
                      <span>{selectedClient.address ? `${selectedClient.address}, ${selectedClient.city || ''} ${selectedClient.state || ''}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-3 gap-3">
                <div className="form-group">
                  <label className="form-label required">Invoice Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Payment Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GST Tax Rate (%)</label>
                  <select
                    className="form-control"
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (Concessional)</option>
                    <option value="12">12% (Standard 1)</option>
                    <option value="18">18% (Standard 2)</option>
                    <option value="28">28% (Luxury / Higher)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="card mb-4">
              <div className="card-header border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                <h3 className="card-title text-primary d-flex align-items-center gap-2">
                  <FileText size={18} /> Invoice Line Items
                </h3>
                <button 
                  type="button" 
                  onClick={addItem} 
                  className="btn btn-sm btn-outline-primary"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Description / Particulars</th>
                      <th style={{ width: '100px' }}>Qty</th>
                      <th style={{ width: '150px' }}>Unit Price (₹)</th>
                      <th style={{ width: '120px' }}>Discount (₹)</th>
                      <th style={{ width: '140px' }} className="text-right">Line Total (₹)</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const q = parseFloat(item.quantity) || 0;
                      const p = parseFloat(item.unitPrice) || 0;
                      const d = parseFloat(item.discount) || 0;
                      const total = Math.max(0, (q * p) - d);

                      return (
                        <tr key={index}>
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              required
                              placeholder="e.g. Enterprise Software License"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              required
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control"
                              required
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control"
                              placeholder="0.00"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            />
                          </td>
                          <td className="text-right font-weight-bold">
                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="btn btn-icon btn-sm btn-ghost text-muted hover-danger"
                              title="Delete Item"
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

              <div className="p-2">
                <button 
                  type="button" 
                  onClick={addItem} 
                  className="btn btn-sm btn-ghost text-primary d-flex align-items-center gap-1"
                >
                  <Plus size={16} /> + Add Another Item Line
                </button>
              </div>
            </div>

            {/* Notes / Terms */}
            <div className="card">
              <div className="card-header border-bottom pb-2 mb-3">
                <h3 className="card-title text-sm">Notes & Terms of Service</h3>
              </div>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Include payment terms, bank details, or delivery conditions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Right Summary Sidebar (1 col) */}
          <div>
            <div className="card sticky-top" style={{ top: '2rem' }}>
              <div className="card-header border-bottom pb-2 mb-3">
                <h3 className="card-title text-primary d-flex align-items-center gap-2">
                  <Calculator size={18} /> Financial Breakdown
                </h3>
              </div>

              <div className="summary-list">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Gross Subtotal:</span>
                  <span className="font-weight-medium">
                    ₹{totals.grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom text-danger">
                  <span>Line Item Discounts:</span>
                  <span>- ₹{totals.totalItemDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted font-weight-bold">Taxable Amount:</span>
                  <strong className="font-weight-bold">
                    ₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">GST ({formData.gstRate}%):</span>
                  <span>+ ₹{totals.gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {formData.gstRate > 0 && (
                  <div className="text-xs text-muted py-1 pl-2">
                    <div>CGST ({(formData.gstRate / 2).toFixed(1)}%): ₹{(totals.gstAmt / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div>SGST ({(formData.gstRate / 2).toFixed(1)}%): ₹{(totals.gstAmt / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                )}

                <div className="d-flex justify-content-between py-3 border-top border-2 mt-2 font-weight-bold text-lg text-primary">
                  <span>Total Amount:</span>
                  <span>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-4 d-flex flex-column gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <Save size={16} /> {loading ? 'Saving Invoice...' : (isEdit ? 'Update Invoice' : 'Create & Issue Invoice')}
                </button>

                <Link to="/invoices" className="btn btn-secondary btn-block text-center">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
