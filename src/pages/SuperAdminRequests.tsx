import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { 
  ShieldCheck, Mail, Send, Eye, CheckCircle, XCircle, 
  AlertCircle, Search, HelpCircle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const SuperAdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const handleProcessRequest = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      await adminService.processSuperAdminRequest({
        id,
        status,
        feedback: status === 'rejected' ? feedback : undefined
      });
      
      toast.success(`Application request was successfully ${status}.`);
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
    <div className="user-management fade-in tasks-page">
      
      {/* Header */}
      <div className="header-actions">
        <div>
          <h2 className="page-title">Super Admin Onboarding</h2>
          <p className="subtitle">Verify credentials, review identities, and manage invite protocols</p>
        </div>
      </div>

      {/* Invite Super Admin Bar */}
      <div className="table-header-row mb-6" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'block' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={16} color="#6366f1" /> Dispatch Application Link
        </h3>
        <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
          <div className="search-bar compact" style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', height: '45px' }}>
            <Mail size={16} />
            <input 
              type="email"
              placeholder="Enter prospective super admin email..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
            />
          </div>
          <button type="submit" className="primary" disabled={inviting} style={{ height: '45px', padding: '0 24px' }}>
            {inviting ? 'Sending...' : 'Invite'}
          </button>
        </form>
      </div>

      {/* Controls */}
      <div className="table-header-row mb-6">
        <div className="search-bar compact" style={{ maxWidth: '400px', width: '100%' }}>
          <Search size={18} />
          <input 
            placeholder="Search applicants by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Requests Catalog */}
      {loading ? (
        <div className="flex-center py-20" style={{ color: '#475569', fontWeight: 700 }}>
          Retrieving pending and processed credentials...
        </div>
      ) : (
        <div className="bento-grid">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bento-card-premium" style={{ height: 'auto', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
              <div className="card-payload" style={{ flex: 1 }}>
                
                <div className="card-top-identity">
                  <span className={`status-pill ${req.status === 'approved' ? 'active' : ''}`} style={{
                    background: req.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b',
                    border: '1px solid currentColor'
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                  
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="mission-title-highdef" style={{ margin: '15px 0 5px 0' }}>
                  {req.fullName}
                </h4>
                
                <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  <div>Email: <strong style={{ color: '#e2e8f0' }}>{req.email}</strong></div>
                  <div>Phone: <strong style={{ color: '#e2e8f0' }}>{req.phone}</strong></div>
                  <div>Birthday: <strong style={{ color: '#e2e8f0' }}>{req.birthday}</strong></div>
                  <div>Loc: <strong style={{ color: '#e2e8f0' }}>{req.state}, {req.country}</strong></div>
                  {req.feedback && (
                    <div style={{ color: '#ef4444', marginTop: '10px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderLeft: '3px solid #ef4444' }}>
                      Reason: {req.feedback}
                    </div>
                  )}
                </div>

                {/* Documents / Files */}
                <div className="border-t pt-4 mt-auto">
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Uploaded Assets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <button className="op-btn" onClick={() => setShowDocModal({ title: 'Original Photo', url: getMediaUrl(req.originalPhoto) })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px' }}>
                      <Eye size={12} /> Photo
                    </button>
                    <button className="op-btn" onClick={() => setShowDocModal({ title: 'Government ID', url: getMediaUrl(req.governmentDocument) })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px' }}>
                      <Eye size={12} /> Gov ID
                    </button>
                    <button className="op-btn" onClick={() => setShowDocModal({ title: 'Aadhar / PAN Card', url: getMediaUrl(req.aadharPanCard) })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px' }}>
                      <Eye size={12} /> Aadhar/PAN
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Toolbar */}
              {req.status === 'pending' && (
                <div className="card-action-bar-glass" style={{ padding: '12px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    className="secondary" 
                    onClick={() => openRejectModal(req)}
                    style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}
                  >
                    Reject
                  </button>
                  <button 
                    className="primary" 
                    onClick={() => handleProcessRequest(req.id, 'approved')}
                    style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981' }}
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className="bento-card wide empty-state col-span-full">
              <div className="empty-content">
                <ShieldCheck size={64} className="empty-icon-ghost" />
                <p className="empty-text">No super admin onboarding requests match your filter query.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '0px', border: '1px solid #ef4444', padding: '30px', maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Reject Super Admin Request
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Provide feedback or rejection reason for applicant <strong>{selectedReq?.fullName}</strong>.
            </p>

            <div className="form-group mb-6">
              <textarea 
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe reason for rejecting this credentials..."
                required
                style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700, resize: 'none' }}
              />
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button 
                className="primary-btn" 
                onClick={() => handleProcessRequest(selectedReq.id, 'rejected')} 
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                disabled={processing || !feedback.trim()}
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '0px', padding: '20px', maxWidth: '800px', width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{showDocModal.title}</h3>
              <button onClick={() => setShowDocModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ textAlign: 'center', background: '#090d16', padding: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
              {showDocModal.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={showDocModal.url} style={{ width: '100%', height: '500px', border: 'none' }} title="Document Viewer" />
              ) : (
                <img src={showDocModal.url} alt={showDocModal.title} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminRequests;
