import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  maxWidth = '600px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ borderRadius: '50%', padding: '0.35rem' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
