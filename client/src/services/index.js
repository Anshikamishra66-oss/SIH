import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const farmerService = {
  getProfile: () => api.get('/farmers/profile'),
  updateProfile: (data) => api.put('/farmers/profile', data),
  getHistory: (params) => api.get('/farmers/history', { params }),
};

export const centreService = {
  getCentres: (params) => api.get('/centres', { params }),
  getCentreById: (id) => api.get(`/centres/${id}`),
  getCentreSlots: (id, date) => api.get(`/centres/${id}/slots`, { params: { date } }),
};

export const cropService = {
  getCrops: () => api.get('/crops'),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.put(`/bookings/${id}/cancel`, data),
};

export const queueService = {
  getLiveQueue: (centreId, date) => api.get(`/queue/${centreId}/live`, { params: { date } }),
  getMyPosition: (centreId, token, date) =>
    api.get(`/queue/${centreId}/position`, { params: { token, date } }),
  markArrived: (token, centreId) => api.put(`/queue/${token}/arrived`, { centreId }),
  callToken: (token, centreId, counter) => api.put(`/queue/${token}/call`, { centreId, counter }),
  completeToken: (token, centreId) => api.put(`/queue/${token}/complete`, { centreId }),
  callNext: (centreId, counter) => api.post('/queue/call-next', { centreId, counter }),
};

export const procurementService = {
  getProcurement: (id) => api.get(`/procurements/${id}`),
  createProcurement: (data) => api.post('/procurements', data),
  updateStatus: (id, data) => api.put(`/procurements/${id}/status`, data),
};

export const paymentService = {
  getPayment: (id) => api.get(`/payments/${id}`),
  getMyPayments: () => api.get('/payments/my'),
  updateStatus: (id, action, data) => api.put(`/payments/${id}/status`, { action, ...data }),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const officerService = {
  getDashboard: () => api.get('/officer/dashboard'),
  getBookings: (params) => api.get('/officer/bookings', { params }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFarmers: (params) => api.get('/admin/farmers', { params }),
  toggleFarmerStatus: (id) => api.put(`/admin/farmers/${id}/toggle`),
  getOfficers: () => api.get('/admin/officers'),
  createOfficer: (data) => api.post('/admin/officers', data),
  getCentres: () => api.get('/admin/centres'),
  createCentre: (data) => api.post('/admin/centres', data),
  updateCentre: (id, data) => api.put(`/admin/centres/${id}`, data),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getCrops: () => api.get('/admin/crops'),
  createCrop: (data) => api.post('/admin/crops', data),
  updateCrop: (id, data) => api.put(`/admin/crops/${id}`, data),
  generateSlots: (data) => api.post('/admin/slots/generate', data),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};
