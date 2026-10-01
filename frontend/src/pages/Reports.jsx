import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Download, Calendar, Filter, Users, FileText, 
  DollarSign, AlertTriangle, CheckCircle, ArrowDownToLine, RefreshCw
} from 'lucide-react';
import { reportService, clientService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'outstanding' | 'exports'

  // Sales Report State
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);

  // Outstanding Report State
  const [outstandingData, setOutstandingData] = useState(null);
  const [outstandingLoading, setOutstandingLoading] = useState(false);
  const [outstandingClient, setOutstandingClient] = useState('');

  // Export Loading States
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'outstanding') {
      fetchOutstandingReport();
    }
  }, [activeTab, startDate, endDate, selectedClient, outstandingClient]);

  const fetchClients = async () => {
    try {
      const res = await clientService.getActiveClients();
      if (res.data?.success) {
        setClients(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load clients for reports', err);
    }
  };

  const fetchSalesReport = async () => {
    try {
      setSalesLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedClient) params.clientId = selectedClient;

      const res = await reportService.getSalesReport(params);
      if (res.data?.success) {
        setSalesData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch sales performance data');
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchOutstandingReport = async () => {
    try {
      setOutstandingLoading(true);
      const params = {};
      if (outstandingClient) params.clientId = outstandingClient;

      const res = await reportService.getOutstandingReport(params);
      if (res.data?.success) {
        setOutstandingData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch outstanding receivables data');
    } finally {
      setOutstandingLoading(false);
    }
  };

  const handleExportCsv = async (type) => {
    try {
      setExporting(type);
      toast.info(`Preparing ${type.toUpperCase()} CSV export...`);
      let res;
      let filename = '';

      switch (type) {
        case 'invoices':
          res = await reportService.exportInvoicesCsv();
          filename = `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'estimates':
          res = await reportService.exportEstimatesCsv();
          filename = `Estimates_Export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'payments':
          res = await reportService.exportPaymentsCsv();
          filename = `Payments_Export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'clients':
          res = await reportService.exportClientsCsv();
          filename = `Clients_Export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          return;
      }

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${type.toUpperCase()} exported successfully!`);
    } catch (err) {
      toast.error(`Failed to export ${type} CSV`);
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title m-0">Reports & Analytics</h1>
          <p className="text-muted m-0">Sales performance, revenue trends, outstanding balances, and CSV exports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4">
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <BarChart3 size={16} /> Sales Performance
        </button>
        <button
          className={`tab-btn ${activeTab === 'outstanding' ? 'active' : ''}`}
          onClick={() => setActiveTab('outstanding')}
        >
          <AlertTriangle size={16} /> Outstanding Aging & Dues
        </button>
        <button
          className={`tab-btn ${activeTab === 'exports' ? 'active' : ''}`}
          onClick={() => setActiveTab('exports')}
        >
          <ArrowDownToLine size={16} /> Data Export Center
        </button>
      </div>

      {/* TAB 1: SALES PERFORMANCE */}
      {activeTab === 'sales' && (
        <div>
          {/* Filters Bar */}
          <div className="card mb-4 p-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted text-sm font-weight-medium">Date Range:</span>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-muted text-xs">to</span>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div style={{ width: '220px' }}>
                <select
                  className="form-control form-control-sm"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">All Clients</option>
                  {clients.map(c => (
                    <option key={c.clientId || c.id} value={c.clientId || c.id}>
                      {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={fetchSalesReport} 
                className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                disabled={salesLoading}
              >
                <RefreshCw size={14} className={salesLoading ? 'spin' : ''} /> Refresh
              </button>

              <button 
                onClick={() => handleExportCsv('invoices')} 
                className="btn btn-sm btn-primary ml-auto d-flex align-items-center gap-1"
              >
                <Download size={14} /> Export Invoices CSV
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-4 gap-3 mb-4">
            <div className="card stat-card border-left-primary">
              <span className="text-muted text-xs font-weight-bold uppercase">Total Invoiced</span>
              <h3 className="m-0 text-primary mt-1">
                ₹{Number(salesData?.totalBilled || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-xs text-muted mt-1">{salesData?.invoicesCount || 0} Invoices Billed</span>
            </div>

            <div className="card stat-card border-left-success">
              <span className="text-muted text-xs font-weight-bold uppercase">Payments Collected</span>
              <h3 className="m-0 text-success mt-1">
                ₹{Number(salesData?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-xs text-muted mt-1">Realized Revenue</span>
            </div>

            <div className="card stat-card border-left-danger">
              <span className="text-muted text-xs font-weight-bold uppercase">Unpaid Receivables</span>
              <h3 className="m-0 text-danger mt-1">
                ₹{Number(salesData?.totalDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-xs text-muted mt-1">Remaining Balance Due</span>
            </div>

            <div className="card stat-card border-left-info">
              <span className="text-muted text-xs font-weight-bold uppercase">Collection Efficiency</span>
              <h3 className="m-0 text-info mt-1">
                {salesData?.totalBilled > 0 
                  ? ((Number(salesData.totalPaid) / Number(salesData.totalBilled)) * 100).toFixed(1) + '%'
                  : '0%'}
              </h3>
              <span className="text-xs text-muted mt-1">Realization Rate</span>
            </div>
          </div>

          {/* Report Invoices Table */}
          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title">Invoices in Selected Period ({salesData?.invoicesCount || 0})</h3>
            </div>
            {salesLoading ? (
              <div className="loading-container py-5">
                <div className="spinner"></div>
                <p>Calculating sales metrics...</p>
              </div>
            ) : !salesData?.invoices || salesData.invoices.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FileText size={36} className="mb-2" />
                <p>No invoices recorded for the selected period.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th className="text-right">Total Billed (₹)</th>
                      <th className="text-right">Paid (₹)</th>
                      <th className="text-right">Balance Due (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.invoices.map((inv) => (
                      <tr key={inv.invoiceId || inv.id}>
                        <td>
                          <Link to={`/invoices/${inv.invoiceId || inv.id}`} className="font-weight-bold text-primary">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td>{inv.invoiceDate}</td>
                        <td>{inv.client?.clientName || inv.clientName || 'N/A'}</td>
                        <td className="text-right font-weight-medium">
                          ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right text-success">
                          ₹{Number(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right font-weight-bold ${Number(inv.balanceDue || 0) > 0 ? 'text-danger' : 'text-muted'}`}>
                          ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OUTSTANDING REPORT */}
      {activeTab === 'outstanding' && (
        <div>
          <div className="card mb-4 p-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div style={{ width: '250px' }}>
                <select
                  className="form-control form-control-sm"
                  value={outstandingClient}
                  onChange={(e) => setOutstandingClient(e.target.value)}
                >
                  <option value="">All Clients</option>
                  {clients.map(c => (
                    <option key={c.clientId || c.id} value={c.clientId || c.id}>
                      {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={fetchOutstandingReport} 
                className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                disabled={outstandingLoading}
              >
                <RefreshCw size={14} className={outstandingLoading ? 'spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-2 gap-3 mb-4">
            <div className="card stat-card border-left-danger">
              <span className="text-muted text-xs font-weight-bold uppercase">Total Outstanding Receivables</span>
              <h2 className="m-0 text-danger mt-1">
                ₹{Number(outstandingData?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-muted mt-1">Pending collection across all open invoices</span>
            </div>

            <div className="card stat-card border-left-warning">
              <span className="text-muted text-xs font-weight-bold uppercase">Unsettled Invoices Count</span>
              <h2 className="m-0 text-warning mt-1">{outstandingData?.count || 0}</h2>
              <span className="text-xs text-muted mt-1">Invoices awaiting partial or full payment</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title text-danger">Unsettled Invoices Due</h3>
            </div>
            {outstandingLoading ? (
              <div className="loading-container py-5">
                <div className="spinner"></div>
                <p>Fetching outstanding invoices...</p>
              </div>
            ) : !outstandingData?.invoices || outstandingData.invoices.length === 0 ? (
              <div className="text-center py-5">
                <CheckCircle size={48} className="text-success mb-2" />
                <h3>No Outstanding Invoices!</h3>
                <p className="text-muted">All client accounts are clear and fully settled.</p>
              </div>
            ) : (
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
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingData.invoices.map((inv) => (
                      <tr key={inv.invoiceId || inv.id}>
                        <td>
                          <Link to={`/invoices/${inv.invoiceId || inv.id}`} className="font-weight-bold text-primary">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="font-weight-medium">{inv.client?.clientName || inv.clientName}</td>
                        <td>{inv.invoiceDate}</td>
                        <td className="text-danger font-weight-medium">{inv.dueDate}</td>
                        <td className="text-right">₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right text-success">₹{Number(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right font-weight-bold text-danger">
                          ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className="badge badge-warning">{inv.status}</span>
                        </td>
                        <td className="text-right">
                          <Link to={`/invoices/${inv.invoiceId || inv.id}`} className="btn btn-sm btn-outline-primary">
                            View / Collect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BULK EXPORT CENTER */}
      {activeTab === 'exports' && (
        <div className="grid grid-2 gap-4">
          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title text-primary d-flex align-items-center gap-2">
                <FileText size={18} /> Invoices Ledger Export
              </h3>
            </div>
            <p className="text-muted text-sm">
              Download complete commercial invoice records including customer GSTIN, tax breakdowns (CGST/SGST), subtotal, amount paid, and status.
            </p>
            <div className="mt-3">
              <button 
                onClick={() => handleExportCsv('invoices')} 
                disabled={exporting === 'invoices'}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <Download size={16} /> {exporting === 'invoices' ? 'Generating CSV...' : 'Download Invoices CSV'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title text-primary d-flex align-items-center gap-2">
                <FileText size={18} /> Sales Estimates Ledger Export
              </h3>
            </div>
            <p className="text-muted text-sm">
              Export all quotation estimates created by sales reps with line items, discount schedules, expiration dates, and approval workflow status.
            </p>
            <div className="mt-3">
              <button 
                onClick={() => handleExportCsv('estimates')} 
                disabled={exporting === 'estimates'}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <Download size={16} /> {exporting === 'estimates' ? 'Generating CSV...' : 'Download Estimates CSV'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title text-success d-flex align-items-center gap-2">
                <DollarSign size={18} /> Payments & Receipts Export
              </h3>
            </div>
            <p className="text-muted text-sm">
              Download payment collections journal with UTR transaction codes, bank transfer records, settlement timestamps, and recording users.
            </p>
            <div className="mt-3">
              <button 
                onClick={() => handleExportCsv('payments')} 
                disabled={exporting === 'payments'}
                className="btn btn-success d-flex align-items-center gap-2"
              >
                <Download size={16} /> {exporting === 'payments' ? 'Generating CSV...' : 'Download Payments CSV'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title text-info d-flex align-items-center gap-2">
                <Users size={18} /> Clients Master Directory Export
              </h3>
            </div>
            <p className="text-muted text-sm">
              Export all verified clients, verified GSTINs, corporate group/chain mappings, contact numbers, email addresses, and billing locations.
            </p>
            <div className="mt-3">
              <button 
                onClick={() => handleExportCsv('clients')} 
                disabled={exporting === 'clients'}
                className="btn btn-info text-white d-flex align-items-center gap-2"
              >
                <Download size={16} /> {exporting === 'clients' ? 'Generating CSV...' : 'Download Clients CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
