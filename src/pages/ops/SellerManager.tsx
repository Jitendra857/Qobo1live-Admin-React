import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  User, Plus, Search, MoreVertical,
  Shield, ShieldCheck, ShieldAlert, 
  BadgeCheck, Wallet, TrendingUp,
  ShoppingCart, Activity, History, Globe, X, 
  Check, PlusSquare, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/UserManagement.css';
import { scrollToModalTop } from '../../utils/scrollToModalTop';

const SellerManager: React.FC = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchSellers = async () => {
    try {
      const res = await adminService.listSellers();
      setSellers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleOpenEdit = (seller: any) => {
    setSelectedSeller(seller);
    setFormData({
      name: seller.name || '',
      email: seller.email || '',
      password: '', // Blank for edit
      whatsapp: seller.whatsapp || '',
      country: seller.country || '',
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
      country: '',
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
        // Update
        const { password, ...updateData } = formData;
        const finalData = password ? formData : updateData;
        await adminService.updateSeller(selectedSeller.id, finalData);
        toast.success('Seller updated successfully');
      } else {
        // Create
        await adminService.createSeller(formData);
        toast.success('Seller created successfully');
      }
      setShowSellerModal(false);
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
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
      fetchSellers();
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
      fetchSellers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleBadge = async (seller: any) => {
    try {
      await adminService.updateSeller(seller.id, { isOfficial: !seller.isOfficial });
      toast.success('Badge updated');
      fetchSellers();
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
            <h2 className="page-title">Coins Seller Forms</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage independent coin merchants, stock, and performance</p>
          </div>
          <button className="primary flex items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={20} /> Add New Seller
          </button>
        </div>
        
        <div className="top-tools mt-6">
          <div className="search-bar">
            <Search size={20} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container-premium mt-8">
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
                  </div>
                </td>
              </tr>
            ))}
            {filteredSellers.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No merchants found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Seller Modal (Add/Edit) */}
      {showSellerModal && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '650px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '40px', background: 'white', border: 'none' }}>
            {/* Modal Header */}
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '12px', color: '#3b82f6' }}>
                      <User size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2' }}>
                        {selectedSeller ? 'Modify Merchant' : 'Onboard Merchant'}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '2px' }}>
                        Define credentials and regional parameters
                      </p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setShowSellerModal(false)} 
                    style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:bg-slate-100"
                  >
                    <X size={22} />
                  </div>
               </div>
            </div>

            <div style={{ padding: '40px' }}>
              <form onSubmit={handleSaveSeller} className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Legal Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full"
                      style={{ 
                        padding: '20px 24px', 
                        borderRadius: '16px', 
                        border: '2px solid #e0e7ff', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#1e293b',
                        background: '#fff'
                      }}
                      placeholder="Enter merchant name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Gmail ID</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className="w-full"
                      style={{ 
                        padding: '20px 24px', 
                        borderRadius: '16px', 
                        border: '2px solid #e0e7ff', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#1e293b'
                      }}
                      placeholder="verified@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp ID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full"
                      style={{ 
                        padding: '20px 24px', 
                        borderRadius: '16px', 
                        border: '2px solid #e0e7ff', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#1e293b'
                      }}
                      placeholder="+91 00000 00000"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</label>
                  <div className="relative">
                    <select 
                      className="w-full"
                      style={{ 
                        padding: '20px 24px', 
                        borderRadius: '16px', 
                        border: '2px solid #e0e7ff', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#1e293b',
                        appearance: 'none',
                        background: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E") no-repeat right 1rem center/1.5em'
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
                </div>
                <div className="col-span-1">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Status</label>
                  <div className="radio-group" style={{ marginTop: 0 }}>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="sellerStatus" 
                        value="active"
                        checked={formData.status.toLowerCase() === 'active'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      />
                      <span>Active (1)</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="sellerStatus" 
                        value="inactive"
                        checked={formData.status.toLowerCase() === 'inactive'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      />
                      <span>Inactive (0)</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-1">
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Tier</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
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
                  <div className="col-span-2">
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Allocation</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="w-full"
                        style={{ 
                          padding: '20px 24px', 
                          borderRadius: '16px', 
                          border: '2px solid #e0e7ff', 
                          fontSize: '1rem', 
                          fontWeight: '800',
                          color: '#3b82f6',
                          background: '#f8faff'
                        }}
                        placeholder="0 Coins"
                        value={formData.coinsBalance}
                        onChange={e => setFormData({...formData, coinsBalance: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                )}
                <div className="col-span-2 mt-4">
                  <button 
                    type="submit" 
                    className="primary w-full py-6 text-lg font-black"
                    style={{ borderRadius: '24px', background: '#2563eb', border: 'none', color: 'white', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
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
            {/* Modal Header */}
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
                  <div 
                    onClick={() => setShowStockModal(false)} 
                    style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer' }}
                  >
                    <X size={22} />
                  </div>
               </div>
            </div>

            <div style={{ padding: '40px' }}>
              {/* Stats Card */}
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
                {/* Operation Selection (Radio Cards Style) */}
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operation Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div 
                      style={{ 
                        padding: '20px', 
                        borderRadius: '20px', 
                        border: '2px solid',
                        borderColor: stockData.type === 'TOPUP' ? '#3b82f6' : '#f1f5f9',
                        backgroundColor: stockData.type === 'TOPUP' ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
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
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Increment balance</span>
                    </div>

                    <div 
                      style={{ 
                        padding: '20px', 
                        borderRadius: '20px', 
                        border: '2px solid',
                        borderColor: stockData.type === 'DEDUCT' ? '#ef4444' : '#f1f5f9',
                        backgroundColor: stockData.type === 'DEDUCT' ? '#fef2f2' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
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
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subtract liquidity</span>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocation Quantity</label>
                  <input 
                    type="number" 
                    style={{ 
                      width: '100%', 
                      padding: '24px', 
                      fontSize: '2rem', 
                      fontWeight: '900', 
                      textAlign: 'center',
                      color: '#1e293b',
                      background: '#fff',
                      borderRadius: '20px',
                      border: '2px solid #e0e7ff'
                    }}
                    placeholder="0"
                    value={stockData.amount || ''}
                    onChange={e => setStockData({...stockData, amount: Number(e.target.value)})}
                    required
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                   <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Synchronized Outcome</span>
                   <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                    {(stockData.type === 'TOPUP' 
                      ? (selectedSeller.coinsBalance + stockData.amount) 
                      : (selectedSeller.coinsBalance - stockData.amount)).toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.4 }}>Coins</span>
                   </div>
                </div>

                <button 
                  type="submit" 
                  className="primary" 
                  style={{ 
                    width: '100%', 
                    padding: '24px', 
                    fontSize: '1.1rem', 
                    fontWeight: '900',
                    borderRadius: '24px',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
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
            {/* Modal Header */}
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div style={{ background: '#ecfdf5', borderRadius: '16px', padding: '12px', color: '#10b981' }}>
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2' }}>Performance Analysis</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '2px' }}>Real-time analytics and transaction history</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setShowReportsModal(false)} 
                    style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer' }}
                  >
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
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{reports.metrics.totalRevenue.toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>INR</span></div>
                </div>
                <div className="p-8 bg-emerald-50/50 rounded-3xl border-2 border-emerald-100/50">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <ShoppingCart size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume Distributed</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{reports.metrics.totalCoinsSold.toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Tokens</span></div>
                </div>
                <div className="p-8 bg-purple-50/50 rounded-3xl border-2 border-purple-100/50">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Activity size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings (5%)</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{(reports.metrics.totalRevenue * 0.05).toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>INR</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={22} className="text-slate-400" /> Transaction Log
                </h4>
                <div style={{ padding: '8px 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                  Total operations recorded: {reports.history.length}
                </div>
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
                    {reports.history.map((sale: any) => (
                      <tr key={sale.id} className="row-premium" style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '24px' }} className="text-sm font-medium text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '24px' }}>
                          <div className="flex items-center gap-3">
                            <div className="avatar-glass" style={{ width: '40px', height: '40px', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', fontWeight: '800' }}>{sale.user.name.charAt(0)}</div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">{sale.user.name}</div>
                                <div className="text-xs text-slate-400">Verified Consumer</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '24px', textAlign: 'center' }} className="font-extrabold text-blue-600">{sale.amount.toLocaleString()}</td>
                        <td style={{ padding: '24px', textAlign: 'right' }} className="font-extrabold text-slate-800">{sale.price.toLocaleString()} {sale.currency}</td>
                      </tr>
                    ))}
                    {reports.history.length === 0 && (
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
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .row-premium:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default SellerManager;
