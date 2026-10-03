import React, { useEffect, useState } from 'react';
import { X, Send, Coins, ShieldAlert, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/Modal.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

interface CoinModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

type CoinAction = 'add' | 'remove' | 'set';

const CoinModal: React.FC<CoinModalProps> = ({ user, onClose, onSuccess }) => {
  const [action, setAction] = useState<CoinAction>('add');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scrollToModalTop();
  }, []);

  const currentDiamonds = Number(user?.wallet?.diamonds ?? user?.diamonds ?? 0);
  const numAmount = Math.max(0, Number(amount) || 0);

  const calculatedBalance = () => {
    if (action === 'add') {
      return currentDiamonds + numAmount;
    }
    if (action === 'remove') {
      return Math.max(0, currentDiamonds - numAmount);
    }
    // set / update
    return numAmount;
  };

  const isFormValid = () => {
    if (action === 'set') {
      return amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) >= 0;
    }
    return numAmount > 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      await adminService.assignCoins({
        user_id: user.id,
        amount: numAmount,
        type: 'diamonds',
        action: action
      });

      const actionText = action === 'add' ? 'added to' : action === 'remove' ? 'deducted from' : 'updated for';
      toast.success(`Diamonds successfully ${actionText} ${user.name || 'user'}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update Diamonds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay coin-overlay">
      <div className="modal-content glass-panel slide-up coin-modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
              Manage Diamonds: {user.name || 'User'}
            </h3>
          </div>
          <button className="close-btn" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Current balance card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Current Balance</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={18} color="#f59e0b" />
                {currentDiamonds.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Diamonds</span>
              </strong>
            </div>

            {amount.trim() !== '' && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Projected Balance</span>
                <strong style={{ 
                  fontSize: '1.25rem', 
                  color: action === 'remove' ? '#ef4444' : action === 'set' ? '#2563eb' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {calculatedBalance().toLocaleString()}
                </strong>
              </div>
            )}
          </div>

          {/* Action Selector */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
              Select Operation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAction('add')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 8px',
                  borderRadius: '6px',
                  border: action === 'add' ? '2px solid #10b981' : '1px solid #cbd5e1',
                  background: action === 'add' ? '#ecfdf5' : '#ffffff',
                  color: action === 'add' ? '#065f46' : '#475569',
                  fontWeight: action === 'add' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <PlusCircle size={16} color={action === 'add' ? '#10b981' : '#64748b'} />
                Add Diamonds
              </button>

              <button
                type="button"
                onClick={() => setAction('remove')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 8px',
                  borderRadius: '6px',
                  border: action === 'remove' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  background: action === 'remove' ? '#fef2f2' : '#ffffff',
                  color: action === 'remove' ? '#991b1b' : '#475569',
                  fontWeight: action === 'remove' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <MinusCircle size={16} color={action === 'remove' ? '#ef4444' : '#64748b'} />
                Remove
              </button>

              <button
                type="button"
                onClick={() => setAction('set')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 8px',
                  borderRadius: '6px',
                  border: action === 'set' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: action === 'set' ? '#eff6ff' : '#ffffff',
                  color: action === 'set' ? '#1e40af' : '#475569',
                  fontWeight: action === 'set' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <RefreshCw size={16} color={action === 'set' ? '#2563eb' : '#64748b'} />
                Set Exact
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coins size={15} />
              {action === 'add' && 'Amount of Diamonds to Add'}
              {action === 'remove' && 'Amount of Diamonds to Deduct'}
              {action === 'set' && 'New Exact Coin Balance'}
            </label>
            <input 
              type="number" 
              className="admin-input" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={action === 'set' ? 'Enter exact new balance (e.g. 10000)...' : 'Enter amount of Diamonds...'}
              min={action === 'set' ? '0' : '1'}
              style={{ fontSize: '1rem', padding: '10px 12px' }}
            />
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[1000, 5000, 10000, 50000, 100000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="warning-note" style={{
            background: action === 'remove' ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${action === 'remove' ? '#fecaca' : '#e2e8f0'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: action === 'remove' ? '#991b1b' : '#64748b'
          }}>
            <ShieldAlert size={16} />
            <span>
              {action === 'add' && 'Diamonds will be added immediately to the user account.'}
              {action === 'remove' && 'Diamonds will be deducted immediately. Balance cannot go below 0.'}
              {action === 'set' && 'The user coin balance will be updated directly to this amount.'}
            </span>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 20px' }}>
          <button 
            type="button" 
            className="secondary-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="primary-btn" 
            disabled={loading || !isFormValid()}
            style={{
              background: action === 'remove' ? '#dc2626' : action === 'set' ? '#2563eb' : undefined
            }}
          >
            <Send size={18} />
            <span>
              {loading 
                ? 'Processing...' 
                : action === 'add'
                  ? `Add ${numAmount > 0 ? numAmount.toLocaleString() + ' ' : ''}Diamonds`
                  : action === 'remove'
                    ? `Deduct ${numAmount > 0 ? numAmount.toLocaleString() + ' ' : ''}Diamonds`
                    : `Update Balance to ${numAmount.toLocaleString()} Diamonds`
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinModal;
