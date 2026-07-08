import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplySuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Files
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
  const [governmentDoc, setGovernmentDoc] = useState<File | null>(null);
  const [aadharPan, setAadharPan] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', content: 'Passwords do not match.' });
      return;
    }

    if (!originalPhoto || !governmentDoc || !aadharPan) {
      setMessage({ type: 'error', content: 'Please upload all required documents.' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email.toLowerCase().trim());
    formData.append('phone', phone);
    formData.append('idNumber', idNumber);
    formData.append('country', country);
    formData.append('state', state);
    formData.append('birthday', birthday);
    formData.append('password', password);
    formData.append('originalPhoto', originalPhoto);
    formData.append('governmentDocument', governmentDoc);
    formData.append('aadharPanCard', aadharPan);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/apply-super-admin`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.statusCode === 1) {
        setMessage({
          type: 'success',
          content: 'Application submitted successfully! It will be reviewed by the system administrator.'
        });
        // Clear fields
        setFullName(''); setEmail(''); setPhone(''); setIdNumber('');
        setCountry(''); setState(''); setBirthday(''); setPassword('');
        setConfirmPassword(''); setOriginalPhoto(null); setGovernmentDoc(null); setAadharPan(null);
      } else {
        setMessage({ type: 'error', content: res.data.message || 'Submission failed' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Server error occurred during submission.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%', maxWidth: '850px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Super Admin Application</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: 500 }}>
          Complete your onboarding to request super administrative rights.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '850px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}></div>

        <div style={{ padding: '24px' }} className="form-content-wrap">
          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="responsive-form-grid">
            
            {/* Profile Photo */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
              <label 
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  width: '120px', height: '120px', borderRadius: '50%', border: '3px dashed #cbd5e1', 
                  cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eff6ff'; }} 
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                {originalPhoto ? (
                  <img src={URL.createObjectURL(originalPhoto)} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={30} color="#64748b" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textAlign: 'center', lineHeight: '1.2' }}>
                      Profile<br/>Photo
                    </span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setOriginalPhoto(e.target.files[0])} />
              </label>
            </div>

            {/* Section 1: Personal Details */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="#6366f1" /> Personal Identity</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">National ID Number</label>
              <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">State / Region</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} required className="input-field-premium" />
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Birthday</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Section 2: Security */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Configuration</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Section 3: Document Uploads */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Verification Documents</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Government Issued ID Front</label>
              <label className="upload-box-premium">
                {governmentDoc ? (
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>✓ ID Selected ({governmentDoc.name.substring(0, 18)}...)</span>
                ) : (
                  <>
                    <Upload size={22} color="#64748b" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>Upload Document Front</span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setGovernmentDoc(e.target.files[0])} />
              </label>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">PAN Card / Aadhar Back</label>
              <label className="upload-box-premium">
                {aadharPan ? (
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>✓ Doc Selected ({aadharPan.name.substring(0, 18)}...)</span>
                ) : (
                  <>
                    <Upload size={22} color="#64748b" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>Upload Aadhar/PAN Back</span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setAadharPan(e.target.files[0])} />
              </label>
            </div>

            {/* Actions */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }} className="action-buttons-wrap">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                style={{ flex: 1, padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <><div className="spinner" /> Processing...</>
                ) : (
                  <><ShieldCheck size={20} /> Submit Application</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        .responsive-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .input-field-premium {
          width: 100%; padding: 12px 14px; borderRadius: 10px; border: 1.5px solid #cbd5e1;
          background: #f8fafc; fontSize: 0.95rem; color: #0f172a; transition: all 0.2s; outline: none;
        }
        .input-field-premium:focus {
          border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }
        .input-label-premium {
          display: block; fontSize: 0.78rem; fontWeight: 800; color: #475569; marginBottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .upload-box-premium {
          display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px;
          border: 2.5px dashed #cbd5e1; borderRadius: 12px; cursor: pointer; background: #f8fafc; transition: all 0.2s;
        }
        .upload-box-premium:hover {
          border-color: #6366f1; background: #eff6ff;
        }
        .spinner {
          width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite;
        }
        @media (max-width: 600px) {
          .responsive-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-item-half {
            grid-column: 1 / -1;
          }
          .action-buttons-wrap {
            flex-direction: column-reverse;
          }
          .form-content-wrap {
            padding: 16px !important;
          }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ApplySuperAdmin;
