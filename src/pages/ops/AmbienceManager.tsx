import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Monitor, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import '../../styles/UserManagement.css';

const AmbienceManager: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBackgrounds = async () => {
    try {
      const res = await adminService.getBackgrounds();
      setBackgrounds(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, id?: string) => {
    try {
      await adminService.manageAmbience(action, { title: 'New BG', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475' }, id);
      fetchBackgrounds();
    } catch (err) {
      toast.error('Action failed');
    }
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
        <button className="primary flex-center gap-2" onClick={() => handleAction('add')}>
          <Plus size={18} />
          <span>Add Wallpaper</span>
        </button>
      </div>

      <div className="bento-grid mt-10">
        {backgrounds.map((bg: any) => (
          <div key={bg.id} className="bento-card">
            <div className="card-top">
              <div className="card-label">PREMIUM ASSET</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
                <Monitor size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <img src={bg.imageUrl} alt="bg" style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '15px' }} />
              <div style={{ fontWeight: 800 }}>{bg.title}</div>
              <button className="icon-btn mt-10" style={{ width: '100%', color: '#ef4444' }} onClick={() => handleAction('delete', bg.id)}>
                <Trash2 size={16} />
                <span style={{ marginLeft: '8px' }}>Remove</span>
              </button>
            </div>
          </div>
        ))}

        {backgrounds.length === 0 && (
          <div className="bento-card wide" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <ImageIcon size={48} style={{ marginBottom: '15px' }} />
              <p>No custom backgrounds found.<br/>Upload assets to personalize your rooms.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbienceManager;
