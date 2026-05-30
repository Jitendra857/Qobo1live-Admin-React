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
    menuPosition, isMobileMenuOpen, setIsMobileMenuOpen
  } = useLayout();

  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    return user?.role === 'super_admin' ? ['Agency & Hosts'] : [];
  });

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // ─── Menu Structure ─────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    // MAIN
    { type: 'category', title: 'MAIN' },
    { title: 'Dashboard', path: '/dashboard', icon: <Home size={17} />, iconClass: 'icon-blue' },

    // PLATFORM
    { type: 'category', title: 'PLATFORM' },
    {
      title: 'Economy & Assets', icon: <Gift size={17} />, iconClass: 'icon-amber',
      subItems: [
        { title: 'Gift Inventory',  path: '/gifts' },
        { title: 'Gift Categories', path: '/gift-categories' },
        { title: 'VIP Packages',    path: '/vip-store' },
        { title: 'Level System',    path: '/level-system' },
        { title: 'Task Center',     path: '/dynamic-tasks' },
      ],
    },
    {
      title: 'System Config', icon: <Settings size={17} />, iconClass: 'icon-violet',
      subItems: [
        { title: 'Payment Gateways', path: '/payment-gateways' },
        { title: 'Coin Sellers',     path: '/coin-seller-forms' },
        { title: 'Staff Authority',  path: '/super-admin-forms' },
        { title: 'Localization',     path: '/localization' },
        { title: 'Advanced Config',  path: '/settings' },
        { title: 'Privacy Policy',   path: '/privacy' },
      ],
    },

    // SECURITY
    { type: 'category', title: 'SECURITY' },
    {
      title: 'Surveillance', icon: <Monitor size={17} />, iconClass: 'icon-rose',
      subItems: [
        { title: 'User Directory',     path: '/users' },
        { title: 'Moderation Console', path: '/moderation' },
        { title: 'PK Battle Hub',      path: '/pk-battles' },
        { title: 'Audio Room Monitor', path: '/audio-rooms' },
        { title: 'Simulation Manager', path: '/simulation' },
      ],
    },

    // FINANCE
    { type: 'category', title: 'FINANCE' },
    {
      title: 'Financials', icon: <Wallet size={17} />, iconClass: 'icon-green',
      subItems: [
        { title: 'Wallet & Ledger',  path: '/economy' },
        { title: 'Transaction Logs', path: '/transactions' },
        { title: 'Withdrawal Queue', path: '/withdrawals' },
      ],
    },

    // RECRUITMENT
    { type: 'category', title: 'RECRUITMENT' },
    {
      title: 'Agency & Hosts', icon: <UserCheck size={17} />, iconClass: 'icon-cyan',
      subItems: [
        { title: 'Agency Hub',    path: '/agents' },
        { title: 'Host Registry', path: '/host-registry' },
      ],
    },

    // OPERATIONS
    { type: 'category', title: 'OPERATIONS' },
    {
      title: 'Operational Media', icon: <Tv size={17} />, iconClass: 'icon-orange',
      subItems: [
        { title: 'Banner Management', path: '/banners' },
        { title: 'Room Environments', path: '/backgrounds' },
        { title: 'System Broadcasts', path: '/notifications' },
      ],
    },
    { title: 'Support Desk', path: '/support', icon: <Headset size={17} />, iconClass: 'icon-cyan' },
  ];

  const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  const visibleMenuItems = (() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') return menuItems;
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
          {!isSidebarCollapsed && <img src="/logo.svg" alt="Qobo1live" />}
          <button className="burger-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <MenuIcon size={17} /> : <ChevronLeft size={17} />}
          </button>
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
