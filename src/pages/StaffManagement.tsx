import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  Shield, UserPlus, Lock, Mail, Trash2, Edit3, 
  Search, Power, Key, Users, CheckCircle, XCircle, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const StaffManagement: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sub_admin');
  const [status, setStatus] = useState('active');

  // Delete confirmation modal state
  const [adminToDelete, setAdminToDelete] = useState<any>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAdmins();
      setAdmins(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load administrative staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenModal = (mode: 'create' | 'edit', admin?: any) => {
    setModalMode(mode);
    if (mode === 'edit' && admin) {
      setSelectedAdmin(admin);
      setName(admin.name || '');
      setEmail(admin.email || '');
      setPassword(''); // keep blank unless modifying
      setRole(admin.role || 'sub_admin');
      setStatus(admin.status || 'active');
    } else {
      setSelectedAdmin(null);
      setName('');
      setEmail('');
      setPassword('');
      setRole('sub_admin');
      setStatus('active');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    if (modalMode === 'create' && !password) {
      toast.error('Password is required for new accounts.');
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status
      };

      if (password) {
        payload.password = password;
      }

      if (modalMode === 'create') {
        await adminService.manageAdmin('create', payload);
        toast.success(`Staff member '${name}' successfully onboarded.`);
      } else {
        await adminService.manageAdmin('update', payload, selectedAdmin.id);
        toast.success(`Administrative credentials for '${name}' updated.`);
      }
      
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action rejected by security node.');
    }
  };

  const handleToggleStatus = async (admin: any) => {
    const nextStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.manageAdmin('update', { status: nextStatus }, admin.id);
      toast.success(`Access authorization set to ${nextStatus.toUpperCase()} for ${admin.name}`);
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change authorization status.');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      await adminService.manageAdmin('delete', {}, adminToDelete.id);
      toast.success(`Staff record for '${adminToDelete.name}' successfully purged.`);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error('Declassification failed. Record could not be removed.');
    }
  };

  const filteredAdmins = admins.filter(admin => 
    (admin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalCount = admins.length;
  const activeCount = admins.filter(a => a.status === 'active').length;
  const inactiveCount = admins.filter(a => a.status !== 'active').length;

  return (
    <div className="user-management fade-in tasks-page">
      {/* Premium Header */}
      <div className="header-actions">
        <div>
          <h2 className="page-title">Staff Authority</h2>
          <p className="subtitle">Manage administrative credentials, system roles, and node permissions</p>
        </div>
        <button className="primary flex-center gap-2" onClick={() => handleOpenModal('create')}>
          <UserPlus size={18} />
          <span>Onboard Staff</span>
        </button>
      </div>

      {/* Row 1: Spacing and metrics */}
      <div className="stats-row mb-6">
        <div className="stat-card">
          <div className="stat-info">
            <span className="label label-blue">TOTAL ROSTER</span>
            <span className="value">{totalCount}</span>
          </div>
          <div className="stat-icon">
            <Users size={32} color="#94a3b8" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="label label-green">ACTIVE OVERSEERS</span>
            <span className="value">{activeCount}</span>
          </div>
          <div className="stat-icon">
            <CheckCircle size={32} color="#10b981" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="label label-gray">DEACTIVATED NODES</span>
            <span className="value">{inactiveCount}</span>
          </div>
          <div className="stat-icon">
            <XCircle size={32} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="table-header-row mb-6">
        <div className="search-bar compact" style={{ maxWidth: '400px', width: '100%' }}>
          <Search size={18} />
          <input 
            placeholder="Search by name or email signature..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Roster Grid */}
      {loading ? (
        <div className="flex-center py-20" style={{ color: '#475569', fontWeight: 700 }}>
          Retrieving secure staff catalog...
        </div>
      ) : (
        <div className="bento-grid">
          {filteredAdmins.map((admin) => (
            <div key={admin.id} className="bento-card-premium" style={{ height: 'auto', minHeight: '300px' }}>
              <div className="card-payload">
                <div className="card-top-identity">
                  <span className={`card-type-badge ${
                    admin.role === 'super_admin' ? 'one_time' : 
                    admin.role === 'sub_admin' ? 'weekly' : 'daily'
                  }`}>
                    {admin.role.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`status-pill ${admin.status === 'active' ? 'active' : ''}`}>
                      {admin.status}
                    </span>
                  </div>
                </div>

                <h4 className="mission-title-highdef" style={{ margin: '10px 0 5px 0' }}>
                  {admin.name || 'Admin Node'}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <Mail size={14} /> <span>{admin.email}</span>
                </div>

                <div className="border-t pt-4 mt-auto">
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Access Protocols
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem' }}>
                    {admin.role === 'admin' && (
                      <>
                        <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px' }}>FULL_ROOT_ACCESS</span>
                        <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px' }}>ALL_MENUS</span>
                      </>
                    )}
                    {admin.role === 'super_admin' && (
                      <>
                        <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px' }}>AGENCY_APPROVAL</span>
                        <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px' }}>HOST_APPROVAL</span>
                      </>
                    )}
                    {admin.role === 'user' && (
                      <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px' }}>NO_ACCESS</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="card-action-bar-glass">
                <button 
                  className="op-btn edit" 
                  title="Toggle Authorization Status" 
                  onClick={() => handleToggleStatus(admin)}
                  style={{ color: admin.status === 'active' ? '#ef4444' : '#10b981' }}
                >
                  <Power size={16} />
                </button>
                
                <div className="action-set">
                  <button 
                    className="op-btn edit" 
                    title="Modify Admin Account" 
                    onClick={() => handleOpenModal('edit', admin)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="op-btn delete" 
                    title="Revoke Admin Credentials" 
                    onClick={() => setAdminToDelete(admin)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredAdmins.length === 0 && (
            <div className="bento-card wide empty-state col-span-full">
              <div className="empty-content">
                <Shield size={64} className="empty-icon-ghost" />
                <p className="empty-text">No administrative accounts match your search parameters.</p>
                <button className="primary mt-6" onClick={() => handleOpenModal('create')}>Create New Authority</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboard / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '0px', border: '1px solid #0f172a', padding: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              {modalMode === 'create' ? 'Onboard Staff Member' : 'Modify Credentials'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Assign roles and direct node authority credentials.
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group mb-4">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Johnathan Vance"
                  required
                  style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700 }}
                />
              </div>

              <div className="form-group mb-4">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. j.vance@qobo1.com"
                  required
                  style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700 }}
                />
              </div>

              <div className="form-group mb-4">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Password {modalMode === 'edit' && '(Leave blank to retain current)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={modalMode === 'create' ? 'Set security password' : '••••••••'}
                    required={modalMode === 'create'}
                    style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700 }}
                  />
                  <Key size={16} style={{ position: 'absolute', right: '14px', top: '15px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group mb-4">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Administrative Role
                </label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700, background: '#fff' }}
                >
                  <option value="admin">Admin (All Menu Rights)</option>
                  <option value="super_admin">Super Admin (Agency & Host Only)</option>
                  <option value="user">User (No Menu Access)</option>
                </select>
              </div>

              <div className="form-group mb-6">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Access Authorization
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ borderRadius: '0px', border: '1px solid #cbd5e1', padding: '12px', width: '100%', fontWeight: 700, background: '#fff' }}
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="inactive">Inactive (Access Suspended)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)} style={{ borderRadius: '0px' }}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ borderRadius: '0px' }}>
                  {modalMode === 'create' ? 'Initialize Staff' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {adminToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '0px', border: '1px solid #ef4444', padding: '30px', maxWidth: '450px' }}>
            <div className="flex-center" style={{ color: '#ef4444', marginBottom: '16px' }}>
              <AlertTriangle size={48} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: '8px' }}>
              Revoke Node Authority?
            </h3>
            
            <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' }}>
              You are about to permanently purge the administrative credentials for <strong>{adminToDelete.name}</strong> ({adminToDelete.email}). This action is irreversible.
            </p>

            <div className="flex justify-center gap-3 pt-4 border-t">
              <button className="secondary" onClick={() => setAdminToDelete(null)} style={{ borderRadius: '0px' }}>
                Retain Access
              </button>
              <button className="primary" onClick={handleDeleteAdmin} style={{ borderRadius: '0px', background: '#ef4444', borderColor: '#ef4444' }}>
                Revoke & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
