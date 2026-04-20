import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { Gift as GiftIcon, Plus, Trash2, Edit, Trophy, TrendingUp, Music, Layout, X, Check, Save, Gem, Coins, PieChart, AlertCircle, Archive, ArrowUpRight, Activity } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/UserManagement.css';

const Gifts: React.FC = () => {
    const [gifts, setGifts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingGift, setEditingGift] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
        price: '',
        type: 'normal',
        winRate: '',
        categoryId: '',
    });
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        icon: null,
        animation: null,
        sound: null
    });

    const fetchGifts = async () => {
        try {
            const results = await Promise.allSettled([
                adminService.getGifts(),
                adminService.getGiftStats(),
                adminService.getCategories()
            ]);

            // Gifts
            if (results[0].status === 'fulfilled') {
                setGifts(results[0].value.data.data || []);
            } else {
                console.error('Gifts fetch failed:', results[0]?.reason);
                toast.error('Sync failure: Inventory assets unreachable');
            }

            // Stats
            if (results[1].status === 'fulfilled') {
                setStats(results[1].value.data.data || []);
            }

            // Categories
            if (results[2].status === 'fulfilled') {
                const fetchedCats = results[2].value.data.data || [];
                console.log('Categories synced:', fetchedCats.length);
                setCategories(fetchedCats);
            } else {
                console.warn('Category resonance failed:', results[2]?.reason);
            }

        } catch (err) {
            console.error('Core Registry Failure:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshCategories = async () => {
        try {
            const res = await adminService.getCategories();
            if (res.data.success) {
                const fetchedCats = res.data.data || [];
                setCategories(fetchedCats);
                if (fetchedCats.length > 0) {
                    toast.success(`${fetchedCats.length} Categories Synchronized`, { duration: 1500 });
                }
            }
        } catch (err) {
            console.warn('Manual sync failure');
            toast.error('Sync failure');
        }
    };

    useEffect(() => {
        fetchGifts();
    }, []);

    const handleOpenModal = (gift: any = null) => {
        refreshCategories(); // Sync categories whenever modal opens
        if (gift) {
            setEditingGift(gift);
            setFormData({
                name: gift.name,
                price: gift.price,
                type: gift.type,
                winRate: gift.winRate || '',
                categoryId: gift.categoryId || '',
            });
        } else {
            setEditingGift(null);
            setFormData({
                name: '',
                price: '',
                type: 'normal',
                winRate: '',
                categoryId: '',
            });
        }
        setFiles({ icon: null, animation: null, sound: null });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setShowDeleteConfirm(id);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        const toastId = toast.loading(editingGift ? 'Updating high-fidelity asset...' : 'Publishing new digital asset...');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });
            if (files.icon) data.append('icon', files.icon);
            if (files.animation) data.append('animation', files.animation);
            if (files.sound) data.append('sound', files.sound);

            const action = editingGift ? 'edit' : 'add';
            const response = await adminService.manageGift(action, data, editingGift?.id);
            
            console.log('Server response:', response.data);
            
            toast.success(editingGift ? 'Asset updated successfully!' : 'New asset created successfully!', { id: toastId });
            setIsModalOpen(false);
            fetchGifts();
        } catch (err: any) {
            console.error('Submission Error:', err);
            const errorMsg = err.response?.data?.message || 'Operation failed. Please check file sizes and formats.';
            toast.error(errorMsg, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        const toastId = toast.loading('Removing asset...');
        try {
            await adminService.manageGift('delete', {}, id);
            toast.success('Asset removed successfully', { id: toastId });
            setShowDeleteConfirm(null);
            fetchGifts();
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove asset', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="user-management fade-in relative">
            <Toaster position="top-right" gutter={8} toastOptions={{
                duration: 5000,
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '20px 28px',
                    fontSize: '15px',
                    fontWeight: 500,
                    zIndex: 99999
                }
            }} containerStyle={{ top: 60, right: 60, zIndex: 99999 }} />
            {/* Analytics Section */}
            <div className="analytics-overview mb-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="page-title">Digital Store Inventory</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Advanced asset and economy management</p>
                    </div>
                    <button className="primary flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg hover:transform hover:-translate-y-1 transition-all w-fit" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Add New Asset</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 justify-items-center">
                    <div className="bento-card gift-analytics-card blue p-6">
                        <div className="highlight-bar"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="data-cell-dim">Top Selling Asset</p>
                                <h3 className="text-2xl font-bold mt-1">{stats[0]?.name || 'N/A'}</h3>
                                <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                    <TrendingUp size={12} /> {stats[0]?.salesCount || 0} units this week
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
                                <Trophy size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bento-card gift-analytics-card yellow p-6">
                        <div className="highlight-bar"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="data-cell-dim">Lucky Pool Revenue</p>
                                <h3 className="text-2xl font-bold mt-1">₹{stats.reduce((acc, s) => acc + s.totalRevenue, 0).toLocaleString()}</h3>
                                <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                                    <PieChart size={12} /> Total gift sales
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-500">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bento-card gift-analytics-card purple p-6">
                        <div className="highlight-bar"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="data-cell-dim">Active Inventory</p>
                                <h3 className="text-2xl font-bold mt-1">{gifts.length} Items</h3>
                                <p className="text-xs text-purple-500 mt-2 flex items-center gap-1">
                                    <Layout size={12} /> Normal, Lucky & Luxury
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-500">
                                <GiftIcon size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="gift-grid mt-6">
                {gifts.map((gift) => (
                    <div key={gift.id} className="gift-card asset-card overflow-hidden">
                        <div className="card-top">
                            <div className={`card-label ${gift.type}`}>
                                {gift.type === 'lucky' ? <Trophy size={12} /> : gift.type === 'luxury' ? <Gem size={12} /> : <GiftIcon size={12} />}
                                {gift.type.toUpperCase()}
                            </div>
                            <div className="flex gap-2">
                                <button className="action-circle edit" onClick={() => handleOpenModal(gift)}>
                                    <Edit size={14} />
                                </button>
                                <button className="action-circle delete" onClick={() => handleDeleteClick(gift.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="card-content flex flex-col items-center py-2">
                            <div className="asset-icon-box mb-3">
                                {gift.type === 'luxury' ? <Gem className="text-purple-500" size={36} /> : <GiftIcon className="text-blue-500" size={36} />}
                            </div>
                            <h3 className="asset-name">{gift.name}</h3>
                            <div className="asset-price">₹{gift.price}</div>
                            {gift.winRate && (
                                <div className="win-badge mt-1">
                                    <Check size={10} /> {gift.winRate}% Win Chance
                                </div>
                            )}
                        </div>
                        
                        <div className="card-footer mt-auto border-t border-slate-50 pt-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center w-full">
                                <div className={`meta-pill ${gift.animationUrl ? 'active' : ''}`}>
                                    <Layout size={12} /> <span>Lottie</span>
                                </div>
                                <div className={`meta-pill ${gift.soundUrl ? 'active' : ''}`}>
                                    <Music size={12} /> <span>Audio</span>
                                </div>
                            </div>
                            {gift.category && (
                                <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                    <Archive size={10} /> {gift.category.name}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Management Modal */}
            {isModalOpen && (
                <div className="modal-overlay-refined fade-in">
                    <div className="modal-content-premium slide-up" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header-glass">
                            <div className="header-identity">
                                <div className="header-icon-wrap">
                                    {editingGift ? <Edit size={22} /> : <Plus size={22} />}
                                </div>
                                <div>
                                    <h3 className="modal-headline">{editingGift ? 'Update Digital Asset' : 'Provision New Gift'}</h3>
                                    <p className="modal-subline">Configure high-fidelity economic assets</p>
                                </div>
                            </div>
                            <button className="close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-refined">
                            <div className="form-section">
                                <label className="input-label-premium">Display Name</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="text" 
                                        className="premium-input-field"
                                        placeholder="Enter definitive asset name..."
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-row-premium">
                                <div className="form-section">
                                    <label className="input-label-premium">Asset Price (₹)</label>
                                    <div className="input-wrapper-glass">
                                        <Coins size={16} className="input-prefix-icon" />
                                        <input 
                                            type="number" 
                                            className="premium-input-field with-prefix"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Asset Tier</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="normal">Normal Gift</option>
                                            <option value="lucky">Lucky Gift</option>
                                            <option value="luxury">Luxury Asset</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {formData.type === 'lucky' && (
                                <div className="special-banner lucky fade-in">
                                    <div className="banner-icon"><Trophy size={18} /></div>
                                    <div className="banner-content">
                                        <label className="banner-label">Win Probability</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            className="banner-input"
                                            placeholder="Percentage chance..."
                                            value={formData.winRate}
                                            onChange={e => setFormData({...formData, winRate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-section">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="input-label-premium">Administrative Category</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => refreshCategories()} className="refresh-btn-minimal" title="Refresh Sync">
                                            <Activity size={12} /> Sync
                                        </button>
                                        <a href="/gift-categories" className="helper-link-premium">
                                            <Plus size={10} /> Expand Categories
                                        </a>
                                    </div>
                                </div>
                                <div className="input-wrapper-glass">
                                    <select 
                                        className="premium-input-field select"
                                        value={formData.categoryId}
                                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                    >
                                        <option value="">Uncategorized (Legacy Default)</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="file-upload-grid-premium">
                                <div className="upload-unit">
                                    <span className="unit-label">Icon</span>
                                    <input type="file" className="hidden" id="icon-up" onChange={e => handleFileChange(e, 'icon')} />
                                    <label htmlFor="icon-up" className={`unit-box ${files.icon ? 'done' : ''}`}>
                                        {files.icon ? <Check size={20} /> : <GiftIcon size={24} />}
                                    </label>
                                </div>
                                <div className="upload-unit">
                                    <span className="unit-label">Anim</span>
                                    <input type="file" className="hidden" id="lottie-up" onChange={e => handleFileChange(e, 'animation')} />
                                    <label htmlFor="lottie-up" className={`unit-box ${files.animation ? 'done' : ''}`}>
                                        {files.animation ? <Check size={20} /> : <Layout size={24} />}
                                    </label>
                                </div>
                                <div className="upload-unit">
                                    <span className="unit-label">Audio</span>
                                    <input type="file" className="hidden" id="sound-up" onChange={e => handleFileChange(e, 'sound')} />
                                    <label htmlFor="sound-up" className={`unit-box ${files.sound ? 'done' : ''}`}>
                                        {files.sound ? <Check size={20} /> : <Music size={24} />}
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="primary-glass-submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>Processing Assets...</>
                                ) : (
                                    <>
                                        {editingGift ? 'Update Digital Asset' : 'Publish Asset to Store'}
                                        <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Standard Confirmation Modal (Matched to User Model) */}
            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Security Override Required"
                    message="You are about to permanently purge this asset from the digital ecosystem. This action cannot be undone."
                    confirmText="Verify & Delete"
                    cancelText="Abort Operation"
                    type="danger"
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default Gifts;
