import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/admin';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStats:       b.query({ query: () => `${BASE}/stats`, providesTags: ['AdminStats'] }),
    getPendingUsers:b.query({ query: () => `${BASE}/pending-users`, providesTags: ['PendingUsers'] }),

    approveUser: b.mutation({ query: (userId) => ({ url: `${BASE}/approve/${userId}`, method: 'PUT' }), invalidatesTags: ['PendingUsers', 'AdminStats'] }),
    rejectUser:  b.mutation({ query: (userId) => ({ url: `${BASE}/reject/${userId}`, method: 'PUT' }), invalidatesTags: ['PendingUsers', 'AdminStats'] }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
} = adminApi;
