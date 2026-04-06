import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/faculty';

export const facultyApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getFaculty:                b.query({ query: (params) => ({ url: BASE, params }), providesTags: ['Faculty'] }),
    getFacultyById:            b.query({ query: (id) => `${BASE}/${id}`, providesTags: ['Faculty'] }),
    getFacultyCourses:         b.query({ query: () => '/api/v1/faculty/me/courses' }),
    getFacultyAttendance:      b.query({ query: () => '/api/v1/faculty/me/attendance' }),
    getFacultyAssignments:     b.query({ query: () => '/api/v1/faculty/me/assignments' }),
    getFacultyProfile:         b.query({ query: () => '/api/v1/faculty/me/profile', providesTags: ['Faculty'] }),
    getFacultyAssignedCourses: b.query({ query: (facultyId) => `${BASE}/${facultyId}/courses`, providesTags: ['Faculty', 'Course'] }),
    getClassStudents:          b.query({ query: (classId) => `/api/v1/classes/${classId}/students` }),

    createFaculty:             b.mutation({ query: (data) => ({ url: BASE, method: 'POST', body: data }), invalidatesTags: ['Faculty'] }),
    updateFaculty:             b.mutation({ query: ({ id, ...data }) => ({ url: `${BASE}/${id}`, method: 'PUT', body: data }), invalidatesTags: ['Faculty'] }),
    deleteFaculty:             b.mutation({ query: (id) => ({ url: `${BASE}/${id}`, method: 'DELETE' }), invalidatesTags: ['Faculty'] }),
    assignCoursesToFaculty:    b.mutation({ query: ({ facultyId, courseIds }) => ({ url: `${BASE}/${facultyId}/courses`, method: 'POST', body: { courseIds } }), invalidatesTags: ['Faculty', 'Course'] }),
    removeCourseFromFaculty:   b.mutation({ query: ({ facultyId, courseId }) => ({ url: `${BASE}/${facultyId}/courses/${courseId}`, method: 'DELETE' }), invalidatesTags: ['Faculty', 'Course'] }),
    submitAttendanceBatch:     b.mutation({ query: (records) => ({ url: '/api/v1/attendance', method: 'POST', body: records }) }),
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
  useGetClassStudentsQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useAssignCoursesToFacultyMutation,
  useRemoveCourseFromFacultyMutation,
  useSubmitAttendanceBatchMutation,
} = facultyApi;
