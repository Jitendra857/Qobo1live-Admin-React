import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Trophy, Plus, Trash2, Edit3, Target, X, 
    Activity, ShieldCheck, Clock, Users, Building2, Coins, Tv, Radio, Video, Zap, ArrowUpRight
} from 'lucide-react';
import '../styles/TaskCenter.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const TaskCenter: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Comprehensive Target & Bonus Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetCategory: 'HOST',
        frequency: 'DAILY',
        roomType: 'LIVE_STREAM',
        targetMetric: 'DURATION',
        targetValue: '120',
        reward: '50',
        status: 'active'
    });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await adminService.getTasks();
            setTasks(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Sync failure: Task registry offline');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (task: any = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                targetCategory: task.targetCategory || 'HOST',
                frequency: task.frequency || task.type || 'DAILY',
                roomType: task.roomType || 'LIVE_STREAM',
                targetMetric: task.targetMetric || 'DURATION',
                targetValue: (task.targetValue !== undefined && task.targetValue !== null) ? task.targetValue.toString() : '120',
                reward: task.reward ? task.reward.toString() : '50',
                status: task.status || 'active'
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                targetCategory: selectedCategory === 'ALL' ? 'HOST' : selectedCategory,
                frequency: 'DAILY',
                roomType: 'LIVE_STREAM',
                targetMetric: 'DURATION',
                targetValue: '120',
                reward: '50',
                status: 'active'
            });
        }
        setIsModalOpen(true);
        scrollToModalTop();
    };

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
            const payload = {
                ...formData,
                type: formData.frequency,
                targetValue: parseFloat(formData.targetValue) || 120,
                reward: parseInt(formData.reward) || 0
            };
            await adminService.manageTask(action, payload, editingTask?.id);
            toast.success(editingTask ? 'Target task parameters updated' : 'New target & bonus task deployed');
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
            toast.success('Task decommissioned');
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

    // Filter tasks based on selected tab
    const filteredTasks = tasks.filter(t => {
        if (selectedCategory === 'ALL') return true;
        const category = (t.targetCategory || 'ALL').toUpperCase();
        return category === selectedCategory || category === 'ALL';
    });

    const getCategoryBadgeClass = (category: string) => {
        switch ((category || '').toUpperCase()) {
            case 'HOST': return 'badge-host';
            case 'AGENCY': return 'badge-agency';
            case 'COINS_SELLER': return 'badge-seller';
            default: return 'badge-all';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch ((category || '').toUpperCase()) {
            case 'HOST': return 'Host';
            case 'AGENCY': return 'Agency';
            case 'COINS_SELLER': return 'Coins Seller';
            default: return 'All Users';
        }
    };

    const getRoomTypeLabel = (roomType: string) => {
        switch ((roomType || '').toUpperCase()) {
            case 'LIVE_STREAM': return 'Live Streaming';
            case 'AUDIO_ROOM': return 'Audio Room';
            case 'VIDEO_ROOM': return 'Video Room';
            default: return 'Any Stream / Room';
        }
    };

    const getMetricDisplay = (task: any) => {
        const val = task.targetValue || 120;
        const metric = (task.targetMetric || 'DURATION').toUpperCase();
        if (metric === 'DURATION') {
            if (val >= 60 && val % 60 === 0) {
                return `${val / 60} ${val / 60 === 1 ? 'Hour' : 'Hours'}`;
            }
            return `${val} Mins`;
        }
        if (metric === 'SESSION_COUNT') {
            return `${val} ${val === 1 ? 'Session' : 'Sessions'}`;
        }
        if (metric === 'COIN_TARGET') {
            return `${val} Coins`;
        }
        return `${val}`;
    };

    return (
        <div className="dashboard-page tasks-page">
            <Toaster position="top-right" />

            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1>Target & Bonus Tasks</h1>
                    <p className="subtitle">Configure category-wise target tasks, bonus coins, and streaming requirements</p>
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

            {/* Overview Metric Stats */}
            <div className="tasks-stats-row mb-6">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-blue">Active Tasks</span>
                        <span className="value">{tasks.filter(t => t.status === 'active').length}</span>
                    </div>
                    <div className="stat-icon">
                        <ShieldCheck size={32} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-purple">Host Targets</span>
                        <span className="value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'HOST').length}</span>
                    </div>
                    <div className="stat-icon">
                        <Tv size={32} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-cyan">Agency Targets</span>
                        <span className="value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'AGENCY').length}</span>
                    </div>
                    <div className="stat-icon">
                        <Building2 size={32} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-orange">Coins Seller Targets</span>
                        <span className="value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'COINS_SELLER').length}</span>
                    </div>
                    <div className="stat-icon">
                        <Coins size={32} />
                    </div>
                </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="task-category-tabs-container mb-6">
                <div className="task-category-tabs">
                    <button 
                        className={`tab-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        <Users size={16} />
                        <span>All Categories ({tasks.length})</span>
                    </button>
                    <button 
                        className={`tab-btn host-tab ${selectedCategory === 'HOST' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('HOST')}
                    >
                        <Tv size={16} />
                        <span>Host Tasks ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'HOST' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                    <button 
                        className={`tab-btn agency-tab ${selectedCategory === 'AGENCY' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('AGENCY')}
                    >
                        <Building2 size={16} />
                        <span>Agency Tasks ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'AGENCY' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                    <button 
                        className={`tab-btn seller-tab ${selectedCategory === 'COINS_SELLER' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('COINS_SELLER')}
                    >
                        <Coins size={16} />
                        <span>Coins Seller Tasks ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'COINS_SELLER' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Task Grid */}
            <div className="bento-grid dynamic-task-list-grid">
                {filteredTasks.map((task) => (
                    <div key={task.id} className="bento-card-premium">
                        <div className="card-payload">
                            <div className="card-top-identity flex justify-between items-center mb-3">
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className={`category-badge ${getCategoryBadgeClass(task.targetCategory)}`}>
                                        {getCategoryLabel(task.targetCategory)}
                                    </span>
                                    <span className={`card-type-badge ${(task.frequency || task.type || 'daily').toLowerCase()}`}>
                                        {task.frequency || task.type || 'DAILY'}
                                    </span>
                                </div>
                                <div className="card-icon-glass" style={{ color: task.status === 'active' ? 'var(--accent-sapphire)' : '#94a3b8' }}>
                                    <Target size={22} />
                                </div>
                            </div>

                            <div className="card-mid-section">
                                <h4 className="mission-title-highdef">{task.title}</h4>
                                <p className="mission-desc-highdef">{task.description}</p>
                            </div>

                            <div className="task-criteria-info-box my-3 p-3 rounded-lg bg-black/20 border border-white/10 text-xs flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary font-medium">Target Required:</span>
                                    <span className="font-bold text-amber-400">{getMetricDisplay(task)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary font-medium">Feature / Room:</span>
                                    <span className="font-bold text-sky-400">{getRoomTypeLabel(task.roomType)}</span>
                                </div>
                            </div>

                            <div className="mission-reward-pill mt-auto">
                                <span className="pill-prefix">🎁</span>
                                <span className="pill-amount">{task.reward}</span>
                                <span className="pill-suffix">Bonus Coins</span>
                            </div>
                        </div>

                        <div className="card-action-bar-glass">
                            <div className="completions-tag">
                                <Clock size={12} />
                                <span>{task._count?.userTasks || 0} completions</span>
                            </div>
                            <div className="action-set">
                                <button className="minimal-action-btn edit" title="Edit Task" onClick={() => handleOpenModal(task)}>
                                    <Edit3 size={15} />
                                </button>
                                <button className="minimal-action-btn delete" title="Delete Task" onClick={() => handleDeleteClick(task.id)}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTasks.length === 0 && !loading && (
                    <div className="bento-card wide empty-state">
                        <div className="empty-content">
                            <Trophy size={64} className="empty-icon-ghost" />
                            <p className="empty-text">No target tasks found for this category.<br/>Create objectives to incentivize performance and grant bonus coins.</p>
                            <button className="primary mt-6" onClick={() => handleOpenModal()}>Add First Task</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mission Configuration Modal */}
            {isModalOpen && (
                <div className="modal-overlay-refined fade-in">
                    <div className="modal-content-premium slide-up" style={{ maxWidth: '650px', width: '90%' }}>
                        <div className="modal-header-glass">
                            <div className="header-identity">
                                <div className="header-icon-wrap">
                                    {editingTask ? <Edit3 size={22} /> : <Zap size={22} />}
                                </div>
                                <div>
                                    <h3 className="modal-headline">{editingTask ? 'Modify Target Task' : 'Add Target & Bonus Task'}</h3>
                                    <p className="modal-subline">Set target duration, bonus frequency, category, and coin rewards</p>
                                </div>
                            </div>
                            <button className="close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-refined">
                            <div className="form-section">
                                <label className="input-label-premium">Task Title</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="text" 
                                        className="premium-input-field"
                                        placeholder="e.g. 2 Hours Live Streaming Daily Target..."
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="input-label-premium">Description & Guidelines</label>
                                <div className="input-wrapper-glass">
                                    <textarea 
                                        className="premium-input-field"
                                        style={{ height: '70px', resize: 'none' }}
                                        placeholder="Detail the specific actions required to earn the bonus..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-row-premium">
                                <div className="form-section">
                                    <label className="input-label-premium">Target User Category</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.targetCategory}
                                            onChange={e => setFormData({...formData, targetCategory: e.target.value})}
                                        >
                                            <option value="HOST">Host</option>
                                            <option value="AGENCY">Agency</option>
                                            <option value="COINS_SELLER">Coins Seller</option>
                                            <option value="ALL">All Users</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Bonus Cycle Frequency</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.frequency}
                                            onChange={e => setFormData({...formData, frequency: e.target.value})}
                                        >
                                            <option value="DAILY">Daily Cycle</option>
                                            <option value="WEEKLY">Weekly Cycle</option>
                                            <option value="MONTHLY">Monthly Cycle</option>
                                            <option value="ONE_TIME">Prime Milestone</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-row-premium">
                                <div className="form-section">
                                    <label className="input-label-premium">Feature / Room Assignment</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.roomType}
                                            onChange={e => setFormData({...formData, roomType: e.target.value})}
                                        >
                                            <option value="LIVE_STREAM">Live Streaming</option>
                                            <option value="AUDIO_ROOM">Audio Room</option>
                                            <option value="VIDEO_ROOM">Video Room</option>
                                            <option value="ANY">Any Stream / Room</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Target Value (Minutes / Metric)</label>
                                    <div className="input-wrapper-glass">
                                        <input 
                                            type="number" 
                                            className="premium-input-field"
                                            placeholder="e.g. 120 for 2 Hours"
                                            value={formData.targetValue}
                                            onChange={e => setFormData({...formData, targetValue: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Specify 120 for 2 Hours (120 Mins) target duration</span>
                                </div>
                            </div>

                            <div className="grid-row-premium">
                                <div className="form-section">
                                    <label className="input-label-premium">Bonus Reward Coins</label>
                                    <div className="input-wrapper-glass">
                                        <span className="input-prefix-icon">🎁</span>
                                        <input 
                                            type="number" 
                                            className="premium-input-field with-prefix"
                                            placeholder="50"
                                            value={formData.reward}
                                            onChange={e => setFormData({...formData, reward: e.target.value})}
                                            required
                                        />
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
                                            {editingTask ? 'Update Task Parameters' : 'Deploy Target Task'}
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
                    title="Task Decommission Authorization"
                    message="You are about to decommission this target task from the system. Verify authorization to proceed."
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
