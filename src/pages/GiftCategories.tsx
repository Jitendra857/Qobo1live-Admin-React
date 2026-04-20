import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { Layout, Plus, Trash2, Edit, Save, X, Check, Archive } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/UserManagement.css';

const GiftCategories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
    });

    const fetchCategories = async () => {
        try {
            const res = await adminService.getCategories();
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
        } else {
            setEditingCategory(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
        // Removed window.scrollTo to prevent UI jumping
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');
        
        try {
            await adminService.manageCategory(
                editingCategory ? 'update' : 'add',
                formData,
                editingCategory?.id
            );
            toast.success(editingCategory ? 'Category updated' : 'Category created', { id: toastId });
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        const toastId = toast.loading('Removing category...');
        try {
            await adminService.manageCategory('delete', {}, id);
            toast.success('Category removed', { id: toastId });
            setShowDeleteConfirm(null);
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to remove category', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="user-management fade-in relative">
            <Toaster position="top-right" />
            
            <div className="header-actions">
                <h2 className="page-title">Gift Categories</h2>
                <div className="top-tools">
                    <button className="primary flex-center gap-2" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Create Category</span>
                    </button>
                </div>
            </div>

            <div className="glass mt-10 p-1" style={{ width: '100%', overflow: 'hidden' }}>
                <div className="table-container-premium">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Category Identity</th>
                                <th style={{ width: '20%' }}>Asset Density</th>
                                <th style={{ width: '20%' }}>Registry Date</th>
                                <th style={{ width: '20%', textAlign: 'right' }}>Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                                        No category data recovered.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="row-premium">
                                        <td>
                                            <div className="identity-block">
                                                <div className="avatar-glass"><Archive size={18} /></div>
                                                <div className="identity-text">
                                                    <span className="name-bold" style={{ color: '#1e293b' }}>{cat.name}</span>
                                                    <span className="email-sub" style={{ color: '#64748b' }}>Active Category Identity</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="data-cell">
                                            <div className="asset-tag">
                                                <Layout size={14} />
                                                <span>{cat._count?.gifts || 0} Assets</span>
                                            </div>
                                        </td>
                                        <td className="data-cell">
                                            <span className="rank-badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' }}>
                                                {new Date(cat.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ops-cluster">
                                                <button className="op-btn edit" title="Modify" onClick={() => handleOpenModal(cat)}>
                                                    <Edit size={18} />
                                                </button>
                                                <button className="op-btn delete" title="Terminate" onClick={() => setShowDeleteConfirm(cat.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel slide-up" style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Modify Category Identity' : 'Provision New Category'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label>
                                    <Archive size={16} color="var(--accent-blue)" /> Category Name
                                </label>
                                <input 
                                    type="text" 
                                    className="admin-input" 
                                    placeholder="Enter category nomenclature..."
                                    value={formData.name}
                                    onChange={e => setFormData({ name: e.target.value })}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="primary-btn w-full flex-center gap-2" 
                                disabled={isSubmitting}
                            >
                                <Check size={20} />
                                <span>{isSubmitting ? 'Synchronizing...' : (editingCategory ? 'Commit Changes' : 'Confirm Creation')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Delete Category?"
                    message="This will remove the category. Linked gifts will remain but will be uncategorized."
                    confirmText="Delete Category"
                    cancelText="Keep Category"
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default GiftCategories;
