import React, { useState, useEffect } from 'react';
import { adminService, BACKEND_URL } from '../services/api';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Trash2, Edit, X, ExternalLink, Filter, Layers } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaImage from '../components/MediaImage';
import '../styles/UserManagement.css';

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
    <div className="user-management-container dark-theme page-padding">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-purple-400" /> Mobile & App Banners
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage promotional banners displayed across Mobile App home screens, agency hubs, and live streaming carousels.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter size={16} /> Filters:
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-semibold">Category/Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Types</option>
            <option value="home">Home Screen (home)</option>
            <option value="agency">Agency Partner (agency)</option>
            <option value="live">Live / PK (live)</option>
            <option value="promo">Promotional (promo)</option>
            <option value="vip">VIP Store (vip)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-semibold">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-800/40 rounded-xl p-12 text-center border border-gray-700">
          <ImageIcon className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-300">No Banners Found</h3>
          <p className="text-gray-500 text-sm mt-1">Click "Add New Banner" to create banner carousels for the mobile app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-gray-800/60 border border-gray-700/60 rounded-xl overflow-hidden shadow-md hover:border-purple-500/50 transition-all flex flex-col"
            >
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                <MediaImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="bg-purple-900/80 text-purple-200 border border-purple-500/30 text-xs font-bold px-2 py-0.5 rounded shadow uppercase">
                    {banner.type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded shadow ${
                      banner.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {banner.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white line-clamp-1">{banner.title}</h3>
                  {banner.targetUrl && (
                    <a
                      href={banner.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline flex items-center gap-1 mt-1 truncate"
                    >
                      <ExternalLink size={12} /> {banner.targetUrl}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Sort Order: {banner.sortOrder || 0}</p>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-700/40">
                  <button
                    onClick={() => handleOpenEditModal(banner)}
                    className="p-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                    title="Edit Banner"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(banner.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Qobo Live Agency Partner"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Upload Image File (PNG / JPG / WebP)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Or Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Target Link / Action URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://qobo1live.com/agency"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Banner Category / Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="home">Home Screen (home)</option>
                    <option value="agency">Agency Partner (agency)</option>
                    <option value="live">Live Stream (live)</option>
                    <option value="promo">Promotion (promo)</option>
                    <option value="vip">VIP Store (vip)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
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
