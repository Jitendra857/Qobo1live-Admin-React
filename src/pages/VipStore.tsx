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
    <div className="dashboard-page vip-store">
      <div className="dashboard-header">
        <div>
          <h1>VIP Store Governance</h1>
          <p className="subtitle">Manage premium subscription tiers and privileges</p>
        </div>
        <button className="primary flex items-center gap-2" onClick={handleOpenCreate}>
          <Plus size={20} /> <span>Provision New Tier</span>
        </button>
      </div>

      <div className="vip-grid mt-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`vip-card ${pkg.status}`}>
            <div className="vip-badge-icon">
              <Shield size={28} strokeWidth={2.5} />
            </div>
            
            <div className="vip-toggle">
              <span className={`status-pill ${pkg.status === 'active' ? 'active' : ''}`}>
                {pkg.status.toUpperCase()}
              </span>
            </div>

            <h3 className="tier-title">{pkg.name.toUpperCase()}</h3>
            
            <div className="vip-price-tag">
              <span className="vip-amount">₹{pkg.price}</span>
              <span className="vip-currency">/ {pkg.durationDays} DAYS</span>
            </div>

            <div className="privileges-section">
              <div className="section-label">EXCLUSIVE PRIVILEGES</div>
              <div className="privileges-list">
                {getBenefits(pkg).map((benefit: string, idx: number) => (
                  <div key={idx} className="benefit-pill">
                    <Zap size={14} className="text-accent" />
                    <span>{benefit}</span>
                  </div>
                ))}
                {getBenefits(pkg).length === 0 && (
                  <div className="empty-privileges">No privileges defined</div>
                )}
              </div>
            </div>

            <div className="vip-actions">
              <button className="secondary w-full flex items-center justify-center gap-2" onClick={() => handleOpenEdit(pkg)}>
                <Edit size={16} /> CONFIG
              </button>
              <button 
                className="icon-btn delete-btn" 
                onClick={() => handleDelete(pkg.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {packages.length === 0 && !loading && (
          <div className="empty-state-card">
            <div className="vip-badge-icon large">
              <Shield size={40} />
            </div>
            <h2>VAULT IS EMPTY</h2>
            <p>No premium tiers detected. Provision your first VIP tier to initialize revenue streams.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <form onSubmit={handleSave} className="modal-content wide-modal slide-up">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0 }}>{selectedPackage ? 'Refine Tier' : 'Provision Tier'}</h3>
              </div>
              <button className="close-btn" type="button" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid-2">
                <div className="form-group span-2" style={{ marginBottom: '0px' }}>
                  <label>Tier Designation</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. DIAMOND PRIVILEGE"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0px' }}>
                  <label>Exchange Value (₹)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="0"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0px' }}>
                  <label>Protocol Window (Days)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    placeholder="30"
                    value={formData.durationDays} 
                    onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group span-2" style={{ marginBottom: '0px' }}>
                  <label>Tier Status</label>
                  <div className="radio-group">
                    <label className={`radio-option ${formData.status === 'active' ? 'active active-status' : ''}`}>
                      <input 
                        type="radio" 
                        name="status" 
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        style={{ display: 'none' }}
                      />
                      <span>OPERATIONAL</span>
                    </label>
                    <label className={`radio-option ${formData.status === 'inactive' ? 'active inactive-status' : ''}`}>
                      <input 
                        type="radio" 
                        name="status" 
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        style={{ display: 'none' }}
                      />
                      <span>DEACTIVATED</span>
                    </label>
                  </div>
                </div>

                <div className="form-group span-2" style={{ marginBottom: '0px' }}>
                  <label>Tier Privileges</label>
                  <div className="flex gap-2">
                    <input 
                      className="admin-input" 
                      placeholder="e.g. GLOBAL BROADCAST ACCESS"
                      value={benefitInput}
                      onChange={e => setBenefitInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <button type="button" className="primary-btn" onClick={addBenefit} style={{ padding: '0 12px' }}>
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="form-privileges-list">
                    {formData.benefits.map((b, i) => (
                      <div key={i} className="form-benefit-pill">
                        <span>{b}</span>
                        <X size={14} className="cursor-pointer" onClick={() => removeBenefit(i)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                <Save size={18} />
                <span>{selectedPackage ? 'Save Changes' : 'Initialize Tier'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VipStore;
