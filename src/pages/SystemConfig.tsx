import React from 'react';
import { adminService } from '../services/api';
import { Shield, Settings, Tv } from 'lucide-react';
import '../styles/UserManagement.css';

const SystemConfig: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAds();
      setAds(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  return (
    <div className="user-management">
      <div className="header-actions">
        <h1 className="page-title">System Configuration</h1>
      </div>

      <div className="glass-container mt-6 full-width p-1">
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Ad Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id}>
                  <td className="name-main">{ad.title}</td>
                  <td><span className="badge-outline">{ad.type}</span></td>
                  <td><span className="status-neon active">{ad.status}</span></td>
                  <td><button className="icon-btn"><Settings size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
