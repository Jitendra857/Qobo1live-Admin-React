import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, ShieldCheck, CheckCircle, XCircle, AlertCircle,
  TrendingUp, DollarSign, Wallet, Search, RefreshCw,
  Building2, UserCheck, Clock, ChevronDown, Edit3, Link2
} from 'lucide-react';
import '../styles/UserManagement.css';

const AgencyHub: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const canApprove = currentUser?.role === 'super_admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agenciesRes, revenueRes] = await Promise.all([
        adminService.getAgencies(),
        adminService.getGlobalAgencyStats()
      ]);
      const list = agenciesRes.data.data || [];
      setAgencies(list);
      setFiltered(list);
      setRevenue(revenueRes.data.data || null);
    } catch (err) {
      toast.error('Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Live search + status filter
  useEffect(() => {
    let result = agencies;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.code?.toLowerCase().includes(q) ||
        a.owner?.name?.toLowerCase().includes(q) ||
        a.owner?.phone?.includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, agencies]);

  const handleApprove = async (agencyId: string, status: 'active' | 'rejected') => {
    try {
      const res = await adminService.approveAgency({ agency_id: agencyId, status });
      if (res.data.statusCode === 1) {
        toast.success(`Agency ${status === 'active' ? '✅ Approved' : '❌ Rejected'}`);
        fetchData();
      } else {
        toast.error(res.data.message || 'Action failed');
      }
    } catch {
      toast.error('Error processing agency action');
    }
  };

  const handlePayout = async () => {
    setPayoutLoading(true);
    try {
      await adminService.payoutAgency({ agencyId: 'all' });
      toast.success('All pending commissions processed successfully');
      fetchData();
    } catch {
      toast.error('No pending commissions or payout failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  const pendingCount  = agencies.filter(a => a.status === 'pending').length;
  const approvedCount = agencies.filter(a => a.status === 'active').length;

  return (
    <div className="user-management fade-in">
      <style>{`
        .agency-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }
        .agency-stat-card {
          background: var(--bg-surface) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 20px;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--card-shadow) !important;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .agency-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .agency-stat-card.blue::before  { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .agency-stat-card.green::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .agency-stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .agency-stat-card.purple::before{ background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
        .agency-stat-card.rose::before  { background: linear-gradient(90deg, #f43f5e, #fb7185); }
        .agency-stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary) !important;
          box-shadow: var(--card-shadow-hover) !important;
        }
        .stat-icon-box {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon-box.blue   { background: rgba(59,130,246,0.1);  color: #3b82f6; }
        .stat-icon-box.green  { background: rgba(16,185,129,0.1);  color: #10b981; }
        .stat-icon-box.amber  { background: rgba(245,158,11,0.1);  color: #f59e0b; }
        .stat-icon-box.purple { background: rgba(139,92,246,0.1);  color: #8b5cf6; }
        .stat-icon-box.rose   { background: rgba(244,63,94,0.1);   color: #f43f5e; }
        .stat-num  { font-size: 1.8rem; font-weight: 900; color: var(--text-primary)!important; line-height:1; letter-spacing:-0.03em; }
        .stat-lbl  { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary)!important; text-transform:uppercase; letter-spacing:0.08em; margin-top: 4px; }

        .agency-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .agency-search {
          flex: 1;
          min-width: 220px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--input-bg)!important;
          border: 1px solid var(--glass-border)!important;
          border-radius: 12px;
          padding: 0 16px;
          height: 44px;
        }
        .agency-search input {
          background: transparent; border: none; outline: none;
          color: var(--text-primary)!important;
          font-size: 0.88rem; font-weight: 600; width: 100%;
        }
        .agency-search input::placeholder { color: var(--text-secondary)!important; }
        .filter-select {
          background: var(--input-bg)!important;
          border: 1px solid var(--glass-border)!important;
          border-radius: 12px;
          padding: 10px 14px;
          color: var(--text-primary)!important;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          height: 44px;
          outline: none;
        }

        .premium-table { width:100%!important; border-collapse:separate!important; border-spacing:0 10px!important; }
        .premium-table th {
          padding: 14px 20px!important;
          font-size: 0.72rem!important; font-weight:800!important;
          text-transform:uppercase!important; letter-spacing:0.1em!important;
          color: var(--text-secondary)!important; border:none!important;
        }
        .premium-table td {
          padding: 16px 20px!important;
          background: var(--bg-surface)!important;
          border-top: 1px solid var(--glass-border)!important;
          border-bottom: 1px solid var(--glass-border)!important;
          color: var(--text-primary)!important;
          vertical-align: middle!important;
          height: 68px!important;
        }
        .premium-table td:first-child { border-left:1px solid var(--glass-border)!important; border-radius:14px 0 0 14px!important; }
        .premium-table td:last-child  { border-right:1px solid var(--glass-border)!important; border-radius:0 14px 14px 0!important; }
        .premium-table tbody tr { box-shadow: var(--card-shadow)!important; transition:all 0.25s!important; }
        .premium-table tbody tr:hover { transform:translateY(-2px)!important; box-shadow: var(--card-shadow-hover)!important; }
        .premium-table tbody tr:hover td { border-color: var(--accent-primary)!important; }

        .badge-code  { font-family:monospace; font-size:0.82rem; font-weight:800; color:#60a5fa!important; background:rgba(59,130,246,0.1)!important; padding:4px 10px; border-radius:8px; border:1px solid rgba(59,130,246,0.2)!important; }
        .badge-comm  { font-size:0.9rem; font-weight:800; color:#34d399!important; background:rgba(16,185,129,0.08)!important; padding:4px 10px; border-radius:8px; border:1px solid rgba(16,185,129,0.15)!important; }
        .badge-hosts { font-size:0.82rem; font-weight:800; color:#a78bfa!important; background:rgba(139,92,246,0.08)!important; padding:4px 10px; border-radius:8px; border:1px solid rgba(139,92,246,0.15)!important; display:flex; align-items:center; gap:4px; }
        .status-pill-ag { display:inline-flex; align-items:center; gap:5px; font-size:0.68rem; font-weight:800; padding:5px 10px; border-radius:8px; text-transform:uppercase; letter-spacing:0.05em; white-space:nowrap; }
        .status-pill-ag.pending  { background:rgba(245,158,11,0.1)!important;  color:#f59e0b!important; border:1px solid rgba(245,158,11,0.2)!important; }
        .status-pill-ag.active   { background:rgba(16,185,129,0.1)!important;  color:#10b981!important; border:1px solid rgba(16,185,129,0.2)!important; }
        .status-pill-ag.rejected { background:rgba(239,68,68,0.1)!important;   color:#ef4444!important; border:1px solid rgba(239,68,68,0.2)!important; }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="header-actions" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Agency Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
            Manage recruitment networks, host approvals and commission payouts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="secondary flex items-center gap-2"
            onClick={fetchData}
            style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 700 }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          {canApprove && (
            <button
              className="primary flex items-center gap-2"
              onClick={handlePayout}
              disabled={payoutLoading}
              style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 800 }}
            >
              <Wallet size={16} />
              {payoutLoading ? 'Processing...' : 'Process Payouts'}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────────────── */}
      <div className="agency-stats-grid">
        <div className="agency-stat-card blue">
          <div className="stat-icon-box blue"><Building2 size={22} /></div>
          <div><div className="stat-num">{agencies.length}</div><div className="stat-lbl">Total Agencies</div></div>
        </div>
        <div className="agency-stat-card amber">
          <div className="stat-icon-box amber"><Clock size={22} /></div>
          <div><div className="stat-num">{pendingCount}</div><div className="stat-lbl">Pending Review</div></div>
        </div>
        <div className="agency-stat-card green">
          <div className="stat-icon-box green"><CheckCircle size={22} /></div>
          <div><div className="stat-num">{approvedCount}</div><div className="stat-lbl">Active Agencies</div></div>
        </div>
        <div className="agency-stat-card purple">
          <div className="stat-icon-box purple"><UserCheck size={22} /></div>
          <div>
            <div className="stat-num">{revenue?.approvedHosts ?? '—'}</div>
            <div className="stat-lbl">Approved Hosts</div>
          </div>
        </div>
        <div className="agency-stat-card rose">
          <div className="stat-icon-box rose"><DollarSign size={22} /></div>
          <div>
            <div className="stat-num">₹{((revenue?.pendingCommissions || 0) / 1000).toFixed(1)}k</div>
            <div className="stat-lbl">Pending Payouts</div>
          </div>
        </div>
        <div className="agency-stat-card green">
          <div className="stat-icon-box green"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-num">₹{((revenue?.totalVolume || 0) / 1000).toFixed(1)}k</div>
            <div className="stat-lbl">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="agency-toolbar">
        <div className="agency-search">
          <Search size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            placeholder="Search by name, code, owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="glass flex items-center justify-center" style={{ height: 280, borderRadius: 24, border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading agencies...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass flex items-center justify-center" style={{ height: 280, borderRadius: 24, border: '1px solid var(--glass-border)', flexDirection: 'column', gap: 12 }}>
          <Users size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
            {search || statusFilter !== 'all' ? 'No agencies match your filter' : 'No agencies registered yet'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.7 }}>
            Agencies are registered from the mobile app and appear here for review.
          </p>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 24, border: '1px solid var(--glass-border)', padding: '8px', overflow: 'hidden' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '24%', textAlign: 'left' }}>Agency</th>
                <th style={{ width: '22%', textAlign: 'left' }}>Owner</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Code</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Commission</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Hosts</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(agency => (
                <tr key={agency.id} className="row-premium">
                  {/* Agency Name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'var(--input-bg)', color: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1rem', border: '1px solid var(--glass-border)',
                        flexShrink: 0
                      }}>
                        {(agency.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{agency.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {new Date(agency.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Owner */}
                  <td>
                    {agency.owner ? (
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {agency.owner.name || 'Unnamed'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: 2 }}>
                          {agency.owner.phone || agency.owner.email || '—'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>System</span>
                    )}
                  </td>
                  {/* Code */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge-code">{agency.code}</span>
                  </td>
                  {/* Commission */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge-comm">{((agency.commissionRate || 0) * 100).toFixed(0)}%</span>
                  </td>
                  {/* Host Count */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className="badge-hosts">
                        <Users size={12} />
                        {agency.approvedCount ?? 0} / {agency.hostCount ?? 0}
                      </span>
                    </div>
                  </td>
                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-pill-ag ${agency.status}`}>
                      {agency.status === 'pending'  && <AlertCircle size={11} />}
                      {agency.status === 'active'   && <CheckCircle  size={11} />}
                      {agency.status === 'rejected' && <XCircle      size={11} />}
                      {agency.status?.toUpperCase()}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="ops-cluster" style={{ justifyContent: 'flex-end', gap: 8 }}>
                      {agency.status === 'pending' && canApprove ? (
                        <>
                          <button
                            className="op-btn edit"
                            onClick={() => handleApprove(agency.id, 'active')}
                            title="Approve Agency"
                            style={{ borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                          >
                            <CheckCircle size={17} />
                          </button>
                          <button
                            className="op-btn delete"
                            onClick={() => handleApprove(agency.id, 'rejected')}
                            title="Reject Agency"
                            style={{ borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                          >
                            <XCircle size={17} />
                          </button>
                        </>
                      ) : (
                        agency.status === 'active' ? (
                          <button
                            className="op-btn edit"
                            onClick={async () => {
                              try {
                                const res = await adminService.getAgencyLink(agency.id);
                                if (res.data.statusCode === 1) {
                                  await navigator.clipboard.writeText(res.data.data.link);
                                  toast.success('Recruitment link copied to clipboard!');
                                }
                              } catch (err) {
                                toast.error('Failed to get recruitment link');
                              }
                            }}
                            title="Copy Recruitment Link"
                            style={{ borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                          >
                            <Link2 size={17} />
                          </button>
                        ) : (
                          <button
                            className="op-btn"
                            disabled
                            title="Already Processed"
                            style={{ borderRadius: 10, opacity: 0.35, cursor: 'not-allowed' }}
                          >
                            <ShieldCheck size={17} />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgencyHub;
