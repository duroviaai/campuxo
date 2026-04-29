import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/attendance';

export const getAttendanceByCourseAndDate = (courseId, date) =>
  axiosInstance.get(`${BASE}/course/${courseId}`, { params: { date } }).then((r) => r.data);

export const markAttendanceBatch = (data) =>
  axiosInstance.post(BASE, data).then((r) => r.data);

export const getMyAttendanceSummary = () =>
  axiosInstance.get(`${BASE}/me/summary`).then((r) => r.data);

export const getStudentAttendanceSummary = (studentId) =>
  axiosInstance.get(`${BASE}/student/${studentId}/summary`).then((r) => r.data);

export const getClassCourseOverview = (classId, courseId) =>
  axiosInstance.get(`${BASE}/class/${classId}/course/${courseId}/overview`).then((r) => r.data);

export const getOverviewByClassStructure = (classStructureId, courseId) =>
  axiosInstance.get(`${BASE}/class-structure/${classStructureId}/course/${courseId}/overview`).then((r) => r.data);

export const getAttendanceByCourseAndClassStructure = (courseId, classStructureId, date) =>
  axiosInstance.get(`${BASE}/course/${courseId}/class-structure/${classStructureId}`, { params: { date } }).then((r) => r.data);

export const getAttendanceByDateRange = (courseId, startDate, endDate) =>
  axiosInstance.get(`${BASE}/course/${courseId}/range`, { params: { startDate, endDate } }).then((r) => r.data);
