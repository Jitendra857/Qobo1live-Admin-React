import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { UserPlus, UserMinus, ShieldAlert, Cpu } from 'lucide-react';
import '../../styles/UserManagement.css';

const SimulationManager: React.FC = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBots = async () => {
    try {
      const res = await adminService.getBots();
      setBots(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBotAction = async (action: string, id?: string) => {
    try {
      await adminService.manageBot(action, { name: 'SimBot_' + Date.now() }, id);
      fetchBots();
    } catch (err) {
      alert('Bot operation failed');
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Bot Simulation</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage social activity bots and automated streamers</p>
        </div>
        <button className="primary flex-center gap-2" onClick={() => handleBotAction('add')}>
          <UserPlus size={18} />
          <span>Deploy Bot</span>
        </button>
      </div>

      <div className="bento-grid mt-10">
        <div className="bento-card wide">
          <div className="card-top">
            <div className="card-label">CLUSTER STATUS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}>
              <Cpu size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div className="card-value">{bots.length}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Active Social Entities</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>SYSTEM NOMINAL</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Ping: 14ms</div>
              </div>
            </div>
          </div>
        </div>

        {bots.map((bot) => (
          <div key={bot.id} className="bento-card">
            <div className="card-top">
              <div className="card-label">SIMULATED</div>
              <img src={bot.avatar || 'https://i.pravatar.cc/150'} alt="bot" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid var(--accent-blue)' }} />
            </div>
            <div className="card-bottom" style={{ marginTop: '10px' }}>
              <div style={{ fontWeight: 800 }}>{bot.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {bot.id.slice(0, 8)}</div>
              <div style={{ marginTop: '15px', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>Status: In Live Room</div>
              <button className="icon-btn mt-10" style={{ width: '100%', color: '#ef4444', border: '1px solid #ef444422' }} onClick={() => handleBotAction('delete', bot.id)}>
                <UserMinus size={16} />
                <span style={{ marginLeft: '8px' }}>Recall Bot</span>
              </button>
            </div>
          </div>
        ))}

        {bots.length === 0 && (
          <div className="bento-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
             <p style={{ opacity: 0.5, textAlign: 'center' }}>No bots deployed currently.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationManager;
