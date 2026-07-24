import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import { TopMenu, SettingsToggle } from './components/LayoutControls';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Gifts from './pages/Gifts';
import AgencyHub from './pages/AgencyHub';
import Withdrawals from './pages/Withdrawals';
import StaffManagement from './pages/StaffManagement';
import TransactionHistory from './pages/TransactionHistory';
import Economy from './pages/Economy';
import SupportDesk from './pages/SupportDesk';
import OperationalSettings from './pages/OperationalSettings';
import TaskCenter from './pages/TaskCenter';
import AuthPage from './pages/AuthPage';
import NotificationCenter from './pages/ops/NotificationCenter';
import AdvancedSettings from './pages/ops/AdvancedSettings';
import SellerManager from './pages/ops/SellerManager';
import SellerDashboard from './pages/SellerDashboard';
import AmbienceManager from './pages/ops/AmbienceManager';
import AudioRoomManager from './pages/ops/AudioRoomManager';
import GiftCategories from './pages/GiftCategories';
import PKBattleManager from './pages/PKBattleManager';
import HostRegistry from './pages/HostRegistry';
import VipStore from './pages/VipStore';
import Moderation from './pages/Moderation';
import Localization from './pages/ops/Localization';
import Locations from './pages/Locations';
import LevelSystem from './pages/LevelSystem';
import GatewayConfig from './pages/GatewayConfig';
import SimulationManager from './pages/SimulationManager';
import PerformanceTracking from './pages/PerformanceTracking';
import './styles/global.css';

import PrivacyPolicy from './pages/PrivacyPolicy';
import ApplySuperAdmin from './pages/ApplySuperAdmin';
import RegisterAgency from './pages/RegisterAgency';
import RegisterHost from './pages/RegisterHost';
import SuperAdminRequests from './pages/SuperAdminRequests';
import AvatarFrames from './pages/AvatarFrames';
import ProfileBackgrounds from './pages/ProfileBackgrounds';
import RoomBackgrounds from './pages/RoomBackgrounds';
import GiftPreview from './pages/GiftPreview';

import { Menu as MenuIcon } from 'lucide-react';
import { useSocket } from './hooks/useSocket';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const { menuPosition, isSidebarCollapsed, setIsMobileMenuOpen } = useLayout();
  
  // Initialize Real-time Operational Hub
  useSocket();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  const adminUserStr = localStorage.getItem('admin_user');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const isSellerAdmin = adminUser?.role === 'seller_admin';

  const isStandalonePage = ['/apply-super-admin', '/register-agency', '/register-host', '/gift-preview'].includes(window.location.pathname);

  useEffect(() => {
    if (isStandalonePage) {
      document.body.classList.add('standalone-body');
    } else {
      document.body.classList.remove('standalone-body');
    }
    return () => document.body.classList.remove('standalone-body');
  }, [isStandalonePage]);

  if (isStandalonePage) {
    return (
      <div className="standalone-wrapper" style={{ width: '100%', minHeight: '100vh', background: window.location.pathname === '/gift-preview' ? '#121212' : '#f8fafc' }}>
        <style>{`
          body.standalone-body {
            overflow: auto !important;
            height: auto !important;
            min-height: 100vh;
          }
        `}</style>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/apply-super-admin" element={<ApplySuperAdmin />} />
          <Route path="/register-agency" element={<RegisterAgency />} />
          <Route path="/register-host" element={<RegisterHost />} />
          <Route path="/gift-preview" element={<GiftPreview />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={`app-container ${menuPosition === 'top' ? 'top-layout' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Toaster position="top-right" reverseOrder={false} />
      
      {isAuthenticated && (
        <div className="mobile-header">
          <button className="mobile-burger-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon size={24} />
          </button>
          <img src="/logo.svg" alt="Logo" style={{ height: '30px' }} />
          <div style={{ width: '40px' }} /> {/* Spacer */}
        </div>
      )}

      {isAuthenticated && menuPosition === 'left' && <Sidebar onLogout={handleLogout} />}
      
      <div className="main-wrapper">
        {isAuthenticated && menuPosition === 'top' && <TopMenu onLogout={handleLogout} />}
        
        <main className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Protected Routes */}
            {!isAuthenticated ? (
              <Route path="*" element={<AuthPage onLogin={() => setIsAuthenticated(true)} />} />
            ) : (
              isSellerAdmin ? (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<SellerDashboard />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/gifts" element={<Gifts />} />
                  <Route path="/gift-categories" element={<GiftCategories />} />
                  <Route path="/vip-store" element={<VipStore />} />
                  <Route path="/avatar-frames" element={<AvatarFrames />} />
                  <Route path="/profile-backgrounds" element={<ProfileBackgrounds />} />
                  <Route path="/room-backgrounds" element={<RoomBackgrounds />} />
                  <Route path="/dynamic-tasks" element={<TaskCenter />} />
                  <Route path="/super-admin-forms" element={<StaffManagement />} />
                  <Route path="/super-admin-requests" element={<SuperAdminRequests />} />
                  <Route path="/coin-seller-forms" element={<SellerManager />} />
                  <Route path="/agents" element={<AgencyHub />} />
                  <Route path="/host-registry" element={<HostRegistry />} />
                  <Route path="/performance-tracking" element={<PerformanceTracking />} />
                  <Route path="/pk-battles" element={<PKBattleManager />} />
                  <Route path="/support" element={<SupportDesk />} />
                  <Route path="/withdrawals" element={<Withdrawals />} />
                  <Route path="/transactions" element={<TransactionHistory />} />
                  <Route path="/operational-settings" element={<OperationalSettings />} />
                  <Route path="/economy" element={<Economy />} />
                  <Route path="/banners" element={<OperationalSettings />} />
                  <Route path="/backgrounds" element={<AmbienceManager />} />
                  <Route path="/audio-rooms" element={<AudioRoomManager />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/moderation" element={<Moderation />} />
                  <Route path="/localization" element={<Localization />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/level-system" element={<LevelSystem />} />
                  <Route path="/payment-gateways" element={<GatewayConfig />} />
                  <Route path="/simulation" element={<SimulationManager />} />
                  <Route path="/settings" element={<AdvancedSettings />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              )
            )}
          </Routes>
        </main>
      </div>

      {isAuthenticated && <SettingsToggle />}
    </div>
  );
}

function App() {
  return (
    <LayoutProvider>
      <AppContent />
    </LayoutProvider>
  );
}

export default App;
