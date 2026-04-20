import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { CheckCircle, XCircle, UserCheck } from 'lucide-react';
import '../styles/UserManagement.css'; // Reuse table styles

const HostRegistry: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await adminService.getHosts();
      setApps(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleApprove = async (id: string) => {
    await adminService.approveHost({ application_id: id, status: 'APPROVED' });
    fetchApps();
  };

  return (
    <div className="user-management">
      <div className="header-actions">
        <h1 className="page-title">Host Registry</h1>
      </div>

      <div className="glass-container mt-6 full-width p-1">
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Experience</th>
                <th>Social Link</th>
                <th>Status</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-10 text-dim">No pending applications</td></tr>
              ) : (
                apps.map(app => (
                  <tr key={app.id} className="fade-in-item">
                    <td className="text-dim">{app.hostName}</td>
                    <td>{app.category}</td>
                    <td>{app.gmail}</td>
                    <td><span className={`status-neon ${app.status.toLowerCase()}`}>{app.status}</span></td>
                    <td>
                      <div className="action-group">
                        <button className="icon-btn" title="Approve" onClick={() => handleApprove(app.id)}>
                          <CheckCircle size={18} />
                        </button>
                        <button className="icon-btn" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostRegistry;
