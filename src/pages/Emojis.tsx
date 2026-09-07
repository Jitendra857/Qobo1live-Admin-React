import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Smile, Plus, Trash2, Edit, X, Save,
  Sparkles, RefreshCw, LayoutGrid, List, Search,
  Eye, EyeOff, Play, Volume2, Send, Radio
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';

const CATEGORIES = ['All', 'expressive', 'trending', 'reaction', 'celebration', 'vip'];

const Emojis: React.FC = () => {
  const [emojis, setEmojis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Preview States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [previewEmoji, setPreviewEmoji] = useState<any | null>(null);
  const [animationMode, setAnimationMode] = useState<'float' | 'bounce' | 'pulse' | 'burst'>('bounce');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmoji, setEditingEmoji] = useState<any>(null);

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    category: string;
    sortOrder: number;
    status: string;
    imageUrl: string;
  }>({
    name: '',
    code: '',
    category: 'expressive',
    sortOrder: 0,
    status: 'active',
    imageUrl: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const extractEmojiArray = (resData: any): any[] => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (Array.isArray(resData.data?.items)) return resData.data.items;
    if (Array.isArray(resData.items)) return resData.items;
    return [];
  };

  const fetchEmojis = async () => {
    try {
      setLoading(true);
      let items: any[] = [];

      try {
        const response = await adminService.getEmojis();
        if (response.data) {
          items = extractEmojiArray(response.data);
        }
      } catch (adminErr: any) {
        console.warn('Admin emoji endpoint error, trying fallback:', adminErr?.message);
      }

      // Fallback: If admin endpoint returns empty array or fails, fetch from public emoji list
      if (items.length === 0) {
        try {
          const publicRes = await adminService.getPublicEmojis();
          if (publicRes.data) {
            items = extractEmojiArray(publicRes.data);
          }
        } catch (pubErr: any) {
          console.warn('Public emoji fallback error:', pubErr?.message);
        }
      }

      setEmojis(Array.isArray(items) ? items : []);
    } catch (err: any) {
      console.error('Failed to fetch emojis:', err);
      setEmojis([]);
      const msg = err.response?.data?.message || err.message || 'Error connecting to backend server';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis();
  }, []);

  const handleSeedEmojis = async () => {
    try {
      setSeeding(true);
      const response = await adminService.seedEmojis();
      if (response.data && response.data.statusCode === 1) {
        toast.success(response.data.message || 'Test emojis seeded successfully!');
        fetchEmojis();
      } else {
        toast.error('Failed to seed test emojis');
        // Try refreshing catalog anyway
        fetchEmojis();
      }
    } catch (err) {
      console.error('Seed error:', err);
      toast.error('Error seeding test emojis');
      fetchEmojis();
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEmoji(null);
    setFormData({
      name: '',
      code: '',
      category: 'expressive',
      sortOrder: emojis.length + 1,
      status: 'active',
      imageUrl: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emoji: any) => {
    setEditingEmoji(emoji);
    setFormData({
      name: emoji.name,
      code: emoji.code || '',
      category: emoji.category || 'expressive',
      sortOrder: emoji.sortOrder || 0,
      status: emoji.status || 'active',
      imageUrl: emoji.image || ''
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
    if (!formData.name.trim()) {
      toast.error('Please enter an emoji name');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('code', formData.code.trim() || `:${formData.name.toLowerCase().replace(/\s+/g, '_')}:`);
      data.append('category', formData.category.toLowerCase());
      data.append('sortOrder', String(formData.sortOrder));
      data.append('status', formData.status);

      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.imageUrl) {
        data.append('image', formData.imageUrl);
      }

      let res;
      if (editingEmoji) {
        res = await adminService.manageEmoji('update', data, editingEmoji.id);
      } else {
        res = await adminService.manageEmoji('create', data);
      }

      if (res.data && res.data.statusCode === 1) {
        toast.success(editingEmoji ? 'Emoji updated successfully' : 'Emoji created successfully');
        setIsModalOpen(false);
        fetchEmojis();
      } else {
        toast.error(res.data?.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Server error saving emoji');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (emoji: any) => {
    try {
      const res = await adminService.manageEmoji('toggle_status', {}, emoji.id);
      if (res.data && res.data.statusCode === 1) {
        toast.success(res.data.message || 'Status updated');
        fetchEmojis();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await adminService.manageEmoji('delete', {}, id);
      if (res.data && res.data.statusCode === 1) {
        toast.success('Emoji deleted successfully');
        setShowDeleteConfirm(null);
        fetchEmojis();
      } else {
        toast.error(res.data?.message || 'Failed to delete emoji');
      }
    } catch (err) {
      toast.error('Error deleting emoji');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Emojis safely
  const safeEmojis = Array.isArray(emojis) ? emojis : [];
  const filteredEmojis = safeEmojis.filter(e => {
    if (!e) return false;
    const cat = String(e.category || 'expressive').toLowerCase();
    const name = String(e.name || '').toLowerCase();
    const code = String(e.code || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesCategory = activeCategory === 'All' || cat === activeCategory.toLowerCase();
    const matchesSearch = name.includes(query) || code.includes(query);
    return matchesCategory && matchesSearch;
  });

  const totalActive = safeEmojis.filter(e => e && (e.status === 'active' || e.isActive)).length;
  const totalInactive = safeEmojis.length - totalActive;

  return (
    <div className="users-container page-fade-in" style={{ padding: '24px' }}>
      
      {/* ── Keyframe Animations CSS ── */}
      <style>{`
        @keyframes emojiBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.15); }
        }
        @keyframes emojiPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.8)); }
        }
        @keyframes emojiFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes emojiBurst {
          0% { transform: scale(0.2) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .emoji-card-preview {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .emoji-card-preview:hover {
          transform: scale(1.04);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        }
        .emoji-img-animated {
          animation: emojiFloat 3s infinite ease-in-out;
        }
        .emoji-card-preview:hover .emoji-img-animated {
          animation: emojiBounce 0.8s infinite ease-in-out;
        }
        .preview-bounce { animation: emojiBounce 1s infinite ease-in-out; }
        .preview-pulse { animation: emojiPulse 1.5s infinite ease-in-out; }
        .preview-float { animation: emojiFloat 2.5s infinite ease-in-out; }
        .preview-burst { animation: emojiBurst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Smile className="icon-amber" size={28} /> Emoji Catalog & Mobile API
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Manage static and animated emojis for mobile chat, 1:1 calls, audio rooms, and live streaming.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleSeedEmojis}
            disabled={seeding}
            className="action-btn"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: seeding ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Sparkles size={16} />
            {seeding ? 'Updating...' : 'Seed Test Emojis'}
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="action-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Plus size={18} />
            Add New Emoji
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Total Emojis</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>{safeEmojis.length}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Active Emojis</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#34d399' }}>{totalActive}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Inactive Emojis</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f87171' }}>{totalInactive}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Categories</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa' }}>
            {new Set(safeEmojis.map(e => e?.category || 'expressive')).size || 0}
          </div>
        </div>
      </div>

      {/* ── Controls Bar: Category Tabs, Search & View Toggle ── */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                background: activeCategory === cat ? '#3b82f6' : '#0f172a',
                color: activeCategory === cat ? '#ffffff' : '#94a3b8'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Layout Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search emojis..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#f8fafc',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '2px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#334155' : 'transparent',
                color: viewMode === 'grid' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>

            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#334155' : 'transparent',
                color: viewMode === 'table' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <RefreshCw className="spin" size={32} style={{ margin: '0 auto 12px' }} />
          <p>Loading emoji catalog...</p>
        </div>
      ) : filteredEmojis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1e293b', borderRadius: '12px', border: '1px border-dashed #334155' }}>
          <Smile size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
          <h3 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>No Emojis Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
            {searchQuery ? `No matches found for "${searchQuery}"` : 'Your emoji catalog is currently empty.'}
          </p>
          <button
            onClick={handleSeedEmojis}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {seeding ? 'Seeding...' : 'Seed Default Emojis'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ── GRID VIEW ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredEmojis.map(emoji => (
            <div
              key={emoji.id}
              className="emoji-card-preview"
              style={{
                background: '#1e293b',
                border: emoji.status === 'active' ? '1px solid #334155' : '1px solid #475569',
                opacity: emoji.status === 'active' ? 1 : 0.7,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Category tag & Status Badge */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#0f172a', color: '#38bdf8', textTransform: 'capitalize' }}>
                  {emoji.category}
                </span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: emoji.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: emoji.status === 'active' ? '#34d399' : '#f87171'
                }}>
                  {emoji.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Emoji Preview Container with Click-to-Animate */}
              <div
                onClick={() => setPreviewEmoji(emoji)}
                style={{
                  width: '100px',
                  height: '100px',
                  background: '#0f172a',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  marginBottom: '14px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title="Click to preview full animation"
              >
                <MediaImage
                  src={emoji.image}
                  alt={emoji.name}
                  fallbackText="😊"
                  className="emoji-img-animated"
                  style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                />

                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '50%',
                  padding: '4px',
                  color: '#38bdf8'
                }}>
                  <Play size={12} />
                </div>
              </div>

              {/* Info */}
              <div style={{ textAlign: 'center', width: '100%', marginBottom: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '2px' }}>
                  {emoji.name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {emoji.code || ':emoji:'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px', width: '100%', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                <button
                  onClick={() => setPreviewEmoji(emoji)}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Test Live Animation"
                >
                  <Play size={12} /> Play
                </button>

                <button
                  onClick={() => handleToggleStatus(emoji)}
                  style={{
                    background: '#334155',
                    color: emoji.status === 'active' ? '#94a3b8' : '#34d399',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Toggle Status"
                >
                  {emoji.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <button
                  onClick={() => handleOpenEditModal(emoji)}
                  style={{
                    background: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Edit Emoji"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(emoji.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Delete Emoji"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>

      ) : (

        /* ── TABLE VIEW ── */
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px' }}>Preview</th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Shortcode</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Sort Order</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmojis.map(emoji => (
                <tr key={emoji.id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc', fontSize: '14px' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      onClick={() => setPreviewEmoji(emoji)}
                      style={{ width: '44px', height: '44px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', cursor: 'pointer' }}
                    >
                      <MediaImage src={emoji.image} alt={emoji.name} fallbackText="😊" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600' }}>{emoji.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#94a3b8' }}>{emoji.code}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                    <span style={{ background: '#0f172a', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                      {emoji.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{emoji.sortOrder}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: emoji.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: emoji.status === 'active' ? '#34d399' : '#f87171'
                    }}>
                      {emoji.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setPreviewEmoji(emoji)}
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Test Animation"
                      >
                        <Play size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emoji)}
                        style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        {emoji.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(emoji)}
                        style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(emoji.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
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

      {/* ── INTERACTIVE EMOJI ANIMATION PREVIEW MODAL ── */}
      {previewEmoji && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setPreviewEmoji(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#0f172a',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Live Animation Preview
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: '4px 0 0' }}>
                {previewEmoji.name} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>({previewEmoji.code})</span>
              </h2>
            </div>

            {/* Main Animated Stage */}
            <div style={{
              padding: '30px',
              background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 70%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '260px'
            }}>
              
              {/* Floating particles decoration */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
                <Sparkles size={24} style={{ position: 'absolute', top: '20px', left: '30px', color: '#fbbf24' }} />
                <Sparkles size={20} style={{ position: 'absolute', bottom: '30px', right: '40px', color: '#38bdf8' }} />
              </div>

              {/* Animated Emoji Image */}
              <div key={animationMode} className={`preview-${animationMode}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MediaImage
                  src={previewEmoji.image}
                  alt={previewEmoji.name}
                  fallbackText="😊"
                  style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
                />
              </div>

              <div style={{ marginTop: '20px', fontSize: '13px', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 14px', borderRadius: '12px' }}>
                Mode: <strong style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{animationMode} Effect</strong>
              </div>

            </div>

            {/* Mobile Context Preview Tabs */}
            <div style={{ padding: '20px 24px', background: '#1e293b' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px' }}>
                Select Animation Style:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { id: 'bounce', label: 'Bounce' },
                  { id: 'pulse', label: 'Pulse Glow' },
                  { id: 'float', label: 'Floating' },
                  { id: 'burst', label: 'Pop Burst' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setAnimationMode(mode.id as any)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: animationMode === mode.id ? '#3b82f6' : '#334155',
                      background: animationMode === mode.id ? '#2563eb' : '#0f172a',
                      color: animationMode === mode.id ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Chat Bubble Context Preview */}
              <div style={{ background: '#0f172a', borderRadius: '12px', padding: '14px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={12} className="text-emerald-400" /> Mobile Chat Bubble Preview:
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                    User
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '80%' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', marginBottom: '4px' }}>Alex</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MediaImage src={previewEmoji.image} alt="preview" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '13px', color: '#f8fafc' }}>{previewEmoji.code}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Ready for mobile Socket.IO emission
              </span>
              <button
                onClick={() => setPreviewEmoji(null)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                {editingEmoji ? 'Edit Emoji' : 'Add New Emoji'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Emoji Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heart Eye"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#f8fafc',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Shortcode</label>
                <input
                  type="text"
                  placeholder="e.g. :heart_eyes:"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    <option value="expressive">Expressive</option>
                    <option value="trending">Trending</option>
                    <option value="reaction">Reaction</option>
                    <option value="celebration">Celebration</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Upload Image File */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Upload SVG / PNG Image File</label>
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/gif,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#f8fafc',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Or SVG / Image URL */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Or Image / SVG Data URI / URL</label>
                <textarea
                  rows={3}
                  placeholder="https://... or data:image/..."
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save Emoji'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Emoji"
          message="Are you sure you want to delete this emoji? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onClose={() => setShowDeleteConfirm(null)}
        />
      )}

    </div>
  );
};

export default Emojis;
