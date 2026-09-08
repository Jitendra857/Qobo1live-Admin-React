import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { X, Phone, Tv, Swords, Gift, Wallet, Clock, UserCheck, ArrowUpRight, ArrowDownLeft, ShieldCheck, Flame, Radio } from 'lucide-react';
import MediaImage from './MediaImage';
import '../styles/UserManagement.css';

interface UserHistoryModalProps {
  user: any;
  onClose: () => void;
}

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'rooms' | 'pk' | 'gifts' | 'transactions'>('timeline');
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getUserActivityHistory(user.id);
        if (res.data && (res.data.statusCode === 1 || res.data.success)) {
          setHistory(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load activity history');
        }
      } catch (err: any) {
        console.error('Error fetching user activity history:', err);
        setError(err.response?.data?.message || err.message || 'Error connecting to backend server');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  // Format Seconds to Minutes:Seconds
  const formatDuration = (secs?: number) => {
    if (!secs || secs <= 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Format Date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const directCalls = history?.directCalls || [];
  const roomJoinCalls = history?.roomJoinCalls || [];
  const hostedRooms = history?.hostedRooms || [];
  const hostedLiveStreams = history?.hostedLiveStreams || [];
  const pkBattles = history?.pkBattles || [];
  const followerPkBattles = history?.followerPkBattles || [];
  const giftHistories = history?.giftHistories || [];
  const transactions = history?.transactions || [];

  // Build Unified Timeline Activity List
  const buildTimeline = () => {
    const events: any[] = [];

    // Direct Calls
    directCalls.forEach((call: any) => {
      const isCaller = call.callerId === user.id;
      const otherUser = isCaller ? call.callee : call.caller;
      events.push({
        id: `call_${call.id}`,
        timestamp: new Date(call.startedAt || call.createdAt).getTime(),
        date: call.startedAt || call.createdAt,
        type: 'call',
        title: isCaller ? `Called ${otherUser?.name || 'User'}` : `Incoming call from ${otherUser?.name || 'User'}`,
        badge: call.callType?.toUpperCase() || 'VOICE',
        badgeColor: '#3b82f6',
        details: `Duration: ${formatDuration(call.durationSeconds)} | Coins: ${call.coinsCharged || 0}`,
        status: call.status,
        icon: <Phone size={16} />
      });
    });

    // Room Joins & Hosted Rooms
    roomJoinCalls.forEach((r: any) => {
      events.push({
        id: `room_join_${r.id}`,
        timestamp: new Date(r.startedAt || r.createdAt).getTime(),
        date: r.startedAt || r.createdAt,
        type: 'room',
        title: `Joined Room: ${r.room?.title || r.roomId || 'Audio Room'}`,
        badge: 'ROOM JOIN',
        badgeColor: '#8b5cf6',
        details: `Duration: ${formatDuration(r.durationSeconds)}`,
        status: r.status,
        icon: <Tv size={16} />
      });
    });

    hostedRooms.forEach((r: any) => {
      events.push({
        id: `room_host_${r.id}`,
        timestamp: new Date(r.createdAt).getTime(),
        date: r.createdAt,
        type: 'room',
        title: `Created Room: ${r.title}`,
        badge: `HOST (${r.type?.toUpperCase() || 'AUDIO'})`,
        badgeColor: '#ec4899',
        details: `Category: ${r.category || 'General'} | Status: ${r.status}`,
        status: r.status,
        icon: <Radio size={16} />
      });
    });

    hostedLiveStreams.forEach((ls: any) => {
      events.push({
        id: `livestream_${ls.id}`,
        timestamp: new Date(ls.createdAt).getTime(),
        date: ls.createdAt,
        type: 'stream',
        title: `Hosted Live Stream: ${ls.name}`,
        badge: 'LIVE STREAM',
        badgeColor: '#ef4444',
        details: `Viewers: ${ls.viewerCount || 0} | Duration: ${formatDuration(ls.durationSeconds)}`,
        status: ls.isLive ? 'LIVE NOW' : 'ENDED',
        icon: <Flame size={16} />
      });
    });

    // PK Battles
    pkBattles.forEach((pk: any) => {
      const isHostA = pk.hostAId === user.id;
      const opponent = isHostA ? pk.hostB : pk.hostA;
      events.push({
        id: `pk_${pk.id}`,
        timestamp: new Date(pk.createdAt).getTime(),
        date: pk.createdAt,
        type: 'pk',
        title: `PK Battle vs ${opponent?.name || 'Opponent'}`,
        badge: `PK (${pk.mode})`,
        badgeColor: '#f59e0b',
        details: `Score: ${pk.scoreA} vs ${pk.scoreB} | Status: ${pk.status}`,
        status: pk.winnerId === user.id ? 'WON 🏆' : (pk.winnerId ? 'LOST' : pk.status),
        icon: <Swords size={16} />
      });
    });

    // Gift Sending / Receiving
    giftHistories.forEach((g: any) => {
      const isSender = g.senderId === user.id;
      const otherUser = isSender ? g.receiver : g.sender;
      events.push({
        id: `gift_${g.id}`,
        timestamp: new Date(g.createdAt).getTime(),
        date: g.createdAt,
        type: 'gift',
        title: isSender 
          ? `Sent Gift '${g.giftName}' (x${g.quantity}) to ${otherUser?.name || g.receiverName || 'User'}`
          : `Received Gift '${g.giftName}' (x${g.quantity}) from ${g.sender?.name || 'User'}`,
        badge: isSender ? 'GIFT SENT 🔴' : 'GIFT EARNED 🟢',
        badgeColor: isSender ? '#f43f5e' : '#10b981',
        details: `Module: ${g.type} | Coins: ${g.coinsSpent} coins`,
        status: 'COMPLETED',
        icon: <Gift size={16} />
      });
    });

    // Transactions
    transactions.forEach((tx: any) => {
      const isSender = tx.senderId === user.id;
      events.push({
        id: `tx_${tx.id}`,
        timestamp: new Date(tx.createdAt).getTime(),
        date: tx.createdAt,
        type: 'transaction',
        title: `Wallet Transaction: ${tx.type}`,
        badge: isSender ? 'DEBIT' : 'CREDIT',
        badgeColor: isSender ? '#f43f5e' : '#10b981',
        details: `Amount: ${tx.amount} coins | Status: ${tx.status}`,
        status: tx.status,
        icon: <Wallet size={16} />
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
  };

  const timelineEvents = buildTimeline();

  return (
    <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-box-custom" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '950px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
      >
        {/* Header Profile Info Bar */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MediaImage 
              src={user.displayPicture} 
              alt={user.name} 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8b5cf6' }} 
            />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.name || 'Anonymous User'}
                <span className="rank-badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Lvl {user.level || 1}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: user.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', color: user.status === 'active' ? '#10b981' : '#f43f5e' }}>
                  {user.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>ID: <strong style={{ color: '#cbd5e1' }}>{user.id}</strong></span>
                <span>Phone: <strong style={{ color: '#cbd5e1' }}>{user.phone || 'N/A'}</strong></span>
                <span>Email: <strong style={{ color: '#cbd5e1' }}>{user.email || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Wallet Quick Stats */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span>🪙</span> {(history?.user?.wallet?.coins || user.coins || 0).toLocaleString()} Coins
              </div>
              <div style={{ fontSize: '0.88rem', color: '#06b6d4', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                <span>💎</span> {(history?.user?.wallet?.diamonds || user.diamonds || 0).toLocaleString()} Diamonds
              </div>
            </div>

            <button 
              onClick={onClose} 
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 20px', gap: '8px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('timeline')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'timeline' ? '3px solid #8b5cf6' : '3px solid transparent', color: activeTab === 'timeline' ? '#c084fc' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Clock size={16} /> All Activity ({timelineEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab('calls')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'calls' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'calls' ? '#60a5fa' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={16} /> 1:1 Calls ({directCalls.length})
          </button>
          <button 
            onClick={() => setActiveTab('rooms')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'rooms' ? '3px solid #ec4899' : '3px solid transparent', color: activeTab === 'rooms' ? '#f472b6' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Tv size={16} /> Rooms & Streams ({hostedRooms.length + roomJoinCalls.length + hostedLiveStreams.length})
          </button>
          <button 
            onClick={() => setActiveTab('pk')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'pk' ? '3px solid #f59e0b' : '3px solid transparent', color: activeTab === 'pk' ? '#fbbf24' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Swords size={16} /> PK Battles ({pkBattles.length + followerPkBattles.length})
          </button>
          <button 
            onClick={() => setActiveTab('gifts')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'gifts' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'gifts' ? '#34d399' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Gift size={16} /> Gifts & Earnings ({giftHistories.length})
          </button>
          <button 
            onClick={() => setActiveTab('transactions')} 
            style={{ padding: '14px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === 'transactions' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'transactions' ? '#818cf8' : '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Wallet size={16} /> Transactions ({transactions.length})
          </button>
        </div>

        {/* Tab Body View */}
        <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1, background: '#07090e' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%' }} />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#f43f5e' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700 }}>{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: TIMELINE */}
              {activeTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {timelineEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No mobile activity recorded for this user yet.</div>
                  ) : (
                    timelineEvents.map((ev) => (
                      <div key={ev.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ev.badgeColor}20`, color: ev.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {ev.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{ev.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{ev.details}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: `${ev.badgeColor}25`, color: ev.badgeColor, textTransform: 'uppercase' }}>
                            {ev.badge}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{formatDate(ev.date)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: CALLS */}
              {activeTab === 'calls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {directCalls.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No direct call history found.</div>
                  ) : (
                    directCalls.map((call: any) => {
                      const isCaller = call.callerId === user.id;
                      const otherUser = isCaller ? call.callee : call.caller;
                      return (
                        <div key={call.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <MediaImage src={otherUser?.displayPicture} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isCaller ? <ArrowUpRight size={16} style={{ color: '#60a5fa' }} /> : <ArrowDownLeft size={16} style={{ color: '#34d399' }} />}
                                <span>{isCaller ? `Outgoing Call to ${otherUser?.name || 'User'}` : `Incoming Call from ${otherUser?.name || 'User'}`}</span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                Type: {call.callType?.toUpperCase() || 'VOICE'} | Duration: {formatDuration(call.durationSeconds)} | Coins Charged: {call.coinsCharged || 0}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: call.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', color: call.status === 'completed' ? '#10b981' : '#f43f5e' }}>
                              {call.status?.toUpperCase()}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{formatDate(call.startedAt || call.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: ROOMS & STREAMS */}
              {activeTab === 'rooms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ color: '#c084fc', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Hosted Audio & Video Rooms ({hostedRooms.length})</h4>
                  {hostedRooms.map((r: any) => (
                    <div key={r.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{r.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          Type: {r.type?.toUpperCase()} | Category: {r.category} | Zego ID: {r.zegoLiveId || 'N/A'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(139,92,246,0.2)', color: '#c084fc' }}>{r.status?.toUpperCase()}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{formatDate(r.createdAt)}</div>
                      </div>
                    </div>
                  ))}

                  <h4 style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '12px' }}>Hosted Live Streams ({hostedLiveStreams.length})</h4>
                  {hostedLiveStreams.map((ls: any) => (
                    <div key={ls.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{ls.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          Viewers: {ls.viewerCount || 0} | Duration: {formatDuration(ls.durationSeconds)} | Zego ID: {ls.zegoLiveId}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: ls.isLive ? 'rgba(239,68,68,0.2)' : 'rgba(100,116,139,0.2)', color: ls.isLive ? '#ef4444' : '#94a3b8' }}>
                          {ls.isLive ? 'LIVE NOW 🔴' : 'ENDED'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{formatDate(ls.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: PK BATTLES */}
              {activeTab === 'pk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pkBattles.length === 0 && followerPkBattles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No PK Battle history found for this user.</div>
                  ) : (
                    pkBattles.map((pk: any) => {
                      const isHostA = pk.hostAId === user.id;
                      const opponent = isHostA ? pk.hostB : pk.hostA;
                      return (
                        <div key={pk.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                              PK Battle vs {opponent?.name || 'Opponent'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                              Mode: {pk.mode} | Score: {pk.scoreA} vs {pk.scoreB} | Duration: {pk.durationSec}s
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: pk.winnerId === user.id ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: pk.winnerId === user.id ? '#10b981' : '#f59e0b' }}>
                              {pk.winnerId === user.id ? 'VICTORY 🏆' : pk.status}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{formatDate(pk.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 5: GIFTS & MODULE EARNINGS */}
              {activeTab === 'gifts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {giftHistories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No gift sending or receiving records found.</div>
                  ) : (
                    giftHistories.map((g: any) => {
                      const isSender = g.senderId === user.id;
                      const otherUser = isSender ? g.receiver : g.sender;
                      return (
                        <div key={g.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <MediaImage src={g.giftImage} alt={g.giftName} style={{ width: '40px', height: '40px', objectFit: 'contain' }} fallbackText="🎁" />
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                                {isSender ? `Sent '${g.giftName}' (x${g.quantity}) to ${otherUser?.name || g.receiverName || 'User'}` : `Received '${g.giftName}' (x${g.quantity}) from ${g.sender?.name || 'User'}`}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                Module: <strong style={{ color: '#c084fc' }}>{g.type?.toUpperCase()}</strong> | Room: {g.roomTitle || g.roomId || 'Direct'}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isSender ? '#f43f5e' : '#10b981' }}>
                              {isSender ? `-${g.coinsSpent} Coins` : `+${g.coinsSpent} Coins`}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{formatDate(g.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 6: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No wallet transaction logs found.</div>
                  ) : (
                    transactions.map((tx: any) => {
                      const isSender = tx.senderId === user.id;
                      return (
                        <div key={tx.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                              Transaction: {tx.type?.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                              Status: {tx.status} | ID: {tx.id}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isSender ? '#f43f5e' : '#10b981' }}>
                              {isSender ? `-${tx.amount} Coins` : `+${tx.amount} Coins`}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{formatDate(tx.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
