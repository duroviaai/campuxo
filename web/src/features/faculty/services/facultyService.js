import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/faculty';

export const getFaculty     = (params) => axiosInstance.get(BASE, { params }).then((r) => r.data);
export const getFacultyById = (id)     => axiosInstance.get(`${BASE}/${id}`).then((r) => r.data);
export const createFaculty  = (data)   => axiosInstance.post(BASE, data).then((r) => r.data);
export const updateFaculty  = (id, data) => axiosInstance.put(`${BASE}/${id}`, data).then((r) => r.data);
export const deleteFaculty  = (id)     => axiosInstance.delete(`${BASE}/${id}`).then((r) => r.data);

export const getFacultyCourses    = () => axiosInstance.get('/api/v1/faculty/me/courses').then((r) => r.data);
export const getFacultyAttendance = () => axiosInstance.get('/api/v1/faculty/me/attendance').then((r) => r.data);
export const getFacultyAssignments = () => axiosInstance.get('/api/v1/faculty/me/assignments').then((r) => r.data);

export const getClassStudents = (classId) =>
  axiosInstance.get(`/api/v1/classes/${classId}/students`).then((r) => r.data);

export const submitAttendanceBatch = (records) =>
  axiosInstance.post('/api/v1/attendance', records).then((r) => r.data);

