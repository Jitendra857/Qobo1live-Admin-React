import React, { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import CoinModal from '../components/CoinModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserHistoryModal from '../components/UserHistoryModal';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCoinModalOpen, setCoinModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  
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

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === users.length && users.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

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

  const handleForceLogout = async (user: any) => {
    if (!window.confirm(`Are you sure you want to forcibly log out ${user.name || 'this user'} from the mobile app? Any active live stream or room will also be shut down.`)) return;
    try {
      await adminService.forceLogoutUser(user.id);
      toast.success(`User ${user.name || ''} forcibly logged out from mobile session`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to log out user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShutdownStream = async (user: any) => {
    const streamId = user.activeLiveStream?.id || user.activeLiveStream?.liveStreamingId;
    if (!streamId) return;
    if (!window.confirm(`Are you sure you want to forcibly shut down ${user.name || 'this user'}'s active live stream? All viewers will be disconnected immediately.`)) return;
    try {
      await adminService.shutdownLiveStream(streamId);
      toast.success(`Live stream of ${user.name || 'user'} shut down successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to shut down live stream: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShutdownRoom = async (user: any) => {
    const roomId = user.activeRoom?.id;
    if (!roomId) return;
    if (!window.confirm(`Are you sure you want to forcibly shut down ${user.name || 'this user'}'s active audio room? All participants will be disconnected immediately.`)) return;
    try {
      await adminService.shutdownRoom(roomId);
      toast.success(`Audio room of ${user.name || 'user'} shut down successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to shut down room: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await adminService.deleteUser(selectedUser.id);
      setSelectedUserIds(prev => prev.filter(id => id !== selectedUser.id));
      fetchUsers();
      setDeleteModalOpen(false);
      toast.success('User permanently deleted');
    } catch (err: any) {
      console.error('Termination failure:', err);
      const errMsg = err.response?.data?.message || err.message || 'Delete failed';
      setDeleteModalOpen(false);
      setErrorPopupMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedUserIds.map(id => adminService.deleteUser(id))
      );
      const successfulCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;

      if (failedCount === 0) {
        toast.success(`Successfully removed ${successfulCount} selected user(s).`);
      } else {
        toast.error(`Purged ${successfulCount} user(s). Failed for ${failedCount} user(s).`);
      }

      setSelectedUserIds([]);
      setBulkDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Bulk termination failure:', err);
      const errMsg = err.response?.data?.message || err.message || 'Bulk delete failed';
      setBulkDeleteModalOpen(false);
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
          <div className="top-tools" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectedUserIds.length > 0 && (
              <button 
                onClick={() => setBulkDeleteModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '0px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                title="Remove selected users"
              >
                <Trash2 size={18} />
                <span>Delete Selected ({selectedUserIds.length})</span>
              </button>
            )}

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
            onForceLogout={handleForceLogout}
            onShutdownStream={handleShutdownStream}
            onShutdownRoom={handleShutdownRoom}
            loading={loading}
            selectedUserIds={selectedUserIds}
            onToggleSelectUser={handleToggleSelectUser}
            onToggleSelectAll={handleToggleSelectAll}
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

      {isBulkDeleteModalOpen && (
        <ConfirmationModal 
          title="Bulk Security Override Required"
          message={`You are about to permanently purge ${selectedUserIds.length} selected user identities from the Qobo1 ecosystem. This action cannot be undone.`}
          confirmText={`Purge (${selectedUserIds.length}) Users`}
          cancelText="Abort Operation"
          type="danger"
          onConfirm={confirmBulkDelete}
          onClose={() => setBulkDeleteModalOpen(false)}
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
