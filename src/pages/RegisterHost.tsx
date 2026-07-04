import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { UserCheck, Upload, AlertCircle, CheckCircle2, X, FileText, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { locationData } from '../utils/locationData';

const RegisterHost: React.FC = () => {
  const navigate = useNavigate();
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
        setHostName(''); setWhatsapp(''); setGmail(''); setCategory('General');
        setHostIdNumber(''); setCountry(''); setState(''); setCity('');
        setAddress(''); setAgencyCode(''); setRealPhoto(null);
        setDocPhotoFront(null); setDocPhotoBack(null);
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

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
    background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s', outline: 'none'
  };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
  const uploadBoxStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '120px', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Host Application Form</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px', fontWeight: 500 }}>
          Join an agency to unlock live streaming capabilities on Qobo1live.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '850px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #ec4899, #f43f5e)' }}></div>

        <div style={{ padding: '40px' }}>
          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Section 1: Profile Photo */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
              <label 
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  width: '120px', height: '120px', borderRadius: '50%', border: '3px dashed #cbd5e1', 
                  cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.background = '#fdf2f8'; }} 
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                {realPhoto ? (
                  <img src={URL.createObjectURL(realPhoto)} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={30} color="#64748b" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textAlign: 'center', lineHeight: '1.2' }}>
                      Profile<br/>Photo
                    </span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setRealPhoto(e.target.files[0])} />
              </label>
            </div>

            {/* Section 2: Agency Assignment */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={20} color="#ec4899" /> Agency Assignment</h3>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Agency Referral Code</label>
              <input type="text" value={agencyCode} onChange={(e) => setAgencyCode(e.target.value.toUpperCase())} placeholder="e.g. AGX100" required style={{...inputStyle, fontSize: '1.1rem', letterSpacing: '0.05em', fontWeight: 'bold'}} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            {/* Section 3: Personal Profile */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={20} color="#ec4899" /> Personal Profile</h3>
            </div>

            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Gmail Address</label>
              <input type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Host Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}}>
                <option value="General">General Talk</option>
                <option value="Singing">Singing / Music</option>
                <option value="Dancing">Dancing</option>
                <option value="Gaming">Gaming</option>
                <option value="Storytelling">Storytelling / Chatting</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Government ID Number</label>
              <input type="text" value={hostIdNumber} onChange={(e) => setHostIdNumber(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            {/* Section 4: Location */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Location Details</h3>
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <select 
                value={country} 
                onChange={(e) => {
                  setCountry(e.target.value);
                  setState('');
                }} 
                required 
                style={{...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}} 
                onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}}
              >
                <option value="">Select Country</option>
                {Object.keys(locationData).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <select 
                value={state} 
                onChange={(e) => setState(e.target.value)} 
                required 
                disabled={!country}
                style={{...inputStyle, cursor: country ? 'pointer' : 'not-allowed', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}} 
                onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 16px center';}}
              >
                <option value="">Select State</option>
                {country && locationData[country]?.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Full Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#ec4899'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            {/* Section 5: Documents */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="#ec4899" /> Media & Verification Docs</h3>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <label style={uploadBoxStyle} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.background = '#fdf2f8'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
                <Upload size={24} color={docPhotoFront ? '#10b981' : '#64748b'} style={{ marginBottom: '10px' }} />
                <span style={{ fontSize: '0.85rem', color: docPhotoFront ? '#10b981' : '#475569', fontWeight: 600, textAlign: 'center', padding: '0 10px' }}>
                  {docPhotoFront ? docPhotoFront.name : 'ID Document (Front)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoFront(e.target.files[0])} />
              </label>

              <label style={uploadBoxStyle} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.background = '#fdf2f8'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
                <Upload size={24} color={docPhotoBack ? '#10b981' : '#64748b'} style={{ marginBottom: '10px' }} />
                <span style={{ fontSize: '0.85rem', color: docPhotoBack ? '#10b981' : '#475569', fontWeight: 600, textAlign: 'center', padding: '0 10px' }}>
                  {docPhotoBack ? docPhotoBack.name : 'ID Document (Back)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoBack(e.target.files[0])} />
              </label>
            </div>

            {/* Actions */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button" 
                onClick={() => navigate('/')}
                style={{ flex: 1, padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #ec4899 0%, #be123c 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'none'; }}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Processing...</>
                ) : (
                  <><UserCheck size={20} /> Submit Onboarding</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RegisterHost;
