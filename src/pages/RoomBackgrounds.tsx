import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit, X, Image as ImageIcon, CheckCircle, Power } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';

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
            const token = localStorage.getItem('token');
            const res = await fetch('https://my-backend-api-960q.onrender.com/api/admin/room-backgrounds', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.statusCode === 1) {
                setBackgrounds(data.data || []);
            } else {
                toast.error(data.message || 'Failed to fetch room backgrounds');
            }
        } catch (err) {
            console.error('Failed to fetch room backgrounds:', err);
            toast.error('Error connecting to backend server');
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
            const token = localStorage.getItem('token');
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

            const url = editingBg 
                ? `https://my-backend-api-960q.onrender.com/api/admin/room-backgrounds/${editingBg.id}`
                : 'https://my-backend-api-960q.onrender.com/api/admin/room-backgrounds';
            
            const method = editingBg ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });

            const data = await res.json();
            if (data.statusCode === 1) {
                toast.success(editingBg ? 'Background updated!' : 'Background added!');
                setIsModalOpen(false);
                fetchBackgrounds();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('Network error during save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`https://my-backend-api-960q.onrender.com/api/admin/room-backgrounds/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.statusCode === 1) {
                toast.success('Room background deleted');
                fetchBackgrounds();
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('Error deleting background:', err);
            toast.error('Network error deleting background');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(null);
        }
    };

    return (
        <div className="user-management-container dark-theme page-padding">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-purple-400" /> Audio Room Backgrounds Catalog
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage background themes for Live Audio Rooms and Video Streams. Hosts can switch to these themes in-room.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
                >
                    <Plus size={18} /> Add Room Background
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : backgrounds.length === 0 ? (
                <div className="bg-gray-800/40 rounded-xl p-12 text-center border border-gray-700">
                    <ImageIcon className="mx-auto text-gray-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-300">No Room Backgrounds Found</h3>
                    <p className="text-gray-500 text-sm mt-1">Add background themes for hosts to customize audio rooms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {backgrounds.map((bg) => (
                        <div key={bg.id} className="bg-gray-800/60 border border-gray-700/60 rounded-xl overflow-hidden shadow-md hover:border-purple-500/50 transition-all flex flex-col">
                            <div className="relative h-44 bg-gray-900 overflow-hidden">
                                <MediaImage
                                    src={bg.image}
                                    alt={bg.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {bg.isDefault && (
                                        <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded shadow">
                                            DEFAULT
                                        </span>
                                    )}
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded shadow ${bg.isActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        {bg.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-white truncate">{bg.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Sort Order: {bg.sortOrder || 0}</p>
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-700/40">
                                    <button
                                        onClick={() => handleOpenEditModal(bg)}
                                        className="p-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                                        title="Edit Background"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(bg.id)}
                                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                                        title="Delete Background"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingBg ? 'Edit Room Background' : 'Add Room Background'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Background Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Royal Purple Lounge"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Image Upload (PNG / JPG)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Or Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                        />
                                        Set as Default
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Background'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Room Background"
                    message="Are you sure you want to delete this room background? Rooms currently using it will revert to default."
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default RoomBackgrounds;
