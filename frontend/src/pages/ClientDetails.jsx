import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { 
  Building2, Mail, Phone, MapPin, 
  FileSpreadsheet, FileText, CreditCard, 
  ArrowLeft, Plus, ExternalLink 
} from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const toast = useToast();

  const [client, setClient] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const [cRes, eRes, iRes, pRes] = await Promise.all([
          clientService.getClientById(id),
          clientService.getClientEstimates(id),
          clientService.getClientInvoices(id),
          clientService.getClientPayments(id),
        ]);

        if (cRes.data?.success) setClient(cRes.data.data);
        if (eRes.data?.success) setEstimates(eRes.data.data || []);
        if (iRes.data?.success) setInvoices(iRes.data.data || []);
        if (pRes.data?.success) setPayments(pRes.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '0.75rem', color: '#64748b' }}>Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Client not found</h3>
        <Link to="/clients" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Clients
        </Link>
      </div>
    );
  }

  const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (Number(i.amountPaid) || 0), 0);
  const totalDue = invoices.reduce((acc, i) => acc + (Number(i.balanceDue) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/clients" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Clients List
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/estimates/new?clientId=${client.clientId}`} className="btn btn-secondary btn-sm">
            <Plus size={14} /> New Estimate
          </Link>
          <Link to={`/invoices/new?clientId=${client.clientId}`} className="btn btn-primary btn-sm">
            <Plus size={14} /> New Invoice
          </Link>
        </div>
      </div>

      {/* Main Client Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{client.clientName}</h1>
              <span className={`badge ${client.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                {client.status}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Client ID: <strong>#{client.clientId}</strong> &bull; Contact: <strong>{client.contactPerson || 'Not provided'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Billed</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                INR {totalBilled.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Collected</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                INR {totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding Balance</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: totalDue > 0 ? '#ef4444' : '#64748b' }}>
                INR {totalDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>EMAIL ADDRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Mail size={14} color="#64748b" /> {client.email || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>PHONE NUMBER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Phone size={14} color="#64748b" /> {client.phone || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>GST NUMBER (GSTIN)</div>
            <div style={{ marginTop: '0.2rem' }}>
              {client.gstin ? (
                <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                  {client.gstin}
                </code>
              ) : 'Unregistered'}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>LOCATION / ADDRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <MapPin size={14} color="#64748b" /> {client.address ? `${client.address}, ${client.city || ''}, ${client.state || ''}` : `${client.city || ''} ${client.state || ''}`}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>CHAIN & GROUP</div>
            <div style={{ marginTop: '0.2rem' }}>
              {client.chainName || 'No Chain'} ({client.groupName || 'No Group'})
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>BRAND & SUBZONE</div>
            <div style={{ marginTop: '0.2rem' }}>
              {client.brandName || 'No Brand'} &bull; {client.subzoneName || 'No Subzone'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Invoices, Estimates, Payments */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'invoices' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'invoices' ? 'var(--primary)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FileText size={16} /> Tax Invoices ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab('estimates')}
            style={{
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'estimates' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'estimates' ? 'var(--primary)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FileSpreadsheet size={16} /> Sales Estimates ({estimates.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            style={{
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'payments' ? 'var(--primary)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CreditCard size={16} /> Payment History ({payments.length})
          </button>
        </div>

        {/* Tab Content: Invoices */}
        {activeTab === 'invoices' && (
          <div style={{ padding: '1rem' }}>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No invoices found for this client.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Total (INR)</th>
                      <th style={{ textAlign: 'right' }}>Paid (INR)</th>
                      <th style={{ textAlign: 'right' }}>Balance (INR)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.invoiceId}>
                        <td>
                          <Link to={`/invoices/${inv.invoiceId}`} style={{ fontWeight: 600 }}>
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td>{inv.invoiceDate}</td>
                        <td>{inv.dueDate}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          INR {Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: '#10b981' }}>
                          INR {Number(inv.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: inv.balanceDue > 0 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                          INR {Number(inv.balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge badge-${inv.status.toLowerCase()}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/invoices/${inv.invoiceId}`} className="btn-icon">
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Estimates */}
        {activeTab === 'estimates' && (
          <div style={{ padding: '1rem' }}>
            {estimates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No estimates found for this client.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estimate #</th>
                      <th>Date</th>
                      <th>Valid Until</th>
                      <th>Salesperson</th>
                      <th style={{ textAlign: 'right' }}>Grand Total (INR)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((est) => (
                      <tr key={est.estimateId}>
                        <td>
                          <Link to={`/estimates/${est.estimateId}`} style={{ fontWeight: 600 }}>
                            {est.estimateNumber}
                          </Link>
                        </td>
                        <td>{est.estimateDate}</td>
                        <td>{est.validUntil}</td>
                        <td>{est.salespersonName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          INR {Number(est.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge badge-${est.status.toLowerCase()}`}>
                            {est.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/estimates/${est.estimateId}`} className="btn-icon">
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Payments */}
        {activeTab === 'payments' && (
          <div style={{ padding: '1rem' }}>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No payments recorded yet for this client.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.paymentId}>
                        <td style={{ fontWeight: 600 }}>#{p.paymentId}</td>
                        <td>
                          <Link to={`/invoices/${p.invoiceId}`} style={{ fontWeight: 500 }}>
                            {p.invoiceNumber}
                          </Link>
                        </td>
                        <td>{p.paymentDate}</td>
                        <td>{p.paymentMethod}</td>
                        <td><code style={{ fontSize: '0.75rem' }}>{p.paymentReference || '-'}</code></td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          INR {Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge badge-${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
