import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Menu, Bell, User, LogOut, Settings, 
  ChevronDown, Search, Shield 
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    toast.info('Logged out successfully');
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left: Mobile hamburger & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '500px' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Toggle Navigation"
          id="btn-toggle-sidebar"
        >
          <Menu size={22} />
        </button>

        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search clients, invoices, estimates..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: '#f8fafc',
              fontSize: '0.8125rem',
              outline: 'none',
              transition: 'var(--transition)'
            }}
            onFocus={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = 'var(--primary)'; }}
            onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'var(--border)'; }}
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative',
            }}
            title="Notifications"
            id="btn-notifications"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: 'var(--primary)',
              borderRadius: '50%',
            }}></span>
          </button>

          {notificationsOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              zIndex: 50,
            }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.875rem' }}>
                Notifications
              </div>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.8125rem' }}>
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Payment Received</p>
                <p style={{ color: '#64748b' }}>INR 80,000 received for invoice CB-INV-2026-001</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>10 mins ago</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Estimate Approved</p>
                <p style={{ color: '#64748b' }}>Estimate CB-EST-2026-001 approved by client</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1 hour ago</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
            id="btn-user-menu"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.3)'
            }}>
              {getInitials(user?.fullName)}
            </div>

            <div style={{ textAlign: 'left', display: 'none', md: 'block' }} className="user-text-info">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {isAdmin ? (
                  <span className="badge badge-admin" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>ADMIN</span>
                ) : (
                  <span className="badge badge-sales" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>SALES</span>
                )}
              </div>
            </div>

            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '220px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              padding: '0.5rem 0',
              zIndex: 50,
            }}>
              <div style={{ padding: '0.5rem 1rem 0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{user?.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  color: '#334155',
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} /> My Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    color: '#334155',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} /> System Settings
                </Link>
              )}

              <div style={{ borderTop: '1px solid var(--border)', margin: '0.35rem 0' }}></div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                id="btn-logout"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
