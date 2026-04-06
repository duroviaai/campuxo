import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/classes';

export const getClassFilters = () =>
  axiosInstance.get(`${BASE}/filters`).then((r) => r.data);

export const getClassesByYearAndSection = (year, section) =>
  axiosInstance.get(`${BASE}/search`, { params: { year, section } }).then((r) => r.data);

export const getCoursesByClass = (classId) =>
  axiosInstance.get(`${BASE}/${classId}/courses`).then((r) => r.data);

export const getStudentsByClass = (classId) =>
  axiosInstance.get(`${BASE}/${classId}/students`).then((r) => r.data);
