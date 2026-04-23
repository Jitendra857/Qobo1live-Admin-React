import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { CheckCircle, XCircle, UserCheck, Eye, Phone, Mail, Calendar, Hash, Type } from 'lucide-react';
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
                <th>ID & WhatsApp</th>
                <th>Gmail</th>
                <th>Category</th>
                <th>Registry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-10 text-dim">No pending applications</td></tr>
              ) : (
                apps.map(app => (
                  <tr key={app.id} className="row-premium">
                    <td>
                      <div className="identity-block">
                        {app.realPhoto ? (
                          <img src={app.realPhoto} alt="" className="avatar-glass" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="avatar-glass">{app.hostName?.[0] || 'H'}</div>
                        )}
                        <div className="identity-text">
                          <span className="name-bold">{app.hostName}</span>
                          <span className="email-sub">Agency: {app.agencyCode}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Hash size={12} className="text-blue-500" /> {app.hostIdNumber}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                          <Phone size={12} /> {app.whatsapp}
                        </div>
                      </div>
                    </td>
                    <td className="data-cell-dim">
                      <div className="flex items-center gap-2">
                        <Mail size={14} /> {app.gmail}
                      </div>
                    </td>
                    <td>
                      <div className="asset-tag">
                        <Type size={14} />
                        <span>{app.category}</span>
                      </div>
                    </td>
                    <td className="data-cell">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <Calendar size={14} /> {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td><span className={`status-neon ${app.status.toLowerCase()}`}>{app.status}</span></td>
                    <td>
                      <div className="ops-cluster">
                        {app.status === 'pending' && (
                          <>
                            <button className="op-btn edit" title="Approve" onClick={() => handleApprove(app.id)}>
                              <CheckCircle size={18} />
                            </button>
                            <button className="op-btn delete" title="Reject" style={{ color: '#ef4444' }}>
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className="op-btn edit" title="View Full Profile">
                          <Eye size={18} />
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
