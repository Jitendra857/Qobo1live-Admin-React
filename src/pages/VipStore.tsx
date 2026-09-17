import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  Shield, Plus, Edit, Trash2, CheckCircle,
  Clock, CreditCard, Sparkles, X, Save,
  AlertTriangle, ShieldCheck, Zap, Crown, Gem, Award, Star, TrendingUp, Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/VipStore.css';
import '../styles/UserManagement.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const PRESET_PRIVILEGES = [
  'Exclusive VIP Badge',
  'Custom Avatar Frame',
  'Unique Entrance Effect',
  '1.5x XP Boost',
  'Stealth / Invisible Mode',
  'Custom Short User ID',
  'Special Gift Discount (10%)',
  'Global Chat Bubble'
];

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
      benefits: ['Exclusive VIP Badge', 'Custom Avatar Frame'],
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
      benefits: getBenefitsList(pkg),
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
      toast.success(`Revenue Tier ${selectedPackage ? 'Updated' : 'Provisioned'} Successfully!`);
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
      toast.success('Tier Decommissioned Successfully');
      fetchPackages();
    } catch (err) {
      toast.error('Decommissioning Failure');
    }
  };

  const addBenefit = (benefitToAdd?: string) => {
    const text = benefitToAdd || benefitInput.trim();
    if (!text) return;
    if (formData.benefits.includes(text)) return;
    setFormData({
      ...formData,
      benefits: [...formData.benefits, text]
    });
    if (!benefitToAdd) setBenefitInput('');
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  // Helper to safely format benefits from string array or JSON object
  const getBenefitsList = (pkg: any): string[] => {
    if (!pkg || !pkg.benefits) return [];
    if (Array.isArray(pkg.benefits)) return pkg.benefits;
    if (typeof pkg.benefits === 'object') {
      const list: string[] = [];
      if (pkg.benefits.badge) list.push('Exclusive VIP Badge');
      if (pkg.benefits.frame) list.push(`Special Frame: ${pkg.benefits.frame}`);
      if (pkg.benefits.enterEffect) list.push('Unique Entrance Effect');
      if (pkg.benefits.boostXp) list.push(`${pkg.benefits.boostXp}x XP Boost`);
      if (pkg.benefits.stealthMode) list.push('Stealth / Invisible Mode');
      if (pkg.benefits.customId) list.push('Custom Short User ID');
      Object.keys(pkg.benefits).forEach(key => {
        if (!['badge', 'frame', 'enterEffect', 'boostXp', 'stealthMode', 'customId'].includes(key)) {
          list.push(`${key}: ${pkg.benefits[key]}`);
        }
      });
      return list;
    }
    return [];
  };

  // Dynamic luxury styling theme selector for VIP Tiers
  interface TierTheme {
    type: string;
    badgeBg: string;
    glow: string;
    borderColor: string;
    accentColor: string;
    badgeLabel: string;
    iconColor: string;
    Icon: any;
  }

  const getTierTheme = (name: string): TierTheme => {
    const n = (name || '').toLowerCase();
    if (n.includes('bronze')) {
      return {
        type: 'bronze',
        badgeBg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
        glow: 'rgba(217, 119, 6, 0.25)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        accentColor: '#f59e0b',
        badgeLabel: 'BRONZE TIER',
        iconColor: '#fef3c7',
        Icon: Shield
      };
    }
    if (n.includes('silver')) {
      return {
        type: 'silver',
        badgeBg: 'linear-gradient(135deg, #94a3b8 0%, #334155 100%)',
        glow: 'rgba(148, 163, 184, 0.25)',
        borderColor: 'rgba(203, 213, 225, 0.4)',
        accentColor: '#cbd5e1',
        badgeLabel: 'SILVER TIER',
        iconColor: '#f8fafc',
        Icon: Award
      };
    }
    if (n.includes('gold')) {
      return {
        type: 'gold',
        badgeBg: 'linear-gradient(135deg, #eab308 0%, #854d0e 100%)',
        glow: 'rgba(234, 179, 8, 0.35)',
        borderColor: 'rgba(250, 204, 21, 0.5)',
        accentColor: '#facc15',
        badgeLabel: 'GOLDEN TIER',
        iconColor: '#fef9c3',
        Icon: Crown
      };
    }
    if (n.includes('diamond')) {
      return {
        type: 'diamond',
        badgeBg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
        glow: 'rgba(139, 92, 246, 0.35)',
        borderColor: 'rgba(168, 85, 247, 0.5)',
        accentColor: '#c084fc',
        badgeLabel: 'DIAMOND ELITE',
        iconColor: '#f0f9ff',
        Icon: Gem
      };
    }
    return {
      type: 'custom',
      badgeBg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      glow: 'rgba(99, 102, 241, 0.25)',
      borderColor: 'rgba(129, 140, 248, 0.4)',
      accentColor: '#818cf8',
      badgeLabel: 'PREMIUM TIER',
      iconColor: '#e0e7ff',
      Icon: Star
    };
  };

  const activeCount = packages.filter(p => p.status === 'active').length;
  const avgPrice = packages.length > 0
    ? (packages.reduce((acc, p) => acc + (p.price || 0), 0) / packages.length).toFixed(2)
    : '0.00';

  return (
    <div className="dashboard-page vip-store">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <div className="header-badge">
            <Crown size={16} className="text-amber-400" />
            <span>VIP Store & Subscription Governance</span>
          </div>
          <h1>VIP Store Governance</h1>
          <p className="subtitle">Manage premium subscription tiers, perks, pricing, and privileges for mobile users</p>
        </div>
        <button className="primary flex items-center gap-2 vip-create-btn" onClick={handleOpenCreate}>
          <Plus size={20} /> <span>Provision New Tier</span>
        </button>
      </div>

      {/* Top Analytics Stats Bar */}
      <div className="vip-stats-bar">
        <div className="vip-stat-card">
          <div className="stat-icon-wrapper active-stat">
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total VIP Tiers</span>
            <span className="stat-value">{packages.length} Tiers</span>
          </div>
        </div>

        <div className="vip-stat-card">
          <div className="stat-icon-wrapper operational-stat">
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Operational</span>
            <span className="stat-value">{activeCount} Tiers</span>
          </div>
        </div>

        <div className="vip-stat-card">
          <div className="stat-icon-wrapper price-stat">
            <CreditCard size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg Tier Price</span>
            <span className="stat-value">₹{avgPrice}</span>
          </div>
        </div>

        <div className="vip-stat-card">
          <div className="stat-icon-wrapper revenue-stat">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Revenue Stream</span>
            <span className="stat-value text-emerald-400">Live Active</span>
          </div>
        </div>
      </div>

      {/* VIP Tiers Cards Grid */}
      <div className="vip-grid mt-6">
        {packages.map((pkg) => {
          const theme = getTierTheme(pkg.name);
          const IconComp = theme.Icon;
          const benefitsList = getBenefitsList(pkg);

          return (
            <div 
              key={pkg.id} 
              className={`vip-card ${pkg.status} tier-${theme.type}`}
              style={{
                '--tier-glow': theme.glow,
                '--tier-border': theme.borderColor,
                '--tier-accent': theme.accentColor
              } as React.CSSProperties}
            >
              {/* Card Header & Badge */}
              <div className="vip-card-top">
                <div className="vip-badge-icon" style={{ background: theme.badgeBg }}>
                  <IconComp size={28} color={theme.iconColor} strokeWidth={2.5} />
                </div>
                
                <div className="vip-status-block">
                  <span className={`status-pill ${pkg.status === 'active' ? 'active' : 'inactive'}`}>
                    {pkg.status === 'active' ? '● OPERATIONAL' : '○ DEACTIVATED'}
                  </span>
                  <span className="tier-category-badge">{theme.badgeLabel}</span>
                </div>
              </div>

              {/* Title & Pricing */}
              <h3 className="tier-title">{pkg.name.toUpperCase()}</h3>
              
              <div className="vip-price-tag">
                <span className="vip-currency-symbol">₹</span>
                <span className="vip-amount">{pkg.price}</span>
                <span className="vip-currency">/ {pkg.durationDays} DAYS</span>
              </div>

              {/* Privileges List Section */}
              <div className="privileges-section">
                <div className="section-label-header">
                  <Sparkles size={12} style={{ color: theme.accentColor }} />
                  <span>EXCLUSIVE PRIVILEGES ({benefitsList.length})</span>
                </div>

                <div className="privileges-list">
                  {benefitsList.map((benefit: string, idx: number) => (
                    <div key={idx} className="benefit-pill">
                      <Zap size={14} style={{ color: theme.accentColor, flexShrink: 0 }} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                  
                  {benefitsList.length === 0 && (
                    <div className="empty-privileges">
                      <AlertTriangle size={14} className="opacity-50" />
                      <span>No privileges defined for this tier yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="vip-actions">
                <button 
                  className="secondary-vip-btn flex items-center justify-center gap-2" 
                  onClick={() => handleOpenEdit(pkg)}
                >
                  <Edit size={16} /> <span>CONFIG TIER</span>
                </button>
                <button 
                  className="icon-btn delete-btn" 
                  title="Decommission Tier"
                  onClick={() => handleDelete(pkg.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        
        {packages.length === 0 && !loading && (
          <div className="empty-state-card">
            <div className="vip-badge-icon large">
              <Shield size={44} />
            </div>
            <h2>VAULT IS EMPTY</h2>
            <p>No premium subscription tiers detected in system database. Provision your first VIP tier to initialize revenue streams.</p>
            <button className="primary-btn mt-6 flex items-center gap-2" onClick={handleOpenCreate}>
              <Plus size={18} /> <span>Provision First Tier</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <form onSubmit={handleSave} className="modal-content wide-modal slide-up">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="modal-header-icon">
                  <ShieldCheck size={22} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    {selectedPackage ? 'Refine Subscription Tier' : 'Provision New Subscription Tier'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    Configure duration, price, and mobile perks
                  </p>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid-2">
                <div className="form-group span-2" style={{ marginBottom: '0px' }}>
                  <label>Tier Designation Name</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. BRONZE VIP, SILVER VIP, GOLD VIP, DIAMOND VIP"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0px' }}>
                  <label>Price Exchange Value (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="admin-input" 
                    placeholder="0.00"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0px' }}>
                  <label>Validity Window (Days)</label>
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
                      <span>OPERATIONAL (ACTIVE)</span>
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

                {/* Benefits / Privileges Section */}
                <div className="form-group span-2" style={{ marginBottom: '0px' }}>
                  <label>Custom Tier Privileges</label>

                  {/* Preset Shortcuts */}
                  <div className="preset-privileges-bar">
                    <span className="preset-label">Quick Add Perks:</span>
                    <div className="preset-chips">
                      {PRESET_PRIVILEGES.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          className={`preset-chip ${formData.benefits.includes(preset) ? 'selected' : ''}`}
                          onClick={() => addBenefit(preset)}
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Privilege Input */}
                  <div className="flex gap-2 mt-2">
                    <input 
                      className="admin-input" 
                      placeholder="Type custom privilege and press Enter..."
                      value={benefitInput}
                      onChange={e => setBenefitInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <button type="button" className="primary-btn" onClick={() => addBenefit()} style={{ padding: '0 16px', borderRadius: '10px' }}>
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Form Benefit Pills */}
                  <div className="form-privileges-list">
                    {formData.benefits.map((b, i) => (
                      <div key={i} className="form-benefit-pill">
                        <Zap size={14} className="text-amber-300" />
                        <span>{b}</span>
                        <X size={14} className="cursor-pointer remove-icon" onClick={() => removeBenefit(i)} />
                      </div>
                    ))}
                    {formData.benefits.length === 0 && (
                      <span className="no-perks-hint">No privileges added yet. Click quick add buttons above.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn flex items-center gap-2">
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
