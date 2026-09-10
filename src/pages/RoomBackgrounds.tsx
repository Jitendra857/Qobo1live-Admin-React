import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';

const isSvgaBg = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.svga') || (lower.includes('/raw/upload/') && lower.includes('/backgrounds/'));
};

const RoomBackgrounds: React.FC = () => {
    const [backgrounds, setBackgrounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBg, setEditingBg] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
        image: '',
        isDefault: false,
        isActive: true,
        sortOrder: 0
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchBackgrounds = async () => {
        try {
            setLoading(true);
            const res = await adminService.getRoomBackgrounds();
            const data = res.data;
            if (data && (data.statusCode === 1 || data.success)) {
                setBackgrounds(data.data || []);
            } else {
                toast.error(data?.message || 'Failed to fetch room backgrounds');
            }
        } catch (err: any) {
            console.error('Failed to fetch room backgrounds:', err);
            const msg = err.response?.data?.message || err.message || 'Error connecting to backend server';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackgrounds();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingBg(null);
        setFormData({
            name: '',
            image: '',
            isDefault: false,
            isActive: true,
            sortOrder: 0
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (bg: any) => {
        setEditingBg(bg);
        setFormData({
            name: bg.name,
            image: bg.image,
            isDefault: bg.isDefault,
            isActive: bg.isActive,
            sortOrder: bg.sortOrder || 0
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Background name is required');
            return;
        }

        if (!editingBg && !selectedFile && !formData.image) {
            toast.error('Please upload an image file or provide an image URL');
            return;
        }

        try {
            setIsSubmitting(true);
            const form = new FormData();
            form.append('name', formData.name);
            form.append('isDefault', String(formData.isDefault));
            form.append('isActive', String(formData.isActive));
            form.append('sortOrder', String(formData.sortOrder));
            
            if (formData.image) {
                form.append('image', formData.image);
            }
            if (selectedFile) {
                form.append('file', selectedFile);
                form.append('image', selectedFile);
            }

            const res = editingBg 
                ? await adminService.updateRoomBackground(editingBg.id, form)
                : await adminService.createRoomBackground(form);

            const data = res.data;
            if (data && (data.statusCode === 1 || data.success)) {
                toast.success(editingBg ? 'Background updated!' : 'Background added!');
                setIsModalOpen(false);
                fetchBackgrounds();
            } else {
                toast.error(data?.message || 'Operation failed');
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            const msg = err.response?.data?.message || err.message || 'Network error during save';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            setIsDeleting(true);
            const res = await adminService.deleteRoomBackground(showDeleteConfirm);
            const data = res.data;
            if (data && (data.statusCode === 1 || data.success)) {
                toast.success('Room background deleted');
                fetchBackgrounds();
            } else {
                toast.error(data?.message || 'Failed to delete');
            }
        } catch (err: any) {
            console.error('Error deleting background:', err);
            const msg = err.response?.data?.message || err.message || 'Network error deleting background';
            toast.error(msg);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(null);
        }
    };

    return (
        <div className="dashboard-page users-page">
            {/* Header section */}
            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1 className="flex items-center gap-2">
                        <Sparkles size={28} className="text-purple-400" /> Audio Room Backgrounds Catalog
                    </h1>
                    <p className="subtitle">
                        Manage background themes for Live Audio Rooms and Video Streams. Hosts can switch to these themes in-room.
                    </p>
                </div>
                <div className="header-actions">
                    <button className="primary flex items-center gap-2" onClick={handleOpenCreateModal}>
                        <Plus size={20} />
                        <span>Add Room Background</span>
                    </button>
                </div>
            </div>

            {/* Content list */}
            <div className="table-container-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Syncing room backgrounds catalog...</p>
                    </div>
                ) : backgrounds.length === 0 ? (
                    <div className="empty-state">
                        <ShieldAlert size={48} className="text-muted" />
                        <h3>No Room Backgrounds Configured</h3>
                        <p>Configure background themes so hosts can select them inside audio rooms.</p>
                    </div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Background Preview</th>
                                <th>Background Name</th>
                                <th>Default Status</th>
                                <th>Sort Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backgrounds.map((bg) => (
                                <tr key={bg.id} className="row-premium">
                                    <td>
                                        <div 
                                            className="avatar-wrapper" 
                                            style={{ 
                                                width: '90px', 
                                                height: '56px', 
                                                padding: '2px', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '8px', 
                                                background: '#111827', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {isSvgaBg(bg.image) ? (
                                                <SvgaPlayer 
                                                    src={bg.image} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    mute={true}
                                                />
                                            ) : (
                                                <MediaImage 
                                                    src={bg.image} 
                                                    alt={bg.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                                                    fallbackIcon={<ImageIcon size={20} className="text-slate-400" />}
                                                    fallbackText="Bg"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td><strong>{bg.name}</strong></td>
                                    <td>
                                        {bg.isDefault ? (
                                            <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }}>
                                                DEFAULT
                                            </span>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Standard</span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#64748b' }}>
                                            {bg.sortOrder || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${bg.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {bg.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ops-cluster">
                                            <button className="op-btn edit" onClick={() => handleOpenEditModal(bg)} title="Edit Background">
                                                <Edit size={14} />
                                            </button>
                                            <button className="op-btn delete" onClick={() => setShowDeleteConfirm(bg.id)} title="Delete Background">
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
                <div className="modal-overlay">
                    <form onSubmit={handleSubmit} className="modal-content glass-panel slide-up" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingBg ? 'Edit Room Background' : 'Add Room Background'}</h3>
                            <button className="close-btn" type="button" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Background Name *</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Royal Purple Lounge"
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Image File (PNG / JPG / SVG) *</label>
                                <input
                                    type="file"
                                    accept="image/*,.svg,.svga"
                                    className="admin-input"
                                    onChange={handleFileChange}
                                    required={!editingBg && !formData.image}
                                />
                                {editingBg && <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Leave empty to keep existing background file.</small>}
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Or Image / SVGA URL</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                <div className="form-group" style={{ marginBottom: '0px' }}>
                                    <label>Sort Order</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '0px' }}>
                                    <label>Status</label>
                                    <select
                                        className="admin-input"
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span>Set as Default Background for Audio Rooms</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Background'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Room Background"
                    message="Are you sure you want to delete this room background? Rooms currently using it will revert to default."
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default RoomBackgrounds;
