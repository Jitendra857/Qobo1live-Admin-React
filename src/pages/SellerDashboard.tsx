import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Wallet, Send, History, Search, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css'; // Reusing premium styling

const SellerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSellerDashboard();
      if (res.data?.success) {
        setDashboardData(res.data.data);
      } else {
        toast.error(res.data?.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Network error fetching dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) {
      toast.error('User ID and Amount are required');
      return;
    }

    if (dashboardData && Number(amount) > dashboardData.coinsBalance) {
      toast.error('Insufficient coin balance');
      return;
    }

    setIsTransferring(true);
    try {
      const payload = { 
        userId, 
        amount: Number(amount),
        price: price ? Number(price) : 0
      };
      const res = await adminService.sellCoinsToUser(payload);
      if (res.data?.success) {
        toast.success('Coins transferred successfully');
        setUserId('');
        setAmount('');
        setPrice('');
        fetchDashboard(); // Refresh balance and history
      } else {
        toast.error(res.data?.message || 'Transfer failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  if (loading && !dashboardData) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="user-management fade-in" style={{ padding: '20px' }}>
      <div className="header-actions">
        <h2 className="page-title">Merchant Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your inventory and distribute coins</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
        
        {/* Balance Card */}
        <div className="bento-card" style={{ padding: '32px', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Wallet size={24} color="white" />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '600', opacity: 0.9 }}>Current Inventory</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '900', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {dashboardData?.coinsBalance?.toLocaleString() || 0}
            <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>Coins</span>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sold</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dashboardData?.metrics?.totalCoinsSold?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dashboardData?.metrics?.totalRevenue?.toLocaleString() || 0} INR</div>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bento-card" style={{ padding: '32px', background: 'white' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <Send size={20} className="text-blue-500" /> Issue Coins
          </h3>
          <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Target User ID / Email</label>
              <div className="search-bar" style={{ width: '100%' }}>
                <User size={18} style={{ color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="e.g. user@example.com"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Amount (Coins)</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 'bold' }}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Price Collected (INR)</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 'bold' }}
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <button type="submit" className="primary" disabled={isTransferring} style={{ width: '100%', padding: '16px', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {isTransferring ? 'Processing...' : (
                <>Transfer Now <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
          <History size={20} className="text-slate-400" /> Recent Transfers
        </h3>
        <div className="table-container-premium">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient</th>
                <th style={{ textAlign: 'center' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentSales?.map((sale: any) => (
                <tr key={sale.id} className="row-premium">
                  <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="identity-block">
                      <div className="avatar-glass" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {sale.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="identity-text">
                        <span className="name-bold">{sale.user?.name || 'Unknown'}</span>
                        <span className="email-sub">{sale.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: '#3b82f6' }}>
                    +{sale.amount.toLocaleString()} Coins
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>
                    {sale.price.toLocaleString()} {sale.currency}
                  </td>
                </tr>
              ))}
              {(!dashboardData?.recentSales || dashboardData.recentSales.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No recent transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
