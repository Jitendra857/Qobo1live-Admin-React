import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Gift, Package, TrendingUp, Wallet, ArrowUpRight, History, Search } from 'lucide-react';
import '../styles/UserManagement.css';
import toast from 'react-hot-toast';

const Economy: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalRevenue: 0, activeWallets: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pkgRes, transRes, statsRes] = await Promise.all([
        adminService.getPackages(),
        adminService.getTransactions(1, 10),
        adminService.getStats()
      ]);
      setPackages(pkgRes.data.data || []);
      setTransactions(transRes.data.data || []);
      setStats({
        totalRevenue: statsRes.data.data?.revenue || 0,
        activeWallets: statsRes.data.data?.totalUsers || 0
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync economic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPackage = () => {
    toast.error('Provisioning system locked for security. Use API directly.');
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Wallet & Earnings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Global ledger, exchange rates, and revenue flow</p>
        </div>
        <button className="primary flex-center gap-2" onClick={handleAddPackage}>
          <Package size={18} />
          <span>Provision Package</span>
        </button>
      </div>

      <div className="bento-grid mt-10" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">TOTAL LEDGER VOLUME</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}><Wallet size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="card-status positive"><ArrowUpRight size={12} /> Live Settlement</div>
          </div>
        </div>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">ACTIVE WALLETS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}><TrendingUp size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{stats.activeWallets}</div>
            <div className="card-status">Provisioned Identities</div>
          </div>
        </div>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">PENDING WITHDRAWALS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}><History size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">12</div>
            <div className="card-status clickable" style={{ cursor: 'pointer' }}>Review Payouts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Packages Table */}
        <div className="glass p-1">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 900 }}>Store Inventory</h3>
            <span className="status-neon active">{packages.length} Packages</span>
          </div>
          <div className="table-wrapper" style={{ marginTop: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nomenclature</th>
                  <th>Value</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id} className="row-premium">
                    <td><div style={{ fontWeight: 800 }}>{pkg.name}</div></td>
                    <td>{pkg.amount} {pkg.type}</td>
                    <td>₹{pkg.price}</td>
                    <td><span className="status-neon active">{pkg.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass p-1">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 900 }}>Recent Ledger Activity</h3>
            <span className="status-neon" style={{ background: 'rgba(0,0,0,0.05)', color: '#64748b' }}>Latest 10</span>
          </div>
          <div className="table-wrapper" style={{ marginTop: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Transaction</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="row-premium">
                    <td className="data-cell-dim" style={{ fontSize: '0.75rem' }}>{tx.id.substring(0, 8)}...</td>
                    <td>
                      <div className="flex items-center gap-2 font-bold" style={{ color: tx.type === 'RECHARGE' ? '#10b981' : '#3b82f6' }}>
                        {tx.type === 'RECHARGE' ? '+' : ''}₹{tx.amount.toLocaleString()}
                      </div>
                    </td>
                    <td><span className="badge-outline" style={{ fontSize: '0.65rem' }}>{tx.type}</span></td>
                    <td><span className="status-neon active">{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Economy;
