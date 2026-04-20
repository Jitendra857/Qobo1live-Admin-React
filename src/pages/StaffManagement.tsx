import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Shield, UserPlus, Lock, Mail } from 'lucide-react';
import '../styles/UserManagement.css';

const StaffManagement: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdmins().then(res => {
      setAdmins(res.data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Staff Authority</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage administrative roles and permissions</p>
        </div>
        <button className="primary flex-center gap-2">
          <UserPlus size={18} />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bento-grid mt-10">
        {admins.map((admin) => (
          <div key={admin.id} className="bento-card">
            <div className="card-top">
              <div className="card-label" style={{ color: admin.role === 'super_admin' ? 'var(--accent-purple)' : 'var(--text-secondary)' }}>
                {admin.role.toUpperCase()}
              </div>
              <div className="card-icon-wrap" style={{ color: admin.role === 'super_admin' ? 'var(--accent-purple)' : 'var(--accent-blue)' }}>
                <Shield size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{admin.name || 'Admin User'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
                <Mail size={14} /> {admin.email}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="icon-btn"><Lock size={16} /></button>
                <button className="icon-btn" title="View Audit Log"><Shield size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {admins.length === 0 && (
          <div className="bento-card wide" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Retrieving staff directory...
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
