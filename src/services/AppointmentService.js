import api from './api.js';

export const getAppointments = (params = {}) => api.get('/appointments', { params });
export const getMyAppointments = () => api.get('/appointments/my');
export const createAppointment = (payload) => api.post('/appointments', payload);
export const updateAppointment = (id, payload) => api.put(`/appointments/${id}`, payload);
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);
export const updateAppointmentStatus = (id, status) => api.put(`/appointments/${id}/status`, { status });

