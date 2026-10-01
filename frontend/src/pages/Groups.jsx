import React, { useState, useEffect, useCallback } from 'react';
import { groupService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Groups = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ groupName: '', description: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await groupService.getGroups({
        search,
        status: status || undefined,
        page,
        size,
      });

      if (res.data?.success) {
        const paged = res.data.data;
        setGroups(paged.content || []);
        setTotalElements(paged.totalElements || 0);
        setTotalPages(paged.totalPages || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization groups');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormData({ groupName: '', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      groupName: group.groupName || '',
      description: group.description || '',
      status: group.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.groupId, formData);
        toast.success(`Group "${formData.groupName}" updated`);
      } else {
        await groupService.createGroup(formData);
        toast.success(`Group "${formData.groupName}" created`);
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete group "${name}"?`)) {
      try {
        await groupService.deleteGroup(id);
        toast.success(`Group "${name}" deleted`);
        fetchGroups();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  const columns = [
    {
      header: 'Group ID',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.groupId}</span>,
      width: '90px',
    },
    {
      header: 'Group Name',
      accessor: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.groupName}</span>,
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
          <button onClick={() => handleOpenEdit(r)} className="btn-icon" title="Edit Group">
            <Edit size={15} />
          </button>
          {isAdmin && (
            <button onClick={() => handleDelete(r.groupId, r.groupName)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete Group">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
      width: '100px',
    },
  ];

  const filterComponent = (
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
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Client Groups</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Top-level organizational conglomerates managing multiple store chains and retail networks
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" id="btn-add-group">
          <Plus size={16} /> Add Group
        </button>
      </div>

      <DataTable
        columns={columns}
        data={groups}
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
        searchPlaceholder="Search groups by name..."
        filterComponent={filterComponent}
        onRetry={fetchGroups}
        emptyMessage="No groups found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Edit Group' : 'Add New Organization Group'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="groupName">Group Name *</label>
            <input
              id="groupName"
              type="text"
              className="form-control"
              placeholder="e.g. Retail Hub India"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              placeholder="Business scope, portfolio summary..."
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
              {submitting ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;
