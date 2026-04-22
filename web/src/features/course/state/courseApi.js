import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/courses';

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getCourses:          b.query({ query: (params) => ({ url: BASE, params }), providesTags: ['Course'] }),
    getCourseById:       b.query({ query: (id) => `${BASE}/${id}`, providesTags: ['Course'] }),
    getCourseStudents:   b.query({ query: (id) => `${BASE}/${id}/students` }),
    getPrograms:         b.query({ query: () => `${BASE}/programs`, providesTags: ['Course'] }),
    getCoursesByProgram: b.query({ query: (program) => `${BASE}/programs/${program}`, providesTags: ['Course'] }),
    getDeptCounts:       b.query({ query: () => `${BASE}/dept-counts`, providesTags: ['Course'] }),

    createCourse: b.mutation({ query: (data) => ({ url: BASE, method: 'POST', body: data }), invalidatesTags: ['Course'] }),
    updateCourse: b.mutation({ query: ({ id, ...data }) => ({ url: `${BASE}/${id}`, method: 'PUT', body: data }), invalidatesTags: ['Course'] }),
    deleteCourse: b.mutation({ query: (id) => ({ url: `${BASE}/${id}`, method: 'DELETE' }), invalidatesTags: ['Course'] }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseStudentsQuery,
  useGetProgramsQuery,
  useGetCoursesByProgramQuery,
  useGetDeptCountsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
