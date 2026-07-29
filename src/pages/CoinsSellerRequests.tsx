import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import api from '../services/api';
import { 
  User, Plus, Search, MoreVertical,
  Shield, ShieldCheck, ShieldAlert, 
  BadgeCheck, Wallet, TrendingUp,
  ShoppingCart, Activity, History, Globe, X, 
  Check, PlusSquare, Minus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/UserManagement.css';
import { scrollToModalTop } from '../utils/scrollToModalTop';

interface Application {
  id: string;
  status: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    displayPicture: string;
  };
}

const CoinsSellerRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Active Sellers');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [sellers, setSellers] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  
  // Selected Data
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    country: '',
    coinsBalance: 0,
    status: 'Active',
    isOfficial: false
  });
  const [stockData, setStockData] = useState({
    amount: 0,
    type: 'TOPUP' as 'TOPUP' | 'DEDUCT'
  });
  const [reports, setReports] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Active Sellers') {
        const res = await adminService.listSellers();
        setSellers(res.data.data || []);
      } else {
        const statusStr = activeTab === 'Pending Applications' ? 'pending' : 'rejected';
        const response = await api.get(`/admin/coins-seller-applications?status=${statusStr}`);
        if (response.data.statusCode === 1) {
          setApplications(response.data.data || []);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- APPLICATIONS LOGIC ---
  const handleApprove = async (id: string) => {
    try {
      const response = await api.post(`/admin/coins-seller-applications/${id}/approve`);
      if (response.data.statusCode === 1) {
        toast.success('Application approved. Merchant portal account generated.');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.post(`/admin/coins-seller-applications/${id}/reject`);
      if (response.data.statusCode === 1) {
        toast.success('Application rejected successfully');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  // --- SELLERS LOGIC ---
  const handleOpenEdit = (seller: any) => {
    setSelectedSeller(seller);
    setFormData({
      name: seller.name || '',
      email: seller.email || '',
      password: '', // Blank for edit
      whatsapp: seller.whatsapp || '',
      country: seller.country || 'Global',
      coinsBalance: seller.coinsBalance || 0,
      status: seller.status || 'Active',
      isOfficial: seller.isOfficial || false
    });
    setShowSellerModal(true);
    scrollToModalTop();
  };

  const handleOpenCreate = () => {
    setSelectedSeller(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      whatsapp: '',
      country: 'Global',
      coinsBalance: 0,
      status: 'Active',
      isOfficial: false
    });
    setShowSellerModal(true);
    scrollToModalTop();
  };

  const handleOpenStock = (seller: any) => {
    setSelectedSeller(seller);
    setStockData({ amount: 0, type: 'TOPUP' });
    setShowStockModal(true);
    scrollToModalTop();
  };

  const handleSaveSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSeller) {
        const { password, ...updateData } = formData;
        const finalData = password ? formData : updateData;
        await adminService.updateSeller(selectedSeller.id, finalData);
        toast.success('Seller updated successfully');
      } else {
        await adminService.createSeller(formData);
        toast.success('Seller created successfully');
      }
      setShowSellerModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (window.confirm("Are you sure you want to remove this seller? Their portal access will be deleted and mobile privileges revoked.")) {
      try {
        await adminService.deleteSeller(sellerId);
        toast.success('Seller completely removed');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to remove seller');
      }
    }
  };

  const handleStockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.manageSellerStock({
        sellerId: selectedSeller.id,
        amount: stockData.amount,
        type: stockData.type
      });
      toast.success(`Stock ${stockData.type.toLowerCase()} successful`);
      setShowStockModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleOpenReports = async (seller: any) => {
    setSelectedSeller(seller);
    setLoading(true);
    scrollToModalTop();
    try {
      const res = await adminService.getSellerReports(seller.id);
      setReports(res.data.data);
      setShowReportsModal(true);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (seller: any) => {
    try {
      const newStatus = seller.status === 'active' ? 'inactive' : 'active';
      await adminService.updateSeller(seller.id, { status: newStatus });
      toast.success(`Seller is now ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleBadge = async (seller: any) => {
    try {
      await adminService.updateSeller(seller.id, { isOfficial: !seller.isOfficial });
      toast.success('Badge updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update badge');
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="page-title">Unified Coins Sellers</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage active merchants, allocate stock, and review mobile applications</p>
          </div>
          {activeTab === 'Active Sellers' && (
            <button className="primary flex items-center gap-2" onClick={handleOpenCreate}>
              <Plus size={20} /> Add New Seller
            </button>
          )}
        </div>
        
        <div className="top-tools mt-6">
          <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
            {['Active Sellers', 'Pending Applications', 'Rejected Applications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: activeTab === tab ? 'none' : '1px solid #e2e8f0',
                  background: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Active Sellers' && (
            <div className="search-bar">
              <Search size={20} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search merchants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="table-container-premium mt-8">
        {activeTab === 'Active Sellers' ? (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Merchant Info</th>
                <th>Region</th>
                <th>Current Balance</th>
                <th>Official Badge</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="row-premium">
                  <td>
                    <div className="identity-block">
                      <div className="avatar-glass">
                        {seller.name?.charAt(0) || 'S'}
                      </div>
                      <div className="identity-text">
                        <span className="name-bold">{seller.name}</span>
                        <span className="email-sub">{seller.email}</span>
                        <span className="id-sub" style={{ fontSize: '10px' }}>ID: {seller.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Globe size={14} />
                      <span>{seller.country || 'Global'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="asset-tag coins">
                      <Wallet size={14} />
                      <span>{seller.coinsBalance.toLocaleString()} Coins</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className={`icon-btn ${seller.isOfficial ? 'text-blue-500' : 'text-slate-400'}`}
                      onClick={() => handleToggleBadge(seller)}
                      title="Toggle Official Badge"
                    >
                      <BadgeCheck size={20} fill={seller.isOfficial ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-pill ${seller.status === 'active' ? 'active' : 'inactive'}`} style={{ 
                        background: seller.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: seller.status === 'active' ? '#22c55e' : '#ef4444'
                      }}>
                        {seller.status || 'ACTIVE'}
                      </span>
                      <button 
                        className={`icon-btn ${seller.status === 'active' ? 'text-green-500' : 'text-danger'}`}
                        onClick={() => handleToggleStatus(seller)}
                      >
                        {seller.status === 'active' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="ops-cluster">
                      <button className="op-btn wide coin" onClick={() => handleOpenStock(seller)}>
                        <Plus size={16} /> Stock
                      </button>
                      <button className="op-btn wide" onClick={() => handleOpenReports(seller)}>
                        <TrendingUp size={16} /> Reports
                      </button>
                      <button className="op-btn edit" onClick={() => handleOpenEdit(seller)}>
                        <MoreVertical size={18} />
                      </button>
                      <button className="op-btn text-danger ml-2" onClick={() => handleDeleteSeller(seller.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSellers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No merchants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Applicant Info</th>
                <th>Application Details</th>
                <th>Date Submitted</th>
                <th>Status</th>
                {activeTab === 'Pending Applications' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="row-premium">
                    <td>
                      <div className="identity-block">
                        <div className="avatar-glass">
                          {app.user?.displayPicture ? (
                             <img src={app.user.displayPicture} alt={app.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                             app.user?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="identity-text">
                          <span className="name-bold">{app.user?.name || 'Unknown User'}</span>
                          <span className="email-sub">{app.user?.email || app.user?.phone || 'No Contact'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.details}>
                      {app.details || 'No details provided'}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: app.status === 'approved' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                        color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991b1b' : '#854d0e'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    {activeTab === 'Pending Applications' && (
                      <td style={{ textAlign: 'right' }}>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="primary" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleApprove(app.id)}
                            >
                              Approve
                            </button>
                            <button 
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              onClick={() => handleReject(app.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            Action Taken
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Seller Modal (Add/Edit) */}
      {showSellerModal && (
        <div className="modal-overlay">
          <div className="modal-content bento-card slim-scroll" style={{ maxWidth: '600px', width: '95%', padding: '0', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden', borderRadius: '32px', background: 'white', border: 'none' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
               <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                 <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '16px', color: '#3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <User size={32} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <h3 style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '900', lineHeight: '1.2', margin: 0 }}>
                     {selectedSeller ? 'Modify Merchant' : 'Onboard Merchant'}
                   </h3>
                   <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
                     Define credentials and regional parameters
                   </p>
                 </div>
               </div>
               <div 
                 onClick={() => setShowSellerModal(false)} 
                 style={{ background: '#f1f5f9', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', border: 'none' }}
               >
                 <X size={24} />
               </div>
            </div>

            <div style={{ padding: '32px' }}>
              <form onSubmit={handleSaveSeller} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Legal Name</label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                      fontSize: '1rem', fontWeight: '600', color: '#1e293b', outline: 'none'
                    }}
                    placeholder="Enter merchant name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Gmail ID</label>
                  <input 
                    type="email" 
                    style={{ 
                      width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                      fontSize: '1rem', fontWeight: '600', color: '#1e293b', outline: 'none'
                    }}
                    placeholder="verified@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <input 
                    type="password" 
                    style={{ 
                      width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                      fontSize: '1rem', fontWeight: '600', color: '#1e293b', outline: 'none'
                    }}
                    placeholder={selectedSeller ? "Leave blank to keep unchanged" : "Set secure password"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!selectedSeller}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp ID</label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                      fontSize: '1rem', fontWeight: '600', color: '#1e293b', outline: 'none'
                    }}
                    placeholder="+91 00000 00000"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</label>
                  <select 
                    style={{ 
                      width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                      fontSize: '1rem', fontWeight: '600', color: '#1e293b', outline: 'none', background: '#fff'
                    }}
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="Global">Global</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Status</label>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 12px', background: formData.status.toLowerCase() === 'active' ? '#eff6ff' : '#f8fafc', border: '2px solid', borderColor: formData.status.toLowerCase() === 'active' ? '#3b82f6' : '#e0e7ff', borderRadius: '16px', cursor: 'pointer' }}>
                      <input type="radio" name="sellerStatus" value="active" checked={formData.status.toLowerCase() === 'active'} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '16px', height: '16px', accentColor: '#3b82f6', margin: 0 }} />
                      <span style={{ fontWeight: 800, color: formData.status.toLowerCase() === 'active' ? '#1e293b' : '#64748b' }}>Active</span>
                    </label>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 12px', background: formData.status.toLowerCase() === 'inactive' ? '#fef2f2' : '#f8fafc', border: '2px solid', borderColor: formData.status.toLowerCase() === 'inactive' ? '#ef4444' : '#e0e7ff', borderRadius: '16px', cursor: 'pointer' }}>
                      <input type="radio" name="sellerStatus" value="inactive" checked={formData.status.toLowerCase() === 'inactive'} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '16px', height: '16px', accentColor: '#ef4444', margin: 0 }} />
                      <span style={{ fontWeight: 800, color: formData.status.toLowerCase() === 'inactive' ? '#1e293b' : '#64748b' }}>Inactive</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Tier</label>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                    <div 
                      onClick={() => setFormData({...formData, isOfficial: true})}
                      style={{ 
                        flex: 1, padding: '16px', borderRadius: '16px', border: '2px solid',
                        borderColor: formData.isOfficial ? '#3b82f6' : '#f1f5f9',
                        background: formData.isOfficial ? '#eff6ff' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <Shield size={16} className="text-blue-500" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: formData.isOfficial ? '#1e293b' : '#64748b' }}>Official</span>
                      {formData.isOfficial && <Check size={14} className="ml-auto text-blue-600" />}
                    </div>
                    <div 
                      onClick={() => setFormData({...formData, isOfficial: false})}
                      style={{ 
                        flex: 1, padding: '16px', borderRadius: '16px', border: '2px solid',
                        borderColor: !formData.isOfficial ? '#3b82f6' : '#f1f5f9',
                        background: !formData.isOfficial ? '#eff6ff' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <User size={16} className="text-slate-400" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: !formData.isOfficial ? '#1e293b' : '#64748b' }}>Merchant</span>
                      {!formData.isOfficial && <Check size={14} className="ml-auto text-blue-600" />}
                    </div>
                  </div>
                </div>
                {!selectedSeller && (
                  <div>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Allocation</label>
                    <input 
                      type="number" 
                      style={{ 
                        width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', 
                        fontSize: '1rem', fontWeight: '800', color: '#3b82f6', background: '#f8faff', outline: 'none'
                      }}
                      placeholder="0 Coins"
                      value={formData.coinsBalance}
                      onChange={e => setFormData({...formData, coinsBalance: Number(e.target.value)})}
                    />
                  </div>
                )}
                <div style={{ marginTop: '16px' }}>
                  <button 
                    type="submit" 
                    className="primary w-full text-lg font-black"
                    style={{ padding: '20px', borderRadius: '20px', background: '#2563eb', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                  >
                    {selectedSeller ? 'Save Configuration' : 'Sync Parameters'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {showStockModal && selectedSeller && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '550px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '40px', background: 'white', border: 'none' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '12px', color: '#3b82f6' }}>
                      <Wallet size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2' }}>Inventory Control</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '2px' }}>Merchant: {selectedSeller.name}</p>
                    </div>
                  </div>
                  <div onClick={() => setShowStockModal(false)} style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer' }}>
                    <X size={22} />
                  </div>
               </div>
            </div>

            <div style={{ padding: '40px' }}>
              <div style={{ background: '#f8faff', padding: '24px', borderRadius: '24px', border: '2px solid #e0e7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ background: 'white', padding: '10px', borderRadius: '12px', color: '#3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <PlusSquare size={20} />
                  </div>
                  <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Liquidity</span>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2563eb' }}>
                  {selectedSeller.coinsBalance.toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>COINS</span>
                </span>
              </div>

              <form onSubmit={handleStockAction} className="flex flex-col gap-8">
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operation Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div 
                      style={{ 
                        padding: '20px', borderRadius: '20px', border: '2px solid',
                        borderColor: stockData.type === 'TOPUP' ? '#3b82f6' : '#f1f5f9',
                        backgroundColor: stockData.type === 'TOPUP' ? '#eff6ff' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}
                      onClick={() => setStockData({...stockData, type: 'TOPUP'})}
                    >
                      <div className="flex items-center justify-between">
                        <Plus size={20} style={{ color: stockData.type === 'TOPUP' ? '#3b82f6' : '#94a3b8' }} />
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: stockData.type === 'TOPUP' ? '#3b82f6' : '#cbd5e1', position: 'relative' }}>
                          {stockData.type === 'TOPUP' && <div style={{ position: 'absolute', top: '3px', left: '3px', right: '3px', bottom: '3px', background: '#3b82f6', borderRadius: '50%' }} />}
                        </div>
                      </div>
                      <span style={{ fontWeight: '800', color: stockData.type === 'TOPUP' ? '#1e293b' : '#64748b' }}>Stock Top-up</span>
                    </div>

                    <div 
                      style={{ 
                        padding: '20px', borderRadius: '20px', border: '2px solid',
                        borderColor: stockData.type === 'DEDUCT' ? '#ef4444' : '#f1f5f9',
                        backgroundColor: stockData.type === 'DEDUCT' ? '#fef2f2' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}
                      onClick={() => setStockData({...stockData, type: 'DEDUCT'})}
                    >
                      <div className="flex items-center justify-between">
                        <Minus size={20} style={{ color: stockData.type === 'DEDUCT' ? '#ef4444' : '#94a3b8' }} />
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: stockData.type === 'DEDUCT' ? '#ef4444' : '#cbd5e1', position: 'relative' }}>
                          {stockData.type === 'DEDUCT' && <div style={{ position: 'absolute', top: '3px', left: '3px', right: '3px', bottom: '3px', background: '#ef4444', borderRadius: '50%' }} />}
                        </div>
                      </div>
                      <span style={{ fontWeight: '800', color: stockData.type === 'DEDUCT' ? '#1e293b' : '#64748b' }}>Stock Deduction</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocation Quantity</label>
                  <input 
                    type="number" 
                    style={{ 
                      width: '100%', padding: '24px', fontSize: '2rem', fontWeight: '900', textAlign: 'center',
                      color: '#1e293b', background: '#fff', borderRadius: '20px', border: '2px solid #e0e7ff'
                    }}
                    placeholder="0"
                    value={stockData.amount || ''}
                    onChange={e => setStockData({...stockData, amount: Number(e.target.value)})}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="primary" 
                  style={{ 
                    width: '100%', padding: '24px', fontSize: '1.1rem', fontWeight: '900', borderRadius: '24px',
                    border: 'none', color: 'white', cursor: 'pointer',
                    background: stockData.type === 'TOPUP' ? '#2563eb' : '#dc2626',
                    boxShadow: stockData.type === 'TOPUP' ? '0 8px 16px rgba(37, 99, 235, 0.2)' : '0 8px 16px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  Confirm Allocation
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Performance Modal */}
      {showReportsModal && selectedSeller && reports && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '40px', padding: '0', border: 'none' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div style={{ background: '#ecfdf5', borderRadius: '16px', padding: '12px', color: '#10b981' }}>
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2' }}>Performance Analysis</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '2px' }}>Merchant: {selectedSeller.name}</p>
                    </div>
                  </div>
                  <div onClick={() => setShowReportsModal(false)} style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer' }}>
                    <X size={22} />
                  </div>
               </div>
            </div>

            <div style={{ padding: '40px' }}>
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="p-8 bg-blue-50/50 rounded-3xl border-2 border-blue-100/50">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Wallet size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Generated</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{reports.metrics?.totalRevenue?.toLocaleString() || 0} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>INR</span></div>
                </div>
                <div className="p-8 bg-emerald-50/50 rounded-3xl border-2 border-emerald-100/50">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <ShoppingCart size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume Distributed</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{reports.metrics?.totalCoinsSold?.toLocaleString() || 0} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Tokens</span></div>
                </div>
                <div className="p-8 bg-purple-50/50 rounded-3xl border-2 border-purple-100/50">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Activity size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{reports.metrics?.totalTransactions?.toLocaleString() || 0}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={22} className="text-slate-400" /> Transaction Log
                </h4>
              </div>

              <div className="table-container-premium" style={{ borderRadius: '28px', border: '2px solid #f1f5f9', overflow: 'hidden' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '24px' }}>Timestamp</th>
                      <th style={{ padding: '24px' }}>End User</th>
                      <th style={{ padding: '24px', textAlign: 'center' }}>Token Qty</th>
                      <th style={{ padding: '24px', textAlign: 'right' }}>Sale Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.history?.map((sale: any) => (
                      <tr key={sale.id} className="row-premium" style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '24px' }} className="text-sm font-medium text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '24px' }}>
                          <div className="flex items-center gap-3">
                            <div className="avatar-glass" style={{ width: '40px', height: '40px', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', fontWeight: '800' }}>{sale.user?.name?.charAt(0) || 'U'}</div>
                            <div className="text-sm font-bold text-slate-800">{sale.user?.name || 'User'}</div>
                          </div>
                        </td>
                        <td style={{ padding: '24px', textAlign: 'center' }} className="font-extrabold text-blue-600">{sale.amount?.toLocaleString()}</td>
                        <td style={{ padding: '24px', textAlign: 'right' }} className="font-extrabold text-slate-800">{sale.price?.toLocaleString()} {sale.currency}</td>
                      </tr>
                    ))}
                    {(!reports.history || reports.history.length === 0) && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600' }}>No transactional data found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .row-premium:hover { background: #f8fafc !important; }
        .slim-scroll::-webkit-scrollbar { width: 6px; }
        .slim-scroll::-webkit-scrollbar-track { background: transparent; }
        .slim-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .slim-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default CoinsSellerRequests;
