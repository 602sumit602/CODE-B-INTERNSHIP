import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      toast.success('Welcome back! Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Sign In to Your Account</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enter your credentials to access the Code-B MIS portal
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          color: '#991b1b',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              id="email"
              type="email"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="name@codeb.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              id="password"
              type="password"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => fillCredentials('admin@codeb.com', 'admin123')}
          >
            Fill Admin Demo
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => fillCredentials('john.sales@codeb.com', 'sales123')}
          >
            Fill Sales Demo
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
          id="btn-login-submit"
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
        Don't have an account yet?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
