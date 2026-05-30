import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { MessageSquare, AlertCircle, CheckCircle, ShieldAlert, KeyRound, UserCheck, HelpCircle, UserX } from 'lucide-react';
import MediaImage from '../components/MediaImage';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const SupportDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'helpdesk'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [helpTickets, setHelpTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, helpRes] = await Promise.all([
        adminService.getTickets(),
        adminService.getHelpTickets()
      ]);
      setReports(reportsRes.data.data || []);
      setHelpTickets(helpRes.data.data || []);
    } catch (err) {
      console.error('Failed to synchronize support desk registry:', err);
      toast.error('Sync failure: Support desk registry unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveReport = async (id: string) => {
    const toastId = toast.loading('Resolving surveillance report...');
    try {
      await adminService.resolveTicket(id);
      toast.success('Surveillance report resolved successfully', { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve report', { id: toastId });
    }
  };

  const handleResolveHelpTicket = async (id: string, userName: string) => {
    const toastId = toast.loading(`Activating user account & resolving ticket for ${userName}...`);
    try {
      await adminService.resolveHelpTicket(id);
      toast.success(`Account for ${userName} has been successfully ACTIVATED!`, { id: toastId, duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate account', { id: toastId });
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Support & Help Desk</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Moderate community reports and account re-activation requests</p>
        </div>
      </div>

      {/* Premium Tabbed Navigation Switcher */}
      <div className="flex gap-4 mt-8 border-b border-white/5 pb-1">
        <button 
          className={`tab-btn-modern ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: activeTab === 'reports' ? 'rgba(59,130,246,0.1)' : 'transparent',
            color: activeTab === 'reports' ? '#3b82f6' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldAlert size={16} />
          <span>Surveillance Reports ({reports.length})</span>
        </button>
        <button 
          className={`tab-btn-modern ${activeTab === 'helpdesk' ? 'active' : ''}`}
          onClick={() => setActiveTab('helpdesk')}
          style={{
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: activeTab === 'helpdesk' ? 'rgba(16,185,129,0.1)' : 'transparent',
            color: activeTab === 'helpdesk' ? '#10b981' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <KeyRound size={16} />
          <span>Account Re-activations ({helpTickets.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="glass flex-center mt-10" style={{ height: '300px', borderRadius: '24px' }}>
          <div className="text-center">
            <div className="spin" style={{ display: 'inline-block', marginBottom: '16px', color: '#3b82f6' }}>
              <ShieldAlert size={36} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing Support Repositories...</p>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        /* Surveillance Reports Table */
        <div className="table-wrapper glass mt-10" style={{ borderRadius: '24px', padding: '8px', overflow: 'hidden' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reason / Issue</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((ticket) => (
                <tr key={ticket.id} className="row-premium">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-glass" style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MediaImage 
                          src={ticket.reporter?.displayPicture} 
                          fallbackText={ticket.reporter?.name?.[0] || 'U'}
                        />
                      </div>
                      <div className="user-text">
                        <span className="name-bold">{ticket.reporter?.name || 'Anonymous'}</span>
                        <span className="email-sub">{ticket.reporter?.email || 'No Email'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>
                      <AlertCircle size={14} />
                      {ticket.reason}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {ticket.room ? `Live Room: ${ticket.room.title}` : 'General Feedback'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-neon ${ticket.status === 'pending' ? 'pending' : 'active'}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="ops-cluster" style={{ justifyContent: 'flex-end' }}>
                      {ticket.status === 'pending' && (
                        <button 
                          className="op-btn edit" 
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px' }} 
                          onClick={() => handleResolveReport(ticket.id)}
                          title="Mark Resolved"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="op-btn edit" title="Message User"><MessageSquare size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Pristine! No active surveillance reports detected in buffer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Account Re-activation Tickets Table */
        <div className="table-wrapper glass mt-10" style={{ borderRadius: '24px', padding: '8px', overflow: 'hidden' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Applicant Identity</th>
                <th>Subject / Request</th>
                <th>Issue Description</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Protocols</th>
              </tr>
            </thead>
            <tbody>
              {helpTickets.map((ticket) => (
                <tr key={ticket.id} className="row-premium">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-glass" style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MediaImage 
                          src={ticket.user?.displayPicture} 
                          fallbackText={ticket.user?.name?.[0] || 'U'}
                        />
                      </div>
                      <div className="user-text">
                        <span className="name-bold">{ticket.user?.name || 'Anonymous User'}</span>
                        <span className="email-sub" style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>PHONE: {ticket.user?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
                      <HelpCircle size={14} />
                      {ticket.subject}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ticket.description}>
                      {ticket.description}
                    </p>
                  </td>
                  <td>
                    {ticket.status === 'open' ? (
                      <span className="status-neon pending" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <UserX size={12} /> ACCOUNT BLOCKED
                      </span>
                    ) : (
                      <span className="status-neon active" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <CheckCircle size={12} /> REACTIVATED
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="ops-cluster" style={{ justifyContent: 'flex-end' }}>
                      {ticket.status === 'open' && (
                        <button 
                          className="op-btn edit" 
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', width: 'auto' }} 
                          onClick={() => handleResolveHelpTicket(ticket.id, ticket.user?.name || 'Anonymous')}
                          title="Activate Account"
                        >
                          <UserCheck size={16} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>ACTIVATE</span>
                        </button>
                      )}
                      {ticket.status === 'resolved' && (
                        <button 
                          className="op-btn edit" 
                          style={{ background: 'rgba(148, 163, 184, 0.05)', color: '#94a3b8', borderRadius: '10px', opacity: 0.5, cursor: 'not-allowed', width: 'auto', padding: '6px 12px' }}
                          disabled
                        >
                          <CheckCircle size={16} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {helpTickets.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Clear! No account re-activation requests or help tickets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupportDesk;
