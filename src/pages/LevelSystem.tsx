import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Shield, TrendingUp, Plus, Trash2, 
  Download, Edit, Check, X, ArrowUpRight, Zap
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const LevelSystem: React.FC = () => {
    // Interactive State loaded from LocalStorage or seeded defaults
    const [levels, setLevels] = useState<any[]>(() => {
        const saved = localStorage.getItem('qobo1_levels');
        if (saved) {
            try {
                return JSON.parse(saved).sort((a: any, b: any) => a.level - b.level);
            } catch (e) {
                console.error("Failed to parse saved levels", e);
            }
        }
        return [
            { id: '1', level: 1, xp: 0, badge: 'Rookie', color: '#94a3b8' },
            { id: '2', level: 10, xp: 5000, badge: 'Elite', color: '#3b82f6' },
            { id: '3', level: 50, xp: 100000, badge: 'Master', color: '#8b5cf6' },
            { id: '4', level: 100, xp: 1000000, badge: 'Legend', color: '#f59e0b' },
        ];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        level: '',
        xp: '',
        badge: '',
        color: '#3b82f6'
    });

    // Save state to localStorage
    const saveLevels = (updatedLevels: any[]) => {
        const sorted = [...updatedLevels].sort((a, b) => a.level - b.level);
        setLevels(sorted);
        localStorage.setItem('qobo1_levels', JSON.stringify(sorted));
    };

    const handleOpenModal = (lvl: any = null) => {
        if (lvl) {
            setEditingLevel(lvl);
            setFormData({
                level: lvl.level.toString(),
                xp: lvl.xp.toString(),
                badge: lvl.badge,
                color: lvl.color
            });
        } else {
            setEditingLevel(null);
            setFormData({
                level: '',
                xp: '',
                badge: '',
                color: '#3b82f6'
            });
        }
        setIsModalOpen(true);
        scrollToModalTop();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.level === '' || formData.xp === '' || !formData.badge.trim()) {
            toast.error('Please enter complete milestone parameters.');
            return;
        }

        const newLvl = {
            id: editingLevel ? editingLevel.id : Math.random().toString(36).substr(2, 9),
            level: parseInt(formData.level, 10),
            xp: parseInt(formData.xp, 10),
            badge: formData.badge.trim(),
            color: formData.color
        };

        if (isNaN(newLvl.level) || isNaN(newLvl.xp) || newLvl.level <= 0 || newLvl.xp < 0) {
            toast.error('Milestone level and XP threshold must be valid positive numbers.');
            return;
        }

        // Check for duplicates
        const duplicate = levels.find(l => l.level === newLvl.level && (!editingLevel || l.id !== editingLevel.id));
        if (duplicate) {
            toast.error(`A level milestone for Level ${newLvl.level} already exists.`);
            return;
        }

        let updatedList;
        if (editingLevel) {
            updatedList = levels.map(l => l.id === editingLevel.id ? newLvl : l);
            toast.success(`Milestone Level ${newLvl.level}+ has been updated!`);
        } else {
            updatedList = [...levels, newLvl];
            toast.success(`Milestone Level ${newLvl.level}+ provisioned successfully!`);
        }

        saveLevels(updatedList);
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        const lvlToDelete = levels.find(l => l.id === id);
        if (lvlToDelete && lvlToDelete.level === 1) {
            toast.error('Baseline Level 1 milestone cannot be purged.');
            setShowDeleteConfirm(null);
            return;
        }

        const filtered = levels.filter(l => l.id !== id);
        saveLevels(filtered);
        toast.success('Level milestone purged successfully.');
        setShowDeleteConfirm(null);
    };

    const handleDownloadMilestone = (lvl: any) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lvl, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `milestone_level_${lvl.level}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success(`Downloaded configuration template for Level ${lvl.level}!`);
    };

    const handleDownloadAll = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levels, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `level_system_config.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success(`Downloaded all ${levels.length} levels configuration!`);
    };

    return (
        <div className="dashboard-page level-system">
            <Toaster position="top-right" />
            
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Level System Config</h1>
                    <p className="subtitle">Define XP thresholds and evolutionary badges</p>
                </div>
                <div className="header-actions">
                    <button className="secondary flex items-center gap-2" onClick={handleDownloadAll} title="Export Configurations">
                        <Download size={16} />
                        <span>Export JSON</span>
                    </button>
                    <button className="primary flex items-center gap-2" onClick={() => handleOpenModal()}>
                        <Plus size={16} />
                        <span>Create Milestone</span>
                    </button>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-blue">Avg. User Level</span>
                        <span className="value">14.2</span>
                    </div>
                    <div className="stat-icon">
                        <TrendingUp size={32} color="#dddfeb" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-orange">Legends Active</span>
                        <span className="value">12</span>
                    </div>
                    <div className="stat-icon">
                        <Award size={32} color="#dddfeb" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-purple">Badge Assets</span>
                        <span className="value">{levels.length}</span>
                    </div>
                    <div className="stat-icon">
                        <Shield size={32} color="#dddfeb" />
                    </div>
                </div>
            </div>

            <div className="glass-card mt-10">
                <div className="table-wrapper" style={{ marginTop: '0' }}>
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
                                            <div className="avatar-glass" style={{ background: lvl.color, color: '#fff', fontSize: '0.85rem' }}>{lvl.level}</div>
                                            <span className="name-bold">Level {lvl.level}+</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500" />
                                            <span className="font-mono font-bold" style={{ color: '#475569' }}>{lvl.xp.toLocaleString()} XP</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="asset-tag" style={{ color: lvl.color, borderColor: lvl.color, background: `${lvl.color}0a` }}>
                                            <Award size={14} />
                                            <span>{lvl.badge}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-pill active">Deployed</span>
                                    </td>
                                    <td>
                                        <div className="ops-cluster">
                                            <button className="op-btn edit" onClick={() => handleOpenModal(lvl)} title="Edit Milestone">
                                                <Edit size={16} />
                                            </button>
                                            <button className="op-btn coin" onClick={() => handleDownloadMilestone(lvl)} title="Download Milestone JSON">
                                                <Download size={16} />
                                            </button>
                                            <button className="op-btn delete" onClick={() => setShowDeleteConfirm(lvl.id)} title="Delete Milestone">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay-refined fade-in">
                    <div className="modal-content-premium slide-up" style={{ maxWidth: '500px', width: '90%' }}>
                        <div className="modal-header-glass">
                            <div className="header-identity">
                                <div className="header-icon-wrap" style={{ background: formData.color, color: '#fff' }}>
                                    {editingLevel ? <Edit size={22} /> : <Plus size={22} />}
                                </div>
                                <div>
                                    <h3 className="modal-headline">{editingLevel ? 'Update Milestone' : 'Provision Milestone'}</h3>
                                    <p className="modal-subline">Configure dynamic XP limits and tier rewards</p>
                                </div>
                            </div>
                            <button className="close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-refined">
                            <div className="form-section">
                                <label className="input-label-premium">Level Milestone</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="premium-input-field"
                                        placeholder="e.g. 50"
                                        value={formData.level}
                                        onChange={e => setFormData({...formData, level: e.target.value})}
                                        required
                                        disabled={editingLevel && editingLevel.level === 1}
                                    />
                                </div>
                                {editingLevel && editingLevel.level === 1 && (
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>Base milestone level cannot be mutated.</span>
                                )}
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">XP Threshold</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="premium-input-field"
                                        placeholder="e.g. 100000"
                                        value={formData.xp}
                                        onChange={e => setFormData({...formData, xp: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">Badge Asset Name</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="text" 
                                        className="premium-input-field"
                                        placeholder="e.g. Grandmaster"
                                        value={formData.badge}
                                        onChange={e => setFormData({...formData, badge: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">Milestone Visual Brand Color</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                    <input 
                                        type="color" 
                                        style={{ width: '40px', height: '40px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '0', background: 'none' }}
                                        value={formData.color}
                                        onChange={e => setFormData({...formData, color: e.target.value})}
                                    />
                                    <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{formData.color.toUpperCase()}</span>
                                </div>
                            </div>

                            <button type="submit" className="primary-glass-submit">
                                <span>{editingLevel ? 'Save Changes' : 'Publish Milestone'}</span>
                                <ArrowUpRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Security Override Required"
                    message="You are about to permanently purge this Level Milestone from the ecosystem. This operation cannot be reversed."
                    confirmText="Verify & Delete"
                    cancelText="Abort Operation"
                    type="danger"
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default LevelSystem;
