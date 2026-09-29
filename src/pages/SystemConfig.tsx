import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Settings, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';

const SystemConfig: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<Record<string, number> | null>(null);

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

  const handleSyncMasterData = async () => {
    if (!window.confirm('Are you sure you want to copy all master data (Gifts, Categories, Emojis, Frames, Backgrounds) from QA to Live Production?')) {
      return;
    }

    const toastId = toast.loading('Syncing master data from QA to Production...');
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await adminService.syncMasterDataToProd();
      if (res.data && res.data.success) {
        toast.success('Master data successfully synced to Production!', { id: toastId });
        setSyncResult(res.data.syncedTables);
      } else {
        toast.error(res.data?.message || 'Sync failed', { id: toastId });
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to sync databases', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="user-management">
      <div className="header-actions">
        <h1 className="page-title">System Configuration</h1>
      </div>

      {/* Database Master Data Sync Card */}
      <div className="glass-container mt-4 full-width p-4" style={{ border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={24} color="#00f0ff" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Database Master Sync (QA → Live Production)</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '6px', maxWidth: '650px' }}>
              Transfers and synchronizes all master data: <strong>Gift Categories, Gifts, Emojis, Avatar Frames, Backgrounds, Banners, and Packages</strong> from <code style={{ color: '#00f0ff' }}>qobo1live-qa</code> directly into <code style={{ color: '#22c55e' }}>qobo1live-prod</code> without affecting users, transactions, or room histories.
            </p>
          </div>
          <div>
            <button
              onClick={handleSyncMasterData}
              disabled={isSyncing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: isSyncing ? '#334155' : '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing to Live Production...' : 'Sync QA Master Data to Live'}
            </button>
          </div>
        </div>

        {syncResult && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 600, marginBottom: '8px' }}>
              <CheckCircle2 size={18} />
              <span>Synchronization Completed Successfully:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.85rem' }}>
              {Object.entries(syncResult).map(([table, count]: [string, any]) => (
                <span key={table} style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <strong>{table}:</strong> {count} rows
                </span>
              ))}
            </div>
          </div>
        )}
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
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading configuration...</td></tr>
              ) : ads.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No ads found.</td></tr>
              ) : (
                ads.map((ad: any) => (
                  <tr key={ad.id}>
                    <td className="name-main">{ad.title}</td>
                    <td><span className="badge-outline">{ad.type}</span></td>
                    <td><span className="status-neon active">{ad.status}</span></td>
                    <td><button className="icon-btn"><Settings size={16} /></button></td>
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

export default SystemConfig;
