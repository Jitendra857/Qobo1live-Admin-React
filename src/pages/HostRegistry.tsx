import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { CheckCircle, XCircle, UserCheck, Eye, Phone, Mail, Calendar, Hash, Type, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import MediaImage from '../components/MediaImage';
import { useLayout } from '../context/LayoutContext';

const HostRegistry: React.FC = () => {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    const { setMenuPosition, setSidebarCollapsed } = useLayout();

    useEffect(() => {
        setMenuPosition('left');
        setSidebarCollapsed(false);
    }, [setMenuPosition, setSidebarCollapsed]);

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
            {/* Scoped CSS Inject for Luxury Modern Aesthetics */}
            <style>{`
                /* Premium Table Perfect Alignment Overrides */
                .premium-table {
                  width: 100% !important;
                  border-collapse: separate !important;
                  border-spacing: 0 12px !important;
                  margin-top: 0 !important;
                  table-layout: fixed !important;
                }
                .premium-table th {
                  padding: 16px 24px !important;
                  font-size: 0.75rem !important;
                  font-weight: 800 !important;
                  text-transform: uppercase !important;
                  color: var(--text-secondary) !important;
                  letter-spacing: 0.1em !important;
                  border: none !important;
                  vertical-align: middle !important;
                }
                .premium-table td {
                  padding: 16px 24px !important;
                  background: var(--bg-surface) !important;
                  border-top: 1px solid var(--glass-border) !important;
                  border-bottom: 1px solid var(--glass-border) !important;
                  color: var(--text-primary) !important;
                  vertical-align: middle !important;
                  height: 72px !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                }
                .premium-table td:first-child {
                  border-left: 1px solid var(--glass-border) !important;
                  border-top-left-radius: 16px !important;
                  border-bottom-left-radius: 16px !important;
                }
                .premium-table td:last-child {
                  border-right: 1px solid var(--glass-border) !important;
                  border-top-right-radius: 16px !important;
                  border-bottom-right-radius: 16px !important;
                }
                .premium-table tr {
                  box-shadow: var(--card-shadow) !important;
                  transition: all 0.25s ease !important;
                }
                .premium-table tbody tr:hover {
                  transform: translateY(-2px) !important;
                  box-shadow: var(--card-shadow-hover) !important;
                }
                .premium-table tbody tr:hover td {
                  background: var(--bg-surface) !important;
                  border-color: var(--accent-primary) !important;
                }

                /* Custom styled elements */
                .identity-block {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .avatar-glass {
                  width: 44px;
                  height: 44px;
                  border-radius: 12px;
                  overflow: hidden;
                  background: var(--input-bg) !important;
                }
                .identity-text {
                  display: flex;
                  flex-direction: column;
                  gap: 2px;
                }
                .name-bold {
                  font-weight: 800;
                  color: var(--text-primary) !important;
                  font-size: 0.95rem !important;
                }
                .email-sub {
                  font-size: 0.72rem;
                  color: var(--text-secondary) !important;
                  font-weight: 600;
                }

                /* Modal Overlays and Styling */
                .host-modal-overlay {
                  position: fixed;
                  top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(15, 23, 42, 0.7);
                  backdrop-filter: blur(10px);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 2000;
                  animation: fadeIn 0.2s ease;
                }
                .host-modal-box {
                  background: var(--bg-surface) !important;
                  color: var(--text-primary) !important;
                  border-radius: 24px;
                  width: 90%;
                  max-width: 500px;
                  padding: 32px;
                  box-shadow: var(--card-shadow) !important;
                  border: 1px solid var(--glass-border) !important;
                  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 16px;
                  margin-top: 20px;
                  margin-bottom: 24px;
                }
                .detail-item {
                  display: flex;
                  flex-direction: column;
                  background: var(--input-bg) !important;
                  border: 1px solid var(--glass-border) !important;
                  padding: 12px;
                  border-radius: 12px;
                }
                .detail-label {
                  font-size: 0.72rem;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  color: var(--text-secondary) !important;
                  font-weight: 800;
                  margin-bottom: 4px;
                }
                .detail-value {
                  font-size: 0.88rem;
                  color: var(--text-primary) !important;
                  font-weight: 700;
                }

                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

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
                                <th style={{ textAlign: 'left', width: '28%' }}>Applicant Identity</th>
                                <th style={{ textAlign: 'left', width: '24%' }}>Registration Data</th>
                                <th style={{ textAlign: 'center', width: '12%' }}>Category</th>
                                <th style={{ textAlign: 'center', width: '12%' }}>Onboarding</th>
                                <th style={{ textAlign: 'center', width: '12%' }}>Status</th>
                                <th style={{ textAlign: 'right', width: '12%' }}>Protocols</th>
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
                                        <td style={{ textAlign: 'left' }}>
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
                                        <td style={{ textAlign: 'left' }}>
                                            <div className="flex flex-col gap-1" style={{ width: '100%' }}>
                                                <div className="flex items-center gap-2 text-xs font-bold" style={{ opacity: 0.8, wordBreak: 'break-all', whiteSpace: 'normal' }}>
                                                    <Mail size={12} className="text-blue-400" style={{ flexShrink: 0 }} /> 
                                                    <span>{app.gmail}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-green-400" style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
                                                    <Phone size={12} style={{ flexShrink: 0 }} /> 
                                                    <span>{app.whatsapp}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div className="asset-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                                                    <Type size={14} />
                                                    <span style={{ fontWeight: 800 }}>{(app.category || 'general').toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>
                                                <Clock size={14} /> 
                                                <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <span className={`status-neon ${app.status.toLowerCase()}`} style={{ minWidth: '100px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    {app.status === 'pending' ? <AlertCircle size={12} /> : <ShieldCheck size={12} />}
                                                    <span>{app.status.toUpperCase()}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="ops-cluster" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                                                {app.status === 'pending' && canApprove ? (
                                                    <>
                                                        <button 
                                                            className="op-btn edit" 
                                                            onClick={() => handleAction(app.id, 'APPROVED')}
                                                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                            title="Approve Host"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            className="op-btn delete" 
                                                            onClick={() => handleAction(app.id, 'REJECTED')}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                            title="Reject Host"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className="op-btn edit" 
                                                        style={{ opacity: 0.4, cursor: 'not-allowed', background: 'rgba(148, 163, 184, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                                        title="Identity Authorized"
                                                        disabled
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    className="op-btn edit" 
                                                    title="View Details"
                                                    onClick={() => setSelectedApp(app)}
                                                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                >
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

            {/* View Host Details Modal */}
            {selectedApp && (
                <div className="host-modal-overlay">
                    <div className="host-modal-box">
                        <div className="flex justify-between items-center" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserCheck size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Host Application</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Verification Desk</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedApp(null)}
                                style={{ background: 'var(--input-bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 900 }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div className="shadow-lg" style={{ width: '120px', height: '120px', borderRadius: '20px', overflow: 'hidden', border: '3px solid var(--glass-border)', background: 'var(--bg-body)' }}>
                                <MediaImage 
                                    src={selectedApp.realPhoto} 
                                    className="h-full w-full object-cover" 
                                    fallbackText={selectedApp.hostName?.[0] || 'H'}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedApp.hostName}</span>
                                <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 800, marginTop: '4px', letterSpacing: '0.5px' }}>
                                    AGENT CODE: {selectedApp.agencyCode}
                                </span>
                            </div>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">WhatsApp</span>
                                <span className="detail-value">{selectedApp.whatsapp || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email ID</span>
                                <span className="detail-value" style={{ wordBreak: 'break-all' }}>{selectedApp.gmail || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Host ID Number</span>
                                <span className="detail-value">{selectedApp.hostIdNumber || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Birthday</span>
                                <span className="detail-value">
                                    {selectedApp.birthday ? new Date(selectedApp.birthday).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Category</span>
                                <span className="detail-value">{(selectedApp.category || 'general').toUpperCase()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <span className={`status-neon ${selectedApp.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '4px 10px', marginTop: '4px', width: 'fit-content' }}>
                                    {selectedApp.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
                            <button className="secondary" onClick={() => setSelectedApp(null)} style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, flex: 1 }}>
                                Close Details
                            </button>
                            {selectedApp.status === 'pending' && canApprove && (
                                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                    <button 
                                        className="primary" 
                                        onClick={() => {
                                            handleAction(selectedApp.id, 'APPROVED');
                                            setSelectedApp(null);
                                        }}
                                        style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', flex: 1 }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleAction(selectedApp.id, 'REJECTED');
                                            setSelectedApp(null);
                                        }}
                                        style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', flex: 1 }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostRegistry;
