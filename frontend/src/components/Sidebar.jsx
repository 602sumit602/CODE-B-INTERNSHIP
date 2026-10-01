import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, Building2, Link2,
  Tag, MapPin, FileSpreadsheet, FileText,
  CreditCard, BarChart3, UserCog, Settings,
  User, LogOut, ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { title: 'CORE', items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]},
    { title: 'ORGANIZATION', items: [
      { name: 'Clients', path: '/clients', icon: Users },
      { name: 'Groups', path: '/groups', icon: Building2 },
      { name: 'Chains', path: '/chains', icon: Link2 },
      { name: 'Brands', path: '/brands', icon: Tag },
      { name: 'Subzones', path: '/subzones', icon: MapPin },
    ]},
    { title: 'SALES & BILLING', items: [
      { name: 'Estimates', path: '/estimates', icon: FileSpreadsheet },
      { name: 'Invoices', path: '/invoices', icon: FileText },
      { name: 'Payments', path: '/payments', icon: CreditCard },
      { name: 'Reports', path: '/reports', icon: BarChart3 },
    ]},
    { title: 'ADMINISTRATION', items: [
      { name: 'Users', path: '/users', icon: UserCog },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]},
  ];

  const salesNavItems = [
    { title: 'CORE', items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]},
    { title: 'SALES', items: [
      { name: 'Clients', path: '/clients', icon: Users },
      { name: 'Estimates', path: '/estimates', icon: FileSpreadsheet },
      { name: 'Invoices', path: '/invoices', icon: FileText },
      { name: 'Payments', path: '/payments', icon: CreditCard },
      { name: 'Reports', path: '/reports', icon: BarChart3 },
    ]},
  ];

  const navSections = isAdmin ? adminNavItems : salesNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 45,
            backdropFilter: 'blur(2px)',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside style={{
        width: 'var(--sidebar-width)',
        background: '#0f172a',
        color: '#f8fafc',
        height: '100vh',
        position: 'fixed',
        left: isOpen ? 0 : '-100%',
        top: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : 'none',
      }}
      className={`sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* Brand Header */}
        <div style={{
          height: 'var(--navbar-height)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0 1.25rem',
          borderBottom: '1px solid #1e293b',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#ffffff',
            fontSize: '1.1rem',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)',
          }}>
            B
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              CODE-B
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.05em', fontWeight: 600 }}>
              MIS & INVOICING
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem' }}>
          {navSections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.08em',
                padding: '0 0.75rem 0.35rem 0.75rem',
              }}>
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      background: isActive ? '#4f46e5' : 'transparent',
                      marginBottom: '0.2rem',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                    })}
                    className="nav-link-item"
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Logout at bottom */}
        <div style={{
          padding: '0.875rem',
          borderTop: '1px solid #1e293b',
          background: '#090d16',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavLink
              to="/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flex: 1, minWidth: 0 }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#334155',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {user?.role}
                </div>
              </div>
            </NavLink>

            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Logout"
              id="sidebar-btn-logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
