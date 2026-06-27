import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { Building2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegisterAgency: React.FC = () => {
  const navigate = useNavigate();
  const [agencyName, setAgencyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', content: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/agency/register-public`, {
        agency_name: agencyName,
        owner_name: ownerName,
        email: email.toLowerCase().trim(),
        phone,
        password
      });

      if (res.data.statusCode === 1) {
        setMessage({
          type: 'success',
          content: 'Agency registered successfully! You can now log into the application.'
        });
        setAgencyName(''); setOwnerName(''); setEmail('');
        setPhone(''); setPassword(''); setConfirmPassword('');
      } else {
        setMessage({ type: 'error', content: res.data.message || 'Registration failed' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Server error occurred during registration.'
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/logo.svg" alt="Qobo1Live Logo" style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Register Agency</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px', fontWeight: 500 }}>
          Establish a new recruitment node inside Qobo1live network.
        </p>
      </div>

      {/* Main Form Page Container */}
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Top Accent Bar */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}></div>

        <div style={{ padding: '40px' }}>
          {message && (
            <div style={{ color: message.type === 'success' ? '#15803d' : '#b91c1c', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{message.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Section 1: Agency Details */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={20} color="#06b6d4" /> Agency Information</h3>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Agency Name</label>
              <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Owner Full Name</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Owner Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Owner Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            {/* Section 2: Security */}
            <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Configuration</h3>
            </div>

            <div>
              <label style={labelStyle}>Create Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} onFocus={(e) => {e.target.style.borderColor = '#06b6d4'; e.target.style.background = '#fff';}} onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc';}} />
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
                style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'none'; }}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Processing...</>
                ) : (
                  <><Building2 size={20} /> Register Agency</>
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

export default RegisterAgency;
