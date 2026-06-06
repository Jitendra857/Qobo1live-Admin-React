import React, { useEffect, useState } from 'react';
import { X, User, Mail, ShieldCheck, UserPlus, Plus, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/Modal.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';
import MediaImage from './MediaImage';

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
      <form 
        onSubmit={handleSubmit} 
        className="modal-content glass-panel slide-up create-user-modal" 
        style={{ maxWidth: '500px' }}
      >
        <div className="modal-header">
          <h3>Provision User Identity</h3>
          <button className="close-btn" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="modal-grid-2">
            <div className="form-group" style={{ marginBottom: '0px' }}>
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

            <div className="form-group" style={{ marginBottom: '0px' }}>
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

            <div className="form-group" style={{ marginBottom: '0px' }}>
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

            <div className="form-group" style={{ marginBottom: '0px' }}>
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

            <div className="form-group span-2" style={{ marginBottom: '0px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ImageIcon size={14} /> Profile Picture
              </label>
              <div className="flex items-center gap-6 mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <MediaImage 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : undefined} 
                  className="avatar-glass shadow-2xl" 
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '18px', border: '2px dashed rgba(255,255,255,0.1)' }}
                  fallbackText={formData.name?.[0] || 'U'}
                />
                <div className="flex-1">
                  <label 
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'var(--accent-blue)', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    <Plus size={14} /> {selectedFile ? 'Change Photo' : 'Upload Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button 
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '8px', fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      Cancel Upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="secondary-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-btn" 
            disabled={loading}
          >
            <UserPlus size={20} />
            <span>{loading ? 'Generating...' : 'Confirm Provisioning'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserModal;
