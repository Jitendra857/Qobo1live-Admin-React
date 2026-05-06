import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Image as ImageIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import '../styles/UserManagement.css';
import MediaImage from '../components/MediaImage';

const OperationalSettings: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await adminService.manageAd('delete', {}, id);
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Operational Media</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage banner rotation and promotional assets</p>
        </div>
        <button className="primary flex-center gap-2">
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
  );
};

export default OperationalSettings;
