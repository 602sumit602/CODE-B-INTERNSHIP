import React, { useState, useEffect, useCallback } from 'react';
import { chainService, groupService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Chains = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [chains, setChains] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChain, setEditingChain] = useState(null);
  const [formData, setFormData] = useState({ chainName: '', groupId: '', description: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    groupService.getActiveGroups().then((res) => setGroups(res.data?.data || [])).catch(() => {});
  }, []);

  const fetchChains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await chainService.getChains({
        search,
        groupId: groupId || undefined,
        status: status || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setChains(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store chains');
    } finally {
      setLoading(false);
    }
  }, [search, groupId, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChains();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchChains]);

  const handleOpenAdd = () => {
    setEditingChain(null);
    setFormData({ chainName: '', groupId: groups[0]?.groupId ? String(groups[0].groupId) : '', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chain) => {
    setEditingChain(chain);
    setFormData({
      chainName: chain.chainName || '',
      groupId: chain.groupId ? String(chain.groupId) : '',
      description: chain.description || '',
      status: chain.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chainName.trim()) {
      toast.error('Chain name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        groupId: formData.groupId ? Number(formData.groupId) : null,
      };

      if (editingChain) {
        await chainService.updateChain(editingChain.chainId, payload);
        toast.success(`Chain "${formData.chainName}" updated`);
      } else {
        await chainService.createChain(payload);
        toast.success(`Chain "${formData.chainName}" created`);
      }

      setIsModalOpen(false);
      fetchChains();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving chain');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete chain "${name}"?`)) {
      try {
        await chainService.deleteChain(id);
        toast.success(`Chain "${name}" deleted`);
        fetchChains();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete chain');
      }
    }
  };

  const columns = [
    {
      header: 'Chain ID',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.chainId}</span>,
      width: '90px',
    },
    {
      header: 'Chain Name',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.chainName}</span>,
    },
    {
      header: 'Parent Group',
      accessor: (r) => (
        <span style={{ fontWeight: 500, color: '#334155' }}>
          {r.groupName || <span style={{ color: '#94a3b8' }}>None</span>}
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
          <button onClick={() => handleOpenEdit(r)} className="btn-icon" title="Edit Chain">
            <Edit size={15} />
          </button>
          {isAdmin && (
            <button onClick={() => handleDelete(r.chainId, r.chainName)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete Chain">
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
        value={groupId}
        onChange={(e) => { setGroupId(e.target.value); setPage(0); }}
        style={{ width: 'auto', height: '38px', fontSize: '0.8125rem' }}
      >
        <option value="">All Parent Groups</option>
        {groups.map((g) => (
          <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Chains</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Store chains and branch networks linked to parent conglomerates
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" id="btn-add-chain">
          <Plus size={16} /> Add Chain
        </button>
      </div>

      <DataTable
        columns={columns}
        data={chains}
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
        searchPlaceholder="Search chains by name..."
        filterComponent={filterComponent}
        onRetry={fetchChains}
        emptyMessage="No chains found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingChain ? 'Edit Chain' : 'Add New Chain'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="chainName">Chain Name *</label>
            <input
              id="chainName"
              type="text"
              className="form-control"
              placeholder="e.g. Hub Express"
              value={formData.chainName}
              onChange={(e) => setFormData({ ...formData, chainName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="groupId">Parent Group</label>
            <select
              id="groupId"
              className="form-select"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
            >
              <option value="">None / Standalone</option>
              {groups.map((g) => (
                <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              placeholder="Retail focus, format..."
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
              {submitting ? 'Saving...' : editingChain ? 'Update Chain' : 'Create Chain'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Chains;
