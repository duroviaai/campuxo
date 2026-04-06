import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/students';

export const getStudents = (params) =>
  axiosInstance.get(BASE, { params }).then((r) => r.data);

export const getStudentById = (id) =>
  axiosInstance.get(`${BASE}/${id}`).then((r) => r.data);

export const createStudent = (data) =>
  axiosInstance.post(BASE, data).then((r) => r.data);

export const updateStudent = (id, data) =>
  axiosInstance.put(`${BASE}/${id}`, data).then((r) => r.data);

export const deleteStudent = (id) =>
  axiosInstance.delete(`${BASE}/${id}`).then((r) => r.data);

export const getMyCourses = () =>
  axiosInstance.get('/api/v1/students/me/courses').then((r) => r.data);

export const getMyAttendance = () =>
  axiosInstance.get('/api/v1/attendance/me').then((r) => r.data.content);
