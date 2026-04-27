import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/hod';

export const hodApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getHodStats:      b.query({ query: () => `${BASE}/stats` }),
    getHodDept:       b.query({ query: () => `${BASE}/dept` }),
    getHodFaculty:    b.query({ query: () => `${BASE}/faculty` }),
    getHodStudents:   b.query({ query: () => `${BASE}/students` }),
    getHodCourses:    b.query({ query: () => `${BASE}/courses` }),
    getHodAttendance: b.query({ query: ({ courseId, classId }) => `${BASE}/attendance?courseId=${courseId}&classId=${classId}` }),
  }),
});

export const {
  useGetHodStatsQuery,
  useGetHodDeptQuery,
  useGetHodFacultyQuery,
  useGetHodStudentsQuery,
  useGetHodCoursesQuery,
  useGetHodAttendanceQuery,
} = hodApi;
