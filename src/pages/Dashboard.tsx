import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  Activity, Users, Gift, FileText, UserCheck, 
  Wallet, Image as ImageIcon, ArrowUpRight, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, pendingHosts: 0, giftCount: 0 });

  useEffect(() => {
    adminService.getStats().then(res => setStats(res.data.data));
  }, []);

  const growthData = [
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 600 },
    { name: 'Wed', users: 500 },
    { name: 'Thu', users: 900 },
    { name: 'Fri', users: 800 },
    { name: 'Sat', users: 1200 },
    { name: 'Sun', users: 1100 },
  ];

  const revenueData = [
    { name: 'Jan', val: 4000 },
    { name: 'Feb', val: 3000 },
    { name: 'Mar', val: 5000 },
    { name: 'Apr', val: 2780 },
    { name: 'May', val: 1890 },
    { name: 'Jun', val: 2390 },
  ];

  const barColors = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  return (
    <div className="user-management">
      <div className="header-actions">
        <h1 className="page-title">Analytics Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>System intelligence and traffic patterns</p>
      </div>

      <div className="bento-grid mt-10">
        {/* User Growth Chart - Spans 2x2 */}
        <div className="bento-card large">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Growth Metrics</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>User Acquisition</span>
            </div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Stats Highlights */}
        <div className="bento-card">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Users</span>
            </div>
            <div className="card-icon-wrap"><Users size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>{stats?.totalUsers || '1.2k'}</div>
            <div className="card-status" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 12px', borderRadius: '20px', width: 'fit-content', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowUpRight size={12} /> +24% 
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
             <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Revenue</span>
            </div>
            <div className="card-icon-wrap" style={{ color: '#f59e0b' }}><Wallet size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>₹{stats?.revenue || '0'}</div>
            <div className="card-status" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', padding: '6px 12px', borderRadius: '20px', width: 'fit-content', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Activity size={12} /> Active
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Host Apps</span>
            </div>
            <div className="card-icon-wrap"><FileText size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>{stats?.pendingHosts || '12'}</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gifts</span>
            </div>
            <div className="card-icon-wrap" style={{ color: '#ec4899' }}><Gift size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>{stats?.giftCount || '33'}</div>
          </div>
        </div>

        {/* Revenue Bar Chart - Wide */}
        <div className="bento-card wide">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Financial Pulse</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>Monthly Performance</span>
            </div>
          </div>
          <div className="chart-container" style={{ height: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <Bar dataKey="val" radius={[8, 8, 8, 8]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Agents</span>
            </div>
            <div className="card-icon-wrap"><UserCheck size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>08</div>
          </div>
        </div>

        <div className="bento-card">
          <div className="card-top">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ads</span>
            </div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}><ImageIcon size={20} /></div>
          </div>
          <div className="card-bottom">
            <div className="card-value" style={{ fontSize: '3rem' }}>15</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
