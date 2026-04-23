import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  ShieldAlert, Plus, Trash2, Search, Users, 
  MessageSquare, AlertTriangle, Check, X, Ban,
  MicOff, UserX, Clock, Filter, Shield, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/UserManagement.css';

interface ModerationAction {
  id: string;
  userId: string;
  userName: string;
  type: 'mute' | 'kick' | 'ban' | 'warn';
  reason: string;
  duration?: string;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
  expiresAt?: string;
}

const Moderation: React.FC = () => {
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'keywords' | 'users' | 'reports'>('keywords');
  const [showBanModal, setShowBanModal] = useState<ModerationAction | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBannedWords();
      setBannedWords(res.data.data || []);
      
      // Mock moderation logs for demonstration
      setModerationLogs([
        { id: '1', userId: 'u1', userName: 'User_123', type: 'mute', reason: 'Spamming chat', duration: '1h', status: 'active', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() },
        { id: '2', userId: 'u2', userName: 'BadActor99', type: 'ban', reason: 'Harassment', duration: 'permanent', status: 'active', createdAt: new Date().toISOString() },
        { id: '3', userId: 'u3', userName: 'OffensiveUser', type: 'warn', reason: 'Inappropriate language', status: 'expired', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } catch (err) {
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    try {
      await adminService.manageBannedWord({ action: 'ADD', word: newWord.trim() });
      toast.success('Word added to blacklist');
      setNewWord('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add word');
    }
  };

  const handleRemoveWord = async (id: string) => {
    try {
      await adminService.manageBannedWord({ action: 'REMOVE', id });
      toast.success('Word removed from blacklist');
      fetchData();
    } catch (err) {
      toast.error('Removal failed');
    }
  };

  const handleMuteUser = async (userId: string, duration: string) => {
    toast.success(`User muted for ${duration}`);
    setShowBanModal(null);
    fetchData();
  };

  const handleKickUser = async (userId: string) => {
    toast.success('User removed from room');
    setShowBanModal(null);
    fetchData();
  };

  const handleBanUser = async (userId: string, duration: string) => {
    toast.success(`User banned for ${duration}`);
    setShowBanModal(null);
    fetchData();
  };

  const filteredWords = bannedWords.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeModerations = moderationLogs.filter(m => m.status === 'active');
  const expiredModerations = moderationLogs.filter(m => m.status === 'expired');

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Content Moderation</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Mute • Kick • Ban • Bad Word Filter • User Reports
          </p>
        </div>
      </div>

      {/* Moderation Stats */}
      <div className="bento-grid mt-6">
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">ACTIVE MUTES</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}>
              <MicOff size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{activeModerations.filter(m => m.type === 'mute').length}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Users silenced</p>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">ACTIVE BANS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-red)' }}>
              <Ban size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{activeModerations.filter(m => m.type === 'ban').length}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Accounts blocked</p>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">FILTERED WORDS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
              <Shield size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{bannedWords.length}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Keywords blocked</p>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">USER REPORTS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">0</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pending review</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mt-8 mb-6">
        <button 
          className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          <ShieldAlert size={16} /> Keywords
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> User Actions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <MessageSquare size={16} /> Reports
        </button>
      </div>

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Word Form */}
          <div className="bento-card">
            <div className="card-top">
              <span style={{ fontWeight: 800 }}>Blacklist Provision</span>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-red)' }}>
                <ShieldAlert size={20} />
              </div>
            </div>
            <form onSubmit={handleAddWord} className="mt-6">
              <div className="form-group mb-4">
                <label>Banned Keyword</label>
                <input 
                  className="admin-input" 
                  placeholder="e.g. offensive_word"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary-btn w-full flex-center gap-2">
                <Plus size={18} />
                <span>Add to Filter</span>
              </button>
            </form>
            
            <div className="warning-note mt-6" style={{ 
              background: 'rgba(239, 68, 68, 0.05)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.1)', 
              padding: '16px', 
              borderRadius: '12px' 
            }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Auto-masked in all live chats and private messages.
              </span>
            </div>
          </div>

          {/* Word List */}
          <div className="md:col-span-2">
            <div className="bento-card" style={{ height: '100%' }}>
              <div className="card-top">
                <div className="search-bar" style={{ width: '100%', maxWidth: '400px' }}>
                  <Search size={18} />
                  <input 
                    placeholder="Search filtered words..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredWords.map((w) => (
                  <div key={w.id} className="status-neon flex items-center justify-between" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{w.word}</span>
                    <button 
                      className="icon-btn text-danger" 
                      onClick={() => handleRemoveWord(w.id)}
                      style={{ padding: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {filteredWords.length === 0 && !loading && (
                  <div className="text-center p-10 col-span-full text-dim">
                    <MessageSquare size={32} className="mb-2 mx-auto" />
                    <p>No words found in the filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Actions Tab */}
      {activeTab === 'users' && (
        <div className="bento-card wide fade-in">
          <div className="card-top mb-6">
            <h3 style={{ fontWeight: 900 }}>Active Moderation Actions</h3>
          </div>

          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action Type</th>
                  <th>Reason</th>
                  <th>Duration</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderationLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="identity-block">
                        <div className="avatar-glass">{log.userName?.[0] || 'U'}</div>
                        <div className="identity-text">
                          <span className="name-bold">{log.userName}</span>
                          <span className="email-sub">ID: {log.userId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${
                        log.type === 'mute' ? 'warning' : 
                        log.type === 'ban' ? 'danger' : 
                        log.type === 'kick' ? 'inactive' : 'active'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.reason}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{log.duration || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {log.expiresAt ? new Date(log.expiresAt).toLocaleString() : 'Permanent'}
                    </td>
                    <td>
                      <span className={`status-neon ${log.status === 'active' ? 'active' : ''}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {log.status === 'active' && (
                          <button 
                            className="icon-btn"
                            onClick={() => toast.success('Action revoked')}
                            title="Revoke"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button className="icon-btn" title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {moderationLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                      No active moderation actions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bento-card wide fade-in">
          <div className="card-top mb-6">
            <h3 style={{ fontWeight: 900 }}>User Reports & Violations</h3>
          </div>

          <div className="text-center p-20 text-dim">
            <AlertTriangle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No pending user reports.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>All community reports have been reviewed.</p>
          </div>
        </div>
      )}

      {/* Quick Action Floating Panel */}
      <div className="quick-actions-fab">
        <button 
          className="fab-btn"
          onClick={() => toast('Select a user to moderate')}
          title="Quick Moderate User"
        >
          <Shield size={20} />
        </button>
      </div>
    </div>
  );
};

export default Moderation;
