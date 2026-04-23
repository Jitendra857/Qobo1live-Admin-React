import React, { useEffect, useState } from 'react';
import { X, Send, Coins, ShieldAlert } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Modal.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

interface CoinModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CoinModal: React.FC<CoinModalProps> = ({ user, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'coins' | 'diamonds'>('coins');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scrollToModalTop();
  }, []);

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
    <div className="modal-overlay coin-overlay">
      <div className="modal-content glass-panel slide-up coin-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Asset Injection: {user.name}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label><ShieldAlert size={14} /> Currency Type</label>
            <select 
              className="admin-input"
              value={type}
              onChange={e => setType(e.target.value as 'coins' | 'diamonds')}
            >
              <option value="coins">Coins (Virtual Currency)</option>
              <option value="diamonds">Diamonds (Premium Assets)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label><Coins size={14} /> Amount to Inject</label>
            <input 
              type="number" 
              className="admin-input" 
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              placeholder="Enter amount..."
              min="1"
            />
          </div>

          <div className="warning-note" style={{ 
            marginBottom: '28px', 
            padding: '16px', 
            background: 'rgba(245, 158, 11, 0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            color: '#d97706',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <ShieldAlert size={18} />
            <span>This protocol is irreversible. Assets will be credited instantly.</span>
          </div>

          <button 
            onClick={handleSubmit}
            className="primary-btn w-full flex-center gap-2" 
            disabled={loading || amount <= 0}
          >
            <Send size={18} />
            <span>{loading ? 'Injecting Assets...' : 'Verify & Execute'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinModal;
