import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="auth-card text-center py-5" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <ShieldAlert size={64} className="text-danger mb-3 mx-auto" />
      <h1 className="h2 mb-2 font-weight-bold text-danger">403 - Access Denied</h1>
      <p className="text-muted mb-4">
        You do not have administrative permissions to view or edit this resource. Please contact your system administrator if you require elevated privileges.
      </p>
      <Link to="/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
}
