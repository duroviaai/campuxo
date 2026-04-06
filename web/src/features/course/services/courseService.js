import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/courses';

export const getCourses          = (params)   => axiosInstance.get(BASE, { params }).then((r) => r.data);
export const getCourseById       = (id)       => axiosInstance.get(`${BASE}/${id}`).then((r) => r.data);
export const getCourseStudents   = (id)       => axiosInstance.get(`${BASE}/${id}/students`).then((r) => r.data);
export const createCourse        = (data)     => axiosInstance.post(BASE, data).then((r) => r.data);
export const updateCourse        = (id, data) => axiosInstance.put(`${BASE}/${id}`, data).then((r) => r.data);
export const deleteCourse        = (id)       => axiosInstance.delete(`${BASE}/${id}`).then((r) => r.data);
export const getPrograms         = ()         => axiosInstance.get(`${BASE}/programs`).then((r) => r.data);
export const getCoursesByProgram = (program)  => axiosInstance.get(`${BASE}/programs/${program}`).then((r) => r.data);
