import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Package, TrendingUp, Wallet, ArrowUpRight, History, Edit, Trash2, X, Sparkles } from 'lucide-react';
import '../styles/UserManagement.css';
import toast from 'react-hot-toast';

const Economy: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalRevenue: 0, activeWallets: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [type, setType] = useState<'COINS' | 'DIAMONDS'>('COINS');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pkgRes, transRes, statsRes] = await Promise.all([
        adminService.getPackages(),
        adminService.getTransactions(1, 10),
        adminService.getStats()
      ]);
      setPackages(pkgRes.data.data || []);
      setTransactions(transRes.data.data?.transactions || []);
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

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setName('');
    setAmount(0);
    setPrice(0);
    setType('COINS');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: any) => {
    setModalMode('edit');
    setSelectedId(pkg.id);
    setName(pkg.name);
    setAmount(pkg.amount);
    setPrice(pkg.price);
    setType(pkg.type);
    setStatus(pkg.status || 'active');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0 || price <= 0) {
      toast.error('Please enter valid package specifications');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        amount: Number(amount),
        price: Number(price),
        type,
        status
      };

      if (modalMode === 'create') {
        await adminService.managePackage('add', payload);
        toast.success('Store package provisioned successfully');
      } else {
        await adminService.managePackage('edit', payload, selectedId!);
        toast.success('Store package specifications updated');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Package provision request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently decommission this store package?')) return;
    try {
      await adminService.managePackage('delete', {}, id);
      toast.success('Store package decommissioned');
      fetchData();
    } catch (err) {
      toast.error('Failed to decommission package');
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Wallet & Earnings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Global ledger, exchange rates, and revenue flow</p>
        </div>
        <button className="primary flex-center gap-2" onClick={handleOpenCreateModal}>
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id} className="row-premium">
                    <td><div style={{ fontWeight: 800 }}>{pkg.name}</div></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{pkg.amount} {pkg.type}</span></td>
                    <td><span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>₹{pkg.price}</span></td>
                    <td><span className={`status-neon ${pkg.status === 'active' ? 'active' : 'inactive'}`}>{pkg.status || 'active'}</span></td>
                    <td>
                      <div className="flex gap-2 justify-end" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="icon-btn" onClick={() => handleOpenEditModal(pkg)} style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px' }}>
                          <Edit size={14} />
                        </button>
                        <button className="icon-btn" onClick={() => handleDeletePackage(pkg.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '8px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
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
                    <td className="data-cell-dim" style={{ fontSize: '0.75rem' }}>{tx.id ? `${tx.id.substring(0, 8)}...` : 'N/A'}</td>
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

      {/* Package Provision / configuration modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', padding: '30px', maxWidth: '500px', width: '90%' }}>
            <div className="flex justify-between items-center mb-20">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} className="text-blue-400" />
                <span>{modalMode === 'create' ? 'Provision Store Package' : 'Edit Package Specs'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group mb-20">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Package Nomenclature
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Premium Diamond Chest"
                  required
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }} className="mb-20">
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Asset Quantity
                  </label>
                  <input 
                    type="number" 
                    value={amount || ''} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    placeholder="e.g. 500"
                    required
                    min="1"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Cost Price (₹ INR)
                  </label>
                  <input 
                    type="number" 
                    value={price || ''} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    placeholder="e.g. 499"
                    required
                    min="1"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }} className="mb-30">
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Asset Category
                  </label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as 'COINS' | 'DIAMONDS')} 
                    className="admin-input"
                    style={{ width: '100%', background: '#1e1e1e', color: '#fff' }}
                  >
                    <option value="COINS">COINS</option>
                    <option value="DIAMONDS">DIAMONDS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Status
                  </label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="admin-input"
                    style={{ width: '100%', background: '#1e1e1e', color: '#fff' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-30" style={{ display: 'flex', gap: '15px' }}>
                <button type="button" className="secondary w-full" onClick={() => setIsModalOpen(false)} style={{ padding: '14px' }}>
                  Cancel
                </button>
                <button type="submit" className="primary w-full" disabled={isSubmitting} style={{ padding: '14px' }}>
                  {isSubmitting ? 'Saving Package...' : modalMode === 'create' ? 'Provision Package' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Economy;
