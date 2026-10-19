import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Coins, Plus, Edit2, Trash2, ShieldCheck, CheckCircle2, ArrowUpRight, DollarSign, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
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

const STANDARD_8_TIERS = [
  { name: '4,000 Coins', amount: 4000, price: 50, usdPrice: 2, sku: 'coins_4000' },
  { name: '8,000 Coins', amount: 8000, price: 100, usdPrice: 3, sku: 'coins_8000' },
  { name: '16,000 Coins', amount: 16000, price: 200, usdPrice: 5, sku: 'coins_16000' },
  { name: '24,000 Coins', amount: 24000, price: 300, usdPrice: 8, sku: 'coins_24000' },
  { name: '32,000 Coins', amount: 32000, price: 400, usdPrice: 10, sku: 'coins_32000' },
  { name: '40,000 Coins', amount: 40000, price: 500, usdPrice: 12, sku: 'coins_40000' },
  { name: '80,000 Coins', amount: 80000, price: 1000, usdPrice: 16, sku: 'coins_80000' },
  { name: '400,000 Coins', amount: 400000, price: 5000, usdPrice: 70, sku: 'coins_400000' }
];

const CoinsSetup: React.FC = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(4000);
  const [price, setPrice] = useState<number>(50);
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetPkg, setDeleteTargetPkg] = useState<CoinPackage | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPackages();
      const allPkgs: CoinPackage[] = res.data.data || [];
      const coinPkgs = allPkgs.filter(p => !p.type || p.type.toLowerCase() === 'coin' || p.type.toLowerCase() === 'coins');
      setPackages(coinPkgs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coin packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Quick 1-Click Auto-Populate Client's 8 Tiers
  const handleAutoSeedTiers = async () => {
    setSeeding(true);
    const toastId = toast.loading('Populating standard 8 client packages (₹50 to ₹5,000)...');
    try {
      for (const tier of STANDARD_8_TIERS) {
        // Only add if not already present by amount
        const exists = packages.some(p => Number(p.amount) === tier.amount);
        if (!exists) {
          await adminService.managePackage('add', {
            name: tier.name,
            amount: tier.amount,
            price: tier.price,
            type: 'coin',
            currency: 'INR',
            status: 'active'
          });
        }
      }
      toast.success('Successfully populated standard 8 coin packages!', { id: toastId });
      fetchPackages();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to auto-populate tiers', { id: toastId });
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setName('4,000 Coins');
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
      toast.error('Coin quantity and price must be greater than zero');
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
        toast.success(`Coin package "${payload.name}" created successfully!`);
      } else {
        await adminService.managePackage('edit', payload, selectedId!);
        toast.success(`Coin package "${payload.name}" updated successfully!`);
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (pkg: CoinPackage) => {
    setDeleteTargetPkg(pkg);
    setShowConfirmDelete(true);
  };

  const executeDeletePackage = async () => {
    if (!deleteTargetPkg) return;
    try {
      await adminService.managePackage('delete', {}, deleteTargetPkg.id);
      toast.success(`Package "${deleteTargetPkg.name}" removed successfully.`);
      setShowConfirmDelete(false);
      setDeleteTargetPkg(null);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete package');
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
    <div className="user-management fade-in" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── TOP ACTION HEADER BAR (Always Visible & Crystal Clear) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)'
          }}>
            <Coins size={32} color="#854d0e" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Coins Setup & Store Pricing
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Add, update, or remove online coin recharge packages shown in the user mobile app.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Package & Auto-Populate */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAutoSeedTiers}
            disabled={seeding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: seeding ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={18} color="#eab308" />
            <span>{seeding ? 'Populating...' : 'Auto-Populate 8 Standard Tiers'}</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)',
              transition: 'transform 0.2s ease'
            }}
          >
            <Plus size={20} strokeWidth={3} />
            <span>+ Add New Package</span>
          </button>
        </div>
      </div>

      {/* ── BENTO OVERVIEW CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Configured Tiers</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>{packages.length} Packages</div>
          <div style={{ fontSize: '0.8rem', color: packages.length > 0 ? '#10b981' : '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> {packages.length > 0 ? 'Live in Mobile Store' : 'Pending Setup'}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Minimum Tier</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>₹50 / $2</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>4,000 Coins</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Maximum Mega Tier</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>₹5,000 / $70</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>400,000 Coins</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Billing Gateway</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>Google Play</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Dual Currency (INR / USD)</div>
        </div>
      </div>

      {/* ── COIN PACKAGES TABLE & ACTIONS ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        marginBottom: '28px'
      }}>
        {/* Table Top Toolbar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Coin Store Inventory ({packages.length} Active Packages)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Directly edit pricing or coin quantities. All changes reflect in the mobile app instantly.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>+ Add Package</span>
          </button>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 20px', width: '50px' }}>#</th>
                <th style={{ padding: '14px 20px' }}>Package Title</th>
                <th style={{ padding: '14px 20px' }}>Coins Quantity</th>
                <th style={{ padding: '14px 20px' }}>INR Cost (₹)</th>
                <th style={{ padding: '14px 20px' }}>USD Cost ($)</th>
                <th style={{ padding: '14px 20px' }}>Play Store SKU</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', width: '180px' }}>Actions (Edit / Delete)</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, idx) => {
                const usd = getUsdPrice(pkg);
                const sku = getSku(pkg);
                return (
                  <tr
                    key={pkg.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#94a3b8' }}>
                      #{idx + 1}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{pkg.name}</div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(234, 179, 8, 0.12)',
                        color: '#a16207',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        border: '1px solid rgba(234, 179, 8, 0.25)'
                      }}>
                        🪙 {(pkg.amount || pkg.coins || 0).toLocaleString()} Coins
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                        ₹{pkg.price}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.05rem' }}>
                        ${usd}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <code style={{
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#334155',
                        fontWeight: 700,
                        border: '1px solid #e2e8f0'
                      }}>
                        {sku}
                      </code>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: pkg.status === 'active' ? '#dcfce7' : '#f1f5f9',
                        color: pkg.status === 'active' ? '#15803d' : '#64748b',
                        border: pkg.status === 'active' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                      }}>
                        {pkg.status || 'active'}
                      </span>
                    </td>

                    {/* Prominent Edit & Delete Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          title="Edit this package"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClick(pkg)}
                          title="Delete this package"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* ── EMPTY STATE WITH 1-CLICK POPULATE ── */}
              {packages.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{
                      maxWidth: '480px',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '14px'
                    }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)'
                      }}>
                        <Coins size={36} color="#854d0e" />
                      </div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        No Coin Packages Currently Active
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                        Click below to automatically setup the client's standard 8 packages (₹50 to ₹5,000) or create your own custom tiers.
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                          onClick={handleAutoSeedTiers}
                          disabled={seeding}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                            color: '#000000',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: seeding ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)'
                          }}
                        >
                          <Sparkles size={18} />
                          <span>⚡ Auto-Setup Client's 8 Packages</span>
                        </button>
                        <button
                          onClick={handleOpenCreateModal}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={16} />
                          <span>+ Add Custom</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DEVELOPER REFERENCE BOX ── */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Smartphone size={24} color="#6366f1" />
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Live Mobile API Endpoints</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Packages saved here are automatically served to iOS/Android users based on user country currency.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>
            GET /api/economy/package-list?currency=INR
          </code>
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>
            GET /api/economy/package-list?currency=USD
          </code>
        </div>
      </div>

      {/* ── ADD & EDIT MODAL (Crystal Clear Form) ── */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <form
            onSubmit={handleFormSubmit}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'slideUp 0.25s ease'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#fef08a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Coins size={20} color="#854d0e" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {modalMode === 'create' ? 'Add New Coin Package' : 'Update Coin Package'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Package Title / Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 4,000 Coins"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    fontWeight: 600
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Coins Quantity (Delivered)
                  </label>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="e.g. 4000"
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    INR Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="e.g. 50"
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#16a34a',
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Preview for USD & SKU */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>Estimated USD: </span>
                  <strong style={{ color: '#2563eb' }}>${getUsdPrice({ amount, price } as any)}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Play Store SKU: </span>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>coins_{amount}</code>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Visibility / Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    fontWeight: 600,
                    background: '#ffffff'
                  }}
                >
                  <option value="active">Active (Visible in Mobile App Store)</option>
                  <option value="inactive">Inactive (Hidden from Users)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '18px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)'
                }}
              >
                <span>{isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Save & Create Package' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showConfirmDelete && deleteTargetPkg && (
        <ConfirmationModal
          title="Delete Coin Package"
          message={`Are you sure you want to permanently delete "${deleteTargetPkg.name}" (${deleteTargetPkg.amount} Coins for ₹${deleteTargetPkg.price}) from the store?`}
          confirmText="Yes, Delete Package"
          cancelText="Cancel"
          type="danger"
          onConfirm={executeDeletePackage}
          onClose={() => {
            setShowConfirmDelete(false);
            setDeleteTargetPkg(null);
          }}
        />
      )}
    </div>
  );
};

export default CoinsSetup;
