import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Sparkles, Plus, Trash2, Edit, Coins, Percent, Trophy, 
    TrendingUp, Layout, X, Save, Search, Check, Gift as GiftIcon, 
    ArrowUpRight, Zap, Activity, Music, Archive, RefreshCw, List, Grid
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import SvgaPlayer from '../components/SvgaPlayer';
import '../styles/UserManagement.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

const LuckyGifts: React.FC = () => {
    const isSvgaUrl = (url: string | null | undefined): boolean => {
        if (!url) return false;
        const low = url.toLowerCase();
        return low.includes('.svga') || 
               (low.includes('/gifts/animations/') && !low.endsWith('.json') && !low.endsWith('.gif'));
    };

    const [gifts, setGifts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredGiftId, setHoveredGiftId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingGift, setEditingGift] = useState<any>(null);

    const [formData, setFormData] = useState<any>({
        name: '',
        price: '10',
        type: 'lucky',
        isLucky: true,
        luckyThreshold: '5',
        luckyRewardRate: '40',
        categoryId: '',
        animationUrl: '',
        status: 'active'
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        icon: null,
        animation: null,
        sound: null
    });

    const fetchLuckyGifts = async () => {
        try {
            setLoading(true);
            const [luckyRes, catRes] = await Promise.allSettled([
                adminService.getLuckyGifts(),
                adminService.getCategories()
            ]);

            if (luckyRes.status === 'fulfilled') {
                const fetched = luckyRes.value?.data?.data;
                setGifts(Array.isArray(fetched) ? fetched : []);
            } else {
                console.warn('Lucky gifts fetch warning:', luckyRes.reason);
                // Fallback attempt via standard gift list with lucky filter
                try {
                    const fallbackRes = await adminService.getGifts();
                    const allGifts = fallbackRes?.data?.data || [];
                    const filtered = allGifts.filter((g: any) => g.type === 'lucky' || g.isLucky === true);
                    setGifts(filtered);
                } catch {
                    setGifts([]);
                }
            }

            if (catRes.status === 'fulfilled') {
                setCategories(catRes.value?.data?.data || []);
            }
        } catch (err) {
            console.error('Failed fetching lucky gifts:', err);
            setGifts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLuckyGifts();
    }, []);

    const handleOpenModal = (gift: any = null) => {
        if (gift) {
            setEditingGift(gift);
            setFormData({
                name: gift.name || '',
                price: gift.price?.toString() || '10',
                type: 'lucky',
                isLucky: true,
                luckyThreshold: (gift.luckyThreshold || 5).toString(),
                luckyRewardRate: (gift.luckyRewardRate !== null && gift.luckyRewardRate !== undefined ? gift.luckyRewardRate : 40).toString(),
                categoryId: gift.categoryId || '',
                animationUrl: gift.animationUrl || '',
                status: gift.status || 'active'
            });
        } else {
            setEditingGift(null);
            setFormData({
                name: '',
                price: '10',
                type: 'lucky',
                isLucky: true,
                luckyThreshold: '5',
                luckyRewardRate: '40',
                categoryId: '',
                animationUrl: '',
                status: 'active'
            });
        }
        setFiles({ icon: null, animation: null, sound: null });
        setIsModalOpen(true);
        scrollToModalTop();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Gift name is required');
            return;
        }

        const priceNum = parseFloat(formData.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error('Please enter a valid price greater than 0');
            return;
        }

        const thresholdNum = parseInt(formData.luckyThreshold, 10);
        if (isNaN(thresholdNum) || thresholdNum <= 0) {
            toast.error('Threshold must be at least 1');
            return;
        }

        const rateNum = parseFloat(formData.luckyRewardRate);
        if (isNaN(rateNum) || rateNum < 0) {
            toast.error('Reward rate cannot be negative');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(editingGift ? 'Updating Lucky Gift...' : 'Creating Lucky Gift...');

        try {
            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('price', priceNum.toString());
            data.append('type', 'lucky');
            data.append('isLucky', 'true');
            data.append('luckyThreshold', thresholdNum.toString());
            data.append('luckyRewardRate', rateNum.toString());
            data.append('status', formData.status || 'active');

            if (formData.categoryId) {
                data.append('categoryId', formData.categoryId);
            }
            if (formData.animationUrl && !files.animation) {
                data.append('animationUrl', formData.animationUrl);
            }

            if (files.icon) data.append('icon', files.icon);
            if (files.animation) data.append('animation', files.animation);
            if (files.sound) data.append('sound', files.sound);

            const action = editingGift ? 'edit' : 'add';
            await adminService.manageLuckyGift(action, data, editingGift?.id);

            toast.success(editingGift ? 'Lucky Gift updated successfully!' : 'Lucky Gift created successfully!', { id: toastId });
            setIsModalOpen(false);
            fetchLuckyGifts();
        } catch (err: any) {
            console.error('Lucky Gift Submission Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Operation failed';
            toast.error(errorMsg, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        const toastId = toast.loading('Deleting Lucky Gift...');
        try {
            await adminService.manageGift('delete', {}, id);
            toast.success('Lucky Gift removed successfully', { id: toastId });
            setShowDeleteConfirm(null);
            fetchLuckyGifts();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to remove gift', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    // Live calculation values for modal preview
    const previewPrice = Math.max(0, parseFloat(formData.price) || 0);
    const previewThreshold = Math.max(1, parseInt(formData.luckyThreshold, 10) || 5);
    const previewRate = Math.max(0, parseFloat(formData.luckyRewardRate) || 0);
    const previewBase = previewPrice * previewThreshold;
    const previewBonus = Math.round(previewBase * (previewRate / 100));
    const previewTotalReward = previewBase + previewBonus;

    const filteredGifts = gifts.filter(gift => {
        const matchesSearch = !searchQuery || 
            (gift.name && gift.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (gift.id && gift.id.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCat = selectedCategory === 'all' || gift.categoryId === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="dashboard-page gifts-page">
            <Toaster position="top-right" />
            
            {/* Standard Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-text-group">
                    <h1 className="flex items-center gap-2">
                        <Sparkles className="icon-amber" size={26} />
                        Lucky Gifts Management
                    </h1>
                    <p className="subtitle">Configure lucky items with instant reward multipliers, bonus win percentages, and combo thresholds</p>
                </div>
                <div className="header-actions">
                    <button className="secondary flex items-center gap-2" onClick={fetchLuckyGifts}>
                        <RefreshCw size={18} />
                        <span>Reload</span>
                    </button>
                    <button className="primary flex items-center gap-2" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Add Lucky Gift</span>
                    </button>
                </div>
            </div>

            {/* Mechanics Explanation Banner */}
            <div style={{
                background: '#fff',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
            }}>
                <div style={{ background: '#fef3c7', color: '#d97706', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={20} />
                </div>
                <div style={{ flex: 1, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0f172a' }}>How Lucky Gifts Operate: </strong>
                    When a user sends 1 or 2 times, standard coins are debited. When the user reaches the configured threshold 
                    (e.g., <strong>5 sends at 10 coins = 50 coins</strong>), the bonus reward rate (e.g., <strong>40% = 20 coins</strong>) triggers instantly, 
                    crediting <strong>50 + 20 = 70 coins</strong> directly back to the user's wallet!
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row mb-6">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-blue">Active Lucky Items</span>
                        <span className="value" style={{ fontSize: '22px' }}>{gifts.length} Gifts</span>
                    </div>
                    <div className="stat-icon">
                        <GiftIcon size={32} color="#dddfeb" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-orange">Default Threshold</span>
                        <span className="value" style={{ fontSize: '22px' }}>5 Times Combo</span>
                    </div>
                    <div className="stat-icon">
                        <Zap size={32} color="#dddfeb" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="label label-green">Standard Bonus Return</span>
                        <span className="value" style={{ fontSize: '22px' }}>+40% Bonus (140% Total)</span>
                    </div>
                    <div className="stat-icon">
                        <Percent size={32} color="#dddfeb" />
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '280px', maxWidth: '500px' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            className="premium-input-field" 
                            placeholder="Search lucky gifts by name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                    <select 
                        className="premium-input-field select"
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: 'auto', minWidth: '160px' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                        type="button" 
                        onClick={() => setViewMode('grid')}
                        className={`action-circle ${viewMode === 'grid' ? 'active' : ''}`}
                        style={{ background: viewMode === 'grid' ? '#2563eb' : '#fff', color: viewMode === 'grid' ? '#fff' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}
                        title="Grid View"
                    >
                        <Grid size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setViewMode('table')}
                        className={`action-circle ${viewMode === 'table' ? 'active' : ''}`}
                        style={{ background: viewMode === 'table' ? '#2563eb' : '#fff', color: viewMode === 'table' ? '#fff' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}
                        title="Table View"
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Activity size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto', display: 'block', color: '#2563eb' }} />
                    Loading lucky gifts catalog...
                </div>
            ) : filteredGifts.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Sparkles size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px auto', display: 'block' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>No Lucky Gifts Found</h3>
                    <p style={{ fontSize: '13px', margin: 0 }}>Click <strong>"Add Lucky Gift"</strong> above to create your first lucky reward item.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Card Grid View Matching Gifts.tsx */
                <div className="gift-grid">
                    {filteredGifts.map((gift) => {
                        const price = gift.price || 0;
                        const threshold = gift.luckyThreshold || 5;
                        const rate = gift.luckyRewardRate !== null && gift.luckyRewardRate !== undefined ? gift.luckyRewardRate : 40;
                        const base = price * threshold;
                        const bonus = Math.round(base * (rate / 100));
                        const totalWin = base + bonus;

                        return (
                            <div 
                                key={gift.id} 
                                className="gift-card" 
                                style={{ border: '1px solid #f1f5f9' }}
                                onMouseEnter={() => setHoveredGiftId(gift.id)}
                                onMouseLeave={() => setHoveredGiftId(null)}
                            >
                                <div className="card-top">
                                    <div className="card-label lucky" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Trophy size={11} /> LUCKY
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="action-circle edit" onClick={() => handleOpenModal(gift)} title="Edit Gift">
                                            <Edit size={13} />
                                        </button>
                                        <button className="action-circle delete" onClick={() => setShowDeleteConfirm(gift.id)} title="Delete Gift">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-center">
                                    <div className="asset-icon-box" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {hoveredGiftId === gift.id && isSvgaUrl(gift.animationUrl) ? (
                                            <SvgaPlayer src={gift.animationUrl} style={{ width: '80px', height: '80px' }} />
                                        ) : gift.icon && !isSvgaUrl(gift.icon) ? (
                                            <MediaImage src={gift.icon} alt={gift.name} className="asset-icon" loading="lazy" />
                                        ) : gift.image && !isSvgaUrl(gift.image) ? (
                                            <MediaImage src={gift.image} alt={gift.name} className="asset-icon" loading="lazy" />
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f59e0b' }}>
                                                <Trophy size={36} />
                                                {isSvgaUrl(gift.animationUrl) && (
                                                    <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                        Hover to Play
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="asset-name" style={{ marginTop: '10px' }}>{gift.name}</h3>
                                    <div className="asset-price" style={{ color: '#d97706', fontWeight: 800, fontSize: '1.15rem' }}>
                                        {price} Coins
                                    </div>

                                    {/* Reward Pill */}
                                    <div style={{
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        marginTop: '8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        <Zap size={12} color="#059669" />
                                        {threshold} sends → Win {totalWin} Coins (+{rate}%)
                                    </div>
                                </div>

                                <div className="card-footer mt-auto border-t border-slate-50 pt-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center w-full">
                                        <div className={`meta-pill ${gift.animationUrl ? 'active' : ''}`}>
                                            <Layout size={12} /> <span style={{ fontSize: '10px' }}>{isSvgaUrl(gift.animationUrl) ? 'SVGA' : 'PNG/SVG'}</span>
                                        </div>
                                        <div className={`meta-pill ${gift.soundUrl ? 'active' : ''}`}>
                                            <Music size={12} /> <span style={{ fontSize: '10px' }}>Audio</span>
                                        </div>
                                    </div>
                                    {gift.category && (
                                        <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                            <Archive size={10} /> {gift.category.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="table-responsive" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                                <th style={{ padding: '12px 16px' }}>Icon</th>
                                <th style={{ padding: '12px 16px' }}>Name</th>
                                <th style={{ padding: '12px 16px' }}>Price</th>
                                <th style={{ padding: '12px 16px' }}>Threshold</th>
                                <th style={{ padding: '12px 16px' }}>Bonus %</th>
                                <th style={{ padding: '12px 16px' }}>Total Win Payout</th>
                                <th style={{ padding: '12px 16px' }}>Category</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGifts.map((gift) => {
                                const price = gift.price || 0;
                                const threshold = gift.luckyThreshold || 5;
                                const rate = gift.luckyRewardRate !== null && gift.luckyRewardRate !== undefined ? gift.luckyRewardRate : 40;
                                const base = price * threshold;
                                const bonus = Math.round(base * (rate / 100));
                                const totalWin = base + bonus;

                                return (
                                    <tr key={gift.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {isSvgaUrl(gift.animationUrl) ? (
                                                    <SvgaPlayer src={gift.animationUrl} style={{ width: '38px', height: '38px' }} />
                                                ) : (
                                                    <MediaImage src={gift.icon || gift.image || '/default_gift.png'} alt={gift.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{gift.name}</td>
                                        <td style={{ padding: '10px 16px', fontWeight: 600, color: '#d97706' }}>{price} Coins</td>
                                        <td style={{ padding: '10px 16px' }}>
                                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                                                {threshold} sends
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px' }}>
                                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                                                +{rate}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px' }}>
                                            <strong style={{ color: '#059669' }}>{totalWin} Coins</strong>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>({base} base + {bonus} bonus)</div>
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{gift.category?.name || 'Standard'}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button className="action-circle edit" onClick={() => handleOpenModal(gift)} title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button className="action-circle delete" onClick={() => setShowDeleteConfirm(gift.id)} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Premium Add / Edit Modal Matching Gifts.tsx Style */}
            {isModalOpen && (
                <div className="modal-overlay-refined fade-in">
                    <div className="modal-content-premium slide-up" style={{ maxWidth: '580px', width: '92%' }}>
                        <div className="modal-header-glass">
                            <div className="header-identity">
                                <div>
                                    <h3 className="modal-headline">
                                        {editingGift ? 'Update Lucky Gift' : 'Provision New Lucky Gift'}
                                    </h3>
                                    <p className="modal-subline" style={{ display: 'block', fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                                        Configure instant winning return rate and send thresholds
                                    </p>
                                </div>
                            </div>
                            <button className="close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-refined" style={{ padding: '20px' }}>
                            {/* Gift Name */}
                            <div className="form-section">
                                <label className="input-label-premium">Lucky Gift Name *</label>
                                <div className="input-wrapper-glass">
                                    <input 
                                        type="text" 
                                        className="premium-input-field"
                                        placeholder="e.g. Lucky Clover, Golden Fortune, Dragon Egg"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Price & Category */}
                            <div className="grid-row-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-section">
                                    <label className="input-label-premium">Coin Price Per Send (Coins) *</label>
                                    <div className="input-wrapper-glass">
                                        <input 
                                            type="number" 
                                            step="any"
                                            className="premium-input-field"
                                            placeholder="10"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                                        Amount debited from user per tap
                                    </small>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Category</label>
                                    <div className="input-wrapper-glass">
                                        <select 
                                            className="premium-input-field select"
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                        >
                                            <option value="">Uncategorized (Standard)</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Threshold & Bonus Rate */}
                            <div className="grid-row-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-section">
                                    <label className="input-label-premium">Lucky Threshold (Times) *</label>
                                    <div className="input-wrapper-glass">
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="premium-input-field"
                                            placeholder="5"
                                            value={formData.luckyThreshold}
                                            onChange={e => setFormData({ ...formData, luckyThreshold: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                                        Required sends in combo to win
                                    </small>
                                </div>

                                <div className="form-section">
                                    <label className="input-label-premium">Reward Bonus Percentage (%) *</label>
                                    <div className="input-wrapper-glass">
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="any"
                                            className="premium-input-field"
                                            placeholder="40"
                                            value={formData.luckyRewardRate}
                                            onChange={e => setFormData({ ...formData, luckyRewardRate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                                        Bonus return on top of base cost
                                    </small>
                                </div>
                            </div>

                            {/* Live Win Simulator Box */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginTop: '4px',
                                marginBottom: '10px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', fontSize: '12px' }}>
                                    <Trophy size={14} style={{ color: '#f59e0b' }} />
                                    Live Win Simulator For This Gift:
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                                    <div>• Sends 1 to {previewThreshold - 1}: User pays <strong>{previewPrice} coins</strong> per tap (No reward).</div>
                                    <div>• On Send {previewThreshold} (Total spent: {previewPrice} × {previewThreshold} = <strong>{previewBase} coins</strong>):</div>
                                    <div style={{ padding: '6px 10px', background: '#ecfdf5', borderRadius: '6px', marginTop: '4px', color: '#065f46', fontWeight: 600 }}>
                                        User receives {previewBase} base + {previewBonus} bonus ({previewRate}%) = <span style={{ color: '#059669', fontSize: '14px', fontWeight: 800 }}>{previewTotalReward} Coins</span> credited back!
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Grid Matching Gifts.tsx */}
                            <div className="file-upload-grid-premium">
                                <div className="upload-unit">
                                    <span className="unit-label">Icon</span>
                                    <input type="file" accept="image/*,.svg" className="hidden" id="lucky-icon-up" onChange={e => handleFileChange(e, 'icon')} />
                                    <label htmlFor="lucky-icon-up" className={`unit-box ${files.icon ? 'done' : ''}`} style={{ cursor: 'pointer' }}>
                                        {files.icon ? <Check size={20} /> : <GiftIcon size={22} />}
                                    </label>
                                </div>
                                <div className="upload-unit">
                                    <span className="unit-label">SVGA Anim</span>
                                    <input type="file" accept=".json,.svga,.gif,image/*" className="hidden" id="lucky-anim-up" onChange={e => handleFileChange(e, 'animation')} />
                                    <label htmlFor="lucky-anim-up" className={`unit-box ${files.animation ? 'done' : ''}`} style={{ cursor: 'pointer' }}>
                                        {files.animation ? <Check size={20} /> : <Layout size={22} />}
                                    </label>
                                </div>
                                <div className="upload-unit">
                                    <span className="unit-label">Audio Sound</span>
                                    <input type="file" accept="audio/*,.mp3,.wav" className="hidden" id="lucky-sound-up" onChange={e => handleFileChange(e, 'sound')} />
                                    <label htmlFor="lucky-sound-up" className={`unit-box ${files.sound ? 'done' : ''}`} style={{ cursor: 'pointer' }}>
                                        {files.sound ? <Check size={20} /> : <Music size={22} />}
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isSubmitting ? (
                                        <>Saving Asset...</>
                                    ) : (
                                        <>
                                            {editingGift ? 'Update Lucky Gift' : 'Publish Lucky Gift'}
                                            <ArrowUpRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Standard Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Lucky Gift"
                    message="Are you sure you want to permanently delete this lucky gift? It will no longer appear in the mobile app lucky menu."
                    confirmText={isDeleting ? 'Deleting...' : 'Delete Gift'}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default LuckyGifts;
