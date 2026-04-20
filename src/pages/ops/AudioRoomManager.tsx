import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Mic, Users, Settings, Activity } from 'lucide-react';
import '../../styles/UserManagement.css';

const AudioRoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getRooms().then(res => {
      setRooms(res.data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Audio Room Matrix</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage global voice-room configuration and active streaming sessions</p>
        </div>
      </div>

      <div className="bento-grid mt-10">
        <div className="bento-card wide">
          <div className="card-top">
            <div className="card-label">ACTIVE SESSIONS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
              <Activity size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{rooms.length}</div>
            <p style={{ color: 'var(--text-secondary)' }}>Live voice rooms currently broadcasting</p>
          </div>
        </div>

        {rooms.map(room => (
          <div key={room.id} className="bento-card">
            <div className="card-top">
              <div className="card-label" style={{ color: 'var(--accent-green)' }}>LIVE NOW</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
                <Mic size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div style={{ fontWeight: 800 }}>{room.title || 'Untitled Session'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Host: {room.creator?.name || 'Unknown'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                <Users size={16} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontWeight: 600 }}>{room.listeners || 0} listeners</span>
              </div>
              <button className="primary mt-10" style={{ width: '100%', padding: '10px' }}>
                <Settings size={16} style={{ marginRight: '8px' }} />
                Moderate
              </button>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="bento-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
             <p style={{ opacity: 0.5, textAlign: 'center' }}>No active audio sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRoomManager;
