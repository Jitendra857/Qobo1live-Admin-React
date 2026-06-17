import React, { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import CoinModal from '../components/CoinModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isCoinModalOpen, setCoinModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const [isClearEconomyModalOpen, setClearEconomyModalOpen] = useState(false);
  const [isClearUserEconomyModalOpen, setClearUserEconomyModalOpen] = useState(false);

  const handleClearUserEconomy = (user: any) => {
    setSelectedUser(user);
    setClearUserEconomyModalOpen(true);
  };

  const confirmClearUserEconomy = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      console.log(`Initiating economy wipe for user ${selectedUser.id}...`);
      const res = await adminService.clearUserEconomyData(selectedUser.id);
      toast.success(res.data.message || 'User economy data wiped successfully.');
      fetchUsers();
      setClearUserEconomyModalOpen(false);
    } catch (err: any) {
      console.error('User wipe failed:', err);
      toast.error(err.response?.data?.message || err.message || 'User wipe failed');
    } finally {
      setLoading(false);
    }
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
      toast.error(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmClearEconomy = async () => {
    try {
      setLoading(true);
      console.log('Initiating wipe protocol for transaction history and wallet ledger balances...');
      const res = await adminService.clearEconomyData();
      toast.success(res.data.message || 'Economy data wiped successfully.');
      fetchUsers();
      setClearEconomyModalOpen(false);
    } catch (err: any) {
      console.error('Wipe protocol failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Wipe failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="user-management fade-in">
        <div className="header-actions">
          <h2 className="page-title">User Management</h2>
          <div className="top-tools">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value.trimStart();
                  setSearchTerm(val);
                  if (val.length >= 3 || val.length === 0) {
                    adminService.getUsers(val).then(res => setUsers(res.data.data || []));
                  }
                }}
              />
            </div>
            <button className="primary flex-center gap-2" style={{ background: '#ef4444' }} onClick={() => setClearEconomyModalOpen(true)}>
              <Trash2 size={18} />
              <span>Clear Economy Data</span>
            </button>
            <button className="primary flex-center gap-2" onClick={() => setCreateModalOpen(true)}>
              <UserPlus size={18} />
              <span>Create User</span>
            </button>
          </div>
        </div>

        <div className="user-table-shell">
          <UserTable 
            users={users} 
            onAddCoins={handleAddCoins} 
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onClearEconomy={handleClearUserEconomy}
            loading={loading}
          />
        </div>
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

      {isClearEconomyModalOpen && (
        <ConfirmationModal 
          title="Wipe Economy Data"
          message="You are about to delete all transaction history, agency commission logs, and reset all user coin and diamond balances to 0 for fresh testing. This cannot be undone."
          confirmText="Yes, Wipe Data"
          cancelText="Abort Wipe"
          type="danger"
          onConfirm={confirmClearEconomy}
          onClose={() => setClearEconomyModalOpen(false)}
        />
      )}

      {isClearUserEconomyModalOpen && (
        <ConfirmationModal 
          title="Wipe User Economy Data"
          message={`You are about to delete all transaction history, commission logs, and reset both coin and diamond balances to 0 for user ${selectedUser?.name || 'this user'}. This cannot be undone.`}
          confirmText="Yes, Wipe User Data"
          cancelText="Abort Wipe"
          type="danger"
          onConfirm={confirmClearUserEconomy}
          onClose={() => setClearUserEconomyModalOpen(false)}
        />
      )}
    </>
  );
};

export default UserManagement;
