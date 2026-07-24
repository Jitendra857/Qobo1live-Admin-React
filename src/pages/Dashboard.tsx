import React, { useState, useEffect } from 'react';
import { 
  Users, Gift, Crown, Wallet, Activity, TrendingUp, 
  ArrowUpRight, Clock, ShieldCheck, Zap, Star, Trophy,
  UserCheck, Heart, Layout, Calendar, Globe,
  Package, CheckCircle, Tag, RotateCcw, Trash2, Wrench, ChevronRight,
  Ban, Target, ShieldAlert
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
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 600 },
    { name: 'Wed', users: 800 },
    { name: 'Thu', users: 700 },
    { name: 'Fri', users: 1100 },
    { name: 'Sat', users: 1300 },
    { name: 'Sun', users: 1500 },
  ];

  const distributionData = [
    { name: 'Standard', value: 400 },
    { name: 'VIP', value: 300 },
    { name: 'Creators', value: 200 },
    { name: 'Moderators', value: 100 },
  ];

  const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'];

  // Dynamic Card Mappings based on role
  const getCardData = () => {
    if (role === 'super_admin') {
      return [
        { label: 'TOTAL AGENCIES', value: stats?.totalAgencies || 0, color: 'blue', icon: <Users size={28} /> },
        { label: 'ACTIVE HOSTS', value: stats?.activeHosts || 0, color: 'green', icon: <Activity size={28} /> },
        { label: 'PENDING HOSTS', value: stats?.pendingHosts || 0, color: 'purple', icon: <Crown size={28} /> },
        { label: 'TOTAL COMMISSIONS', value: `₹${(stats?.totalCommissions || 0).toLocaleString()}`, color: 'gold', icon: <Wallet size={28} /> },
      ];
    }
    if (role === 'agency') {
      return [
        { label: 'AGENCY CODE', value: stats?.agency?.code || '—', sub: stats?.agency?.name, color: 'blue', icon: <Users size={28} /> },
        { label: 'ACTIVE HOSTS', value: stats?.summary?.activeHosts || 0, color: 'green', icon: <Activity size={28} /> },
        { label: 'PENDING APPLICATIONS', value: stats?.summary?.pendingHostApplications || 0, color: 'purple', icon: <Crown size={28} /> },
        { label: 'TOTAL EARNINGS', value: `₹${(stats?.summary?.totalAgencyEarnings || 0).toLocaleString()}`, color: 'gold', icon: <Wallet size={28} /> },
      ];
    }
    // Default: global Admin
    return [
      { label: 'TOTAL USERS', value: stats?.totalUsers?.toLocaleString() || 0, color: 'blue', icon: <Users size={28} /> },
      { label: 'ACTIVE ROOMS', value: stats?.roomCount || 0, color: 'green', icon: <Activity size={28} /> },
      { label: 'PENDING HOSTS', value: stats?.pendingHosts || 0, color: 'purple', icon: <Crown size={28} /> },
      { label: 'DAILY EARNINGS', value: `₹${(stats?.revenue || 0).toLocaleString()}`, color: 'gold', icon: <Wallet size={28} /> },
    ];
  };

  const cards = getCardData();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>{role === 'super_admin' ? 'Super Admin Overview' : role === 'agency' ? 'Agency Overview' : 'Site Overview'}</h1>
        <div className="breadcrumb">
          <span>Home</span> <ChevronRight size={14} style={{ verticalAlign: 'middle', margin: '0 4px' }} /> Dashboard
        </div>
      </div>

      {/* Row 1: Primary Stats */}
      <div className="stats-row">
        {cards.map((card, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-info">
              <span className={`label label-${card.color}`}>{card.label}</span>
              <span className="value" style={{ fontSize: card.sub ? '1.4rem' : '1.8rem' }}>{card.value}</span>
              {card.sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px', display: 'block' }}>{card.sub}</span>}
            </div>
            <div className={`stat-icon stat-icon-${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Mini Ecosystem Pulse */}
      <div className="mini-stats-row">
        <div className="mini-stat-card">
          <div className="mini-stat-icon red"><Ban size={18} /></div>
          <div className="mini-stat-info">
            <span className="mini-label">Active Bans</span>
            <span className="mini-value">84</span>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon blue"><Target size={18} /></div>
          <div className="mini-stat-info">
            <span className="mini-label">PK Battles</span>
            <span className="mini-value">12</span>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon purple"><Zap size={18} /></div>
          <div className="mini-stat-info">
            <span className="mini-label">Active Bots</span>
            <span className="mini-value">156</span>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon orange"><ShieldAlert size={18} /></div>
          <div className="mini-stat-info">
            <span className="mini-label">Pending Reports</span>
            <span className="mini-value">12</span>
          </div>
        </div>
      </div>

      {/* Row 3: Main Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Trend</h3>
            <select className="chart-select">
              <option>User Growth</option>
              <option>Revenue Trend</option>
            </select>
          </div>
          <div style={{ height: 320, width: '100%', marginTop: 20 }}>
            <ResponsiveContainer>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Area type="monotone" dataKey="users" stroke="var(--accent-primary)" fill="var(--accent-glow)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>User Distribution</h3>
          </div>
          <div className="pie-chart-container" style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" align="center" layout="horizontal" iconSize={12} wrapperStyle={{ paddingTop: 20, fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Critical Alerts & Activity */}
      <div className="details-row">
        <div className="details-card">
          <div className="card-header-alert red">
            <div className="header-title-group">
              <ShieldCheck size={18} />
              <h3>Critical Alerts (System Health)</h3>
            </div>
            <button className="icon-btn"><Layout size={14} /></button>
          </div>
          <div className="table-container">
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
                  <td>Pending Host App</td>
                  <td>Riya Singh</td>
                  <td><span className="text-warning">Review Needed</span></td>
                  <td>2 Days left</td>
                </tr>
                <tr>
                  <td>Withdrawal Request</td>
                  <td>User_8211</td>
                  <td><span className="text-info">Processing</span></td>
                  <td>12 Hours left</td>
                </tr>
                <tr>
                  <td>Unresolved Report</td>
                  <td>Mod_Alpha</td>
                  <td><span className="text-warning">Pending</span></td>
                  <td>5 Hours left</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header-alert blue">
            <div className="header-title-group">
              <RotateCcw size={18} />
              <h3>Recent Activity Feed</h3>
            </div>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon-wrap text-warning"><RotateCcw size={14} /></div>
              <div className="activity-content">
                <p><strong>Processed:</strong> Host application for Sonia Roy</p>
                <span>a day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon-wrap text-success"><ArrowUpRight size={14} /></div>
              <div className="activity-content">
                <p><strong>Revenue:</strong> ₹500 purchase by Alok Singh</p>
                <span>3 days ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon-wrap text-success"><ArrowUpRight size={14} /></div>
              <div className="activity-content">
                <p><strong>System:</strong> New room 'Music Hub' created</p>
                <span>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Agency Hub & Moderation Health */}
      <div className="details-row">
        <div className="details-card">
          <div className="card-header-alert blue">
            <div className="header-title-group">
              <Trophy size={18} />
              <h3>Top Performing Agencies</h3>
            </div>
          </div>
          <div className="leader-list-dash">
            <div className="leader-item-dash">
              <span className="leader-rank-dash">01</span>
              <span className="leader-name-dash">Global Recruitment</span>
              <span className="leader-value-dash">₹1,24,500</span>
            </div>
            <div className="leader-item-dash">
              <span className="leader-rank-dash">02</span>
              <span className="leader-name-dash">Star Talent Agency</span>
              <span className="leader-value-dash">₹98,200</span>
            </div>
            <div className="leader-item-dash">
              <span className="leader-rank-dash">03</span>
              <span className="leader-name-dash">Neo Media Hub</span>
              <span className="leader-value-dash">₹76,400</span>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header-alert red">
            <div className="header-title-group">
              <ShieldAlert size={18} />
              <h3>Moderation Health</h3>
            </div>
          </div>
          <div className="moderation-health-stats">
            <div className="section-title-dash">Compliance Metrics</div>
            <div className="progress-stat-group">
              <div className="progress-header">
                <span>Reports Resolved</span>
                <span>85%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner bg-primary" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="progress-stat-group">
              <div className="progress-header">
                <span>Keyword Filtering</span>
                <span>98%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner bg-success" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div className="progress-stat-group">
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
