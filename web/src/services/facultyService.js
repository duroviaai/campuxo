import axiosInstance from '../api/axiosInstance';

const BASE = '/api/v1/faculty';

export const getAllFaculty = (page = 0, size = 10) =>
  axiosInstance.get(BASE, { params: { page, size, sort: 'id' } }).then((r) => r.data);
