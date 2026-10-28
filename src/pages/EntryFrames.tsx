import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon, ShieldAlert, Calendar, Crown, Zap, Volume2, ExternalLink } from 'lucide-react';
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

const ENTRY_FRAME_CATEGORIES = [
    { value: 'VIP', label: '👑 VIP (Entry Frame - Room Entrance / Live Arrival)' },
    { value: 'General', label: '👤 General (Profile Avatar Frame)' },
    { value: 'Elite', label: '⭐ Elite (Profile Avatar Frame)' },
    { value: 'Premium', label: '💎 Premium (Profile Avatar Frame)' },
    { value: 'Seasonal', label: '🍁 Seasonal (Profile Avatar Frame)' },
    { value: 'Event', label: '🎉 Event (Profile Avatar Frame)' }
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
                if (editingFrame && formData.category?.toLowerCase() !== 'vip' && editingFrame.category?.toLowerCase().includes('vip')) {
                    toast.success(`Category updated to "${formData.category}"! Frame moved to Frames catalog.`, { duration: 4000 });
                } else {
                    toast.success(editingFrame ? 'Frame updated successfully' : 'Entry frame created successfully');
                }
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

    const openEntryPreview = (frame: any) => {
        const previewUrl = frame.image || frame.imageUrl || frame.svgaUrl || '';
        if (!previewUrl) {
            toast.error('No animation or frame URL available');
            return;
        }
        const soundParam = frame.soundUrl || frame.sound ? `&soundUrl=${encodeURIComponent(frame.soundUrl || frame.sound)}` : '';
        const nameParam = `&name=${encodeURIComponent(frame.name || 'Entry Frame')}`;
        const categoryParam = `&category=${encodeURIComponent(frame.category || 'VIP')}`;
        window.open(`/gift-preview?url=${encodeURIComponent(previewUrl)}${nameParam}&type=entry${categoryParam}${soundParam}`, '_blank');
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

            {/* Quick Tip Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05))',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#b45309'
            }}>
                <Volume2 size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    <strong>Verify with Sound:</strong> Click on any entry frame preview, frame name, or the <Volume2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>Preview</strong> button to open and verify the arrival effect in a new tab with sound active.
                </span>
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
                                                border: '1px solid rgba(245, 158, 11, 0.35)', 
                                                borderRadius: '12px', 
                                                background: 'rgba(245, 158, 11, 0.08)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => openEntryPreview(frame)}
                                            title="Click to open preview with sound in new tab"
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
                                        <div 
                                            onClick={() => openEntryPreview(frame)}
                                            style={{ 
                                                fontWeight: 800, 
                                                color: 'var(--text-primary)', 
                                                fontSize: '0.95rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                            title="Click to preview with sound"
                                        >
                                            <span>{frame.name}</span>
                                            <ExternalLink size={13} style={{ color: '#f59e0b', opacity: 0.7 }} />
                                        </div>
                                        {isSvgaFrame(frame.image) && (
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
                                                    ✨ SVGA Dynamic Arrival
                                                </span>
                                            </div>
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
                                            <button 
                                                className="icon-btn" 
                                                onClick={() => openEntryPreview(frame)} 
                                                title="Preview with Sound in New Tab"
                                                style={{ color: '#d97706', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                                            >
                                                <Volume2 size={16} />
                                            </button>
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
                            borderTop: '4px solid #f59e0b',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '90vh'
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--glass-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                                    <Crown size={20} color="#f59e0b" />
                                    {editingFrame ? 'Edit Frame / Category' : 'Add New Entry Frame'}
                                </h2>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #64748b)' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body" style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Frame Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                        placeholder="e.g. Royal Dragon Arrival, Golden Supercar Entry" 
                                        required 
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                    />
                                </div>

                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Price (Coins) *</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.price} 
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                                            placeholder="Coins required" 
                                            required 
                                            min="0"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Validity (Days)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.durationDays} 
                                            onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })} 
                                            required 
                                            min="1"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>
                                        Target Category *
                                    </label>
                                    <select 
                                        className="form-control" 
                                        value={formData.category} 
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)', fontWeight: 700, fontSize: '0.88rem' }}
                                    >
                                        <optgroup label="Entry Animations (Live Stream / Room Entrance)">
                                            <option value="VIP">👑 VIP (Entry Frame - Room Entrance / Live Arrival)</option>
                                        </optgroup>
                                        <optgroup label="Avatar Profile Frames (Profile Borders in Frames Menu)">
                                            <option value="General">👤 General (Profile Avatar Frame)</option>
                                            <option value="Elite">⭐ Elite (Profile Avatar Frame)</option>
                                            <option value="Premium">💎 Premium (Profile Avatar Frame)</option>
                                            <option value="Seasonal">🍁 Seasonal (Profile Avatar Frame)</option>
                                            <option value="Event">🎉 Event (Profile Avatar Frame)</option>
                                        </optgroup>
                                        {formData.category && !['vip', 'general', 'elite', 'premium', 'seasonal', 'event'].includes(formData.category.toLowerCase()) && (
                                            <optgroup label="Current Custom Category">
                                                <option value={formData.category}>{formData.category}</option>
                                            </optgroup>
                                        )}
                                    </select>
                                    <div style={{ marginTop: '6px', fontSize: '0.74rem', color: formData.category?.toLowerCase() === 'vip' ? '#d97706' : '#2563eb', fontWeight: 600 }}>
                                        {formData.category?.toLowerCase() === 'vip' 
                                            ? '👑 VIP Entry: Remains in Entry Frames for room entrance & live stream arrival animations.' 
                                            : `👤 Profile Frame: Selecting "${formData.category}" will move this frame to the Frames menu as a profile avatar frame.`}
                                    </div>
                                </div>

                                {editingFrame && (
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>Status</label>
                                        <select 
                                            className="form-control" 
                                            value={formData.status} 
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)', fontWeight: 600 }}
                                        >
                                            <option value="active">Active (Available in Store)</option>
                                            <option value="inactive">Inactive (Hidden)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'var(--text-primary)' }}>
                                        {editingFrame ? 'Replace Animation / Image (Optional)' : 'Entry Animation / Image (Required)'}
                                    </label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        onChange={handleFileChange} 
                                        accept=".svga,.png,.jpg,.jpeg,.webp,.gif" 
                                        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--glass-border, #cbd5e1)' }}
                                    />
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                        Supported: <strong>.svga</strong> (Dynamic entrance animation), <strong>.png</strong>, <strong>.webp</strong>, <strong>.gif</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--glass-border, #e2e8f0)', background: 'var(--input-bg, #f8fafc)' }}>
                                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)} style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 700 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary" disabled={isSubmitting} style={{ background: '#f59e0b', borderRadius: '10px', padding: '10px 20px', fontWeight: 800 }}>
                                    {isSubmitting ? 'Saving...' : editingFrame ? 'Update Frame' : 'Create Entry Frame'}
                                </button>
                            </div>
                        </form>
                    </div>
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
