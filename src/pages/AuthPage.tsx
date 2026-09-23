import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, Lock } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Auth.css';
import '../styles/Toast.css';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

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
        setTimeout(onLogin, 600);
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

          {step === 'phone' ? (
            <>
              <div className="auth-step-badge">
                <Smartphone size={13} /> Step 1: Mobile Verification
              </div>
              <h1 className="auth-title">Admin Sign In</h1>
              <p className="auth-subtitle">
                Enter your registered mobile number to receive verification code
              </p>
            </>
          ) : (
            <>
              <div className="auth-step-badge">
                <ShieldCheck size={13} /> Step 2: OTP Verification
              </div>
              <h1 className="auth-title">Enter Verification Code</h1>
              <p className="auth-subtitle">
                Code sent to <strong style={{ color: '#7c3aed' }}>{phone}</strong>
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          /* Screen 1: Mobile Number Input */
          <form className="auth-form" onSubmit={handleSendOtp}>
            <div className="phone-field-group">
              <label className="phone-field-label">Registered Mobile Number</label>
              <div className="phone-field-wrapper">
                <div className="country-code-badge">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input 
                  type="tel" 
                  className="phone-input-box" 
                  placeholder="Enter 10-digit number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ''))}
                  autoFocus
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading || !phone.trim()}>
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <Smartphone size={18} /> <span>Send OTP Code</span> <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Screen 2: OTP Verification */
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-field-group">
              <label className="phone-field-label" style={{ textAlign: 'center' }}>
                4-Digit Verification OTP
              </label>
              <input 
                type="text" 
                className="otp-input-box" 
                placeholder="• • • •" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
                required 
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || !otp.trim()}>
              {loading ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <ShieldCheck size={18} /> <span>Verify & Access Dashboard</span>
                </>
              )}
            </button>

            <div className="auth-sub-actions">
              <button 
                type="button" 
                className="auth-back-btn" 
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              >
                <ArrowLeft size={15} /> Change Mobile Number
              </button>

              <button 
                type="button" 
                className="resend-btn" 
                disabled={countdown > 0 || loading}
                onClick={() => handleSendOtp()}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
