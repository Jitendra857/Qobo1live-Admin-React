import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Coins, Users, ShieldCheck, Building2, Search, RefreshCw,
  PlusCircle, MinusCircle, Edit3, History, CheckSquare, Square,
  Calendar, DollarSign, Filter, X, ArrowUpRight, ArrowDownRight,
  Sliders, AlertCircle, FileText
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
  const [historyUserTitle, setHistoryUserTitle] = useState<string>('All Partners');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPartnerCoins(typeFilter, searchTerm);
      setPartners(res.data.data || []);
      // Clear selections if filtered out
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
      toast.error('Please select at least one partner using checkboxes');
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

  // Submit Coin Adjustment (Single or Bulk)
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
      const actionLabel = modalAction === 'add' ? 'added to' : modalAction === 'remove' ? 'deducted from' : 'set for';
      toast.success(`Successfully ${actionLabel} ${count} partner(s)!`);

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
    setHistoryUserTitle(userName ? `History: ${userName}` : 'All Partners History');
    setHistoryFilterPeriod('all');
    setIsHistoryOpen(true);
    fetchHistory(userId, 'all');
  };

  // Statistics calculation
  const totalAgencies = partners.filter(p => p.partnerType === 'agency').length;
  const totalSuperAdmins = partners.filter(p => p.partnerType === 'super_admin').length;
  const totalCoinsInPool = partners.reduce((sum, p) => sum + (p.coins || 0), 0);

  return (
    <div className="user-management" style={{ padding: '24px' }}>
      {/* Page Header */}
      <div className="header-actions" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Coins size={32} color="#f59e0b" />
            Partner Coins Management
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Allocate, adjust, and track <strong>My Coins</strong> earnings for Agencies & Super Admins. Withdrawable in mobile app at <strong>10,000 Coins = $1.00</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="secondary"
            onClick={() => handleOpenHistory()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              fontWeight: 600
            }}
          >
            <History size={16} color="#6366f1" />
            Full History
          </button>

          <button
            type="button"
            className="primary"
            disabled={selectedUserIds.length === 0}
            onClick={() => handleOpenBulkModal('add')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: selectedUserIds.length > 0 ? '#10b981' : '#94a3b8',
              cursor: selectedUserIds.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 700
            }}
          >
            <PlusCircle size={18} />
            Bulk Add Coins {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-container" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Partners</span>
            <Users size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#0f172a' }}>
            {partners.length}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Agencies + Super Admins</span>
        </div>

        <div className="glass-container" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Agencies</span>
            <Building2 size={20} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#0f172a' }}>
            {totalAgencies}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Registered agencies</span>
        </div>

        <div className="glass-container" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Super Admins</span>
            <ShieldCheck size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#0f172a' }}>
            {totalSuperAdmins}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Super admin partners</span>
        </div>

        <div className="glass-container" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total My Coins Balance</span>
            <Coins size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#b45309' }}>
            {totalCoinsInPool.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
            ≈ ${(totalCoinsInPool / 10000).toFixed(2)} USD Withdrawable
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-container" style={{
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: typeFilter === 'all' ? '#1e293b' : '#f1f5f9',
              color: typeFilter === 'all' ? '#fff' : '#475569'
            }}
          >
            All Partners ({partners.length})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('agency')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: typeFilter === 'agency' ? '#0284c7' : '#f1f5f9',
              color: typeFilter === 'agency' ? '#fff' : '#475569'
            }}
          >
            <Building2 size={15} />
            Agencies Only
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('super_admin')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: typeFilter === 'super_admin' ? '#7c3aed' : '#f1f5f9',
              color: typeFilter === 'super_admin' ? '#fff' : '#475569'
            }}
          >
            <ShieldCheck size={15} />
            Super Admins Only
          </button>
        </div>

        {/* Search Input & Bulk Action Quick Dropdown */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search name, code, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  width: '240px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={fetchPartners}
            title="Refresh list"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} color="#64748b" />
          </button>

          {/* Bulk Operations Dropdown */}
          {selectedUserIds.length > 0 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleOpenBulkModal('add')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                + Add Bulk
              </button>
              <button
                type="button"
                onClick={() => handleOpenBulkModal('remove')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                - Deduct Bulk
              </button>
              <button
                type="button"
                onClick={() => handleOpenBulkModal('set')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                = Set Exact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Partners List Table */}
      <div className="glass-container" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.85rem' }}>
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title={selectedUserIds.length === partners.length ? 'Deselect All' : 'Select All'}
                  >
                    {selectedUserIds.length > 0 && selectedUserIds.length === partners.length ? (
                      <CheckSquare size={18} color="#3b82f6" />
                    ) : (
                      <Square size={18} color="#94a3b8" />
                    )}
                  </button>
                </th>
                <th style={{ padding: '14px 16px' }}>Partner & Profile</th>
                <th style={{ padding: '14px 16px' }}>Type</th>
                <th style={{ padding: '14px 16px' }}>Agency Code</th>
                <th style={{ padding: '14px 16px' }}>Contact</th>
                <th style={{ padding: '14px 16px' }}>My Coins (Earning)</th>
                <th style={{ padding: '14px 16px' }}>USD Value ($1/10k)</th>
                <th style={{ padding: '14px 16px' }}>Last Incentive</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                    Loading partners data...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No agency or super admin partners found matching the filters.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => {
                  const isSelected = selectedUserIds.includes(partner.userId);
                  const usdValue = ((partner.coins || 0) / 10000).toFixed(2);

                  return (
                    <tr
                      key={partner.userId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(partner.userId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} color="#3b82f6" />
                          ) : (
                            <Square size={18} color="#cbd5e1" />
                          )}
                        </button>
                      </td>

                      {/* Partner Name & Avatar */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={partner.displayPicture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', background: '#e2e8f0' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                              {partner.name}
                            </div>
                            {partner.agencyName && partner.agencyName !== partner.name && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Agency: {partner.agencyName}
                              </div>
                            )}
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              ID: {partner.userId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Partner Type Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {partner.partnerType === 'super_admin' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ede9fe',
                            color: '#6d28d9',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <ShieldCheck size={13} />
                            SUPER ADMIN
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <Building2 size={13} />
                            AGENCY
                          </span>
                        )}
                      </td>

                      {/* Agency Code */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                        {partner.agencyCode ? (
                          <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                            {partner.agencyCode}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#475569' }}>
                        <div>{partner.email || 'No email'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{partner.phone || 'No phone'}</div>
                      </td>

                      {/* Current Coins (Earning) */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.95rem'
                        }}>
                          <Coins size={16} color="#d97706" />
                          {(partner.coins || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* USD Equivalent */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                        ${usdValue}
                      </td>

                      {/* Last Incentive Info */}
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#64748b' }}>
                        {partner.lastAdjustment ? (
                          <div>
                            <span style={{
                              display: 'inline-block',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#475569',
                              marginBottom: '2px'
                            }}>
                              {partner.lastAdjustment.period}
                            </span>
                            <div style={{ fontWeight: 600, color: partner.lastAdjustment.type === 'PARTNER_COIN_DEDUCT' ? '#ef4444' : '#10b981' }}>
                              {partner.lastAdjustment.type === 'PARTNER_COIN_DEDUCT' ? '-' : '+'}
                              {partner.lastAdjustment.amount.toLocaleString()} coins
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                              {new Date(partner.lastAdjustment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>No adjustments</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            title="Add Coins (+)"
                            onClick={() => handleOpenSingleModal(partner, 'add')}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#059669',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <PlusCircle size={14} /> Add
                          </button>

                          <button
                            type="button"
                            title="Deduct Coins (-)"
                            onClick={() => handleOpenSingleModal(partner, 'remove')}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MinusCircle size={14} /> Deduct
                          </button>

                          <button
                            type="button"
                            title="Set Balance / Edit"
                            onClick={() => handleOpenSingleModal(partner, 'set')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            title="View History"
                            onClick={() => handleOpenHistory(partner.userId, partner.name)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#6366f1',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
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
      </div>

      {/* ── Adjustment Modal (Single & Bulk) ───────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '520px', padding: '24px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Coins size={24} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {modalAction === 'add' ? 'Add My Coins' : modalAction === 'remove' ? 'Deduct My Coins' : 'Set Exact Balance'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              {/* Recipient summary banner */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Target Recipient(s):</div>
                {targetPartners.length === 1 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{targetPartners[0].name}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700 }}>
                      Current: {(targetPartners[0].coins || 0).toLocaleString()} Coins
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1rem', color: '#3b82f6' }}>
                      {targetPartners.length} Partners Selected
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      (Bulk Allocation)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Type Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Action Type:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setModalAction('add')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: modalAction === 'add' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: modalAction === 'add' ? '#ecfdf5' : '#fff',
                      color: modalAction === 'add' ? '#047857' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <PlusCircle size={15} /> Add (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalAction('remove')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: modalAction === 'remove' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: modalAction === 'remove' ? '#fef2f2' : '#fff',
                      color: modalAction === 'remove' ? '#b91c1c' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <MinusCircle size={15} /> Deduct (-)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalAction('set')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: modalAction === 'set' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                      background: modalAction === 'set' ? '#eef2ff' : '#fff',
                      color: modalAction === 'set' ? '#4338ca' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={15} /> Set Exact (=)
                  </button>
                </div>
              </div>

              {/* Period / Incentive Tag Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Incentive Period / Frequency:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(['weekly', 'monthly', 'yearly', 'custom'] as PeriodType[]).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setModalPeriod(period)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: modalPeriod === period ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                        background: modalPeriod === period ? '#eff6ff' : '#fff',
                        color: modalPeriod === period ? '#1d4ed8' : '#475569',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coin Amount Input */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {modalAction === 'set' ? 'New Total Coins Balance:' : 'Coin Amount:'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Coins size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#f59e0b' }} />
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter coin amount (e.g. 50000)"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Quick Coin Shortcuts */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {[10000, 50000, 100000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setModalAmount(String(amt))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      +{amt.toLocaleString()} (${amt / 10000})
                    </button>
                  ))}
                </div>
              </div>

              {/* USD Equivalent Calculation Banner */}
              {modalAmount && Number(modalAmount) > 0 && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>USD Withdrawable Value (10,000 = $1):</span>
                  <strong style={{ color: '#15803d', fontSize: '1rem' }}>
                    ${(Number(modalAmount) / 10000).toFixed(2)} USD
                  </strong>
                </div>
              )}

              {/* Reason / Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${modalPeriod.toUpperCase()} recruitment incentive bonus`}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !modalAmount}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: modalAction === 'remove' ? '#ef4444' : modalAction === 'set' ? '#6366f1' : '#10b981',
                    color: '#fff',
                    cursor: submitting || !modalAmount ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  {submitting ? 'Applying...' : `Confirm & Apply Coins`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Transaction History Modal ────────────────────────────── */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '850px', padding: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={22} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {historyUserTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter by Period inside History */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Filter Period:</span>
              {['all', 'weekly', 'monthly', 'yearly', 'custom'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setHistoryFilterPeriod(p);
                    fetchHistory(historyUserId, p);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: historyFilterPeriod === p ? '#3b82f6' : '#f1f5f9',
                    color: historyFilterPeriod === p ? '#fff' : '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
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
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Partner</th>
                    <th style={{ padding: '10px 12px' }}>Role</th>
                    <th style={{ padding: '10px 12px' }}>Period</th>
                    <th style={{ padding: '10px 12px' }}>Coins Change</th>
                    <th style={{ padding: '10px 12px' }}>Balance (Before → After)</th>
                    <th style={{ padding: '10px 12px' }}>Reason / Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        Loading transaction history...
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        No coin adjustment history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    historyItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </td>

                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                          {item.userName}
                          {item.agencyCode && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                              Code: {item.agencyCode}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: item.userRole === 'super_admin' ? '#ede9fe' : '#e0f2fe',
                            color: item.userRole === 'super_admin' ? '#6d28d9' : '#0369a1'
                          }}>
                            {item.userRole === 'super_admin' ? 'SUPER ADMIN' : 'AGENCY'}
                          </span>
                        </td>

                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textTransform: 'uppercase'
                          }}>
                            {item.period}
                          </span>
                        </td>

                        <td style={{ padding: '10px 12px', fontWeight: 800 }}>
                          {item.action === 'remove' ? (
                            <span style={{ color: '#ef4444' }}>-{item.amount.toLocaleString()}</span>
                          ) : item.action === 'set' ? (
                            <span style={{ color: '#6366f1' }}>={item.amount.toLocaleString()}</span>
                          ) : (
                            <span style={{ color: '#10b981' }}>+{item.amount.toLocaleString()}</span>
                          )}
                        </td>

                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {item.previousBalance.toLocaleString()} → <strong>{item.newBalance.toLocaleString()}</strong>
                        </td>

                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.75rem' }}>
                          <div>{item.reason || '—'}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>By: {item.adminEmail}</div>
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
