import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, Key, Globe, 
  Save, AlertCircle, CheckCircle2, Zap,
  DollarSign, Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';

const GatewayConfig: React.FC = () => {
    const [gateways, setGateways] = useState([
        { id: 'google', name: 'Google Pay', status: 'active', type: 'IAP' },
        { id: 'razorpay', name: 'Razorpay', status: 'active', type: 'External' },
        { id: 'paypal', name: 'PayPal', status: 'inactive', type: 'External' },
        { id: 'admob', name: 'Google Admob', status: 'active', type: 'Ads' },
    ]);

    return (
        <div className="moderation-page">
            <div className="moderation-header">
                <div className="welcome-section">
                    <h1>Payment Gateways</h1>
                    <p className="subtitle">Configure API keys and financial provider integrations</p>
                </div>
                <div className="header-actions">
                    <button className="sync-btn primary" onClick={() => toast.success('Gateways Synchronized')}>
                        <Save size={16} />
                        <span>Deploy Config</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {gateways.map((gw) => (
                    <div key={gw.id} className="glass-card p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-slate-50 text-slate-900">
                                    {gw.id === 'google' ? <Wallet size={24} /> : <CreditCard size={24} />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>{gw.name}</h3>
                                    <span className="text-xs font-black opacity-40 uppercase">{gw.type} Gateway</span>
                                </div>
                            </div>
                            <span className={`status-pill ${gw.status === 'active' ? 'active' : ''}`}>
                                {gw.status}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="premium-input-group" style={{ marginBottom: 0 }}>
                                <label className="premium-label" style={{ fontSize: '0.65rem' }}>API Key / Client ID</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="password" 
                                        className="premium-input" 
                                        value="••••••••••••••••••••" 
                                        readOnly 
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                    <button className="op-btn"><Key size={16} /></button>
                                </div>
                            </div>
                            <div className="premium-input-group" style={{ marginBottom: 0 }}>
                                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Secret Secret</label>
                                <input 
                                    type="password" 
                                    className="premium-input" 
                                    value="••••••••••••••••••••" 
                                    readOnly 
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span>SSL SECURE CONNECTION</span>
                            </div>
                            <button className="helper-link-premium">Advanced Props</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GatewayConfig;
