import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen && window.innerWidth >= 1024 ? 'var(--sidebar-width)' : 0,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>

        <footer style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: '#ffffff',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#64748b',
        }}>
          CODE-B &copy; {new Date().getFullYear()} — Enterprise Management Information System & Invoicing. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
