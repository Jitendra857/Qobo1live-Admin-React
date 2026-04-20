import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Users, Plus, ShieldCheck } from 'lucide-react';
import '../styles/UserManagement.css';

const AgencyHub: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAgencies().then(res => {
      setAgencies(res.data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Agency Hub</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage recruitment networks</p>
        </div>
        <button className="primary flex-center gap-2">
          <Plus size={18} />
          <span>Onboard Agency</span>
        </button>
      </div>

      <div className="table-wrapper glass mt-10">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Agency Name</th>
              <th>Owner ID</th>
              <th>Agency Code</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr key={agency.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{agency.name}</div>
                </td>
                <td>{agency.ownerId}</td>
                <td>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{agency.code}</span>
                </td>
                <td>
                  <span className={`status-neon ${agency.status === 'active' ? 'active' : ''}`}>
                    {agency.status}
                  </span>
                </td>
                <td>
                  <button className="icon-btn"><ShieldCheck size={16} /></button>
                </td>
              </tr>
            ))}
            {agencies.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                  No agencies linked to the ecosystem yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgencyHub;
