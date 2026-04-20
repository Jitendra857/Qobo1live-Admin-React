import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Wallet, CheckCircle, XCircle } from 'lucide-react';
import '../styles/UserManagement.css';

const Withdrawals: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await adminService.getWithdrawals();
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await adminService.processWithdrawal({ id, status });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Financial Control</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review and process cash-out requests</p>
        </div>
      </div>

      <div className="table-wrapper glass mt-10">
        <table className="premium-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Bank / Payment Info</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar-neon">{req.user?.name?.[0] || 'U'}</div>
                    <div className="user-text">
                      <span className="name-main">{req.user?.name}</span>
                      <span className="id-sub">{req.user?.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{req.amount}</td>
                <td style={{ fontSize: '0.85rem' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-opal)', borderRadius: '8px', maxWidth: '250px' }}>
                    {JSON.stringify(req.bankDetails)}
                  </div>
                </td>
                <td>
                  <span className={`status-neon ${req.status}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="action-group">
                    {req.status === 'pending' && (
                      <>
                        <button className="icon-btn" style={{ color: '#10b981' }} onClick={() => handleAction(req.id, 'approved')}><CheckCircle size={18} /></button>
                        <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => handleAction(req.id, 'rejected')}><XCircle size={18} /></button>
                      </>
                    )}
                    <button className="icon-btn"><Wallet size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                  No active withdrawal requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;
