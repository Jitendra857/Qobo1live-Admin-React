import { Edit2, Trash2, Coins } from 'lucide-react';
import { BACKEND_URL } from '../services/api';
import MediaImage from './MediaImage';

interface UserTableProps {
  users: any[];
  onAddCoins: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, onAddCoins, onEdit, onDelete, loading = false }) => {
  const statusClassName = (status?: string) => {
    const value = (status || 'active').toLowerCase();
    if (value === 'blocked' || value === 'inactive' || value === 'banned') return 'status-pill danger';
    if (value === 'pending') return 'status-pill warning';
    return 'status-pill active';
  };

  return (
    <div className="table-container-premium">
      <table className="modern-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>User</th>
            <th style={{ width: '20%' }}>Connectivity</th>
            <th style={{ width: '12%' }}>Assets</th>
            <th style={{ width: '10%' }}>Level</th>
            <th style={{ width: '10%' }}>Status</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="table-empty">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="row-premium">
                <td>
                  <div className="identity-block">
                    <MediaImage 
                      src={user.displayPicture} 
                      className="avatar-glass" 
                      style={{ objectFit: 'cover' }}
                      fallbackText={user.name?.[0] || 'U'}
                    />
                    <div className="identity-text">
                      <span className="name-bold">{user.name || 'Anonymous User'}</span>
                      <span className="email-sub">{user.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="data-cell-dim">{user.phone || 'No Phone'}</td>
                <td className="data-cell">
                  <div className="asset-tag">
                    <Coins size={14} />
                    <span>{user.wallet?.coins?.toLocaleString() || 0}</span>
                  </div>
                </td>
                <td className="data-cell cell-center">
                  <span className="rank-badge">Lvl {user.level || 1}</span>
                </td>
                <td className="data-cell cell-center">
                  <span className={statusClassName(user.status)}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>
                  <div className="ops-cluster">
                    <button className="op-btn coin" title="Inject Assets" onClick={() => onAddCoins(user)}>
                      <Coins size={18} />
                    </button>
                    <button className="op-btn edit" title="Modify" onClick={() => {
                        console.log('Click: Edit User', user.id);
                        onEdit(user);
                    }}>
                      <Edit2 size={18} />
                    </button>
                    <button className="op-btn delete" title="Terminate" onClick={() => onDelete(user.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
