import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  clientService, groupService, chainService, 
  brandService, subzoneService 
} from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Clients = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  // Filters
  const [groupId, setGroupId] = useState('');
  const [chainId, setChainId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [subzoneId, setSubzoneId] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown lists
  const [groups, setGroups] = useState([]);
  const [chains, setChains] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subzones, setSubzones] = useState([]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    gstin: '',
    groupId: '',
    chainId: '',
    brandId: '',
    subzoneId: '',
    status: 'ACTIVE',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load dropdowns once
  useEffect(() => {
    groupService.getActiveGroups().then((res) => setGroups(res.data?.data || [])).catch(() => {});
    chainService.getActiveChains().then((res) => setChains(res.data?.data || [])).catch(() => {});
    brandService.getActiveBrands().then((res) => setBrands(res.data?.data || [])).catch(() => {});
    subzoneService.getActiveSubzones().then((res) => setSubzones(res.data?.data || [])).catch(() => {});
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await clientService.getClients({
        search,
        groupId: groupId || undefined,
        chainId: chainId || undefined,
        brandId: brandId || undefined,
        subzoneId: subzoneId || undefined,
        status: status || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setClients(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load client accounts');
    } finally {
      setLoading(false);
    }
  }, [search, groupId, chainId, brandId, subzoneId, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      clientName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'Maharashtra',
      gstin: '',
      groupId: '',
      chainId: '',
      brandId: '',
      subzoneId: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      gstin: client.gstin || '',
      groupId: client.groupId ? String(client.groupId) : '',
      chainId: client.chainId ? String(client.chainId) : '',
      brandId: client.brandId ? String(client.brandId) : '',
      subzoneId: client.subzoneId ? String(client.subzoneId) : '',
      status: client.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        ...formData,
        groupId: formData.groupId ? Number(formData.groupId) : null,
        chainId: formData.chainId ? Number(formData.chainId) : null,
        brandId: formData.brandId ? Number(formData.brandId) : null,
        subzoneId: formData.subzoneId ? Number(formData.subzoneId) : null,
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.clientId, payload);
        toast.success(`Client ${formData.clientName} updated successfully`);
      } else {
        await clientService.createClient(payload);
        toast.success(`Client ${formData.clientName} created successfully`);
      }

      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving client');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"? This action cannot be undone.`)) {
      try {
        await clientService.deleteClient(id);
        toast.success(`Client "${name}" deleted`);
        fetchClients();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const columns = [
    {
      header: 'Client ID',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.clientId}</span>,
      width: '90px',
    },
    {
      header: 'Client / Organization',
      accessor: (r) => (
        <div>
          <Link to={`/clients/${r.clientId}`} style={{ fontWeight: 600, color: '#0f172a' }}>
            {r.clientName}
          </Link>
          {r.city && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.city}, {r.state}</div>}
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.contactPerson || '-'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email || r.phone || ''}</div>
        </div>
      ),
    },
    {
      header: 'Organization Hierarchy',
      accessor: (r) => (
        <div style={{ fontSize: '0.75rem' }}>
          <div>Group: <strong>{r.groupName || 'None'}</strong></div>
          <div>Chain: <strong>{r.chainName || 'None'}</strong></div>
          {r.brandName && <div>Brand: <strong>{r.brandName}</strong></div>}
        </div>
      ),
    },
    {
      header: 'Subzone',
      accessor: (r) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{r.subzoneName || '-'}</div>
          {r.subzoneRegion && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({r.subzoneRegion} Zone)</span>}
        </div>
      ),
    },
    {
      header: 'GSTIN',
      accessor: (r) => r.gstin ? (
        <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
          {r.gstin}
        </code>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Not Registered</span>
      ),
    },
    {
      header: 'Status',
      accessor: (r) => (
        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
          {r.status}
        </span>
      ),
      width: '100px',
    },
    {
      header: 'Actions',
      accessor: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Link
            to={`/clients/${r.clientId}`}
            className="btn-icon"
            title="View Details"
          >
            <Eye size={15} />
          </Link>
          <button
            onClick={() => handleOpenEdit(r)}
            className="btn-icon"
            title="Edit Client"
          >
            <Edit size={15} />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(r.clientId, r.clientName)}
              className="btn-icon"
              style={{ color: '#ef4444' }}
              title="Delete Client"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
      width: '120px',
    },
  ];

  const filterComponent = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <select
        className="form-select"
        value={groupId}
        onChange={(e) => { setGroupId(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Groups</option>
        {groups.map((g) => (
          <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
        ))}
      </select>

      <select
        className="form-select"
        value={chainId}
        onChange={(e) => { setChainId(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Chains</option>
        {chains.map((c) => (
          <option key={c.chainId} value={c.chainId}>{c.chainName}</option>
        ))}
      </select>

      <select
        className="form-select"
        value={subzoneId}
        onChange={(e) => { setSubzoneId(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Subzones</option>
        {subzones.map((s) => (
          <option key={s.subzoneId} value={s.subzoneId}>{s.subzoneName}</option>
        ))}
      </select>

      <select
        className="form-select"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Clients</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Manage client profiles, organization hierarchies, GSTIN numbers, and billing contacts
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          id="btn-add-client"
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={clients}
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
        searchPlaceholder="Search by name, contact, GSTIN, city..."
        filterComponent={filterComponent}
        onRetry={fetchClients}
        emptyMessage="No clients found matching the selected filters."
      />

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client Account' : 'Add New Client Organization'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="clientName">Client / Company Name *</label>
              <input
                id="clientName"
                type="text"
                className="form-control"
                placeholder="e.g. Acme Retail Ventures Ltd"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactPerson">Contact Person</label>
              <input
                id="contactPerson"
                type="text"
                className="form-control"
                placeholder="e.g. Rajesh Sharma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                className="form-control"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gstin">GSTIN (15 Alphanumeric)</label>
              <input
                id="gstin"
                type="text"
                className="form-control"
                placeholder="27AABCU9603R1ZM"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              />
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Format: 27AABCU9603R1ZM</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="address">Registered Address</label>
              <input
                id="address"
                type="text"
                className="form-control"
                placeholder="Suite, Street, Industrial Area"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                className="form-control"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                className="form-control"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="groupId">Group</label>
              <select
                id="groupId"
                className="form-select"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              >
                <option value="">None / Independent</option>
                {groups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chainId">Chain</label>
              <select
                id="chainId"
                className="form-select"
                value={formData.chainId}
                onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
              >
                <option value="">None / Standalone</option>
                {chains.map((c) => (
                  <option key={c.chainId} value={c.chainId}>{c.chainName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="brandId">Brand</label>
              <select
                id="brandId"
                className="form-select"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              >
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subzoneId">Subzone</label>
              <select
                id="subzoneId"
                className="form-select"
                value={formData.subzoneId}
                onChange={(e) => setFormData({ ...formData, subzoneId: e.target.value })}
              >
                <option value="">Select Subzone</option>
                {subzones.map((s) => (
                  <option key={s.subzoneId} value={s.subzoneId}>{s.subzoneName} ({s.region})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">Account Status</label>
              <select
                id="status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
