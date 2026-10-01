import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Background glow decoration */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '10%',
        left: '20%',
        pointerEvents: 'none',
      }}></div>

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%)',
        bottom: '10%',
        right: '20%',
        pointerEvents: 'none',
      }}></div>

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
            marginBottom: '0.75rem',
          }}>
            B
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            CODE-B
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Management Information System & Invoicing
          </p>
        </div>

        {/* Auth Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
        }}>
          <Outlet />
        </div>

        {/* Demo Credentials Helper Pill */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#cbd5e1',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔑 Demo Login Credentials</span>
          </div>
          <div><strong>Admin:</strong> admin@codeb.com / <code>admin123</code></div>
          <div><strong>Salesperson:</strong> john.sales@codeb.com / <code>sales123</code></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
