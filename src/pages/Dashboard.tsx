import React, { useState, useEffect } from 'react';
import { 
  Users, Gift, Crown, Wallet, Activity, TrendingUp, 
  ArrowUpRight, Clock, ShieldCheck, Zap, Star, Trophy,
  UserCheck, Heart, Layout, Calendar, Globe,
  Package, CheckCircle, Tag, RotateCcw, Trash2, Wrench, ChevronRight,
  Ban, Target, ShieldAlert, Sparkles
} from 'lucide-react';
import { adminService } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const role = currentUser?.role || 'admin';

  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('DAILY');
  const [chartMetric, setChartMetric] = useState<'users' | 'revenue'>('users');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let res;
        if (role === 'super_admin') {
          res = await adminService.getSuperAdminDashboard();
        } else if (role === 'agency') {
          res = await adminService.getAgencyDashboard();
        } else {
          res = await adminService.getStats();
        }
        if (res && res.data.statusCode === 1) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Dashboard Stats Fetch Error:', err);
      }
    };
    fetchStats();
  }, [role]);

  const growthData = [
    { name: 'Mon', users: 420, revenue: 1200 },
    { name: 'Tue', users: 680, revenue: 2100 },
    { name: 'Wed', users: 890, revenue: 3400 },
    { name: 'Thu', users: 750, revenue: 2900 },
    { name: 'Fri', users: 1180, revenue: 4800 },
    { name: 'Sat', users: 1420, revenue: 5900 },
    { name: 'Sun', users: 1650, revenue: 7200 },
  ];

  const distributionData = [
    { name: 'Standard', value: 450 },
    { name: 'VIP', value: 320 },
    { name: 'Creators', value: 210 },
    { name: 'Moderators', value: 120 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  // Dynamic Card Mappings based on role
  const getCardData = () => {
    if (role === 'super_admin') {
      return [
        { label: 'TOTAL AGENCIES', value: stats?.totalAgencies || 0, change: '+12%', color: 'blue', icon: <Users size={26} /> },
        { label: 'ACTIVE HOSTS', value: stats?.activeHosts || 0, change: '+18%', color: 'green', icon: <Activity size={26} /> },
        { label: 'PENDING HOSTS', value: stats?.pendingHosts || 0, change: 'Action Needed', color: 'purple', icon: <Crown size={26} /> },
        { label: 'TOTAL COMMISSIONS', value: `₹${(stats?.totalCommissions || 0).toLocaleString()}`, change: '+24%', color: 'gold', icon: <Wallet size={26} /> },
      ];
    }
    if (role === 'agency') {
      return [
        { label: 'AGENCY CODE', value: stats?.agency?.code || '—', sub: stats?.agency?.name, change: 'Active Network', color: 'blue', icon: <Users size={26} /> },
        { label: 'ACTIVE HOSTS', value: stats?.summary?.activeHosts || 0, change: '+15%', color: 'green', icon: <Activity size={26} /> },
        { label: 'PENDING APPLICATIONS', value: stats?.summary?.pendingHostApplications || 0, change: 'Review Required', color: 'purple', icon: <Crown size={26} /> },
        { label: 'TOTAL EARNINGS', value: `₹${(stats?.summary?.totalAgencyEarnings || 0).toLocaleString()}`, change: '+28%', color: 'gold', icon: <Wallet size={26} /> },
      ];
    }
    // Default: global Admin
    return [
      { label: 'TOTAL USERS', value: stats?.totalUsers?.toLocaleString() || 0, change: '+14%', color: 'blue', icon: <Users size={26} /> },
      { label: 'ACTIVE ROOMS', value: stats?.roomCount || 0, change: 'Live Now', color: 'green', icon: <Activity size={26} /> },
      { label: 'PENDING HOSTS', value: stats?.pendingHosts || 0, change: 'Review Required', color: 'purple', icon: <Crown size={26} /> },
      { label: 'DAILY EARNINGS', value: `₹${(stats?.revenue || 0).toLocaleString()}`, change: '+22%', color: 'gold', icon: <Wallet size={26} /> },
    ];
  };

  const cards = getCardData();

  return (
    <div className="dashboard-page fade-in">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="dashboard-header-new">
        <div>
          <div className="live-status-pill">
            <span className="pulse-dot"></span>
            <span>SYSTEM HEALTH OPERATIONAL</span>
          </div>
          <h1 className="dashboard-main-title">
            {role === 'super_admin' ? 'Super Admin Overview' : role === 'agency' ? 'Agency Control Hub' : 'System Overview'}
          </h1>
        </div>

        <div className="header-right-controls">
          <div className="period-selector">
            {(['DAILY', 'WEEKLY', 'ALL_TIME'] as const).map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'DAILY' ? 'Today' : p === 'WEEKLY' ? '7 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <div className="breadcrumb-pill">
            <span>Home</span>
            <ChevronRight size={13} style={{ opacity: 0.6 }} />
            <span className="active">Dashboard</span>
          </div>
        </div>
      </div>

      {/* ── Row 1: Primary Stats Cards ─────────────────────────────────────── */}
      <div className="stats-row">
        {cards.map((card, idx) => (
          <div className={`stat-card-new ${card.color}`} key={idx}>
            <div className="stat-header">
              <span className="stat-label-new">{card.label}</span>
              <div className={`stat-icon-wrapper ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="stat-body">
              <div className="stat-value-new">{card.value}</div>
              {card.sub && <div className="stat-sub">{card.sub}</div>}
              <div className="stat-badge-trend">
                <TrendingUp size={12} />
                <span>{card.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Ecosystem Pulse Cards ───────────────────────────────────── */}
      <div className="mini-stats-row-new">
        <div className="mini-card red">
          <div className="mini-icon-box red"><Ban size={18} /></div>
          <div>
            <div className="mini-num">84</div>
            <div className="mini-lbl">Active Bans</div>
          </div>
        </div>
        <div className="mini-card blue">
          <div className="mini-icon-box blue"><Target size={18} /></div>
          <div>
            <div className="mini-num">12</div>
            <div className="mini-lbl">Live PK Battles</div>
          </div>
        </div>
        <div className="mini-card purple">
          <div className="mini-icon-box purple"><Zap size={18} /></div>
          <div>
            <div className="mini-num">156</div>
            <div className="mini-lbl">Active System Bots</div>
          </div>
        </div>
        <div className="mini-card amber">
          <div className="mini-icon-box amber"><ShieldAlert size={18} /></div>
          <div>
            <div className="mini-num">12</div>
            <div className="mini-lbl">Pending Reports</div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Main Dynamic Charts ─────────────────────────────────────── */}
      <div className="charts-row">
        <div className="chart-card-new">
          <div className="chart-header-new">
            <div>
              <h3>Monthly Performance Trend</h3>
              <p>Real-time analytics and telemetry tracking</p>
            </div>
            <select 
              className="chart-select-new"
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value as any)}
            >
              <option value="users">User Growth</option>
              <option value="revenue">Revenue Trend (₹)</option>
            </select>
          </div>

          <div style={{ height: 320, width: '100%', marginTop: 15 }}>
            <ResponsiveContainer>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartMetric === 'users' ? '#3b82f6' : '#10b981'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartMetric === 'users' ? '#3b82f6' : '#10b981'} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: '16px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--card-shadow)',
                    fontWeight: 800
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke={chartMetric === 'users' ? '#3b82f6' : '#10b981'} 
                  fill="url(#areaGradient)" 
                  strokeWidth={3.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card-new">
          <div className="chart-header-new">
            <div>
              <h3>User Distribution</h3>
              <p>Breakdown by ecosystem tier</p>
            </div>
          </div>

          <div className="pie-chart-container" style={{ height: 320, width: '100%', position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={72}
                  outerRadius={102}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle" 
                  align="center" 
                  layout="horizontal" 
                  iconSize={10} 
                  wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontWeight: 800
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 4: Critical Alerts & Activity ──────────────────────────────── */}
      <div className="details-row">
        <div className="details-card-new">
          <div className="card-header-alert red">
            <div className="header-title-group">
              <ShieldCheck size={18} />
              <h3>Critical Alerts (System Health)</h3>
            </div>
            <span className="live-pulse-tag">Live Feed</span>
          </div>
          <div className="table-container" style={{ padding: '8px' }}>
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Time Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span style={{ fontWeight: 800 }}>Pending Host App</span></td>
                  <td>Riya Singh</td>
                  <td><span className="status-pill-ag pending">Review Needed</span></td>
                  <td><span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>2 Days left</span></td>
                </tr>
                <tr>
                  <td><span style={{ fontWeight: 800 }}>Withdrawal Request</span></td>
                  <td>User_8211</td>
                  <td><span className="status-pill-ag active">Processing</span></td>
                  <td><span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>12 Hours left</span></td>
                </tr>
                <tr>
                  <td><span style={{ fontWeight: 800 }}>Unresolved Report</span></td>
                  <td>Mod_Alpha</td>
                  <td><span className="status-pill-ag pending">Pending</span></td>
                  <td><span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>5 Hours left</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="details-card-new">
          <div className="card-header-alert blue">
            <div className="header-title-group">
              <RotateCcw size={18} />
              <h3>Recent Activity Feed</h3>
            </div>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon-wrap text-warning" style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '10px', color: '#f59e0b' }}><RotateCcw size={14} /></div>
              <div className="activity-content">
                <p><strong>Processed:</strong> Host application for Sonia Roy</p>
                <span>a day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon-wrap text-success" style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '10px', color: '#10b981' }}><ArrowUpRight size={14} /></div>
              <div className="activity-content">
                <p><strong>Revenue:</strong> ₹500 purchase by Alok Singh</p>
                <span>3 days ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon-wrap text-success" style={{ background: 'rgba(59,130,246,0.1)', padding: '8px', borderRadius: '10px', color: '#3b82f6' }}><Sparkles size={14} /></div>
              <div className="activity-content">
                <p><strong>System:</strong> New room 'Music Hub' created</p>
                <span>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 5: Top Agencies & Moderation Health ────────────────────────── */}
      <div className="details-row" style={{ marginTop: '20px' }}>
        <div className="details-card-new">
          <div className="card-header-alert blue">
            <div className="header-title-group">
              <Trophy size={18} />
              <h3>Top Performing Agencies</h3>
            </div>
          </div>
          <div className="leader-list-dash" style={{ padding: '8px 12px' }}>
            <div className="leader-item-dash">
              <span className="leader-rank-badge gold">01</span>
              <span className="leader-name-dash">Global Recruitment</span>
              <span className="leader-value-dash">₹1,24,500</span>
            </div>
            <div className="leader-item-dash">
              <span className="leader-rank-badge silver">02</span>
              <span className="leader-name-dash">Star Talent Agency</span>
              <span className="leader-value-dash">₹98,200</span>
            </div>
            <div className="leader-item-dash">
              <span className="leader-rank-badge bronze">03</span>
              <span className="leader-name-dash">Neo Media Hub</span>
              <span className="leader-value-dash">₹76,400</span>
            </div>
          </div>
        </div>

        <div className="details-card-new">
          <div className="card-header-alert red">
            <div className="header-title-group">
              <ShieldAlert size={18} />
              <h3>Moderation Health</h3>
            </div>
          </div>
          <div className="moderation-health-stats" style={{ padding: '16px' }}>
            <div className="progress-stat-group" style={{ padding: '0 0 16px 0' }}>
              <div className="progress-header">
                <span>Reports Resolved</span>
                <span>85%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner bg-primary" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="progress-stat-group" style={{ padding: '0 0 16px 0' }}>
              <div className="progress-header">
                <span>Keyword Filtering</span>
                <span>98%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner bg-success" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div className="progress-stat-group" style={{ padding: '0 0 16px 0' }}>
              <div className="progress-header">
                <span>Active Mutes</span>
                <span>24</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner bg-warning" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
