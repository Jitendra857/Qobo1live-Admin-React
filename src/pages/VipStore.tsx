import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  Shield, Plus, Edit, Trash2, CheckCircle,
  Clock, CreditCard, Sparkles, X, Save,
  AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/VipStore.css';
import '../styles/UserManagement.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const VipStore: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: 30,
    price: 0,
    benefits: [] as string[],
    status: 'active'
  });
  const [benefitInput, setBenefitInput] = useState('');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVipPackages();
      // Safety guard: ensure we always have an array
      const rawData = res.data?.data;
      setPackages(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      toast.error('VIP Protocol Synchronization Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleOpenCreate = () => {
    setSelectedPackage(null);
    setFormData({
      name: '',
      durationDays: 30,
      price: 0,
      benefits: [],
      status: 'active'
    });
    setShowModal(true);
    scrollToModalTop();
  };

  const handleOpenEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || '',
      durationDays: pkg.durationDays || 30,
      price: pkg.price || 0,
      // Safety guard: ensure benefits is always an array for the form
      benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
      status: pkg.status || 'active'
    });
    setShowModal(true);
    scrollToModalTop();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = selectedPackage ? 'UPDATE' : 'CREATE';
      await adminService.manageVipPackage(action, formData, selectedPackage?.id);
      toast.success(`Revenue Tier ${selectedPackage ? 'Updated' : 'Provisioned'}`);
      setShowModal(false);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Provisioning Protocol Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Decommission this subscription tier?')) return;
    try {
      await adminService.manageVipPackage('DELETE', {}, id);
      toast.success('Tier Decommissioned');
      fetchPackages();
    } catch (err) {
      toast.error('Decommissioning Failure');
    }
  };

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    setFormData({
      ...formData,
      benefits: [...formData.benefits, benefitInput.trim()]
    });
    setBenefitInput('');
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  // Helper to safely render benefits
  const getBenefits = (pkg: any): string[] => {
    if (Array.isArray(pkg.benefits)) return pkg.benefits;
    return [];
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h1 className="page-title">VIP Store Governance</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Manage premium subscription tiers and exclusive privileges</p>
        </div>
        <button className="primary flex items-center gap-2" onClick={handleOpenCreate} style={{ padding: '12px 24px' }}>
          <Plus size={20} /> <span>Provision New Tier</span>
        </button>
      </div>

      <div className="vip-grid mt-10">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`vip-card glass-panel ${pkg.status}`} style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="vip-badge-icon" style={{ background: pkg.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: pkg.status === 'active' ? '#10b981' : '#ef4444' }}>
              <Shield size={28} strokeWidth={2.5} />
            </div>
            
            <div className="vip-toggle">
              <span className={`status-neon ${pkg.status === 'active' ? 'active' : ''}`} style={{ border: 'none', background: pkg.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                {pkg.status.toUpperCase()}
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '4px', letterSpacing: '-0.02em' }}>{pkg.name.toUpperCase()}</h3>
            
            <div className="vip-price-tag">
              <span className="vip-amount" style={{ color: 'var(--text-primary)' }}>₹{pkg.price}</span>
              <span className="vip-currency" style={{ opacity: 0.6 }}>/ {pkg.durationDays} DAYS</span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                EXCLUSIVE PRIVILEGES
              </div>
              <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getBenefits(pkg).map((benefit: string, idx: number) => (
                  <div key={idx} className="benefit-pill" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    <Zap size={14} style={{ color: 'var(--accent-purple)' }} />
                    <span style={{ fontWeight: 700 }}>{benefit}</span>
                  </div>
                ))}
                {getBenefits(pkg).length === 0 && (
                  <div className="text-dim text-xs italic opacity-40">No privileges defined for this tier</div>
                )}
              </div>
            </div>

            <div className="vip-actions" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
              <button className="primary w-full flex-center gap-2" onClick={() => handleOpenEdit(pkg)} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <Edit size={16} /> CONFIG
              </button>
              <button 
                className="icon-btn" 
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                onClick={() => handleDelete(pkg.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {packages.length === 0 && !loading && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', border: '1px solid var(--glass-border)' }}>
            <div className="vip-badge-icon" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>
              <Shield size={40} />
            </div>
            <h2 style={{ fontWeight: 950, fontSize: '2rem' }}>VAULT IS EMPTY</h2>
            <p className="text-dim" style={{ maxWidth: '400px', margin: '16px auto', fontWeight: 600 }}>No premium tiers detected in the encryption matrix. Provision your first VIP tier to initialize revenue streams.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel slide-up" style={{ maxWidth: '550px', padding: '40px', background: 'var(--glass-bg)', backdropFilter: 'blur(40px)' }}>
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="vip-badge-icon" style={{ width: '48px', height: '48px', marginBottom: 0 }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.03em' }}>{selectedPackage ? 'REFINE TIER' : 'PROVISION TIER'}</h3>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="mt-8">
              <div className="form-group mb-6">
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>Tier Designation</label>
                <input 
                  className="admin-input" 
                  placeholder="e.g. DIAMOND PRIVILEGE"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="form-group">
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>Exchange Value (₹)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="0"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>Protocol Window (Days)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="30"
                    value={formData.durationDays} 
                    onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-6">
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>Tier Status</label>
                <div className="radio-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '12px' }}>
                  <label className={`radio-option ${formData.status === 'active' ? 'active' : ''}`} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', background: formData.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: formData.status === 'active' ? '#10b981' : 'inherit' }}>
                    <input 
                      type="radio" 
                      name="status" 
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontWeight: 800 }}>OPERATIONAL</span>
                  </label>
                  <label className={`radio-option ${formData.status === 'inactive' ? 'active' : ''}`} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', background: formData.status === 'inactive' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: formData.status === 'inactive' ? '#ef4444' : 'inherit' }}>
                    <input 
                      type="radio" 
                      name="status" 
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontWeight: 800 }}>DEACTIVATED</span>
                  </label>
                </div>
              </div>

              <div className="form-group mb-8">
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>Tier Privileges</label>
                <div className="flex gap-2">
                  <input 
                    className="admin-input" 
                    placeholder="e.g. GLOBAL BROADCAST ACCESS"
                    value={benefitInput}
                    onChange={e => setBenefitInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                  />
                  <button type="button" className="primary" onClick={addBenefit} style={{ width: '56px', padding: 0, borderRadius: '12px' }}>
                    <Plus size={24} />
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {formData.benefits.map((b, i) => (
                    <div key={i} className="benefit-pill" style={{ background: 'var(--accent-purple)', color: '#fff', border: 'none', padding: '8px 16px' }}>
                      <span style={{ fontWeight: 800 }}>{b}</span>
                      <X size={14} className="cursor-pointer" onClick={() => removeBenefit(i)} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="primary w-full flex-center gap-3" style={{ padding: '20px', borderRadius: '16px', fontSize: '1rem', fontWeight: 950 }}>
                <Save size={24} />
                <span>{selectedPackage ? 'COMMIT CHANGES' : 'INITIALIZE TIER'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipStore;
