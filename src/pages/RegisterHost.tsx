import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { UserCheck, Upload, AlertCircle, CheckCircle2, X, Building2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const countryStateData: { [key: string]: string[] } = {
  "India": ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"],
  "United States": ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"],
  "Pakistan": ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir"],
  "Bangladesh": ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"],
  "Saudi Arabia": ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Tabuk", "Hail", "Jazan"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Nova Scotia", "Saskatchewan"],
  "Nepal": ["Province No. 1", "Madhesh Province", "Bagmati Province", "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"]
};

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+971", country: "UAE" },
  { code: "+44", country: "UK" },
  { code: "+977", country: "Nepal" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+20", country: "Egypt" },
  { code: "+234", country: "Nigeria" }
];

const RegisterHost: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agencyCodeParam = searchParams.get('agencyCode') || '';

  const [hostName, setHostName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [gmail, setGmail] = useState('');
  const [category, setCategory] = useState('General');
  const [hostIdNumber, setHostIdNumber] = useState('');

  // Country & State Cascading
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [customState, setCustomState] = useState('');

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

  const triggerScrollAndFocus = (id: string, errorMessage: string) => {
    setMessage({ type: 'error', content: errorMessage });
    const target = document.getElementById(id);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Form validations
    if (!agencyCode.trim()) {
      return triggerScrollAndFocus('agencyCode', 'Please enter the Agency referral code.');
    }
    if (!hostName.trim()) {
      return triggerScrollAndFocus('hostName', 'Please enter your Full Name.');
    }
    if (!whatsapp.trim() || !/^\d+$/.test(whatsapp)) {
      return triggerScrollAndFocus('whatsapp', 'Please enter a valid digits-only Mobile Number.');
    }
    if (!gmail.trim()) {
      return triggerScrollAndFocus('gmail', 'Please enter your Gmail address.');
    }
    if (!hostIdNumber.trim()) {
      return triggerScrollAndFocus('hostIdNumber', 'Please enter your National ID.');
    }
    if (!city.trim()) {
      return triggerScrollAndFocus('city', 'Please enter your City.');
    }
    if (!address.trim()) {
      return triggerScrollAndFocus('address', 'Please enter your Full Address.');
    }

    if (!realPhoto) {
      return triggerScrollAndFocus('realPhotoLabel', 'Please upload your profile photo.');
    }
    if (!docPhotoFront) {
      return triggerScrollAndFocus('docFrontLabel', 'Please upload ID Document Front View.');
    }
    if (!docPhotoBack) {
      return triggerScrollAndFocus('docBackLabel', 'Please upload ID Document Back View.');
    }

    setLoading(true);

    const finalCountry = selectedCountry === 'Other' ? customCountry : selectedCountry;
    const finalState = selectedCountry === 'Other' ? customState : (selectedState === 'Other' ? customState : selectedState);

    const formData = new FormData();
    formData.append('hostName', hostName);
    formData.append('whatsapp', whatsapp);
    formData.append('countryCode', countryCode);
    formData.append('gmail', gmail.toLowerCase().trim());
    formData.append('category', category);
    formData.append('hostIdNumber', hostIdNumber);
    formData.append('country', finalCountry);
    formData.append('state', finalState);
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
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setHostName(''); setWhatsapp(''); setGmail(''); setCategory('General');
        setHostIdNumber(''); setCity(''); setAddress(''); setRealPhoto(null);
        setDocPhotoFront(null); setDocPhotoBack(null);
        setCustomCountry(''); setCustomState('');
        if (!agencyCodeParam) setAgencyCode('');
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

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedState('');
    setCustomState('');
    if (c !== 'Other' && countryStateData[c]) {
      setSelectedState(countryStateData[c][0]);
    }
  };

  const states = selectedCountry !== 'Other' ? (countryStateData[selectedCountry] || []) : [];

  return (
    <div className="public-onboarding-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', fontFamily: 'Inter, sans-serif' }}>
      
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

          <form onSubmit={handleSubmit} className="responsive-form-grid" noValidate>
            
            {/* Section 1: Profile Photo */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
              <label 
                id="realPhotoLabel"
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
                id="agencyCode"
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
              <input type="text" id="hostName" value={hostName} onChange={(e) => setHostName(e.target.value)} required className="input-field-premium" />
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)} 
                  className="input-field-premium" 
                  style={{ width: '90px', paddingRight: '4px', flexShrink: 0 }}
                >
                  {countryCodes.map((item, idx) => (
                    <option key={idx} value={item.code}>{item.code} ({item.country})</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  id="whatsapp" 
                  value={whatsapp} 
                  placeholder="Digits only" 
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} 
                  required 
                  className="input-field-premium" 
                  style={{ flexGrow: 1 }}
                />
              </div>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Gmail Address</label>
              <input type="email" id="gmail" value={gmail} onChange={(e) => setGmail(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">National ID (Aadhar/Passport)</label>
              <input type="text" id="hostIdNumber" value={hostIdNumber} onChange={(e) => setHostIdNumber(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Cascading Country & State */}
            <div className="form-item-half">
              <label className="input-label-premium">Country</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => handleCountryChange(e.target.value)} 
                className="input-field-premium"
              >
                {Object.keys(countryStateData).map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
                <option value="Other">Other (Custom Write-in)</option>
              </select>
              {selectedCountry === 'Other' && (
                <input 
                  type="text" 
                  placeholder="Type country" 
                  value={customCountry} 
                  onChange={(e) => setCustomCountry(e.target.value)} 
                  required
                  className="input-field-premium" 
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">State / Region</label>
              {selectedCountry !== 'Other' ? (
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)} 
                  className="input-field-premium"
                >
                  {states.map((st, idx) => (
                    <option key={idx} value={st}>{st}</option>
                  ))}
                  <option value="Other">Other (Custom Write-in)</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  placeholder="Type state/region" 
                  value={customState} 
                  onChange={(e) => setCustomState(e.target.value)} 
                  required
                  className="input-field-premium" 
                />
              )}
              {selectedCountry !== 'Other' && selectedState === 'Other' && (
                <input 
                  type="text" 
                  placeholder="Type state/region" 
                  value={customState} 
                  onChange={(e) => setCustomState(e.target.value)} 
                  required
                  className="input-field-premium" 
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">City</label>
              <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="input-field-premium" />
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Full Address</label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Section 4: Document Uploads */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Required Verification Documents</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">ID Document Front View</label>
              <label id="docFrontLabel" className="upload-box-premium">
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
              <label id="docBackLabel" className="upload-box-premium">
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

        /* Force light theme elements on mobile/email webviews to prevent forced dark mode bugs */
        .public-onboarding-page {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
          color: #0f172a !important;
        }
        .public-onboarding-page h1,
        .public-onboarding-page h2,
        .public-onboarding-page h3,
        .public-onboarding-page h4,
        .public-onboarding-page p,
        .public-onboarding-page label,
        .public-onboarding-page span {
          color: #0f172a !important;
        }
        .public-onboarding-page p {
          color: #64748b !important;
        }
        .public-onboarding-page .input-label-premium {
          color: #475569 !important;
        }
        .public-onboarding-page input,
        .public-onboarding-page select,
        .public-onboarding-page textarea {
          color: #0f172a !important;
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
        .public-onboarding-page input:focus,
        .public-onboarding-page select:focus,
        .public-onboarding-page textarea:focus {
          background-color: #ffffff !important;
          border-color: #ec4899 !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterHost;
