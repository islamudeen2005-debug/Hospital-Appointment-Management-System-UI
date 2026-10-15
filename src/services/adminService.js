import api from './api.js';

export const getDashboard = () => api.get('/admin/dashboard');
export const getPatients = (params = {}) => api.get('/admin/patients', { params });
