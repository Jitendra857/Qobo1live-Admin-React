import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Gift, Crown, Wallet,
  ShieldCheck, Settings, LogOut, Palette, Check
} from 'lucide-react';
import { useLayout, SIDEBAR_THEMES } from '../context/LayoutContext';

const menuItems = [
  { path: '/dashboard',  label: 'Overview',   icon: LayoutDashboard },
  { path: '/users',      label: 'Users',      icon: Users },
  { path: '/gifts',      label: 'Gifts',      icon: Gift },
  { path: '/agents',     label: 'Agencies',   icon: Crown },
  { path: '/economy',    label: 'Finance',    icon: Wallet },
  { path: '/moderation', label: 'Moderation', icon: ShieldCheck },
  { path: '/settings',   label: 'Settings',   icon: Settings },
];

/* ── Top-bar menu (used when menuPosition === 'top') ─────── */
export const TopMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const visibleMenuItems = (() => {
    if (currentUser?.role === 'admin') return menuItems;
    if (currentUser?.role === 'super_admin') {
      return menuItems.filter(item => item.path === '/agents' || item.path === '/host-registry');
    }
    return [];
  })();

  return (
    <nav className="top-menu">
      <div className="top-branding">
        <img src="/logo.svg" alt="qobo1live" style={{ height: '32px' }} />
      </div>
      <div className="top-nav-items">
        {visibleMenuItems.map(item => (
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

/* ── Floating theme picker (right-side FAB drawer) ────────── */
export const SettingsToggle: React.FC = () => {
  const { sidebarTheme, setSidebarTheme, menuPosition, setMenuPosition } = useLayout();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`theme-drawer ${isOpen ? 'open' : ''}`}>

      {/* FAB trigger */}
      <button
        className="theme-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Theme"
      >
        <Palette size={20} />
      </button>

      {/* Panel */}
      <div className="theme-panel">
        <div className="theme-panel-header">
          <div className="theme-panel-title">
            <Palette size={16} />
            <span>Theme Studio</span>
          </div>
          <button className="theme-panel-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* Sidebar colour presets */}
        <div className="theme-section">
          <div className="theme-section-label">Sidebar Skin</div>
          <div className="theme-swatches">
            {SIDEBAR_THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-swatch ${sidebarTheme.id === t.id ? 'selected' : ''}`}
                onClick={() => setSidebarTheme(t)}
                title={t.label}
              >
                {/* preview mini sidebar */}
                <span
                  className="swatch-preview"
                  style={{ background: t.bg, borderColor: t.accent }}
                >
                  <span className="swatch-bar" style={{ background: t.accent }} />
                  <span className="swatch-lines">
                    <span style={{ background: t.text, opacity: 0.4 }} />
                    <span style={{ background: t.text, opacity: 0.25 }} />
                    <span style={{ background: t.text, opacity: 0.25 }} />
                  </span>
                </span>
                <span className="swatch-label">{t.label}</span>
                {sidebarTheme.id === t.id && (
                  <span className="swatch-check" style={{ background: t.accent }}>
                    <Check size={10} color="#fff" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Position toggle */}
        <div className="theme-section">
          <div className="theme-section-label">Menu Position</div>
          <div className="theme-position-toggle">
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

        <div className="theme-panel-footer">
          Preferences saved automatically
        </div>
      </div>

    </div>
  );
};
