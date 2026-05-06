import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, ShieldCheck } from 'lucide-react';
import '../styles/UserManagement.css';

const AgencyHub: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [agenciesRes, revenueRes] = await Promise.all([
        adminService.getAgencies(),
        adminService.getGlobalAgencyStats()
      ]);
      setAgencies(agenciesRes.data.data || []);
      setRevenue(revenueRes.data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayout = async () => {
    if (!agencies[0]) return;
    try {
      await adminService.payoutAgency({ agencyId: agencies[0].id });
      toast.success('Payout processed successfully');
      fetchData();
    } catch (err) {
      toast.error('Payout failed or no pending commissions');
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Agency Hub</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage recruitment networks and commissions</p>
        </div>
        <div className="flex gap-3">
          <button className="secondary" onClick={handlePayout}>Process Payouts</button>
          <button className="primary flex-center gap-2">
            <Plus size={18} />
            <span>Onboard Agency</span>
          </button>
        </div>
      </div>

      {revenue && (
        <div className="bento-grid mt-10" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="bento-card">
            <div className="card-label">TOTAL VOLUME</div>
            <div className="card-value">₹{(revenue.totalVolume || 0).toLocaleString()}</div>
          </div>
          <div className="bento-card">
            <div className="card-label">EARNED COMMISSIONS</div>
            <div className="card-value" style={{ color: 'var(--accent-green)' }}>₹{(revenue.earnedCommissions || 0).toLocaleString()}</div>
          </div>
          <div className="bento-card">
            <div className="card-label">PENDING PAYOUTS</div>
            <div className="card-value" style={{ color: 'var(--accent-orange)' }}>₹{(revenue.pendingCommissions || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="table-wrapper glass mt-10">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Agency Name</th>
              <th>Owner ID</th>
              <th>Agency Code</th>
              <th>Commission Rate</th>
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
                <td>{(agency.commissionRate * 100).toFixed(0)}%</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgencyHub;
