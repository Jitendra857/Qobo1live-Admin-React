import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon, ShieldAlert, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';
import '../styles/Modal.css';

const isSvgaFrame = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.svga') || (lower.includes('/raw/upload/') && lower.includes('/frames/'));
};

const AvatarFrames: React.FC = () => {
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
        category: 'General',
        durationDays: 30,
        status: 'active'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchFrames = async () => {
        try {
            setLoading(true);
            const response = await adminService.getFrames('frames');
            if (response.data && response.data.statusCode === 1) {
                const list = response.data.data || [];
                // Only show avatar profile frames (exclude VIP frames and Entry frames)
                setFrames(list.filter((f: any) => {
                    const c = (f.category || '').toLowerCase();
                    return !c.includes('vip') && !c.includes('entry');
                }));
            } else {
                toast.error('Failed to sync frames catalog');
            }
        } catch (err) {
            console.error('Failed to fetch frames:', err);
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
            category: 'General',
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
            category: frame.category,
            durationDays: frame.durationDays,
            status: frame.status
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
        data.append('category', formData.category);
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
                toast.error('Please upload a frame image');
                return;
            }
            data.append('image', selectedFile);
        }

        try {
            setIsSubmitting(true);
            const res = await adminService.manageFrame(editingFrame ? 'update' : 'create', data);
            if (res.data && res.data.statusCode === 1) {
                if (editingFrame && formData.category?.toLowerCase() === 'vip' && !editingFrame.category?.toLowerCase().includes('vip')) {
                    toast.success('Category updated to VIP! Frame moved to Entry Frames catalog.', { duration: 4000 });
                } else {
                    toast.success(editingFrame ? 'Avatar frame updated' : 'Avatar frame created');
                }
                setIsModalOpen(false);
                fetchFrames();
            } else {
                toast.error(res.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Error submitting frame:', error);
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
                toast.success('Avatar frame deleted successfully');
                setShowDeleteConfirm(null);
                fetchFrames();
            } else {
                toast.error(res.data.message || 'Deletion failed');
            }
        } catch (error: any) {
            console.error('Error deleting frame:', error);
            toast.error('Failed to delete frame');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="dashboard-page users-page">
            {/* Header section */}
            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1>Frames</h1>
                    <p className="subtitle">Configure avatar and profile frames catalog, coin pricing, validity durations, and category rules.</p>
                </div>
                <div className="header-actions">
                    <button className="primary flex items-center gap-2" onClick={handleOpenCreateModal}>
                        <Plus size={20} />
                        <span>Add New Frame</span>
                    </button>
                </div>
            </div>

            {/* Content list */}
            <div className="table-container-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Syncing avatar frames catalog...</p>
                    </div>
                ) : frames.length === 0 ? (
                    <div className="empty-state">
                        <ShieldAlert size={48} className="text-muted" />
                        <h3>No Avatar Frames Configured</h3>
                        <p>Configure avatar frames so users can buy them in the storefront.</p>
                    </div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Frame Image</th>
                                <th>Frame Name</th>
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
                                                width: '56px', 
                                                height: '56px', 
                                                padding: '4px', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '8px', 
                                                background: '#f8fafc', 
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
                                        >
                                            {isSvgaFrame(frame.image) ? (
                                                <SvgaPlayer 
                                                    src={frame.image} 
                                                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                                    mute={true}
                                                />
                                            ) : (
                                                <MediaImage 
                                                    src={frame.image} 
                                                    alt={frame.name} 
                                                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                                    fallbackIcon={<ImageIcon size={18} className="text-slate-400" />}
                                                    fallbackText="Frame"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td><strong>{frame.name}</strong></td>
                                    <td><span className="badge badge-info">{frame.category}</span></td>
                                    <td>
                                        <div className="coins-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 600 }}>
                                            💰 {frame.price} Coins
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                            <Calendar size={14} className="text-slate-400" />
                                            {frame.durationDays} Days
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${frame.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                            {frame.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ops-cluster">
                                            <button className="op-btn edit" onClick={() => handleOpenEditModal(frame)} title="Edit Frame">
                                                <Edit size={14} />
                                            </button>
                                            <button className="op-btn delete" onClick={() => setShowDeleteConfirm(frame.id)} title="Delete Frame">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Create / Edit */}
            {isModalOpen && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div 
                        className="modal-content glass-panel slide-up" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            maxWidth: '520px', 
                            width: '100%',
                            borderRadius: '16px', 
                            padding: '0', 
                            background: 'var(--bg-surface, #ffffff)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--glass-border, #e2e8f0)',
                            borderTop: '4px solid #2563eb',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '90vh'
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--glass-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary, #0f172a)' }}>
                                    {editingFrame ? 'Edit Avatar Frame' : 'Add Avatar Frame'}
                                </h3>
                                <button className="close-btn" type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #64748b)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Frame Name *</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. VIP Gold Crown Frame"
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                    />
                                </div>

                                <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div className="form-group" style={{ marginBottom: '0px' }}>
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Price (Coins) *</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="e.g. 500"
                                            required
                                            min="1"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0px' }}>
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Duration (Days)</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={formData.durationDays}
                                            onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                            placeholder="e.g. 30"
                                            min="1"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Category *</label>
                                    <select
                                        className="admin-input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)', fontWeight: 700, fontSize: '0.88rem' }}
                                    >
                                        <optgroup label="Avatar Profile Frames (Profile Picture Borders)">
                                            <option value="General">👤 General (Profile Avatar Frame)</option>
                                            <option value="Elite">⭐ Elite (Profile Avatar Frame)</option>
                                            <option value="Premium">💎 Premium (Profile Avatar Frame)</option>
                                            <option value="Seasonal">🍁 Seasonal (Profile Avatar Frame)</option>
                                            <option value="Event">🎉 Event (Profile Avatar Frame)</option>
                                        </optgroup>
                                        <optgroup label="Entry Animations (Live Stream / Room Entrance)">
                                            <option value="VIP">👑 VIP (Entry Frame - Room Entrance / Live Arrival)</option>
                                        </optgroup>
                                        {formData.category && !['general', 'elite', 'premium', 'seasonal', 'event', 'vip'].includes(formData.category.toLowerCase()) && (
                                            <optgroup label="Current Custom Category">
                                                <option value={formData.category}>{formData.category}</option>
                                            </optgroup>
                                        )}
                                    </select>
                                    <div style={{ marginTop: '6px', fontSize: '0.74rem', color: formData.category?.toLowerCase() === 'vip' ? '#d97706' : '#2563eb', fontWeight: 600 }}>
                                        {formData.category?.toLowerCase() === 'vip' 
                                            ? '👑 VIP Entry: Selecting VIP will move this frame to the Entry Frames menu.' 
                                            : '👤 Profile Frame: Displayed as an avatar profile border in the Frames menu.'}
                                    </div>
                                </div>

                                {editingFrame && (
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Status</label>
                                        <select
                                            className="admin-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)', fontWeight: 600 }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>
                                        Frame File (PNG or SVGA animated frame) *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.svga"
                                        className="admin-input"
                                        onChange={handleFileChange}
                                        required={!editingFrame}
                                        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                    />
                                    {editingFrame && <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Leave empty to keep existing frame file.</small>}
                                </div>
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--glass-border, #e2e8f0)', background: 'var(--input-bg, #f8fafc)' }}>
                                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)} style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 700 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 800 }}>
                                    {isSubmitting ? 'Saving...' : 'Save Frame'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Avatar Frame"
                    message="Are you sure you want to delete this avatar frame? This action cannot be undone."
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default AvatarFrames;
