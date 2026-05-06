import React, { useState } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Bell, Send, History, Info } from 'lucide-react';
import '../../styles/UserManagement.css';

const NotificationCenter: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!subject || !body) { toast.error('Please fill all fields'); return; }
    setSending(true);
    try {
      await adminService.sendBroadcast({ subject, body });
      toast.success('Broadcast launched successfully');
      setSubject('');
      setBody('');
    } catch (err) {
      toast.error('Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Broadcast Relay</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Send FCM push notifications to all users</p>
        </div>
      </div>

      <div className="bento-grid mt-10" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">COMPOSE BROADCAST</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
              <Send size={24} />
            </div>
          </div>
          <div className="card-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Subject Line</label>
              <input 
                type="text" 
                placeholder="Short, punchy title..." 
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Message Body</label>
              <textarea 
                rows={4} 
                placeholder="Write your global alert here..." 
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)', resize: 'none' }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              ></textarea>
            </div>
            <button 
              className="primary flex-center gap-2" 
              style={{ padding: '15px', opacity: sending ? 0.5 : 1 }} 
              onClick={handleBroadcast}
              disabled={sending}
            >
              <Send size={18} />
              <span>{sending ? 'Launching...' : 'Launch Broadcast'}</span>
            </button>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">TRANSMISSION HISTORY</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}>
              <History size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Welcome to Qobo1live!</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>Yesterday at 14:30 • 45.2k reached</div>
                </div>
              ))}
              <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '10px' }}>No further history found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
