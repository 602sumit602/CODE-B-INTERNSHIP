import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning', 5000),
    info: (msg) => addToast(msg, 'info'),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-success" />;
      case 'error':
        return <AlertCircle size={20} className="text-danger" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      default:
        return <Info size={20} className="text-info" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 99999 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderLeft: '4px solid', marginBottom: '0.5rem' }}>
            {getIcon(t.type)}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', flex: 1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
