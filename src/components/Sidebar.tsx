import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home as HomeIcon, Users as UsersIcon, Gift as GiftIcon, List as ListIcon, 
  FileText as FileTextIcon, UserCheck as UserCheckIcon, 
  Headset as HeadsetIcon, Wallet as WalletIcon, 
  Image as ImageIcon, Mic as MicIcon, Bell as BellIcon, Settings as SettingsIcon, LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon, Sword as SwordIcon, 
  Shield as ShieldIcon, ShoppingCart as ShoppingCartIcon, Activity as ActivityIcon,
  Tv as TvIcon, History as HistoryIcon, ArrowUpRight as ArrowUpRightIcon, 
  Globe as GlobeIcon, Menu as MenuIcon, ChevronLeft as ChevronLeftIcon,
  Zap as ZapIcon, Key as KeyIcon, Award as AwardIcon, Monitor as MonitorIcon
} from 'lucide-react';
import { useLayout } from '../context/LayoutContext';
import '../styles/Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { isSidebarCollapsed, setSidebarCollapsed, menuPosition, isMobileMenuOpen, setIsMobileMenuOpen } = useLayout();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['Gifts']);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <HomeIcon size={20} /> },
    { 
      title: 'Economy & Assets', 
      icon: <GiftIcon size={20} />,
      subItems: [
        { title: 'Gift Inventory', path: '/gifts' },
        { title: 'Categories', path: '/gift-categories' },
        { title: 'VIP Tier Setup', path: '/vip-store' },
        { title: 'Level System', path: '/level-system' },
        { title: 'Task Center', path: '/dynamic-tasks' }
      ]
    },
    { 
      title: 'System Config', 
      icon: <SettingsIcon size={20} />,
      subItems: [
        { title: 'Payment Gateways', path: '/payment-gateways' },
        { title: 'Coin Sellers', path: '/coin-seller-forms' },
        { title: 'Staff Governance', path: '/super-admin-forms' },
        { title: 'Privacy Policy', path: '/privacy' },
        { title: 'Localization', path: '/localization' },
        { title: 'Advanced Config', path: '/settings' }
      ]
    },
    { 
      title: 'Agency & Hosts', 
      icon: <UserCheckIcon size={20} />,
      subItems: [
        { title: 'Agency Hub', path: '/agents' },
        { title: 'Host Registry', path: '/host-registry' }
      ]
    },
    { 
      title: 'Surveillance', 
      icon: <MonitorIcon size={20} />,
      subItems: [
        { title: 'User Directory', path: '/users' },
        { title: 'Moderation Console', path: '/moderation' },
        { title: 'Simulation Manager', path: '/simulation' },
        { title: 'Audio Room Monitor', path: '/audio-rooms' },
        { title: 'PK Battle Hub', path: '/pk-battles' }
      ]
    },
    { 
      title: 'Financials', 
      icon: <WalletIcon size={20} />,
      subItems: [
        { title: 'Wallet & Ledger', path: '/economy' },
        { title: 'Transaction Logs', path: '/transactions' },
        { title: 'Withdrawal Queue', path: '/withdrawals' }
      ]
    },
    { 
      title: 'Operational Media', 
      icon: <TvIcon size={20} />,
      subItems: [
        { title: 'Banner Management', path: '/banners' },
        { title: 'Room Environments', path: '/backgrounds' },
        { title: 'System Broadcasts', path: '/notifications' }
      ]
    },
    { title: 'Support Desk', path: '/support', icon: <HeadsetIcon size={20} /> },
  ];

  if (menuPosition === 'top') return null;

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="branding">
          {!isSidebarCollapsed && <img src="/logo.svg" alt="Qobo1live Logo" />}
          <button className="burger-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <MenuIcon size={20} /> : <ChevronLeftIcon size={20} />}
          </button>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.subItems ? (
                <>
                  <div 
                    className={`nav-link submenu-trigger ${expandedMenus.includes(item.title) ? 'active' : ''}`}
                    onClick={() => !isSidebarCollapsed && toggleMenu(item.title)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="nav-icon">{item.icon}</span>
                      {!isSidebarCollapsed && <span className="nav-title">{item.title}</span>}
                    </div>
                    {!isSidebarCollapsed && (expandedMenus.includes(item.title) ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />)}
                  </div>
                  {expandedMenus.includes(item.title) && !isSidebarCollapsed && (
                    <div className="sub-menu-items" style={{ paddingLeft: '32px', marginTop: '4px' }}>
                      {item.subItems.map(sub => (
                        <NavLink 
                          key={sub.path} 
                          to={sub.path} 
                          className={({ isActive }) => `nav-link sub-link ${isActive ? 'active' : ''}`}
                          style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                          onClick={handleNavClick}
                        >
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink 
                  to={item.path!} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  title={isSidebarCollapsed ? item.title : ''}
                  onClick={handleNavClick}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isSidebarCollapsed && <span className="nav-title">{item.title}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <div className="logout-icon-wrap">
              <LogOutIcon size={18} />
            </div>
            {!isSidebarCollapsed && <span className="logout-text">Power Off</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
