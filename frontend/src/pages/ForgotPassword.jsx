import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/dataService';
import { useToast } from '../contexts/ToastContext';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email });
      setSubmitted(true);
      if (res.data?.data) {
        setResetToken(res.data.data);
      }
      toast.success('Password reset token generated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Forgot Password</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
            Reset Instructions Sent
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            If an account exists for <strong>{email}</strong>, a reset token has been generated.
          </p>

          {resetToken && (
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                DEVELOPMENT / DEMO RESET TOKEN:
              </div>
              <code style={{ fontSize: '0.8125rem', wordBreak: 'break-all', color: '#4f46e5' }}>
                {resetToken}
              </code>
              <div style={{ marginTop: '0.75rem' }}>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="btn btn-primary btn-sm w-full"
                >
                  Proceed to Reset Password Now
                </Link>
              </div>
            </div>
          )}

          <Link to="/login" className="btn btn-secondary w-full">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Registered Email Address</label>
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

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            id="btn-forgot-password-submit"
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.875rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
