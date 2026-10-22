import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Search, RefreshCw, Clock, Coins, Gem, ChevronLeft, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import '../styles/UserManagement.css';

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, total: 0 });
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchTransactions = async (page = 1, type = typeFilter, search = searchTerm) => {
        try {
            setLoading(true);
            const res = await adminService.getTransactions(page, 50, type, search);
            if (res.data?.statusCode === 1 || res.data?.success) {
                const payload = res.data?.data || {};
                setTransactions(payload.transactions || []);
                setPagination(payload.pagination || { page: 1, totalPages: 1, total: 0 });
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(1, typeFilter, searchTerm);
    }, [typeFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTransactions(1, typeFilter, searchTerm);
    };

    const formatId = (id: string) => {
        if (!id) return 'N/A';
        if (id.length <= 12) return id;
        return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
    };

    return (
        <div className="user-management fade-in">
            <div className="header-actions">
                <div>
                    <h2 className="page-title">Transaction & Recharge History</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track all wallet credits, debits, and Google Play Store in-app purchases.
                    </p>
                </div>
                <div className="top-tools">
                    <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', alignItems: 'center' }}>
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by ID, User, or Order..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <button className="icon-btn" title="Refresh" onClick={() => fetchTransactions(pagination.page)}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-6 flex-wrap" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '12px' }}>
                {[
                    { key: 'all', label: 'All Transactions' },
                    { key: 'RECHARGE', label: '💳 Recharges & Google Play' },
                    { key: 'GIFT', label: '🎁 Gift Transfers' },
                    { key: 'TASK_BONUS', label: '⭐ Task & Rewards' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setTypeFilter(tab.key); }}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: typeFilter === tab.key ? '#6366f1' : '#f1f5f9',
                            color: typeFilter === tab.key ? '#ffffff' : '#475569'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="table-container-premium mt-6">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Transaction / Order ID</th>
                            <th>Type & Channel</th>
                            <th>Amount</th>
                            <th>Sender / Source</th>
                            <th>Receiver / User</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn) => {
                            const isGooglePlay = txn.provider === 'google_play' || txn.metadata?.provider === 'google_play' || txn.senderId === 'GOOGLE_PLAY_STORE';
                            const isCredit = txn.type === 'RECHARGE' || txn.type === 'SIGNUP_REWARD' || txn.type === 'DAILY_LOGIN_REWARD' || txn.type?.includes('REWARD') || txn.type?.includes('BONUS');
                            const orderId = txn.orderId || txn.metadata?.orderId;
                            const receiverName = txn.receiverName || 'User ' + (txn.receiverId ? txn.receiverId.substring(0, 6) : '');
                            const senderName = txn.senderName || (isGooglePlay ? 'Google Play Store' : 'System');

                            return (
                                <tr key={txn.id} className="row-premium">
                                    <td>
                                        <div className="identity-text">
                                            <span className="transaction-id-text" title={txn.id} style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                {formatId(txn.id)}
                                            </span>
                                            {orderId && (
                                                <span style={{ fontSize: '0.72rem', color: '#0ea5e9', display: 'block', marginTop: '2px', fontFamily: 'monospace' }} title={`Google Order ID: ${orderId}`}>
                                                    {orderId}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`asset-tag ${(txn.metadata?.currency === 'diamonds' || txn.type === 'GIFT') ? 'diamonds' : 'coins'}`}>
                                                {txn.metadata?.currency === 'diamonds' ? <Gem size={14} /> : <Coins size={14} />}
                                                {txn.type ? txn.type.replace(/_/g, ' ') : 'COINS'}
                                            </span>
                                            {isGooglePlay && (
                                                <span style={{
                                                    fontSize: '0.68rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontWeight: 800,
                                                    background: 'rgba(14, 165, 233, 0.12)',
                                                    color: '#0284c7',
                                                    border: '1px solid rgba(14, 165, 233, 0.25)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <ShoppingBag size={11} /> Google Play
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="name-bold" style={{ color: isCredit ? '#10b981' : '#ef4444', fontSize: '0.95rem' }}>
                                            {isCredit ? `+${txn.amount?.toLocaleString() || 0}` : `-${txn.amount?.toLocaleString() || 0}`}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="identity-block">
                                            <div className="avatar-glass small" style={{ background: isGooglePlay ? 'rgba(14, 165, 233, 0.15)' : undefined, color: isGooglePlay ? '#0284c7' : undefined }}>
                                                {isGooglePlay ? <ShoppingBag size={14} /> : (senderName[0] || 'S')}
                                            </div>
                                            <div className="identity-text">
                                                <span className="name-bold" style={{ color: '#1e293b' }}>{senderName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="identity-block">
                                            <div className="avatar-glass small">{(receiverName || 'U')[0]}</div>
                                            <div className="identity-text">
                                                <span className="name-bold" style={{ color: '#1e293b' }}>{receiverName}</span>
                                                <span className="data-cell-dim" style={{ fontSize: '0.7rem' }}>{formatId(txn.receiverId || '')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex-center gap-2 data-cell-dim">
                                            <Clock size={14} />
                                            {new Date(txn.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-pill active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldCheck size={12} />
                                            {txn.status || 'COMPLETED'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!loading && transactions.length === 0 && (
                    <div className="p-20 text-center color-dim">
                        No transactions found for the selected filter.
                    </div>
                )}
            </div>
            
            <div className="pagination-footer mt-6 px-6 py-4 bg-glass-dark rounded-xl flex justify-between items-center">
                <span className="data-cell-dim">Showing page <b>{pagination.page || 1}</b> of <b>{pagination.totalPages || 1}</b> ({pagination.total || 0} total)</span>
                <div className="flex gap-4">
                    <button 
                        className="op-btn wide flex gap-2 items-center" 
                        disabled={(pagination.page || 1) <= 1}
                        onClick={() => fetchTransactions((pagination.page || 1) - 1)}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>
                    <button 
                        className="op-btn wide flex gap-2 items-center" 
                        disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
                        onClick={() => fetchTransactions((pagination.page || 1) + 1)}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
