import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Gift, Settings, UserCheck, Wallet,
  Tv, Headset, ChevronDown, ChevronRight,
  Monitor, ChevronLeft, Menu as MenuIcon, Building2,
  LogOut, X
} from 'lucide-react';
import { useLayout } from '../context/LayoutContext';
import '../styles/Sidebar.css';

interface SidebarProps {
  onLogout?: () => void;
}

// Each menu item carries an optional iconClass for per-section color
interface SubItem { title: string; path: string }
interface MenuItem {
  type?: 'category';
  title?: string;
  path?: string;
  icon?: React.ReactNode;
  iconClass?: string;
  subItems?: SubItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const {
    isSidebarCollapsed, setSidebarCollapsed,
    menuPosition, isMobileMenuOpen, setIsMobileMenuOpen,
    sidebarTheme
  } = useLayout();

  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const defaultOpen = ['Earnings & Payouts', 'Community & Users'];
    if (user?.role === 'super_admin') defaultOpen.push('Agencies & Hosts');
    return defaultOpen;
  });

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (user?.role === 'super_admin') {
      setSidebarCollapsed(false);
    }
  }, [setSidebarCollapsed]);

  // Automatically expand parent menu if current route is one of its sub-items
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => sub.path === location.pathname)) {
        setExpandedMenus(prev => prev.includes(item.title!) ? prev : [...prev, item.title!]);
      }
    });
  }, [location.pathname]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // ─── Menu Structure ─────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    // 1. Dashboard (Direct link to dashboard)
    { title: 'Dashboard', path: '/dashboard', icon: <Home size={17} />, iconClass: 'icon-blue' },

    // 2. Community & Users
    {
      title: 'Community & Users', icon: <Headset size={17} />, iconClass: 'icon-rose',
      subItems: [
        { title: 'User List', path: '/users' },
        { title: 'Partner Coins', path: '/partner-coins' },
        { title: 'Withdraw Requests', path: '/withdrawals' },
        { title: 'Coins Sellers', path: '/coins-seller-requests' },
        { title: 'Banned & Reports', path: '/moderation' },
      ],
    },

    // 3. Agencies & Hosts
    {
      title: 'Agencies & Hosts', icon: <UserCheck size={17} />, iconClass: 'icon-cyan',
      subItems: [
        { title: 'Agencies', path: '/agents' },
        { title: 'Hosts',    path: '/host-registry' },
        { title: 'Performance Tracker', path: '/performance-tracking' },
      ],
    },

    // 4. Gifts & Store
    {
      title: 'Gifts & Rewards', icon: <Gift size={17} />, iconClass: 'icon-amber',
      subItems: [
        { title: 'Gifts Catalog', path: '/gifts' },
        { title: 'Lucky Gifts', path: '/lucky-gifts' },
        { title: 'Emojis Catalog', path: '/emojis' },
        { title: 'Gift Categories', path: '/gift-categories' },
        { title: 'VIP Packages', path: '/vip-store' },
        { title: 'Coins Setup', path: '/coins-setup' },
        { title: 'Frames', path: '/avatar-frames' },
        { title: 'Entry Frames', path: '/entry-frames' },
        { title: 'Profile Backgrounds', path: '/profile-backgrounds' },
        { title: 'User Levels', path: '/level-system' },
        { title: 'Task', path: '/dynamic-tasks' },
      ],
    },

    // 5. Earnings & Payouts
    {
      title: 'Earnings & Payouts', icon: <Wallet size={17} />, iconClass: 'icon-green',
      subItems: [
        { title: 'Withdraw Requests', path: '/withdrawals' },
        { title: 'Coins Setup', path: '/coins-setup' },
        { title: 'User Balances', path: '/economy' },
        { title: 'Payment History', path: '/transactions' },
      ],
    },

    // 6. Live Features
    {
      title: 'Live Features', icon: <Tv size={17} />, iconClass: 'icon-orange',
      subItems: [
        { title: 'Live Streams', path: '/live-streams' },
        { title: 'Active Rooms', path: '/audio-rooms' },
        { title: 'PK Battles', path: '/pk-battles' },
        { title: 'Room Backgrounds', path: '/room-backgrounds' },
        { title: 'App Banners', path: '/banners' },
        { title: 'System Messages', path: '/notifications' },
      ],
    },

    // 7. System Settings
    {
      title: 'System Settings', icon: <Settings size={17} />, iconClass: 'icon-violet',
      subItems: [
        { title: 'Admin Accounts', path: '/super-admin-forms' },
        { title: 'Super Admin Requests', path: '/super-admin-requests' },
        { title: 'Payment Gateways', path: '/payment-gateways' },
        { title: 'General Settings', path: '/settings' },
        { title: 'App Language', path: '/localization' },
        { title: 'Manage Locations', path: '/locations' },
        // { title: 'Simulator Control', path: '/simulation' }, // Hidden for MVP
        { title: 'Privacy Policy', path: '/privacy' },
      ],
    },
  ];

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  const visibleMenuItems: MenuItem[] = (() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') return menuItems;


    if (currentUser?.role === 'agency') {
      return [
        {
          title: 'My Agency', icon: <Building2 size={17} />, iconClass: 'icon-blue',
          subItems: [
            { title: 'Dashboard', path: '/dashboard' },
            { title: 'My Hosts',    path: '/host-registry' },
          ],
        }
      ];
    }
    if (currentUser?.role === 'seller_admin') {
      return [
        { title: 'Merchant Portal', path: '/dashboard', icon: <Home size={17} />, iconClass: 'icon-blue' }
      ];
    }
    return []; // For 'user' or unknown roles, leave it blank
  })();
  // ──────────────────────────────────────────────────────────────────────────

  if (menuPosition === 'top') return null;

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>

        {/* Logo */}
        <div className="branding">
          {!isSidebarCollapsed && (
            <img 
              src="/logo.svg" 
              alt="Qobo1live" 
              className={sidebarTheme.id !== 'white' ? 'dark-sidebar-logo' : ''} 
            />
          )}
          <div className="branding-actions">
            <button 
              className="burger-btn desktop-collapse-btn" 
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <MenuIcon size={17} /> : <ChevronLeft size={17} />}
            </button>
            <button 
              className="burger-btn mobile-close-drawer-btn" 
              onClick={() => setIsMobileMenuOpen(false)}
              title="Close Menu"
              aria-label="Close Menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav-menu">
          {visibleMenuItems.map((item, index) => (
            <div key={(item.title || '') + index}>

              {/* ── Category label ── */}
              {item.type === 'category' ? (
                !isSidebarCollapsed && (
                  <div className="nav-category-label">{item.title}</div>
                )

              /* ── Parent with sub-items ── */
              ) : item.subItems ? (
                <>
                  <div
                    className={`nav-link submenu-trigger ${expandedMenus.includes(item.title!) ? 'open' : ''}`}
                    onClick={() => !isSidebarCollapsed && toggleMenu(item.title!)}
                  >
                    <span className={`nav-icon ${item.iconClass || ''}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <>
                        <span className="nav-title">{item.title}</span>
                        <span className="nav-chevron">
                          {expandedMenus.includes(item.title!)
                            ? <ChevronDown size={13} />
                            : <ChevronRight size={13} />}
                        </span>
                      </>
                    )}
                  </div>

                  {expandedMenus.includes(item.title!) && !isSidebarCollapsed && (
                    <div className="sub-menu-items">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) => `nav-link sub-link ${isActive ? 'active' : ''}`}
                          onClick={handleNavClick}
                        >
                          <span className="sub-dot" />
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>

              /* ── Standalone link ── */
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  title={isSidebarCollapsed ? item.title : ''}
                  onClick={handleNavClick}
                >
                  <span className={`nav-icon ${item.iconClass || ''}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="nav-title">{item.title}</span>
                  )}
                </NavLink>
              )}

            </div>
          ))}
        </nav>

        {/* Footer with Logout */}
        {onLogout && (
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout} title="Logout" aria-label="Logout">
              <span className="logout-icon-wrap"><LogOut size={16} /></span>
              {!isSidebarCollapsed && <span className="logout-text">Logout</span>}
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default Sidebar;
