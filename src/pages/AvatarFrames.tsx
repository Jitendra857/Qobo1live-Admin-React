import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon, ShieldAlert, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';

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
            const response = await adminService.getFrames();
            if (response.data && response.data.statusCode === 1) {
                setFrames(response.data.data || []);
            } else {
                toast.error('Failed to sync avatar frames catalog');
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
                toast.success(editingFrame ? 'Avatar frame updated' : 'Avatar frame created');
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
        <div className="users-page">
            {/* Header section */}
            <div className="page-header-row">
                <div className="header-left">
                    <div className="header-icon-container gradient-amber">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="page-title">Avatar Frames</h1>
                        <p className="page-subtitle">Configure frame catalog, coin pricing, validity durations, and category rules.</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={handleOpenCreateModal}>
                    <Plus size={16} /> Add Frame
                </button>
            </div>

            {/* Content list */}
            <div className="card-container">
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
                    <div className="table-responsive">
                        <table className="user-table">
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
                                    <tr key={frame.id}>
                                        <td>
                                            <div className="avatar-wrapper" style={{ width: '56px', height: '56px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                                                <MediaImage 
                                                    src={frame.image} 
                                                    alt={frame.name} 
                                                    fallbackIcon={<ImageIcon size={18} />} 
                                                />
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
                                                <Calendar size={14} className="text-muted" />
                                                {frame.durationDays} Days
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${frame.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {frame.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-group">
                                                <button className="action-btn edit" onClick={() => handleOpenEditModal(frame)} title="Edit Frame">
                                                    <Edit size={14} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => setShowDeleteConfirm(frame.id)} title="Delete Frame">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Create / Edit */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingFrame ? 'Edit Avatar Frame' : 'Add Avatar Frame'}</h3>
                            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Frame Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. VIP Gold Crown Frame"
                                    required
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Price (Coins) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. 500"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                        placeholder="e.g. 30"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-input"
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
                                {editingFrame && (
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Frame Image File (PNG recommended) *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-input"
                                    onChange={handleFileChange}
                                    required={!editingFrame}
                                />
                                {editingFrame && <small className="text-muted">Leave empty to keep existing frame image.</small>}
                            </div>

                            <div className="modal-footer" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Frame</>}
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
