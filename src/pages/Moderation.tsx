import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  ShieldAlert, Plus, Trash2, Search, Users, 
  MessageSquare, AlertTriangle, Check, X, Ban,
  MicOff, UserX, Clock, Filter, Shield, Eye,
  Zap, Activity, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Moderation.css';
import '../styles/Dashboard.css'; // Reuse bento styles

const Moderation: React.FC = () => {
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    keywords: 156,
    pendingReports: 12,
    activeBans: 84,
    activeMutes: 23
  });
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'keywords' | 'reports'>('keywords');

  useEffect(() => {
    // Mock data for demo
    setBannedWords([
      { id: '1', word: 'offensive_payload' },
      { id: '2', word: 'malicious_intent' },
      { id: '3', word: 'spam_buffer' },
      { id: '4', word: 'bot_sequence' },
      { id: '5', word: 'root_access' },
      { id: '6', word: 'proxy_bypass' },
    ]);
    setReports([
      { 
        id: '1', 
        reporter: { name: 'Alex Rivers', phone: '+91 98765 43210' },
        room: { title: 'Neon Lounge' },
        reason: 'Harassment and verbal abuse in public chat.',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      { 
        id: '2', 
        reporter: { name: 'Sarah Chen', phone: '+91 99887 76655' },
        room: { title: 'Global Vibes' },
        reason: 'Suspicious activity and spamming links.',
        status: 'resolved',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    setBannedWords([...bannedWords, { id: Date.now().toString(), word: newWord.trim() }]);
    setNewWord('');
    toast.success('Signature Blacklisted');
  };

  const handleRemoveWord = (id: string) => {
    setBannedWords(bannedWords.filter(w => w.id !== id));
    toast.success('Signature Purged');
  };

  const filteredWords = bannedWords.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="moderation-page">
      {/* Premium Header */}
      <div className="moderation-header">
        <div className="welcome-section">
          <h1>Moderation Console</h1>
          <p className="subtitle">Real-time surveillance and content filtering systems</p>
        </div>
        <div className="header-actions">
          <div className="defcon-badge">
            <ShieldAlert size={16} />
            <span>DEFCON 3 ACTIVE</span>
          </div>
          <button className="sync-btn primary">
            <Zap size={16} />
            <span>Sync Protocols</span>
          </button>
        </div>
      </div>

      {/* Analytics Bento */}
      <div className="bento-grid">
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">Active Bans</div>
            <div className="card-icon-wrap" style={{ color: '#ef4444' }}><Ban size={20} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats.activeBans}</div>
            <div className="card-status warning">High Alert</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">Pending Reports</div>
            <div className="card-icon-wrap" style={{ color: '#f59e0b' }}><AlertTriangle size={20} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats.pendingReports}</div>
            <div className="card-status warning">Needs Action</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">Filtered Words</div>
            <div className="card-icon-wrap" style={{ color: '#3b82f6' }}><Shield size={20} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats.keywords}</div>
            <div className="card-status positive">Filtering Active</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">Mute Actions</div>
            <div className="card-icon-wrap" style={{ color: '#8b5cf6' }}><MicOff size={20} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats.activeMutes}</div>
            <div className="card-status live">Stable</div>
          </div>
        </div>
      </div>

      {/* Tab Control */}
      <div className="moderation-tabs mt-10">
        <button 
          className={`mod-tab ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          <Filter size={18} />
          <span>Keyword Filter</span>
        </button>
        <button 
          className={`mod-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <ShieldAlert size={18} />
          <span>User Reports</span>
        </button>
      </div>

      {activeTab === 'keywords' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="inject-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-50 text-red-500"><Target size={20} /></div>
              <span style={{ fontWeight: 900, fontSize: '1rem' }}>Inject Signature</span>
            </div>
            <form onSubmit={handleAddWord}>
              <div className="inject-input-wrap">
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Banned Phrase</label>
                <input 
                  className="inject-input mt-2" 
                  placeholder="e.g. offensive_payload"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary w-full mt-6 py-4 flex items-center justify-center gap-2 rounded-xl">
                <Plus size={18} />
                <span>Inject Blacklist</span>
              </button>
            </form>
          </div>

          <div className="md:col-span-2 glass-card p-8" style={{ minHeight: '400px' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Signature Database</span>
              <div className="search-bar compact" style={{ maxWidth: '300px' }}>
                <Search size={18} />
                <input 
                  placeholder="Query database..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="signature-grid">
              {filteredWords.map((w) => (
                <div key={w.id} className="signature-tag">
                  <span className="signature-text">{w.word}</span>
                  <button className="purge-btn" onClick={() => handleRemoveWord(w.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-card mt-6">
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>REPORTER SOURCE</th>
                  <th>TARGET ENTITY</th>
                  <th>VIOLATION DATA</th>
                  <th>TIMESTAMP</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>PROTOCOLS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="row-premium">
                    <td>
                      <div className="identity-block">
                        <div className="avatar-glass">{report.reporter?.name?.[0]}</div>
                        <div className="identity-text">
                          <span className="name-bold">{report.reporter?.name}</span>
                          <span className="email-sub">{report.reporter?.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="asset-tag">
                        <Activity size={14} />
                        <span>{report.room?.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="data-cell-dim" style={{ maxWidth: '250px' }}>{report.reason}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                        <Clock size={14} /> {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${report.status === 'pending' ? 'active' : ''}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="ops-cluster">
                        <button className="op-btn edit">
                          <Check size={18} />
                        </button>
                        <button className="op-btn delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
