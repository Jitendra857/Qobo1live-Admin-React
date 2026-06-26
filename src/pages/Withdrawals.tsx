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
            {requests.map((req) => {
              const details = req.bankDetails || {};
              const holder = details.holder_name || details.holderName || details.holder || 'N/A';
              const bankName = details.bank_name || details.bankName || details.bank || 'N/A';
              const accountNum = details.account_number || details.accountNumber || details.account || 'N/A';
              const ifsc = details.ifsc_code || details.ifscCode || details.ifsc || 'N/A';
              const upi = details.upi_id || details.upi || details.upiId;

              // Color codes for status
              let statusStyle = { background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
              if (req.status === 'approved' || req.status === 'completed') {
                statusStyle = { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
              } else if (req.status === 'rejected' || req.status === 'failed') {
                statusStyle = { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
              }

              return (
                <tr key={req.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-neon" style={{ color: '#fff' }}>{req.user?.name?.[0] || 'U'}</div>
                      <div className="user-text">
                        <span className="name-main" style={{ color: '#0f172a', fontWeight: 700 }}>{req.user?.name || 'Unknown'}</span>
                        <span className="id-sub" style={{ color: '#64748b' }}>{req.user?.phone || req.user?.email || req.user?.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>₹{req.amount}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div style={{ 
                      padding: '10px 14px', 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px', 
                      maxWidth: '280px',
                      color: '#334155'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong style={{ color: '#2563eb' }}>Holder:</strong> {holder}</div>
                        <div><strong style={{ color: '#2563eb' }}>Bank:</strong> {bankName}</div>
                        <div><strong style={{ color: '#2563eb' }}>Acc:</strong> {accountNum}</div>
                        <div><strong style={{ color: '#2563eb' }}>IFSC:</strong> {ifsc}</div>
                        {upi && <div><strong style={{ color: '#2563eb' }}>UPI:</strong> {upi}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-neon" style={{ ...statusStyle, borderRadius: '6px', fontSize: '0.7rem', padding: '5px 12px', display: 'inline-block' }}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      {req.status === 'pending' && (
                        <>
                          <button className="icon-btn" style={{ color: '#10b981', cursor: 'pointer' }} onClick={() => handleAction(req.id, 'approved')} title="Approve Request"><CheckCircle size={18} /></button>
                          <button className="icon-btn" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleAction(req.id, 'rejected')} title="Reject Request"><XCircle size={18} /></button>
                        </>
                      )}
                      <button className="icon-btn" title="View Wallet Details"><Wallet size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
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
