import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="auth-card text-center py-5" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <FileQuestion size={64} className="text-primary mb-3 mx-auto" />
      <h1 className="h2 mb-2 font-weight-bold">404 - Page Not Found</h1>
      <p className="text-muted mb-4">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
}
