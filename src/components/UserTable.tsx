import React, { useState, useMemo } from 'react';
import { 
  Edit2, 
  Trash2, 
  Coins, 
  History, 
  LogOut, 
  VideoOff, 
  MicOff, 
  LayoutGrid, 
  List, 
  Copy, 
  Check, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import MediaImage from './MediaImage';

interface UserTableProps {
  users: any[];
  onAddCoins: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onViewHistory: (user: any) => void;
  onForceLogout: (user: any) => void;
  onShutdownStream?: (user: any) => void;
  onShutdownRoom?: (user: any) => void;
  loading?: boolean;
  selectedUserIds?: string[];
  onToggleSelectUser?: (userId: string) => void;
  onToggleSelectAll?: () => void;
}

type RoleFilterType = 'all' | 'super_admin' | 'agency' | 'host' | 'coins_seller' | 'user';

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onAddCoins, 
  onEdit, 
  onDelete, 
  onViewHistory, 
  onForceLogout, 
  onShutdownStream,
  onShutdownRoom,
  loading = false,
  selectedUserIds = [],
  onToggleSelectUser,
  onToggleSelectAll
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeRoleFilter, setActiveRoleFilter] = useState<RoleFilterType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getRoleCategory = (user: any): 'super_admin' | 'agency' | 'host' | 'coins_seller' | 'user' => {
    if (user.role === 'super_admin') return 'super_admin';
    if (user.role === 'agency' || user.ownedAgency) return 'agency';
    if (user.role === 'host' || user.isHost || (user.agencyCode && user.role !== 'agency')) return 'host';
    if (user.isCoinsSeller || user.role === 'seller_admin' || user.role === 'coins_seller') return 'coins_seller';
    return 'user';
  };

  const roleCounts = useMemo(() => {
    const counts = {
      all: users.length,
      super_admin: 0,
      agency: 0,
      host: 0,
      coins_seller: 0,
      user: 0
    };
    users.forEach(u => {
      const cat = getRoleCategory(u);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (activeRoleFilter === 'all') return users;
    return users.filter(u => getRoleCategory(u) === activeRoleFilter);
  }, [users, activeRoleFilter]);

  const statusClassName = (status?: string) => {
    const value = (status || 'active').toLowerCase();
    if (value === 'blocked' || value === 'inactive' || value === 'banned') return 'status-pill danger';
    if (value === 'pending') return 'status-pill warning';
    return 'status-pill active';
  };

  const renderRoleBadge = (user: any) => {
    const cat = getRoleCategory(user);
    switch (cat) {
      case 'super_admin':
        return (
          <span style={{ 
            fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.22))', 
            color: '#4338ca', border: '1px solid rgba(99, 102, 241, 0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 6px rgba(99, 102, 241, 0.1)'
          }}>
            🛡️ Super Admin
          </span>
        );
      case 'agency':
        return (
          <span style={{ 
            fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.22))', 
            color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.1)'
          }}>
            🏢 Agency
          </span>
        );
      case 'host':
        return (
          <span style={{ 
            fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 114, 182, 0.22))', 
            color: '#be185d', border: '1px solid rgba(236, 72, 153, 0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 6px rgba(236, 72, 153, 0.1)'
          }}>
            🎙️ Host
          </span>
        );
      case 'coins_seller':
        return (
          <span style={{ 
            fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.22))', 
            color: '#047857', border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
          }}>
            🪙 Coins Seller
          </span>
        );
      default:
        return (
          <span style={{ 
            fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', 
            background: 'rgba(100, 116, 139, 0.12)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.25)',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}>
            👤 Normal User
          </span>
        );
    }
  };

  const renderStatusBadge = (user: any) => {
    const status = (user.status || 'active').toLowerCase();
    const isLive = Boolean(user.isLiveStreaming || user.activeLiveStream);
    const isRoom = Boolean(user.isRoomActive || user.activeRoom);

    let badgeStyle = {
      background: 'rgba(16, 185, 129, 0.14)',
      color: '#059669',
      border: '1px solid rgba(16, 185, 129, 0.3)'
    };
    let dotColor = '#10b981';

    if (status === 'blocked' || status === 'banned' || status === 'inactive') {
      badgeStyle = {
        background: 'rgba(239, 68, 68, 0.14)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      };
      dotColor = '#ef4444';
    } else if (status === 'pending') {
      badgeStyle = {
        background: 'rgba(245, 158, 11, 0.14)',
        color: '#d97706',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      };
      dotColor = '#f59e0b';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          ...badgeStyle,
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor }} />
          {status}
        </span>
        {isLive && (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.18)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }} title={`Live Streaming: ${user.activeLiveStream?.name || 'Active'}`}>
            🔴 LIVE
          </span>
        )}
        {isRoom && (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '20px',
            background: 'rgba(168, 85, 247, 0.18)',
            color: '#7e22ce',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }} title={`Audio Room: ${user.activeRoom?.title || 'Active'}`}>
            📻 ROOM
          </span>
        )}
      </div>
    );
  };

  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id));

  return (
    <div className="user-table-container">
      {/* View & Role Controls Toolbar */}
      <div className="user-view-controls">
        <div className="role-filter-tabs">
          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('all')}
          >
            <span>All Users</span>
            <span className="role-tab-count">{roleCounts.all}</span>
          </button>
          
          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'super_admin' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('super_admin')}
          >
            <span>🛡️ Super Admin</span>
            <span className="role-tab-count">{roleCounts.super_admin}</span>
          </button>

          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'agency' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('agency')}
          >
            <span>🏢 Agency</span>
            <span className="role-tab-count">{roleCounts.agency}</span>
          </button>

          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'host' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('host')}
          >
            <span>🎙️ Host</span>
            <span className="role-tab-count">{roleCounts.host}</span>
          </button>

          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'coins_seller' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('coins_seller')}
          >
            <span>🪙 Coins Seller</span>
            <span className="role-tab-count">{roleCounts.coins_seller}</span>
          </button>

          <button 
            type="button"
            className={`role-tab-btn ${activeRoleFilter === 'user' ? 'active' : ''}`}
            onClick={() => setActiveRoleFilter('user')}
          >
            <span>👤 Normal User</span>
            <span className="role-tab-count">{roleCounts.user}</span>
          </button>
        </div>

        <div className="user-view-actions">
          {onToggleSelectAll && (
            <label className="select-all-pill" title="Select all visible users">
              <input 
                type="checkbox"
                className="user-card-checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
              />
              <span>Select All ({selectedUserIds.length})</span>
            </label>
          )}

          <div className="view-mode-toggle">
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Box Grid View"
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Loading / Empty / Cards / Table */}
      {loading ? (
        <div className="loading-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Syncing user demographics and assets...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <ShieldAlert size={48} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontWeight: 800, color: '#1e293b' }}>No Users Found</h3>
          <p style={{ color: '#64748b' }}>
            {activeRoleFilter !== 'all' 
              ? `No users matched the role "${activeRoleFilter.replace('_', ' ').toUpperCase()}".` 
              : 'No user accounts found matching your query.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARD BOX GRID DESIGN ================= */
        <div className="user-cards-grid">
          {filteredUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            const userIdentifier = user.phone || user.id || '';
            const coinsVal = user.wallet?.coins ?? user.coins ?? 0;
            const diamondsVal = user.wallet?.diamonds ?? user.diamonds ?? 0;
            const hasLiveStream = Boolean(user.isLiveStreaming || user.activeLiveStream);
            const hasAudioRoom = Boolean(user.isRoomActive || user.activeRoom);

            return (
              <div 
                key={user.id} 
                className={`user-card-box ${isSelected ? 'selected' : ''}`}
              >
                {/* Card Header: Checkbox + Role Tag + Status */}
                <div className="user-card-header">
                  <div className="user-card-header-left">
                    {onToggleSelectUser && (
                      <input 
                        type="checkbox"
                        className="user-card-checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectUser(user.id)}
                        title="Select user for bulk operations"
                      />
                    )}
                    {renderRoleBadge(user)}
                  </div>
                  <div className="user-card-header-right">
                    {renderStatusBadge(user)}
                  </div>
                </div>

                {/* Card Identity Section */}
                <div className="user-card-body">
                  <div className="user-card-avatar-wrap">
                    <MediaImage 
                      src={user.displayPicture} 
                      className="user-card-avatar"
                      fallbackText={user.name?.[0] || 'U'}
                    />
                    <span className="user-card-lvl-badge">
                      Lvl {user.level || 1}
                    </span>
                  </div>

                  <div className="user-card-info">
                    <div className="user-card-name" title={user.name || 'Anonymous User'}>
                      {user.name || 'Anonymous User'}
                    </div>

                    <div className="user-card-contact" title="Click to copy identifier">
                      <span>{userIdentifier || 'No Phone/ID'}</span>
                      {userIdentifier && (
                        <button 
                          type="button" 
                          className="user-card-copy-btn"
                          onClick={(e) => handleCopy(userIdentifier, user.id, e)}
                          title="Copy ID/Phone"
                        >
                          {copiedId === user.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>

                    {/* Additional Role Badges */}
                    {user.role === 'agency' && (
                      <span 
                        className="user-card-sub-tag" 
                        style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)' }}
                        title="Agency Details"
                      >
                        🏷️ {user.ownedAgency?.name || user.name} ({user.ownedAgency?.code || user.agencyCode || 'Pending'})
                      </span>
                    )}

                    {user.role === 'host' && user.agencyCode && (
                      <span 
                        className="user-card-sub-tag" 
                        style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#db2777', border: '1px solid rgba(236, 72, 153, 0.2)' }}
                        title="Assigned Agency"
                      >
                        🏢 Agency: {user.agencyCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Assets Dual Box */}
                <div className="user-card-assets">
                  <div className="user-asset-item">
                    <span className="user-asset-label">Coins Balance</span>
                    <span className="user-asset-val coins">
                      💰 {coinsVal.toLocaleString()}
                    </span>
                  </div>
                  <div className="user-asset-item">
                    <span className="user-asset-label">Diamonds</span>
                    <span className="user-asset-val diamonds">
                      💎 {diamondsVal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="user-card-actions">
                  <button 
                    type="button" 
                    className="card-action-btn coin" 
                    title="Inject Coins / Assets" 
                    onClick={() => onAddCoins(user)}
                  >
                    <Coins size={16} />
                  </button>

                  <button 
                    type="button" 
                    className="card-action-btn history" 
                    title="User Activity & Logs" 
                    onClick={() => onViewHistory(user)}
                  >
                    <History size={16} />
                  </button>

                  {hasLiveStream && onShutdownStream && (
                    <button 
                      type="button" 
                      className="card-action-btn stream" 
                      title="Shut Down Active Live Stream" 
                      onClick={() => onShutdownStream(user)}
                    >
                      <VideoOff size={16} />
                    </button>
                  )}

                  {hasAudioRoom && onShutdownRoom && (
                    <button 
                      type="button" 
                      className="card-action-btn room" 
                      title="Shut Down Active Audio Room" 
                      onClick={() => onShutdownRoom(user)}
                    >
                      <MicOff size={16} />
                    </button>
                  )}

                  <button 
                    type="button" 
                    className="card-action-btn logout" 
                    title="Force Logout Mobile Session & Terminate Broadcasts" 
                    onClick={() => onForceLogout(user)}
                  >
                    <LogOut size={16} />
                  </button>

                  <button 
                    type="button" 
                    className="card-action-btn edit" 
                    title="Edit User Profile" 
                    onClick={() => onEdit(user)}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button 
                    type="button" 
                    className="card-action-btn delete" 
                    title="Delete User Identity" 
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= COMPACT TABLE VIEW ================= */
        <div className="table-container-premium">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>
                  <input 
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }}
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    title="Select All Users"
                  />
                </th>
                <th style={{ width: '32%' }}>User Identity</th>
                <th style={{ width: '18%' }}>Contact / ID</th>
                <th style={{ width: '14%' }}>Assets</th>
                <th style={{ width: '10%' }}>Level</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '23%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <tr 
                    key={user.id} 
                    className={`row-premium ${isSelected ? 'row-selected' : ''}`}
                    style={isSelected ? { background: 'rgba(239, 68, 68, 0.05)' } : undefined}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox"
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }}
                        checked={isSelected}
                        onChange={() => onToggleSelectUser && onToggleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="identity-block">
                        <MediaImage 
                          src={user.displayPicture} 
                          className="avatar-glass" 
                          style={{ objectFit: 'cover' }}
                          fallbackText={user.name?.[0] || 'U'}
                        />
                        <div className="identity-text" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="name-bold">{user.name || 'Anonymous User'}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {renderRoleBadge(user)}
                            {user.role === 'agency' && (
                              <span style={{ 
                                fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
                                background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)',
                                display: 'inline-flex', alignItems: 'center', gap: '3px'
                              }}>
                                🏷️ {user.ownedAgency?.name || user.name} ({user.ownedAgency?.code || user.agencyCode || 'Pending'})
                              </span>
                            )}
                            {user.role === 'host' && user.agencyCode && (
                              <span style={{ 
                                fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', 
                                background: 'rgba(236, 72, 153, 0.1)', color: '#db2777', border: '1px solid rgba(236, 72, 153, 0.2)',
                                display: 'inline-flex', alignItems: 'center', gap: '3px'
                              }}>
                                🏢 Agency: {user.agencyCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="data-cell-dim">{user.phone || user.id || 'No Phone'}</td>
                    <td className="data-cell">
                      <div className="assets-cluster" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="asset-tag coins" title="Coins" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Coins size={14} />
                          <span style={{ marginLeft: '4px' }}>{(user.wallet?.coins ?? user.coins ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="asset-tag diamonds" title="Diamonds" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                          <span style={{ marginRight: '4px', fontSize: '12px' }}>💎</span>
                          <span>{(user.wallet?.diamonds ?? user.diamonds ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="data-cell cell-center">
                      <span className="rank-badge">Lvl {user.level || 1}</span>
                    </td>
                    <td className="data-cell cell-center">
                      {renderStatusBadge(user)}
                    </td>
                    <td>
                      <div className="ops-cluster">
                        <button className="op-btn coin" title="Inject Assets" onClick={() => onAddCoins(user)}>
                          <Coins size={18} />
                        </button>
                        <button 
                          className="op-btn edit" 
                          title="User Activity & History" 
                          onClick={() => onViewHistory(user)} 
                          style={{ background: 'rgba(139, 92, 246, 0.18)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.35)' }}
                        >
                          <History size={18} />
                        </button>

                        {(user.isLiveStreaming || user.activeLiveStream) && onShutdownStream && (
                          <button 
                            className="op-btn delete" 
                            title="Shut Down Active Live Stream" 
                            onClick={() => onShutdownStream(user)}
                            style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }}
                          >
                            <VideoOff size={18} />
                          </button>
                        )}

                        {(user.isRoomActive || user.activeRoom) && onShutdownRoom && (
                          <button 
                            className="op-btn delete" 
                            title="Shut Down Active Audio Room" 
                            onClick={() => onShutdownRoom(user)}
                            style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.5)' }}
                          >
                            <MicOff size={18} />
                          </button>
                        )}

                        <button 
                          className="op-btn edit" 
                          title="Force Logout User Mobile Session" 
                          onClick={() => onForceLogout(user)} 
                          style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                        >
                          <LogOut size={18} />
                        </button>
                        <button className="op-btn edit" title="Modify" onClick={() => onEdit(user)}>
                          <Edit2 size={18} />
                        </button>
                        <button className="op-btn delete" title="Terminate" onClick={() => onDelete(user.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTable;
