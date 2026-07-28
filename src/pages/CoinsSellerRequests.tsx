import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import '../styles/UserManagement.css'; // Use the same styling as User List and Coins Sellers

interface Application {
  id: string;
  status: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    displayPicture: string;
  };
}

const CoinsSellerRequests: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/coins-seller-applications?status=${activeTab}`);
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      const response = await api.post(`/admin/coins-seller-applications/${id}/approve`);
      if (response.data.success) {
        toast.success('Application approved successfully');
        fetchApplications();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.post(`/admin/coins-seller-applications/${id}/reject`);
      if (response.data.success) {
        toast.success('Application rejected successfully');
        fetchApplications();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Coins Seller Requests</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review pending merchant applications from mobile users</p>
        </div>
        
        <div className="top-tools mt-4">
          <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
            {['pending', 'approved', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: activeTab === tab ? 'none' : '1px solid #e2e8f0',
                  background: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: '600'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container-premium mt-8">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Applicant Info</th>
              <th>Application Details</th>
              <th>Date Submitted</th>
              <th>Status</th>
              {activeTab === 'pending' && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No applications found.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="row-premium">
                  <td>
                    <div className="identity-block">
                      <div className="avatar-glass">
                        {app.user.displayPicture ? (
                           <img src={app.user.displayPicture} alt={app.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                           app.user.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div className="identity-text">
                        <span className="name-bold">{app.user.name}</span>
                        <span className="email-sub">{app.user.email || app.user.phone || 'No Contact'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.details}>
                    {app.details || 'No details provided'}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      background: app.status === 'approved' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991b1b' : '#854d0e'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  {activeTab === 'pending' && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="primary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleApprove(app.id)}
                        >
                          Approve
                        </button>
                        <button 
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleReject(app.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinsSellerRequests;
