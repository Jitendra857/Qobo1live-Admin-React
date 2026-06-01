import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Monitor, Plus, Image as ImageIcon, Trash2, X, Sparkles } from 'lucide-react';
import '../../styles/UserManagement.css';

const UNSPASH_PRESETS = [
  { title: 'Neon Cyberpunk', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop' },
  { title: 'Cosmic Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { title: 'Cozy Lounge', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop' },
  { title: 'Deep Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop' }
];

const AmbienceManager: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBackgrounds = async () => {
    try {
      setLoading(false);
      const res = await adminService.getBackgrounds();
      setBackgrounds(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room backgrounds');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setTitle('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Please enter a valid title and image URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.manageAmbience('add', { title, imageUrl });
      toast.success('Room background uploaded successfully');
      setIsModalOpen(false);
      fetchBackgrounds();
    } catch (err) {
      toast.error('Failed to save background');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWallpaper = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this room wallpaper?')) return;
    try {
      await adminService.manageAmbience('delete', {}, id);
      toast.success('Room wallpaper removed');
      fetchBackgrounds();
    } catch (err) {
      toast.error('Failed to remove wallpaper');
    }
  };

  const handleSelectPreset = (preset: { title: string, url: string }) => {
    setTitle(preset.title);
    setImageUrl(preset.url);
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Room Ambience</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Curate premium backgrounds for live voice rooms</p>
        </div>
        <button className="primary flex-center gap-2" onClick={handleOpenModal}>
          <Plus size={18} />
          <span>Add Wallpaper</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
          Syncing wallpaper database...
        </div>
      ) : (
        <div className="bento-grid mt-10">
          {backgrounds.map((bg: any) => (
            <div key={bg.id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '20px' }}>
              <div>
                <div className="card-top">
                  <div className="card-label">ROOM THEME</div>
                  <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
                    <Monitor size={20} />
                  </div>
                </div>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', height: '140px', marginBottom: '15px' }}>
                  <img src={bg.imageUrl} alt={bg.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-scale" />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{bg.title}</div>
              </div>
              
              <button className="icon-btn mt-20" style={{ width: '100%', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleDeleteWallpaper(bg.id)}>
                <Trash2 size={15} />
                <span style={{ fontWeight: 700 }}>Remove Wallpaper</span>
              </button>
            </div>
          ))}

          {backgrounds.length === 0 && (
            <div className="bento-card wide" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gridColumn: '1 / -1' }}>
              <div style={{ textAlign: 'center', opacity: 0.6, maxWidth: '400px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <ImageIcon size={40} style={{ color: 'var(--accent-purple)' }} />
                </div>
                <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>No Active Backgrounds</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Add a dynamic wallpaper using preset aesthetic assets or a custom hosting link.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Wallpaper Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', padding: '30px', maxWidth: '550px', width: '90%' }}>
            <div className="flex justify-between items-center mb-20">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} className="text-purple-400" />
                <span>Add Room Wallpaper</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddWallpaper}>
              <div className="form-group mb-20">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Wallpaper Title
                </label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Dreamy Cyberpunk"
                  required
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group mb-20">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Image URL
                </label>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Preset suggestions */}
              <div className="mb-20">
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                  Preset Suggestions
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {UNSPASH_PRESETS.map((preset, idx) => (
                    <div key={idx} onClick={() => handleSelectPreset(preset)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-highlight">
                      <img src={preset.url} alt="preset" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-30" style={{ display: 'flex', gap: '15px' }}>
                <button type="button" className="secondary w-full" onClick={() => setIsModalOpen(false)} style={{ padding: '14px' }}>
                  Cancel
                </button>
                <button type="submit" className="primary w-full" disabled={isSubmitting} style={{ padding: '14px' }}>
                  {isSubmitting ? 'Saving Wallpaper...' : 'Publish Wallpaper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbienceManager;
