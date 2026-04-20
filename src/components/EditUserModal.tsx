import React, { useState, useEffect } from 'react';
import { X, User, Mail, ShieldCheck, Save, AlertCircle } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Modal.css';

interface EditUserModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    status: user.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminService.updateUser(user.id, formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      } else {
        alert(`Update Failed: ${res.data.message}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      alert(`Modification Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel slide-up" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>Modify Account: {user.name}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label><User size={14} /> Name</label>
            <input 
              type="text" 
              className="admin-input" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label><Mail size={14} /> Email</label>
            <input 
              type="email" 
              className="admin-input" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label><AlertCircle size={14} /> Status</label>
            <select 
              className="admin-input"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label><ShieldCheck size={14} /> Role</label>
            <select 
              className="admin-input"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="primary-btn w-full flex-center gap-2" 
            disabled={loading}
          >
            <Save size={18} />
            <span>{loading ? 'Synchronizing...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
