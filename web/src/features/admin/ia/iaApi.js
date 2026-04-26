import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/ia';

export const iaApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getIAMarks: b.query({
      query: ({ classStructureId, courseId }) =>
        `${BASE}?classStructureId=${classStructureId}&courseId=${courseId}`,
      providesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `${classStructureId}-${courseId}` },
      ],
    }),
    saveIAMarks: b.mutation({
      query: (data) => ({ url: BASE, method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId, courseId }) => [
        { type: 'IA', id: `${classStructureId}-${courseId}` },
      ],
    }),
  }),
});

export const { useGetIAMarksQuery, useSaveIAMarksMutation } = iaApi;
