import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css';

const ApplySuperAdmin: React.FC = () => {
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
        setFullName('');
        setEmail('');
        setPhone('');
        setIdNumber('');
        setCountry('');
        setState('');
        setBirthday('');
        setPassword('');
        setConfirmPassword('');
        setOriginalPhoto(null);
        setGovernmentDoc(null);
        setAadharPan(null);
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
    <div className="auth-page" style={{ overflowY: 'auto', padding: '40px 20px' }}>
      <div className="auth-card" style={{ maxWidth: '650px', width: '100%' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px auto' }}>
            <ShieldCheck size={48} color="#6366f1" />
          </div>
          <h1 className="auth-title">Super Admin Application</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>
            Complete your onboarding to request super administrative rights.
          </p>
        </div>

        {message && (
          <div style={{
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.content}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="input-container" style={{ gridColumn: 'span 2' }}>
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
            <label className="input-label">Full Name</label>
          </div>

          <div className="input-container">
            <input 
              type="email" 
              className="auth-input" 
              placeholder=" " 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <label className="input-label">Email Address</label>
          </div>

          <div className="input-container">
            <input 
              type="tel" 
              className="auth-input" 
              placeholder=" " 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
            <label className="input-label">Phone Number</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required 
            />
            <label className="input-label">Government ID / Passport Number</label>
          </div>

          <div className="input-container">
            <input 
              type="date" 
              className="auth-input" 
              placeholder=" " 
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required 
            />
            <label className="input-label" style={{ top: '-10px', fontSize: '0.8rem' }}>Birthday</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required 
            />
            <label className="input-label">Country</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={state}
              onChange={(e) => setState(e.target.value)}
              required 
            />
            <label className="input-label">State / Region</label>
          </div>

          <div className="input-container">
            <input 
              type="password" 
              className="auth-input" 
              placeholder=" " 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <label className="input-label">Create Password</label>
          </div>

          <div className="input-container">
            <input 
              type="password" 
              className="auth-input" 
              placeholder=" " 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            <label className="input-label">Confirm Password</label>
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', tracking: '1px', fontWeight: 'bold' }}>Required Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {originalPhoto ? originalPhoto.name : 'Original Photo'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setOriginalPhoto(e.target.files[0])} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {governmentDoc ? governmentDoc.name : 'Gov ID Document'}
                </span>
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files && setGovernmentDoc(e.target.files[0])} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {aadharPan ? aadharPan.name : 'Aadhar / PAN Card'}
                </span>
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files && setAadharPan(e.target.files[0])} />
              </label>

            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ gridColumn: 'span 2', marginTop: '20px' }}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplySuperAdmin;
