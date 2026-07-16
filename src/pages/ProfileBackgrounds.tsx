import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Image as ImageIcon, ShieldAlert, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';

const isSvgaBg = (url?: string) => {
    if (!url) return false;
    return url.toLowerCase().includes('.svga');
};

const ProfileBackgrounds: React.FC = () => {
    const [backgrounds, setBackgrounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBg, setEditingBg] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
        price: '',
        category: 'General',
        durationDays: 30,
        status: 'active'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchBackgrounds = async () => {
        try {
            setLoading(true);
            const response = await adminService.getBackgroundsList();
            if (response.data && response.data.statusCode === 1) {
                setBackgrounds(response.data.data || []);
            } else {
                toast.error('Failed to sync profile backgrounds catalog');
            }
        } catch (err) {
            console.error('Failed to fetch backgrounds:', err);
            toast.error('Error contacting server');
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
            price: '',
            category: 'General',
            durationDays: 30,
            status: 'active'
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (bg: any) => {
        setEditingBg(bg);
        setFormData({
            name: bg.name,
            price: bg.price,
            category: bg.category,
            durationDays: bg.durationDays,
            status: bg.status
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
        
        if (editingBg) {
            data.append('action', 'update');
            data.append('id', editingBg.id);
            data.append('status', formData.status);
        } else {
            data.append('action', 'create');
            if (!selectedFile) {
                toast.error('Please select a background image file');
                return;
            }
        }

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        try {
            setIsSubmitting(true);
            const res = await adminService.manageBackground(editingBg ? 'update' : 'create', data);
            if (res.data && res.data.statusCode === 1) {
                toast.success(editingBg ? 'Profile background updated' : 'Profile background created');
                setIsModalOpen(false);
                fetchBackgrounds();
            } else {
                toast.error(res.data.message || 'Operation failed');
            }
        } catch (err: any) {
            console.error('Failed to submit background:', err);
            toast.error(err.response?.data?.message || 'Error processing request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            setIsDeleting(true);
            const data = new FormData();
            data.append('action', 'delete');
            data.append('id', showDeleteConfirm);

            const res = await adminService.manageBackground('delete', data);
            if (res.data && res.data.statusCode === 1) {
                toast.success('Profile background deleted successfully');
                setShowDeleteConfirm(null);
                fetchBackgrounds();
            } else {
                toast.error(res.data.message || 'Deletion failed');
            }
        } catch (err) {
            console.error('Delete request failed:', err);
            toast.error('Server deletion error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="dashboard-page users-page">
            {/* Header section */}
            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1>Profile Backgrounds</h1>
                    <p className="subtitle">Configure and manage profile background skins catalog.</p>
                </div>
                <div className="header-actions">
                    <button className="primary flex items-center gap-2" onClick={handleOpenCreateModal}>
                        <Plus size={20} />
                        <span>Add New Background</span>
                    </button>
                </div>
            </div>

            {/* Content list */}
            <div className="table-container-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Syncing profile backgrounds catalog...</p>
                    </div>
                ) : backgrounds.length === 0 ? (
                    <div className="empty-state">
                        <ShieldAlert size={48} className="text-muted" />
                        <h3>No Profile Backgrounds Configured</h3>
                        <p>Configure profile backgrounds so users can buy them in the storefront.</p>
                    </div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Visual Skin</th>
                                <th>Background Name</th>
                                <th>Category</th>
                                <th>Price (Coins)</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backgrounds.map((bg) => (
                                <tr key={bg.id} className="row-premium">
                                    <td>
                                        <div className="avatar-wrapper" style={{ width: '80px', height: '56px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isSvgaBg(bg.image) ? (
                                                <SvgaPlayer 
                                                    src={bg.image} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <MediaImage 
                                                    src={bg.image} 
                                                    alt={bg.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                    fallbackIcon={<ImageIcon size={18} className="text-slate-400" />}
                                                    fallbackText="Skin"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td><strong>{bg.name}</strong></td>
                                    <td><span className="badge badge-info">{bg.category}</span></td>
                                    <td><strong style={{ color: '#ff3366' }}>{bg.price}</strong></td>
                                    <td>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> {bg.durationDays} Days
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${bg.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                            {bg.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button className="action-circle edit" onClick={() => handleOpenEditModal(bg)}>
                                                <Edit size={14} />
                                            </button>
                                            <button className="action-circle delete" onClick={() => setShowDeleteConfirm(bg.id)}>
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content glass-panel" onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingBg ? 'Edit Profile Background' : 'Add New Profile Background'}</h3>
                            <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>
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
                                    placeholder="e.g. Neon Horizon Theme"
                                    required
                                />
                            </div>

                            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                <div className="form-group" style={{ marginBottom: '0px' }}>
                                    <label>Price (Coins) *</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. 500"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '0px' }}>
                                    <label>Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                        placeholder="e.g. 30"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                <div className="form-group" style={{ marginBottom: '0px' }}>
                                    <label>Category</label>
                                    <select
                                        className="admin-input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Elite">Elite</option>
                                        <option value="Seasonal">Seasonal</option>
                                        <option value="Event">Event</option>
                                    </select>
                                </div>
                                {editingBg && (
                                    <div className="form-group" style={{ marginBottom: '0px' }}>
                                        <label>Status</label>
                                        <select
                                            className="admin-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Background File (PNG, JPG, or SVGA skin) *</label>
                                <input
                                    type="file"
                                    accept="image/*,.svga"
                                    className="admin-input"
                                    onChange={handleFileChange}
                                    required={!editingBg}
                                />
                                {editingBg && <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Leave empty to keep existing background file.</small>}
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
                    title="Delete Profile Background"
                    message="Are you sure you want to delete this profile background? This action cannot be undone."
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default ProfileBackgrounds;
