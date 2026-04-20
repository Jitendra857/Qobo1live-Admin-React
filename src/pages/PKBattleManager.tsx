import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Sword, Trophy, Timer, Users } from 'lucide-react';
import '../styles/UserManagement.css';

const PKBattleManager: React.FC = () => {
    const [battles, setBattles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBattles = async () => {
        // Since we don't have a list endpoint yet, we'll show a placeholder or mock
        // In a real app, this would call adminService.getPKStatus or a list endpoint
        setBattles([
            { id: '1', room1Id: 'Room A', room2Id: 'Room B', room1Score: 1200, room2Score: 850, status: 'active', timeRemaining: '02:45' },
            { id: '2', room1Id: 'Vip Room', room2Id: 'Master Stream', room1Score: 5400, room2Score: 5600, status: 'active', timeRemaining: '00:12' }
        ]);
        setLoading(false);
    };

    useEffect(() => {
        fetchBattles();
    }, []);

    return (
        <div className="user-management fade-in">
            <div className="header-actions">
                <div>
                    <h2 className="page-title">PK Battle Hub</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Monitor real-time competitions and fair play</p>
                </div>
            </div>

            <div className="bento-grid mt-10">
                {battles.map((battle) => (
                    <div key={battle.id} className="bento-card wide">
                        <div className="card-top">
                            <div className="card-label">LIVE BATTLE • {battle.id}</div>
                            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}>
                                <Sword size={24} />
                            </div>
                        </div>
                        <div className="flex-center gap-10" style={{ padding: '20px 0' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{battle.room1Id}</div>
                                <div className="card-value" style={{ color: 'var(--accent-blue)' }}>{battle.room1Score}</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, opacity: 0.3 }}>VS</div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{battle.room2Id}</div>
                                <div className="card-value" style={{ color: 'var(--accent-orange)' }}>{battle.room2Score}</div>
                            </div>
                        </div>
                        <div className="card-bottom flex-center gap-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px' }}>
                            <Timer size={16} />
                            <span style={{ fontWeight: 800 }}>{battle.timeRemaining} REMAINING</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="table-wrapper glass mt-10">
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h3 style={{ margin: 0 }}>Battle History</h3>
                </div>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Battle ID</th>
                            <th>Winner</th>
                            <th>Final Scores</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                                Fetching historic battle data...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PKBattleManager;
