import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, Lock, KeyRound } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Auth.css';
import '../styles/Toast.css';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [authToast, setAuthToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const otpInputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

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
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminService.sendOtp({ phone: cleanPhone });
      if (res.data.statusCode === 1 || res.data.success) {
        showToast('success', res.data.message || 'OTP sent successfully to your mobile number!');
        setStep('otp');
        setOtpDigits(['', '', '', '']);
        setCountdown(30);
        setTimeout(() => otpInputsRef[0].current?.focus(), 150);
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

  const handleOtpDigitChange = (index: number, value: string) => {
    // Handle paste of complete 4-digit code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 4);
      if (pasted) {
        const newDigits = ['', '', '', ''];
        for (let i = 0; i < 4; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocus = Math.min(pasted.length, 3);
        otpInputsRef[nextFocus].current?.focus();
        if (pasted.length === 4) {
          triggerVerification(pasted);
        }
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto advance to next box
    if (cleanChar && index < 3) {
      otpInputsRef[index + 1].current?.focus();
    }

    // Auto-trigger when 4th digit is entered
    if (cleanChar && index === 3) {
      const fullOtp = newDigits.join('');
      if (fullOtp.length === 4) {
        triggerVerification(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef[index - 1].current?.focus();
    }
  };

  const triggerVerification = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpDigits.join('');
    if (fullOtp.length < 4) {
      setError('Please enter the complete 4-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminService.verifyOtp({ phone: phone.trim(), otp: fullOtp });
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

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVerification();
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
                Enter your authorized mobile number to receive OTP
              </p>
            </>
          ) : (
            <>
              <div className="auth-step-badge">
                <ShieldCheck size={13} /> Step 2: OTP Verification
              </div>
              <h1 className="auth-title">Verify OTP Code</h1>
              <p className="auth-subtitle">
                Enter 4-digit code sent to <span className="phone-highlight">+91 {phone}</span>
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
              <label className="phone-field-label">Mobile Number</label>
              <div className="phone-field-wrapper">
                <div className="country-code-badge">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input 
                  type="tel" 
                  className="phone-input-box" 
                  placeholder="e.g. 9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 15))}
                  maxLength={15}
                  autoFocus
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading || phone.trim().length < 10}>
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
          /* Screen 2: Premium 4-Box OTP Verification */
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-container-section">
              <label className="phone-field-label" style={{ textAlign: 'center', display: 'block', marginBottom: '14px' }}>
                Enter 4-Digit Security Code
              </label>

              <div className="otp-digit-row">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpInputsRef[index]}
                    type="text"
                    inputMode="numeric"
                    className={`otp-digit-box ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={index === 0 ? 4 : 1}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading || otpDigits.join('').length < 4}
            >
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
                onClick={() => { setStep('phone'); setOtpDigits(['', '', '', '']); setError(''); }}
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

        <div className="security-footer">
          <Lock size={12} />
          <span>Secured Administrative Verification</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
