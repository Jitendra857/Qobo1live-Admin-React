import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon, ShieldAlert, Calendar, Crown, Zap } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';

const isSvgaFrame = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.svga') || (lower.includes('/raw/upload/') && lower.includes('/frames/'));
};

const ENTRY_CATEGORIES = [
    'VIP'
];

const EntryFrames: React.FC = () => {
    const [frames, setFrames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingFrame, setEditingFrame] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
        price: '',
        category: 'VIP',
        durationDays: 30,
        status: 'active'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchFrames = async () => {
        try {
            setLoading(true);
            const response = await adminService.getEntryFrames();
            if (response.data && response.data.statusCode === 1) {
                const list = response.data.data || [];
                // Show all VIP and Entry frames
                setFrames(list.filter((f: any) => {
                    const c = (f.category || '').toLowerCase();
                    return c.includes('vip') || c.includes('entry');
                }));
            } else {
                toast.error('Failed to sync entry frames catalog');
            }
        } catch (err) {
            console.error('Failed to fetch entry frames:', err);
            toast.error('Error contacting server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFrames();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingFrame(null);
        setFormData({
            name: '',
            price: '',
            category: 'VIP',
            durationDays: 30,
            status: 'active'
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (frame: any) => {
        setEditingFrame(frame);
        setFormData({
            name: frame.name,
            price: frame.price,
            category: frame.category || 'VIP',
            durationDays: frame.durationDays || 30,
            status: frame.status || 'active'
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            toast.error('Please enter name and price');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', String(formData.price));
        data.append('category', formData.category || 'VIP');
        data.append('durationDays', String(formData.durationDays));
        
        if (editingFrame) {
            data.append('action', 'update');
            data.append('id', editingFrame.id);
            data.append('status', formData.status);
            if (selectedFile) {
                data.append('image', selectedFile);
            }
        } else {
            data.append('action', 'create');
            if (!selectedFile) {
                toast.error('Please upload an entry animation or frame image');
                return;
            }
            data.append('image', selectedFile);
        }

        try {
            setIsSubmitting(true);
            const res = await adminService.manageFrame(editingFrame ? 'update' : 'create', data);
            if (res.data && res.data.statusCode === 1) {
                toast.success(editingFrame ? 'Entry frame updated' : 'Entry frame created');
                setIsModalOpen(false);
                fetchFrames();
            } else {
                toast.error(res.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Error submitting entry frame:', error);
            toast.error(error.response?.data?.message || 'Error occurred during save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            setIsDeleting(true);
            const res = await adminService.manageFrame('delete', {
                action: 'delete',
                id: showDeleteConfirm
            });
            if (res.data && res.data.statusCode === 1) {
                toast.success('Entry frame deleted');
                fetchFrames();
                setShowDeleteConfirm(null);
            } else {
                toast.error(res.data.message || 'Delete operation failed');
            }
        } catch (error: any) {
            console.error('Failed to delete entry frame:', error);
            toast.error('Failed to delete entry frame');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="dashboard-page users-page">
            {/* Header section */}
            <div className="dashboard-header">
                <div className="header-text-group">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
                        <Crown size={14} /> VIP Room Entrance Effects
                    </div>
                    <h1>Entry Frames</h1>
                    <p className="subtitle">Configure room entrance frames, VIP arrival animations, SVGA effects, coin pricing, and validity duration.</p>
                </div>
                <div className="header-actions">
                    <button className="primary flex items-center gap-2" onClick={handleOpenCreateModal} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '12px', padding: '10px 18px', fontWeight: 700 }}>
                        <Plus size={20} />
                        <span>Add Entry Frame</span>
                    </button>
                </div>
            </div>

            {/* Content list */}
            <div className="table-container-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Syncing entry frames catalog...</p>
                    </div>
                ) : frames.length === 0 ? (
                    <div className="empty-state">
                        <Crown size={48} style={{ color: '#f59e0b', opacity: 0.5, margin: '0 auto 12px' }} />
                        <h3>No Entry Frames Configured</h3>
                        <p>Configure VIP entrance frames so users and VIPs arrive in live rooms with dazzling arrival animations.</p>
                        <button className="primary flex items-center gap-2" onClick={handleOpenCreateModal} style={{ marginTop: '16px', background: '#f59e0b' }}>
                            <Plus size={18} /> Add First Entry Frame
                        </button>
                    </div>
                ) : (
                    <table className="modern-table" style={{ width: '100%', minWidth: '850px' }}>
                        <thead>
                            <tr>
                                <th>Animation / Frame</th>
                                <th>Entry Name</th>
                                <th>Category</th>
                                <th>Coins Price</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {frames.map((frame) => (
                                <tr key={frame.id} className="row-premium">
                                    <td>
                                        <div 
                                            className="avatar-wrapper" 
                                            style={{ 
                                                width: '64px', 
                                                height: '64px', 
                                                padding: '4px', 
                                                border: '1px solid rgba(245, 158, 11, 0.3)', 
                                                borderRadius: '12px', 
                                                background: 'rgba(245, 158, 11, 0.05)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer' 
                                            }}
                                            onClick={() => {
                                                if (isSvgaFrame(frame.image)) {
                                                    window.open('/gift-preview?url=' + encodeURIComponent(frame.image), '_blank');
                                                }
                                            }}
                                            title="Click to preview animation"
                                        >
                                            {isSvgaFrame(frame.image) ? (
                                                <SvgaPlayer 
                                                    src={frame.image} 
                                                    style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                                                    mute={true}
                                                />
                                            ) : (
                                                <MediaImage 
                                                    src={frame.image} 
                                                    alt={frame.name} 
                                                    style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                                                    fallbackIcon={<ImageIcon size={20} className="text-slate-400" />}
                                                    fallbackText="Entry"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {frame.name}
                                        </div>
                                        {isSvgaFrame(frame.image) && (
                                            <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
                                                ✨ SVGA Dynamic Arrival
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge badge-info" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 800 }}>
                                            👑 {frame.category || 'VIP Entry'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="coins-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 800 }}>
                                            💰 {frame.price} Coins
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                                            <Calendar size={14} className="text-slate-400" />
                                            {frame.durationDays} Days
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${frame.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                            {frame.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-wrapper" style={{ display: 'flex', gap: '8px' }}>
                                            <button className="icon-btn" onClick={() => handleOpenEditModal(frame)} title="Edit Entry Frame">
                                                <Edit size={16} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(frame.id)} title="Delete Entry Frame">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <form onSubmit={handleSubmit} className="modal-content slide-up" style={{ maxWidth: '520px', borderRadius: '20px', padding: '24px', background: 'var(--bg-surface)' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={20} color="#f59e0b" />
                                {editingFrame ? 'Edit Entry Frame' : 'Add New Entry Frame'}
                            </h2>
                            <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Entry Frame Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                    placeholder="e.g. Royal Dragon Arrival, Golden Supercar Entry" 
                                    required 
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                                />
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Price (Coins)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={formData.price} 
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                                        placeholder="Coins required" 
                                        required 
                                        min="0"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Validity (Days)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={formData.durationDays} 
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })} 
                                        required 
                                        min="1"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Entry Category</label>
                                <select 
                                    className="form-control" 
                                    value={formData.category} 
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', fontWeight: 600 }}
                                >
                                    {ENTRY_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    {formData.category && !ENTRY_CATEGORIES.includes(formData.category) && (
                                        <option value={formData.category}>{formData.category}</option>
                                    )}
                                </select>
                            </div>

                            {editingFrame && (
                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Status</label>
                                    <select 
                                        className="form-control" 
                                        value={formData.status} 
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', fontWeight: 600 }}
                                    >
                                        <option value="active">Active (Available in Store)</option>
                                        <option value="inactive">Inactive (Hidden)</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                    {editingFrame ? 'Replace Animation / Image (Optional)' : 'Entry Animation / Image (Required)'}
                                </label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    onChange={handleFileChange} 
                                    accept=".svga,.png,.jpg,.jpeg,.webp,.gif" 
                                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                    Supported: <strong>.svga</strong> (Dynamic entrance animation), <strong>.png</strong>, <strong>.webp</strong>, <strong>.gif</strong>
                                </span>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button type="button" className="secondary" onClick={() => setIsModalOpen(false)} style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 700 }}>
                                Cancel
                            </button>
                            <button type="submit" className="primary" disabled={isSubmitting} style={{ background: '#f59e0b', borderRadius: '10px', padding: '10px 20px', fontWeight: 800 }}>
                                {isSubmitting ? 'Saving...' : editingFrame ? 'Update Entry Frame' : 'Create Entry Frame'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Delete Entry Frame"
                    message="Are you sure you want to delete this entry frame? Users will no longer be able to purchase or equip this entrance animation."
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default EntryFrames;
