import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Gifts from './pages/Gifts';
import AgencyHub from './pages/AgencyHub';
import Withdrawals from './pages/Withdrawals';
import StaffManagement from './pages/StaffManagement';
import TransactionHistory from './pages/TransactionHistory';
import SupportDesk from './pages/SupportDesk';
import OperationalSettings from './pages/OperationalSettings';
import GameCenter from './pages/GameCenter';
import TaskCenter from './pages/TaskCenter';
import AuthPage from './pages/AuthPage';
import SimulationManager from './pages/ops/SimulationManager';
import NotificationCenter from './pages/ops/NotificationCenter';
import AdvancedSettings from './pages/ops/AdvancedSettings';
import SellerManager from './pages/ops/SellerManager';
import AmbienceManager from './pages/ops/AmbienceManager';
import AudioRoomManager from './pages/ops/AudioRoomManager';
import GiftCategories from './pages/GiftCategories';
import PKBattleManager from './pages/PKBattleManager';
import HostRegistry from './pages/HostRegistry';
import VipStore from './pages/VipStore';
import Moderation from './pages/Moderation';
import './styles/global.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/gift-categories" element={<GiftCategories />} />
          <Route path="/vip-store" element={<VipStore />} />
          <Route path="/dynamic-tasks" element={<TaskCenter />} />
          <Route path="/super-admin-forms" element={<StaffManagement />} />
          <Route path="/coin-seller-forms" element={<SellerManager />} />
          <Route path="/agents" element={<AgencyHub />} />
          <Route path="/host-registry" element={<HostRegistry />} />
          <Route path="/fake-video" element={<SimulationManager />} />
          <Route path="/fake-chat" element={<SimulationManager />} />
          <Route path="/greedy-game" element={<GameCenter />} />
          <Route path="/pk-battles" element={<PKBattleManager />} />
          <Route path="/support" element={<SupportDesk />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/operational-settings" element={<OperationalSettings />} />
          <Route path="/backgrounds" element={<AmbienceManager />} />
          <Route path="/audio-rooms" element={<AudioRoomManager />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/settings" element={<AdvancedSettings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
