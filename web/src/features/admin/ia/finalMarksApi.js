import axiosInstance from '../../../api/axiosInstance';

const BASE_URL = '/api/v1/ia';

export const iaApi = {
  getMarks: (classStructureId, courseId) =>
    axiosInstance.get(`${BASE_URL}`, {
      params: { classStructureId, courseId }
    }),

  saveMarks: (data) =>
    axiosInstance.post(`${BASE_URL}`, data),

  calculateFinalMarks: (classStructureId, courseId) =>
    axiosInstance.post(`${BASE_URL}/calculate-final-marks`, null, {
      params: { classStructureId, courseId }
    }),

  getFinalMarks: (classStructureId, courseId) =>
    axiosInstance.get(`${BASE_URL}/final-marks`, {
      params: { classStructureId, courseId }
    })
};
