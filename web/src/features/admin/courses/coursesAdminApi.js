import { apiSlice } from '../../../app/store/apiSlice';

export const coursesAdminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    // ── Batches ──────────────────────────────────────────────────────────────
    getBatches: b.query({
      query: () => '/api/v1/batches',
      providesTags: ['Batch'],
    }),
    createBatch: b.mutation({
      query: (data) => ({ url: '/api/v1/batches', method: 'POST', body: data }),
      invalidatesTags: ['Batch'],
    }),
    deleteBatch: b.mutation({
      query: (id) => ({ url: `/api/v1/batches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Batch'],
    }),

    // ── Departments ───────────────────────────────────────────────────────────
    getDepartments: b.query({
      query: () => '/api/v1/departments',
      providesTags: ['Department'],
    }),
    createDepartment: b.mutation({
      query: (data) => ({ url: '/api/v1/departments', method: 'POST', body: data }),
      invalidatesTags: ['Department'],
    }),
    deleteDepartment: b.mutation({
      query: (id) => ({ url: `/api/v1/departments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Department'],
    }),

    // ── Specializations ───────────────────────────────────────────────────────
    getSpecializationsByDept: b.query({
      query: ({ deptId, scheme }) =>
        `/api/v1/specializations?deptId=${deptId}${scheme ? `&scheme=${scheme}` : ''}`,
      providesTags: (_, __, { deptId }) => [{ type: 'Specialization', id: deptId }],
    }),
    createSpecialization: b.mutation({
      query: (data) => ({ url: '/api/v1/specializations', method: 'POST', body: data }),
      invalidatesTags: (_, __, { deptId }) => [{ type: 'Specialization', id: deptId }],
    }),
    deleteSpecialization: b.mutation({
      query: (id) => ({ url: `/api/v1/specializations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Specialization'],
    }),

    // ── Class Structure ───────────────────────────────────────────────────────
    getClassStructure: b.query({
      query: ({ batchId, deptId, specId }) =>
        `/api/v1/class-structure?batchId=${batchId}&deptId=${deptId}${specId ? `&specId=${specId}` : ''}`,
      providesTags: ['ClassStructure'],
    }),
    getOrCreateClassStructure: b.mutation({
      query: (data) => ({ url: '/api/v1/class-structure', method: 'POST', body: data }),
      invalidatesTags: ['ClassStructure'],
    }),

    // ── Admin Courses ─────────────────────────────────────────────────────────
    getAdminCourses: b.query({
      query: ({ classStructureId, excludeFacultyId }) =>
        `/api/v1/admin/courses?classStructureId=${classStructureId}${excludeFacultyId ? `&excludeFacultyId=${excludeFacultyId}` : ''}`,
      providesTags: (_, __, { classStructureId }) => [{ type: 'AdminCourse', id: classStructureId }],
    }),
    getDeptCourses: b.query({
      query: ({ departmentId, departmentName, classStructureId }) => {
        const p = new URLSearchParams();
        if (departmentId) p.set('departmentId', departmentId);
        if (departmentName) p.set('departmentName', departmentName);
        if (classStructureId) p.set('classStructureId', classStructureId);
        return `/api/v1/admin/courses/by-dept?${p.toString()}`;
      },
      providesTags: (_, __, { departmentId, classStructureId }) => [
        { type: 'AdminCourse', id: `dept-${departmentId}-${classStructureId ?? ''}` },
      ],
    }),
    createAdminCourse: b.mutation({
      query: (data) => ({ url: '/api/v1/admin/courses', method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId, departmentId }) => [
        { type: 'AdminCourse', id: classStructureId },
        { type: 'AdminCourse', id: `dept-${departmentId}` },
        'Batch',
      ],
    }),
    assignCourse: b.mutation({
      query: ({ classStructureId, courseId }) => ({
        url: `/api/v1/admin/courses/assign?classStructureId=${classStructureId}&courseId=${courseId}`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { classStructureId }) => [
        { type: 'AdminCourse', id: classStructureId },
        'Faculty',
      ],
    }),
    unassignCourse: b.mutation({
      query: ({ classStructureId, courseId }) => ({
        url: `/api/v1/admin/courses/unassign?classStructureId=${classStructureId}&courseId=${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { classStructureId }) => [
        { type: 'AdminCourse', id: classStructureId },
        'Faculty',
      ],
    }),
    deleteAdminCourse: b.mutation({
      query: ({ id, confirmed = false }) => ({
        url: `/api/v1/admin/courses/${id}?confirmed=${confirmed}`,
        method: 'DELETE',
      }),
      // 204 = deleted, 409 = needs confirmation — both handled in the component
      transformErrorResponse: (response) => response,
      invalidatesTags: ['AdminCourse', 'Batch'],
    }),
    checkCourseCode: b.query({
      query: ({ code, departmentId, classStructureId }) => {
        const p = new URLSearchParams({ code });
        if (departmentId) p.set('departmentId', departmentId);
        if (classStructureId) p.set('classStructureId', classStructureId);
        return `/api/v1/admin/courses/check-code?${p.toString()}`;
      },
    }),

    // ── Overview: courses with assigned faculty ───────────────────────────────
    getCoursesWithFaculty: b.query({
      query: (classStructureId) =>
        `/api/v1/admin/courses/overview?classStructureId=${classStructureId}`,
      providesTags: (_, __, id) => [{ type: 'AdminCourse', id }, 'Faculty'],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetSpecializationsByDeptQuery,
  useCreateSpecializationMutation,
  useDeleteSpecializationMutation,
  useGetClassStructureQuery,
  useGetOrCreateClassStructureMutation,
  useGetAdminCoursesQuery,
  useGetDeptCoursesQuery,
  useCreateAdminCourseMutation,
  useAssignCourseMutation,
  useUnassignCourseMutation,
  useDeleteAdminCourseMutation,
  useCheckCourseCodeQuery,
  useGetCoursesWithFacultyQuery,
} = coursesAdminApi;
