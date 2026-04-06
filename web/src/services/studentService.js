import axiosInstance from '../api/axiosInstance';

const BASE = '/api/v1/students';

export const getAllStudents = (page = 0, size = 10) =>
  axiosInstance.get(BASE, { params: { page, size, sort: 'id' } }).then((r) => r.data);

export const getMyProfile = () => axiosInstance.get(`${BASE}/me`).then((r) => r.data);
