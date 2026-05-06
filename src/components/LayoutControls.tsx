import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Gift, Crown, Wallet, 
  ShieldCheck, Settings, LogOut, Menu, X, Palette, 
  ArrowLeftRight, Heart
} from 'lucide-react';
import { useLayout } from '../context/LayoutContext';

const menuItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/gifts', label: 'Gifts', icon: Gift },
  { path: '/agents', label: 'Agencies', icon: Crown },
  { path: '/withdrawals', label: 'Economy', icon: Wallet },
  { path: '/moderation', label: 'Safety', icon: ShieldCheck },
  { path: '/privacy', label: 'Privacy', icon: ShieldCheck },
  { path: '/operational-settings', label: 'Ops', icon: Settings },
];

export const TopMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { themeColor } = useLayout();

  return (
    <nav className="top-menu">
      <div className="top-branding">
        <img src="/logo.svg" alt="qobo1live" style={{ height: '32px' }} />
      </div>
      <div className="top-nav-items">
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} className="top-nav-link">
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="top-actions">
        <button onClick={onLogout} className="top-logout-btn compact">
          <LogOut size={18} />
          <span className="logout-label">Power Off</span>
        </button>
      </div>
    </nav>
  );
};

export const SettingsToggle: React.FC = () => {
  const { themeColor, setThemeColor, menuPosition, setMenuPosition } = useLayout();
  const [isOpen, setIsOpen] = React.useState(false);

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className={`settings-drawer ${isOpen ? 'open' : ''}`}>
      <button className="settings-fab" onClick={() => setIsOpen(!isOpen)}>
        <Palette size={24} />
      </button>
      
      <div className="settings-content">
        <h3>UI Customization</h3>
        
        <div className="setting-group">
          <label>Theme Color</label>
          <div className="color-grid">
            {colors.map(c => (
              <button 
                key={c} 
                className={`color-box ${themeColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setThemeColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label>Menu Position</label>
          <div className="toggle-btn-group">
            <button 
              className={menuPosition === 'left' ? 'active' : ''} 
              onClick={() => setMenuPosition('left')}
            >
              Left Sidebar
            </button>
            <button 
              className={menuPosition === 'top' ? 'active' : ''} 
              onClick={() => setMenuPosition('top')}
            >
              Top Bar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
