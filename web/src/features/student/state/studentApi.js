import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/students';

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStudents:      b.query({ query: (params) => ({ url: BASE, params }), providesTags: ['Student'] }),
    getStudentById:   b.query({ query: (id) => `${BASE}/${id}`, providesTags: ['Student'] }),
    getMyProfile:     b.query({ query: () => `${BASE}/me`, providesTags: ['Student'] }),
    getMyCourses:     b.query({ query: () => `${BASE}/me/courses` }),
    getMyAttendance:  b.query({ query: () => '/api/v1/attendance/me' }),
    getAllClasses:     b.query({ query: () => '/api/v1/classes', providesTags: ['Class'] }),
    getPrograms:      b.query({ query: () => '/api/v1/courses/programs' }),
    getCoursesByProgram: b.query({ query: (program) => `/api/v1/courses/programs/${program}`, providesTags: ['Course'] }),

    createStudent:    b.mutation({ query: (data) => ({ url: BASE, method: 'POST', body: data }), invalidatesTags: ['Student'] }),
    updateStudent:    b.mutation({ query: ({ id, ...data }) => ({ url: `${BASE}/${id}`, method: 'PUT', body: data }), invalidatesTags: ['Student'] }),
    deleteStudent:    b.mutation({ query: (id) => ({ url: `${BASE}/${id}`, method: 'DELETE' }), invalidatesTags: ['Student'] }),
    updateMyProfile:  b.mutation({ query: (data) => ({ url: `${BASE}/me`, method: 'PUT', body: data }), invalidatesTags: ['Student'] }),
    enrollCourse:     b.mutation({ query: (courseId) => ({ url: `/api/v1/courses/${courseId}/enroll`, method: 'POST' }), invalidatesTags: ['Course'] }),
    unenrollCourse:   b.mutation({ query: (courseId) => ({ url: `/api/v1/courses/${courseId}/enroll`, method: 'DELETE' }), invalidatesTags: ['Course'] }),
    createClass:      b.mutation({ query: (data) => ({ url: '/api/v1/classes', method: 'POST', body: data }), invalidatesTags: ['Class'] }),
    updateClass:      b.mutation({ query: ({ id, ...data }) => ({ url: `/api/v1/classes/${id}`, method: 'PUT', body: data }), invalidatesTags: ['Class'] }),
    deleteClass:      b.mutation({ query: (id) => ({ url: `/api/v1/classes/${id}`, method: 'DELETE' }), invalidatesTags: ['Class'] }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetMyProfileQuery,
  useGetMyCoursesQuery,
  useGetMyAttendanceQuery,
  useGetAllClassesQuery,
  useGetProgramsQuery,
  useGetCoursesByProgramQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useUpdateMyProfileMutation,
  useEnrollCourseMutation,
  useUnenrollCourseMutation,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = studentApi;
