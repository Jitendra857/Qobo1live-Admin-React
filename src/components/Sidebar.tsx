import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Gift, List, FileText, UserCheck, 
  Video, MessageSquare, Dice1, Headset, Wallet, 
  Image as ImageIcon, Monitor, Mic, Bell, Settings, LogOut, Layout,
  ChevronDown, ChevronRight, Sword, Shield, ShoppingCart, Activity,
  Tv, History, ArrowUpRight
} from 'lucide-react';
import '../styles/Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['Gifts']);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { title: 'Users', path: '/users', icon: <Users size={20} /> },
    { 
      title: 'Gifts', 
      icon: <Gift size={20} />,
      subItems: [
        { title: 'Categories', path: '/gift-categories' },
        { title: 'Inventory', path: '/gifts' },
        { title: 'VIP Store', path: '/vip-store' }
      ]
    },
    { title: 'Dynamic Task', path: '/dynamic-tasks', icon: <List size={20} /> },
    { title: 'System Analytics', path: '/', icon: <Activity size={20} /> },
    { title: 'Wallet & Ledger', path: '/economy', icon: <Wallet size={20} /> },
    { title: 'Operational Media', path: '/operational-settings', icon: <ImageIcon size={20} /> },
    { title: 'Audio Room Matrix', path: '/audio-rooms', icon: <Mic size={20} /> },
    { title: 'PK Battle Center', path: '/pk-battles', icon: <Sword size={20} /> },
    { title: 'Dating & Swipes', path: '/fake-video', icon: <Monitor size={20} /> },
    { title: 'Support & Tickets', path: '/support', icon: <Headset size={20} /> },
    { title: 'Transaction Log', path: '/transactions', icon: <History size={20} /> },
    { title: 'Banned Keywords', path: '/moderation', icon: <MessageSquare size={20} /> },
    { title: 'Agency Withdrawals', path: '/withdrawals', icon: <ArrowUpRight size={20} /> },
    { title: 'Advanced Config', path: '/settings', icon: <Settings size={20} /> },
    { title: 'Global Ambience', path: '/backgrounds', icon: <Monitor size={20} /> },
    { title: 'Simulated Assets', path: '/fake-video', icon: <Video size={20} /> },
    { title: 'Live Broadcasts', path: '/audio-rooms', icon: <Activity size={20} /> },
    { title: 'PK Battle Center', path: '/pk-battles', icon: <Sword size={20} /> },
    { title: 'Support & Tickets', path: '/support', icon: <Headset size={20} /> },
    { title: 'Broadcast Ads', path: '/operational-settings', icon: <Tv size={20} /> },
    { title: 'Global Ambience', path: '/backgrounds', icon: <Monitor size={20} /> },
    { title: 'Transaction Log', path: '/transactions', icon: <History size={20} /> },
    { title: 'Staff Management', path: '/super-admin-forms', icon: <Shield size={20} /> },
    { title: 'Seller Management', path: '/coin-seller-forms', icon: <ShoppingCart size={20} /> },
    { 
      title: 'Recruitment', 
      icon: <UserCheck size={20} />,
      subItems: [
        { title: 'Agencies', path: '/agents' },
        { title: 'Host Applications', path: '/host-registry' }
      ]
    },
    { title: 'Fake Video Live', path: '/fake-video', icon: <Video size={20} /> },
    { title: 'Fake Chat Group', path: '/fake-chat', icon: <MessageSquare size={20} /> },
    { title: 'Greedy Game', path: '/greedy-game', icon: <Dice1 size={20} /> },
    { title: 'PK Battles', path: '/pk-battles', icon: <Sword size={20} /> },
    { title: 'Help & support', path: '/support', icon: <Headset size={20} /> },
    { title: 'Withdrawal requests', path: '/withdrawals', icon: <Wallet size={20} /> },
    { title: 'Transaction History', path: '/transactions', icon: <FileText size={20} /> },
    { title: 'Banners', path: '/banners', icon: <ImageIcon size={20} /> },
    { title: 'Room Backgrounds', path: '/backgrounds', icon: <Monitor size={20} /> },
    { title: 'Audio Rooms', path: '/audio-rooms', icon: <Mic size={20} /> },
    { title: 'Notification', path: '/notifications', icon: <Bell size={20} /> },
    { title: 'Moderation', path: '/moderation', icon: <Shield size={20} /> },
    { title: 'Setting', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="branding">
        <div className="logo-square">
          <Layout size={24} color="white" />
        </div>
        <h1 className="logo-text">Admin</h1>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.subItems ? (
              <>
                <div 
                  className={`nav-link submenu-trigger ${expandedMenus.includes(item.title) ? 'active' : ''}`}
                  onClick={() => toggleMenu(item.title)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-title">{item.title}</span>
                  </div>
                  {expandedMenus.includes(item.title) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {expandedMenus.includes(item.title) && (
                  <div className="sub-menu-items" style={{ paddingLeft: '32px', marginTop: '4px' }}>
                    {item.subItems.map(sub => (
                      <NavLink 
                        key={sub.path} 
                        to={sub.path} 
                        className={({ isActive }) => `nav-link sub-link ${isActive ? 'active' : ''}`}
                        style={{ fontSize: '0.9rem', padding: '8px 12px' }}
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
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-title">{item.title}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          className="logout-btn" 
          onClick={onLogout}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', cursor: 'pointer' }}
        >
          <LogOut size={20} />
          <span>Power Off</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
