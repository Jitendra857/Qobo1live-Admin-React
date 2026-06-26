import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css';

const RegisterAgency: React.FC = () => {
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
        setAgencyName('');
        setOwnerName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
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

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '15px', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px auto' }}>
            <Building2 size={48} color="#06b6d4" />
          </div>
          <h1 className="auth-title">Register Agency</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>
            Establish a new recruitment node inside Qobo1live network.
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

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required 
            />
            <label className="input-label">Agency Name</label>
          </div>

          <div className="input-container">
            <input 
              type="text" 
              className="auth-input" 
              placeholder=" " 
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required 
            />
            <label className="input-label">Owner Full Name</label>
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
            <label className="input-label">Owner Email Address</label>
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
            <label className="input-label">Owner Phone Number</label>
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

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? 'Registering Agency...' : 'Register Agency'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAgency;
