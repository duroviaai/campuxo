import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/faculty';

export const facultyApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getFaculty:                b.query({ query: (params) => ({ url: BASE, params }), providesTags: ['Faculty'] }),
    getFacultyById:            b.query({ query: (id) => `${BASE}/${id}`, providesTags: (_, __, id) => [{ type: 'Faculty', id }] }),
    getFacultyCourses:         b.query({ query: () => `${BASE}/me/courses`, providesTags: ['Course'] }),
    getFacultyAttendance:      b.query({ query: () => `${BASE}/me/attendance`, providesTags: ['Attendance'] }),
    getFacultyAssignments:     b.query({ query: () => `${BASE}/me/assignments`, providesTags: ['Faculty', 'Course'] }),
    getFacultyProfile:         b.query({ query: () => `${BASE}/me/profile`, providesTags: ['Faculty'] }),
    getFacultyAssignedCourses: b.query({ query: (facultyId) => `${BASE}/${facultyId}/courses`, providesTags: (_, __, facultyId) => [{ type: 'Faculty', id: `courses-${facultyId}` }, 'Course'] }),

    createFaculty:             b.mutation({ query: (data) => ({ url: BASE, method: 'POST', body: data }), invalidatesTags: ['Faculty', 'AdminStats'] }),
    updateFaculty:             b.mutation({ query: ({ id, ...data }) => ({ url: `${BASE}/${id}`, method: 'PUT', body: data }), invalidatesTags: (_, __, { id }) => ['Faculty', { type: 'Faculty', id }] }),
    updateFacultyStatus:       b.mutation({ query: ({ id, status }) => ({ url: `${BASE}/${id}/status`, method: 'PATCH', body: { status } }), invalidatesTags: ['Faculty'] }),
    deleteFaculty:             b.mutation({ query: (id) => ({ url: `${BASE}/${id}`, method: 'DELETE' }), invalidatesTags: ['Faculty', 'AdminStats'] }),
    assignCoursesToFaculty:    b.mutation({ query: ({ facultyId, courseIds }) => ({ url: `${BASE}/${facultyId}/courses`, method: 'POST', body: { courseIds } }), invalidatesTags: (_, __, { facultyId }) => ['Faculty', 'Course', 'AdminCourse', { type: 'Faculty', id: `courses-${facultyId}` }] }),
    removeCourseFromFaculty:   b.mutation({ query: ({ facultyId, courseId }) => ({ url: `${BASE}/${facultyId}/courses/${courseId}`, method: 'DELETE' }), invalidatesTags: (_, __, { facultyId }) => ['Faculty', 'Course', 'AdminCourse', { type: 'Faculty', id: `courses-${facultyId}` }] }),
    assignClassesToCourse:     b.mutation({ query: ({ facultyId, courseId, classIds }) => ({ url: `${BASE}/${facultyId}/courses/${courseId}/classes`, method: 'POST', body: { classIds } }), invalidatesTags: ['Faculty', 'Course'] }),
    submitAttendanceBatch:     b.mutation({ query: (records) => ({ url: '/api/v1/attendance', method: 'POST', body: records }), invalidatesTags: ['Attendance'] }),
  }),
});

export const {
  useGetFacultyQuery,
  useGetFacultyByIdQuery,
  useGetFacultyCoursesQuery,
  useGetFacultyAttendanceQuery,
  useGetFacultyAssignmentsQuery,
  useGetFacultyProfileQuery,
  useGetFacultyAssignedCoursesQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useUpdateFacultyStatusMutation,
  useDeleteFacultyMutation,
  useAssignCoursesToFacultyMutation,
  useRemoveCourseFromFacultyMutation,
  useAssignClassesToCourseMutation,
  useSubmitAttendanceBatchMutation,
} = facultyApi;
