import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Using dynamic token management for production readiness
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  getStats: (country?: string) => api.get(`/admin/stats${country ? `?country=${country}` : ''}`),
  getLeaderboard: (type: 'GIFTER' | 'RECEIVER', period: 'DAILY' | 'WEEKLY' | 'ALL_TIME') => 
    api.get(`/admin/leaderboard?type=${type}&period=${period}`),
  login: (data: any) => api.post('/admin/login', data),
  getUsers: (search?: string) => api.get(`/admin/user-list${search ? `?search=${search}` : ''}`),
  createUser: (data: any) => api.post('/admin/user-create', data),
  updateUser: (id: string, data: any) => api.put(`/admin/user/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/user/${id}`),
  getLoginMulti: (data: any) => api.post('/admin/login-multi', data),
  getHosts: () => api.get('/admin/host-list'),
  getPackages: () => api.get('/admin/package-list'),
  getGifts: () => api.get('/admin/gift-list'),
  getGiftStats: () => api.get('/admin/gift-stats'),
  manageGift: (action: string, data: any, id?: string) => 
    api.post(`/admin/gift-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  managePackage: (action: string, data: any, id?: string) => 
    api.post(`/admin/package-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  getCategories: () => api.get('/admin/category-list'),
  manageCategory: (action: string, data: any, id?: string) => 
    api.post(`/admin/category-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  getAgencies: () => api.get('/admin/agency-list'),
  getWithdrawals: () => api.get('/admin/withdrawals'),
  getTransactions: (page?: number, limit?: number) => api.get(`/admin/transactions${page ? `?page=${page}` : ''}${limit ? `${page ? '&' : '?'}limit=${limit}` : ''}`),
  processWithdrawal: (data: { id: string; status: string }) => 
    api.post('/admin/withdrawal-process', data),
  getAdmins: () => api.get('/admin/admins'),
  getTickets: () => api.get('/admin/tickets'),
  resolveTicket: (id: string) => api.put(`/admin/ticket/${id}/resolve`),
  getAds: () => api.get('/admin/ads-config'),
  manageAd: (action: string, data: any, id?: string) => 
    api.post(`/admin/ad-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  getGames: () => api.get('/admin/games'),
  updateGame: (id: string, data: any) => api.put(`/admin/game/${id}`, data),
  getTasks: () => api.get('/admin/tasks'),
  manageTask: (action: string, data: any, id?: string) => 
    api.post(`/admin/task-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  // Simulation & Bots
  getBots: () => api.get('/admin/simulation/bots'),
  manageBot: (action: string, data: any, id?: string) => 
    api.post(`/admin/simulation/bot-action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Ambience & Assets
  getBackgrounds: () => api.get('/admin/ambience/backgrounds'),
  manageAmbience: (action: string, data: any, id?: string) => 
    api.post(`/admin/ambience/action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Room Configuration
  getRooms: () => api.get('/admin/rooms'),
  updateRoomConfig: (data: any) => api.put('/admin/rooms/config', data),

  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  sendBroadcast: (data: any) => api.post('/admin/notifications/send', data),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (data: any) => api.put('/admin/settings/update', data),

  assignCoins: (data: { user_id: string; amount: number; type: 'coins' | 'diamonds' }) => 
    api.post('/admin/assign-coins', data),
  approveHost: (data: { application_id: string; status: string }) => 
    api.post('/admin/host-approve', data),
  
  // Seller Management
  listSellers: () => api.get('/admin/sellers'),
  createSeller: (data: any) => api.post('/admin/seller-create', data),
  updateSeller: (id: string, data: any) => api.put(`/admin/seller/${id}`, data),
  manageSellerStock: (data: { sellerId: string; amount: number; type: 'TOPUP' | 'DEDUCT' }) => 
    api.post('/admin/seller-stock', data),
  getSellerReports: (id: string) => api.get(`/admin/seller-reports/${id}`),

  // Agency Extensions
  getAgencyRevenue: () => api.get('/agency/revenue'),
  payoutAgency: (data: { agencyId: string }) => api.post('/agency/payout', data),

  // PK & Dating
  getPKStatus: (battleId: string) => api.get(`/pk/status?battle_id=${battleId}`),

  // VIP Management
  getVipPackages: () => api.get('/admin/vip-list'),
  manageVipPackage: (action: string, data: any, id?: string) => 
    api.post(`/admin/vip-action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Moderation
  getBannedWords: () => api.get('/admin/moderation/words'),
  manageBannedWord: (data: { action: 'ADD' | 'REMOVE'; word?: string; id?: string }) => 
    api.post('/admin/moderation/word-action', data),
};

export default api;
