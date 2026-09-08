import React, { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import CoinModal from '../components/CoinModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserHistoryModal from '../components/UserHistoryModal';
import { UserPlus, Search } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isCoinModalOpen, setCoinModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // History Modal State
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<any>(null);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorPopupMessage, setErrorPopupMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to synchronize user demographic data.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddCoins = (user: any) => {
    setSelectedUser(user);
    setCoinModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedUser({ id });
    setDeleteModalOpen(true);
  };

  const handleViewHistory = (user: any) => {
    setSelectedHistoryUser(user);
    setHistoryModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await adminService.deleteUser(selectedUser.id);
      fetchUsers();
      setDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Termination failure:', err);
      const errMsg = err.response?.data?.message || err.message || 'Delete failed';
      setDeleteModalOpen(false);
      setErrorPopupMessage(errMsg);
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
            onViewHistory={handleViewHistory}
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

      {isHistoryModalOpen && selectedHistoryUser && (
        <UserHistoryModal
          user={selectedHistoryUser}
          onClose={() => setHistoryModalOpen(false)}
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

      {errorPopupMessage && (
        <ConfirmationModal 
          title="Operation Failed"
          message={errorPopupMessage}
          confirmText="Acknowledge"
          type="danger"
          onConfirm={() => setErrorPopupMessage(null)}
          onClose={() => setErrorPopupMessage(null)}
        />
      )}
    </>
  );
};

export default UserManagement;
