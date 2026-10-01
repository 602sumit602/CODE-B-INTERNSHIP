import React, { useState } from 'react';
import { 
  User, Lock, Mail, Phone, Building, Shield, CheckCircle, 
  Key, AlertCircle, Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.changePassword(passwordForm);
      if (res.data?.success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header mb-4">
        <h1 className="page-title m-0">User Profile & Account Security</h1>
        <p className="text-muted m-0">View your account credentials and update your system security password</p>
      </div>

      <div className="grid grid-2 gap-4">
        {/* Profile Card */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <User size={18} /> Account Information
            </h3>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
            <div className="avatar-circle" style={{ width: '56px', height: '56px', fontSize: '22px' }}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="m-0">{user?.fullName || 'User'}</h3>
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
                </span>
                <span className="badge badge-success">Active Session</span>
              </div>
            </div>
          </div>

          <div className="profile-details-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className="d-flex align-items-center gap-3 py-2 border-bottom">
              <Mail className="text-muted" size={18} />
              <div>
                <span className="text-xs text-muted d-block">Email Address</span>
                <strong>{user?.email || 'N/A'}</strong>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 py-2 border-bottom">
              <Building className="text-muted" size={18} />
              <div>
                <span className="text-xs text-muted d-block">Department</span>
                <strong>{user?.department || 'Sales & Operations'}</strong>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 py-2 border-bottom">
              <Phone className="text-muted" size={18} />
              <div>
                <span className="text-xs text-muted d-block">Phone Number</span>
                <strong>{user?.phone || 'Not provided'}</strong>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 py-2 border-bottom">
              <Shield className="text-muted" size={18} />
              <div>
                <span className="text-xs text-muted d-block">Security Role</span>
                <strong>{user?.role === 'ADMIN' ? 'Full System Administrator' : 'Sales Representative'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title text-primary d-flex align-items-center gap-2">
              <Key size={18} /> Change Account Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group mb-3">
              <label className="form-label required">Current Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label required">New Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label required">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="alert alert-info text-xs mb-4">
              Passwords should contain letters, numbers, and be at least 6 characters long to ensure enterprise security compliance.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              <Save size={16} /> {submitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
