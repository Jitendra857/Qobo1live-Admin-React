import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Gamepad2, Settings, Play, Info } from 'lucide-react';
import '../styles/UserManagement.css';

const GameCenter: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const res = await adminService.getGames();
      setGames(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, odds: string) => {
    try {
      await adminService.updateGame(id, { odds });
      alert('Odds synchronized!');
      fetchGames();
    } catch (err) {
      alert('Update failed');
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Game Economy</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Configure 'Greedy Game' mechanics and odds</p>
        </div>
      </div>

      <div className="bento-grid mt-10">
        {games.map((game) => (
          <div key={game.id} className="bento-card">
            <div className="card-top">
              <div className="card-label">ACTIVE MECHANIC</div>
              <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
                <Gamepad2 size={24} />
              </div>
            </div>
            <div className="card-bottom">
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{game.title || 'Greedy Round'}</div>
              <div className="card-value" style={{ fontSize: '2.2rem' }}>{game.odds || '1.5x'}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Win Probability: {game.probability || '45%'}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="primary flex-center gap-2" style={{ width: '100%', padding: '12px' }} onClick={() => handleUpdate(game.id, '2.5x')}>
                  <Settings size={16} />
                  <span>Adjust Logic</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {games.length === 0 && (
          <div className="bento-card wide" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <div>
              <Play size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
              <p>No active game configurations found.<br/>Initialize the engine to start tracking odds.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCenter;
