import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/hod';

export const hodApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getHodStats:      b.query({ query: () => `${BASE}/stats` }),
    getHodDept:       b.query({ query: () => `${BASE}/dept` }),
    getHodFaculty:    b.query({ query: () => `${BASE}/faculty`, providesTags: ['HodFaculty'] }),
    getHodStudents:   b.query({ query: () => `${BASE}/students` }),
    getHodStudentsByClassStructure: b.query({
      query: (classStructureId) => `${BASE}/students/by-class-structure?classStructureId=${classStructureId}`,
    }),
    getHodCourses:    b.query({ query: () => `${BASE}/courses`, providesTags: ['HodCourse'] }),
    getHodCoursesByClassStructure: b.query({
      query: (classStructureId) => `${BASE}/courses/by-class-structure?classStructureId=${classStructureId}`,
      providesTags: (_, __, id) => [{ type: 'HodCourse', id }],
    }),
    getHodAttendance: b.query({
      query: ({ courseId, classId }) => `${BASE}/attendance?courseId=${courseId}&classId=${classId}`,
    }),
    // Students + attendance for a course scoped to a classStructure
    getHodCourseAttendanceOverview: b.query({
      query: ({ classStructureId, courseId }) =>
        `/api/v1/attendance/class-structure/${classStructureId}/course/${courseId}/overview`,
      providesTags: (_, __, { courseId }) => [{ type: 'HodCourseAttendance', id: courseId }],
    }),
    assignFacultyToCourse: b.mutation({
      query: ({ facultyId, courseId, classStructureId }) => ({
        url: `${BASE}/faculty/${facultyId}/assign-course`,
        method: 'POST',
        body: { courseId, classStructureId: classStructureId ?? null },
      }),
      invalidatesTags: (_, __, { courseId, classStructureId }) => [
        'HodFaculty',
        'HodCourse',
        { type: 'AdminCourse', id: classStructureId },
      ],
    }),
    changeFacultyForCourse: b.mutation({
      query: ({ courseId, newFacultyId, classStructureId }) => ({
        url: `${BASE}/courses/${courseId}/faculty`,
        method: 'PUT',
        body: { newFacultyId, classStructureId: classStructureId ?? null },
      }),
      invalidatesTags: (_, __, { classStructureId }) => [
        'HodFaculty',
        'HodCourse',
        { type: 'AdminCourse', id: classStructureId },
      ],
    }),
    getHodCourseStudentsPerformance: b.query({
      query: ({ courseId, classStructureId }) =>
        `${BASE}/courses/${courseId}/students-performance?classStructureId=${classStructureId}`,
      providesTags: (_, __, { courseId }) => [{ type: 'HodCourseAttendance', id: courseId }],
    }),
    getHodStudentPerformance: b.query({
      query: (studentId) => `${BASE}/students/${studentId}/performance`,
      providesTags: (_, __, id) => [{ type: 'HodStudentPerformance', id }],
    }),
    getHodFacultyAssignments: b.query({
      query: (facultyId) => `${BASE}/faculty/${facultyId}/assignments`,
      providesTags: (_, __, id) => [{ type: 'HodFaculty', id }],
    }),
    getHodMe: b.query({
      query: () => `${BASE}/me`,
      providesTags: ['HodFaculty'],
    }),
    removeFacultyFromCourse: b.mutation({
      query: ({ facultyId, courseId }) => ({
        url: `${BASE}/faculty/${facultyId}/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { classStructureId }) => [
        'HodFaculty',
        'HodCourse',
        { type: 'AdminCourse', id: classStructureId },
      ],
    }),
  }),
});

export const {
  useGetHodStatsQuery,
  useGetHodDeptQuery,
  useGetHodFacultyQuery,
  useGetHodStudentsQuery,
  useGetHodStudentsByClassStructureQuery,
  useGetHodCoursesQuery,
  useGetHodCoursesByClassStructureQuery,
  useGetHodAttendanceQuery,
  useGetHodCourseAttendanceOverviewQuery,
  useGetHodCourseStudentsPerformanceQuery,
  useGetHodStudentPerformanceQuery,
  useGetHodFacultyAssignmentsQuery,
  useGetHodMeQuery,
  useAssignFacultyToCourseMutation,
  useChangeFacultyForCourseMutation,
  useRemoveFacultyFromCourseMutation,
} = hodApi;
