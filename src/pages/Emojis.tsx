import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Smile, Plus, Trash2, Edit, X, Check, Save, Image as ImageIcon,
  Sparkles, RefreshCw, LayoutGrid, List, Search, Tag, Eye, EyeOff
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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

  const fetchEmojis = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEmojis();
      if (response.data && response.data.statusCode === 1) {
        setEmojis(response.data.data || []);
      } else {
        toast.error('Failed to load emoji catalog');
      }
    } catch (err) {
      console.error('Failed to fetch emojis:', err);
      toast.error('Error connecting to backend server');
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
      }
    } catch (err) {
      console.error('Seed error:', err);
      toast.error('Error seeding test emojis');
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

  // Filter Emojis
  const filteredEmojis = emojis.filter(e => {
    const matchesCategory = activeCategory === 'All' || e.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.code && e.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalActive = emojis.filter(e => e.status === 'active').length;
  const totalInactive = emojis.length - totalActive;

  return (
    <div className="users-container page-fade-in" style={{ padding: '24px' }}>
      
      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Smile className="icon-amber" size={28} /> Emoji Catalog & Mobile API
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Manage static and SVG gifts/emojis sent by users across chat, rooms, and live streams.
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
            {seeding ? 'Seeding SVGs...' : 'Seed 6 Test Emojis'}
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
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>{emojis.length}</div>
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
            {new Set(emojis.map(e => e.category)).size || 0}
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
            Seed 6 Test SVG Emojis
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ── GRID VIEW ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredEmojis.map(emoji => (
            <div
              key={emoji.id}
              style={{
                background: '#1e293b',
                border: emoji.status === 'active' ? '1px solid #334155' : '1px solid #475569',
                opacity: emoji.status === 'active' ? 1 : 0.7,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                transition: 'all 0.2s ease-in-out'
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

              {/* Emoji Preview Box */}
              <div style={{
                width: '100px',
                height: '100px',
                background: '#0f172a',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                marginBottom: '14px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <img
                  src={emoji.image}
                  alt={emoji.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
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
              <div style={{ display: 'flex', gap: '8px', width: '100%', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                <button
                  onClick={() => handleToggleStatus(emoji)}
                  style={{
                    flex: 1,
                    background: emoji.status === 'active' ? '#334155' : '#1e3a8a',
                    color: emoji.status === 'active' ? '#94a3b8' : '#60a5fa',
                    border: 'none',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  title="Toggle Status"
                >
                  {emoji.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                  {emoji.status === 'active' ? 'Hide' : 'Show'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(emoji)}
                  style={{
                    background: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    padding: '6px 10px',
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
                    padding: '6px 10px',
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
                    <div style={{ width: '40px', height: '40px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      <img src={emoji.image} alt={emoji.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                        onClick={() => handleToggleStatus(emoji)}
                        style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Toggle Status"
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
                  placeholder="data:image/svg+xml;utf8,<svg>...</svg> or https://..."
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
