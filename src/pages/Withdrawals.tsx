import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../services/api';
import { 
  Wallet, CheckCircle2, XCircle, Search, RefreshCw, Copy, 
  ExternalLink, Clock, AlertTriangle, Check, X, ShieldAlert,
  ArrowUpRight, Building2, CreditCard, User, Info, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

interface WithdrawalItem {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  bankDetails: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    displayPicture?: string;
    gender?: string;
    level?: number;
    diamonds?: number;
    coins?: number;
    role?: string;
  };
}

interface WithdrawalStats {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingAmount: number;
  approvedAmount: number;
}

const PRESET_REJECT_REASONS = [
  'Invalid UPI ID / VPA not found',
  'Bank Account Number or IFSC Code is incorrect',
  'Account Holder Name mismatch with registered user',
  'KYC verification / identity proof required',
  'Account frozen or rejected by recipient bank',
  'Withdrawal limit exceeded for this billing cycle'
];

const Withdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalItem[]>([]);
  const [stats, setStats] = useState<WithdrawalStats>({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingAmount: 0,
    approvedAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalItem | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Form inputs for modals
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await adminService.getWithdrawals();
      const rawData = res.data?.data;

      if (Array.isArray(rawData)) {
        setRequests(rawData);
        // Calculate local fallback stats if backend didn't return stats object
        let pendingCnt = 0;
        let approvedCnt = 0;
        let rejectedCnt = 0;
        let pendingAmt = 0;
        let approvedAmt = 0;
        rawData.forEach((item: any) => {
          const s = (item.status || 'pending').toLowerCase();
          const amt = Number(item.amount) || 0;
          if (s === 'pending') {
            pendingCnt++;
            pendingAmt += amt;
          } else if (s === 'approved' || s === 'completed') {
            approvedCnt++;
            approvedAmt += amt;
          } else if (s === 'rejected' || s === 'failed') {
            rejectedCnt++;
          }
        });
        setStats({
          totalCount: rawData.length,
          pendingCount: pendingCnt,
          approvedCount: approvedCnt,
          rejectedCount: rejectedCnt,
          pendingAmount: pendingAmt,
          approvedAmount: approvedAmt
        });
      } else if (rawData && typeof rawData === 'object') {
        setRequests(rawData.requests || []);
        if (rawData.stats) {
          setStats(rawData.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch withdrawal requests:', err);
      toast.error(err.response?.data?.message || 'Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter requests based on tab and search
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const reqStatus = (req.status || 'pending').toLowerCase();
      // Tab filter
      if (activeTab === 'pending' && reqStatus !== 'pending') return false;
      if (activeTab === 'approved' && reqStatus !== 'approved' && reqStatus !== 'completed') return false;
      if (activeTab === 'rejected' && reqStatus !== 'rejected' && reqStatus !== 'failed') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (req.user?.name || '').toLowerCase();
        const userPhone = (req.user?.phone || '').toLowerCase();
        const userEmail = (req.user?.email || '').toLowerCase();
        const reqId = (req.id || '').toLowerCase();
        
        const details = req.bankDetails || {};
        const holder = String(details.holder_name || details.holderName || details.holder || '').toLowerCase();
        const bankName = String(details.bank_name || details.bankName || details.bank || '').toLowerCase();
        const account = String(details.account_number || details.accountNumber || details.account || '').toLowerCase();
        const ifsc = String(details.ifsc_code || details.ifscCode || details.ifsc || '').toLowerCase();
        const upi = String(details.upi_id || details.upi || details.upiId || '').toLowerCase();

        return (
          userName.includes(q) ||
          userPhone.includes(q) ||
          userEmail.includes(q) ||
          reqId.includes(q) ||
          holder.includes(q) ||
          bankName.includes(q) ||
          account.includes(q) ||
          ifsc.includes(q) ||
          upi.includes(q)
        );
      }

      return true;
    });
  }, [requests, activeTab, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Open Approve Modal
  const openApproveModal = (req: WithdrawalItem) => {
    setSelectedRequest(req);
    setAdminNote('');
    setApproveModalOpen(true);
  };

  // Open Reject Modal
  const openRejectModal = (req: WithdrawalItem) => {
    setSelectedRequest(req);
    setRejectReason(PRESET_REJECT_REASONS[0]);
    setRejectModalOpen(true);
  };

  // Open Details Modal
  const openDetailsModal = (req: WithdrawalItem) => {
    setSelectedRequest(req);
    setDetailsModalOpen(true);
  };

  // Execute Approve Request
  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await adminService.processWithdrawal({
        id: selectedRequest.id,
        status: 'approved',
        adminNote: adminNote.trim() || 'Approved by Admin'
      });
      if (res.data?.statusCode === 1 || res.status === 200) {
        toast.success(`Withdrawal request for ₹${selectedRequest.amount} approved!`);
        setApproveModalOpen(false);
        setSelectedRequest(null);
        fetchWithdrawals();
      } else {
        toast.error(res.data?.message || 'Failed to approve request');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error processing approval');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Reject Request
  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminService.processWithdrawal({
        id: selectedRequest.id,
        status: 'rejected',
        reason: rejectReason.trim(),
        adminNote: rejectReason.trim()
      });
      if (res.data?.statusCode === 1 || res.status === 200) {
        toast.success(`Withdrawal rejected. ₹${selectedRequest.amount} refunded to user.`);
        setRejectModalOpen(false);
        setSelectedRequest(null);
        fetchWithdrawals();
      } else {
        toast.error(res.data?.message || 'Failed to reject request');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error processing rejection');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="user-management fade-in" style={{ padding: '24px 32px' }}>
      {/* Page Header */}
      <div className="header-actions" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
            }}>
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="page-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>
                Withdrawal & Payout Management
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
                Review, approve, or reject user payment withdrawal requests. Rejections automatically refund diamonds.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={fetchWithdrawals}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        margin: '24px 0'
      }}>
        {/* Pending Card */}
        <div 
          onClick={() => setActiveTab('pending')}
          style={{
            background: activeTab === 'pending' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : '#ffffff',
            border: activeTab === 'pending' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Requests
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>
            {stats.pendingCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '4px', fontWeight: 600 }}>
            ₹{stats.pendingAmount.toLocaleString()} awaiting payout
          </div>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => setActiveTab('approved')}
          style={{
            background: activeTab === 'approved' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#ffffff',
            border: activeTab === 'approved' ? '2px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Approved / Paid
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>
            {stats.approvedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
            ₹{stats.approvedAmount.toLocaleString()} total paid out
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setActiveTab('rejected')}
          style={{
            background: activeTab === 'rejected' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : '#ffffff',
            border: activeTab === 'rejected' ? '2px solid #ef4444' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rejected / Refunded
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>
            {stats.rejectedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
            Diamonds refunded to users
          </div>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setActiveTab('all')}
          style={{
            background: activeTab === 'all' ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' : '#ffffff',
            border: activeTab === 'all' ? '2px solid #64748b' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Requests
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>
            {stats.totalCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            Lifetime submissions
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        margin: '20px 0 16px 0',
        padding: '12px 16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'pending' ? '#f59e0b' : '#f1f5f9',
              color: activeTab === 'pending' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Pending
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              background: activeTab === 'pending' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeTab === 'pending' ? '#ffffff' : '#475569'
            }}>
              {stats.pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'approved' ? '#10b981' : '#f1f5f9',
              color: activeTab === 'approved' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Approved
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              background: activeTab === 'approved' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeTab === 'approved' ? '#ffffff' : '#475569'
            }}>
              {stats.approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'rejected' ? '#ef4444' : '#f1f5f9',
              color: activeTab === 'rejected' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Rejected
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              background: activeTab === 'rejected' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeTab === 'rejected' ? '#ffffff' : '#475569'
            }}>
              {stats.rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'all' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            All Requests
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              background: activeTab === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeTab === 'all' ? '#ffffff' : '#475569'
            }}>
              {stats.totalCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '8px 14px',
          width: '100%',
          maxWidth: '360px'
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by name, phone, bank, UPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: '#0f172a'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payout / Bank Information</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requested At</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 12px auto' }} />
                    <div>Loading withdrawal requests...</div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                    <Wallet size={40} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No withdrawal requests found</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                      {searchQuery ? `No results matching "${searchQuery}" in ${activeTab} tab` : `No requests currently in ${activeTab} status`}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const details = req.bankDetails || {};
                  const holder = details.holder_name || details.holderName || details.holder || details.name || req.user?.name || 'N/A';
                  const bankName = details.bank_name || details.bankName || details.bank || null;
                  const accountNum = details.account_number || details.accountNumber || details.account || null;
                  const ifsc = details.ifsc_code || details.ifscCode || details.ifsc || null;
                  const upi = details.upi_id || details.upi || details.upiId || details.upi_id_vpa || null;
                  const adminNote = details.adminNote || details.note || null;
                  const rejectReason = details.rejectReason || details.reason || null;

                  const statusStr = (req.status || 'pending').toLowerCase();
                  const isPending = statusStr === 'pending';
                  const isApproved = statusStr === 'approved' || statusStr === 'completed';
                  const isRejected = statusStr === 'rejected' || statusStr === 'failed';

                  return (
                    <tr 
                      key={req.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9', 
                        transition: 'background 0.15s',
                        background: '#ffffff'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* User Column */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {req.user?.displayPicture ? (
                            <img 
                              src={req.user.displayPicture} 
                              alt={req.user.name || 'User'} 
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                          ) : (
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem'
                            }}>
                              {req.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {req.user?.name || 'Unknown User'}
                              {req.user?.role && req.user.role !== 'user' && (
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#e0e7ff',
                                  color: '#4338ca',
                                  fontWeight: 700,
                                  textTransform: 'uppercase'
                                }}>
                                  {req.user.role}
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                              {req.user?.phone || req.user?.email || `ID: ${req.userId?.substring(0, 8)}...`}
                            </div>
                            {req.user?.diamonds !== undefined && (
                              <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>
                                Wallet Bal: {req.user.diamonds.toLocaleString()} Diamonds
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>
                          ₹{Number(req.amount).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                          ({Number(req.amount).toLocaleString()} Diamonds)
                        </div>
                      </td>

                      {/* Bank / Payout Information */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          maxWidth: '320px',
                          fontSize: '0.825rem'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#64748b' }}>Holder:</span>
                              <strong style={{ color: '#0f172a' }}>{holder}</strong>
                            </div>

                            {upi && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>UPI:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ color: '#2563eb' }}>{upi}</strong>
                                  <button
                                    onClick={() => handleCopy(upi, 'UPI ID')}
                                    title="Copy UPI ID"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {accountNum && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>Account:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ color: '#0f172a' }}>{accountNum}</strong>
                                  <button
                                    onClick={() => handleCopy(accountNum, 'Account Number')}
                                    title="Copy Account Number"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {ifsc && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>IFSC:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ color: '#0f172a' }}>{ifsc}</strong>
                                  <button
                                    onClick={() => handleCopy(ifsc, 'IFSC Code')}
                                    title="Copy IFSC"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {bankName && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>Bank:</span>
                                <span style={{ color: '#334155', fontWeight: 600 }}>{bankName}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => openDetailsModal(req)}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '5px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#2563eb',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <Info size={13} /> View Full Payout Details
                          </button>
                        </div>
                      </td>

                      {/* Requested At */}
                      <td style={{ padding: '16px 20px', fontSize: '0.825rem', color: '#475569' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(req.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {isPending && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                            PENDING
                          </div>
                        )}
                        {isApproved && (
                          <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800 }}>
                              <CheckCircle2 size={13} />
                              APPROVED
                            </div>
                            {adminNote && (
                              <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '4px', maxWidth: '180px' }}>
                                Ref: {adminNote}
                              </div>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800 }}>
                              <XCircle size={13} />
                              REJECTED
                            </div>
                            {rejectReason && (
                              <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', maxWidth: '180px' }} title={rejectReason}>
                                Reason: {rejectReason}
                              </div>
                            )}
                            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                              ✓ Diamonds Refunded
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button
                              onClick={() => openApproveModal(req)}
                              title="Approve Withdrawal Request"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
                            >
                              <CheckCircle2 size={15} /> Approve
                            </button>

                            <button
                              onClick={() => openRejectModal(req)}
                              title="Reject & Refund Diamonds"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                background: '#ffffff',
                                color: '#ef4444',
                                border: '1px solid #fca5a5',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                                e.currentTarget.style.borderColor = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#fca5a5';
                              }}
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVE MODAL */}
      {approveModalOpen && selectedRequest && (
        <div className="modal-overlay-refined" style={{ zIndex: 100000 }}>
          <div className="modal-content-premium" style={{ maxWidth: '520px', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              borderBottom: '1px solid #a7f3d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#064e3b' }}>
                    Approve Payout Request
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: '#047857' }}>
                    Confirm that funds have been transferred or authorized
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setApproveModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#047857' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Summary Details Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>User:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{selectedRequest.user?.name || 'User'} ({selectedRequest.user?.phone || selectedRequest.userId})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payout Amount:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.25rem' }}>₹{Number(selectedRequest.amount).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Destination:</span>
                  <strong style={{ color: '#2563eb', fontSize: '0.875rem' }}>
                    {selectedRequest.bankDetails?.upi_id || selectedRequest.bankDetails?.upi || selectedRequest.bankDetails?.account_number || 'Bank Account'}
                  </strong>
                </div>
              </div>

              {/* Transaction Ref / Note Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Transaction Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR1293847291 / IMPS Ref"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Will be recorded on the payout transaction receipt.
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  disabled={actionLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? <RefreshCw size={16} className="spin-animation" /> : <Check size={16} />}
                  Confirm & Approve Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && selectedRequest && (
        <div className="modal-overlay-refined" style={{ zIndex: 100000 }}>
          <div className="modal-content-premium" style={{ maxWidth: '540px', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#7f1d1d' }}>
                    Reject Withdrawal Request
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: '#991b1b' }}>
                    Diamonds will be automatically refunded to user
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRejectModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#991b1b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Refund Notice Box */}
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
                  Rejecting this request will immediately <strong>refund ₹{selectedRequest.amount} ({selectedRequest.amount} Diamonds)</strong> back to <strong>{selectedRequest.user?.name || 'the user'}</strong>'s active wallet balance.
                </div>
              </div>

              {/* Preset Reason Chips */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Quick Preset Reasons:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PRESET_REJECT_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: rejectReason === preset ? '1px solid #ef4444' : '1px solid #e2e8f0',
                        background: rejectReason === preset ? '#fee2e2' : '#f8fafc',
                        color: rejectReason === preset ? '#b91c1c' : '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason for Rejection (Shown to User):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify why this payout request is rejected..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={actionLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? <RefreshCw size={16} className="spin-animation" /> : <XCircle size={16} />}
                  Reject & Refund Diamonds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL DETAILS MODAL */}
      {detailsModalOpen && selectedRequest && (
        <div className="modal-overlay-refined" style={{ zIndex: 100000 }}>
          <div className="modal-content-premium" style={{ maxWidth: '520px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  Complete Payout Information
                </h3>
              </div>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* User Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>User:</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedRequest.user?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedRequest.user?.phone || selectedRequest.userId}</div>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Amount:</span>
                  <strong style={{ color: '#059669', fontSize: '1.25rem' }}>₹{Number(selectedRequest.amount).toLocaleString()}</strong>
                </div>

                {/* Holder Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Holder Name:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#0f172a' }}>
                      {selectedRequest.bankDetails?.holder_name || selectedRequest.bankDetails?.holderName || selectedRequest.bankDetails?.name || selectedRequest.user?.name || 'N/A'}
                    </strong>
                    <button 
                      onClick={() => handleCopy(selectedRequest.bankDetails?.holder_name || selectedRequest.bankDetails?.name || selectedRequest.user?.name || '', 'Holder Name')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* UPI ID */}
                {(selectedRequest.bankDetails?.upi_id || selectedRequest.bankDetails?.upi || selectedRequest.bankDetails?.upiId) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>UPI ID:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#1d4ed8', fontSize: '0.95rem' }}>
                        {selectedRequest.bankDetails?.upi_id || selectedRequest.bankDetails?.upi || selectedRequest.bankDetails?.upiId}
                      </strong>
                      <button 
                        onClick={() => handleCopy(selectedRequest.bankDetails?.upi_id || selectedRequest.bankDetails?.upi || selectedRequest.bankDetails?.upiId, 'UPI ID')}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1d4ed8' }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Account Number */}
                {(selectedRequest.bankDetails?.account_number || selectedRequest.bankDetails?.accountNumber || selectedRequest.bankDetails?.account) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Account Number:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>
                        {selectedRequest.bankDetails?.account_number || selectedRequest.bankDetails?.accountNumber || selectedRequest.bankDetails?.account}
                      </strong>
                      <button 
                        onClick={() => handleCopy(selectedRequest.bankDetails?.account_number || selectedRequest.bankDetails?.accountNumber || selectedRequest.bankDetails?.account, 'Account Number')}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* IFSC Code */}
                {(selectedRequest.bankDetails?.ifsc_code || selectedRequest.bankDetails?.ifscCode || selectedRequest.bankDetails?.ifsc) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>IFSC Code:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>
                        {selectedRequest.bankDetails?.ifsc_code || selectedRequest.bankDetails?.ifscCode || selectedRequest.bankDetails?.ifsc}
                      </strong>
                      <button 
                        onClick={() => handleCopy(selectedRequest.bankDetails?.ifsc_code || selectedRequest.bankDetails?.ifscCode || selectedRequest.bankDetails?.ifsc, 'IFSC Code')}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Bank Name */}
                {(selectedRequest.bankDetails?.bank_name || selectedRequest.bankDetails?.bankName || selectedRequest.bankDetails?.bank) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Bank Name:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {selectedRequest.bankDetails?.bank_name || selectedRequest.bankDetails?.bankName || selectedRequest.bankDetails?.bank}
                    </strong>
                  </div>
                )}

                {/* Request ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Transaction ID:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>{selectedRequest.id}</span>
                    <button 
                      onClick={() => handleCopy(selectedRequest.id, 'Transaction ID')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
