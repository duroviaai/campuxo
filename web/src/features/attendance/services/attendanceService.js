import axiosInstance from '../../../api/axiosInstance';

const BASE = '/api/v1/attendance';

export const getAttendanceByCourseAndDate = (courseId, date) =>
  axiosInstance.get(`${BASE}/course/${courseId}`, { params: { date } }).then((r) => r.data);

export const markAttendanceBatch = (data) =>
  axiosInstance.post(BASE, data).then((r) => r.data);
