import React, { useState } from 'react';
import { Layout, LogIn, UserPlus, CheckCircle, AlertCircle, X } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Auth.css';
import '../styles/Toast.css';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@qobo1.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Initiated:', { email });
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        console.log(`Contacting Server: http://localhost:5000/api/admin/login`);
        const res = await adminService.login({ email, password });
        console.log('Login response:', res.data);
        
        if (res.data.success) {
          showToast('success', 'Access Granted! Welcome to Qobo1 Dashboard.');
          localStorage.setItem('admin_token', res.data.data.token);
          localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
          setTimeout(onLogin, 1500); // Small delay for toast visibility
        } else {
          showToast('error', res.data.message || 'Identity verification failed.');
          setError(res.data.message || 'Login failed');
        }
      } else {
        alert('Account request submitted for authorization');
      }
    } catch (err: any) {
      console.error('Login Error Details:', err);
      const msg = err.response?.data?.message || err.message || 'Network Communication Error';
      showToast('error', `Security Protocol Blocked: ${msg}`);
      setError(`Auth Failure: ${msg} (Status: ${err.response?.status || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      setError('Checking server connectivity...');
      const apiBase = 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test', password: 'test' }) });
      setError(`Server Reachable: Status ${response.status} ${response.statusText}`);
    } catch (err: any) {
      setError(`Server Unreachable: ${err.message}. Ensure backend is running on port 5000.`);
    }
  };

  return (
    <div className="auth-page">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="toast-content">
              <p className="toast-title">{toast.type === 'success' ? 'Authorized' : 'Access Denied'}</p>
              <p className="toast-message">{toast.message}</p>
            </div>
            <div className="toast-icon" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setToast(null)}>
              <X size={16} />
            </div>
          </div>
        </div>
      )}
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Layout size={28} />
          </div>
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Access'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>
            {isLogin ? 'Enter your credentials to manage Qobo1' : 'Join the administrative elite'}
          </p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-container">
              <input type="text" className="auth-input" placeholder=" " required />
              <label className="input-label">Full Name</label>
            </div>
          )}
          
          <div className="input-container">
            <input 
              type="email" 
              className="auth-input" 
              placeholder=" " 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <label className="input-label">Email Address</label>
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
            {loading ? (
              <span>Authenticating...</span>
            ) : isLogin ? (
              <>
                <LogIn size={20} /> <span>Enter Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus size={20} /> <span>Initialize Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div style={{ marginBottom: '15px' }}>
            {isLogin ? (
              <>
                New to Qobo1? <span className="auth-link" onClick={() => setIsLogin(false)}>Request Access</span>
              </>
            ) : (
              <>
                Already authorized? <span className="auth-link" onClick={() => setIsLogin(true)}>Sign In</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
            Connection Issues? <span className="auth-link" onClick={handleHealthCheck}>Check Server Status</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
