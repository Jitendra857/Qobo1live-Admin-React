import React, { useState } from 'react';
import { adminService } from '../services/api';
import { 
  Trophy, Star, TrendingUp, Plus, Trash2, 
  Upload, Shield, Award, Zap, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';

const LevelSystem: React.FC = () => {
    const [levels, setLevels] = useState<any[]>([
        { id: 1, level: 1, xp: 0, badge: 'Rookie', color: '#94a3b8' },
        { id: 2, level: 10, xp: 5000, badge: 'Elite', color: '#3b82f6' },
        { id: 3, level: 50, xp: 100000, badge: 'Master', color: '#8b5cf6' },
        { id: 4, level: 100, xp: 1000000, badge: 'Legend', color: '#f59e0b' },
    ]);

    return (
        <div className="moderation-page">
            <div className="moderation-header">
                <div className="welcome-section">
                    <h1>Level System Config</h1>
                    <p className="subtitle">Define XP thresholds and evolutionary badges</p>
                </div>
                <div className="header-actions">
                    <button className="sync-btn primary">
                        <Plus size={16} />
                        <span>Create Milestone</span>
                    </button>
                </div>
            </div>

            <div className="bento-grid">
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">Avg. User Level</div>
                        <div className="card-icon-wrap" style={{ color: '#3b82f6' }}><TrendingUp size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">14.2</div>
                        <div className="card-status positive">+2.4 this week</div>
                    </div>
                </div>
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">Legends Active</div>
                        <div className="card-icon-wrap" style={{ color: '#f59e0b' }}><Award size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">12</div>
                        <div className="card-status warning">Top 0.1%</div>
                    </div>
                </div>
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">Badge Assets</div>
                        <div className="card-icon-wrap" style={{ color: '#8b5cf6' }}><Shield size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">24</div>
                        <div className="card-status positive">All Synchronized</div>
                    </div>
                </div>
            </div>

            <div className="glass-card mt-10">
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>LEVEL MILESTONE</th>
                                <th>XP THRESHOLD</th>
                                <th>BADGE ASSET</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>PROTOCOLS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map((lvl) => (
                                <tr key={lvl.id} className="row-premium">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar-glass" style={{ background: lvl.color }}>{lvl.level}</div>
                                            <span className="name-bold">Level {lvl.level}+</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500" />
                                            <span className="font-mono font-bold">{lvl.xp.toLocaleString()} XP</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="asset-tag" style={{ color: lvl.color, borderColor: lvl.color }}>
                                            <Award size={14} />
                                            <span>{lvl.badge}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-pill active">Deployed</span>
                                    </td>
                                    <td>
                                        <div className="ops-cluster">
                                            <button className="op-btn edit"><Upload size={16} /></button>
                                            <button className="op-btn delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LevelSystem;
