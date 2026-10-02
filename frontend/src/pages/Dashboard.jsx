import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dataService';
import StatCard from '../components/StatCard';
import {
  Users, Building2, Link2, Tag,
  FileSpreadsheet, FileText, CreditCard,
  TrendingUp, AlertCircle, Plus, ArrowUpRight,
  Clock, CheckCircle, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getSummary();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return 'INR 0';
    return `INR ${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Monthly Sales Bar Chart Data
  const monthlyChartData = {
    labels: data?.monthlySales?.map((m) => m.month) || ['Jul 2026', 'Aug 2026', 'Sep 2026'],
    datasets: [
      {
        label: 'Total Invoiced (INR)',
        data: data?.monthlySales?.map((m) => m.sales) || [120000, 210000, 312700],
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Payments Collected (INR)',
        data: data?.monthlySales?.map((m) => m.collected) || [95000, 180000, 80000],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6,
      },
    ],
  };

  // Invoice Status Doughnut
  const invDist = data?.invoiceStatusDistribution || {};
  const invoiceDoughnutData = {
    labels: ['Paid', 'Partially Paid', 'Issued / Pending', 'Overdue'],
    datasets: [
      {
        data: [
          invDist['PAID'] || 1,
          invDist['PARTIALLY_PAID'] || 1,
          invDist['ISSUED'] || 1,
          invDist['OVERDUE'] || 1,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Estimate Status Doughnut
  const estDist = data?.estimateStatusDistribution || {};
  const estimateDoughnutData = {
    labels: ['Approved', 'Converted', 'Sent', 'Draft'],
    datasets: [
      {
        data: [
          estDist['APPROVED'] || 1,
          estDist['CONVERTED'] || 1,
          estDist['SENT'] || 1,
          estDist['DRAFT'] || 1,
        ],
        backgroundColor: ['#10b981', '#8b5cf6', '#3b82f6', '#94a3b8'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Date Filter */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
            </h1>
            {isAdmin && <span className="badge badge-admin">ADMIN</span>}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {isAdmin
              ? 'Complete business overview across clients, sales estimates, tax invoices, and collections.'
              : 'Your personalized sales estimates, assigned clients, and payment collections overview.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>

          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            title="Refresh statistics"
            style={{ height: '38px' }}
          >
            <RefreshCw size={14} className={loading ? 'loading-spinner' : ''} />
          </button>

          <Link to="/estimates/new" className="btn btn-primary btn-sm" style={{ height: '38px' }}>
            <Plus size={16} /> New Estimate
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b',
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          title="Total Invoiced Sales"
          value={formatCurrency(data?.totalSales)}
          subtext={`${data?.totalInvoices || 0} Total Tax Invoices`}
          icon={TrendingUp}
          color="primary"
        />

        <StatCard
          title="Payments Collected"
          value={formatCurrency(data?.totalCollected)}
          subtext={`${data?.paidInvoices || 0} Fully Paid Invoices`}
          icon={CreditCard}
          color="success"
        />

        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(data?.totalOutstanding)}
          subtext={`${data?.overdueInvoices || 0} Overdue / Pending`}
          icon={AlertCircle}
          color="danger"
        />

        <StatCard
          title="Estimates"
          value={data?.totalEstimates || 0}
          subtext={`${data?.approvedEstimates || 0} Approved | ${data?.convertedEstimates || 0} Converted`}
          icon={FileSpreadsheet}
          color="purple"
        />

        <StatCard
          title="Client Accounts"
          value={data?.totalClients || 0}
          subtext={`${data?.activeClients || 0} Active Organizations`}
          icon={Users}
          color="info"
        />
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '1.25rem',
      }}>
        {/* Monthly Sales & Collections Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Sales & Collections Trend</h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Comparison of billed sales vs collections (INR)</p>
            </div>
            <Link to="/reports" style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Full Report <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <Bar
              data={monthlyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter' } } },
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Invoice & Estimate Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', width: '100%' }}>
              Invoice Status
            </h3>
            <div style={{ width: '180px', height: '180px', margin: 'auto' }}>
              <Doughnut
                data={invoiceDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '70%',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#10b981' }}>● Paid</span>
              <span style={{ color: '#f59e0b' }}>● Partial</span>
              <span style={{ color: '#3b82f6' }}>● Issued</span>
              <span style={{ color: '#ef4444' }}>● Overdue</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', width: '100%' }}>
              Estimates Status
            </h3>
            <div style={{ width: '180px', height: '180px', margin: 'auto' }}>
              <Doughnut
                data={estimateDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '70%',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#10b981' }}>● Approved</span>
              <span style={{ color: '#8b5cf6' }}>● Converted</span>
              <span style={{ color: '#3b82f6' }}>● Sent</span>
              <span style={{ color: '#94a3b8' }}>● Draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Organization Breakdown or Quick Workflow Links */}
      {isAdmin && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <Link to="/groups" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.75rem', borderRadius: '8px' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{data?.totalGroups || 4}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Client Groups</div>
            </div>
          </Link>

          <Link to="/chains" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '8px' }}>
              <Link2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{data?.totalChains || 5}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Store Chains</div>
            </div>
          </Link>

          <Link to="/brands" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '0.75rem', borderRadius: '8px' }}>
              <Tag size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{data?.totalBrands || 5}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Product Brands</div>
            </div>
          </Link>

          <Link to="/subzones" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.75rem', borderRadius: '8px' }}>
              <MapPinIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{data?.totalSubzones || 6}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Sales Subzones</div>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Activity Trail */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Activity & Audit Trail</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Latest actions recorded across estimates, invoices, and payments</p>
          </div>
          {isAdmin && (
            <span className="badge badge-admin">Live System Log</span>
          )}
        </div>

        {data?.recentActivities?.length > 0 ? (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivities.map((act) => (
                  <tr key={act.logId}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{act.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{act.username}</td>
                    <td>
                      <span className="badge badge-draft" style={{ fontSize: '0.65rem' }}>{act.action}</span>
                    </td>
                    <td><span style={{ fontWeight: 500, color: '#4f46e5' }}>{act.module}</span></td>
                    <td style={{ color: '#334155' }}>{act.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

const MapPinIcon = ({ size }) => <span style={{ display: 'inline-flex', fontSize: `${size}px` }}>📍</span>;

export default Dashboard;
