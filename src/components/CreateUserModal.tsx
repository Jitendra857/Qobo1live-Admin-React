import React, { useEffect, useState } from 'react';
import { X, User, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scrollToModalTop();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null) {
          data.append(key, String(value));
        }
      });
      if (selectedFile) {
        data.append('displayPicture', selectedFile);
      }

      const res = await adminService.createUser(data);
      if (res.data.statusCode === 1) {
        toast.success('User created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || 'Creation failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(msg);
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

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Profile Picture (Optional)</label>
            <div className="file-input-wrapper" style={{ marginTop: '8px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="admin-input"
                style={{ padding: '10px' }}
              />
              {selectedFile && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '4px', fontWeight: 600 }}>
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>
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
