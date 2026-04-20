import React from 'react';
import { adminService } from '../services/api';
import { Gift, Package, TrendingUp } from 'lucide-react';
import '../styles/UserManagement.css';

const Economy: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPackages();
      setPackages(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  return (
    <div className="user-management">
      <div className="header-actions">
        <h1 className="page-title">Virtual Economy</h1>
        <button className="primary" onClick={handleAddPackage}><Package size={18} /> Create Package</button>
      </div>

      <div className="glass-container mt-6 full-width p-1">
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td className="name-main">{pkg.name}</td>
                  <td>{pkg.type}</td>
                  <td>{pkg.amount}</td>
                  <td>₹{pkg.price}</td>
                  <td><span className="status-neon active">{pkg.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Economy;
