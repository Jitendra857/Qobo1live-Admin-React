import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Image as ImageIcon, Plus, Trash2, ExternalLink, X } from 'lucide-react';
import '../styles/UserManagement.css';
import MediaImage from '../components/MediaImage';
import toast from 'react-hot-toast';

const OperationalSettings: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [type, setType] = useState('promo');

  const fetchAds = async () => {
    try {
      const res = await adminService.getAds();
      setAds(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (id: string) => {
    const toastId = toast.loading('Deleting promotional banner...');
    try {
      await adminService.manageAd('delete', {}, id);
      toast.success('Promotional banner deleted successfully!', { id: toastId });
      fetchAds();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast.error('Title and Image URL are required');
      return;
    }
    const toastId = toast.loading('Publishing promotional banner...');
    try {
      await adminService.manageAd('create', {
        title,
        imageUrl,
        targetUrl,
        type,
        status: 'active'
      });
      toast.success('Promotional Banner published successfully!', { id: toastId });
      fetchAds();
      setIsModalOpen(false);
      setTitle('');
      setImageUrl('');
      setTargetUrl('');
      setType('promo');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish banner', { id: toastId });
    }
  };

  return (
    <>
      <div className="user-management fade-in">
        <div className="header-actions">
          <div>
            <h2 className="page-title">Operational Media</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage banner rotation and promotional assets</p>
          </div>
          <button className="primary flex-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Upload Media</span>
          </button>
        </div>

        <div className="bento-grid mt-10">
          {ads.map((ad) => (
            <div key={ad.id} className="bento-card wide" style={{ padding: '0', overflow: 'hidden', height: '250px' }}>
              <MediaImage 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover opacity-80"
                fallbackIcon={<ImageIcon size={48} style={{ opacity: 0.2 }} />}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
                <div className="card-label" style={{ color: '#fff', opacity: 0.8 }}>{ad.type}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{ad.title}</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                   <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="icon-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
                      <ExternalLink size={16} />
                   </a>
                   <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(ad.id)}>
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <div className="bento-card wide" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ textAlign: 'center' }}>
                <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <p>No promotional media found in the ecosystem.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass fade-in" style={{ padding: '28px', borderRadius: '20px', width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', background: '#0f172a' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>Upload Operational Media</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Banner Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Grand PK Duel Champion" 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Image URL</label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://images.unsplash.com/..." 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Target URL (Optional)</label>
                <input 
                  type="text" 
                  value={targetUrl} 
                  onChange={(e) => setTargetUrl(e.target.value)} 
                  placeholder="https://qobo1live.com/events/..." 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Banner Category/Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="promo" style={{ background: '#0f172a' }}>Promotion (promo)</option>
                  <option value="vip" style={{ background: '#0f172a' }}>VIP Event (vip)</option>
                  <option value="local" style={{ background: '#0f172a' }}>Regional Gala (local)</option>
                  <option value="normal" style={{ background: '#0f172a' }}>Default Ads (normal)</option>
                  <option value="system" style={{ background: '#0f172a' }}>System Announcements (system)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OperationalSettings;
