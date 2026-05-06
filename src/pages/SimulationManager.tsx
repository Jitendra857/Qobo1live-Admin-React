import React, { useState, useEffect } from 'react';
import { 
  Zap, Play, Square, Settings, Users, 
  MessageSquare, Video, Activity, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/api';
import '../styles/UserManagement.css';
import '../styles/Dashboard.css';

const SimulationManager: React.FC = () => {
    const [scenarios, setScenarios] = useState<any[]>([
        { id: 'peak-hour', name: 'Peak Hour Buffer', type: 'CHAT', intensity: 'HIGH', status: 'idle' },
        { id: 'night-shift', name: 'Night Shift Video Loops', type: 'VIDEO', intensity: 'MEDIUM', status: 'idle' },
        { id: 'global-greeting', name: 'Global Greeting Script', type: 'CHAT', intensity: 'LOW', status: 'idle' },
    ]);

    const fetchActiveSims = async () => {
        try {
            const res = await adminService.controlSimulation('list', {});
            const activeIds = res.data.data.map((s: any) => s.id);
            setScenarios(prev => prev.map(s => ({
                ...s,
                status: activeIds.includes(s.id) ? 'active' : 'idle'
            })));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchActiveSims();
    }, []);

    const handleDeploy = async (scene: any) => {
        try {
            const loading = toast.loading(`Deploying ${scene.name}...`);
            await adminService.controlSimulation('start', {
                id: scene.id,
                roomId: 'GLOBAL_FEED', // Mock room ID for demo
                type: scene.type,
                intensity: scene.intensity
            });
            toast.success(`${scene.name} Deployed`, { id: loading });
            fetchActiveSims();
        } catch (err) {
            toast.error('Deployment Failed');
        }
    };

    const handleTerminate = async (id: string) => {
        try {
            const loading = toast.loading(`Terminating protocol...`);
            await adminService.controlSimulation('stop', {}, id);
            toast.success(`Protocol Terminated`, { id: loading });
            fetchActiveSims();
        } catch (err) {
            toast.error('Termination Failed');
        }
    };

    return (
        <div className="moderation-page">
            <div className="moderation-header">
                <div className="welcome-section">
                    <h1>Simulation Manager</h1>
                    <p className="subtitle">Deploy automated engagement protocols and content loops</p>
                </div>
                <div className="header-actions">
                    <button className="sync-btn primary" onClick={() => toast.success('Protocols Initialized')}>
                        <Zap size={16} />
                        <span>Initialize Simulation Hub</span>
                    </button>
                </div>
            </div>

            <div className="bento-grid">
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">Simulated Users</div>
                        <div className="card-icon-wrap" style={{ color: '#8b5cf6' }}><Users size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">1,240</div>
                        <div className="card-status live">Active in Feed</div>
                    </div>
                </div>
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">Chat Intensity</div>
                        <div className="card-icon-wrap" style={{ color: '#3b82f6' }}><MessageSquare size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">42/sec</div>
                        <div className="card-status positive">Natural Flow</div>
                    </div>
                </div>
                <div className="bento-card">
                    <div className="card-top">
                        <div className="card-label">System Load</div>
                        <div className="card-icon-wrap" style={{ color: '#10b981' }}><Activity size={20} /></div>
                    </div>
                    <div className="card-body">
                        <div className="card-value">12%</div>
                        <div className="card-status positive">Optimal</div>
                    </div>
                </div>
            </div>

            <div className="glass-card mt-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 text-red-500"><Target size={20} /></div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Deployment Scenarios</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {scenarios.map((scene) => (
                        <div key={scene.id} className="bento-card" style={{ height: 'auto', border: scene.status === 'active' ? '1px solid #ef4444' : '' }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`status-pill ${scene.status === 'active' ? 'active' : ''}`} style={{ background: scene.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : '', color: scene.status === 'active' ? '#ef4444' : '' }}>
                                    {scene.status === 'active' ? 'RUNNING' : 'STANDBY'}
                                </div>
                                <button className="op-btn"><Settings size={14} /></button>
                            </div>
                            <h3 className="name-bold" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{scene.name}</h3>
                            <div className="flex gap-4 mt-4">
                                <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                                    {scene.type === 'CHAT' ? <MessageSquare size={14} /> : <Video size={14} />}
                                    <span>{scene.type}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                                    <Zap size={14} />
                                    <span>{scene.intensity} INTENSITY</span>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-2">
                                {scene.status === 'active' ? (
                                    <button className="logout-btn" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => handleTerminate(scene.id)}>
                                        <Square size={16} />
                                        <span>TERMINATE</span>
                                    </button>
                                ) : (
                                    <button className="primary" style={{ width: '100%', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleDeploy(scene)}>
                                        <Play size={16} />
                                        <span>DEPLOY</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SimulationManager;
