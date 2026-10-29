import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Coins, Users, ShieldCheck, Building2, Search, RefreshCw,
  PlusCircle, MinusCircle, Edit3, History, CheckSquare, Square,
  Calendar, DollarSign, Filter, X, ArrowUpRight, ArrowDownRight,
  Sliders, AlertCircle, FileText, Check, LayoutGrid, List,
  ExternalLink, Sparkles, TrendingUp, Clock, UserCheck
} from 'lucide-react';
import '../styles/UserManagement.css';
import '../styles/Modal.css';

interface Partner {
  userId: string;
  partnerType: 'agency' | 'super_admin';
  name: string;
  ownerName?: string | null;
  email: string | null;
  phone: string | null;
  displayPicture: string | null;
  agencyCode?: string | null;
  agencyName?: string | null;
  agencyId?: string | null;
  coins: number;
  diamonds: number;
  purchasedDiamonds?: number;
  status: string;
  createdAt: string;
  lastAdjustment?: {
    id: string;
    amount: number;
    type: string;
    period: string;
    reason: string;
    createdAt: string;
  } | null;
}

interface HistoryItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  userRole: string;
  agencyCode: string | null;
  type: string;
  action: 'add' | 'remove' | 'set';
  period: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
  adminEmail: string;
  createdAt: string;
}

type PeriodType = 'weekly' | 'monthly' | 'yearly' | 'custom';
type ActionType = 'add' | 'remove' | 'set';

