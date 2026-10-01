import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Plus, Search, Filter, Edit2, 
  Trash2, Shield, UserCheck, UserX, Mail, Phone, Building, CheckCircle
} from 'lucide-react';
import { userService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function Users() {
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SALES_PERSON',
    status: 'ACTIVE',
    phone: '',
    department: 'Sales',
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await userService.getUsers(params);
      if (res.data?.success) {
        const data = res.data.data;
        setUsers(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'SALES_PERSON',
      status: 'ACTIVE',
      phone: '',
      department: 'Sales',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // leave empty unless changing
      role: user.role || 'SALES_PERSON',
      status: user.status || 'ACTIVE',
      phone: user.phone || '',
      department: user.department || '',
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const uId = user.userId || user.id;
      await userService.toggleStatus(uId);
      toast.success(`User status changed`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (user) => {
    const uId = user.userId || user.id;
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.fullName}"?`)) return;
    try {
      await userService.deleteUser(uId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Full name and email are required');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        const uId = editingUser.userId || editingUser.id;
        const updatePayload = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          phone: formData.phone.trim(),
          department: formData.department.trim(),
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }
        await userService.updateUser(uId, updatePayload);
        toast.success('User updated successfully');
      } else {
        await userService.createUser(formData);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title m-0">User Accounts</h1>
          <p className="text-muted m-0">Manage internal team members, access roles, and sales representatives</p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={16} /> Add New User
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card mb-4 p-3">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="form-group m-0" style={{ flex: '1 1 250px' }}>
            <div className="input-group">
              <span className="input-prefix"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              />
            </div>
          </div>

          <div className="form-group m-0" style={{ width: '180px' }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="SALES_PERSON">Sales Person</option>
            </select>
          </div>

          <div className="form-group m-0" style={{ width: '160px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container py-5">
            <div className="spinner"></div>
            <p>Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5">
            <UsersIcon size={48} className="text-muted mb-2" />
            <h3>No Users Found</h3>
            <p className="text-muted">Create user accounts for administrators and sales representatives.</p>
            <button onClick={handleOpenAddModal} className="btn btn-primary mt-2">
              <Plus size={16} /> Create User
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User / Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u.userId || u.id;
                    const isActive = u.status === 'ACTIVE';
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-circle">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-weight-bold">{u.fullName}</div>
                              <span className="text-xs text-muted">ID: #{uId}</span>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                            {u.role === 'ADMIN' ? 'Administrator' : 'Sales Person'}
                          </span>
                        </td>
                        <td>{u.department || 'Sales'}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`btn btn-icon btn-sm btn-ghost ${isActive ? 'text-muted' : 'text-success'}`}
                              title={isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="btn btn-icon btn-sm btn-ghost"
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="btn btn-icon btn-sm btn-ghost text-muted hover-danger"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-top d-flex justify-content-between align-items-center">
                <span className="text-sm text-muted">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
                </span>
                <div className="pagination gap-1">
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-3 d-flex align-items-center text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUser ? `Edit User: ${editingUser.fullName}` : 'Create New User Account'}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label required">Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label required">Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="name@codeb.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group mb-3">
              <label className={`form-label ${!editingUser ? 'required' : ''}`}>
                Password {editingUser ? '(Leave empty to keep current)' : ''}
              </label>
              <input
                type="password"
                className="form-control"
                required={!editingUser}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-2 gap-3 mb-3">
              <div className="form-group">
                <label className="form-label required">Role</label>
                <select
                  className="form-control"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ADMIN">Administrator (Full Access)</option>
                  <option value="SALES_PERSON">Sales Person (Sales & Assigned Clients)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Account Status</label>
                <select
                  className="form-control"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2 gap-3 mb-4">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sales / Operations"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
