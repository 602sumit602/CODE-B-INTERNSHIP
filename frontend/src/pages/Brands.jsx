import React, { useState, useEffect, useCallback } from 'react';
import { brandService, chainService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Brands = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [brands, setBrands] = useState([]);
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [chainId, setChainId] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ brandName: '', chainId: '', description: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    chainService.getActiveChains().then((res) => setChains(res.data?.data || [])).catch(() => {});
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await brandService.getBrands({
        search,
        chainId: chainId || undefined,
        status: status || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setBrands(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [search, chainId, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrands();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBrands]);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({ brandName: '', chainId: chains[0]?.chainId ? String(chains[0].chainId) : '', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      brandName: brand.brandName || '',
      chainId: brand.chainId ? String(brand.chainId) : '',
      description: brand.description || '',
      status: brand.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brandName.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        chainId: formData.chainId ? Number(formData.chainId) : null,
      };

      if (editingBrand) {
        await brandService.updateBrand(editingBrand.brandId, payload);
        toast.success(`Brand "${formData.brandName}" updated`);
      } else {
        await brandService.createBrand(payload);
        toast.success(`Brand "${formData.brandName}" created`);
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete brand "${name}"?`)) {
      try {
        await brandService.deleteBrand(id);
        toast.success(`Brand "${name}" deleted`);
        fetchBrands();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete brand');
      }
    }
  };

  const columns = [
    {
      header: 'Brand ID',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.brandId}</span>,
      width: '90px',
    },
    {
      header: 'Brand Name',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.brandName}</span>,
    },
    {
      header: 'Parent Chain & Group',
      accessor: (r) => (
        <span style={{ fontWeight: 500, color: '#334155' }}>
          {r.chainName ? `${r.chainName} (${r.groupName || 'Standalone'})` : <span style={{ color: '#94a3b8' }}>None</span>}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (r) => <span style={{ color: '#475569', fontSize: '0.8125rem' }}>{r.description || '-'}</span>,
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
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button onClick={() => handleOpenEdit(r)} className="btn-icon" title="Edit Brand">
            <Edit size={15} />
          </button>
          {isAdmin && (
            <button onClick={() => handleDelete(r.brandId, r.brandName)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete Brand">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
      width: '100px',
    },
  ];

  const filterComponent = (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Brands</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Product labels, sub-brands, and business verticals operating under store chains
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" id="btn-add-brand">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
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
        searchPlaceholder="Search brands by name..."
        filterComponent={filterComponent}
        onRetry={fetchBrands}
        emptyMessage="No brands found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="brandName">Brand Name *</label>
            <input
              id="brandName"
              type="text"
              className="form-control"
              placeholder="e.g. Hub Fresh Organics"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="chainId">Associated Chain</label>
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
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              placeholder="Brand category, product line..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Brands;
