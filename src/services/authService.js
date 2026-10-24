import api from './api.js';

export const register = (payload) => api.post('/auth/register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const logout = (token) =>
api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (payload) => api.put('/auth/profile', payload);
export const getUsers = (params = {}) => api.get('/auth/users', { params });
const API_URL = 'https://hospital-appointment-management-system-1-tj0s.onrender.com/auth/login';
