import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Activity, Users, TrendingUp, Clock, DollarSign, Search, Diamond, Coins, Building2
} from 'lucide-react';
import '../styles/UserManagement.css';

const PerformanceTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agencies' | 'hosts'>('hosts');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const [agenciesRes, hostsRes] = await Promise.all([
        adminService.getAgencyTracking(),
        adminService.getHostTracking()
      ]);
      
      let agencyData = agenciesRes.data.data || [];
      let hostData = hostsRes.data.data || [];

      // Dummy fallback data if DB is empty
      if (agencyData.length === 0) {
        agencyData = [
          { id: '1', name: 'Alpha Creators', code: 'ALP01', status: 'active', commissionRate: 0.1, totalHosts: 25, totalCommission: 4500.50 },
          { id: '2', name: 'Star Talent', code: 'STAR01', status: 'active', commissionRate: 0.15, totalHosts: 18, totalCommission: 3200.00 },
          { id: '3', name: 'Galaxy Media', code: 'GLX01', status: 'active', commissionRate: 0.12, totalHosts: 32, totalCommission: 6100.75 }
        ];
      }

      if (hostData.length === 0) {
        hostData = [
          { id: 'h1', name: 'Nadia Rahman', email: 'nadia.r@example.com', agencyCode: 'ALP01', coins: 15000, diamonds: 4500, totalStreamSeconds: 360000, totalCommissionEarned: 1200 },
          { id: 'h2', name: 'Priya Sharma', phone: '9111111111', agencyCode: 'STAR01', coins: 2500, diamonds: 800, totalStreamSeconds: 150000, totalCommissionEarned: 450 },
          { id: 'h3', name: 'Rahul Verma', email: 'rahul.v@example.com', agencyCode: 'GLX01', coins: 50000, diamonds: 12000, totalStreamSeconds: 850000, totalCommissionEarned: 3500 },
          { id: 'h4', name: 'Sarah Jones', phone: '8222222222', agencyCode: 'ALP01', coins: 1200, diamonds: 300, totalStreamSeconds: 45000, totalCommissionEarned: 150 }
        ];
      }

      setAgencies(agencyData);
      setHosts(hostData);
    } catch (err) {
      // Backend isn't deployed yet (404 error) - load dummy data so user can preview UI
      toast.success('Preview Mode: Showing Dummy Data');
      setAgencies([
        { id: '1', name: 'Alpha Creators', code: 'ALP01', status: 'active', commissionRate: 0.1, totalHosts: 25, totalCommission: 4500.50 },
        { id: '2', name: 'Star Talent', code: 'STAR01', status: 'active', commissionRate: 0.15, totalHosts: 18, totalCommission: 3200.00 },
        { id: '3', name: 'Galaxy Media', code: 'GLX01', status: 'active', commissionRate: 0.12, totalHosts: 32, totalCommission: 6100.75 }
      ]);
      setHosts([
        { id: 'h1', name: 'Nadia Rahman', email: 'nadia.r@example.com', agencyCode: 'ALP01', coins: 15000, diamonds: 4500, totalStreamSeconds: 360000, totalCommissionEarned: 1200 },
        { id: 'h2', name: 'Priya Sharma', phone: '9111111111', agencyCode: 'STAR01', coins: 2500, diamonds: 800, totalStreamSeconds: 150000, totalCommissionEarned: 450 },
        { id: 'h3', name: 'Rahul Verma', email: 'rahul.v@example.com', agencyCode: 'GLX01', coins: 50000, diamonds: 12000, totalStreamSeconds: 850000, totalCommissionEarned: 3500 },
        { id: 'h4', name: 'Sarah Jones', phone: '8222222222', agencyCode: 'ALP01', coins: 1200, diamonds: 300, totalStreamSeconds: 45000, totalCommissionEarned: 150 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0h 0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const filteredHosts = hosts.filter(h => 
    (h.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (h.agencyCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredAgencies = agencies.filter(a => 
    (a.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(90deg, #1e293b, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Performance Tracking</h1>
          <p className="page-subtitle" style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px' }}>Monitor agency yields and host broadcasting metrics globally.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '14px', color: '#3b82f6' }}>
            <Users size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{hosts.length}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>Tracked Hosts</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '14px', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{agencies.length}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>Tracked Agencies</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '14px', color: '#8b5cf6' }}>
            <Clock size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{formatDuration(hosts.reduce((acc, h) => acc + (h.totalStreamSeconds || 0), 0))}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>Global Stream Time</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '14px', color: '#f59e0b' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>₹{agencies.reduce((acc, a) => acc + (a.totalCommission || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>Gross Commission</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', width: '100%' }}>
            <button
              className={`tab-btn ${activeTab === 'hosts' ? 'active' : ''}`}
              onClick={() => setActiveTab('hosts')}
              style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'hosts' ? '2px solid #4e73df' : '2px solid transparent', color: activeTab === 'hosts' ? '#4e73df' : '#64748b', fontWeight: activeTab === 'hosts' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Activity size={18} /> Host Performance
            </button>
            <button
              className={`tab-btn ${activeTab === 'agencies' ? 'active' : ''}`}
              onClick={() => setActiveTab('agencies')}
              style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'agencies' ? '2px solid #4e73df' : '2px solid transparent', color: activeTab === 'agencies' ? '#4e73df' : '#64748b', fontWeight: activeTab === 'agencies' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Building2 size={18} /> Agency Aggregates
            </button>
          </div>
        </div>

        <div className="search-bar" style={{ margin: '20px 24px 0', maxWidth: '350px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#1e293b' }}
          />
        </div>

        <div className="table-responsive" style={{ marginTop: '20px' }}>
          {loading ? (
            <div className="flex-center" style={{ padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : activeTab === 'hosts' ? (
            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Host</th>
                  <th>Agency Code</th>
                  <th>Assets (Coins/Diamonds)</th>
                  <th>Watch Time (Streamed)</th>
                  <th>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center">No hosts tracked</td></tr>
                ) : (
                  filteredHosts.map((host, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{host.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{host.email || host.phone}</div>
                      </td>
                      <td>
                        {host.agencyCode ? (
                          <span className="badge badge-blue">{host.agencyCode}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
                            <Coins size={14} /> {host.coins}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontWeight: 600 }}>
                            <Diamond size={14} /> {host.diamonds}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                          <Clock size={16} color="#94a3b8" />
                          {formatDuration(host.totalStreamSeconds)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>
                          ₹{host.totalCommissionEarned?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Agency</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Total Active Hosts</th>
                  <th>Commission Rate</th>
                  <th>Total Commission generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.length === 0 ? (
                  <tr><td colSpan={7} className="text-center">No agencies tracked</td></tr>
                ) : (
                  filteredAgencies.map((agency, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{agency.name}</div>
                      </td>
                      <td><span className="badge badge-purple">{agency.code}</span></td>
                      <td>
                        <span className={`badge ${agency.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                          {agency.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                          <Users size={16} color="#4e73df" />
                          {agency.totalHosts}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                          {agency.commissionRate * 100}%
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>
                          ₹{agency.totalCommission?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="action-btn"
                          style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSearch(agency.code);
                            setActiveTab('hosts');
                          }}
                        >
                          <Search size={14} /> View Hosts
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
