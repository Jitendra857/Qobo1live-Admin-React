import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  Sword, Trophy, Timer, Users, Zap, Shield, 
  Activity, Target, Clock, AlertCircle, RefreshCw,
  Flame, TrendingUp, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';

const PKBattleManager: React.FC = () => {
    const [battles, setBattles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);

    const mockBattles = [
        {
            id: 'PK-992831',
            status: 'active',
            room1: { title: 'Neon Lounge' },
            room2: { title: 'Global Vibes' },
            room1Score: 4520,
            room2Score: 3890,
            room1Id: 'r1',
            room2Id: 'r2',
            createdAt: new Date().toISOString()
        },
        {
            id: 'PK-992830',
            status: 'completed',
            room1: { title: 'Sultan Palace' },
            room2: { title: 'Ruby Room' },
            room1Score: 12500,
            room2Score: 15200,
            winnerId: 'r2',
            room1Id: 'r3',
            room2Id: 'r4',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    const fetchBattles = async () => {
        try {
            setLoading(true);
            const res = await adminService.getPKBattles();
            if (res.data.statusCode === 1) {
                setBattles(res.data.data || []);
                setOfflineMode(false);
            } else {
                throw new Error('API failure');
            }
        } catch (error) {
            console.error('Failed to fetch PK battles:', error);
            // Auto-fallback to mock data for demo/stability
            setBattles(mockBattles);
            setOfflineMode(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBattles();
        const interval = setInterval(fetchBattles, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="moderation-page">
            {/* Premium Header */}
            <div className="moderation-header">
                <div className="welcome-section">
                    <h1>PK Battle Center</h1>
                    <p className="subtitle">Real-time surveillance of room competitions</p>
                </div>
                <div className="header-actions">
                    {offlineMode && (
                        <div className="defcon-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                            <AlertCircle size={14} />
                            <span>OFFLINE MODE</span>
                        </div>
                    )}
                    <button className="sync-btn primary" onClick={fetchBattles}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Sync Battles</span>
                    </button>
                </div>
            </div>

            {/* Live Battles Bento */}
            <div className="bento-grid">
                {battles.filter(b => b.status === 'active').map((battle) => (
                    <div key={battle.id} className="bento-card wide" style={{ background: 'linear-gradient(135deg, #fff 0%, #fffbfb 100%)' }}>
                        <div className="card-top">
                            <div className="flex items-center gap-2">
                                <div className="live-indicator"></div>
                                <div className="card-label">LIVE COMPETITION • {battle.id.slice(0, 8)}</div>
                            </div>
                            <div className="card-icon-wrap" style={{ color: '#ef4444' }}>
                                <Sword size={20} className="pulse-slow" />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-10 px-6">
                            <div className="text-center flex-1">
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>{battle.room1?.title}</div>
                                <div className="card-value" style={{ color: '#3b82f6', fontSize: '2.5rem' }}>{battle.room1Score.toLocaleString()}</div>
                                <div className="asset-badge active mt-2" style={{ margin: '0 auto' }}>Alpha Team</div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 mx-8">
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e2e8f0' }}>VS</div>
                                <div className="p-2 rounded-full bg-red-50 text-red-500">
                                    <Flame size={20} />
                                </div>
                            </div>

                            <div className="text-center flex-1">
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>{battle.room2?.title}</div>
                                <div className="card-value" style={{ color: '#f59e0b', fontSize: '2.5rem' }}>{battle.room2Score.toLocaleString()}</div>
                                <div className="asset-badge active mt-2" style={{ margin: '0 auto', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Omega Team</div>
                            </div>
                        </div>

                        <div className="card-bottom" style={{ background: '#f8fafc', padding: '15px' }}>
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Clock size={14} /> 04:32 REMAINING
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">842 SPECTATORS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Battle History Table */}
            <div className="glass-card mt-10">
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><History size={20} /></div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Battle History Archive</h2>
                    </div>
                    <div className="search-bar compact">
                        <Target size={16} />
                        <input placeholder="Filter by room ID..." />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>BATTLE SIGNATURE</th>
                                <th>PARTICIPANTS</th>
                                <th>FINAL SCORELINE</th>
                                <th>VICTOR</th>
                                <th>TIMESTAMP</th>
                                <th style={{ textAlign: 'right' }}>PROTOCOLS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {battles.filter(b => b.status === 'completed').map((battle) => (
                                <tr key={battle.id} className="row-premium">
                                    <td>
                                        <div className="text-xs font-black font-mono text-slate-400">{battle.id}</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="asset-tag">{battle.room1?.title}</div>
                                            <span className="opacity-30 font-bold">VS</span>
                                            <div className="asset-tag">{battle.room2?.title}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 font-black text-sm">
                                            <span style={{ color: '#3b82f6' }}>{battle.room1Score}</span>
                                            <span className="opacity-20">-</span>
                                            <span style={{ color: '#f59e0b' }}>{battle.room2Score}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {battle.winnerId ? (
                                            <div className="asset-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                                <Trophy size={12} />
                                                <span>{battle.winnerId === battle.room1Id ? battle.room1?.title : battle.room2?.title}</span>
                                            </div>
                                        ) : <span className="status-pill">DRAW</span>}
                                    </td>
                                    <td>
                                        <div className="text-xs font-bold opacity-60">{new Date(battle.createdAt).toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <div className="ops-cluster">
                                            <button className="op-btn edit"><Activity size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {battles.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                        <div className="empty-state">
                                            <Zap size={40} className="mb-4 opacity-20" />
                                            <p className="font-black opacity-30">NO BATTLE REGISTRIES FOUND</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PKBattleManager;
