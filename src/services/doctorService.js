import api from './api.js';

export const getDoctors = (params = {}) => api.get('/doctors', { params });
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getDoctorSlots = (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } });
export const createDoctor = (payload) => api.post('/doctors', payload);
export const updateDoctor = (id, payload) => api.put(`/doctors/${id}`, payload);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);
export const uploadDoctorImage = (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/doctors/upload-image', formData);
};

const doctorService = {
    createDoctor,
    deleteDoctor,
    getDoctorById,
    getDoctorSlots,
    getDoctors,
    updateDoctor
};

export default doctorService;
