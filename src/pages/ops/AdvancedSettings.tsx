import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Settings, Shield, Globe, Database, Save, CreditCard } from 'lucide-react';
import '../../styles/UserManagement.css';

const AdvancedSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await adminService.getSettings();
      setSettings(res.data.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    try {
      await adminService.updateSetting({ key, value });
      toast.success('Setting updated successfully');
      fetchSettings();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Deep Configuration</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Configure system-level variables and API security</p>
        </div>
      </div>

      <div className="bento-grid mt-10">
        <div className="bento-card wide">
          <div className="card-top">
            <div className="card-label">ENVIRONMENT VARS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
              <Shield size={24} />
            </div>
          </div>
          <div className="card-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '10px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>FCM SERVER KEY</label>
              <input type="password" value={settings.fcm_key || ''} readOnly style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>AWS ACCESS ID</label>
              <input type="text" value={settings.aws_secret || ''} readOnly style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        <div className="bento-card wide">
          <div className="card-top">
            <div className="card-label">PAYMENT GATEWAYS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
              <CreditCard size={24} />
            </div>
          </div>
          <div className="card-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Admob Key</label>
              <input type="text" value={settings.admob_key || ''} onChange={(e) => setSettings({...settings, admob_key: e.target.value})} onBlur={() => handleUpdate('admob_key', settings.admob_key)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} placeholder="Enter Admob Key" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Facebook Ads Key</label>
              <input type="text" value={settings.fb_ads_key || ''} onChange={(e) => setSettings({...settings, fb_ads_key: e.target.value})} onBlur={() => handleUpdate('fb_ads_key', settings.fb_ads_key)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} placeholder="Enter FB Ads Key" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Google Payments Key</label>
              <input type="text" value={settings.google_pay_key || ''} onChange={(e) => setSettings({...settings, google_pay_key: e.target.value})} onBlur={() => handleUpdate('google_pay_key', settings.google_pay_key)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} placeholder="Enter Google Pay Key" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>PayPal Client ID</label>
              <input type="text" value={settings.paypal_client_id || ''} onChange={(e) => setSettings({...settings, paypal_client_id: e.target.value})} onBlur={() => handleUpdate('paypal_client_id', settings.paypal_client_id)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} placeholder="Enter PayPal Client ID" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Razorpay Key</label>
              <input type="text" value={settings.razorpay_key || ''} onChange={(e) => setSettings({...settings, razorpay_key: e.target.value})} onBlur={() => handleUpdate('razorpay_key', settings.razorpay_key)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }} placeholder="Enter Razorpay Key" />
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">MAINTENANCE</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}>
              <Globe size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle maintenance mode for the mobile app.</p>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <span style={{ fontWeight: 600 }}>App Status: {settings.maintenance_mode ? 'MAINTENANCE' : 'LIVE'}</span>
              <button 
                className="primary" 
                style={{ padding: '8px 16px', background: settings.maintenance_mode ? '#10b981' : '#ef4444' }}
                onClick={() => handleUpdate('maintenance_mode', !settings.maintenance_mode)}
              >
                {settings.maintenance_mode ? 'GO LIVE' : 'GO OFFLINE'}
              </button>
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">APP VERSION</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}>
              <Database size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Version</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{settings.version_check || 'v1.0.0'}</div>
              </div>
              <button className="primary flex-center gap-2" style={{ marginTop: '5px' }}>
                <Save size={16} />
                <span>Force Update</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
