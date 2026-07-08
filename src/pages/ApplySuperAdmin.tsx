import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

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

const ApplySuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [idNumber, setIdNumber] = useState('');
  
  // Country & State Cascading
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [customState, setCustomState] = useState('');

  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Autofill states
  const [isPreExistingUser, setIsPreExistingUser] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  // Files
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
  const [governmentDoc, setGovernmentDoc] = useState<File | null>(null);
  const [aadharPan, setAadharPan] = useState<File | null>(null);

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

  const checkExistingEmail = async (emailVal: string) => {
    if (!emailVal || !emailVal.includes('@')) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/check-email?email=${encodeURIComponent(emailVal.trim())}`);
      if (res.data.statusCode === 1 && res.data.data.exists) {
        const u = res.data.data.user;
        toast.success("Existing profile found! Auto-filling your details.");
        
        if (u.name) setFullName(u.name);
        if (u.phone) setPhone(u.phone.replace(/\D/g, ''));
        if (u.countryCode) setCountryCode(u.countryCode);
        
        if (u.country) {
          setSelectedCountry(u.country);
          if (countryStateData[u.country]) {
            if (u.state) setSelectedState(u.state);
          } else {
            setSelectedCountry('Other');
            setCustomCountry(u.country);
            setCustomState(u.state || '');
          }
        }
        
        if (u.dob) {
          const d = new Date(u.dob);
          if (!isNaN(d.getTime())) {
            setBirthday(d.toISOString().split('T')[0]);
          }
        }
        
        setIsPreExistingUser(true);
        if (u.hasPassword) {
          setHasExistingPassword(true);
        }
      } else {
        setIsPreExistingUser(false);
        setHasExistingPassword(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      checkExistingEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Form validations
    if (!fullName.trim()) {
      return triggerScrollAndFocus('fullName', 'Please enter your Full Name.');
    }
    if (!email.trim()) {
      return triggerScrollAndFocus('email', 'Please enter your Email Address.');
    }
    if (!phone.trim() || !/^\d+$/.test(phone)) {
      return triggerScrollAndFocus('phone', 'Please enter a valid digits-only Mobile Number.');
    }
    if (!idNumber.trim()) {
      return triggerScrollAndFocus('idNumber', 'Please enter your National ID Number.');
    }

    // Password validations (skipped if user has existing password)
    if (!hasExistingPassword) {
      if (!hasMinLength) {
        return triggerScrollAndFocus('password', 'Password must be at least 8 characters long.');
      }
      if (!hasSpecialChar) {
        return triggerScrollAndFocus('password', 'Password must contain at least one special character.');
      }
      if (password !== confirmPassword) {
        return triggerScrollAndFocus('confirmPassword', 'Passwords do not match.');
      }
    }

    if (!originalPhoto) {
      return triggerScrollAndFocus('originalPhotoLabel', 'Please upload your profile photo.');
    }
    if (!governmentDoc) {
      return triggerScrollAndFocus('govtDocLabel', 'Please upload government ID document front side.');
    }
    if (!aadharPan) {
      return triggerScrollAndFocus('aadharPanLabel', 'Please upload Aadhar/PAN back side document.');
    }

    setLoading(true);

    const finalCountry = selectedCountry === 'Other' ? customCountry : selectedCountry;
    const finalState = selectedCountry === 'Other' ? customState : (selectedState === 'Other' ? customState : selectedState);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email.toLowerCase().trim());
    formData.append('phone', phone);
    formData.append('countryCode', countryCode);
    formData.append('idNumber', idNumber);
    formData.append('country', finalCountry);
    formData.append('state', finalState);
    formData.append('birthday', birthday);
    if (!hasExistingPassword) {
      formData.append('password', password);
    }
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
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setFullName(''); setEmail(''); setPhone(''); setIdNumber('');
        setBirthday(''); setPassword(''); setConfirmPassword('');
        setOriginalPhoto(null); setGovernmentDoc(null); setAadharPan(null);
        setIsPreExistingUser(false); setHasExistingPassword(false);
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

          {isPreExistingUser && (
            <div style={{ color: '#16a34a', background: '#f0fdf4', padding: '12px 18px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.88rem', fontWeight: 700, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              <span>Registered account detected! Pre-filling profile details. Just upload KYC files and submit.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="responsive-form-grid" noValidate>
            
            {/* Profile Photo */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
              <label 
                id="originalPhotoLabel"
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
              <label className="input-label-premium">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                onBlur={() => checkExistingEmail(email)}
                required 
                className="input-field-premium" 
              />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Full Name</label>
              <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isPreExistingUser} required className="input-field-premium" />
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Phone Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)} 
                  disabled={isPreExistingUser}
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
                  disabled={isPreExistingUser}
                  required 
                  className="input-field-premium" 
                  style={{ flexGrow: 1 }}
                />
              </div>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">National ID Number</label>
              <input type="text" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required className="input-field-premium" />
            </div>

            {/* Cascading Country & State */}
            <div className="form-item-half">
              <label className="input-label-premium">Country</label>
              <select 
                id="countrySelect"
                value={selectedCountry} 
                onChange={(e) => handleCountryChange(e.target.value)} 
                disabled={isPreExistingUser}
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
                  placeholder="Type your country" 
                  value={customCountry} 
                  onChange={(e) => setCustomCountry(e.target.value)} 
                  disabled={isPreExistingUser}
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
                  disabled={isPreExistingUser}
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
                  disabled={isPreExistingUser}
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
                  disabled={isPreExistingUser}
                  required
                  className="input-field-premium" 
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-item-full">
              <label className="input-label-premium">Birthday</label>
              <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} disabled={isPreExistingUser} required className="input-field-premium" />
            </div>

            {/* Section 2: Security (Only visible if password needs setting) */}
            {!hasExistingPassword && (
              <>
                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Configuration</h3>
                </div>

                <div className="form-item-half">
                  <label className="input-label-premium">Password</label>
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field-premium" />
                  
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
              </>
            )}

            {/* Section 3: Document Uploads */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Verification Documents</h3>
            </div>

            <div className="form-item-half">
              <label className="input-label-premium">Government Issued ID Front</label>
              <label id="govtDocLabel" className="upload-box-premium">
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
              <label id="aadharPanLabel" className="upload-box-premium">
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
        .input-field-premium:disabled {
          background-color: #f1f5f9 !important;
          color: #64748b !important;
          cursor: not-allowed !important;
          border-color: #e2e8f0 !important;
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
          border-color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
};

export default ApplySuperAdmin;
