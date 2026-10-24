import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    Sparkles, Plus, Trash2, Edit, Coins, Percent, Trophy, 
    TrendingUp, Info, Layout, X, Save, Search, AlertCircle, 
    Gift as GiftIcon, ArrowUpRight, Zap
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
                setGifts(luckyRes.value.data.data || []);
            } else {
                console.error('Lucky gifts fetch error:', luckyRes.reason);
                toast.error('Failed to load lucky gifts');
            }

            if (catRes.status === 'fulfilled') {
                setCategories(catRes.value.data.data || []);
            }
        } catch (err) {
            console.error('Failed fetching lucky gifts:', err);
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

    // Calculations for preview in modal
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
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
                        <Sparkles className="icon-amber" size={28} />
                        Lucky Gifts Management
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
                        Configure lucky items with instant reward multipliers, bonus win percentages, and combo thresholds.
                    </p>
                </div>
                <button 
                    className="primary-btn" 
                    onClick={() => handleOpenModal()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                    <Plus size={18} />
                    Add Lucky Gift
                </button>
            </div>

            {/* Mechanics Highlight Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>
                        How Lucky Gifts Work (Active In Mobile App)
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                        When a user taps a lucky gift <strong>instantly or reaches the threshold</strong> (e.g., 5 times at 10 coins = 50 coins), 
                        the user triggers the lucky reward percentage (e.g., 40%) and receives <strong>50 + 20 = 70 coins</strong> credited directly back to their wallet. 
                        If they send only 1 or 2 times without reaching threshold, standard coin price is debited without reward.
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card" style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '12px', borderRadius: '10px' }}>
                        <GiftIcon size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Active Lucky Gifts</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{gifts.length}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '12px', borderRadius: '10px' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Default Threshold</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>5 Times</div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '12px', borderRadius: '10px' }}>
                        <Percent size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Standard Reward Rate</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>40% Bonus</div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '12px', borderRadius: '10px' }}>
                        <Coins size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Reward Return Formula</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Base + Bonus (140%)</div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '280px', flex: '1' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search lucky gifts by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lucky Gifts Table */}
            <div className="table-responsive" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                            <th style={{ padding: '14px 16px' }}>Icon / Preview</th>
                            <th style={{ padding: '14px 16px' }}>Lucky Gift Name</th>
                            <th style={{ padding: '14px 16px' }}>Price (Coins)</th>
                            <th style={{ padding: '14px 16px' }}>Lucky Threshold</th>
                            <th style={{ padding: '14px 16px' }}>Reward %</th>
                            <th style={{ padding: '14px 16px' }}>Win Payout (Base + Bonus)</th>
                            <th style={{ padding: '14px 16px' }}>Status</th>
                            <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    Loading lucky gifts catalog...
                                </td>
                            </tr>
                        ) : filteredGifts.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <Sparkles size={32} style={{ color: '#cbd5e1', margin: '0 auto 10px auto', display: 'block' }} />
                                    No lucky gifts found. Click <strong>"Add Lucky Gift"</strong> above to create your first lucky reward item.
                                </td>
                            </tr>
                        ) : (
                            filteredGifts.map((gift) => {
                                const price = gift.price || 0;
                                const threshold = gift.luckyThreshold || 5;
                                const rate = gift.luckyRewardRate !== null && gift.luckyRewardRate !== undefined ? gift.luckyRewardRate : 40;
                                const base = price * threshold;
                                const bonus = Math.round(base * (rate / 100));
                                const totalWin = base + bonus;

                                return (
                                    <tr key={gift.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                {isSvgaUrl(gift.animationUrl) ? (
                                                    <SvgaPlayer src={gift.animationUrl} style={{ width: '44px', height: '44px' }} />
                                                ) : (
                                                    <MediaImage src={gift.icon || gift.image || '/default_gift.png'} alt={gift.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{gift.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {gift.category?.name || 'Standard'} • ID: {gift.id?.slice(0, 8)}...
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#d97706' }}>
                                                <Coins size={16} />
                                                {price} Coins
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                                                <Zap size={14} />
                                                {threshold} Times
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                                                <Percent size={14} />
                                                +{rate}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 600, color: '#059669' }}>
                                                {totalWin} Coins
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                ({base} base + {bonus} bonus)
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: (gift.status || 'active').toLowerCase() === 'active' ? '#ecfdf5' : '#f1f5f9',
                                                color: (gift.status || 'active').toLowerCase() === 'active' ? '#059669' : '#64748b'
                                            }}>
                                                {(gift.status || 'active').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleOpenModal(gift)} 
                                                    title="Edit Lucky Gift"
                                                    style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(gift.id)} 
                                                    title="Delete Lucky Gift"
                                                    style={{ background: '#fee2e2', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Lucky Gift Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 99999, padding: '20px'
                }}>
                    <div className="modal-content" style={{
                        background: '#ffffff', borderRadius: '16px',
                        width: '100%', maxWidth: '640px', maxHeight: '90vh',
                        overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative', border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={20} className="icon-amber" />
                                {editingGift ? 'Edit Lucky Gift' : 'Create New Lucky Gift'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Lucky Gift Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Lucky Clover, Golden Fortune, Dragon Egg"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Coin Price Per Send (Coins) *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Coins size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="number" 
                                            step="any"
                                            required 
                                            placeholder="10"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        />
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        Amount debited from user per instant tap
                                    </small>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Category
                                    </label>
                                    <select 
                                        value={formData.categoryId} 
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
                                    >
                                        <option value="">Select Category (Optional)</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Lucky Threshold (Times) *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Zap size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2563eb' }} />
                                        <input 
                                            type="number" 
                                            min="1"
                                            required 
                                            placeholder="5"
                                            value={formData.luckyThreshold}
                                            onChange={(e) => setFormData({ ...formData, luckyThreshold: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        />
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        Number of times sent instantly or in combo to trigger reward
                                    </small>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Reward Bonus Percentage (%) *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Percent size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#059669' }} />
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="any"
                                            required 
                                            placeholder="40"
                                            value={formData.luckyRewardRate}
                                            onChange={(e) => setFormData({ ...formData, luckyRewardRate: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        />
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        Bonus on top of base cost (e.g. 40% = 50 + 20 = 70)
                                    </small>
                                </div>
                            </div>

                            {/* Live Reward Simulator Box */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '10px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '13px' }}>
                                    <Trophy size={16} style={{ color: '#f59e0b' }} />
                                    Live Win Simulator For This Gift:
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                                    <div>• 1-2 sends: Only <strong>{previewPrice} coins</strong> debited per tap (No reward).</div>
                                    <div>• At <strong>{previewThreshold} sends</strong> (Total spent: {previewPrice} × {previewThreshold} = <strong>{previewBase} coins</strong>):</div>
                                    <div style={{ padding: '6px 10px', background: '#ecfdf5', borderRadius: '6px', marginTop: '6px', color: '#065f46', fontWeight: 600 }}>
                                        User receives {previewBase} base + {previewBonus} bonus ({previewRate}%) = <span style={{ color: '#059669', fontSize: '15px' }}>{previewTotalReward} Coins</span> credited back!
                                    </div>
                                </div>
                            </div>

                            {/* File Uploads */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Gift Icon / Image
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'icon')}
                                        style={{ width: '100%', fontSize: '13px' }}
                                    />
                                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        PNG, JPG, SVG or WEBP
                                    </small>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Animation File (SVGA / Lottie)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept=".svga,.json,.gif"
                                        onChange={(e) => handleFileChange(e, 'animation')}
                                        style={{ width: '100%', fontSize: '13px' }}
                                    />
                                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        SVGA, Lottie JSON, or animated GIF
                                    </small>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Sound Effect (Optional)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="audio/*"
                                        onChange={(e) => handleFileChange(e, 'sound')}
                                        style={{ width: '100%', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Save size={16} />
                                    {isSubmitting ? 'Saving...' : editingGift ? 'Save Changes' : 'Create Lucky Gift'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Lucky Gift"
                    message="Are you sure you want to delete this lucky gift? It will no longer appear in the mobile app lucky menu."
                    confirmText={isDeleting ? 'Deleting...' : 'Delete Gift'}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default LuckyGifts;
