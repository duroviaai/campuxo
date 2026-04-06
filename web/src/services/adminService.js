import axiosInstance from '../api/axiosInstance';

const BASE = '/api/v1/admin';

export const getStats = () => axiosInstance.get(`${BASE}/stats`).then((r) => r.data);
export const getPendingUsers = () => axiosInstance.get(`${BASE}/pending-users`).then((r) => r.data);
export const approveUser = (userId) => axiosInstance.put(`${BASE}/approve/${userId}`).then((r) => r.data);
export const rejectUser = (userId) => axiosInstance.put(`${BASE}/reject/${userId}`).then((r) => r.data);
