import React, { useEffect, useState } from 'react';
import { X, User, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Modal.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: 'Password123!' // Default fallback
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scrollToModalTop();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminService.createUser(formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      } else {
        alert(`Creation Blocked: ${res.data.message}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      alert(`Provisioning Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay create-user-overlay">
      <div className="modal-content glass-panel slide-up create-user-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Provision User Identity</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '18px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>
              <User size={16} color="var(--accent-blue)" /> Name
            </label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Full display name"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>
              <Mail size={16} color="var(--accent-blue)" /> Email Address
            </label>
            <input 
              type="email" 
              className="admin-input" 
              placeholder="user@qobo1.com"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>
              <User size={16} color="var(--accent-blue)" /> Phone Number
            </label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="+91 98765 43210"
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>
              <ShieldCheck size={16} color="var(--accent-blue)" /> Assign Role
            </label>
            <select 
              className="admin-input"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">Standard User</option>
              <option value="host">Live Host</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="primary-btn w-full flex-center gap-2" 
            disabled={loading}
          >
            <UserPlus size={20} />
            <span>{loading ? 'Generating Identity...' : 'Confirm Provisioning'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
