import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, ShieldCheck, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Wallet, ArrowRight, Info, HelpCircle } from 'lucide-react';
import '../styles/UserManagement.css';

const AgencyHub: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFlowModal, setShowFlowModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const canApprove = currentUser?.role === 'super_admin';

  const fetchData = async () => {
    try {
      setLoading(true);
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
    if (agencies.length === 0) {
      toast.error('No agencies available to process payouts');
      return;
    }
    try {
      await adminService.payoutAgency({ agencyId: agencies[0].id });
      toast.success('Payout processed successfully');
      fetchData();
    } catch (err) {
      toast.error('Payout failed or no pending commissions');
    }
  };

  const handleApprove = async (agencyId: string, status: 'active' | 'rejected') => {
    try {
      const res = await adminService.approveAgency({ agency_id: agencyId, status });
      if (res.data.statusCode === 1) {
        toast.success(`Agency ${status === 'active' ? 'Approved' : 'Rejected'} successfully`);
        fetchData();
      } else {
        toast.error(res.data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Error approving agency');
    }
  };

  return (
    <div className="user-management fade-in" style={{ position: 'relative' }}>
      {/* Scoped CSS Inject for Luxury Modern Aesthetics */}
      <style>{`
        /* Floating & Pulse Animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        /* Stats Cards Overhaul */
        .stats-deck-modern {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        @media (max-width: 992px) {
          .stats-deck-modern { grid-template-columns: 1fr; }
        }
        .stat-card-luxury {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .stat-card-luxury::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: transparent;
          transition: all 0.3s ease;
        }
        .stat-card-luxury.blue::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .stat-card-luxury.green::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .stat-card-luxury.orange::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        .stat-card-luxury:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.95);
        }
        .stat-icon-container {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }
        .stat-card-luxury:hover .stat-icon-container {
          transform: scale(1.1) rotate(5deg);
        }
        .stat-icon-container.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .stat-icon-container.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-icon-container.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .stat-meta-group { display: flex; flex-direction: column; }
        .stat-label-modern {
          font-size: 0.75rem;
          font-weight: 800;
          color: #8b9bb4;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .stat-value-modern {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        /* Beautiful Empty State */
        .empty-state-luxury {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-glow-orb {
          width: 80px;
          height: 80px;
          border-radius: 28px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          margin-bottom: 24px;
          animation: float 4s ease-in-out infinite, pulseGlow 2.5s infinite;
        }
        .empty-headline {
          font-size: 1.45rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .empty-description {
          font-size: 0.92rem;
          color: #64748b;
          max-width: 480px;
          line-height: 1.6;
          margin-bottom: 36px;
        }

        /* Flow Diagram Steps */
        .flow-diagram-horizontal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
          width: 100%;
          max-width: 800px;
        }
        @media (max-width: 768px) {
          .flow-diagram-horizontal { flex-direction: column; gap: 16px; }
          .flow-arrow-icon { transform: rotate(90deg); }
        }
        .flow-step-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .flow-step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .flow-step-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 6px;
        }
        .flow-step-desc {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          line-height: 1.4;
        }
        .flow-arrow-icon { color: #94a3b8; }

        /* General Customizations */
        .page-title-lux {
          font-size: 2.2rem;
          font-weight: 950;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .status-neon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          font-size: 0.72rem !important;
          font-weight: 800 !important;
          padding: 6px 14px !important;
          border-radius: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          white-space: nowrap !important;
        }
        .status-neon.pending {
          background: rgba(245, 158, 11, 0.1) !important;
          color: #f59e0b !important;
          border: 1px solid rgba(245, 158, 11, 0.2) !important;
        }
        .status-neon.active {
          background: rgba(16, 185, 129, 0.1) !important;
          color: #10b981 !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
        }
        .status-neon.rejected {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
        }
        .owner-id-badge {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.8rem;
          color: #475569;
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-weight: 700;
          display: inline-block;
          letter-spacing: 0.5px;
        }
        .agency-code-badge {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          font-size: 0.85rem;
          color: #1d4ed8;
          background: rgba(59, 130, 246, 0.05);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.15);
          font-weight: 800;
          display: inline-block;
          letter-spacing: 0.5px;
        }
        .commission-badge {
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          background: rgba(16, 185, 129, 0.03);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.08);
          display: inline-block;
        }

        /* Premium Table Perfect Alignment Overrides */
        .premium-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 12px !important;
          margin-top: 0 !important;
        }
        .premium-table th {
          padding: 16px 24px !important;
          font-size: 0.75rem !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          color: #64748b !important;
          letter-spacing: 0.1em !important;
          border: none !important;
          vertical-align: middle !important;
        }
        .premium-table td {
          padding: 16px 24px !important;
          background: #ffffff !important;
          border-top: 1px solid #f1f5f9 !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #334155 !important;
          vertical-align: middle !important;
          height: 72px !important;
        }
        .premium-table td:first-child {
          border-left: 1px solid #f1f5f9 !important;
          border-top-left-radius: 16px !important;
          border-bottom-left-radius: 16px !important;
        }
        .premium-table td:last-child {
          border-right: 1px solid #f1f5f9 !important;
          border-top-right-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
        }
        .premium-table tr {
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.01) !important;
          transition: all 0.25s ease !important;
        }
        .premium-table tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03) !important;
        }
        .premium-table tbody tr:hover td {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }

        /* Flow Modal Styling */
        .flow-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease;
        }
        .flow-modal-box {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 600px;
          padding: 36px;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.3);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Header Actions */}
      <div className="header-actions">
        <div>
          <h2 className="page-title-lux">Agency Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 550 }}>Manage recruitment networks and commission statistics</p>
        </div>
        <div className="flex gap-3">
          <button className="secondary flex-center gap-2" onClick={handlePayout} style={{ borderRadius: '12px', fontWeight: 700 }}>
            <Wallet size={16} />
            <span>Process Payouts</span>
          </button>
          <button className="primary flex-center gap-2" onClick={() => setShowFlowModal(true)} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
            <Plus size={18} />
            <span>Onboard Agency</span>
          </button>
        </div>
      </div>

      {/* Modern Stats deck */}
      {revenue && (
        <div className="stats-deck-modern">
          <div className="stat-card-luxury blue">
            <div className="stat-icon-container blue">
              <TrendingUp size={24} />
            </div>
            <div className="stat-meta-group">
              <span className="stat-label-modern">Total Volume</span>
              <span className="stat-value-modern">₹{(revenue.totalVolume || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card-luxury green">
            <div className="stat-icon-container green">
              <DollarSign size={24} />
            </div>
            <div className="stat-meta-group">
              <span className="stat-label-modern">Earned Commissions</span>
              <span className="stat-value-modern">₹{(revenue.earnedCommissions || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card-luxury orange">
            <div className="stat-icon-container orange">
              <AlertCircle size={24} />
            </div>
            <div className="stat-meta-group">
              <span className="stat-label-modern">Pending Payouts</span>
              <span className="stat-value-modern">₹{(revenue.pendingCommissions || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table / Elegant Empty State Wrapper */}
      {loading ? (
        <div className="glass flex-center" style={{ height: '300px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
          <div className="text-center">
            <div className="spin" style={{ display: 'inline-block', marginBottom: '16px', color: '#3b82f6' }}>
              <ShieldCheck size={36} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading Agency Records...</p>
          </div>
        </div>
      ) : agencies.length === 0 ? (
        /* Premium Empty State & Onboarding Flow Guide */
        <div className="empty-state-luxury fade-in">
          <div className="empty-glow-orb">
            <Users size={36} />
          </div>
          <h3 className="empty-headline">Active Recruitment Ledger is Empty</h3>
          <p className="empty-description">
            There are currently no active or pending agencies in the ledger. Real-time registrations happen from the mobile side and queue up here automatically.
          </p>

          {/* Interactive Flow Diagram */}
          <div className="flow-diagram-horizontal">
            <div className="flow-step-card">
              <div className="flow-step-num">1</div>
              <span className="flow-step-title">Mobile Registration</span>
              <p className="flow-step-desc">User registers a recruitment agency within the mobile application.</p>
            </div>
            <ArrowRight size={20} className="flow-arrow-icon" />
            <div className="flow-step-card" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.02)' }}>
              <div className="flow-step-num" style={{ background: '#f59e0b' }}>2</div>
              <span className="flow-step-title">Verification Needed</span>
              <p className="flow-step-desc">Application enters as "Pending". Admin verifies details for security compliance.</p>
            </div>
            <ArrowRight size={20} className="flow-arrow-icon" />
            <div className="flow-step-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.02)' }}>
              <div className="flow-step-num" style={{ background: '#10b981' }}>3</div>
              <span className="flow-step-title">Ledger Onboarded</span>
              <p className="flow-step-desc">Super admin approves the agency, generating a live recruitment link.</p>
            </div>
          </div>

          <button className="primary flex-center gap-2" onClick={() => setShowFlowModal(true)} style={{ padding: '14px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', fontWeight: 800 }}>
            <Plus size={18} />
            <span>Simulate Onboard Sequence</span>
          </button>
        </div>
      ) : (
        /* Premium Table Grid */
        <div className="table-wrapper glass mt-6" style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '8px', overflow: 'hidden' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '25%' }}>Agency Name</th>
                <th style={{ textAlign: 'left', width: '22%' }}>Owner Details</th>
                <th style={{ textAlign: 'center', width: '15%' }}>Agency Code</th>
                <th style={{ textAlign: 'center', width: '14%' }}>Commission Rate</th>
                <th style={{ textAlign: 'center', width: '12%' }}>Status</th>
                <th style={{ textAlign: 'right', width: '12%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id} className="row-premium">
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifycontent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.05)',
                        justifyContent: 'center'
                      }}>
                        {agency.name ? agency.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', lineHeight: '1.2' }}>{agency.name}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                          Talent Network
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    {agency.owner ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>{agency.owner.name || 'Unnamed Owner'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 550 }}>
                          {agency.owner.phone || agency.owner.email}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="owner-id-badge" title={agency.ownerId || 'System Assigned'}>
                          {agency.ownerId ? `${agency.ownerId.slice(0, 8)}...` : 'System Owned'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className="agency-code-badge">{agency.code}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className="commission-badge">{(agency.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className={`status-neon ${agency.status}`}>
                        {agency.status === 'pending' ? <AlertCircle size={12} /> : <ShieldCheck size={12} />}
                        <span>{agency.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="ops-cluster" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      {agency.status === 'pending' && canApprove ? (
                        <>
                          <button 
                            className="op-btn edit" 
                            onClick={() => handleApprove(agency.id, 'active')}
                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Approve Agency"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            className="op-btn delete" 
                            onClick={() => handleApprove(agency.id, 'rejected')}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Reject Agency"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <button 
                          className="op-btn edit" 
                          style={{ opacity: 0.4, cursor: 'not-allowed', background: 'rgba(148, 163, 184, 0.05)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                          title="Protected Node"
                          disabled
                        >
                          <ShieldCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Elegant Informational & Simulation Flow Modal */}
      {showFlowModal && (
        <div className="flow-modal-overlay">
          <div className="flow-modal-box">
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Onboarding Protocol</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>How talent networks join the platform</span>
                </div>
              </div>
              <button 
                onClick={() => setShowFlowModal(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                To maintain database integrity, agencies are registered directly by mobile users using their secure user profiles. Manual creation from this dashboard is disabled to protect owner associations.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={16} style={{ color: '#3b82f6' }} />
                  <span>How to Register an Agency:</span>
                </h4>
                <ol style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                  <li><strong>Mobile Register</strong>: A user submits the registration form inside the mobile app.</li>
                  <li><strong>Verification Queue</strong>: The agency immediately registers as <span style={{ color: '#f59e0b', fontWeight: 700 }}>Pending</span> and displays here.</li>
                  <li><strong>Verification & Live Activation</strong>: A Super Admin reviews the application and clicks <span style={{ color: '#10b981', fontWeight: 700 }}>Approve</span> to assign their recruitment code.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                <ShieldCheck size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
                  Role Check: Standard Admins can track agency statuses, but only Super Admins can authorize approvals.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="secondary" onClick={() => setShowFlowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                Dismiss
              </button>
              <button 
                className="primary" 
                onClick={() => {
                  setShowFlowModal(false);
                  toast.success('Ready for mobile registration payloads.');
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: '#3b82f6' }}
              >
                Acknowledge Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyHub;
