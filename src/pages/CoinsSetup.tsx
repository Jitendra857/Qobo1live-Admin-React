import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Coins, Plus, Edit, Trash2, ShieldCheck, CheckCircle2, ArrowUpRight, DollarSign } from 'lucide-react';
import '../styles/UserManagement.css';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

interface CoinPackage {
  id: string;
  name: string;
  amount: number;
  coins?: number;
  price: number;
  inrPrice?: number;
  usdPrice?: number;
  sku?: string;
  currency?: string;
  type?: string;
  status?: string;
}

const CoinsSetup: React.FC = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(4000);
  const [price, setPrice] = useState<number>(50);
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPackages();
      const allPkgs: CoinPackage[] = res.data.data || [];
      // Filter coin packages
      const coinPkgs = allPkgs.filter(p => !p.type || p.type.toLowerCase() === 'coin' || p.type.toLowerCase() === 'coins');
      setPackages(coinPkgs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch coin packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setName('');
    setAmount(4000);
    setPrice(50);
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: CoinPackage) => {
    setModalMode('edit');
    setSelectedId(pkg.id);
    setName(pkg.name);
    setAmount(pkg.amount || pkg.coins || 0);
    setPrice(pkg.price);
    setStatus(pkg.status || 'active');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || price <= 0) {
      toast.error('Please enter a valid coin amount and price');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim() || `${amount.toLocaleString()} Coins`,
        amount: Number(amount),
        price: Number(price),
        type: 'coin',
        currency: 'INR',
        status
      };

      if (modalMode === 'create') {
        await adminService.managePackage('add', payload);
        toast.success('Coin package created successfully');
      } else {
        await adminService.managePackage('edit', payload, selectedId!);
        toast.success('Coin package updated successfully');
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error('Package operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const executeDeletePackage = async (id: string) => {
    try {
      await adminService.managePackage('delete', {}, id);
      toast.success('Coin package deleted');
      fetchPackages();
    } catch (err) {
      toast.error('Failed to delete package');
    }
  };

  // Helper pricing lookup for display
  const getUsdPrice = (pkg: CoinPackage) => {
    if (pkg.usdPrice) return pkg.usdPrice;
    const map: Record<number, number> = {
      4000: 2, 8000: 3, 16000: 5, 24000: 8,
      32000: 10, 40000: 12, 80000: 16, 400000: 70
    };
    return map[pkg.amount] || Math.max(1, Math.round((pkg.price / 80) * 100) / 100);
  };

  const getSku = (pkg: CoinPackage) => {
    return pkg.sku || `coins_${pkg.amount}`;
  };

  return (
    <div className="user-management fade-in">
      {/* Header */}
      <div className="header-actions">
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={28} color="#eab308" />
            <span>Coins Setup</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure online coin recharge packages, dual pricing (₹ INR & $ USD), and Google Play in-app purchase tiers.
          </p>
        </div>
        <button className="primary flex-center gap-2" onClick={handleOpenCreateModal} style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#000', fontWeight: 800 }}>
          <Plus size={18} />
          <span>Provision Coin Package</span>
        </button>
      </div>

      {/* Bento Overview Cards */}
      <div className="bento-grid mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">ACTIVE STORE PACKAGES</div>
            <div className="card-icon-wrap" style={{ color: '#eab308' }}><Coins size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{packages.length} Tiers</div>
            <div className="card-status positive"><CheckCircle2 size={12} /> Live On Mobile Store</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">MINIMUM ENTRY TIER</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}><ArrowUpRight size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">₹50 / $2</div>
            <div className="card-status">4,000 Coins</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">MAXIMUM MEGA TIER</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}><DollarSign size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">₹5,000 / $70</div>
            <div className="card-status">400,000 Coins</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">PAYMENT GATEWAY</div>
            <div className="card-icon-wrap" style={{ color: '#8b5cf6' }}><ShieldCheck size={24} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value">Google Play</div>
            <div className="card-status positive">RTDN Webhook Active</div>
          </div>
        </div>
      </div>

      {/* Main Coin Packages Table */}
      <div className="glass p-1 mt-8">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 900, fontSize: '1.15rem' }}>Coins Pricing & Package Matrix</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              These 8 tiers are served dynamically to mobile users via <code>GET /api/economy/package-list</code>.
            </p>
          </div>
          <span className="status-neon active" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', borderColor: 'rgba(234, 179, 8, 0.4)' }}>
            {packages.length} Packages Configured
          </span>
        </div>

        <div className="table-wrapper" style={{ marginTop: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Package Name</th>
                <th>Coin Assets</th>
                <th>INR Price (₹)</th>
                <th>USD Price ($)</th>
                <th>Play Store SKU</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, idx) => {
                const usd = getUsdPrice(pkg);
                const sku = getSku(pkg);
                return (
                  <tr key={pkg.id} className="row-premium">
                    <td>
                      <span style={{ fontWeight: 800, color: '#94a3b8' }}>#{idx + 1}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{pkg.name}</div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(234, 179, 8, 0.1)',
                        color: '#b45309',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        🪙 {(pkg.amount || pkg.coins || 0).toLocaleString()} Coins
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.95rem' }}>
                        ₹{pkg.price}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
                        ${usd}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                        {sku}
                      </code>
                    </td>
                    <td>
                      <span className={`status-neon ${pkg.status === 'active' ? 'active' : 'inactive'}`}>
                        {pkg.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn"
                          title="Edit Package"
                          onClick={() => handleOpenEditModal(pkg)}
                          style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Delete Package"
                          onClick={() => handleDeletePackage(pkg.id)}
                          style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {packages.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No coin packages found. Click <strong>Provision Coin Package</strong> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Integration Reference */}
      <div className="glass p-6 mt-8" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)' }}>
        <h4 style={{ fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📱 Mobile Integration Details
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.6 }}>
          The mobile client automatically queries the coin packages based on user currency:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>INR Endpoint</span>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a', marginTop: '4px' }}>
              GET /api/economy/package-list?currency=INR
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>USD Endpoint</span>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a', marginTop: '4px' }}>
              GET /api/economy/package-list?currency=USD
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleFormSubmit} className="modal-content glass-panel slide-up" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={20} color="#eab308" />
                <span>{modalMode === 'create' ? 'Provision Coin Package' : 'Edit Coin Package'}</span>
              </h3>
              <button className="close-btn" type="button" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Package Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 4,000 Coins"
                  className="admin-input"
                />
              </div>

              <div className="modal-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Coin Quantity</label>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="e.g. 4000"
                    required
                    min="1"
                    className="admin-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>INR Price (₹)</label>
                  <input
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="e.g. 50"
                    required
                    min="1"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Package Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="admin-input"
                >
                  <option value="active">Active (Visible in App)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#000', fontWeight: 800 }}
              >
                <span>{isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Provision Package' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <ConfirmationModal
          title="Delete Coin Package"
          message="Are you sure you want to permanently delete this coin package from the mobile store?"
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => {
            if (deleteTargetId) {
              executeDeletePackage(deleteTargetId);
            }
            setShowConfirmDelete(false);
            setDeleteTargetId(null);
          }}
          onClose={() => {
            setShowConfirmDelete(false);
            setDeleteTargetId(null);
          }}
        />
      )}
    </div>
  );
};

export default CoinsSetup;
