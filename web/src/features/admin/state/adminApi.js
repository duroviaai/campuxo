import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/admin';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStats:         b.query({ query: () => `${BASE}/stats`, providesTags: ['AdminStats'], keepUnusedDataFor: 60 }),
    getPendingUsers:  b.query({ query: (role) => `${BASE}/pending-users${role ? `?role=${role}` : ''}`, providesTags: (_, __, role) => [{ type: 'PendingUsers', id: role ?? 'ALL' }], keepUnusedDataFor: 30 }),
    getApprovedUsers: b.query({ query: (role) => `${BASE}/approved-users${role ? `?role=${role}` : ''}`, providesTags: (_, __, role) => [{ type: 'ApprovedUsers', id: role ?? 'ALL' }], keepUnusedDataFor: 30 }),

    approveUser: b.mutation({ query: (userId) => ({ url: `${BASE}/approve/${userId}`, method: 'PUT' }),    invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'AdminStats'] }),
    rejectUser:  b.mutation({ query: (userId) => ({ url: `${BASE}/reject/${userId}`,  method: 'DELETE' }), invalidatesTags: ['PendingUsers', 'AdminStats'] }),
    revokeUser:  b.mutation({ query: (userId) => ({ url: `${BASE}/revoke/${userId}`,  method: 'PUT' }),    invalidatesTags: ['ApprovedUsers', 'PendingUsers', 'AdminStats'] }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPendingUsersQuery,
  useGetApprovedUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useRevokeUserMutation,
} = adminApi;
