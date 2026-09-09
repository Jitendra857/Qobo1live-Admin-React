import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Trash2, Edit, X, ExternalLink, Filter, Layers, ZoomIn, Eye } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';
import '../styles/Banners.css';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  type: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Zoom / Lightbox State
  const [zoomedBanner, setZoomedBanner] = useState<Banner | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    type: 'home',
    status: 'active',
    sortOrder: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBanners(filterType, filterStatus);
      if (res.data && (res.data.statusCode === 1 || res.data.success)) {
        setBanners(res.data.data || []);
      } else {
        toast.error(res.data?.message || 'Failed to fetch banners');
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      toast.error('Error connecting to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [filterType, filterStatus]);

  // Handle ESC key to close zoom modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedBanner(null);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      imageUrl: '',
      targetUrl: '',
      type: 'home',
      status: 'active',
      sortOrder: 0,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl || '',
      type: banner.type || 'home',
      status: banner.status || 'active',
      sortOrder: banner.sortOrder || 0,
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
    if (!formData.title.trim()) {
      toast.error('Banner title is required');
      return;
    }

    if (!editingBanner && !selectedFile && !formData.imageUrl) {
      toast.error('Please upload an image file or provide an image URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('title', formData.title);
      form.append('targetUrl', formData.targetUrl);
      form.append('type', formData.type);
      form.append('status', formData.status);
      form.append('sortOrder', String(formData.sortOrder));

      if (formData.imageUrl) {
        form.append('imageUrl', formData.imageUrl);
      }
      if (selectedFile) {
        form.append('file', selectedFile);
      }

      let res;
      if (editingBanner) {
        res = await adminService.manageBanner('update', form, editingBanner.id);
      } else {
        res = await adminService.manageBanner('create', form);
      }

      if (res.data && (res.data.statusCode === 1 || res.data.success)) {
        toast.success(editingBanner ? 'Banner updated successfully!' : 'Banner added successfully!');
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error(res.data?.message || 'Operation failed');
      }
    } catch (err: any) {
      console.error('Error submitting banner form:', err);
      toast.error(err.response?.data?.message || 'Network error during save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await adminService.deleteBanner(id);
      if (res.data && (res.data.statusCode === 1 || res.data.success)) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(res.data?.message || 'Failed to delete banner');
      }
    } catch (err: any) {
      console.error('Error deleting banner:', err);
      toast.error(err.response?.data?.message || 'Network error deleting banner');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="banners-container">
      {/* Header */}
      <div className="banners-header">
        <div className="banners-title-wrap">
          <h1>
            <Layers style={{ color: '#8b5cf6' }} /> Mobile & App Banners
          </h1>
          <p>Manage promotional banners displayed across Mobile App home screens, agency hubs, and live streaming carousels.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary-banner">
          <Plus size={18} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="banners-filter-bar">
        <div className="filter-group">
          <Filter size={16} style={{ color: '#94a3b8' }} />
          <label>Category / Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="home">Home Screen (home)</option>
            <option value="agency">Agency Partner (agency)</option>
            <option value="live">Live / PK (live)</option>
            <option value="promo">Promotional (promo)</option>
            <option value="vip">VIP Store (vip)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%' }} />
        </div>
      ) : banners.length === 0 ? (
        <div className="banners-empty-state">
          <ImageIcon size={48} style={{ opacity: 0.3, margin: '0 auto' }} />
          <h3>No Banners Found</h3>
          <p>Click "Add New Banner" to publish promotional banners to the mobile app.</p>
        </div>
      ) : (
        <div className="banners-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="banner-card">
              {/* Image Container with Zoom Click Listener */}
              <div
                className="banner-img-container"
                onClick={() => setZoomedBanner(banner)}
                title="Click to view full size zoom"
              >
                <MediaImage src={banner.imageUrl} alt={banner.title} />

                {/* Hover Zoom Overlay */}
                <div className="banner-zoom-overlay">
                  <div className="zoom-badge">
                    <ZoomIn size={16} />
                    <span>Click to Zoom</span>
                  </div>
                </div>

                <span className="banner-badge-type">{banner.type}</span>
                <span className={`banner-badge-status ${banner.status === 'active' ? 'active' : 'inactive'}`}>
                  {banner.status}
                </span>
              </div>

              {/* Card Content Body */}
              <div className="banner-card-body">
                <div>
                  <h3 className="banner-card-title">{banner.title}</h3>
                  {banner.targetUrl ? (
                    <a
                      href={banner.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="banner-card-link"
                    >
                      <ExternalLink size={13} /> {banner.targetUrl}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                      No Action Link Attached
                    </span>
                  )}
                </div>

                <div className="banner-card-meta">
                  <span>Sort Order: {banner.sortOrder || 0}</span>
                  <div className="banner-card-actions">
                    <button
                      onClick={() => setZoomedBanner(banner)}
                      className="action-btn zoom"
                      title="Zoom Preview Image"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="action-btn edit"
                      title="Edit Banner"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(banner.id)}
                      className="action-btn delete"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔍 ZOOM LIGHTBOX MODAL */}
      {zoomedBanner && (
        <div className="lightbox-backdrop" onClick={() => setZoomedBanner(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close-btn"
              onClick={() => setZoomedBanner(null)}
              title="Close (ESC)"
            >
              <X size={22} />
            </button>

            <div className="lightbox-image-wrap">
              <MediaImage src={zoomedBanner.imageUrl} alt={zoomedBanner.title} />
            </div>

            <div className="lightbox-footer">
              <div>
                <div className="lightbox-title">{zoomedBanner.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Category: <strong style={{ color: '#c084fc' }}>{zoomedBanner.type.toUpperCase()}</strong></span>
                  <span>Status: <strong style={{ color: zoomedBanner.status === 'active' ? '#10b981' : '#f43f5e' }}>{zoomedBanner.status.toUpperCase()}</strong></span>
                  <span>Sort Order: <strong>{zoomedBanner.sortOrder || 0}</strong></span>
                </div>
              </div>

              <div className="lightbox-actions">
                {zoomedBanner.targetUrl && (
                  <a
                    href={zoomedBanner.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-banner"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <ExternalLink size={15} /> Visit Target Link
                  </a>
                )}
                <button
                  onClick={() => {
                    const b = zoomedBanner;
                    setZoomedBanner(null);
                    handleOpenEditModal(b);
                  }}
                  className="btn-secondary-custom"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box-custom" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group-custom">
                <label>Banner Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Qobo Live Agency Partner"
                  className="form-input-custom"
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Upload Image File (PNG / JPG / WebP)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input-custom"
                  style={{ padding: '8px' }}
                />
              </div>

              <div className="form-group-custom">
                <label>Or Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label>Target Link / Action URL (Optional)</label>
                <input
                  type="text"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://qobo1live.com/agency"
                  className="form-input-custom"
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group-custom">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input-custom"
                  >
                    <option value="home">Home (home)</option>
                    <option value="agency">Agency (agency)</option>
                    <option value="live">Live (live)</option>
                    <option value="promo">Promo (promo)</option>
                    <option value="vip">VIP (vip)</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input-custom"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="form-input-custom"
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary-custom"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-banner"
                >
                  {isSubmitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Banner"
          message="Are you sure you want to delete this banner? It will no longer appear in the mobile application."
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onClose={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default Banners;
