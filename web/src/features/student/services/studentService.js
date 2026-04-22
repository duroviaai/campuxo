import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/students';

export const getStudents    = (params) => axiosInstance.get(BASE, { params }).then((r) => r.data);
export const getStudentById = (id)     => axiosInstance.get(`${BASE}/${id}`).then((r) => r.data);
export const createStudent  = (data)   => axiosInstance.post(BASE, data).then((r) => r.data);
export const updateStudent  = (id, data) => axiosInstance.put(`${BASE}/${id}`, data).then((r) => r.data);
export const deleteStudent  = (id)     => axiosInstance.delete(`${BASE}/${id}`).then((r) => r.data);

export const getMyProfile     = ()     => axiosInstance.get(`${BASE}/me`).then((r) => r.data);
export const updateMyProfile  = (data) => axiosInstance.put(`${BASE}/me`, data).then((r) => r.data);
export const getMyCourses     = ()     => axiosInstance.get(`${BASE}/me/courses`).then((r) => r.data);
export const getMyAttendance  = ()     => axiosInstance.get('/api/v1/attendance/me', { params: { page: 0, size: 200 } }).then((r) => r.data.content);

export const getPrograms         = ()            => axiosInstance.get('/api/v1/courses/programs').then((r) => r.data);
export const getCoursesByProgram = (program)     => axiosInstance.get(`/api/v1/courses/programs/${program}`).then((r) => r.data);
export const enrollCourse        = (courseId)    => axiosInstance.post(`/api/v1/courses/${courseId}/enroll`).then((r) => r.data);
export const unenrollCourse      = (courseId)    => axiosInstance.delete(`/api/v1/courses/${courseId}/enroll`).then((r) => r.data);

export const getAllClasses   = ()          => axiosInstance.get('/api/v1/classes').then((r) => r.data);
export const createClass    = (data)       => axiosInstance.post('/api/v1/classes', data).then((r) => r.data);
export const updateClass    = (id, data)   => axiosInstance.put(`/api/v1/classes/${id}`, data).then((r) => r.data);
export const deleteClass    = (id)         => axiosInstance.delete(`/api/v1/classes/${id}`).then((r) => r.data);
