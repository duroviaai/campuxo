import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/timetable';

export const timetableApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getTimetableByClassStructure: b.query({
      query: (classStructureId) => `${BASE}?classStructureId=${classStructureId}`,
      providesTags: (_, __, id) => [{ type: 'Timetable', id }],
    }),
    createTimetableEntry: b.mutation({
      query: (data) => ({ url: BASE, method: 'POST', body: data }),
      invalidatesTags: (_, __, { classStructureId }) => [{ type: 'Timetable', id: classStructureId }],
    }),
    updateTimetableEntry: b.mutation({
      query: ({ id, ...data }) => ({ url: `${BASE}/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_, __, { classStructureId }) => [{ type: 'Timetable', id: classStructureId }],
    }),
    deleteTimetableEntry: b.mutation({
      query: ({ id }) => ({ url: `${BASE}/${id}`, method: 'DELETE' }),
      invalidatesTags: (_, __, { classStructureId }) => [{ type: 'Timetable', id: classStructureId }],
    }),
  }),
});

export const {
  useGetTimetableByClassStructureQuery,
  useCreateTimetableEntryMutation,
  useUpdateTimetableEntryMutation,
  useDeleteTimetableEntryMutation,
} = timetableApi;
