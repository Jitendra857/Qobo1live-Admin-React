import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import '../styles/Modal.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

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
  useEffect(() => {
    scrollToModalTop();
  }, []);

  return (
    <div className="modal-overlay confirmation-overlay">
      <div className="modal-content glass-panel slide-up confirmation-modal" style={{ maxWidth: '450px' }}>
        <div className={`alert-icon-wrap ${type}`}>
          <AlertCircle size={40} />
        </div>
        
        <h3>{title}</h3>
        <p>{message}</p>
        
        <div className="modal-footer" style={{ marginTop: '24px' }}>
          <button className="secondary-btn" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`primary-btn ${type === 'danger' ? 'danger' : ''}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
