import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { UserCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css';

const RegisterHost: React.FC = () => {
  const [hostName, setHostName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gmail, setGmail] = useState('');
  const [category, setCategory] = useState('General');
  const [hostIdNumber, setHostIdNumber] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [agencyCode, setAgencyCode] = useState('');

  // Files
  const [realPhoto, setRealPhoto] = useState<File | null>(null);
  const [docPhotoFront, setDocPhotoFront] = useState<File | null>(null);
  const [docPhotoBack, setDocPhotoBack] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!realPhoto || !docPhotoFront || !docPhotoBack) {
      setMessage({ type: 'error', content: 'Please upload all required media/documents.' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('hostName', hostName);
    formData.append('whatsapp', whatsapp);
    formData.append('gmail', gmail.toLowerCase().trim());
    formData.append('category', category);
    formData.append('hostIdNumber', hostIdNumber);
    formData.append('country', country);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('address', address);
    formData.append('agencyCode', agencyCode.trim().toUpperCase());
    
    // Files mapping matching backend hostOnboarding file fields
    formData.append('host_real_photo', realPhoto);
    formData.append('doc_photo_front', docPhotoFront);
    formData.append('doc_photo_back', docPhotoBack);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/agency/host-onboarding`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.statusCode === 1) {
        setMessage({
          type: 'success',
          content: 'Host application submitted successfully! It will be reviewed by the agency owner.'
        });
        setHostName('');
        setWhatsapp('');
        setGmail('');
        setCategory('General');
        setHostIdNumber('');
        setCountry('');
        setState('');
        setCity('');
        setAddress('');
        setAgencyCode('');
        setRealPhoto(null);
        setDocPhotoFront(null);
        setDocPhotoBack(null);
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
          <div className="auth-logo" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '15px', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px auto' }}>
            <UserCheck size={48} color="#ec4899" />
          </div>
          <h1 className="auth-title">Host Application Form</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>
            Join an agency to unlock live streaming capabilities on Qobo1live.
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
          
          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              required 
            />
            <label className="input-label">Full Name</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={agencyCode}
              onChange={(e) => setAgencyCode(e.target.value)}
              required 
            />
            <label className="input-label">Agency Referral Code</label>
          </div>

          <div className="input-container">
            <input 
              type="email" 
              className="auth-input" 
              placeholder=" " 
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              required 
            />
            <label className="input-label">Gmail Address</label>
          </div>

          <div className="input-container">
            <input 
              type="tel" 
              className="auth-input" 
              placeholder=" " 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required 
            />
            <label className="input-label">WhatsApp Number</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={hostIdNumber}
              onChange={(e) => setHostIdNumber(e.target.value)}
              required 
            />
            <label className="input-label">Government ID Number</label>
          </div>

          <div className="input-container">
            <select 
              className="auth-input" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: 'transparent', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', width: '100%', height: '40px' }}
            >
              <option value="General" style={{ background: '#090d16' }}>General Talk</option>
              <option value="Singing" style={{ background: '#090d16' }}>Singing / Music</option>
              <option value="Dancing" style={{ background: '#090d16' }}>Dancing</option>
              <option value="Gaming" style={{ background: '#090d16' }}>Gaming</option>
              <option value="Storytelling" style={{ background: '#090d16' }}>Storytelling / Chatting</option>
            </select>
            <label className="input-label" style={{ top: '-10px', fontSize: '0.8rem' }}>Host Category</label>
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
            <label className="input-label">State</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required 
            />
            <label className="input-label">City</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required 
            />
            <label className="input-label">Full Address</label>
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', tracking: '1px', fontWeight: 'bold' }}>Required Media & Verification Docs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {realPhoto ? realPhoto.name : 'Real Profile Photo'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setRealPhoto(e.target.files[0])} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {docPhotoFront ? docPhotoFront.name : 'ID Document (Front)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoFront(e.target.files[0])} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                  {docPhotoBack ? docPhotoBack.name : 'ID Document (Back)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoBack(e.target.files[0])} />
              </label>

            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ gridColumn: 'span 2', marginTop: '20px' }}>
            {loading ? 'Submitting Application...' : 'Submit Onboarding Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterHost;
