import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../services/api';
import { 
  X, Phone, Tv, Swords, Gift, Wallet, Clock, Search, 
  ArrowUpRight, ArrowDownLeft, Flame, Radio, 
  Filter, CheckCircle, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import MediaImage from './MediaImage';
import '../styles/UserManagement.css';

interface UserHistoryModalProps {
  user: any;
  onClose: () => void;
}

export interface HistoryEvent {
  id: string;
  timestamp: number;
  rawDate: Date;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  category: 'call' | 'room' | 'stream' | 'pk' | 'gift' | 'transaction';
  moduleName: string;
  title: string;
  actionType: string;
  otherUser?: {
    id: string;
    name: string;
    displayPicture?: string;
    phone?: string;
  };
  coinsImpact: number; // >0 for income, <0 for expense
  details: string;
  giftImage?: string;
  giftName?: string;
  quantity?: number;
  status?: string;
}

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  totalEarnedCoins: number;
  totalSpentCoins: number;
  callCount: number;
  roomCount: number;
  streamCount: number;
  giftCount: number;
  events: HistoryEvent[];
}

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ user, onClose }) => {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, last7, last30
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Format Duration (Seconds -> Minutes:Seconds)
  const formatDuration = (secs?: number) => {
    if (!secs || secs <= 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Helper to format Date Keys and Labels
  const getDateMeta = (dateInput?: string | Date) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    let dateLabel = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (isToday) {
      dateLabel = `Today (${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })})`;
    } else if (isYesterday) {
      dateLabel = `Yesterday (${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })})`;
    }

    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return { dateKey, dateLabel, timeLabel, rawDate: d, isToday, isYesterday };
  };

  // Process and Normalize all Events
  const allEvents = useMemo(() => {
    if (!history) return [];

    const events: HistoryEvent[] = [];
    const directCalls = history.directCalls || [];
    const roomJoinCalls = history.roomJoinCalls || [];
    const hostedRooms = history.hostedRooms || [];
    const hostedLiveStreams = history.hostedLiveStreams || [];
    const pkBattles = history.pkBattles || [];
    const followerPkBattles = history.followerPkBattles || [];
    const giftHistories = history.giftHistories || [];
    const transactions = history.transactions || [];

    // 1. Direct Calls
    directCalls.forEach((call: any) => {
      const isCaller = call.callerId === user.id;
      const otherUser = isCaller ? call.callee : call.caller;
      const meta = getDateMeta(call.startedAt || call.createdAt);
      events.push({
        id: `call_${call.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'call',
        moduleName: '1:1 Direct Call',
        title: isCaller ? `Outgoing Call to ${otherUser?.name || 'User'}` : `Incoming Call from ${otherUser?.name || 'User'}`,
        actionType: isCaller ? 'OUTGOING CALL' : 'INCOMING CALL',
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name || 'User',
          displayPicture: otherUser.displayPicture,
          phone: otherUser.phone
        } : undefined,
        coinsImpact: isCaller ? -(call.coinsCharged || 0) : (call.coinsCharged || 0),
        details: `Type: ${call.callType?.toUpperCase() || 'VOICE'} | Duration: ${formatDuration(call.durationSeconds)} | Status: ${call.status}`,
        status: call.status
      });
    });

    // 2. Room Joins & Hosted Rooms
    roomJoinCalls.forEach((r: any) => {
      const meta = getDateMeta(r.startedAt || r.createdAt);
      events.push({
        id: `room_join_${r.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'room',
        moduleName: 'Audio / Video Room',
        title: `Joined Room: ${r.room?.title || r.roomId || 'Live Room'}`,
        actionType: 'JOINED ROOM',
        coinsImpact: 0,
        details: `Duration: ${formatDuration(r.durationSeconds)} | Status: ${r.status}`,
        status: r.status
      });
    });

    hostedRooms.forEach((r: any) => {
      const meta = getDateMeta(r.createdAt);
      events.push({
        id: `room_host_${r.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'room',
        moduleName: 'Audio / Video Room',
        title: `Created & Hosted Room: ${r.title}`,
        actionType: 'HOSTED ROOM',
        coinsImpact: 0,
        details: `Category: ${r.category || 'General'} | Zego ID: ${r.zegoLiveId || 'N/A'} | Status: ${r.status}`,
        status: r.status
      });
    });

    // 3. Live Streams Hosted
    hostedLiveStreams.forEach((ls: any) => {
      const meta = getDateMeta(ls.createdAt);
      events.push({
        id: `livestream_${ls.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'stream',
        moduleName: 'Live Streaming',
        title: `Created Live Stream: ${ls.name}`,
        actionType: 'HOSTED LIVE STREAM',
        coinsImpact: 0,
        details: `Viewers: ${ls.viewerCount || 0} | Duration: ${formatDuration(ls.durationSeconds)} | Zego ID: ${ls.zegoLiveId}`,
        status: ls.isLive ? 'LIVE NOW' : 'ENDED'
      });
    });


    // 4. PK Battles
    pkBattles.forEach((pk: any) => {
      const isHostA = pk.hostAId === user.id;
      const opponent = isHostA ? pk.hostB : pk.hostA;
      const meta = getDateMeta(pk.createdAt);
      events.push({
        id: `pk_${pk.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'pk',
        moduleName: 'PK Battle',
        title: `PK Battle vs ${opponent?.name || 'Opponent User'}`,
        actionType: 'PK BATTLE',
        otherUser: opponent ? {
          id: opponent.id,
          name: opponent.name || 'Opponent',
          displayPicture: opponent.displayPicture
        } : undefined,
        coinsImpact: 0,
        details: `Mode: ${pk.mode} | Score: ${pk.scoreA} vs ${pk.scoreB} | Duration: ${pk.durationSec}s`,
        status: pk.winnerId === user.id ? 'WON 🏆' : (pk.winnerId ? 'LOST' : pk.status)
      });
    });

    // 5. Gifts (Sent & Received)
    giftHistories.forEach((g: any) => {
      const isSender = g.senderId === user.id;
      const otherUser = isSender ? g.receiver : g.sender;
      const meta = getDateMeta(g.createdAt);
      events.push({
        id: `gift_${g.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'gift',
        moduleName: g.type || 'gift',
        title: isSender 
          ? `Sent Gift '${g.giftName}' (x${g.quantity}) to ${otherUser?.name || g.receiverName || 'User'}`
          : `Earned Gift '${g.giftName}' (x${g.quantity}) from ${g.sender?.name || 'User'}`,
        actionType: isSender ? 'GIFT SENT' : 'GIFT EARNED',
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name || g.receiverName || 'User',
          displayPicture: otherUser.displayPicture
        } : undefined,
        coinsImpact: isSender ? -(g.coinsSpent || 0) : (g.coinsSpent || 0),
        giftImage: g.giftImage,
        giftName: g.giftName,
        quantity: g.quantity,
        details: `Module: ${g.type} | Room: ${g.roomTitle || g.roomId || 'Direct Chat'}`,
        status: 'COMPLETED'
      });
    });

    // 6. Transactions
    transactions.forEach((tx: any) => {
      const isSender = tx.senderId === user.id;
      const meta = getDateMeta(tx.createdAt);
      events.push({
        id: `tx_${tx.id}`,
        timestamp: meta.rawDate.getTime(),
        rawDate: meta.rawDate,
        dateKey: meta.dateKey,
        dateLabel: meta.dateLabel,
        timeLabel: meta.timeLabel,
        category: 'transaction',
        moduleName: 'Wallet Ledger',
        title: `Wallet ${tx.type?.toUpperCase() || 'TRANSACTION'}`,
        actionType: isSender ? 'DEBIT' : 'CREDIT',
        coinsImpact: isSender ? -(tx.amount || 0) : (tx.amount || 0),
        details: `Type: ${tx.type} | Status: ${tx.status}`,
        status: tx.status
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, user]);

  // Group Events Date-Wise
  const dateGroups = useMemo(() => {
    const today = new Date();
    const last7Cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const groupMap: { [key: string]: DateGroup } = {};

    allEvents.forEach((ev) => {
      // Filter by Category
      if (categoryFilter !== 'all' && ev.category !== categoryFilter) {
        return;
      }

      // Filter by Date Range
      if (dateFilter === 'today' && ev.rawDate.toDateString() !== today.toDateString()) {
        return;
      }
      if (dateFilter === 'last7' && ev.rawDate < last7Cutoff) {
        return;
      }
      if (dateFilter === 'last30' && ev.rawDate < last30Cutoff) {
        return;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDetails = ev.details.toLowerCase().includes(q);
        const matchesModuleName = ev.moduleName.toLowerCase().includes(q);
        const matchesOtherUser = ev.otherUser && (
          ev.otherUser.name.toLowerCase().includes(q) ||
          ev.otherUser.id.toLowerCase().includes(q) ||
          (ev.otherUser.phone && ev.otherUser.phone.includes(q))
        );
        if (!matchesTitle && !matchesDetails && !matchesModuleName && !matchesOtherUser) {
          return;
        }
      }

      if (!groupMap[ev.dateKey]) {
        groupMap[ev.dateKey] = {
          dateKey: ev.dateKey,
          dateLabel: ev.dateLabel,
          totalEarnedCoins: 0,
          totalSpentCoins: 0,
          callCount: 0,
          roomCount: 0,
          streamCount: 0,
          giftCount: 0,
          events: []
        };
      }

      const group = groupMap[ev.dateKey];
      group.events.push(ev);

      if (ev.coinsImpact > 0) {
        group.totalEarnedCoins += ev.coinsImpact;
      } else if (ev.coinsImpact < 0) {
        group.totalSpentCoins += Math.abs(ev.coinsImpact);
      }

      if (ev.category === 'call') group.callCount++;
      if (ev.category === 'room') group.roomCount++;
      if (ev.category === 'stream') group.streamCount++;
      if (ev.category === 'gift') group.giftCount++;
    });

    return Object.values(groupMap).sort((a, b) => {
      return new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime();
    });
  }, [allEvents, categoryFilter, dateFilter, searchQuery]);

  // Overall Total Summary Calculations
  const grandTotals = useMemo(() => {
    let earned = 0;
    let spent = 0;
    dateGroups.forEach(g => {
      earned += g.totalEarnedCoins;
      spent += g.totalSpentCoins;
    });
    return { earned, spent };
  }, [dateGroups]);

  return (
    <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1000 }}>
      {/* Large Screen Workspace Box */}
      <div 
        className="modal-box-custom" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '96vw', 
          maxWidth: '1450px', 
          height: '92vh', 
          maxHeight: '92vh', 
          borderRadius: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0', 
          overflow: 'hidden',
          background: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Top Header Card */}
        <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <MediaImage 
              src={user.displayPicture} 
              alt={user.name} 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8b5cf6', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }} 
            />
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{user.name || 'Anonymous User'}</span>
                <span className="rank-badge" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>Lvl {user.level || 1}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: user.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', color: user.status === 'active' ? '#10b981' : '#f43f5e' }}>
                  {user.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <span>User ID: <strong style={{ color: '#cbd5e1' }}>{user.id}</strong></span>
                <span>Phone: <strong style={{ color: '#cbd5e1' }}>{user.phone || 'N/A'}</strong></span>
                <span>Email: <strong style={{ color: '#cbd5e1' }}>{user.email || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Header Stats & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.04)', padding: '10px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Coins Balance</div>
                <div style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 900, marginTop: '2px' }}>🪙 {(history?.user?.wallet?.coins || user.coins || 0).toLocaleString()}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Diamonds Balance</div>
                <div style={{ fontSize: '1rem', color: '#06b6d4', fontWeight: 900, marginTop: '2px' }}>💎 {(history?.user?.wallet?.diamonds || user.diamonds || 0).toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={fetchHistory}
              title="Refresh User History"
              style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c084fc', width: '42px', height: '42px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button 
              onClick={onClose} 
              title="Close Workspace (ESC)"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', width: '42px', height: '42px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Toolbar Bar: Filters & Search */}
        <div style={{ padding: '14px 28px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'all', label: 'All Activities' },
                { id: 'gift', label: '🎁 Gifts & Earnings' },
                { id: 'call', label: '📞 1:1 Calls' },
                { id: 'room', label: '🎙️ Rooms' },
                { id: 'stream', label: '🔴 Live Streams' },
                { id: 'pk', label: '⚔️ PK Battles' },
                { id: 'transaction', label: '💳 Wallet Tx' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: categoryFilter === cat.id ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'transparent',
                    color: categoryFilter === cat.id ? '#ffffff' : '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Toolbar: Quick Date Range & Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} style={{ color: '#94a3b8' }} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0 12px', width: '260px' }}>
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search user, gift, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '8px', fontSize: '0.82rem', width: '100%', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area: Date-Wise Grouped Activity List */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flexGrow: 1, background: '#07090e' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="animate-spin" style={{ width: '44px', height: '44px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%' }} />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#f43f5e' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{error}</p>
            </div>
          ) : dateGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              <Clock size={48} style={{ opacity: 0.2, margin: '0 auto 12px auto' }} />
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>No User Activity Records Found</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Try adjusting your search query or category filters.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Loop Date Groups */}
              {dateGroups.map((group) => (
                <div key={group.dateKey} style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden' }}>
                  
                  {/* Date Section Header Bar */}
                  <div style={{ padding: '16px 22px', background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#8b5cf6', width: '8px', height: '20px', borderRadius: '4px' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                        📅 {group.dateLabel}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {group.events.length} Logs
                      </span>
                    </div>

                    {/* Daily Summary Metrics */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {group.totalEarnedCoins > 0 && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '4px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={14} /> Earned: +{group.totalEarnedCoins.toLocaleString()} Coins
                        </div>
                      )}

                      {group.totalSpentCoins > 0 && (
                        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '4px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingDown size={14} /> Spent: -{group.totalSpentCoins.toLocaleString()} Coins
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                        {group.callCount > 0 && <span>📞 {group.callCount} Calls</span>}
                        {group.roomCount > 0 && <span>🎙️ {group.roomCount} Rooms</span>}
                        {group.streamCount > 0 && <span>🔴 {group.streamCount} Streams</span>}
                        {group.giftCount > 0 && <span>🎁 {group.giftCount} Gifts</span>}
                      </div>
                    </div>
                  </div>

                  {/* Daily Log Event Rows */}
                  <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {group.events.map((ev) => (
                      <div 
                        key={ev.id} 
                        style={{ 
                          background: 'rgba(15, 23, 42, 0.7)', 
                          border: '1px solid rgba(255, 255, 255, 0.05)', 
                          borderRadius: '14px', 
                          padding: '14px 18px', 
                          display: 'grid',
                          gridTemplateColumns: '90px 220px 1fr 220px 140px',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        {/* 1. Time Column */}
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} style={{ color: '#64748b' }} />
                          {ev.timeLabel}
                        </div>

                        {/* 2. Event Action & Module Tag */}
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: ev.actionType.includes('EARNED') || ev.actionType.includes('INCOMING') ? '#34d399' : (ev.actionType.includes('SENT') || ev.actionType.includes('OUTGOING') ? '#fb7185' : '#c084fc'), letterSpacing: '0.04em' }}>
                            {ev.actionType}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                            Module: <span style={{ color: '#e2e8f0' }}>{ev.moduleName}</span>
                          </div>
                        </div>

                        {/* 3. Event Details & Title */}
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {ev.giftImage && (
                              <MediaImage src={ev.giftImage} alt={ev.giftName} style={{ width: '24px', height: '24px', objectFit: 'contain' }} fallbackText="🎁" />
                            )}
                            <span style={{ wordBreak: 'break-word' }}>{ev.title}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                            {ev.details}
                          </div>
                        </div>

                        {/* 4. Other User Info Block */}
                        <div>
                          {ev.otherUser ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <MediaImage 
                                src={ev.otherUser.displayPicture} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                fallbackText={ev.otherUser.name?.[0] || 'U'} 
                              />
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {ev.otherUser.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                  ID: {ev.otherUser.id}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>System / General</span>
                          )}
                        </div>

                        {/* 5. Coins Financial Impact */}
                        <div style={{ textAlign: 'right' }}>
                          {ev.coinsImpact !== 0 ? (
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: ev.coinsImpact > 0 ? '#34d399' : '#fb7185' }}>
                              {ev.coinsImpact > 0 ? `+${ev.coinsImpact.toLocaleString()} Coins` : `-${Math.abs(ev.coinsImpact).toLocaleString()} Coins`}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              No Coin Transfer
                            </div>
                          )}
                          {ev.status && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', display: 'inline-block', marginTop: '4px', textTransform: 'uppercase' }}>
                              {ev.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
