import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { Building2, AlertCircle, CheckCircle2, X } from 'lucide-react';
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

const RegisterAgency: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitedBy = searchParams.get('invitedBy') || '';

  const [agencyName, setAgencyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Country & State Cascading
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [customState, setCustomState] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  // Password checks
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\~\\\|]/.test(password);

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
    if (!agencyName.trim()) {
      return triggerScrollAndFocus('agencyName', 'Please enter the Agency Name.');
    }
    if (!ownerName.trim()) {
      return triggerScrollAndFocus('ownerName', 'Please enter the Owner Full Name.');
    }
    if (!email.trim()) {
      return triggerScrollAndFocus('email', 'Please enter your Email Address.');
    }
    if (!phone.trim() || !/^\d+$/.test(phone)) {
      return triggerScrollAndFocus('phone', 'Please enter a valid digits-only Phone Number.');
    }

    // Password validations
    if (!hasMinLength) {
      return triggerScrollAndFocus('password', 'Password must be at least 8 characters long.');
    }
    if (!hasSpecialChar) {
      return triggerScrollAndFocus('password', 'Password must contain at least one special character.');
    }
    if (password !== confirmPassword) {
      return triggerScrollAndFocus('confirmPassword', 'Passwords do not match.');
    }

    setLoading(true);

    const finalCountry = selectedCountry === 'Other' ? customCountry : selectedCountry;
    const finalState = selectedCountry === 'Other' ? customState : (selectedState === 'Other' ? customState : selectedState);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/agency/register-public`, {
        agency_name: agencyName,
        owner_name: ownerName,
        email: email.toLowerCase().trim(),
        phone,
        countryCode,
        country: finalCountry,
        state: finalState,
        password,
        invitedBy
      });

      if (res.data.statusCode === 1) {
        setMessage({
          type: 'success',
          content: 'Agency registered successfully! You can now log into the application.'
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setAgencyName(''); setOwnerName(''); setEmail('');
        setPhone(''); setPassword(''); setConfirmPassword('');
        setCustomCountry(''); setCustomState('');
      } else {
        setMessage({ type: 'error', content: res.data.message || 'Registration failed' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Server error occurred during registration.'
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
      <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%', maxWidth: '750px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Register Agency</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: 500 }}>
          Establish a new recruitment node inside Qobo1live network.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}></div>

        <div style={{ padding: '24px' }} className="form-content-wrap">
          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          {invitedBy && (
            <div style={{ color: '#0369a1', background: '#e0f2fe', padding: '12px 18px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bae6fd' }}>
              <Building2 size={16} />
              <span>You are registering under Super Admin: <strong>{invitedBy}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="responsive-form-grid" noValidate>
            
            {/* Section 1: Agency Details */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={20} color="#06b6d4" /> Agency Information</h3>
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Agency Name</label>
              <input type="text" id="agencyName" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Owner Full Name</label>
              <input type="text" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Owner Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field-premium" />
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Owner Phone Number</label>
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
                  id="phone" 
                  value={phone} 
                  placeholder="Digits only" 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                  required 
                  className="input-field-premium" 
                  style={{ flexGrow: 1 }}
                />
              </div>
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

            {/* Section 2: Security */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Configuration</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Create Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field-premium" />
              
              {/* Password Rule Indicators */}
              <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: hasMinLength ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                  {hasMinLength ? '✓' : '✗'} Minimum 8 characters
                </span>
                <span style={{ color: hasSpecialChar ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                  {hasSpecialChar ? '✓' : '✗'} Contains a special character (e.g. @, #, $, !)
                </span>
              </div>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Confirm Password</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field-premium" />
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
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <><div className="spinner" /> Processing...</>
                ) : (
                  <><Building2 size={20} /> Register Agency</>
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
          border-color: #06b6d4; background: #fff; box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
        }
        .input-label-premium {
          display: block; fontSize: 0.78rem; fontWeight: 800; color: #475569; marginBottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
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
          border-color: #06b6d4 !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterAgency;
