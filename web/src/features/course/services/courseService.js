import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/courses';

export const getCourses    = (params)   => axiosInstance.get(BASE, { params }).then((r) => r.data);
export const getCourseById = (id)       => axiosInstance.get(`${BASE}/${id}`).then((r) => r.data);
export const createCourse  = (data)     => axiosInstance.post(BASE, data).then((r) => r.data);
export const updateCourse  = (id, data) => axiosInstance.put(`${BASE}/${id}`, data).then((r) => r.data);
export const deleteCourse  = (id)       => axiosInstance.delete(`${BASE}/${id}`).then((r) => r.data);