const PartnerCoins: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'agency' | 'super_admin'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Multi-select state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPartners, setTargetPartners] = useState<Partner[]>([]);
  const [modalAction, setModalAction] = useState<ActionType>('add');
  const [modalPeriod, setModalPeriod] = useState<PeriodType>('weekly');
  const [modalAmount, setModalAmount] = useState<string>('');
  const [modalReason, setModalReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilterPeriod, setHistoryFilterPeriod] = useState<string>('all');
  const [historyUserId, setHistoryUserId] = useState<string | undefined>(undefined);
  const [historyUserTitle, setHistoryUserTitle] = useState<string>('All Partner Transactions');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPartnerCoins(typeFilter, searchTerm);
      setPartners(res.data.data || []);
      setSelectedUserIds([]);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load partners list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners();
  };

  // Select / Deselect Logic
  const handleSelectAll = () => {
    if (selectedUserIds.length === partners.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(partners.map(p => p.userId));
    }
  };

  const handleToggleSelect = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Open Modal for Single Partner
  const handleOpenSingleModal = (partner: Partner, action: ActionType) => {
    setTargetPartners([partner]);
    setModalAction(action);
    setModalAmount('');
    setModalReason('');
    setModalPeriod('weekly');
    setIsModalOpen(true);
  };

  // Open Modal for Bulk Selected Partners
  const handleOpenBulkModal = (action: ActionType = 'add') => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one partner using the checkboxes');
      return;
    }
    const selected = partners.filter(p => selectedUserIds.includes(p.userId));
    setTargetPartners(selected);
    setModalAction(action);
    setModalAmount('');
    setModalReason('');
    setModalPeriod('weekly');
    setIsModalOpen(true);
  };

  // Submit Coin Adjustment
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(modalAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error('Please enter a valid coin amount');
      return;
    }

    if (modalAction !== 'set' && amountNum === 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const userIds = targetPartners.map(p => p.userId);
      const res = await adminService.adjustPartnerCoins({
        userIds,
        amount: amountNum,
        action: modalAction,
        period: modalPeriod,
        reason: modalReason.trim() || undefined
      });

      const count = res.data?.data?.updatedCount || userIds.length;
      const actionLabel = modalAction === 'add' ? 'credited to' : modalAction === 'remove' ? 'deducted from' : 'updated for';
      toast.success(`Coins successfully ${actionLabel} ${count} partner(s)!`);

      setIsModalOpen(false);
      fetchPartners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to adjust coins');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch History
  const fetchHistory = async (userId?: string, period: string = 'all') => {
    try {
      setHistoryLoading(true);
      const res = await adminService.getPartnerCoinsHistory({
        userId,
        period: period !== 'all' ? period : undefined,
        limit: 100
      });
      setHistoryItems(res.data.data?.items || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load transaction history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = (userId?: string, userName?: string) => {
    setHistoryUserId(userId);
    setHistoryUserTitle(userName ? `History: ${userName}` : 'All Partner Transactions');
    setHistoryFilterPeriod('all');
    setIsHistoryOpen(true);
    fetchHistory(userId, 'all');
  };

  // Stats summary
  const totalAgencies = partners.filter(p => p.partnerType === 'agency').length;
  const totalSuperAdmins = partners.filter(p => p.partnerType === 'super_admin').length;
  const totalCoinsInPool = partners.reduce((sum, p) => sum + (p.coins || 0), 0);
  const totalUsdValue = (totalCoinsInPool / 10000).toFixed(2);

  return (
    <div className="user-management fade-in">
      {/* ── Scoped Premium Styling matching Qobo1live Admin System ─────────── */}
      <style>{`
        .partner-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }
        .partner-stat-card {
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
        .partner-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .partner-stat-card.blue::before   { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .partner-stat-card.cyan::before   { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
        .partner-stat-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
        .partner-stat-card.amber::before  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .partner-stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary) !important;
          box-shadow: var(--card-shadow-hover) !important;
        }

        .stat-icon-box {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon-box.blue   { background: rgba(59,130,246,0.12);  color: #3b82f6; }
        .stat-icon-box.cyan   { background: rgba(6,182,212,0.12);   color: #06b6d4; }
        .stat-icon-box.purple { background: rgba(139,92,246,0.12);  color: #8b5cf6; }
        .stat-icon-box.amber  { background: rgba(245,158,11,0.12);  color: #f59e0b; }
        .stat-num {
          font-size: 1.85rem; font-weight: 900;
          color: var(--text-primary) !important;
          line-height: 1; letter-spacing: -0.03em;
        }
        .stat-lbl {
          font-size: 0.72rem; font-weight: 800;
          color: var(--text-secondary) !important;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-top: 5px;
        }

        .partner-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .partner-search {
          flex: 1;
          min-width: 240px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--input-bg) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 14px;
          padding: 0 16px;
          height: 46px;
        }
        .partner-search input {
          background: transparent; border: none; outline: none;
          color: var(--text-primary) !important;
          font-size: 0.9rem; font-weight: 600; width: 100%;
        }
        .partner-search input::placeholder { color: var(--text-secondary) !important; }

        .filter-pill {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .filter-pill.active {
          background: var(--accent-primary) !important;
          color: #fff !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }

        /* Floating Modern Table Style */
        .premium-partner-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
        }
        .premium-partner-table th {
          padding: 14px 18px !important;
          font-size: 0.72rem !important; font-weight: 800 !important;
          text-transform: uppercase !important; letter-spacing: 0.1em !important;
          color: var(--text-secondary) !important; border: none !important;
        }
        .premium-partner-table td {
          padding: 16px 18px !important;
          background: var(--bg-surface) !important;
          border-top: 1px solid var(--glass-border) !important;
          border-bottom: 1px solid var(--glass-border) !important;
          color: var(--text-primary) !important;
          vertical-align: middle !important;
          height: 72px !important;
        }
        .premium-partner-table td:first-child {
          border-left: 1px solid var(--glass-border) !important;
          border-radius: 16px 0 0 16px !important;
        }
        .premium-partner-table td:last-child {
          border-right: 1px solid var(--glass-border) !important;
          border-radius: 0 16px 16px 0 !important;
        }
        .premium-partner-table tbody tr {
          box-shadow: var(--card-shadow) !important;
          transition: all 0.25s ease !important;
        }
        .premium-partner-table tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: var(--card-shadow-hover) !important;
        }
        .premium-partner-table tbody tr:hover td {
          border-color: var(--accent-primary) !important;
        }
        .premium-partner-table tbody tr.selected td {
          background: rgba(59, 130, 246, 0.05) !important;
          border-color: #3b82f6 !important;
        }

        .badge-agency-code {
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 800;
          color: #0284c7 !important;
          background: rgba(2, 132, 199, 0.1) !important;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(2, 132, 199, 0.2) !important;
          display: inline-block;
        }
        .badge-coins-val {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.95rem;
          background: rgba(245, 158, 11, 0.12) !important;
          color: #d97706 !important;
          border: 1px solid rgba(245, 158, 11, 0.25) !important;
        }
        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .role-pill.super-admin {
          background: rgba(139, 92, 246, 0.12) !important;
          color: #7c3aed !important;
          border: 1px solid rgba(139, 92, 246, 0.25) !important;
        }
        .role-pill.agency {
          background: rgba(6, 182, 212, 0.12) !important;
          color: #0891b2 !important;
          border: 1px solid rgba(6, 182, 212, 0.25) !important;
        }

        .action-chip-btn {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          border: none;
        }
        .action-chip-btn.add {
          background: rgba(16, 185, 129, 0.12) !important;
          color: #059669 !important;
          border: 1px solid rgba(16, 185, 129, 0.25) !important;
        }
        .action-chip-btn.add:hover {
          background: #10b981 !important;
          color: #fff !important;
        }
        .action-chip-btn.deduct {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #dc2626 !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
        }
        .action-chip-btn.deduct:hover {
          background: #ef4444 !important;
          color: #fff !important;
        }
        .action-chip-btn.edit {
          background: var(--input-bg) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--glass-border) !important;
        }
        .action-chip-btn.edit:hover {
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
        }
        .action-chip-btn.history {
          background: rgba(99, 102, 241, 0.1) !important;
          color: #6366f1 !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
        }
        .action-chip-btn.history:hover {
          background: #6366f1 !important;
          color: #fff !important;
        }
      `}</style>

      {/* ── 1. Page Header ────────────────────────────────────────────────── */}
      <div className="header-actions" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Community & Users
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>•</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Incentives & Payouts</span>
          </div>

          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Coins size={32} color="#f59e0b" />
            Partner Coins Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px', fontSize: '0.92rem' }}>
            Award recruitment incentives in <strong>My Coins</strong> to Agencies & Super Admins (Withdrawable at <strong>10,000 Coins = $1.00 USD</strong>).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="secondary flex items-center gap-2"
            onClick={() => handleOpenHistory()}
            style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 700 }}
          >
            <History size={16} /> Audit History
          </button>

          <button
            type="button"
            className="primary flex items-center gap-2"
            disabled={selectedUserIds.length === 0}
            onClick={() => handleOpenBulkModal('add')}
            style={{
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 800,
              background: selectedUserIds.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
              opacity: selectedUserIds.length > 0 ? 1 : 0.6,
              cursor: selectedUserIds.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <PlusCircle size={17} />
            Bulk Add Coins {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
          </button>
        </div>
      </div>

      {/* ── 2. Top Statistics Cards Grid ─────────────────────────────────── */}
      <div className="partner-stats-grid">
        <div className="partner-stat-card blue">
          <div className="stat-icon-box blue"><Users size={24} /></div>
          <div>
            <div className="stat-num">{partners.length}</div>
            <div className="stat-lbl">Total Partners</div>
          </div>
        </div>

        <div className="partner-stat-card cyan">
          <div className="stat-icon-box cyan"><Building2 size={24} /></div>
          <div>
            <div className="stat-num">{totalAgencies}</div>
            <div className="stat-lbl">Active Agencies</div>
          </div>
        </div>

        <div className="partner-stat-card purple">
          <div className="stat-icon-box purple"><ShieldCheck size={24} /></div>
          <div>
            <div className="stat-num">{totalSuperAdmins}</div>
            <div className="stat-lbl">Super Admins</div>
          </div>
        </div>

        <div className="partner-stat-card amber">
          <div className="stat-icon-box amber"><Coins size={24} /></div>
          <div>
            <div className="stat-num" style={{ color: '#d97706' }}>{totalCoinsInPool.toLocaleString()}</div>
            <div className="stat-lbl" style={{ color: '#16a34a' }}>
              ≈ ${totalUsdValue} USD Pool
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Filter & Search Toolbar ───────────────────────────────────── */}
      <div className="partner-toolbar">
        {/* Role Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All Partners ({partners.length})
          </button>

          <button
            type="button"
            className={`filter-pill ${typeFilter === 'agency' ? 'active' : ''}`}
            onClick={() => setTypeFilter('agency')}
          >
            <Building2 size={15} />
            Agencies Only ({totalAgencies})
          </button>

          <button
            type="button"
            className={`filter-pill ${typeFilter === 'super_admin' ? 'active' : ''}`}
            onClick={() => setTypeFilter('super_admin')}
          >
            <ShieldCheck size={15} />
            Super Admins Only ({totalSuperAdmins})
          </button>
        </div>

        {/* Search Bar & Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} className="partner-search">
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search by name, code, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchPartners(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          <button
            type="button"
            className="secondary"
            onClick={fetchPartners}
            title="Refresh list"
            style={{ borderRadius: '12px', height: '46px', padding: '0 16px' }}
          >
            <RefreshCw size={16} />
          </button>

          {/* Bulk Operations Pill when selected */}
          {selectedUserIds.length > 0 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleOpenBulkModal('add')}
                style={{
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={15} /> Add ({selectedUserIds.length})
              </button>

              <button
                type="button"
                onClick={() => handleOpenBulkModal('remove')}
                style={{
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MinusCircle size={15} /> Deduct
              </button>

              <button
                type="button"
                onClick={() => handleOpenBulkModal('set')}
                style={{
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit3 size={15} /> Set Balance
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Main Partners Table ───────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table className="premium-partner-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title={selectedUserIds.length === partners.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedUserIds.length > 0 && selectedUserIds.length === partners.length ? (
                    <CheckSquare size={19} color="#3b82f6" />
                  ) : (
                    <Square size={19} color="var(--text-secondary)" />
                  )}
                </button>
              </th>
              <th>Partner Identity</th>
              <th>Role Type</th>
              <th>Agency Code</th>
              <th>Contact Details</th>
              <th>Current My Coins (Earning)</th>
              <th>USD Value ($1/10k)</th>
              <th>Recent Incentive</th>
              <th style={{ textAlign: 'center' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  Fetching verified partners and wallet records...
                </td>
              </tr>
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                  <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                  No partners found matching the selected filter or search criteria.
                </td>
              </tr>
            ) : (
              partners.map((partner) => {
                const isSelected = selectedUserIds.includes(partner.userId);
                const usdValue = ((partner.coins || 0) / 10000).toFixed(2);

                return (
                  <tr key={partner.userId} className={isSelected ? 'selected' : ''}>
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(partner.userId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {isSelected ? (
                          <CheckSquare size={19} color="#3b82f6" />
                        ) : (
                          <Square size={19} color="var(--glass-border)" />
                        )}
                      </button>
                    </td>

                    {/* Partner Avatar + Identity */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={partner.displayPicture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            alt=""
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              objectFit: 'cover',
                              border: '2px solid var(--glass-border)'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {partner.name}
                          </div>
                          {partner.agencyName && partner.agencyName !== partner.name && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {partner.agencyName}
                            </div>
                          )}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            ID: {partner.userId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td>
                      {partner.partnerType === 'super_admin' ? (
                        <span className="role-pill super-admin">
                          <ShieldCheck size={13} /> Super Admin
                        </span>
                      ) : (
                        <span className="role-pill agency">
                          <Building2 size={13} /> Agency Owner
                        </span>
                      )}
                    </td>

                    {/* Agency Code */}
                    <td>
                      {partner.agencyCode ? (
                        <span className="badge-agency-code">{partner.agencyCode}</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{partner.email || 'No email'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{partner.phone || 'No phone'}</div>
                    </td>

                    {/* Current My Coins Balance (Earning) */}
                    <td>
                      <div className="badge-coins-val" style={{ color: '#16a34a' }}>
                        <Coins size={16} color="#16a34a" />
                        {(partner.coins || 0).toLocaleString()} Coins
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                        Purchased: {(partner.purchasedDiamonds ?? partner.diamonds ?? 0).toLocaleString()} 💎
                      </div>
                    </td>

                    {/* Withdrawable USD */}
                    <td>
                      <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>
                        ${usdValue} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>USD</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Withdrawable in App
                      </div>
                    </td>

                    {/* Last Incentive Info */}
                    <td>
                      {partner.lastAdjustment ? (
                        <div>
                          <span style={{
                            display: 'inline-block',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: 'var(--text-secondary)',
                            marginBottom: '3px'
                          }}>
                            {partner.lastAdjustment.period}
                          </span>
                          <div style={{
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            color: partner.lastAdjustment.type === 'PARTNER_COIN_DEDUCT' ? '#ef4444' : '#10b981'
                          }}>
                            {partner.lastAdjustment.type === 'PARTNER_COIN_DEDUCT' ? '-' : '+'}
                            {partner.lastAdjustment.amount.toLocaleString()} coins
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {new Date(partner.lastAdjustment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None recorded</span>
                      )}
                    </td>

                    {/* Quick Row Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="action-chip-btn add"
                          onClick={() => handleOpenSingleModal(partner, 'add')}
                          title="Add Coins to this partner"
                        >
                          <PlusCircle size={14} /> Add
                        </button>

                        <button
                          type="button"
                          className="action-chip-btn deduct"
                          onClick={() => handleOpenSingleModal(partner, 'remove')}
                          title="Deduct Coins from this partner"
                        >
                          <MinusCircle size={14} /> Deduct
                        </button>

                        <button
                          type="button"
                          className="action-chip-btn edit"
                          onClick={() => handleOpenSingleModal(partner, 'set')}
                          title="Set exact coin balance"
                        >
                          <Edit3 size={14} /> Set
                        </button>

                        <button
                          type="button"
                          className="action-chip-btn history"
                          onClick={() => handleOpenHistory(partner.userId, partner.name)}
                          title="View transaction history"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 5. Simplified Coins Adjustment Modal ──────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel slide-up" style={{ maxWidth: '480px', padding: '24px' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: modalAction === 'remove' ? 'rgba(239, 68, 68, 0.12)' : modalAction === 'set' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {modalAction === 'remove' ? (
                    <MinusCircle size={22} color="#ef4444" />
                  ) : modalAction === 'set' ? (
                    <Edit3 size={20} color="#6366f1" />
                  ) : (
                    <Coins size={22} color="#10b981" />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
                    {modalAction === 'remove' ? 'Deduct Coins' : modalAction === 'set' ? 'Set Exact Balance' : 'Add Partner Coins'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {targetPartners.length === 1 ? `Withdrawable earning for ${targetPartners[0].name}` : `Applying to ${targetPartners.length} selected partners`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              {/* Partner Card */}
              {targetPartners.length === 1 ? (
                <div style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={targetPartners[0].displayPicture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {targetPartners[0].name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {targetPartners[0].partnerType === 'super_admin' ? 'Super Admin' : `Agency (${targetPartners[0].agencyCode || 'Direct'})`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Earning</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#16a34a' }}>
                      {(targetPartners[0].coins || 0).toLocaleString()} Coins
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      ≈ ${((targetPartners[0].coins || 0) / 10000).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#3b82f6' }}>
                      {targetPartners.length} Partners Selected
                    </strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Coins will be credited to each partner's withdrawable earning
                    </div>
                  </div>
                  <span style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    BULK
                  </span>
                </div>
              )}

              {/* Simple Action Tabs */}
              <div style={{
                display: 'flex',
                background: 'var(--input-bg)',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '16px',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setModalAction('add')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: modalAction === 'add' ? '#10b981' : 'transparent',
                    color: modalAction === 'add' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <PlusCircle size={15} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction('remove')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: modalAction === 'remove' ? '#ef4444' : 'transparent',
                    color: modalAction === 'remove' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <MinusCircle size={15} /> Deduct
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction('set')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: modalAction === 'set' ? '#6366f1' : 'transparent',
                    color: modalAction === 'set' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Edit3 size={15} /> Set Balance
                </button>
              </div>

              {/* Cycle selection only relevant for Add */}
              {modalAction === 'add' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Payout Cycle:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {(['weekly', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setModalPeriod(p)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: modalPeriod === p ? '2px solid #10b981' : '1px solid var(--glass-border)',
                          background: modalPeriod === p ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                          color: modalPeriod === p ? '#059669' : 'var(--text-secondary)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coin Amount Input */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {modalAction === 'set' ? 'New Exact Balance:' : modalAction === 'remove' ? 'Coins to Deduct:' : 'Coins to Add:'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Coins size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: modalAction === 'remove' ? '#ef4444' : '#10b981' }} />
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter coins (e.g. 10000)"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {[10000, 50000, 100000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setModalAmount(String(amt))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-surface)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {modalAction === 'set' ? '' : '+'}{amt.toLocaleString()} (${amt / 10000})
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Preview Box */}
              {modalAmount && Number(modalAmount) > 0 && (
                <div style={{
                  background: modalAction === 'remove' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: modalAction === 'remove' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: modalAction === 'remove' ? '#dc2626' : '#16a34a', fontWeight: 800, fontSize: '0.82rem', display: 'block' }}>
                      {modalAction === 'remove' ? 'Deduction Value:' : modalAction === 'set' ? 'Total USD Value:' : 'Withdrawable USD Added:'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Official rate: 10,000 Coins = $1.00 USD
                    </span>
                  </div>
                  <strong style={{ color: modalAction === 'remove' ? '#dc2626' : '#15803d', fontSize: '1.05rem', fontWeight: 900 }}>
                    ${(Number(modalAmount) / 10000).toFixed(2)} USD
                  </strong>
                </div>
              )}

              {/* Reason / Notes */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Note / Reason (Optional):
                </label>
                <input
                  type="text"
                  placeholder={modalAction === 'remove' ? 'Reason for deduction' : `e.g. ${modalPeriod} agency bonus`}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: '8px', padding: '9px 16px', fontWeight: 700 }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !modalAmount}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: modalAction === 'remove' ? '#ef4444' : modalAction === 'set' ? '#6366f1' : '#10b981',
                    color: '#fff',
                    cursor: submitting || !modalAmount ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}
                >
                  {submitting
                    ? 'Processing...'
                    : modalAction === 'remove'
                    ? 'Deduct Coins'
                    : modalAction === 'set'
                    ? 'Update Balance'
                    : 'Add Coins'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Full Transaction History Modal ──────────────────────────────── */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel slide-up" style={{ maxWidth: '900px', padding: '26px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={24} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  {historyUserTitle}
                </h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsHistoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter by Period Tabs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Filter Period:</span>
              {['all', 'weekly', 'monthly', 'yearly', 'custom'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setHistoryFilterPeriod(p);
                    fetchHistory(historyUserId, p);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: historyFilterPeriod === p ? 'var(--accent-primary)' : 'var(--input-bg)',
                    color: historyFilterPeriod === p ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* History Table */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table className="premium-partner-table" style={{ fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Partner</th>
                    <th>Role</th>
                    <th>Period</th>
                    <th>Adjustment</th>
                    <th>Balance (Before → After)</th>
                    <th>Reason / Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading history audit logs...
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No coin adjustments found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    historyItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </td>

                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.userName}</strong>
                          {item.agencyCode && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace' }}>
                              Code: {item.agencyCode}
                            </span>
                          )}
                        </td>

                        <td>
                          <span className={`role-pill ${item.userRole === 'super_admin' ? 'super-admin' : 'agency'}`}>
                            {item.userRole === 'super_admin' ? 'Super Admin' : 'Agency'}
                          </span>
                        </td>

                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            textTransform: 'uppercase'
                          }}>
                            {item.period}
                          </span>
                        </td>

                        <td style={{ fontWeight: 900 }}>
                          {item.action === 'remove' ? (
                            <span style={{ color: '#ef4444' }}>-{item.amount.toLocaleString()}</span>
                          ) : item.action === 'set' ? (
                            <span style={{ color: '#6366f1' }}>={item.amount.toLocaleString()}</span>
                          ) : (
                            <span style={{ color: '#10b981' }}>+{item.amount.toLocaleString()}</span>
                          )}
                        </td>

                        <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {item.previousBalance.toLocaleString()} → <strong style={{ color: 'var(--text-primary)' }}>{item.newBalance.toLocaleString()}</strong>
                        </td>

                        <td style={{ fontSize: '0.78rem' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.reason || 'Manual Adjustment'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>By: {item.adminEmail}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCoins;
