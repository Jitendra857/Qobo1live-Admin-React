import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { Building2, AlertCircle, CheckCircle2, X, Upload, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const RegisterAgency: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitedByParam = searchParams.get('invitedBy') || '';

  const [invitedBy, setInvitedBy] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Document files (Front & Back)
  const [docPhotoFront, setDocPhotoFront] = useState<File | null>(null);
  const [docPhotoBack, setDocPhotoBack] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  
  // Status View state
  const [statusView, setStatusView] = useState<any>(null);
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (invitedByParam) {
      setInvitedBy(invitedByParam);
    }
  }, [invitedByParam]);

  const triggerScrollAndFocus = (id: string, errorMessage: string) => {
    setMessage({ type: 'error', content: errorMessage });
    const target = document.getElementById(id);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCheckStatus = async (queryVal?: string) => {
    const q = (queryVal || statusSearchQuery || email || phone || invitedBy).trim();
    if (!q) {
      toast.error("Please enter your Email, Phone, or Super Admin Code to check status.");
      return;
    }
    setCheckingStatus(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/agency/agency-verify-status?query=${encodeURIComponent(q)}`);
      if (res.data.statusCode === 1 && res.data.data) {
        setStatusView(res.data.data);
        toast.success("Agency status retrieved!");
      } else {
        toast.error(res.data.message || "No application found for this query.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch application status.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validations: Super Admin Code + 2 Documents + Contact identifier
    if (!invitedBy.trim()) {
      return triggerScrollAndFocus('invitedBy', 'Please enter the Super Admin Code.');
    }
    if (!email.trim() && !phone.trim()) {
      return triggerScrollAndFocus('email', 'Please enter your Email Address or Phone Number.');
    }
    if (!docPhotoFront) {
      return triggerScrollAndFocus('docFrontLabel', 'Please upload Document Front side.');
    }
    if (!docPhotoBack) {
      return triggerScrollAndFocus('docBackLabel', 'Please upload Document Back side.');
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('invitedBy', invitedBy.trim());
    formData.append('email', email.toLowerCase().trim());
    formData.append('phone', phone.trim());
    formData.append('agency_name', `Agency (${invitedBy.trim()})`);
    formData.append('owner_name', email ? email.split('@')[0] : 'Agency Owner');
    
    formData.append('doc_photo_front', docPhotoFront);
    formData.append('doc_photo_back', docPhotoBack);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/agency/register-public`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.statusCode === 1) {
        const payload = res.data.data;
        setStatusView({
          status: payload?.status || 'pending',
          invitedBy: invitedBy,
          email: email,
          phone: phone,
          code: payload?.code || '',
          createdAt: new Date().toISOString(),
          feedback: payload?.feedback
        });
        toast.success("Agency request submitted successfully!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', content: res.data.message || 'Submission failed' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Server error occurred during submission.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (statusView) {
    const isApproved = statusView.status === 'approved' || statusView.status === 'active';
    const isRejected = statusView.status === 'rejected';
    const statusColor = isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#0369a1';
    const statusBg = isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#e0f2fe';

    return (
      <div className="public-onboarding-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%', maxWidth: '700px' }}>
          <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Agency Application Status</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: 500 }}>
            Track your recruitment agency onboarding application.
          </p>
        </div>

        <div style={{ background: '#ffffff', width: '100%', maxWidth: '650px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '36px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            
            <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: statusBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              {isApproved ? <CheckCircle2 size={40} color={statusColor} /> : isRejected ? <AlertCircle size={40} color={statusColor} /> : <Building2 size={40} color={statusColor} />}
            </div>

            <span style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', background: statusBg, color: statusColor, marginBottom: '24px' }}>
              STATUS: {statusView.status || 'PENDING'}
            </span>

            <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', width: '100%', textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {statusView.invitedBy && <div style={{ fontSize: '0.95rem', color: '#334155' }}><strong>Super Admin Code:</strong> {statusView.invitedBy}</div>}
              {statusView.code && <div style={{ fontSize: '0.95rem', color: '#334155' }}><strong>Agency Code:</strong> {statusView.code}</div>}
              {statusView.email && <div style={{ fontSize: '0.95rem', color: '#334155' }}><strong>Applicant Email:</strong> {statusView.email}</div>}
              {statusView.phone && <div style={{ fontSize: '0.95rem', color: '#334155' }}><strong>Phone Number:</strong> {statusView.phone}</div>}
              {statusView.createdAt && <div style={{ fontSize: '0.95rem', color: '#334155' }}><strong>Submitted Date:</strong> {new Date(statusView.createdAt).toLocaleDateString()}</div>}
              {statusView.feedback && (
                <div style={{ marginTop: '8px', padding: '14px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '8px', fontSize: '0.9rem', color: '#991b1b' }}>
                  <strong>Admin Feedback:</strong> {statusView.feedback}
                </div>
              )}
            </div>

            <button 
              onClick={() => { setStatusView(null); setDocPhotoFront(null); setDocPhotoBack(null); }} 
              style={{ padding: '14px 28px', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontWeight: 800, color: '#334155', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              Back to Agency Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-onboarding-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%', maxWidth: '650px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Agency Request</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: 500 }}>
          Submit your verification documents under Super Admin Code.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '650px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}></div>

        <div style={{ padding: '28px' }} className="form-content-wrap">
          
          {/* Status Search Quick Bar */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Check Status by Email / Phone / Super Admin Code..." 
              value={statusSearchQuery}
              onChange={(e) => setStatusSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.9rem', color: '#0f172a' }}
            />
            <button 
              type="button"
              onClick={() => handleCheckStatus()}
              disabled={checkingStatus}
              style={{ padding: '6px 14px', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: checkingStatus ? 'not-allowed' : 'pointer' }}
            >
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </button>
          </div>

          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
            
            {/* Field 1: Super Admin Code */}
            <div>
              <label className="input-label-premium">Super Admin Code</label>
              <input 
                type="text" 
                id="invitedBy" 
                value={invitedBy} 
                onChange={(e) => setInvitedBy(e.target.value)}
                placeholder="Enter Super Admin Referral Code"
                disabled={!!invitedByParam} 
                required
                className="input-field-premium" 
                style={invitedByParam ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', fontWeight: 'bold' } : {}}
              />
            </div>

            {/* Contact Email / Phone for identification & checking status */}
            <div>
              <label className="input-label-premium">Email Address or Phone Number</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Required for checking application status"
                required 
                className="input-field-premium" 
              />
            </div>

            {/* Field 2: Upload Document (Front / Back) 2 */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <label className="input-label-premium" style={{ marginBottom: '12px' }}>Upload Document (Front / Back)</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label id="docFrontLabel" className="upload-box-premium">
                    {docPhotoFront ? (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', textAlign: 'center', padding: '0 8px' }}>✓ Front Loaded ({docPhotoFront.name.substring(0, 14)}...)</span>
                    ) : (
                      <>
                        <Upload size={24} color="#64748b" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>Document Front</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoFront(e.target.files[0])} />
                  </label>
                </div>

                <div>
                  <label id="docBackLabel" className="upload-box-premium">
                    {docPhotoBack ? (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', textAlign: 'center', padding: '0 8px' }}>✓ Back Loaded ({docPhotoBack.name.substring(0, 14)}...)</span>
                    ) : (
                      <>
                        <Upload size={24} color="#64748b" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>Document Back</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoBack(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            {/* Field 3: Submit */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button" 
                onClick={() => navigate('/')}
                style={{ flex: 1, padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <><div className="spinner" /> Processing...</>
                ) : (
                  <><Building2 size={20} /> Submit Agency Request</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        .input-field-premium {
          width: 100%; padding: 12px 14px; borderRadius: 10px; border: 1.5px solid #cbd5e1;
          background: #f8fafc; fontSize: 0.95rem; color: #0f172a; transition: all 0.2s; outline: none;
        }
        .input-field-premium:focus {
          border-color: #06b6d4; background: #fff; box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
        }
        .input-label-premium {
          display: block; fontSize: 0.78rem; fontWeight: 800; color: #475569; marginBottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .upload-box-premium {
          display: flex; flex-direction: column; align-items: center; justify-content: center; height: 110px;
          border: 2.5px dashed #cbd5e1; borderRadius: 12px; cursor: pointer; background: #f8fafc; transition: all 0.2s;
        }
        .upload-box-premium:hover {
          border-color: #06b6d4; background: #f0fdfa;
        }
        .spinner {
          width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RegisterAgency;
