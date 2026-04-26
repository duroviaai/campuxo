import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/ia';

export const iaApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getIAMarks: b.query({
      query: ({ classStructureId, courseId }) =>
        `${BASE}?classStructureId=${classStructureId}&courseId=${courseId}`,
      providesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `ia-${classStructureId}-${courseId}` },
      ],
    }),
    saveIAMarks: b.mutation({
      query: (data) => ({ url: BASE, method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `ia-${classStructureId}-${courseId}` },
      ],
    }),
    getAssignments: b.query({
      query: ({ classStructureId, courseId }) =>
        `${BASE}/assignments?classStructureId=${classStructureId}&courseId=${courseId}`,
      providesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `asgn-${classStructureId}-${courseId}` },
      ],
    }),
    saveAssignments: b.mutation({
      query: (data) => ({ url: `${BASE}/assignments`, method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `asgn-${classStructureId}-${courseId}` },
      ],
    }),
    getSeminars: b.query({
      query: ({ classStructureId, courseId }) =>
        `${BASE}/seminars?classStructureId=${classStructureId}&courseId=${courseId}`,
      providesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `sem-${classStructureId}-${courseId}` },
      ],
    }),
    saveSeminars: b.mutation({
      query: (data) => ({ url: `${BASE}/seminars`, method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `sem-${classStructureId}-${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetIAMarksQuery,
  useSaveIAMarksMutation,
  useGetAssignmentsQuery,
  useSaveAssignmentsMutation,
  useGetSeminarsQuery,
  useSaveSeminarsMutation,
} = iaApi;
