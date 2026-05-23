import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Key, Globe, 
  Save, AlertCircle, CheckCircle2, Zap,
  DollarSign, Wallet, Eye, EyeOff, Edit, Trash2, Plus, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { adminService } from '../services/api';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';

interface Gateway {
    id: string;
    name: string;
    status: string;
    type: string;
    apiKey: string;
    secret: string;
}

const GatewayConfig: React.FC = () => {
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'External',
        status: 'active',
        apiKey: '',
        secret: ''
    });

    const fetchGateways = async () => {
        try {
            const res = await adminService.getGateways();
            setGateways(res.data);
        } catch (error) {
            // Fallback for demo if API not ready
            setGateways([
                { id: '1', name: 'Razorpay', status: 'active', type: 'External', apiKey: 'rzp_live_••••••••', secret: '••••••••••••••••' },
                { id: '2', name: 'PayPal', status: 'inactive', type: 'External', apiKey: 'sb-••••••••••••', secret: '••••••••••••••••' },
                { id: '3', name: 'Google Pay', status: 'active', type: 'IAP', apiKey: 'gp-••••••••••••', secret: '••••••••••••••••' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways();
    }, []);

    const toggleVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenModal = (gw?: Gateway) => {
        if (gw) {
            setEditingGateway(gw);
            setFormData({
                name: gw.name,
                type: gw.type,
                status: gw.status,
                apiKey: gw.apiKey,
                secret: gw.secret
            });
        } else {
            setEditingGateway(null);
            setFormData({ name: '', type: 'External', status: 'active', apiKey: '', secret: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const action = editingGateway ? 'UPDATE' : 'ADD';
            await adminService.manageGateway(action, formData, editingGateway?.id);
            toast.success(`Gateway ${editingGateway ? 'Updated' : 'Added'}`);
            setIsModalOpen(false);
            fetchGateways();
        } catch (error) {
            toast.error('Operation failed');
            // Mock success for UI demo
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this gateway?')) return;
        try {
            await adminService.manageGateway('DELETE', {}, id);
            toast.success('Gateway Deleted');
            fetchGateways();
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    return (
        <div className="dashboard-page gateway-config">
            <Toaster position="top-right" />
            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1>Payment Gateways</h1>
                    <p className="subtitle">Configure API keys and financial provider integrations</p>
                </div>
                <div className="header-actions">
                    <button className="primary flex items-center gap-2" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Provision Gateway</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gateways.map((gw) => (
                    <div key={gw.id} className="details-card" style={{ padding: '24px' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="mini-stat-icon blue" style={{ width: '48px', height: '48px' }}>
                                    {gw.id.includes('google') ? <Wallet size={24} /> : <CreditCard size={24} />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#333' }}>{gw.name}</h3>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase' }}>{gw.type} Gateway</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`status-pill ${gw.status === 'active' ? 'active' : ''}`} style={{ fontSize: '10px', padding: '6px 12px' }}>
                                    {gw.status.toUpperCase()}
                                </span>
                                <div className="flex gap-2">
                                    <button className="op-btn" onClick={() => handleOpenModal(gw)}><Edit size={14} /></button>
                                    <button className="op-btn" style={{ color: '#e74a3b' }} onClick={() => handleDelete(gw.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="input-group">
                                <div className="flex justify-between items-center mb-2">
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#a1a1a1', textTransform: 'uppercase' }}>API Key / Client ID</label>
                                    <button className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-[10px] font-bold" onClick={() => toggleVisibility(gw.id)}>
                                        {showKeys[gw.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                        {showKeys[gw.id] ? 'HIDE' : 'VIEW'}
                                    </button>
                                </div>
                                <input 
                                    type={showKeys[gw.id] ? 'text' : 'password'} 
                                    className="premium-input" 
                                    value={gw.apiKey} 
                                    readOnly 
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        background: '#f8fafc',
                                        fontFamily: 'monospace',
                                        borderRadius: '0px'
                                    }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#a1a1a1', textTransform: 'uppercase', marginBottom: '8px' }}>Secret Key</label>
                                <input 
                                    type={showKeys[gw.id] ? 'text' : 'password'} 
                                    className="premium-input" 
                                    value={gw.secret} 
                                    readOnly 
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        background: '#f8fafc',
                                        fontFamily: 'monospace',
                                        borderRadius: '0px'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span style={{ letterSpacing: '1px' }}>SSL SECURE CONNECTION</span>
                            </div>
                            <button className="secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>Advanced Props</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '0px', padding: '0', overflow: 'hidden' }}>
                        <div className="modal-header" style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                            <h2 style={{ fontWeight: 850, fontSize: '1.4rem', color: '#1e293b' }}>
                                {editingGateway ? 'Configure Gateway' : 'Provision New Gateway'}
                            </h2>
                            <button className="op-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '32px' }}>
                            <div className="flex flex-col gap-6">
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Provider Name</label>
                                    <input 
                                        type="text" 
                                        className="premium-input w-full" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Razorpay, PayPal, Stripe"
                                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="input-group">
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Integration Type</label>
                                        <select 
                                            className="premium-input w-full"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="External">External Gateway</option>
                                            <option value="IAP">In-App Purchase</option>
                                            <option value="Ads">Ads Network</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Initial Status</label>
                                        <select 
                                            className="premium-input w-full"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="active">Active (Production)</option>
                                            <option value="inactive">Inactive (Staging)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>API Key / Client ID</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="premium-input w-full" 
                                            value={formData.apiKey} 
                                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Secret Key</label>
                                    <input 
                                        type="text" 
                                        className="premium-input w-full" 
                                        value={formData.secret} 
                                        onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                            <button className="secondary flex-1" onClick={() => setIsModalOpen(false)} style={{ height: '48px', fontWeight: 800 }}>
                                Cancel Action
                            </button>
                            <button className="primary flex-1" onClick={handleSave} style={{ height: '48px', fontWeight: 800, background: '#4e73df' }}>
                                Deploy Gateway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GatewayConfig;
