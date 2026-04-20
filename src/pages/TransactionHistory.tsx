import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Search, RefreshCw, ArrowUpRight, ArrowDownLeft, Clock, User, Coins, Gem, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/UserManagement.css'; // Reuse existing table styles

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>({});

    const fetchTransactions = async (page = 1) => {
        try {
            setLoading(true);
            const res = await adminService.getTransactions(page);
            if (res.data.success) {
                setTransactions(res.data.data.transactions);
                setPagination(res.data.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const formatId = (id: string) => `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;

    return (
        <div className="user-management fade-in">
            <div className="header-actions">
                <h2 className="page-title">Transaction History</h2>
                <div className="top-tools">
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder="Search by ID or User..." />
                    </div>
                    <button className="icon-btn" onClick={() => fetchTransactions()}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="table-container-premium mt-10">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Receiver</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn) => (
                            <tr key={txn.id} className="row-premium">
                                <td>
                                    <div className="identity-text">
                                        <span className="transaction-id-text" title={txn.id}>{formatId(txn.id)}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`asset-tag ${(txn.metadata?.currency === 'diamonds' || txn.type === 'GIFT') ? 'diamonds' : 'coins'}`}>
                                        {txn.metadata?.currency === 'diamonds' ? <Gem size={14} /> : <Coins size={14} />}
                                        {txn.metadata?.currency ? txn.metadata.currency.toUpperCase() : 'MANUAL RECHARGE'}
                                    </span>
                                </td>
                                <td>
                                    <span className="name-bold" style={{ color: txn.type === 'RECHARGE' ? '#10b981' : '#ef4444' }}>
                                        {txn.amount}
                                    </span>
                                </td>
                                <td>
                                    <div className="identity-block">
                                        <div className="avatar-glass small">{txn.receiverName[0]}</div>
                                        <div className="identity-text">
                                            <span className="name-bold" style={{ color: '#1e293b' }}>{txn.receiverName}</span>
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
                                    <span className="status-pill active">
                                        {txn.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && transactions.length === 0 && (
                    <div className="p-20 text-center color-dim">
                        No transactions found in system logs.
                    </div>
                )}
            </div>
            
            <div className="pagination-footer mt-10 px-6 py-4 bg-glass-dark rounded-xl flex justify-between items-center">
                <span className="data-cell-dim">Showing page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b></span>
                <div className="flex gap-4">
                    <button 
                        className="op-btn wide flex gap-2 items-center" 
                        disabled={pagination.page <= 1}
                        onClick={() => fetchTransactions(pagination.page - 1)}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>
                    <button 
                        className="op-btn wide flex gap-2 items-center" 
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchTransactions(pagination.page + 1)}
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
