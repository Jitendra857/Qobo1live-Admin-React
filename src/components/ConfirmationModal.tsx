import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import '../styles/Modal.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'danger',
  onConfirm, 
  onClose 
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 10000, alignItems: 'center' }}>
      <div className="modal-content glass-card slide-up" style={{ maxWidth: '450px', borderRadius: '32px', textAlign: 'center', padding: '48px 40px' }}>
        <div className={`alert-icon-wrap ${type}`} style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: type === 'danger' ? '#ef4444' : '#f59e0b'
        }}>
          <AlertCircle size={40} />
        </div>
        
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="secondary-btn w-full" 
            onClick={onClose}
            style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              fontWeight: 800,
              background: '#fff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button 
            className="primary-btn w-full" 
            onClick={onConfirm}
            style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              fontWeight: 800, 
              background: type === 'danger' ? '#ef4444' : 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: type === 'danger' ? '0 10px 20px rgba(239, 68, 68, 0.2)' : '0 10px 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
