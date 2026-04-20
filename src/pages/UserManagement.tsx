import React, { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import CoinModal from '../components/CoinModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserPlus, Search, RefreshCw } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isCoinModalOpen, setCoinModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from administrative gateway...');
      const res = await adminService.getUsers();
      setUsers(res.data.data || []);
      console.log(`Successfully retrieved ${res.data.data?.length || 0} user identities.`);
    } catch (err) {
      console.error('CRITICAL: Failed to synchronize user demographic data.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddCoins = (user: any) => {
    console.log('Action: Initiating asset injection for user:', user.id);
    setSelectedUser(user);
    setCoinModalOpen(true);
  };

  const handleEdit = (user: any) => {
    console.log('Action: Initiating identity modification for user:', user.id);
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    console.log('Action: Initiating termination protocol for user:', id);
    setSelectedUser({ id });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      console.log('Verifying termination for user:', selectedUser.id);
      await adminService.deleteUser(selectedUser.id);
      console.log('Identity purged successfully.');
      fetchUsers();
      setDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Termination failure:', err);
      alert(`Termination Protocol Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <h2 className="page-title">User Management</h2>
        <div className="top-tools">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or registry..." 
              onChange={(e) => {
                const val = e.target.value;
                if (val.length >= 3 || val.length === 0) {
                  adminService.getUsers(val).then(res => setUsers(res.data.data || []));
                }
              }}
            />
          </div>
          <button className="primary flex-center gap-2" onClick={() => setCreateModalOpen(true)}>
            <UserPlus size={18} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      <div className="glass mt-10 p-1" style={{ width: '100%', overflow: 'hidden' }}>
        <UserTable 
          users={users} 
          onAddCoins={handleAddCoins} 
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {isCoinModalOpen && (
        <CoinModal 
          user={selectedUser} 
          onClose={() => setCoinModalOpen(false)} 
          onSuccess={() => fetchUsers()} 
        />
      )}

      {isCreateModalOpen && (
        <CreateUserModal 
          onClose={() => setCreateModalOpen(false)} 
          onSuccess={() => fetchUsers()} 
        />
      )}

      {isEditModalOpen && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => fetchUsers()}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal 
          title="Security Override Required"
          message="You are about to permanently purge this user identity from the Qobo1 ecosystem. This action cannot be undone."
          confirmText="Verify & Delete"
          cancelText="Abort Operation"
          type="danger"
          onConfirm={confirmDelete}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
