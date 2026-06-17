import axios from 'axios';

// Dynamically resolve backend url: fallback to live URL when running in browser on Render/production, or use localhost in development.
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.startsWith('192.168.'));

// Always point to the live backend for testing, since local backend isn't running
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://my-backend-api-960q.onrender.com';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 60000,
});

// Using dynamic token management for production readiness
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic redirect on expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  manageAdmin: (action: string, data: any, id?: string) => 
    api.post(`/admin/admin-action?action=${action}${id ? `&id=${id}` : ''}`, data),
  getTickets: () => api.get('/admin/tickets'),
  resolveTicket: (id: string) => api.put(`/admin/ticket/${id}/resolve`),
  getHelpTickets: () => api.get('/admin/help-tickets'),
  resolveHelpTicket: (id: string) => api.put(`/admin/help-ticket/${id}/resolve`),
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
  controlSimulation: (action: string, data: any, id?: string) => 
    api.post(`/admin/simulation/control?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Ambience & Assets
  getBackgrounds: () => api.get('/admin/ambience/backgrounds'),
  manageAmbience: (action: string, data: any, id?: string) => 
    api.post(`/admin/ambience/action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // PK Battle Management
  getPKBattles: () => api.get('/admin/pk-battles'),

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
  approveAgency: (data: { agency_id: string; status: string }) => 
    api.post('/admin/agency-approve', data),
  
  // Seller Management
  listSellers: () => api.get('/admin/sellers'),
  createSeller: (data: any) => api.post('/admin/seller-create', data),
  updateSeller: (id: string, data: any) => api.put(`/admin/seller/${id}`, data),
  manageSellerStock: (data: { sellerId: string; amount: number; type: 'TOPUP' | 'DEDUCT' }) => 
    api.post('/admin/seller-stock', data),
  getSellerReports: (id: string) => api.get(`/admin/seller-reports/${id}`),

  // Agency Extensions
  getAgencyRevenue: () => api.get('/agency/revenue'),
  getGlobalAgencyStats: () => api.get('/admin/agency-stats'),
  payoutAgency: (data: { agencyId: string }) => api.post('/admin/agency-payout', data),
  getAgencyLink: (agencyId: string) => api.get(`/admin/agency-link?agency_id=${agencyId}`),

  // PK & Dating
  getPKStatus: (battleId: string) => api.get(`/pk/status?battle_id=${battleId}`),

  // VIP Management
  getVipPackages: () => api.get('/admin/vip-list'),
  manageVipPackage: (action: string, data: any, id?: string) => 
    api.post(`/admin/vip-action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Moderation
  getModerationStats: () => api.get('/admin/moderation/stats'),
  getReports: () => api.get('/admin/moderation/reports'),
  resolveReport: (id: string) => api.post(`/admin/moderation/reports/${id}/resolve`),
  getBannedWords: () => api.get('/admin/moderation/words'),
  manageBannedWord: (data: { action: 'ADD' | 'REMOVE'; word?: string; id?: string }) => 
    api.post('/admin/moderation/word-action', data),

  // Payment Gateways
  getGateways: () => api.get('/admin/gateway-list'),
  manageGateway: (action: string, data: any, id?: string) => 
    api.post(`/admin/gateway-action?action=${action}${id ? `&id=${id}` : ''}`, data),

  // Tracking
  getAgencyTracking: () => api.get('/admin/agency-tracking'),
  getHostTracking: () => api.get('/admin/host-tracking'),
  clearEconomyData: () => api.get('/clean-economy-test'),
};

export default api;
