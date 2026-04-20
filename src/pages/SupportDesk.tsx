import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/UserManagement.css';

const SupportDesk: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await adminService.getTickets();
      setTickets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await adminService.resolveTicket(id);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Support Desk</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Moderate community reports and inquiries</p>
        </div>
      </div>

      <div className="table-wrapper glass mt-10">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Reason / Issue</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar-neon" style={{ background: 'var(--accent-blue)' }}>R</div>
                    <div className="user-text">
                      <span className="name-main">{ticket.reporter?.name || 'Anonymous'}</span>
                      <span className="id-sub">{ticket.reporter?.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    <AlertCircle size={14} style={{ color: '#ef4444' }} />
                    {ticket.reason}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {ticket.room ? `Live Room: ${ticket.room.title}` : 'General Feedback'}
                  </span>
                </td>
                <td>
                  <span className={`status-neon ${ticket.status === 'pending' ? 'active' : ''}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>
                  <div className="action-group">
                    {ticket.status === 'pending' && (
                      <button className="icon-btn" style={{ color: '#10b981' }} onClick={() => handleResolve(ticket.id)}>
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button className="icon-btn"><MessageSquare size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                  Pristine! No active support tickets or reports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportDesk;
