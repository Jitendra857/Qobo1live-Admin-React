import React, { useState, useEffect } from 'react';
import { 
  Users, Gift, Crown, Wallet, Activity, TrendingUp, 
  ArrowUpRight, Clock, ShieldCheck, Zap, Star, Trophy,
  UserCheck, Heart, Layout, Calendar, Globe
} from 'lucide-react';
import { adminService } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    roomCount: 0,
    pendingHosts: 0
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('DAILY');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.data.statusCode === 1) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Dashboard Stats Fetch Error:', err);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await adminService.getLeaderboard('GIFTER', period);
        if (res.data.statusCode === 1) {
          setLeaderboard(res.data.data);
        }
      } catch (err) {
        console.error('Leaderboard Fetch Error:', err);
      }
    };

    fetchStats();
    fetchLeaderboard();
  }, [period]);

  const growthData = [
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 600 },
    { name: 'Wed', users: 800 },
    { name: 'Thu', users: 700 },
    { name: 'Fri', users: 1100 },
    { name: 'Sat', users: 1300 },
    { name: 'Sun', users: 1500 },
  ];

  return (
    <div className="dashboard-page">
      {/* Premium Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button className="sync-btn primary">
            <Zap size={18} strokeWidth={2.5} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      <div className="bento-grid">
        {/* Main Growth Chart */}
        <div className="bento-card chart-large">
          <div className="card-top">
            <div className="card-info">
              <div className="card-label">Network Growth</div>
              <div className="card-title">User Acquisition Trend</div>
            </div>
            <div className="card-icon-wrap primary">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="users" stroke="var(--accent-purple)" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Stat Cards */}
        <div className="bento-card stats-small">
          <div className="card-top">
            <div className="card-label">Total Users</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}><Users size={18} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats?.totalUsers.toLocaleString()}</div>
            <div className="card-status positive">
              <ArrowUpRight size={14} />
              <span>+12% this week</span>
            </div>
          </div>
        </div>

        <div className="bento-card stats-small">
          <div className="card-top">
            <div className="card-label">Active Now</div>
            <div className="card-icon-wrap" style={{ color: '#10b981' }}><Activity size={18} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats?.activeUsers}</div>
            <div className="card-status positive live">
              <span className="live-dot"></span>
              <span>Real-time</span>
            </div>
          </div>
        </div>

        <div className="bento-card stats-small">
          <div className="card-top">
            <div className="card-label">Total Revenue</div>
            <div className="card-icon-wrap" style={{ color: '#f59e0b' }}><Wallet size={18} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">₹{((stats?.revenue || 0) / 1000).toFixed(1)}k</div>
            <div className="card-status positive">
              <TrendingUp size={14} />
              <span>On target</span>
            </div>
          </div>
        </div>

        <div className="bento-card stats-small">
          <div className="card-top">
            <div className="card-label">Pending Review</div>
            <div className="card-icon-wrap" style={{ color: '#ef4444' }}><ShieldCheck size={18} /></div>
          </div>
          <div className="card-body">
            <div className="card-value">{stats?.pendingHosts}</div>
            <div className="card-status warning">Needs Attention</div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bento-card leaderboard-wide">
          <div className="card-top">
            <div className="flex items-center gap-3">
              <Trophy size={24} style={{ color: '#fbbf24' }} />
              <div className="flex flex-col">
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Elite Contributors</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ranking based on platform engagement</span>
              </div>
            </div>
            <div className="toggle-group">
              {(['DAILY', 'WEEKLY', 'ALL_TIME'] as const).map(p => (
                <button 
                  key={p}
                  className={period === p ? 'active' : ''} 
                  onClick={() => setPeriod(p)}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="leaderboard-grid">
            {leaderboard.map((user, idx) => (
              <div key={user.userId} className="leader-row">
                <div className="user-info">
                  <div className="rank-badge" data-rank={idx + 1}>
                    {idx < 3 ? <Star size={14} fill="currentColor" /> : idx + 1}
                  </div>
                  <div className="avatar-neon">
                    {user.avatar ? <img src={user.avatar} alt="" /> : (user.name?.[0] || 'U')}
                  </div>
                  <div className="user-meta">
                    <span className="user-name">{user.name}</span>
                    <span className="user-lvl">Level {user.level}</span>
                  </div>
                </div>
                <div className="user-stats">
                  <div className="user-amount">₹{user.amount.toLocaleString()}</div>
                  <div className="progress-mini">
                    <div className="progress-bar" style={{ width: `${100 - idx * 15}%` }}></div>
                  </div>
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
