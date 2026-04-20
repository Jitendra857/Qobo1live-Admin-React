import React from 'react';
import { Edit2, Trash2, Coins, ShieldCheck } from 'lucide-react';

interface UserTableProps {
  users: any[];
  onAddCoins: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onAddCoins, onEdit, onDelete }) => {
  return (
    <div className="table-container-premium">
      <table className="modern-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>User Entity</th>
            <th style={{ width: '15%' }}>Connectivity</th>
            <th style={{ width: '15%' }}>Assets</th>
            <th style={{ width: '10%' }}>Level</th>
            <th style={{ width: '10%' }}>Status</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Operations</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                No demographic data recovered.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="row-premium">
                <td>
                  <div className="identity-block">
                    <div className="avatar-glass">{user.name?.[0] || 'U'}</div>
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
                    <span>{user.coins?.toLocaleString() || 0}</span>
                  </div>
                </td>
                <td className="data-cell">
                  <span className="rank-badge">Lvl {user.level || 1}</span>
                </td>
                <td className="data-cell">
                  <span className={`status-pill ${user.status || 'active'}`}>
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
