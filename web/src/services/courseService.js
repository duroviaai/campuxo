import axiosInstance from '../api/axiosInstance';

const BASE = '/api/v1/courses';

export const getAllCourses = (page = 0, size = 10) =>
  axiosInstance.get(BASE, { params: { page, size } }).then((r) => r.data);

export const createCourse = (data) => axiosInstance.post(BASE, data).then((r) => r.data);
