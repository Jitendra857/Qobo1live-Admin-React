import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { CheckCircle, XCircle, UserCheck, Eye, Phone, Mail, Calendar, Hash, Type, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import MediaImage from '../components/MediaImage';

const HostRegistry: React.FC = () => {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const res = await adminService.getHosts();
            if (res.data.statusCode === 1) {
                setApps(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to synchronize registry:', err);
            toast.error('Registry synchronization failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const canApprove = currentUser?.role === 'super_admin';

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await adminService.approveHost({ application_id: id, status });
            if (res.data.statusCode === 1) {
                toast.success(`Identity ${status === 'APPROVED' ? 'Authorized' : 'Blacklisted'} Successfully`);
                fetchApps();
            } else {
                toast.error(res.data.message || 'Operation failed');
            }
        } catch (err) {
            toast.error('Network protocol error during authorization');
        }
    };

    return (
        <div className="user-management fade-in">
            <div className="header-actions">
                <div>
                    <h1 className="page-title">Identity Registry</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Authorization gateway for new talent onboarding</p>
                </div>
                <div className="top-tools">
                    <div className="status-neon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                        <ShieldCheck size={14} /> <span>Security Level 4 Active</span>
                    </div>
                </div>
            </div>

            <div className="glass p-1 mt-10">
                <div className="table-wrapper" style={{ marginTop: 0 }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>APPLICANT IDENTITY</th>
                                <th>REGISTRATION DATA</th>
                                <th>CATEGORY</th>
                                <th>ONBOARDING</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>PROTOCOLS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-20"><div className="spin" style={{ display: 'inline-block' }}><ShieldCheck size={32} /></div></td></tr>
                            ) : apps.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-20 text-dim">No incoming signatures detected in registry buffer.</td></tr>
                            ) : (
                                apps.map(app => (
                                    <tr key={app.id} className="row-premium">
                                        <td>
                                            <div className="identity-block">
                                                <div className="avatar-glass shadow-lg" style={{ border: '2px solid var(--glass-border)' }}>
                                                    <MediaImage 
                                                        src={app.realPhoto} 
                                                        className="h-full w-full object-cover" 
                                                        fallbackText={app.hostName?.[0] || 'H'}
                                                    />
                                                </div>
                                                <div className="identity-text">
                                                    <span className="name-bold" style={{ fontSize: '1rem' }}>{app.hostName}</span>
                                                    <span className="email-sub" style={{ letterSpacing: '1px' }}>AGENT CODE: {app.agencyCode}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold" style={{ opacity: 0.8 }}>
                                                    <Mail size={12} className="text-blue-400" /> {app.gmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                                                    <Phone size={12} /> {app.whatsapp}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="asset-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                                                <Type size={14} />
                                                <span style={{ fontWeight: 800 }}>{(app.category || 'general').toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                                                <Clock size={14} /> {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-neon ${app.status.toLowerCase()}`} style={{ minWidth: '100px', textAlign: 'center' }}>
                                                {app.status === 'pending' ? <AlertCircle size={12} /> : <ShieldCheck size={12} />}
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ops-cluster" style={{ justifyContent: 'flex-end' }}>
                                                {app.status === 'pending' && canApprove ? (
                                                    <>
                                                        <button 
                                                            className="op-btn edit" 
                                                            onClick={() => handleAction(app.id, 'APPROVED')}
                                                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            className="op-btn delete" 
                                                            onClick={() => handleAction(app.id, 'REJECTED')}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="op-btn edit" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                                                        <UserCheck size={18} />
                                                    </button>
                                                )}
                                                <button className="op-btn edit" title="Encrypted View">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HostRegistry;
