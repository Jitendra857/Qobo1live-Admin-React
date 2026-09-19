import React from 'react';
import { Edit2, Trash2, Coins, History, LogOut, VideoOff, MicOff } from 'lucide-react';
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
  const statusClassName = (status?: string) => {
    const value = (status || 'active').toLowerCase();
    if (value === 'blocked' || value === 'inactive' || value === 'banned') return 'status-pill danger';
    if (value === 'pending') return 'status-pill warning';
    return 'status-pill active';
  };

  const getRoleBadge = (role?: string, isCoinsSeller?: boolean) => {
    const normalizedRole = (role === 'seller_admin' || isCoinsSeller) ? 'coins_seller' : (role || 'user');
    switch (normalizedRole) {
      case 'super_admin':
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            🛡️ Super Admin
          </span>
        );
      case 'agency':
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            🏢 Agency
          </span>
        );
      case 'host':
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            🎙️ Host
          </span>
        );
      case 'coins_seller':
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            🪙 Coin Seller
          </span>
        );
      case 'admin':
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            ⚡ Admin
          </span>
        );
      default:
        return (
          <span style={{ 
            fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', 
            background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)',
            display: 'inline-flex', alignItems: 'center', gap: '3px'
          }}>
            👤 User
          </span>
        );
    }
  };

  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

  return (
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
            <th style={{ width: '32%' }}>User</th>
            <th style={{ width: '18%' }}>Connectivity</th>
            <th style={{ width: '14%' }}>Assets</th>
            <th style={{ width: '10%' }}>Level</th>
            <th style={{ width: '10%' }}>Status</th>
            <th style={{ width: '23%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="table-empty">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={7} className="table-empty">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => {
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
                        <div>
                          {getRoleBadge(user.role, user.isCoinsSeller)}
                        </div>
                      </div>
                    </div>
                  </td>
                <td className="data-cell-dim">{user.phone || 'No Phone'}</td>
                <td className="data-cell">
                  <div className="assets-cluster" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="asset-tag coins" title="Coins" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Coins size={14} />
                      <span style={{ marginLeft: '4px' }}>{user.wallet?.coins?.toLocaleString() || 0}</span>
                    </div>
                    <div className="asset-tag diamonds" title="Diamonds" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                      <span style={{ marginRight: '4px', fontSize: '12px' }}>💎</span>
                      <span>{user.wallet?.diamonds?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="data-cell cell-center">
                  <span className="rank-badge">Lvl {user.level || 1}</span>
                </td>
                <td className="data-cell cell-center">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span className={statusClassName(user.status)}>
                      {user.status || 'active'}
                    </span>
                    {(user.isLiveStreaming || user.activeLiveStream) && (
                      <span 
                        className="status-pill danger" 
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.2)', 
                          border: '1px solid rgba(239, 68, 68, 0.5)', 
                          color: '#f87171', 
                          fontWeight: 800, 
                          fontSize: '0.68rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '2px 6px'
                        }}
                        title={`Live Streaming: ${user.activeLiveStream?.name || 'Active'}`}
                      >
                        🔴 LIVE
                      </span>
                    )}
                    {(user.isRoomActive || user.activeRoom) && (
                      <span 
                        className="status-pill warning" 
                        style={{ 
                          background: 'rgba(168, 85, 247, 0.2)', 
                          border: '1px solid rgba(168, 85, 247, 0.5)', 
                          color: '#c084fc', 
                          fontWeight: 800, 
                          fontSize: '0.68rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '2px 6px'
                        }}
                        title={`Audio Room: ${user.activeRoom?.title || 'Active'}`}
                      >
                        📻 ROOM
                      </span>
                    )}
                  </div>
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
                      title="Force Logout User Mobile Session & Terminate Active Broadcasts" 
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
