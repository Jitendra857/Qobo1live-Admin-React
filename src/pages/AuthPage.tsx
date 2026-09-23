import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, RotateCw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, BACKEND_URL } from '../services/api';
import '../styles/Auth.css';
import '../styles/Toast.css';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<'phone' | 'password'>('phone');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [authToast, setAuthToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setAuthToast({ type, message });
    setTimeout(() => setAuthToast(null), 5000);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your registered mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminService.sendOtp({ phone: cleanPhone });
      if (res.data.statusCode === 1 || res.data.success) {
        showToast('success', res.data.message || 'OTP sent successfully to your mobile number!');
        setStep('otp');
        setCountdown(30);
      } else {
        const msg = res.data.message || 'Failed to send OTP';
        setError(msg);
        showToast('error', msg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error sending OTP';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('Please enter the verification OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminService.verifyOtp({ phone: phone.trim(), otp: cleanOtp });
      if (res.data.statusCode === 1 || res.data.data?.token) {
        showToast('success', 'Access Granted! Welcome to Qobo1 Dashboard.');
        localStorage.setItem('admin_token', res.data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
        setTimeout(onLogin, 800);
      } else {
        const msg = res.data.message || 'Invalid or expired OTP';
        setError(msg);
        showToast('error', msg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification Failed';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminService.login({ email, password });
      if (res.data.statusCode === 1 || res.data.data?.token) {
        showToast('success', 'Access Granted! Welcome to Qobo1 Dashboard.');
        localStorage.setItem('admin_token', res.data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
        setTimeout(onLogin, 800);
      } else {
        const msg = res.data.message || 'Invalid email or password';
        showToast('error', msg);
        setError(msg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login Failed';
      showToast('error', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {authToast && (
        <div className="toast-container">
          <div className={`toast ${authToast.type}`}>
            <div className="toast-icon">
              {authToast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="toast-content">
              <p className="toast-title">{authToast.type === 'success' ? 'Authorized' : 'Access Denied'}</p>
              <p className="toast-message">{authToast.message}</p>
            </div>
            <div className="toast-icon" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setAuthToast(null)}>
              <X size={16} />
            </div>
          </div>
        </div>
      )}

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo.svg" alt="Qobo1live" />
          </div>

          {loginMode === 'phone' ? (
            step === 'phone' ? (
              <>
                <div className="auth-step-badge">
                  <Smartphone size={14} /> Step 1: Mobile Verification
                </div>
                <h1 className="auth-title">Admin Sign In</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                  Enter your registered mobile number to receive OTP
                </p>
              </>
            ) : (
              <>
                <div className="auth-step-badge">
                  <ShieldCheck size={14} /> Step 2: OTP Verification
                </div>
                <h1 className="auth-title">Enter Verification Code</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                  Code sent to <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{phone}</span>
                </p>
              </>
            )
          ) : (
            <>
              <div className="auth-step-badge">
                <Lock size={14} /> Password Authentication
              </div>
              <h1 className="auth-title">Admin Login</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                Enter your administrative credentials
              </p>
            </>
          )}
        </div>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        {loginMode === 'phone' ? (
          step === 'phone' ? (
            /* Screen 1: Mobile Number Input */
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="input-container">
                <input 
                  type="tel" 
                  className="auth-input" 
                  placeholder=" " 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  required 
                />
                <label className="input-label">Mobile Number (e.g. +91 8200379256)</label>
              </div>

              <button type="submit" className="auth-btn" disabled={loading || !phone.trim()}>
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <Smartphone size={20} /> <span>Send OTP Code</span> <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Screen 2: OTP Verification */
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="input-container">
                <input 
                  type="text" 
                  className="auth-input otp-field" 
                  placeholder="• • • •" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  required 
                />
                <label className="input-label" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                  Verification Code (OTP)
                </label>
              </div>

              <button type="submit" className="auth-btn" disabled={loading || !otp.trim()}>
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <ShieldCheck size={20} /> <span>Verify & Access Dashboard</span>
                  </>
                )}
              </button>

              <div className="auth-sub-actions">
                <button 
                  type="button" 
                  className="auth-back-btn" 
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                >
                  <ArrowLeft size={16} /> Change Mobile Number
                </button>

                <button 
                  type="button" 
                  className="resend-btn" 
                  disabled={countdown > 0 || loading}
                  onClick={() => handleSendOtp()}
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )
        ) : (
          /* Password Fallback Form */
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="input-container">
              <input 
                type="text" 
                className="auth-input" 
                placeholder=" " 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label className="input-label">Email or Mobile Number</label>
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
              <label className="input-label">Password</label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span>Authenticating...</span> : <span>Sign In With Password</span>}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '25px' }}>
          {loginMode === 'phone' ? (
            <span 
              className="auth-link" 
              style={{ fontSize: '0.8rem', opacity: 0.7 }}
              onClick={() => { setLoginMode('password'); setError(''); }}
            >
              Alternative: Sign in with Password
            </span>
          ) : (
            <span 
              className="auth-link" 
              style={{ fontSize: '0.8rem', opacity: 0.7 }}
              onClick={() => { setLoginMode('phone'); setError(''); }}
            >
              Switch to Mobile Number + OTP Login
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
