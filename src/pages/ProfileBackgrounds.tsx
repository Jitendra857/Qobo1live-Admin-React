import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon, ShieldAlert, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';

const isSvgaBg = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.svga') || (lower.includes('/raw/upload/') && lower.includes('/backgrounds/'));
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

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            const data = new FormData();
            data.append('action', 'delete');
            data.append('id', id);

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
        <div className="users-container pb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-violet-600" /> Profile Backgrounds
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Configure and manage profile background skins catalog</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreateModal}>
                    <Plus size={16} /> Add New Background
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
            ) : backgrounds.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 text-slate-500">
                    <ImageIcon size={48} className="mb-4 text-slate-300" />
                    <p className="text-base font-semibold">No profile backgrounds found</p>
                    <p className="text-sm text-slate-400 mt-1">Get started by creating your first profile background</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-600 text-sm font-semibold">
                                <th className="p-4">Visual Skin</th>
                                <th className="p-4">Background Name</th>
                                <th className="p-4">Price (Coins)</th>
                                <th className="p-4">Duration (Days)</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backgrounds.map((bg) => (
                                <tr key={bg.id} className="row-premium">
                                    <td>
                                        <div className="avatar-wrapper" style={{ width: '80px', height: '56px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                    <td>
                                        <span className="font-semibold text-slate-800 block">{bg.name}</span>
                                    </td>
                                    <td>
                                        <span className="text-violet-600 font-extrabold">₹{bg.price}</span>
                                    </td>
                                    <td>
                                        <span className="text-slate-600 flex items-center gap-1 font-semibold">
                                            <Calendar size={14} className="text-slate-400" /> {bg.durationDays} Days
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge-purple">{bg.category}</span>
                                    </td>
                                    <td>
                                        <span className={bg.status === 'active' ? 'badge-green' : 'badge-red'}>
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
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md w-full">
                        <div className="modal-header flex justify-between items-center pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingBg ? 'Edit Profile Background' : 'Add New Profile Background'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="label-form block mb-1">BACKGROUND NAME *</label>
                                <input
                                    type="text"
                                    className="input-premium w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-form block mb-1">PRICE (COINS) *</label>
                                    <input
                                        type="number"
                                        className="input-premium w-full"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-form block mb-1">DURATION (DAYS)</label>
                                    <input
                                        type="number"
                                        className="input-premium w-full"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-form block mb-1">CATEGORY</label>
                                    <input
                                        type="text"
                                        className="input-premium w-full"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-form block mb-1">STATUS</label>
                                    <select
                                        className="input-premium w-full"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label-form block mb-1">BACKGROUND FILE (PNG, JPG OR SVGA SKIN) *</label>
                                <input
                                    type="file"
                                    className="input-premium w-full pt-1.5"
                                    accept="image/*,.svga"
                                    onChange={handleFileChange}
                                    required={!editingBg}
                                />
                                {editingBg && (
                                    <p className="text-slate-400 text-xs mt-1">Leave empty to keep existing background file.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex items-center gap-1.5"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Save Background
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    onClose={() => setShowDeleteConfirm(null)}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    title="Delete Profile Background"
                    message="Are you sure you want to delete this profile background skin? This action is permanent and cannot be undone."
                    confirmText={isDeleting ? 'Deleting...' : 'Delete Background'}
                />
            )}
        </div>
    );
};

export default ProfileBackgrounds;
