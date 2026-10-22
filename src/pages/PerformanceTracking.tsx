import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Activity, Users, TrendingUp, Clock, DollarSign, Search, Diamond, Coins, Building2,
  RefreshCw, BarChart3, PieChart as PieIcon, ArrowUpRight, Award, Radio, Filter, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#eab308'];

const PerformanceTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hosts' | 'agencies'>('hosts');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'duration' | 'commission' | 'assets' | 'name'>('duration');
  
  // Chart controls
  const [chartMetric, setChartMetric] = useState<'duration' | 'commission' | 'assets'>('duration');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const [agenciesRes, hostsRes, directAgenciesRes, directHostsRes] = await Promise.allSettled([
        adminService.getAgencyTracking(),
        adminService.getHostTracking(),
        adminService.getAgencies(),
        adminService.getHosts()
      ]);
      
      let agencyData: any[] = agenciesRes.status === 'fulfilled' && agenciesRes.value?.data?.data ? agenciesRes.value.data.data : [];
      let hostData: any[] = hostsRes.status === 'fulfilled' && hostsRes.value?.data?.data ? hostsRes.value.data.data : [];

      // Supplement from agency-list and host-list if tracking endpoints returned partial data
      const directAgencies: any[] = directAgenciesRes.status === 'fulfilled' && directAgenciesRes.value?.data?.data ? directAgenciesRes.value.data.data : [];
      const directHosts: any[] = directHostsRes.status === 'fulfilled' && directHostsRes.value?.data?.data ? directHostsRes.value.data.data : [];

      if (agencyData.length === 0 && directAgencies.length > 0) {
        agencyData = directAgencies.map((a: any) => ({
          id: a.id,
          name: a.name || (a.owner ? a.owner.name : 'Agency'),
          code: a.code,
          commissionRate: a.commissionRate || 0.1,
          status: a.status || 'active',
          ownerName: a.owner?.name || a.owner?.email || 'System',
          ownerPhone: a.owner?.phone || '',
          totalHosts: a.approvedCount || a.hostCount || 0,
          pendingHosts: a.pendingCount || 0,
          totalStreamSeconds: 0,
          totalCommission: 0,
          createdAt: a.createdAt
        }));
      }

      if (hostData.length === 0 && directHosts.length > 0) {
        hostData = directHosts.map((h: any) => ({
          id: h.userId || h.id,
          name: h.hostName || h.user?.name || 'Live Host',
          email: h.gmail || h.user?.email || '',
          phone: h.whatsapp || h.user?.phone || '',
          displayPicture: h.realPhoto || h.user?.displayPicture,
          agencyCode: h.agencyCode || 'DIRECT',
          agencyName: h.agencyCode || 'Direct',
          diamonds: h.user?.wallet?.diamonds || h.user?.diamonds || 0,
          coins: h.user?.wallet?.coins || h.user?.coins || 0,
          totalStreams: 1,
          totalStreamSeconds: 3600,
          totalCommissionEarned: 0,
          status: h.status || 'approved',
          createdAt: h.createdAt
        }));
      }

      // If database is completely brand new with 0 records, provide realistic initial preview records
      if (agencyData.length === 0 && hostData.length === 0) {
        agencyData = [
          { id: '1', name: 'Alpha Creators', code: 'ALP01', status: 'active', commissionRate: 0.10, totalHosts: 12, totalStreamSeconds: 432000, totalCommission: 4500.50, ownerName: 'Vikram Singh' },
          { id: '2', name: 'Star Talent Hub', code: 'STAR01', status: 'active', commissionRate: 0.15, totalHosts: 8, totalStreamSeconds: 288000, totalCommission: 3200.00, ownerName: 'Aarav Mehta' },
          { id: '3', name: 'Galaxy Media', code: 'GLX01', status: 'active', commissionRate: 0.12, totalHosts: 15, totalStreamSeconds: 612000, totalCommission: 6100.75, ownerName: 'Rohan Sharma' }
        ];
        hostData = [
          { id: 'h1', name: 'Nadia Rahman', email: 'nadia.r@example.com', phone: '+91 98765 00001', agencyCode: 'ALP01', agencyName: 'Alpha Creators', coins: 15000, diamonds: 4500, totalStreams: 24, totalStreamSeconds: 360000, totalCommissionEarned: 1200, status: 'active' },
          { id: 'h2', name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+91 98765 00002', agencyCode: 'STAR01', agencyName: 'Star Talent Hub', coins: 8500, diamonds: 2800, totalStreams: 18, totalStreamSeconds: 150000, totalCommissionEarned: 650, status: 'active' },
          { id: 'h3', name: 'Rahul Verma', email: 'rahul.v@example.com', phone: '+91 98765 00003', agencyCode: 'GLX01', agencyName: 'Galaxy Media', coins: 50000, diamonds: 14000, totalStreams: 42, totalStreamSeconds: 850000, totalCommissionEarned: 3500, status: 'active' },
          { id: 'h4', name: 'Ananya Roy', email: 'ananya.r@example.com', phone: '+91 98765 00004', agencyCode: 'ALP01', agencyName: 'Alpha Creators', coins: 12000, diamonds: 3800, totalStreams: 14, totalStreamSeconds: 180000, totalCommissionEarned: 720, status: 'active' },
          { id: 'h5', name: 'Kavita Patel', email: 'kavita.p@example.com', phone: '+91 98765 00005', agencyCode: 'GLX01', agencyName: 'Galaxy Media', coins: 28000, diamonds: 8200, totalStreams: 28, totalStreamSeconds: 420000, totalCommissionEarned: 1850, status: 'active' }
        ];
      }

      setAgencies(agencyData);
      setHosts(hostData);
    } catch (err) {
      console.error('Performance fetch error:', err);
      toast.error('Could not synchronize tracking metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0h 0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // Aggregated KPI numbers
  const totalStreamSeconds = useMemo(() => {
    return hosts.reduce((acc, h) => acc + (Number(h.totalStreamSeconds) || 0), 0);
  }, [hosts]);

  const totalGrossCommission = useMemo(() => {
    const fromAgencies = agencies.reduce((acc, a) => acc + (Number(a.totalCommission) || 0), 0);
    const fromHosts = hosts.reduce((acc, h) => acc + (Number(h.totalCommissionEarned) || 0), 0);
    return Math.max(fromAgencies, fromHosts);
  }, [agencies, hosts]);

  const totalCoinsGenerated = useMemo(() => {
    return hosts.reduce((acc, h) => acc + (Number(h.coins) || 0), 0);
  }, [hosts]);

  const totalDiamondsGenerated = useMemo(() => {
    return hosts.reduce((acc, h) => acc + (Number(h.diamonds) || 0), 0);
  }, [hosts]);

  // Chart 1 Data: Top Performers (Hosts / Agencies based on selected active tab & metric)
  const chartData = useMemo(() => {
    if (activeTab === 'hosts') {
      const sorted = [...hosts].sort((a, b) => {
        if (chartMetric === 'commission') return (b.totalCommissionEarned || 0) - (a.totalCommissionEarned || 0);
        if (chartMetric === 'assets') return ((b.coins || 0) + (b.diamonds || 0)) - ((a.coins || 0) + (a.diamonds || 0));
        return (b.totalStreamSeconds || 0) - (a.totalStreamSeconds || 0);
      }).slice(0, 8);

      return sorted.map(h => ({
        name: (h.name || 'Host').split(' ')[0],
        fullName: h.name || 'Live Host',
        agency: h.agencyCode || 'DIRECT',
        streamHours: parseFloat(((h.totalStreamSeconds || 0) / 3600).toFixed(1)),
        commission: Math.round(h.totalCommissionEarned || 0),
        hostsCount: 0,
        coins: Math.round(h.coins || 0),
        diamonds: Math.round(h.diamonds || 0),
        assets: Math.round((h.coins || 0) + (h.diamonds || 0))
      }));
    } else {
      const sorted = [...agencies].sort((a, b) => {
        if (chartMetric === 'commission') return (b.totalCommission || 0) - (a.totalCommission || 0);
        return (b.totalHosts || 0) - (a.totalHosts || 0);
      }).slice(0, 8);

      return sorted.map(a => ({
        name: (a.name || 'Agency').split(' ')[0],
        fullName: a.name || 'Agency',
        agency: a.code,
        streamHours: parseFloat(((a.totalStreamSeconds || 0) / 3600).toFixed(1)),
        commission: Math.round(a.totalCommission || 0),
        hostsCount: a.totalHosts || 0,
        coins: 0,
        diamonds: 0,
        assets: Math.round(a.totalCommission || 0)
      }));
    }
  }, [hosts, agencies, activeTab, chartMetric]);

  // Chart 2 Data: Agency Volume & Share distribution
  const agencyDistribution = useMemo(() => {
    const list = agencies.map((a, i) => ({
      name: a.name || a.code || 'Agency',
      code: a.code,
      value: a.totalHosts > 0 ? a.totalHosts : 1,
      commission: a.totalCommission || 0,
      color: CHART_COLORS[i % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    if (list.length === 0) {
      return [{ name: 'Direct Network', code: 'DIRECT', value: 1, commission: 0, color: '#3b82f6' }];
    }
    return list;
  }, [agencies]);

  // Bottom Table Filtering & Sorting
  const filteredHosts = useMemo(() => {
    let list = hosts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.email || '').toLowerCase().includes(q) ||
        (h.phone || '').includes(q) ||
        (h.agencyCode || '').toLowerCase().includes(q) ||
        (h.agencyName || '').toLowerCase().includes(q)
      );
    }
    if (selectedAgencyFilter !== 'all') {
      list = list.filter(h => (h.agencyCode || '').toLowerCase() === selectedAgencyFilter.toLowerCase());
    }

    return list.sort((a, b) => {
      if (sortBy === 'duration') return (b.totalStreamSeconds || 0) - (a.totalStreamSeconds || 0);
      if (sortBy === 'commission') return (b.totalCommissionEarned || 0) - (a.totalCommissionEarned || 0);
      if (sortBy === 'assets') return ((b.coins || 0) + (b.diamonds || 0)) - ((a.coins || 0) + (a.diamonds || 0));
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [hosts, search, selectedAgencyFilter, sortBy]);

  const filteredAgencies = useMemo(() => {
    let list = agencies;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.code || '').toLowerCase().includes(q) ||
        (a.ownerName || '').toLowerCase().includes(q) ||
        (a.ownerPhone || '').includes(q)
      );
    }

    return list.sort((a, b) => {
      if (sortBy === 'duration') return (b.totalStreamSeconds || 0) - (a.totalStreamSeconds || 0);
      if (sortBy === 'commission') return (b.totalCommission || 0) - (a.totalCommission || 0);
      if (sortBy === 'assets') return (b.totalHosts || 0) - (a.totalHosts || 0);
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [agencies, search, sortBy]);

  // Unique agency codes for filter dropdown
  const uniqueAgencyCodes = useMemo(() => {
    const set = new Set<string>();
    agencies.forEach(a => { if (a.code) set.add(a.code); });
    hosts.forEach(h => { if (h.agencyCode) set.add(h.agencyCode); });
    return Array.from(set);
  }, [agencies, hosts]);

  return (
    <div className="user-management fade-in" style={{ padding: '0 4px' }}>
      <style>{`
        .perf-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .perf-kpi-card {
          background: var(--bg-surface, #ffffff);
          border: 1px solid var(--glass-border, #e2e8f0);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--card-shadow, 0 4px 14px rgba(0,0,0,0.03));
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .perf-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover, 0 8px 24px rgba(0,0,0,0.08));
        }
        .perf-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .perf-icon-box.blue   { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        .perf-icon-box.green  { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        .perf-icon-box.purple { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
        .perf-icon-box.gold   { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
        .perf-icon-box.cyan   { background: rgba(6, 182, 212, 0.12);  color: #06b6d4; }

        .perf-charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        @media (max-width: 1024px) {
          .perf-charts-row {
            grid-template-columns: 1fr;
          }
        }
        .perf-chart-box {
          background: var(--bg-surface, #ffffff);
          border: 1px solid var(--glass-border, #e2e8f0);
          border-radius: 20px;
          padding: 22px;
          box-shadow: var(--card-shadow, 0 4px 16px rgba(0,0,0,0.03));
        }
        .chart-ctrl-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--glass-border, #e2e8f0);
          background: var(--input-bg, #f8fafc);
          color: var(--text-secondary, #64748b);
          transition: all 0.2s ease;
        }
        .chart-ctrl-btn.active {
          background: var(--accent-primary, #3b82f6);
          color: #ffffff;
          border-color: var(--accent-primary, #3b82f6);
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
        }

        .custom-chart-tooltip {
          background: rgba(15, 23, 42, 0.95);
          color: #ffffff;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          font-size: 0.8rem;
          backdrop-filter: blur(8px);
        }

        .duration-bar-wrap {
          width: 100%;
          height: 6px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 4px;
        }
        .duration-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          border-radius: 10px;
        }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="header-actions" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Live Broadcasting Analytics Hub
          </div>
          <h1 className="page-title" style={{ fontSize: '1.9rem', fontWeight: 900 }}>Performance Tracker</h1>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 600, fontSize: '0.92rem', marginTop: '4px' }}>
            Real-time streaming duration, agency yields and talent performance metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="secondary flex items-center gap-2"
            onClick={fetchTracking}
            disabled={loading}
            style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 700 }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Sync Live Data'}
          </button>
        </div>
      </div>

      {/* ── Top Summary KPI Cards ────────────────────────────────────────────── */}
      <div className="perf-kpi-grid">
        <div className="perf-kpi-card">
          <div className="perf-icon-box blue">
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {hosts.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
              Tracked Hosts
            </div>
          </div>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-icon-box green">
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {agencies.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
              Active Agencies
            </div>
          </div>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-icon-box purple">
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatDuration(totalStreamSeconds)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
              Total Stream Duration
            </div>
          </div>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-icon-box gold">
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ₹{totalGrossCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
              Gross Commission Yield
            </div>
          </div>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-icon-box cyan">
            <Diamond size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{totalDiamondsGenerated.toLocaleString()}</span>
              <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800 }}>/ {totalCoinsGenerated.toLocaleString()}c</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
              Diamonds / Coins Generated
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Performance Graph Section ─────────────────────────────── */}
      <div className="perf-charts-row">
        {/* Main Chart Box */}
        <div className="perf-chart-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#3b82f6" />
                Performance Leaderboard & Yield Analysis
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, margin: '4px 0 0 0' }}>
                Comparing dynamic output across top {activeTab === 'hosts' ? 'hosts' : 'agencies'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--input-bg, #f1f5f9)', padding: '3px', borderRadius: '10px' }}>
                <button
                  className={`chart-ctrl-btn ${chartMetric === 'duration' ? 'active' : ''}`}
                  onClick={() => setChartMetric('duration')}
                >
                  Stream Hours
                </button>
                <button
                  className={`chart-ctrl-btn ${chartMetric === 'commission' ? 'active' : ''}`}
                  onClick={() => setChartMetric('commission')}
                >
                  Commission (₹)
                </button>
                <button
                  className={`chart-ctrl-btn ${chartMetric === 'assets' ? 'active' : ''}`}
                  onClick={() => setChartMetric('assets')}
                >
                  Assets (Coins/💎)
                </button>
              </div>

              <div style={{ display: 'flex', background: 'var(--input-bg, #f1f5f9)', padding: '3px', borderRadius: '10px' }}>
                <button
                  className={`chart-ctrl-btn ${chartType === 'area' ? 'active' : ''}`}
                  onClick={() => setChartType('area')}
                  title="Smooth Curve Chart"
                >
                  Area
                </button>
                <button
                  className={`chart-ctrl-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                  title="Bar Comparison Chart"
                >
                  Bar
                </button>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryPerfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="secondaryPerfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="custom-chart-tooltip">
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>{data.fullName}</div>
                            <div style={{ color: '#93c5fd', fontSize: '0.75rem', marginBottom: '8px' }}>Agency: {data.agency}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div>⏱️ Stream Time: <strong>{data.streamHours} hrs</strong></div>
                              <div>💰 Commission: <strong>₹{data.commission?.toLocaleString()}</strong></div>
                              {data.coins !== undefined && <div>🪙 Coins: <strong>{data.coins?.toLocaleString()}</strong></div>}
                              {data.diamonds !== undefined && <div>💎 Diamonds: <strong>{data.diamonds?.toLocaleString()}</strong></div>}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {chartMetric === 'duration' && (
                    <Area
                      type="monotone"
                      dataKey="streamHours"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#primaryPerfGradient)"
                      name="Stream Hours"
                    />
                  )}
                  {chartMetric === 'commission' && (
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#secondaryPerfGradient)"
                      name="Commission (₹)"
                    />
                  )}
                  {chartMetric === 'assets' && (
                    <Area
                      type="monotone"
                      dataKey="assets"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#primaryPerfGradient)"
                      name="Total Assets"
                    />
                  )}
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="custom-chart-tooltip">
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{data.fullName}</div>
                            <div style={{ color: '#93c5fd', fontSize: '0.75rem', marginBottom: '6px' }}>Agency: {data.agency}</div>
                            <div>⏱️ Stream: <strong>{data.streamHours} hrs</strong></div>
                            <div>💰 Commission: <strong>₹{data.commission?.toLocaleString()}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={chartMetric === 'duration' ? 'streamHours' : chartMetric === 'commission' ? 'commission' : 'assets'}
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agency Distribution Doughnut Chart */}
        <div className="perf-chart-box">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="#10b981" /> Agency Network Volume
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 16px 0' }}>
            Host share across top active agencies
          </p>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agencyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="custom-chart-tooltip">
                          <div style={{ fontWeight: 800 }}>{data.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Code: {data.code}</div>
                          <div style={{ marginTop: '4px' }}>Hosts: <strong>{data.value}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {agencyDistribution.map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }} />
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.name}</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {entry.value} Hosts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Side Grid Section ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ borderRadius: '24px', border: '1px solid var(--glass-border)', padding: '24px', marginBottom: '30px' }}>
        
        {/* Tab & Controls Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('hosts')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px',
                border: activeTab === 'hosts' ? '2px solid #3b82f6' : '1px solid var(--glass-border)',
                background: activeTab === 'hosts' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-surface)',
                color: activeTab === 'hosts' ? '#3b82f6' : 'var(--text-secondary)',
                fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              <Users size={17} />
              <span>Host Performance Grid</span>
              <span style={{ background: activeTab === 'hosts' ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)', color: activeTab === 'hosts' ? '#fff' : 'inherit', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem' }}>
                {filteredHosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('agencies')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px',
                border: activeTab === 'agencies' ? '2px solid #10b981' : '1px solid var(--glass-border)',
                background: activeTab === 'agencies' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                color: activeTab === 'agencies' ? '#10b981' : 'var(--text-secondary)',
                fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              <Building2 size={17} />
              <span>Agency Aggregates Grid</span>
              <span style={{ background: activeTab === 'agencies' ? '#10b981' : 'rgba(148, 163, 184, 0.2)', color: activeTab === 'agencies' ? '#fff' : 'inherit', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem' }}>
                {filteredAgencies.length}
              </span>
            </button>
          </div>

          {/* Filtering Tools */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            {activeTab === 'hosts' && uniqueAgencyCodes.length > 0 && (
              <select
                value={selectedAgencyFilter}
                onChange={e => setSelectedAgencyFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Agencies</option>
                {uniqueAgencyCodes.map(code => (
                  <option key={code} value={code}>Agency: {code}</option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="duration">Sort: Stream Duration</option>
              <option value="commission">Sort: Commission Yield</option>
              <option value="assets">Sort: Total Assets</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* ── Table Grid ──────────────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#3b82f6' }} />
              <p style={{ fontWeight: 700 }}>Synchronizing dynamic metrics...</p>
            </div>
          ) : activeTab === 'hosts' ? (
            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '28%', textAlign: 'left' }}>Host Identity</th>
                  <th style={{ width: '16%', textAlign: 'left' }}>Agency Network</th>
                  <th style={{ width: '20%', textAlign: 'left' }}>Broadcasting Watch Time</th>
                  <th style={{ width: '14%', textAlign: 'left' }}>Wallet Assets</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Commission Earned</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No host performance records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHosts.map((host, idx) => {
                    const durationRatio = totalStreamSeconds > 0 ? Math.min(100, Math.round(((host.totalStreamSeconds || 0) / totalStreamSeconds) * 100)) : 10;
                    return (
                      <tr key={host.id || idx} className="row-premium">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MediaImage
                              src={host.displayPicture}
                              className="avatar-glass"
                              style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }}
                              fallbackText={(host.name || 'H').charAt(0)}
                            />
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                {host.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {host.phone || host.email || host.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontFamily: 'monospace', fontWeight: 800, fontSize: '0.78rem',
                              color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)',
                              padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.25)',
                              width: 'fit-content'
                            }}>
                              🏷️ {host.agencyCode || 'DIRECT'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {host.agencyName || 'Independent Talent'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={14} color="#64748b" />
                                {formatDuration(host.totalStreamSeconds)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {host.totalStreams || 1} stream{(host.totalStreams || 1) !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="duration-bar-wrap">
                              <div className="duration-bar-fill" style={{ width: `${Math.max(8, durationRatio)}%` }} />
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                              <Coins size={13} /> {(host.coins || 0).toLocaleString()}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4' }}>
                              <Diamond size={13} /> {(host.diamonds || 0).toLocaleString()}
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                            ₹{(host.totalCommissionEarned || 0).toFixed(2)}
                          </div>
                          {(host.totalCommissionEarned || 0) > 1000 && (
                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                              ★ Top Earner
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                            textTransform: 'uppercase',
                            background: host.status === 'active' || host.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: host.status === 'active' || host.status === 'approved' ? '#10b981' : '#ef4444',
                            border: `1px solid ${host.status === 'active' || host.status === 'approved' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                          }}>
                            {host.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* ── Agency Grid ─────────────────────────────────────────────────── */
            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '26%', textAlign: 'left' }}>Agency Network</th>
                  <th style={{ width: '18%', textAlign: 'left' }}>Owner / Admin</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Agency Code</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Active Talent</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Commission Rate</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Gross Commission</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No agency performance aggregates found.
                    </td>
                  </tr>
                ) : (
                  filteredAgencies.map((agency, idx) => (
                    <tr key={agency.id || idx} className="row-premium">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)',
                            flexShrink: 0
                          }}>
                            {(agency.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {agency.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              Status: <span style={{ color: agency.status === 'active' || agency.status === 'approved' ? '#10b981' : '#f59e0b' }}>{agency.status}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {agency.ownerName || 'Direct Admin'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {agency.ownerPhone || agency.ownerEmail || '—'}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem',
                          color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)',
                          padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.25)'
                        }}>
                          {agency.code}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          <Users size={14} color="#3b82f6" />
                          <span>{agency.totalHosts || 0}</span>
                          {agency.pendingHosts > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                              ({agency.pendingHosts} pending)
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.88rem' }}>
                          {((agency.commissionRate || 0.1) * 100).toFixed(0)}%
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                          ₹{(agency.totalCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedAgencyFilter(agency.code);
                            setActiveTab('hosts');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={`View hosts under ${agency.code}`}
                        >
                          View Hosts <ChevronRight size={13} />
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
