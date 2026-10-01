import React, { useState, useEffect, useCallback } from 'react';
import { subzoneService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Subzones = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [subzones, setSubzones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubzone, setEditingSubzone] = useState(null);
  const [formData, setFormData] = useState({ subzoneName: '', region: 'West', description: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubzones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await subzoneService.getSubzones({
        search,
        region: region || undefined,
        status: status || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setSubzones(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subzones');
    } finally {
      setLoading(false);
    }
  }, [search, region, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubzones();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchSubzones]);

  const handleOpenAdd = () => {
    setEditingSubzone(null);
    setFormData({ subzoneName: '', region: 'West', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subzone) => {
    setEditingSubzone(subzone);
    setFormData({
      subzoneName: subzone.subzoneName || '',
      region: subzone.region || 'West',
      description: subzone.description || '',
      status: subzone.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subzoneName.trim() || !formData.region.trim()) {
      toast.error('Subzone name and region are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubzone) {
        await subzoneService.updateSubzone(editingSubzone.subzoneId, formData);
        toast.success(`Subzone "${formData.subzoneName}" updated`);
      } else {
        await subzoneService.createSubzone(formData);
        toast.success(`Subzone "${formData.subzoneName}" created`);
      }

      setIsModalOpen(false);
      fetchSubzones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving subzone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete subzone "${name}"?`)) {
      try {
        await subzoneService.deleteSubzone(id);
        toast.success(`Subzone "${name}" deleted`);
        fetchSubzones();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete subzone');
      }
    }
  };

  const columns = [
    {
      header: 'Subzone ID',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.subzoneId}</span>,
      width: '90px',
    },
    {
      header: 'Subzone Name',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.subzoneName}</span>,
    },
    {
      header: 'Region / Territory',
      accessor: (r) => (
        <span style={{ fontWeight: 600, color: '#2563eb' }}>
          {r.region} Zone
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Description / Corridors',
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
          <button onClick={() => handleOpenEdit(r)} className="btn-icon" title="Edit Subzone">
            <Edit size={15} />
          </button>
          {isAdmin && (
            <button onClick={() => handleDelete(r.subzoneId, r.subzoneName)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete Subzone">
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
        value={region}
        onChange={(e) => { setRegion(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Regions</option>
        <option value="West">West</option>
        <option value="North">North</option>
        <option value="South">South</option>
        <option value="East">East</option>
        <option value="Central">Central</option>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Subzones</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Geographical sales subzones and regional territories for client distribution
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" id="btn-add-subzone">
          <Plus size={16} /> Add Subzone
        </button>
      </div>

      <DataTable
        columns={columns}
        data={subzones}
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
        searchPlaceholder="Search subzones by name, region..."
        filterComponent={filterComponent}
        onRetry={fetchSubzones}
        emptyMessage="No subzones found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubzone ? 'Edit Subzone' : 'Add New Subzone'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="subzoneName">Subzone Name *</label>
            <input
              id="subzoneName"
              type="text"
              className="form-control"
              placeholder="e.g. North Mumbai Metro"
              value={formData.subzoneName}
              onChange={(e) => setFormData({ ...formData, subzoneName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="region">Region / Zone *</label>
            <select
              id="region"
              className="form-select"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
            >
              <option value="West">West</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="Central">Central</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description / Corridors</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              placeholder="Key industrial corridors, IT parks..."
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
              {submitting ? 'Saving...' : editingSubzone ? 'Update Subzone' : 'Create Subzone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subzones;
