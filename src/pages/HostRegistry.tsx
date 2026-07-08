import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  CheckCircle, XCircle, UserCheck, Eye, Phone, Mail,
  ShieldCheck, Clock, AlertCircle, Search, RefreshCw,
  Users, Filter, Hash, Building2, Send, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import '../styles/Modal.css';
import MediaImage from '../components/MediaImage';
import { useLayout } from '../context/LayoutContext';

const HostRegistry: React.FC = () => {
  const [apps, setApps]           = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState<string>('all');
  const [agenciesList, setAgenciesList] = useState<any[]>([]);

  // Reject / Modal State
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectApp, setRejectApp] = useState<any>(null);

  const { setMenuPosition, setSidebarCollapsed } = useLayout();
  useEffect(() => {
    setMenuPosition('left');
    setSidebarCollapsed(false);
  }, [setMenuPosition, setSidebarCollapsed]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const [res, adminsRes, agenciesRes] = await Promise.all([
        adminService.getHosts(),
        adminService.getAdmins(),
        adminService.getAgencies()
      ]);
      if (res.data.statusCode === 1) {
        setApps(res.data.data || []);
      }
      const adminList = adminsRes.data.data || [];
      setSuperAdmins(adminList.filter((a: any) => a.role === 'super_admin'));
      setAgenciesList(agenciesRes.data.data || []);
    } catch {
      toast.error('Registry synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  // Live filter
  useEffect(() => {
    let result = apps;
    if (activeTab !== 'all') {
      result = result.filter(a => a.status?.toLowerCase() === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.hostName?.toLowerCase().includes(q) ||
        a.whatsapp?.includes(q) ||
        a.gmail?.toLowerCase().includes(q) ||
        a.agencyCode?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    if (selectedSuperAdmin !== 'all') {
      const ownedAgencyCodes = agenciesList
        .filter(agency => agency.owner?.email === selectedSuperAdmin)
        .map(agency => agency.code?.toLowerCase());
      
      result = result.filter(a => ownedAgencyCodes.includes(a.agencyCode?.toLowerCase()));
    }
    setFiltered(result);
  }, [search, activeTab, selectedSuperAdmin, apps, agenciesList]);

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const canApprove = currentUser?.role === 'super_admin';

  const totalCount    = apps.length;
  const pendingCount  = apps.filter(a => a.status?.toLowerCase() === 'pending').length;
  const approvedCount = apps.filter(a => a.status?.toLowerCase() === 'approved').length;
  const rejectedCount = apps.filter(a => a.status?.toLowerCase() === 'rejected').length;

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', fb?: string) => {
    try {
      setProcessing(true);
      const res = await adminService.approveHost({ application_id: id, status, feedback: fb });
      if (res.data.statusCode === 1) {
        toast.success(status === 'APPROVED' ? '✅ Host Approved' : '❌ Host Rejected');
        setShowRejectModal(false);
        setFeedback('');
        setRejectApp(null);
        setSelectedApp(null);
        fetchApps();
      } else {
        toast.error(res.data.message || 'Operation failed');
      }
    } catch {
      toast.error('Authorization failed');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (app: any) => {
    setRejectApp(app);
    setFeedback('');
    setShowRejectModal(true);
  };

  const handleDeleteHost = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely remove this host application?")) return;
    try {
      await adminService.deleteHostRequest(id);
      toast.success('Host application removed successfully.');
      setSelectedApp(null);
      fetchApps();
    } catch (err: any) {
      toast.error('Failed to remove host application.');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await adminService.inviteHost({ email: inviteEmail.trim().toLowerCase() });
      toast.success(`Invitation successfully dispatched to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send invitation link.');
    } finally {
      setInviting(false);
    }
  };

  const tabs = [
    { key: 'all',      label: 'All',      count: totalCount,    color: '#3b82f6' },
    { key: 'pending',  label: 'Pending',  count: pendingCount,  color: '#f59e0b' },
    { key: 'approved', label: 'Approved', count: approvedCount, color: '#10b981' },
    { key: 'rejected', label: 'Rejected', count: rejectedCount, color: '#ef4444' },
  ] as const;

  const statusColor = (s: string) => {
    const sl = s?.toLowerCase();
    if (sl === 'pending')  return { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.25)'  };
    if (sl === 'approved') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' };
    return                         { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444',  border: 'rgba(239,68,68,0.25)'  };
  };

  return (
    <div className="user-management fade-in">
      <style>{`
        .hr-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        @media(max-width:800px){ .hr-stat-grid { grid-template-columns: repeat(2,1fr); } }
        .hr-stat-card {
          background: var(--bg-surface)!important;
          border: 1px solid var(--glass-border)!important;
          border-radius: 16px;
          padding: 20px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: var(--card-shadow)!important;
          transition: all 0.3s ease;
          cursor: default;
        }
        .hr-stat-card:hover { transform: translateY(-3px); border-color: var(--accent-primary)!important; box-shadow: var(--card-shadow-hover)!important; }
        .hr-icon-box { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .hr-num  { font-size:1.7rem; font-weight:900; color:var(--text-primary)!important; line-height:1; }
        .hr-lbl  { font-size:0.68rem; font-weight:800; color:var(--text-secondary)!important; text-transform:uppercase; letter-spacing:0.08em; margin-top:3px; }

        .hr-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
        .hr-search {
          flex:1; min-width:220px;
          display:flex; align-items:center; gap:10px;
          background: var(--input-bg)!important;
          border: 1px solid var(--glass-border)!important;
          border-radius: 12px; padding: 0 16px; height: 42px;
        }
        .hr-search input { background:transparent; border:none; outline:none; color:var(--text-primary)!important; font-size:0.85rem; font-weight:600; width:100%; }
        .hr-search input::placeholder { color:var(--text-secondary)!important; }

        .hr-tabs { display:flex; gap:8px; flex-wrap:wrap; }
        .hr-tab {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.8rem; font-weight: 800;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          display: flex; align-items:center; gap:7px;
          background: var(--input-bg)!important;
          color: var(--text-secondary)!important;
          border-color: var(--glass-border)!important;
        }
        .hr-tab.active-tab {
          background: var(--accent-primary)!important;
          color: #fff!important;
          border-color: var(--accent-primary)!important;
        }
        .hr-tab-count {
          background: rgba(255,255,255,0.2); border-radius:6px;
          padding:1px 7px; font-size:0.72rem; font-weight:900;
        }

        .premium-table { width:100%!important; border-collapse:separate!important; border-spacing:0 10px!important; }
        .premium-table th { padding:14px 20px!important; font-size:0.72rem!important; font-weight:800!important; text-transform:uppercase!important; letter-spacing:0.1em!important; color:var(--text-secondary)!important; border:none!important; }
        .premium-table td { padding:14px 20px!important; background:var(--bg-surface)!important; border-top:1px solid var(--glass-border)!important; border-bottom:1px solid var(--glass-border)!important; color:var(--text-primary)!important; vertical-align:middle!important; height:70px!important; }
        .premium-table td:first-child { border-left:1px solid var(--glass-border)!important; border-radius:14px 0 0 14px!important; }
        .premium-table td:last-child  { border-right:1px solid var(--glass-border)!important; border-radius:0 14px 14px 0!important; }
        .premium-table tbody tr { box-shadow:var(--card-shadow)!important; transition:all 0.25s!important; }
        .premium-table tbody tr:hover { transform:translateY(-2px)!important; box-shadow:var(--card-shadow-hover)!important; }
        .premium-table tbody tr:hover td { border-color:var(--accent-primary)!important; }

        .identity-block  { display:flex; align-items:center; gap:12px; }
        .avatar-glass    { width:44px; height:44px; border-radius:12px; overflow:hidden; background:var(--input-bg)!important; flex-shrink:0; }
        .host-modal-overlay {
          position:fixed; inset:0;
          background:rgba(15,23,42,0.75);
          backdrop-filter:blur(12px);
          display:flex; align-items:center; justify-content:center;
          z-index:2000; animation:fadeIn 0.2s ease;
        }
        .host-modal-box {
          background:var(--bg-surface)!important;
          border-radius:24px; width:90%; max-width:520px;
          padding:32px; box-shadow:var(--card-shadow)!important;
          border:1px solid var(--glass-border)!important;
          animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
          max-height:90vh; overflow-y:auto;
        }
        .details-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:20px 0; }
        .detail-item  { background:var(--input-bg)!important; border:1px solid var(--glass-border)!important; padding:12px; border-radius:12px; }
        .detail-label { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-secondary)!important; font-weight:800; margin-bottom:4px; }
        .detail-value { font-size:0.88rem; color:var(--text-primary)!important; font-weight:700; word-break:break-word; }

        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="header-actions" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Host Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>
            Authorization gateway for new talent onboarding
          </p>
        </div>
        <button
          className="secondary flex items-center gap-2"
          onClick={fetchApps}
          style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 700 }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="hr-stat-grid">
        <div className="hr-stat-card">
          <div className="hr-icon-box" style={{ background:'rgba(59,130,246,0.1)', color:'#3b82f6' }}><Users size={20}/></div>
          <div><div className="hr-num">{totalCount}</div><div className="hr-lbl">Total Applications</div></div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-icon-box" style={{ background:'rgba(245,158,11,0.1)', color:'#f59e0b' }}><Clock size={20}/></div>
          <div><div className="hr-num">{pendingCount}</div><div className="hr-lbl">Awaiting Review</div></div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-icon-box" style={{ background:'rgba(16,185,129,0.1)', color:'#10b981' }}><UserCheck size={20}/></div>
          <div><div className="hr-num">{approvedCount}</div><div className="hr-lbl">Active Hosts</div></div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-icon-box" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}><XCircle size={20}/></div>
          <div><div className="hr-num">{rejectedCount}</div><div className="hr-lbl">Rejected</div></div>
        </div>
      </div>

      {/* ── Email Invite Section ────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderRadius: '16px', padding: '24px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#ede9fe', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
            <Mail size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Dispatch Host Application Link</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Send an official secure email directly to a potential broadcasting host.
            </p>
          </div>
        </div>
        <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
          <input
            type="email"
            required
            placeholder="Enter host's email address..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1',
              fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = '#ffffff'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            style={{
              padding: '0 24px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.95rem', cursor: inviting || !inviteEmail.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: inviting || !inviteEmail.trim() ? 0.7 : 1,
              transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
            }}
          >
            {inviting ? <RefreshCw size={18} className="spin" /> : <Send size={18} />}
            {inviting ? 'Dispatching...' : 'Send Link'}
          </button>
        </form>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="hr-toolbar">
        <div className="hr-search">
          <Search size={15} style={{ color:'var(--text-secondary)', flexShrink:0 }}/>
          <input
            placeholder="Search by name, phone, email, agency code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={selectedSuperAdmin}
          onChange={e => setSelectedSuperAdmin(e.target.value)}
          style={{ height: '42px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-primary)', fontWeight: '700', padding: '0 14px', outline: 'none' }}
        >
          <option value="all">All Super Admins</option>
          {superAdmins.map(sa => (
            <option key={sa.id} value={sa.email}>{sa.name || sa.email}</option>
          ))}
        </select>
        <div className="hr-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`hr-tab${activeTab === tab.key ? ' active-tab' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="hr-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="glass" style={{ borderRadius: 24, border: '1px solid var(--glass-border)', padding: '8px' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ textAlign:'left',   width:'26%' }}>Applicant</th>
              <th style={{ textAlign:'left',   width:'22%' }}>Contact</th>
              <th style={{ textAlign:'center', width:'12%' }}>Agency Code</th>
              <th style={{ textAlign:'center', width:'12%' }}>Category</th>
              <th style={{ textAlign:'center', width:'10%' }}>Applied</th>
              <th style={{ textAlign:'center', width:'10%' }}>Status</th>
              <th style={{ textAlign:'right',  width:'8%'  }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding: 40 }}>
                <div style={{ color:'var(--text-secondary)', fontWeight:600 }}>Loading registry...</div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding: 40 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <UserCheck size={36} style={{ color:'var(--text-secondary)', opacity:0.3 }}/>
                  <span style={{ color:'var(--text-secondary)', fontWeight:600 }}>
                    {search || activeTab !== 'all' ? 'No results match your filter' : 'No host applications yet'}
                  </span>
                </div>
              </td></tr>
            ) : (
              filtered.map(app => {
                const sc = statusColor(app.status);
                return (
                  <tr key={app.id}>
                    {/* Applicant */}
                    <td>
                      <div className="identity-block">
                        <div className="avatar-glass" style={{ border:'2px solid var(--glass-border)' }}>
                          <MediaImage
                            src={app.realPhoto}
                            className="h-full w-full object-cover"
                            fallbackText={app.hostName?.[0] || 'H'}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'0.92rem' }}>{app.hostName}</div>
                          <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:600, marginTop:2 }}>
                            ID: {app.hostIdNumber || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', fontWeight:700 }}>
                          <Phone size={11} style={{ color:'#10b981', flexShrink:0 }}/> {app.whatsapp || '—'}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:600, wordBreak:'break-all' }}>
                          <Mail size={11} style={{ color:'#3b82f6', flexShrink:0 }}/> {app.gmail || '—'}
                        </div>
                      </div>
                    </td>
                    {/* Agency Code */}
                    <td style={{ textAlign:'center' }}>
                      <span style={{ fontFamily:'monospace', fontSize:'0.8rem', fontWeight:800, color:'#60a5fa', background:'rgba(59,130,246,0.1)', padding:'4px 10px', borderRadius:8, border:'1px solid rgba(59,130,246,0.2)' }}>
                        {app.agencyCode || '—'}
                      </span>
                    </td>
                    {/* Category */}
                    <td style={{ textAlign:'center' }}>
                      <span style={{ fontSize:'0.78rem', fontWeight:800, color:'#a78bfa', background:'rgba(139,92,246,0.1)', padding:'4px 10px', borderRadius:8, border:'1px solid rgba(139,92,246,0.2)' }}>
                        {(app.category || 'General').toUpperCase()}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ textAlign:'center', fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    {/* Status */}
                    <td style={{ textAlign:'center' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        fontSize:'0.68rem', fontWeight:800,
                        padding:'5px 10px', borderRadius:8,
                        textTransform:'uppercase', letterSpacing:'0.05em',
                        background: sc.bg, color: sc.color,
                        border: `1px solid ${sc.border}`
                      }}>
                        {app.status?.toLowerCase() === 'pending'  && <AlertCircle size={11}/>}
                        {app.status?.toLowerCase() === 'approved' && <CheckCircle size={11}/>}
                        {app.status?.toLowerCase() === 'rejected' && <XCircle     size={11}/>}
                        {app.status?.toUpperCase()}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ textAlign:'right' }}>
                      <div className="ops-cluster" style={{ justifyContent:'flex-end', gap:6 }}>
                        {app.status?.toLowerCase() === 'pending' && canApprove ? (
                          <>
                            <button
                              className="op-btn edit"
                              onClick={() => handleAction(app.id, 'APPROVED')}
                              title="Approve"
                              style={{ borderRadius:10, background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)' }}
                            ><CheckCircle size={16}/></button>
                            <button
                              className="op-btn delete"
                              onClick={() => openRejectModal(app)}
                              title="Reject"
                              style={{ borderRadius:10, background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}
                            ><XCircle size={16}/></button>
                          </>
                        ) : (
                          <button
                            className="op-btn"
                            disabled
                            style={{ borderRadius:10, opacity:0.3, cursor:'not-allowed' }}
                            title="Already processed"
                          ><ShieldCheck size={16}/></button>
                        )}
                        <button
                          className="op-btn edit"
                          onClick={() => setSelectedApp(app)}
                          title="View Full Details"
                          style={{ borderRadius:10, background:'rgba(59,130,246,0.1)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.2)' }}
                        ><Eye size={16}/></button>
                        {canApprove && (
                          <button
                            className="op-btn delete"
                            onClick={() => handleDeleteHost(app.id)}
                            title="Remove Application"
                            style={{ borderRadius: 10, background: 'transparent', color: '#ef4444', border: '1px dashed #ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {selectedApp && (
        <div className="host-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="host-modal-box" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ background:'rgba(59,130,246,0.1)', color:'var(--accent-primary)', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <UserCheck size={20}/>
                </div>
                <div>
                  <h3 style={{ fontSize:'1.15rem', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Application Details</h3>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', fontWeight:600 }}>Host Verification Desk</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background:'var(--input-bg)', border:'1px solid var(--glass-border)', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-primary)', fontWeight:900, fontSize:'1rem' }}
              >✕</button>
            </div>

            {/* Photo + Name */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:100, height:100, borderRadius:20, overflow:'hidden', border:'3px solid var(--glass-border)', background:'var(--input-bg)' }}>
                <MediaImage src={selectedApp.realPhoto} className="h-full w-full object-cover" fallbackText={selectedApp.hostName?.[0] || 'H'} />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.2rem', fontWeight:900, color:'var(--text-primary)' }}>{selectedApp.hostName}</div>
                <div style={{ fontSize:'0.78rem', color:'#60a5fa', fontWeight:800, marginTop:4, letterSpacing:'0.5px' }}>
                  AGENCY: {selectedApp.agencyCode}
                </div>
                {(() => {
                  const sc = statusColor(selectedApp.status);
                  return (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.7rem', fontWeight:800, padding:'5px 12px', borderRadius:8, textTransform:'uppercase', marginTop:8, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                      {selectedApp.status?.toLowerCase() === 'pending'  && <AlertCircle size={11}/>}
                      {selectedApp.status?.toLowerCase() === 'approved' && <CheckCircle size={11}/>}
                      {selectedApp.status?.toLowerCase() === 'rejected' && <XCircle size={11}/>}
                      {selectedApp.status?.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Detail Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">WhatsApp</div>
                <div className="detail-value">{selectedApp.whatsapp || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email / Gmail</div>
                <div className="detail-value">{selectedApp.gmail || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">National ID</div>
                <div className="detail-value">{selectedApp.hostIdNumber || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">{selectedApp.birthday ? new Date(selectedApp.birthday).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Category</div>
                <div className="detail-value">{(selectedApp.category || 'general').toUpperCase()}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Applied On</div>
                <div className="detail-value">{new Date(selectedApp.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button
                className="secondary-btn"
                onClick={() => setSelectedApp(null)}
              >
                Cancel
              </button>
              {selectedApp.status?.toLowerCase() === 'pending' && canApprove && (
                <>
                  <button
                    className="primary-btn"
                    onClick={() => openRejectModal(selectedApp)}
                    style={{ background: '#ef4444' }}
                  >
                    <XCircle size={18} />
                    <span>Reject</span>
                  </button>
                  <button
                    className="primary-btn"
                    onClick={() => handleAction(selectedApp.id, 'APPROVED')}
                    style={{ background: '#10b981' }}
                  >
                    <CheckCircle size={18} />
                    <span>Approve</span>
                  </button>
                </>
              )}
              {canApprove && (
                <button
                  className="secondary-btn"
                  onClick={() => handleDeleteHost(selectedApp.id)}
                  style={{ color: '#ef4444', borderColor: '#ef4444', background: 'transparent' }}
                >
                  <Trash2 size={18} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal ─────────────────────────────────────────────────── */}
      {showRejectModal && rejectApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '440px', borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }} className="zoom-in">
            <div style={{ background: '#fef2f2', padding: '24px', textAlign: 'center', borderBottom: '1px solid #fee2e2' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <AlertCircle size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#991b1b' }}>Reject Host</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#b91c1c' }}>
                You are about to reject the application for <strong>{rejectApp.hostName}</strong>.
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Reason for Rejection <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="e.g. Identity documents are unclear..."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0',
                  fontSize: '0.95rem', minHeight: '120px', resize: 'vertical', outline: 'none',
                  transition: 'border-color 0.2s', background: '#f8fafc', color: '#0f172a', fontFamily: 'inherit'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#ef4444'}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction(rejectApp.id, 'REJECTED', feedback)}
                  disabled={!feedback.trim() || processing}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: 700, cursor: !feedback.trim() || processing ? 'not-allowed' : 'pointer', opacity: !feedback.trim() || processing ? 0.6 : 1, transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  onMouseOver={e => { if(!(!feedback.trim() || processing)) e.currentTarget.style.background = '#dc2626'; }}
                  onMouseOut={e => { if(!(!feedback.trim() || processing)) e.currentTarget.style.background = '#ef4444'; }}
                >
                  {processing ? <RefreshCw size={18} className="spin" /> : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostRegistry;
