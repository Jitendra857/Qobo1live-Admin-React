import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  Activity, Users, Gift, FileText, UserCheck,
  Wallet, Image as ImageIcon, ArrowUpRight, TrendingUp,
  Globe, Trophy, Medal, Star, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, pendingHosts: 0, giftCount: 0, revenue: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [country, setCountry] = useState('');
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('DAILY');

  useEffect(() => {
    adminService.getStats(country).then(res => setStats(res.data.data));
  }, [country]);

  useEffect(() => {
    adminService.getLeaderboard('GIFTER', period).then(res => setLeaderboard(res.data.data));
  }, [period]);

  const growthData = [
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 600 },
    { name: 'Wed', users: 500 },
    { name: 'Thu', users: 900 },
    { name: 'Fri', users: 800 },
    { name: 'Sat', users: 1200 },
    { name: 'Sun', users: 1100 },
  ];

  const countries = ['Global', 'India', 'Pakistan', 'Bangladesh', 'USA', 'UK'];

  return (
    <div className="dashboard-page">
      <div className="header-actions">
        <h1 className="page-title">Analytics Hub</h1>
        
        <div className="region-selector">
          <Globe size={16} className="text-dim" />
          <select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">Global Network</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} />
        </div>
      </div>

      <div className="bento-grid">
        {/* Main Growth Chart - 4x2 */}
        <div className="bento-card chart-large">
          <div className="card-top">
            <div>
              <div className="card-label">Performance Trend</div>
              <div className="card-value-small">User Acquisition</div>
            </div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Stats Cards */}
        <div className="bento-card stats-medium">
          <div className="card-top">
            <div className="card-label">Active Users</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}><Users size={18} /></div>
          </div>
          <div>
            <div className="card-value">{stats?.totalUsers || 0}</div>
            <div className="card-status positive"><ArrowUpRight size={12} /> 12% Growth</div>
          </div>
        </div>

        <div className="bento-card stats-medium">
          <div className="card-top">
            <div className="card-label">Total Revenue</div>
            <div className="card-icon-wrap" style={{ color: '#f59e0b' }}><Wallet size={18} /></div>
          </div>
          <div>
            <div className="card-value">₹{(stats?.revenue / 1000).toFixed(1)}k</div>
            <div className="card-status positive"><TrendingUp size={12} /> Live Assets</div>
          </div>
        </div>

        <div className="bento-card stats-medium">
          <div className="card-top">
            <div className="card-label">Live Rooms</div>
            <div className="card-icon-wrap" style={{ color: '#10b981' }}><Activity size={18} /></div>
          </div>
          <div>
            <div className="card-value">{stats?.roomCount || 0}</div>
            <div className="card-status">Active now</div>
          </div>
        </div>

        <div className="bento-card stats-medium">
          <div className="card-top">
            <div className="card-label">Pending Hosts</div>
            <div className="card-icon-wrap" style={{ color: '#ef4444' }}><UserCheck size={18} /></div>
          </div>
          <div>
            <div className="card-value">{stats?.pendingHosts || 0}</div>
            <div className="card-status clickable" style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>Review Queue</div>
          </div>
        </div>

        {/* Leaderboard - Full Width */}
        <div className="bento-card leaderboard-wide">
          <div className="card-top">
            <div className="flex items-center gap-2">
              <Trophy size={20} style={{ color: '#fbbf24' }} />
              <span style={{ fontWeight: 900 }}>Top Contributors</span>
            </div>
            <div className="toggle-group" style={{ display: 'flex', background: '#f8fafc', padding: '3px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              {(['DAILY', 'WEEKLY', 'ALL_TIME'] as const).map(p => (
                <button 
                  key={p}
                  className={period === p ? 'active' : ''} 
                  onClick={() => setPeriod(p)}
                  style={{ 
                    padding: '4px 12px', 
                    fontSize: '0.65rem', 
                    borderRadius: '7px',
                    border: 'none',
                    background: period === p ? '#fff' : 'transparent',
                    boxShadow: period === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {leaderboard.map((user, idx) => (
              <div key={user.userId} className="leader-row">
                <div className="flex items-center gap-3">
                  <div className="rank-pill" style={{ background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#92400e' : '#f1f5f9', color: idx < 3 ? '#fff' : '#64748b' }}>
                    {idx + 1}
                  </div>
                  <div className="avatar-neon" style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {user.avatar ? <img src={user.avatar} alt="" /> : (user.name?.[0] || 'U')}
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{user.name}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>LVL {user.level}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{user.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
