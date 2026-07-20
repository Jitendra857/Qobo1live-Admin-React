import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { 
  ShieldCheck, Mail, Send, Eye, CheckCircle, XCircle, 
  Search, FileText, UserPlus, MapPin, Phone, Calendar, AlertCircle, Trash2, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const SuperAdminRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  
  // Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // User Directory State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Reject / Modal State
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState<any>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSuperAdminRequests();
      setRequests(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load Super Admin request catalog.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await adminService.getUsers(userSearchTerm);
      // Ensure we format / extract list correctly
      setUsers(res.data.data || res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load registered user list.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userSearchTerm]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await adminService.inviteSuperAdmin({ email: inviteEmail.trim().toLowerCase() });
      toast.success(`Invitation successfully dispatched to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send invitation link.');
    } finally {
      setInviting(false);
    }
  };

  const handleInviteUser = async (userEmail: string) => {
    if (!userEmail) {
      toast.error('User does not have a registered email address.');
      return;
    }
    try {
      await adminService.inviteSuperAdmin({ email: userEmail.trim().toLowerCase() });
      toast.success(`Invitation successfully sent to ${userEmail}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to dispatch invitation link.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely remove this application record?")) return;
    try {
      await adminService.deleteSuperAdminRequest(id);
      toast.success('Application removed successfully.');
      fetchRequests();
    } catch (err: any) {
      toast.error('Failed to remove application.');
    }
  };

  const handleProcessRequest = async (id: string, status: 'approved' | 'rejected' | 'email_dispatched') => {
    setProcessing(true);
    try {
      await adminService.processSuperAdminRequest({
        id,
        status,
        feedback: status === 'rejected' ? feedback : undefined
      });
      
      toast.success(`Application request was successfully updated to ${status}.`);
      setShowRejectModal(false);
      setSelectedReq(null);
      setFeedback('');
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update application request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDispatchFromCard = async (req: any) => {
    try {
      await adminService.inviteSuperAdmin({ email: req.email });
      await handleProcessRequest(req.id, 'email_dispatched');
      toast.success(`Application link securely dispatched to ${req.email}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch application link.');
    }
  };

  const openRejectModal = (req: any) => {
    setSelectedReq(req);
    setFeedback('');
    setShowRejectModal(true);
  };

  const getMediaUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const filteredRequests = requests.filter(req => 
    (req.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management fade-in" style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={36} color="#6366f1" />
            Super Admin Hub
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px' }}>
            Verify credentials, review identities, and manage invite protocols with high security.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '30px', paddingBottom: '2px' }}>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'requests' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'requests' ? '#6366f1' : '#64748b', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <FileText size={18} /> Onboarding Requests
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'users' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'users' ? '#6366f1' : '#64748b', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={18} /> User Directory (Invite List)
        </button>
      </div>

      {activeTab === 'requests' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Dynamic Dispatch Card */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={18} color="#6366f1" /> Dispatch Application Link
              </h3>
              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    placeholder="Enter prospective super admin email..." 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={inviting}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: inviting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {inviting ? 'Sending...' : <><UserPlus size={18} /> Send Invite Link</>}
                </button>
              </form>
            </div>

            {/* Filter Controls */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={18} color="#0ea5e9" /> Filter Applicants
              </h3>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Search size={18} />
                </div>
                <input 
                  placeholder="Search by name, email, or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#0ea5e9'; }}
                  onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; }}
                />
              </div>
            </div>
          </div>

          {/* Requests Catalog */}
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="#475569" /> Applicant Reviews
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>
              <div className="spinner" style={{ borderTopColor: '#6366f1', width: '24px', height: '24px', marginRight: '10px', borderRadius: '50%', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid #6366f1', animation: 'spin 1s linear infinite' }}></div>
              Retrieving pending credentials...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {filteredRequests.map((req) => (
                <div key={req.id} style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px -5px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ padding: '24px', flex: 1 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: req.status === 'approved' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: req.status === 'approved' ? '#15803d' : req.status === 'rejected' ? '#b91c1c' : '#b45309',
                      }}>
                        {req.status}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          title="Remove Record"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                      {req.fullName}
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} color="#94a3b8"/> <strong style={{ color: '#1e293b' }}>{req.email}</strong></div>
                      {req.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} color="#94a3b8"/> <strong style={{ color: '#1e293b' }}>{req.phone}</strong></div>}
                      {req.birthday && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} color="#94a3b8"/> <span>Born:</span> <strong style={{ color: '#1e293b' }}>{req.birthday}</strong></div>}
                      {(req.state || req.country) && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} color="#94a3b8"/> <span>Location:</span> <strong style={{ color: '#1e293b' }}>{req.state || ''} {req.country ? `, ${req.country}` : ''}</strong></div>}
                      
                      {req.status === 'mobile_requested' && (
                        <div style={{ marginTop: '8px', padding: '6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          Mobile Interest Request (Awaiting Full Form)
                        </div>
                      )}
                      
                      {req.feedback && (
                        <div style={{ marginTop: '12px', background: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444', fontSize: '0.85rem' }}>
                          <strong style={{ color: '#b91c1c' }}>Rejection Reason:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#7f1d1d' }}>{req.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Document Assets */}
                    {(req.originalPhoto || req.governmentDocument || req.aadharPanCard) && (
                      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Identity Assets
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {req.originalPhoto && (
                            <button 
                              onClick={() => setShowDocModal({ title: 'Original Photo', url: getMediaUrl(req.originalPhoto) })}
                              style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                              <Eye size={16} color="#6366f1" /> Photo
                            </button>
                          )}
                          {req.governmentDocument && (
                            <button 
                              onClick={() => setShowDocModal({ title: 'Government ID', url: getMediaUrl(req.governmentDocument) })}
                              style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                              <Eye size={16} color="#6366f1" /> Gov ID
                            </button>
                          )}
                          {req.aadharPanCard && (
                            <button 
                              onClick={() => setShowDocModal({ title: 'Aadhar / PAN Card', url: getMediaUrl(req.aadharPanCard) })}
                              style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                              <Eye size={16} color="#6366f1" /> KYC
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Action Toolbar */}
                  {req.status === 'mobile_requested' && (
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleDispatchFromCard(req)}
                        style={{ flex: 1, padding: '10px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
                      >
                        <Send size={16} /> Dispatch Application Link
                      </button>
                    </div>
                  )}

                  {(req.status === 'pending' || req.status === 'email_dispatched' || req.status === 'mobile_requested') && (
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => openRejectModal(req)}
                        style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button 
                        onClick={() => handleProcessRequest(req.id, 'approved')}
                        style={{ flex: 1, padding: '10px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <ShieldCheck size={40} color="#94a3b8" />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No Pending Requests</h4>
                  <p style={{ color: '#64748b', textAlign: 'center' }}>We couldn't find any super admin onboarding requests matching your filter.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* User Directory Tab content */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} color="#6366f1" /> Search Users
            </h3>
            <div style={{ position: 'relative', maxWidth: '500px' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Search size={18} />
              </div>
              <input 
                placeholder="Search registered users by name, email..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s', outline: 'none'
                }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>
          </div>

          {usersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>
              <div className="spinner" style={{ borderTopColor: '#6366f1', width: '24px', height: '24px', marginRight: '10px', borderRadius: '50%', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid #6366f1', animation: 'spin 1s linear infinite' }}></div>
              Searching user database...
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 800, fontSize: '0.85rem' }}>Name</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 800, fontSize: '0.85rem' }}>Email</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 800, fontSize: '0.85rem' }}>Role</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 800, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 700 }}>{u.name || 'Unnamed User'}</td>
                      <td style={{ padding: '16px 24px', color: '#475569' }}>{u.email || <em style={{ color: '#94a3b8' }}>No email</em>}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                          background: u.role === 'super_admin' ? '#e0f2fe' : u.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                          color: u.role === 'super_admin' ? '#0369a1' : u.role === 'admin' ? '#b91c1c' : '#475569'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleInviteUser(u.email)}
                          disabled={!u.email}
                          style={{
                            padding: '8px 14px', background: u.email ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#e2e8f0',
                            color: u.email ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
                            cursor: u.email ? 'pointer' : 'not-allowed', boxShadow: u.email ? '0 4px 10px rgba(99, 102, 241, 0.2)' : 'none',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <Send size={14} /> Send Invite
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                        No users found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle color="#ef4444" /> Reject Applicant
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Please provide a clear reason for rejecting the application from <strong style={{ color: '#0f172a' }}>{selectedReq?.fullName}</strong>. This feedback will be recorded.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <textarea 
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="E.g., Document is unreadable, Name mismatch..."
                required
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', resize: 'none', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={{ padding: '12px 20px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleProcessRequest(selectedReq.id, 'rejected')} 
                disabled={processing || !feedback.trim()}
                style={{ padding: '12px 20px', borderRadius: '10px', background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: (processing || !feedback.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: (processing || !feedback.trim()) ? 0.6 : 1 }}
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowDocModal(null)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '900px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{showDocModal.title}</h3>
              <button 
                onClick={() => setShowDocModal(null)} 
                style={{ background: '#e2e8f0', border: 'none', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', background: '#f1f5f9', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              {showDocModal.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={showDocModal.url} style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} title="Document Viewer" />
              ) : (
                <img src={showDocModal.url} alt={showDocModal.title} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminRequests;
