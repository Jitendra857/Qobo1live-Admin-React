import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  Mic, MicOff, Users, Settings, Activity, Lock, Unlock, 
  Hand, AlertTriangle, Crown, Shield, Plus, X, Gift,
  Clock, Flame, Award, ArrowLeft, Play, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AudioRoomMatrix.css';

interface RoomSeat {
  position: number;
  userId: string | null;
  userName: string | null;
  userAvatar?: string | null;
  isLocked: boolean;
  isMuted: boolean;
  isSpeaker: boolean;
  hasRaiseHand: boolean;
  coinsEarned?: number;
}

const AudioRoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'create'>('live');

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

  const formatUptime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0m uptime';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m uptime`;
    return `${mins}m uptime`;
  };

  const handleModerate = (room: any) => {
    setSelectedRoom({
      ...room,
      seats: Array.from({ length: room.maxSeats || 8 }, (_, i) => ({
        position: i,
        userId: room.micStatus?.[i]?.userId || null,
        userName: room.micStatus?.[i]?.userName || null,
        userAvatar: room.micStatus?.[i]?.userAvatar || null,
        isLocked: false,
        isMuted: room.micStatus?.[i]?.isMuted || false,
        isSpeaker: true,
        hasRaiseHand: room.sosEnabled || false,
        coinsEarned: room.topEarner?.userId === room.micStatus?.[i]?.userId ? room.topEarner?.coins : 0
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
    toast.success(`Seat #${seatIndex + 1} ${updatedSeats[seatIndex].isMuted ? 'muted' : 'unmuted'}`);
  };

  const handleToggleLock = (seatIndex: number) => {
    if (!selectedRoom) return;
    const updatedSeats = [...selectedRoom.seats];
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      isLocked: !updatedSeats[seatIndex].isLocked
    };
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
    toast.success(`Seat #${seatIndex + 1} ${updatedSeats[seatIndex].isLocked ? 'locked' : 'unlocked'}`);
  };

  const handleKickUser = (seatIndex: number) => {
    if (!selectedRoom) return;
    const updatedSeats = [...selectedRoom.seats];
    const kickedUser = updatedSeats[seatIndex].userName;
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      userId: null,
      userName: null,
      userAvatar: null,
      isMuted: false,
      hasRaiseHand: false
    };
    setSelectedRoom({ ...selectedRoom, seats: updatedSeats });
    toast.success(`User ${kickedUser || ''} removed from seat`);
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

  // Aggregated metrics
  const totalJoinedUsers = rooms.reduce((acc, r) => acc + (r.joinedUsersCount || r.participants?.length || 0), 0);
  const totalGiftsCount = rooms.reduce((acc, r) => acc + (r.totalGiftsCount || 0), 0);
  const totalGiftCoins = rooms.reduce((acc, r) => acc + (r.totalGiftCoins || 0), 0);

  const globalTopEarner = rooms.reduce((highest, r) => {
    if (r.topEarner && r.topEarner.coins > (highest?.coins || 0)) {
      return r.topEarner;
    }
    return highest;
  }, null as any);

  return (
    <div className="matrix-container">
      {/* Header */}
      <div className="matrix-header">
        <div className="matrix-title-wrap">
          <h1>
            <Mic style={{ color: '#a855f7' }} size={30} />
            Audio Room Matrix
          </h1>
          <p>Real-time Audio Spaces • Joined Users • Live Gift Economy • Top Earners</p>
        </div>
        <button 
          className="btn-matrix-action" 
          onClick={() => setActiveTab(activeTab === 'create' ? 'live' : 'create')}
        >
          {activeTab === 'create' ? (
            <>
              <ArrowLeft size={18} /> Back to Matrix
            </>
          ) : (
            <>
              <Plus size={18} /> Create New Room
            </>
          )}
        </button>
      </div>

      {/* Main Matrix Tab */}
      {activeTab === 'live' && (
        <>
          {/* Bento Global Summary Cards */}
          <div className="matrix-bento-grid">
            <div className="matrix-bento-card">
              <div className="matrix-bento-top">
                <span className="matrix-bento-label">ACTIVE ROOMS</span>
                <div className="matrix-bento-icon" style={{ color: '#4ade80' }}>
                  <Activity size={22} />
                </div>
              </div>
              <div>
                <div className="matrix-bento-value">{rooms.length}</div>
                <div className="matrix-bento-sub">Broadcasting Live</div>
              </div>
            </div>

            <div className="matrix-bento-card">
              <div className="matrix-bento-top">
                <span className="matrix-bento-label">JOINED USERS</span>
                <div className="matrix-bento-icon" style={{ color: '#60a5fa' }}>
                  <Users size={22} />
                </div>
              </div>
              <div>
                <div className="matrix-bento-value">{totalJoinedUsers}</div>
                <div className="matrix-bento-sub">Active Speakers & Listeners</div>
              </div>
            </div>

            <div className="matrix-bento-card">
              <div className="matrix-bento-top">
                <span className="matrix-bento-label">GIFTS & REVENUE</span>
                <div className="matrix-bento-icon" style={{ color: '#ec4899' }}>
                  <Gift size={22} />
                </div>
              </div>
              <div>
                <div className="matrix-bento-value">{totalGiftsCount} Gifts</div>
                <div className="matrix-bento-sub" style={{ color: '#facc15', fontWeight: 700 }}>
                  🪙 {totalGiftCoins.toLocaleString()} Coins Spent
                </div>
              </div>
            </div>

            <div className="matrix-bento-card">
              <div className="matrix-bento-top">
                <span className="matrix-bento-label">TOP EARNER</span>
                <div className="matrix-bento-icon" style={{ color: '#facc15' }}>
                  <Crown size={22} />
                </div>
              </div>
              <div>
                <div className="matrix-bento-value" style={{ fontSize: '1.25rem', color: '#facc15' }}>
                  {globalTopEarner ? globalTopEarner.name : 'None'}
                </div>
                <div className="matrix-bento-sub">
                  {globalTopEarner ? `🏆 ${globalTopEarner.coins.toLocaleString()} 🪙 Earned` : 'No earnings recorded'}
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="matrix-rooms-grid">
            {rooms.map(room => {
              const joinedCount = room.joinedUsersCount || room.participants?.length || 0;
              const giftsCount = room.totalGiftsCount || 0;
              const giftCoins = room.totalGiftCoins || 0;
              const topEarner = room.topEarner;

              return (
                <div 
                  key={room.id} 
                  className={`matrix-room-card ${room.isSosTriggered ? 'sos-active' : ''}`}
                >
                  <div>
                    {/* Room Header Badges */}
                    <div className="matrix-room-header">
                      <div className="matrix-room-badges">
                        <span className={`badge-pill ${room.isPrivate ? 'badge-private' : 'badge-public'}`}>
                          {room.isPrivate ? <Lock size={11} /> : <Unlock size={11} />}
                          {room.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                        </span>
                        <span className="badge-pill badge-category">
                          <Flame size={11} /> {room.category || 'Chatting'}
                        </span>
                        <span className="badge-pill badge-uptime">
                          <Clock size={11} /> {formatUptime(room.sessionDurationSeconds)}
                        </span>
                      </div>
                      {room.isSosTriggered && (
                        <div style={{ color: '#ef4444' }} title="SOS Triggered">
                          <AlertTriangle size={22} />
                        </div>
                      )}
                    </div>

                    {/* Title & Host */}
                    <h3 className="matrix-room-title">{room.title || 'Untitled Audio Matrix'}</h3>
                    <div className="matrix-room-host">
                      {room.creator?.avatar ? (
                        <img src={room.creator.avatar} alt="Host" className="host-avatar" />
                      ) : (
                        <div className="host-avatar-fallback">
                          {room.creator?.name?.[0]?.toUpperCase() || 'H'}
                        </div>
                      )}
                      <span>Host: <strong>{room.creator?.name || 'Unknown Host'}</strong></span>
                    </div>

                    {/* Enriched Metrics Strip */}
                    <div className="matrix-metrics-strip">
                      <div className="metric-pill-row">
                        <div className="metric-item">
                          <Users size={14} style={{ color: '#60a5fa' }} />
                          <span><strong>{joinedCount}</strong> Joined Participants</span>
                        </div>
                        <div className="metric-item">
                          <Crown size={14} style={{ color: '#c084fc' }} />
                          <span>{room.maxSeats || 8} Seats</span>
                        </div>
                      </div>

                      <div className="metric-pill-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        <div className="metric-item">
                          <Gift size={14} style={{ color: '#ec4899' }} />
                          <span><strong>{giftsCount}</strong> Gifts Sent</span>
                        </div>
                        <div className="metric-item" style={{ color: '#facc15' }}>
                          <span><strong>{giftCoins.toLocaleString()}</strong> 🪙</span>
                        </div>
                      </div>

                      {/* Top Earner Pill */}
                      {topEarner ? (
                        <div className="top-earner-pill">
                          <div className="top-earner-info">
                            <Crown size={15} style={{ color: '#facc15' }} />
                            <div>
                              <div className="top-earner-label">Top Earner</div>
                              <div className="top-earner-name">{topEarner.name}</div>
                            </div>
                          </div>
                          <div className="top-earner-coins">
                            🏆 {topEarner.coins.toLocaleString()} 🪙
                          </div>
                        </div>
                      ) : (
                        <div className="top-earner-pill" style={{ opacity: 0.5, filter: 'grayscale(1)' }}>
                          <div className="top-earner-info">
                            <Crown size={15} color="#94a3b8" />
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No gift earnings yet</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Speaker Seats Mini Indicator */}
                    <div className="seats-mini-preview">
                      {Array.from({ length: room.maxSeats || 8 }).map((_, idx) => {
                        const isOccupied = room.micStatus?.[idx]?.userId != null;
                        const isMuted = room.micStatus?.[idx]?.isMuted;
                        const isTopEarnerSeat = topEarner && room.micStatus?.[idx]?.userId === topEarner.userId;

                        return (
                          <div 
                            key={idx} 
                            className={`seat-dot ${isOccupied ? 'occupied' : ''} ${isMuted ? 'muted' : ''} ${isTopEarnerSeat ? 'top-earner' : ''}`}
                            title={isOccupied ? `Seat ${idx + 1}: ${room.micStatus[idx].userName}` : `Seat ${idx + 1}: Empty`}
                          >
                            {isTopEarnerSeat ? '👑' : isOccupied ? (idx + 1) : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    className="btn-matrix-action w-full flex-center justify-center gap-2 mt-2"
                    onClick={() => handleModerate(room)}
                  >
                    <Settings size={16} /> Moderate Room
                  </button>
                </div>
              );
            })}

            {rooms.length === 0 && !loading && (
              <div className="matrix-room-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                <Mic size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                <h3 style={{ fontWeight: 900, marginBottom: '8px' }}>No Active Audio Rooms</h3>
                <p style={{ color: '#94a3b8' }}>Click "Create New Room" to launch a live audio matrix session</p>
              </div>
            )}
          </div>

          {/* Room Moderation Detail View */}
          {selectedRoom && (
            <div className="matrix-mod-panel fade-in">
              <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-4">
                  <div className="matrix-bento-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedRoom.title}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      ID: {selectedRoom.id} • Host: <strong>{selectedRoom.creator?.name}</strong> • Uptime: {formatUptime(selectedRoom.sessionDurationSeconds)}
                    </p>
                  </div>
                </div>
                <button className="seat-action-btn" onClick={() => setSelectedRoom(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Moderation Controls */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <button className="btn-matrix-action" onClick={handleMuteAll} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}>
                  <MicOff size={16} /> Mute All Speakers
                </button>
                <button className="btn-matrix-action" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <Lock size={16} /> Lock All Seats
                </button>
              </div>

              {/* Speaker Seats Grid */}
              <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '14px' }}>
                Speaker Seats Matrix ({selectedRoom.seats?.filter((s: any) => s.userId).length || 0}/{selectedRoom.maxSeats || 8})
              </h3>

              <div className="mod-seats-grid">
                {selectedRoom.seats?.map((seat: RoomSeat, index: number) => {
                  const isTopEarner = selectedRoom.topEarner && seat.userId === selectedRoom.topEarner.userId;

                  return (
                    <div 
                      key={index} 
                      className={`mod-seat-card ${seat.userId ? 'occupied' : ''} ${seat.isMuted ? 'muted' : ''} ${seat.isLocked ? 'locked' : ''} ${isTopEarner ? 'top-earner-seat' : ''}`}
                    >
                      <div className="seat-avatar-wrap">
                        {isTopEarner && (
                          <div className="seat-earner-crown" title="Top Earner">
                            <Crown size={12} />
                          </div>
                        )}
                        {seat.userId ? (
                          seat.userAvatar ? (
                            <img src={seat.userAvatar} alt="Avatar" className="seat-avatar-img" />
                          ) : (
                            <div className="host-avatar-fallback" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                              {seat.userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )
                        ) : (
                          <div style={{ color: '#475569', fontWeight: 800, fontSize: '1.1rem' }}>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: seat.userId ? '#ffffff' : '#64748b' }}>
                          {seat.userName || 'Empty Seat'}
                        </div>
                        {seat.hasRaiseHand && (
                          <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontWeight: 800, marginTop: '2px', display: 'inline-block' }}>
                            ✋ RAISED HAND
                          </span>
                        )}
                      </div>

                      {seat.userId && (
                        <div className="seat-actions-bar">
                          <button 
                            className={`seat-action-btn ${!seat.isMuted ? 'btn-active-mic' : ''}`}
                            onClick={() => handleToggleMic(index)}
                            title={seat.isMuted ? 'Unmute' : 'Mute'}
                          >
                            {seat.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                          </button>
                          <button 
                            className="seat-action-btn"
                            onClick={() => handleToggleLock(index)}
                            title={seat.isLocked ? 'Unlock Seat' : 'Lock Seat'}
                          >
                            {seat.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button 
                            className="seat-action-btn btn-danger"
                            onClick={() => handleKickUser(index)}
                            title="Kick User"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Room Form Tab */}
      {activeTab === 'create' && (
        <div className="matrix-mod-panel fade-in" style={{ maxWidth: '700px', margin: '30px auto' }}>
          <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Launch Audio Matrix Session</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Configure new broadcasting environment & seat limits</p>
            </div>
            <div className="matrix-bento-icon" style={{ color: '#60a5fa' }}>
              <Play size={24} />
            </div>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Room Title</label>
              <input 
                style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none' }}
                placeholder="e.g. VIP Music Lounge & Chill" 
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Category</label>
              <select style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none' }}>
                <option value="Chatting">💬 Chatting & Talk</option>
                <option value="Music">🎵 Music & Songs</option>
                <option value="Gaming">🎮 Gaming & Esports</option>
                <option value="PK Battle">⚔️ PK Battle</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Seat Capacity</label>
              <select style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none' }}>
                <option value={8}>8 Seats (Standard Configuration)</option>
                <option value={16}>16 Seats (Extended Matrix)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                className="btn-matrix-action"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', justifyContent: 'center' }}
                onClick={() => setActiveTab('live')}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-matrix-action"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  toast.success('Audio Room launched successfully!');
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
