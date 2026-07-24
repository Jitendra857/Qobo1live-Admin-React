import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Gift, Settings, UserCheck, Wallet,
  Tv, Headset, LogOut, ChevronDown, ChevronRight,
  Monitor, ChevronLeft, Menu as MenuIcon
} from 'lucide-react';
import { useLayout } from '../context/LayoutContext';
import '../styles/Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
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
  const {
    isSidebarCollapsed, setSidebarCollapsed,
    menuPosition, isMobileMenuOpen, setIsMobileMenuOpen,
    sidebarTheme
  } = useLayout();

  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    return user?.role === 'super_admin' ? ['Agencies & Hosts'] : [];
  });

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (user?.role === 'super_admin') {
      setSidebarCollapsed(false);
    }
  }, [setSidebarCollapsed]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // ─── Menu Structure ─────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    // 1. Overview (Direct link to dashboard)
    { title: 'Overview', path: '/dashboard', icon: <Home size={17} />, iconClass: 'icon-blue' },

    // 2. Community & Users
    {
      title: 'Community & Users', icon: <Headset size={17} />, iconClass: 'icon-rose',
      subItems: [
        { title: 'User List', path: '/users' },
        { title: 'Banned & Reports', path: '/moderation' },
        { title: 'Help Tickets', path: '/support' },
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
        { title: 'Gift Categories', path: '/gift-categories' },
        { title: 'VIP Packages', path: '/vip-store' },
        { title: 'Avatar Frames', path: '/avatar-frames' },
        { title: 'Profile Backgrounds', path: '/profile-backgrounds' },
        { title: 'User Levels', path: '/level-system' },
        { title: 'Daily Tasks', path: '/dynamic-tasks' },
      ],
    },

    // 5. Earnings & Payouts
    {
      title: 'Earnings & Payouts', icon: <Wallet size={17} />, iconClass: 'icon-green',
      subItems: [
        { title: 'User Balances', path: '/economy' },
        { title: 'Withdraw Requests', path: '/withdrawals' },
        { title: 'Payment History', path: '/transactions' },
      ],
    },

    // 6. Live Features
    {
      title: 'Live Features', icon: <Tv size={17} />, iconClass: 'icon-orange',
      subItems: [
        { title: 'Active Rooms', path: '/audio-rooms' },
        { title: 'PK Battles', path: '/pk-battles' },
        { title: 'Room backgrounds', path: '/banners' },
        { title: 'System Messages', path: '/notifications' },
      ],
    },

    // 7. System Settings
    {
      title: 'System Settings', icon: <Settings size={17} />, iconClass: 'icon-violet',
      subItems: [
        { title: 'Admin Accounts', path: '/super-admin-forms' },
        { title: 'Super Admin Requests', path: '/super-admin-requests' },
        { title: 'Coin Resellers', path: '/coin-seller-forms' },
        { title: 'Payment Gateways', path: '/payment-gateways' },
        { title: 'General Settings', path: '/settings' },
        { title: 'App Language', path: '/localization' },
        { title: 'Manage Locations', path: '/locations' },
        { title: 'Simulator Control', path: '/simulation' },
        { title: 'Privacy Policy', path: '/privacy' },
      ],
    },
  ];

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  const visibleMenuItems: MenuItem[] = (() => {
    if (currentUser?.email === 'admin@qobo1live.com' || currentUser?.role === 'admin') return menuItems;
    if (currentUser?.role === 'super_admin') {
      return [
        {
          title: 'Agencies & Hosts', icon: <UserCheck size={17} />, iconClass: 'icon-cyan',
          subItems: [
            { title: 'Agencies', path: '/agents' },
            { title: 'Hosts',    path: '/host-registry' },
          ],
        }
      ];
    }
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
    if (window.innerWidth <= 768) setIsMobileMenuOpen(false);
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
          {currentUser?.role !== 'super_admin' && (
            <button className="burger-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
              {isSidebarCollapsed ? <MenuIcon size={17} /> : <ChevronLeft size={17} />}
            </button>
          )}
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

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <div className="logout-icon-wrap"><LogOut size={16} /></div>
            {!isSidebarCollapsed && <span className="logout-text">Power Off</span>}
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
