import React, { useState } from 'react';
import { adminService } from '../../services/api';
import { ShieldCheck, LogIn, Lock, Mail } from 'lucide-react';
import '../../styles/AuthPage.css';

const LoginPage: React.FC = () => {
    const [credentials, setCredentials] = useState({ email: 'admin@qobo1.com', password: 'admin123' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await adminService.login(credentials);
            if (res.data.statusCode === 1) {
                localStorage.setItem('admin_token', res.data.data.token);
                localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper glass-bg">
            <div className="auth-card glass slide-up">
                <div className="auth-header">
                    <div className="logo-glow">
                        <ShieldCheck size={48} color="var(--accent-purple)" />
                    </div>
                    <h1>Qobo1 Admin</h1>
                    <p>Enter your credentials to access the command center</p>
                </div>

                <form onSubmit={handleLogin} className="mt-30">
                    <div className="form-group mb-20">
                        <label><Mail size={16} /> Business Email</label>
                        <input 
                            type="email" 
                            className="admin-input" 
                            required 
                            placeholder="admin@qobo1.com"
                            value={credentials.email}
                            onChange={e => setCredentials({...credentials, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group mb-20">
                        <label><Lock size={16} /> Passphrase</label>
                        <input 
                            type="password" 
                            className="admin-input" 
                            required 
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={e => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>

                    {error && <div className="error-alert">{error}</div>}

                    <button 
                        type="submit" 
                        className="primary w-full flex-center gap-2 mt-20"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : <><LogIn size={20} /> Access Portal</>}
                    </button>
                </form>
                
                <div className="auth-footer mt-40">
                    <span className="secure-badge">
                        <ShieldCheck size={14} /> Encrypted Session
                    </span>
                    <p>© 2026 Qobo1 Enterprise Architecture</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
