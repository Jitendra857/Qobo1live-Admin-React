import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Gift, Crown, Wallet, Activity, TrendingUp, 
  ArrowUpRight, Clock, ShieldCheck, Zap, Star, Trophy,
  UserCheck, Heart, Layout, Calendar, Globe,
  Package, CheckCircle, Tag, RotateCcw, Trash2, Wrench, ChevronRight,
  Ban, Target, ShieldAlert, Sparkles, Building2, Radio, Tv, Coins,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const role = currentUser?.role || 'admin';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('DAILY');
  const [chartMetric, setChartMetric] = useState<'users' | 'revenue'>('users');

  const fetchStats = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  // Dynamic Card Mappings based on role with clear labels and navigation
  const getCardData = () => {
    if (role === 'agency') {
      return [
        { label: 'AGENCY CODE', value: stats?.agency?.code || '—', sub: stats?.agency?.name, change: 'Active Network', color: 'blue', icon: <Building2 size={26} />, path: '/host-registry' },
        { label: 'TOTAL HOSTS', value: stats?.summary?.activeHosts || 0, sub: 'Active Talent', change: '+15%', color: 'green', icon: <UserCheck size={26} />, path: '/host-registry' },
        { label: 'PENDING APPLICATIONS', value: stats?.summary?.pendingHostApplications || 0, sub: 'Review Required', change: 'Action Needed', color: 'purple', icon: <Crown size={26} />, path: '/host-registry' },
        { label: 'TOTAL EARNINGS', value: `₹${(stats?.summary?.totalAgencyEarnings || 0).toLocaleString()}`, sub: 'Commission Balance', change: '+28%', color: 'gold', icon: <Wallet size={26} />, path: '/economy' },
        { label: 'TOTAL TASKS', value: stats?.totalTasks || 0, sub: 'Active Missions', change: 'Ecosystem Tasks', color: 'rose', icon: <Target size={26} />, path: '/dynamic-tasks' },
        { label: 'TOTAL GIFTS', value: stats?.totalGifts || stats?.giftCount || 0, sub: 'Rewards Store', change: 'Gift Catalog', color: 'cyan', icon: <Gift size={26} />, path: '/gifts' },
      ];
    }
    // Default Admin & Super Admin: Shows all requested core application entities
    return [
      { 
        label: 'TOTAL AGENCY', 
        value: stats?.totalAgencies ?? 0, 
        sub: `${stats?.activeAgencies ?? stats?.totalAgencies ?? 0} Approved / Active`, 
        change: 'Agencies Network', 
        color: 'blue', 
        icon: <Building2 size={26} />,
        path: '/agents'
      },
      { 
        label: 'TOTAL HOST', 
        value: stats?.totalHosts ?? stats?.activeHosts ?? 0, 
        sub: `${stats?.pendingHosts ?? 0} Pending Approvals`, 
        change: 'Talent Network', 
        color: 'green', 
        icon: <UserCheck size={26} />,
        path: '/host-registry'
      },
      { 
        label: 'TOTAL USER', 
        value: (stats?.totalUsers ?? 0).toLocaleString(), 
        sub: `${stats?.activeUsers ?? 0} Active Community`, 
        change: '+14% Growth', 
        color: 'purple', 
        icon: <Users size={26} />,
        path: '/users'
      },
      { 
        label: 'TOTAL SUPER ADMIN', 
        value: stats?.totalSuperAdmins ?? 1, 
        sub: 'Platform Master Admins', 
        change: 'System Staff', 
        color: 'cyan', 
        icon: <ShieldCheck size={26} />,
        path: '/super-admin-forms'
      },
      { 
        label: 'TOTAL TASK', 
        value: stats?.totalTasks ?? 0, 
        sub: 'Daily & Dynamic Tasks', 
        change: 'Mission Center', 
        color: 'rose', 
        icon: <Target size={26} />,
        path: '/dynamic-tasks'
      },
      { 
        label: 'TOTAL GIFT', 
        value: stats?.totalGifts ?? stats?.giftCount ?? 0, 
        sub: 'Virtual Rewards Catalog', 
        change: 'Store Active', 
        color: 'gold', 
        icon: <Gift size={26} />,
        path: '/gifts'
      },
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
            {role === 'super_admin' ? 'Super Admin Dashboard' : role === 'agency' ? 'Agency Dashboard' : 'System Dashboard'}
          </h1>
        </div>

        <div className="header-right-controls">
          <button 
            className="period-btn" 
            onClick={fetchStats} 
            title="Refresh dashboard metrics"
            disabled={loading}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--glass-border)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

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

      {/* ── Quick Navigation Shortcuts ──────────────────────────────────────── */}
      <div className="quick-nav-row">
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '4px' }}>
          Quick Jump:
        </span>
        <button className="quick-nav-chip" onClick={() => navigate('/agents')}><Building2 size={13} /> Agencies</button>
        <button className="quick-nav-chip" onClick={() => navigate('/host-registry')}><UserCheck size={13} /> Hosts</button>
        <button className="quick-nav-chip" onClick={() => navigate('/users')}><Users size={13} /> Users</button>
        <button className="quick-nav-chip" onClick={() => navigate('/super-admin-forms')}><ShieldCheck size={13} /> Super Admins</button>
        <button className="quick-nav-chip" onClick={() => navigate('/dynamic-tasks')}><Target size={13} /> Tasks</button>
        <button className="quick-nav-chip" onClick={() => navigate('/gifts')}><Gift size={13} /> Gifts</button>
        <button className="quick-nav-chip" onClick={() => navigate('/audio-rooms')}><Radio size={13} /> Rooms</button>
        <button className="quick-nav-chip" onClick={() => navigate('/coins-seller-requests')}><Coins size={13} /> Coins Sellers</button>
        <button className="quick-nav-chip" onClick={() => navigate('/withdrawals')}><Wallet size={13} /> Withdrawals</button>
        <button className="quick-nav-chip" onClick={() => navigate('/moderation')}><ShieldAlert size={13} /> Moderation</button>
      </div>

      {/* ── Row 1: Primary Stats Cards (Core Application Entities) ─────────── */}
      <div className="stats-row">
        {cards.map((card, idx) => (
          <div 
            className={`stat-card-new ${card.color} clickable`} 
            key={idx}
            onClick={() => card.path && navigate(card.path)}
            title={`View ${card.label}`}
          >
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

      {/* ── Row 2: Real-time Application Operations & Tracking ──────────────── */}
      <div className="dashboard-section-header">
        <div className="section-title-tag">
          <Zap size={15} />
          <span>Real-time Application Operations & Tracking</span>
        </div>
      </div>

      <div className="mini-stats-row-new">
        <div className="mini-card green clickable" onClick={() => navigate('/audio-rooms')} title="View Active Voice Rooms">
          <div className="mini-icon-box green"><Radio size={18} /></div>
          <div>
            <div className="mini-num">{stats?.activeRooms ?? stats?.roomCount ?? 0}</div>
            <div className="mini-lbl">Active Audio Rooms</div>
            <div className="mini-sub">{stats?.roomCount ?? 0} Total Rooms</div>
          </div>
        </div>

        <div className="mini-card blue clickable" onClick={() => navigate('/live-streams')} title="View Live Video Broadcasts">
          <div className="mini-icon-box blue"><Tv size={18} /></div>
          <div>
            <div className="mini-num">{stats?.activeLiveStreams ?? stats?.totalLiveStreams ?? 0}</div>
            <div className="mini-lbl">Live Streams</div>
            <div className="mini-sub">{stats?.totalLiveStreams ?? 0} Total Streams</div>
          </div>
        </div>

        <div className="mini-card amber clickable" onClick={() => navigate('/coins-seller-requests')} title="View Coins Sellers">
          <div className="mini-icon-box amber"><Coins size={18} /></div>
          <div>
            <div className="mini-num">{stats?.totalCoinsSellers ?? 0}</div>
            <div className="mini-lbl">Total Coins Sellers</div>
            <div className="mini-sub">Merchant Distributors</div>
          </div>
        </div>

        <div className="mini-card purple clickable" onClick={() => navigate('/vip-store')} title="View VIP Members">
          <div className="mini-icon-box purple"><Crown size={18} /></div>
          <div>
            <div className="mini-num">{stats?.totalVipUsers ?? 0}</div>
            <div className="mini-lbl">VIP Members</div>
            <div className="mini-sub">Subscribers & Packages</div>
          </div>
        </div>

        <div className="mini-card red clickable" onClick={() => navigate('/withdrawals')} title="View Pending Withdrawals">
          <div className="mini-icon-box red"><Wallet size={18} /></div>
          <div>
            <div className="mini-num">{stats?.pendingWithdrawals ?? 0}</div>
            <div className="mini-lbl">Pending Withdrawals</div>
            <div className="mini-sub">Payout Approvals</div>
          </div>
        </div>

        <div className="mini-card amber clickable" onClick={() => navigate('/host-registry')} title="View Pending Host Applications">
          <div className="mini-icon-box amber"><Clock size={18} /></div>
          <div>
            <div className="mini-num">{stats?.pendingHosts ?? 0}</div>
            <div className="mini-lbl">Pending Hosts</div>
            <div className="mini-sub">Candidate Reviews</div>
          </div>
        </div>

        <div className="mini-card red clickable" onClick={() => navigate('/moderation')} title="View Moderation Reports">
          <div className="mini-icon-box red"><ShieldAlert size={18} /></div>
          <div>
            <div className="mini-num">{stats?.pendingReports ?? 0}</div>
            <div className="mini-lbl">Moderation Reports</div>
            <div className="mini-sub">Flagged User Issues</div>
          </div>
        </div>

        <div className="mini-card green clickable" onClick={() => navigate('/economy')} title="View Platform Revenue">
          <div className="mini-icon-box green"><TrendingUp size={18} /></div>
          <div>
            <div className="mini-num">₹{(stats?.revenue ?? stats?.totalCommissions ?? 0).toLocaleString()}</div>
            <div className="mini-lbl">Platform Revenue</div>
            <div className="mini-sub">Total Monetary Inflow</div>
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
