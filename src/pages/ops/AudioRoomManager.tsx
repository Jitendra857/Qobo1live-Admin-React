import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  Mic, MicOff, Users, Settings, Activity, Lock, Unlock, 
  Hand, AlertTriangle, Crown, Eye, EyeOff, Shield, 
  MoreVertical, Play, Pause, Trash2, Plus, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/UserManagement.css';

interface MicState {
  userId: string;
  isMuted: boolean;
  isDeafened: boolean;
}

interface RoomSeat {
  position: number;
  userId: string | null;
  userName: string | null;
  isLocked: boolean;
  isMuted: boolean;
  isSpeaker: boolean;
  hasRaiseHand: boolean;
}

const AudioRoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'create' | 'history'>('live');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRooms();
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = (room: any) => {
    setSelectedRoom({
      ...room,
      seats: Array.from({ length: room.maxSeats || 8 }, (_, i) => ({
        position: i,
        userId: room.micStatus?.[i]?.userId || null,
        userName: room.micStatus?.[i]?.userName || null,
        isLocked: false,
        isMuted: room.micStatus?.[i]?.isMuted || false,
        isSpeaker: true,
        hasRaiseHand: room.sosEnabled || false
      }))
    });
    setActiveTab('live');
  };

  const handleToggleMic = (seatIndex: number) => {
    if (!selectedRoom) return;
    const updatedSeats = [...selectedRoom.seats];
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      isMuted: !updatedSeats[seatIndex].isMuted
    };
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
  };

  const handleToggleLock = (seatIndex: number) => {
    if (!selectedRoom) return;
    const updatedSeats = [...selectedRoom.seats];
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      isLocked: !updatedSeats[seatIndex].isLocked
    };
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
  };

  const handleKickUser = (seatIndex: number) => {
    if (!selectedRoom) return;
    const updatedSeats = [...selectedRoom.seats];
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      userId: null,
      userName: null,
      isMuted: false,
      hasRaiseHand: false
    };
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
    toast.success('User removed from room');
  };

  const handleMuteAll = () => {
    if (!selectedRoom) return;
    const updatedSeats = selectedRoom.seats.map((seat: any) => ({
      ...seat,
      isMuted: true
    }));
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
    toast.success('All speakers muted');
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Audio Room Matrix</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            8/16 Seat Rooms • Host Controls • Mic Management • Private/Public
          </p>
        </div>
        <button className="primary flex items-center gap-2" onClick={() => setActiveTab('create')}>
          <Plus size={20} /> Create Room
        </button>
      </div>

      {/* Live Rooms Grid */}
      {activeTab === 'live' && (
        <div className="bento-grid mt-6">
          {/* Stats Card */}
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div className="card-top">
              <div className="card-label">LIVE SESSIONS</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}>
                <Activity size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div className="card-value">{rooms.length}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active voice rooms</p>
            </div>
          </div>

          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div className="card-top">
              <div className="card-label">TOTAL PARTICIPANTS</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
                <Users size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div className="card-value">
                {rooms.reduce((acc, r) => acc + (r.participants?.length || 0), 0)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Listeners + Speakers</p>
            </div>
          </div>

          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div className="card-top">
              <div className="card-label">SOS ALERTS</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-red)' }}>
                <AlertTriangle size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div className="card-value" style={{ color: rooms.some(r => r.isSosTriggered) ? 'var(--accent-red)' : 'inherit' }}>
                {rooms.filter(r => r.isSosTriggered).length}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Security alerts</p>
            </div>
          </div>

          {/* Room Cards */}
          {rooms.map(room => (
            <div key={room.id} className="bento-card" style={{ gridColumn: 'span 2' }}>
              <div className="card-top">
                <div className="flex items-center gap-3">
                  <div className={`status-pill ${room.isPrivate ? 'inactive' : 'active'}`} style={{
                    background: room.isPrivate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: room.isPrivate ? '#ef4444' : '#22c55e',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {room.isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
                    {room.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                  </div>
                  {room.isPasswordProtected && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <Shield size={12} /> Password Protected
                    </span>
                  )}
                </div>
                <div className="card-icon-wrap" style={{ color: room.isSosTriggered ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                  {room.isSosTriggered ? <AlertTriangle size={24} /> : <Mic size={24} />}
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {room.title || 'Untitled Room'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Host: {room.creator?.name || 'Unknown'}
                </div>
                
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={14} style={{ color: 'var(--accent-blue)' }} />
                    <span>{room.participants?.length || 0} Participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Crown size={14} style={{ color: 'var(--accent-orange)' }} />
                    <span>{room.maxSeats || 8} Seats</span>
                  </div>
                </div>

                {room.isSosTriggered && (
                  <div className="warning-note mb-4" style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={16} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>SOS Alert Triggered - Immediate Attention Required</span>
                  </div>
                )}

                <button 
                  className="primary w-full flex-center gap-2"
                  onClick={() => handleModerate(room)}
                >
                  <Settings size={16} />
                  Moderate Room
                </button>
              </div>
            </div>
          ))}

          {rooms.length === 0 && !loading && (
            <div className="bento-card wide" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <Mic size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h3 style={{ fontWeight: 900, marginBottom: '8px' }}>No Active Audio Sessions</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Create a new room to start broadcasting</p>
            </div>
          )}
        </div>
      )}

      {/* Room Moderation Panel */}
      {activeTab === 'live' && selectedRoom && (
        <div className="bento-card wide mt-8 fade-in">
          <div className="card-top mb-6">
            <div className="flex items-center gap-4">
              <div className="card-icon-wrap" style={{ color: 'var(--accent-purple)' }}>
                <Settings size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1.3rem' }}>{selectedRoom.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Room ID: {selectedRoom.id.slice(0, 8)}... • Host: {selectedRoom.creator?.name}
                </p>
              </div>
            </div>
            <button 
              className="icon-btn"
              onClick={() => setSelectedRoom(null)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mb-8">
            <button 
              className="secondary-btn flex items-center gap-2"
              onClick={handleMuteAll}
            >
              <MicOff size={16} /> Mute All
            </button>
            <button className="secondary-btn flex items-center gap-2">
              <Lock size={16} /> Lock Room
            </button>
            <button className="secondary-btn flex items-center gap-2" style={{ color: 'var(--accent-red)' }}>
              <Trash2 size={16} /> End Session
            </button>
          </div>

          {/* Seats Grid */}
          <div className="mb-6">
            <h4 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Speaker Seats ({selectedRoom.seats?.length || 0}/{selectedRoom.maxSeats || 8})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {selectedRoom.seats?.map((seat: RoomSeat, index: number) => (
                <div 
                  key={index}
                  className={`seat-card ${seat.isMuted ? 'muted' : ''} ${seat.isLocked ? 'locked' : ''} ${seat.hasRaiseHand ? 'alert' : ''}`}
                  style={{
                    background: seat.userId 
                      ? (seat.isMuted ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)')
                      : 'rgba(0,0,0,0.02)',
                    border: `2px solid ${seat.hasRaiseHand ? '#ef4444' : seat.userId ? (seat.isMuted ? '#ef4444' : '#22c55e') : '#e2e8f0'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {seat.isLocked && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <Lock size={12} color="#94a3b8" />
                    </div>
                  )}
                  
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: seat.userId ? 'var(--accent-blue)' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: seat.userId ? '#fff' : '#94a3b8',
                    fontWeight: 900
                  }}>
                    {seat.userId ? (seat.userName?.[0] || 'U') : index + 1}
                  </div>

                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {seat.userName || 'Empty Seat'}
                  </span>

                  {seat.hasRaiseHand && (
                    <div style={{ 
                      background: '#ef4444', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Hand size={10} /> RAISE HAND
                    </div>
                  )}

                  {seat.userId && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        className="icon-btn"
                        onClick={() => handleToggleMic(index)}
                        style={{ 
                          background: seat.isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          color: seat.isMuted ? '#ef4444' : '#22c55e',
                          padding: '8px'
                        }}
                        title={seat.isMuted ? 'Unmute' : 'Mute'}
                      >
                        {seat.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                      <button 
                        className="icon-btn"
                        onClick={() => handleToggleLock(index)}
                        style={{ 
                          background: seat.isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.05)',
                          color: seat.isLocked ? '#ef4444' : '#94a3b8',
                          padding: '8px'
                        }}
                        title={seat.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {seat.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      <button 
                        className="icon-btn"
                        onClick={() => handleKickUser(index)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          padding: '8px'
                        }}
                        title="Kick User"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Host & Co-host Management */}
          <div className="mb-6">
            <h4 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Host & Co-Host
            </h4>
            <div className="flex gap-4">
              <div className="bento-card" style={{ flex: 1, background: 'rgba(251, 191, 36, 0.1)', borderColor: '#fbbf24' }}>
                <div className="flex items-center gap-3">
                  <Crown size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{selectedRoom.creator?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room Host</div>
                  </div>
                </div>
              </div>
              <div className="bento-card" style={{ flex: 1, background: 'rgba(139, 92, 246, 0.1)', borderColor: '#8b5cf6' }}>
                <div className="flex items-center gap-3">
                  <Shield size={20} style={{ color: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>No Co-Host</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign from speakers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Room Settings */}
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Room Configuration
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Room Type</label>
                <div className="radio-group" style={{ marginTop: '8px' }}>
                  <label className="radio-option">
                    <input type="radio" name="roomType" checked={!selectedRoom.isPrivate} readOnly />
                    <span>Public (1)</span>
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="roomType" checked={selectedRoom.isPrivate} readOnly />
                    <span>Private (0)</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Password</label>
                <input 
                  type="text" 
                  className="admin-input mt-2" 
                  placeholder={selectedRoom.isPasswordProtected ? '********' : 'No password'}
                  disabled 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Max Seats</label>
                <input 
                  type="text" 
                  className="admin-input mt-2" 
                  value={selectedRoom.maxSeats || 8} 
                  disabled 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Tab */}
      {activeTab === 'create' && (
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginTop: '30px' }} className="fade-in">
          <div className="card-top" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('live')}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                title="Go Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>Launch Audio Matrix</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Configure new broadcasting environment</p>
              </div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
              <Play size={24} />
            </div>
          </div>

          <form style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room Title</label>
              <input 
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="Enter room title..." 
                required 
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Capacity</label>
              <select 
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              >
                <option value={8}>8 Seats (Standard Configuration)</option>
                <option value={16}>16 Seats (Extended Matrix)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Environment Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="createRoomType" value="public" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Public</span>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="createRoomType" value="private" style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Private</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Key (Optional)</label>
              <input 
                type="password" 
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="Leave blank for open access"
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                type="button" 
                onClick={() => setActiveTab('live')}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                style={{ 
                  padding: '12px 32px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px -3px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => {
                  toast.success('Audio matrix launched successfully!');
                  setActiveTab('live');
                }}
              >
                <Activity size={18} /> Launch Matrix
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AudioRoomManager;
