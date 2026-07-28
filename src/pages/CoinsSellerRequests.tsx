import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLayout } from '../context/LayoutContext';

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
  const { headerHeight } = useLayout();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(http://localhost:5000/api/admin/coins-seller-applications?status=, {
        headers: { Authorization: Bearer  }
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
      const token = localStorage.getItem('token');
      const response = await axios.post(http://localhost:5000/api/admin/coins-seller-applications//approve, {}, {
        headers: { Authorization: Bearer  }
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
      const token = localStorage.getItem('token');
      const response = await axios.post(http://localhost:5000/api/admin/coins-seller-applications//reject, {}, {
        headers: { Authorization: Bearer  }
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
    <div style={{ marginTop: headerHeight, padding: '24px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coins Seller Requests</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={px-4 py-2 font-medium capitalize }
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
                      <span className={px-2 py-1 rounded-full text-xs font-medium capitalize }>
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
