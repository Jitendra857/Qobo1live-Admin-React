import React, { useState } from 'react';
import { X, Send, Coins, ShieldAlert } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Modal.css';

interface CoinModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CoinModal: React.FC<CoinModalProps> = ({ user, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'coins' | 'diamonds'>('coins');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) return;
    setLoading(true);
    try {
      await adminService.assignCoins({
        user_id: user.id,
        amount: Number(amount),
        type: type
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to assign coins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel slide-up">
        <div className="modal-header">
          <h3>Currency Management</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="user-preview">
            <div className="avatar-large">{user.name[0]}</div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-id" title={user.id}>
                ID: {user.id.length > 20 ? `${user.id.substring(0, 8)}...${user.id.substring(user.id.length - 8)}` : user.id}
              </span>
            </div>
          </div>

          <div className="form-group mt-6">
            <label>Currency Type</label>
            <div className="toggle-group">
              <button 
                className={type === 'coins' ? 'active' : ''} 
                onClick={() => setType('coins')}
              >
                Coins
              </button>
              <button 
                className={type === 'diamonds' ? 'active' : ''} 
                onClick={() => setType('diamonds')}
              >
                Diamonds
              </button>
            </div>
          </div>

          <div className="form-group mt-4">
            <label>Amount to Assign</label>
            <div className="input-with-icon">
              <Coins size={18} className="icon-gold" />
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="warning-note mt-6">
            <ShieldAlert size={16} />
            <span>This action is irreversible and will be logged.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary flex-center gap-2" onClick={handleSubmit} disabled={loading}>
            <Send size={18} />
            <span>{loading ? 'Processing...' : 'Confirm Assign'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinModal;
