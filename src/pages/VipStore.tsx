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
      setPackages(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load VIP packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

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
      name: pkg.name,
      durationDays: pkg.durationDays,
      price: pkg.price,
      benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
      status: pkg.status
    });
    setShowModal(true);
    scrollToModalTop();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = selectedPackage ? 'UPDATE' : 'CREATE';
      await adminService.manageVipPackage(action, formData, selectedPackage?.id);
      toast.success(`Package ${selectedPackage ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await adminService.manageVipPackage('DELETE', {}, id);
      toast.success('Package deleted');
      fetchPackages();
    } catch (err) {
      toast.error('Deletion failed');
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

  return (
    <>
      <div className="user-management fade-in">
        <div className="header-actions">
          <h2 className="page-title">VIP Store Governance</h2>
          <button className="primary flex items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={20} /> Create Package
          </button>
        </div>

        <div className="vip-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`vip-card ${pkg.status}`}>
              <div className="vip-badge-icon">
                <Shield size={28} strokeWidth={2.5} />
              </div>
              
              <div className="vip-toggle">
                <span className={`status-neon ${pkg.status}`}>
                  {pkg.status.toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>{pkg.name}</h3>
              
              <div className="vip-price-tag">
                <span className="vip-amount">₹{pkg.price}</span>
                <span className="vip-currency">/ {pkg.durationDays} Days</span>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Privileges & Perks
                </div>
                <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  {pkg.benefits?.map((benefit: string, idx: number) => (
                    <div key={idx} className="benefit-pill">
                      <Zap size={14} className="text-purple-500" style={{ color: 'var(--accent-purple)' }} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                  {(!pkg.benefits || pkg.benefits.length === 0) && (
                    <div className="text-dim text-xs italic">No benefits assigned</div>
                  )}
                </div>
              </div>

              <div className="vip-actions">
                <button className="secondary-btn w-full flex-center gap-2" onClick={() => handleOpenEdit(pkg)}>
                  <Edit size={16} /> Edit
                </button>
                <button 
                  className="icon-btn" 
                  style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                  onClick={() => handleDelete(pkg.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {packages.length === 0 && !loading && (
            <div className="vip-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px' }}>
              <div className="vip-badge-icon" style={{ margin: '0 auto 20px' }}>
                <Shield size={32} />
              </div>
              <h3 style={{ fontWeight: 900 }}>No VIP Tiers Available</h3>
              <p className="text-dim">Create your first premium subscription tier to start generating revenue.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel slide-up" style={{ maxWidth: '550px', padding: '40px' }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="vip-badge-icon" style={{ width: '40px', height: '40px', marginBottom: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedPackage ? 'Update Tier' : 'New VIP Tier'}</h3>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="mt-8">
              <div className="form-group mb-6">
                <label>Tier Name</label>
                <input 
                  className="admin-input" 
                  placeholder="e.g. Diamond VIP, Legend"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="0"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Validity (Days)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="30"
                    value={formData.durationDays} 
                    onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-6">
                <label>Tier Status</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="status" 
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    />
                    <span>Active (1)</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="status" 
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    />
                    <span>Inactive (0)</span>
                  </label>
                </div>
              </div>

              <div className="form-group mb-8">
                <label>Privileges</label>
                <div className="flex gap-2">
                  <input 
                    className="admin-input" 
                    placeholder="e.g. Golden Badge"
                    value={benefitInput}
                    onChange={e => setBenefitInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <button type="button" className="secondary-btn" onClick={addBenefit} style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={18} />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.benefits.map((b, i) => (
                    <div key={i} className="benefit-pill" style={{ background: 'var(--accent-purple)', color: '#fff', border: 'none' }}>
                      {b}
                      <X size={14} className="cursor-pointer" onClick={() => removeBenefit(i)} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="primary-btn w-full flex-center gap-2" style={{ padding: '18px', borderRadius: '16px' }}>
                <Save size={20} />
                <span>{selectedPackage ? 'Apply Changes' : 'Provision Tier'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VipStore;
