import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Trophy, Plus, Trash2, Edit3, Target, X, 
    Activity, Check, Zap, ArrowUpRight, ShieldCheck, Clock
} from 'lucide-react';
import '../styles/TaskCenter.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const TaskCenter: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'DAILY',
        reward: '',
        status: 'active'
    });

    const fetchTasks = async () => {
        try {
            const res = await adminService.getTasks();
            setTasks(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Sync failure: Mission registry offline');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (task: any = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                type: task.type,
                reward: task.reward.toString(),
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                type: 'DAILY',
                reward: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
        scrollToModalTop();
    };

    // Manage background scroll lock for premium focus
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const action = editingTask ? 'update' : 'add';
            await adminService.manageTask(action, formData, editingTask?.id);
            toast.success(editingTask ? 'Mission parameters updated' : 'New high-priority mission provisioned');
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            toast.error('Registry write failure');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setTaskToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await adminService.manageTask('delete', {}, taskToDelete);
            toast.success('Mission decommissioned');
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
            fetchTasks();
        } catch (err) {
            toast.error('Decommission failure');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="dashboard-page tasks-page">
            <Toaster position="top-right" />

            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1>Growth Missions</h1>
                    <p className="subtitle">Configure engagement architecture and objectives</p>
                </div>
                <div className="header-actions">
                    <button className="secondary" onClick={fetchTasks}>
                        <Activity size={18} />
                        <span>Reload Data</span>
                    </button>
                    <button className="primary flex items-center gap-2" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Add New Task</span>
                    </button>
                </div>
            </div>

            <div className="tasks-stats-row mb-6">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-blue">Active Missions</span>
                        <span className="value">{tasks.filter(t => t.status === 'active').length}</span>
                    </div>
                    <div className="stat-icon">
                        <ShieldCheck size={32} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-green">Daily Cycle</span>
                        <span className="value">{tasks.filter(t => t.type === 'DAILY').length}</span>
                    </div>
                    <div className="stat-icon">
                        <Zap size={32} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-orange">Total Impact</span>
                        <span className="value">
                            {tasks.reduce((acc, t) => acc + (t._count?.userTasks || 0), 0)}
                        </span>
                    </div>
                    <div className="stat-icon">
                        <Trophy size={32} />
                    </div>
                </div>
            </div>

            <div className="bento-grid dynamic-task-list-grid">
                {tasks.map((task) => (
                    <div key={task.id} className="bento-card-premium">
                        <div className="card-payload">
                            <div className="card-top-identity">
                                <div className={`card-type-badge ${task.type.toLowerCase()}`}>{task.type}</div>
                                <div className="card-icon-glass" style={{ color: task.status === 'active' ? 'var(--accent-sapphire)' : '#94a3b8' }}>
                                    <Target size={22} />
                                </div>
                            </div>
                            <div className="card-mid-section">
                                <h4 className="mission-title-highdef">{task.title}</h4>
                                <p className="mission-desc-highdef">{task.description}</p>
                            </div>
                            <div className="mission-reward-pill">
                                <span className="pill-prefix">🎁</span>
                                <span className="pill-amount">{task.reward}</span>
                                <span className="pill-suffix">Coins</span>
                            </div>
                        </div>
                        <div className="card-action-bar-glass">
                            <div className="completions-tag">
                                <Clock size={12} />
                                <span>{task._count?.userTasks || 0} completions</span>
                            </div>
                            <div className="action-set">
                                <button className="minimal-action-btn edit" onClick={() => handleOpenModal(task)}>
                                    <Edit3 size={15} />
                                </button>
                                <button className="minimal-action-btn delete" onClick={() => handleDeleteClick(task.id)}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && !loading && (
                    <div className="bento-card wide empty-state">
                        <div className="empty-content">
                            <Trophy size={64} className="empty-icon-ghost" />
                            <p className="empty-text">The mission registry is currently empty.<br/>Establish objectives to catalyze user participation.</p>
                            <button className="primary mt-6" onClick={() => handleOpenModal()}>Initiate First Mission</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Mission Configuration Modal */}
            {isModalOpen && (
                <div className="modal-overlay-refined fade-in">
                    <div className="modal-content-premium slide-up" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header-glass">
                            <div className="header-identity">
                                <div className="header-icon-wrap">
                                    {editingTask ? <Edit3 size={22} /> : <Zap size={22} />}
                                </div>
                                <div>
                                    <h3 className="modal-headline">{editingTask ? 'Modify Mission' : 'Provision Mission'}</h3>
                                    <p className="modal-subline">Define engagement parameters and rewards</p>
                                </div>
                            </div>
                            <button className="close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-refined">
                            <div className="form-section">
                                <label className="input-label-premium">Mission Title</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="text" 
                                        className="premium-input-field"
                                        placeholder="e.g. Master of PK Battles..."
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">Description & Objectives</label>
                                <div className="input-wrapper-glass">
                                    <textarea 
                                        className="premium-input-field"
                                        style={{ height: '80px', resize: 'none' }}
                                        placeholder="Detail the specific actions required..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-row-premium">
                                <div className="form-section">
                                    <label className="input-label-premium">Priority Tier (Type)</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="DAILY">Daily Cycle</option>
                                            <option value="WEEKLY">Weekly Marathon</option>
                                            <option value="ONE_TIME">Prime Milestone</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Reward Allocation (Coins)</label>
                                    <div className="input-wrapper-glass">
                                        <span className="input-prefix-icon">🎁</span>
                                        <input 
                                            type="number" 
                                            className="premium-input-field with-prefix"
                                            value={formData.reward}
                                            onChange={e => setFormData({...formData, reward: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">Operation Status</label>
                                <div className="radio-group">
                                    <label className={`radio-option ${formData.status === 'active' ? 'active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="taskStatus" 
                                            value="active"
                                            checked={formData.status === 'active'}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                        />
                                        <span>Active (1)</span>
                                    </label>
                                    <label className={`radio-option ${formData.status === 'draft' ? 'active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="taskStatus" 
                                            value="draft"
                                            checked={formData.status === 'draft'}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                        />
                                        <span>Inactive (0)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>Processing Registry...</>
                                    ) : (
                                        <>
                                            {editingTask ? 'Sync Parameters' : 'Authorize Deployment'}
                                            <ArrowUpRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal 
                    title="Mission Decoupling Authorization"
                    message="You are about to decommission this mission from the global registry. All active progress data for users will be archived. Verify authorization to proceed."
                    confirmText="Authorize Decommission"
                    cancelText="Abort Operation"
                    type="danger"
                    onConfirm={confirmDelete}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default TaskCenter;
