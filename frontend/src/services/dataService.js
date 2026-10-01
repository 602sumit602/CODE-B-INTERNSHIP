import api from './api';

// Auth Services
export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getCurrentUser: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/profile/change-password', data),
  logout: () => api.post('/api/auth/logout'),
};

// User Management (Admin Only)
export const userService = {
  getUsers: (params) => api.get('/api/users', { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/api/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// Client Management
export const clientService = {
  getClients: (params) => api.get('/api/clients', { params }),
  getActiveClients: () => api.get('/api/clients/active'),
  getClientById: (id) => api.get(`/api/clients/${id}`),
  createClient: (data) => api.post('/api/clients', data),
  updateClient: (id, data) => api.put(`/api/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/api/clients/${id}`),
  getClientEstimates: (id) => api.get(`/api/clients/${id}/estimates`),
  getClientInvoices: (id) => api.get(`/api/clients/${id}/invoices`),
  getClientPayments: (id) => api.get(`/api/clients/${id}/payments`),
};

// Group Management
export const groupService = {
  getGroups: (params) => api.get('/api/groups', { params }),
  getActiveGroups: () => api.get('/api/groups/active'),
  getGroupById: (id) => api.get(`/api/groups/${id}`),
  createGroup: (data) => api.post('/api/groups', data),
  updateGroup: (id, data) => api.put(`/api/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/api/groups/${id}`),
};

// Chain Management
export const chainService = {
  getChains: (params) => api.get('/api/chains', { params }),
  getActiveChains: () => api.get('/api/chains/active'),
  getChainsByGroup: (groupId) => api.get(`/api/chains/by-group/${groupId}`),
  getChainById: (id) => api.get(`/api/chains/${id}`),
  createChain: (data) => api.post('/api/chains', data),
  updateChain: (id, data) => api.put(`/api/chains/${id}`, data),
  deleteChain: (id) => api.delete(`/api/chains/${id}`),
};

// Brand Management
export const brandService = {
  getBrands: (params) => api.get('/api/brands', { params }),
  getActiveBrands: () => api.get('/api/brands/active'),
  getBrandsByChain: (chainId) => api.get(`/api/brands/by-chain/${chainId}`),
  getBrandById: (id) => api.get(`/api/brands/${id}`),
  createBrand: (data) => api.post('/api/brands', data),
  updateBrand: (id, data) => api.put(`/api/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/api/brands/${id}`),
};

// Subzone Management
export const subzoneService = {
  getSubzones: (params) => api.get('/api/subzones', { params }),
  getActiveSubzones: () => api.get('/api/subzones/active'),
  getSubzoneById: (id) => api.get(`/api/subzones/${id}`),
  createSubzone: (data) => api.post('/api/subzones', data),
  updateSubzone: (id, data) => api.put(`/api/subzones/${id}`, data),
  deleteSubzone: (id) => api.delete(`/api/subzones/${id}`),
};

// Estimate Management
export const estimateService = {
  getEstimates: (params) => api.get('/api/estimates', { params }),
  getEstimateById: (id) => api.get(`/api/estimates/${id}`),
  createEstimate: (data) => api.post('/api/estimates', data),
  updateEstimate: (id, data) => api.put(`/api/estimates/${id}`, data),
  approveEstimate: (id) => api.post(`/api/estimates/${id}/approve`),
  rejectEstimate: (id) => api.post(`/api/estimates/${id}/reject`),
  convertToInvoice: (id) => api.post(`/api/estimates/${id}/convert-to-invoice`),
  deleteEstimate: (id) => api.delete(`/api/estimates/${id}`),
};

// Invoice Management
export const invoiceService = {
  getInvoices: (params) => api.get('/api/invoices', { params }),
  getInvoiceById: (id) => api.get(`/api/invoices/${id}`),
  createInvoice: (data) => api.post('/api/invoices', data),
  updateInvoice: (id, data) => api.put(`/api/invoices/${id}`, data),
  cancelInvoice: (id) => api.post(`/api/invoices/${id}/cancel`),
  deleteInvoice: (id) => api.delete(`/api/invoices/${id}`),
  getPdfUrl: (id) => `/api/invoices/${id}/pdf`,
};

// Payment Management
export const paymentService = {
  getPayments: (params) => api.get('/api/payments', { params }),
  getPaymentById: (id) => api.get(`/api/payments/${id}`),
  getPaymentsByInvoice: (invoiceId) => api.get(`/api/payments/invoice/${invoiceId}`),
  recordPayment: (data) => api.post('/api/payments', data),
  updateStatus: (id, status) => api.patch(`/api/payments/${id}/status?status=${status}`),
};

// Dashboard & Reports
export const dashboardService = {
  getSummary: () => api.get('/api/dashboard/summary'),
};

export const reportService = {
  getSalesReport: (params) => api.get('/api/reports/sales', { params }),
  getOutstandingReport: (params) => api.get('/api/reports/outstanding', { params }),
  exportInvoicesCsv: () => api.get('/api/reports/export/invoices', { responseType: 'blob' }),
  exportEstimatesCsv: () => api.get('/api/reports/export/estimates', { responseType: 'blob' }),
  exportPaymentsCsv: () => api.get('/api/reports/export/payments', { responseType: 'blob' }),
  exportClientsCsv: () => api.get('/api/reports/export/clients', { responseType: 'blob' }),
};

// Settings & Audit Logs
export const settingService = {
  getSettings: () => api.get('/api/settings'),
  updateSetting: (key, data) => api.put(`/api/settings/${key}`, data),
};

export const auditService = {
  getAuditLogs: (params) => api.get('/api/audit-logs', { params }),
};
