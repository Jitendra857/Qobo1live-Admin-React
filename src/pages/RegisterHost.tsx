import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { UserCheck, Upload, AlertCircle, CheckCircle2, X, Building2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RegisterHost: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agencyCodeParam = searchParams.get('agencyCode') || '';

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

  useEffect(() => {
    if (agencyCodeParam) {
      setAgencyCode(agencyCodeParam.toUpperCase());
    }
  }, [agencyCodeParam]);

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
        setAddress(''); setRealPhoto(null);
        setDocPhotoFront(null); setDocPhotoBack(null);
        if (!agencyCodeParam) setAgencyCode('');
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
      <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%', maxWidth: '800px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Host Application</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: 500 }}>
          Join an agency to unlock live streaming capabilities on Qobo1live.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '800px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #ec4899, #f43f5e)' }}></div>

        <div style={{ padding: '24px' }} className="form-content-wrap">
          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          {agencyCodeParam && (
            <div style={{ color: '#86198f', background: '#fae8ff', padding: '12px 18px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #f5d0fe' }}>
              <Building2 size={16} />
              <span>You are applying to Agency Code: <strong>{agencyCodeParam.toUpperCase()}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="responsive-form-grid">
            
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

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Agency Referral Code</label>
              <input 
                type="text" 
                value={agencyCode} 
                onChange={(e) => setAgencyCode(e.target.value)} 
                required 
                disabled={!!agencyCodeParam} 
                className="input-field-premium" 
                style={agencyCodeParam ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', fontWeight: 'bold' } : {}}
              />
            </div>

            {/* Section 3: Identity Details */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={20} color="#ec4899" /> Host Details</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Full Name</label>
              <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className="input-field-premium">
                <option value="General">General (Just Chat)</option>
                <option value="Gaming">Gaming</option>
                <option value="Singing">Singing</option>
                <option value="Dancing">Dancing</option>
              </select>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">WhatsApp Number</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Gmail Address</label>
              <input type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">National ID (Aadhar/Passport)</label>
              <input type="text" value={hostIdNumber} onChange={(e) => setHostIdNumber(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">State / Region</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="input-field-premium" />
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Full Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Section 4: Document Uploads */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Required Verification Documents</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">ID Document Front View</label>
              <label className="upload-box-premium">
                {docPhotoFront ? (
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>✓ Front View Selected ({docPhotoFront.name.substring(0, 18)}...)</span>
                ) : (
                  <>
                    <Upload size={22} color="#64748b" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>Upload Front Side</span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoFront(e.target.files[0])} />
              </label>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">ID Document Back View</label>
              <label className="upload-box-premium">
                {docPhotoBack ? (
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>✓ Back View Selected ({docPhotoBack.name.substring(0, 18)}...)</span>
                ) : (
                  <>
                    <Upload size={22} color="#64748b" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>Upload Back Side</span>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && setDocPhotoBack(e.target.files[0])} />
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
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <><div className="spinner" /> Processing...</>
                ) : (
                  <><UserCheck size={20} /> Submit Application</>
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
          border-color: #ec4899; background: #fff; box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
        }
        .input-label-premium {
          display: block; fontSize: 0.78rem; fontWeight: 800; color: #475569; marginBottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .upload-box-premium {
          display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px;
          border: 2.5px dashed #cbd5e1; borderRadius: 12px; cursor: pointer; background: #f8fafc; transition: all 0.2s;
        }
        .upload-box-premium:hover {
          border-color: #ec4899; background: #fdf2f8;
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

export default RegisterHost;
