import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


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

  // Hardcoding API base url since this is likely running on the same domain or has a setup proxy
  // But ideally it should use an axios instance if you have one.
  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/coins-seller-applications?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/admin/coins-seller-applications/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/admin/coins-seller-applications/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success('Application rejected successfully');
        fetchApplications();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  return (
    <div className="fade-in" style={{ padding: '24px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coins Seller Requests</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-paper rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {activeTab === 'pending' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={app.user.displayPicture || 'https://via.placeholder.com/40'} alt={app.user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{app.user.name}</div>
                          <div className="text-xs text-gray-500">{app.user.email || app.user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={app.details}>{app.details || '-'}</td>
                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
    </div>
  );
};

export default CoinsSellerRequests;
