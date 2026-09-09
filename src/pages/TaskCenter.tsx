import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Trophy, Plus, Trash2, Edit3, Target, X, 
    ShieldCheck, Clock, Users, Building2, Coins, Tv, Zap, ArrowUpRight, Search, RefreshCw
} from 'lucide-react';
import '../styles/TaskCenter.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const TaskCenter: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
    
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
            if (res.data && res.data.statusCode === 1) {
                setTasks(res.data.data || []);
            } else {
                toast.error(res.data?.message || 'Failed to fetch tasks');
            }
        } catch (err: any) {
            console.error('Task fetch error:', err);
            const msg = err.response?.data?.message || err.message || 'Sync failure: Task registry offline';
            toast.error(msg);
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

    const handleToggleStatus = async (task: any) => {
        setTogglingTaskId(task.id);
        const newStatus = task.status === 'active' ? 'draft' : 'active';
        try {
            const payload = {
                title: task.title,
                description: task.description,
                targetCategory: task.targetCategory,
                frequency: task.frequency || task.type,
                type: task.frequency || task.type,
                roomType: task.roomType,
                targetMetric: task.targetMetric,
                targetValue: task.targetValue,
                reward: task.reward,
                status: newStatus
            };
            await adminService.manageTask('update', payload, task.id);
            toast.success(`Task status changed to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
            fetchTasks();
        } catch (err) {
            toast.error('Failed to update task status');
        } finally {
            setTogglingTaskId(null);
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

    // Filter tasks based on search, category, and frequency
    const filteredTasks = tasks.filter(t => {
        // Category filter
        if (selectedCategory !== 'ALL') {
            const category = (t.targetCategory || 'ALL').toUpperCase();
            if (category !== selectedCategory && category !== 'ALL') return false;
        }

        // Frequency filter
        if (selectedFrequency !== 'ALL') {
            const freq = (t.frequency || t.type || '').toUpperCase();
            if (freq !== selectedFrequency) return false;
        }

        // Search query filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const titleMatch = (t.title || '').toLowerCase().includes(query);
            const descMatch = (t.description || '').toLowerCase().includes(query);
            const categoryMatch = (t.targetCategory || '').toLowerCase().includes(query);
            if (!titleMatch && !descMatch && !categoryMatch) return false;
        }

        return true;
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
            case 'HOST': return 'Host Target';
            case 'AGENCY': return 'Agency Target';
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
            return `${Number(val).toLocaleString()} Coins`;
        }
        return `${val}`;
    };

    return (
        <div className="dashboard-page tasks-page">
            <Toaster position="top-right" />

            {/* Header Area */}
            <div className="task-module-header">
                <div className="header-title-block">
                    <div className="title-row">
                        <h1>Target & Bonus Tasks</h1>
                        <span className="task-count-pill">{tasks.length} Total</span>
                    </div>
                    <p className="subtitle">Configure category-wise target tasks, bonus coins, and streaming requirements</p>
                </div>
                <div className="header-action-row">
                    <button className="secondary reload-btn" onClick={fetchTasks} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        <span>Reload Data</span>
                    </button>
                    <button className="primary add-task-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add New Task</span>
                    </button>
                </div>
            </div>

            {/* Overview Metric Stats Row */}
            <div className="tasks-stats-grid">
                <div className="stat-card stat-card-blue">
                    <div className="stat-card-inner">
                        <div className="stat-info">
                            <span className="stat-label label-blue">ACTIVE TASKS</span>
                            <span className="stat-value">{tasks.filter(t => t.status === 'active').length}</span>
                        </div>
                        <div className="stat-icon icon-blue">
                            <ShieldCheck size={26} />
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-purple">
                    <div className="stat-card-inner">
                        <div className="stat-info">
                            <span className="stat-label label-purple">HOST TARGETS</span>
                            <span className="stat-value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'HOST').length}</span>
                        </div>
                        <div className="stat-icon icon-purple">
                            <Tv size={26} />
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-cyan">
                    <div className="stat-card-inner">
                        <div className="stat-info">
                            <span className="stat-label label-cyan">AGENCY TARGETS</span>
                            <span className="stat-value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'AGENCY').length}</span>
                        </div>
                        <div className="stat-icon icon-cyan">
                            <Building2 size={26} />
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-amber">
                    <div className="stat-card-inner">
                        <div className="stat-info">
                            <span className="stat-label label-amber">COINS SELLER TARGETS</span>
                            <span className="stat-value">{tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'COINS_SELLER').length}</span>
                        </div>
                        <div className="stat-icon icon-amber">
                            <Coins size={26} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs & Filter Controls Bar */}
            <div className="controls-filter-bar">
                {/* Category Navigation Tabs */}
                <div className="task-category-tabs">
                    <button 
                        className={`tab-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        <Users size={15} />
                        <span>All Categories ({tasks.length})</span>
                    </button>
                    <button 
                        className={`tab-btn host-tab ${selectedCategory === 'HOST' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('HOST')}
                    >
                        <Tv size={15} />
                        <span>Host Tasks ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'HOST' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                    <button 
                        className={`tab-btn agency-tab ${selectedCategory === 'AGENCY' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('AGENCY')}
                    >
                        <Building2 size={15} />
                        <span>Agency Tasks ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'AGENCY' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                    <button 
                        className={`tab-btn seller-tab ${selectedCategory === 'COINS_SELLER' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('COINS_SELLER')}
                    >
                        <Coins size={15} />
                        <span>Coins Seller ({tasks.filter(t => (t.targetCategory || '').toUpperCase() === 'COINS_SELLER' || (t.targetCategory || '').toUpperCase() === 'ALL').length})</span>
                    </button>
                </div>

                {/* Search & Frequency Filters */}
                <div className="filter-actions-right">
                    <div className="search-box-wrap">
                        <Search size={15} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-field"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <select 
                        value={selectedFrequency} 
                        onChange={(e) => setSelectedFrequency(e.target.value)}
                        className="frequency-select-dropdown"
                    >
                        <option value="ALL">All Frequencies</option>
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="ONE_TIME">One Time</option>
                    </select>
                </div>
            </div>

            {/* Dynamic Task Grid */}
            <div className="dynamic-task-cards-grid">
                {filteredTasks.map((task) => {
                    const isActive = task.status === 'active';
                    const categoryClass = getCategoryBadgeClass(task.targetCategory);
                    const frequencyText = (task.frequency || task.type || 'DAILY').toUpperCase();
                    
                    return (
                        <div key={task.id} className={`task-card-pro ${isActive ? 'status-active' : 'status-inactive'}`}>
                            <div className="card-top-header">
                                <div className="badges-group">
                                    <span className={`category-badge ${categoryClass}`}>
                                        {getCategoryLabel(task.targetCategory)}
                                    </span>
                                    <span className={`frequency-badge ${frequencyText.toLowerCase()}`}>
                                        {frequencyText}
                                    </span>
                                </div>

                                <button 
                                    className={`status-toggle-btn ${isActive ? 'is-active' : 'is-inactive'}`}
                                    onClick={() => handleToggleStatus(task)}
                                    disabled={togglingTaskId === task.id}
                                    title={isActive ? 'Click to deactivate task' : 'Click to activate task'}
                                >
                                    <span className="dot"></span>
                                    <span>{isActive ? 'Active' : 'Inactive'}</span>
                                </button>
                            </div>

                            <div className="card-body-content">
                                <h3 className="task-title">{task.title}</h3>
                                <p className="task-description">{task.description}</p>

                                <div className="task-metrics-box">
                                    <div className="metric-row">
                                        <span className="metric-key">Target Required</span>
                                        <span className="metric-val target-val">{getMetricDisplay(task)}</span>
                                    </div>
                                    <div className="metric-row">
                                        <span className="metric-key">Feature / Room</span>
                                        <span className="metric-val room-val">{getRoomTypeLabel(task.roomType)}</span>
                                    </div>
                                </div>

                                <div className="reward-badge-card">
                                    <div className="reward-icon-group">
                                        <span className="gift-emoji">🎁</span>
                                        <div className="reward-text">
                                            <span className="reward-num">+{Number(task.reward).toLocaleString()}</span>
                                            <span className="reward-label">Bonus Coins</span>
                                        </div>
                                    </div>
                                    <span className="coin-emoji">🪙</span>
                                </div>
                            </div>

                            <div className="card-footer-bar">
                                <div className="completion-stats">
                                    <Clock size={13} />
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
                    );
                })}

                {filteredTasks.length === 0 && !loading && (
                    <div className="empty-tasks-container">
                        <div className="empty-icon-circle">
                            <Trophy size={36} />
                        </div>
                        <h3>No Target Tasks Found</h3>
                        <p>No tasks matched your current search or category filter. Deploy new target objectives to incentivize hosts & sellers.</p>
                        <button className="primary" onClick={() => handleOpenModal()}>
                            <Plus size={18} />
                            <span>Add First Task</span>
                        </button>
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
                                        style={{ height: '75px', resize: 'none' }}
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
                                    <span className="input-hint-text">Specify 120 for 2 Hours (120 Mins) target duration</span>
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
                                            <span>Active</span>
                                        </label>
                                        <label className={`radio-option ${formData.status === 'draft' ? 'active' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="taskStatus" 
                                                value="draft"
                                                checked={formData.status === 'draft'}
                                                onChange={e => setFormData({...formData, status: e.target.value})}
                                            />
                                            <span>Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-row">
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
