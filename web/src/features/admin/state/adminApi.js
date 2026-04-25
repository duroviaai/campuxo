import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/admin';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStats:         b.query({ query: () => `${BASE}/stats`, providesTags: ['AdminStats'], keepUnusedDataFor: 60 }),
    getPendingUsers:  b.query({ query: (role) => `${BASE}/pending-users${role ? `?role=${role}` : ''}`, providesTags: (_, __, role) => [{ type: 'PendingUsers', id: role ?? 'ALL' }], keepUnusedDataFor: 30 }),
    getApprovedUsers: b.query({ query: (role) => `${BASE}/approved-users${role ? `?role=${role}` : ''}`, providesTags: (_, __, role) => [{ type: 'ApprovedUsers', id: role ?? 'ALL' }], keepUnusedDataFor: 30 }),

    getRejectedUsers: b.query({ query: (role) => `${BASE}/rejected-users${role ? `?role=${role}` : ''}`, providesTags: (_, __, role) => [{ type: 'RejectedUsers', id: role ?? 'ALL' }], keepUnusedDataFor: 30 }),

    approveUser:  b.mutation({ query: (userId) => ({ url: `${BASE}/approve/${userId}`, method: 'PUT' }),    invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'RejectedUsers', 'AdminStats'] }),
    rejectUser:   b.mutation({ query: ({ userId, reason }) => ({ url: `${BASE}/reject/${userId}`, method: 'DELETE', body: reason ? { reason } : undefined }), invalidatesTags: ['PendingUsers', 'RejectedUsers', 'AdminStats'] }),
    revokeUser:   b.mutation({ query: (userId) => ({ url: `${BASE}/revoke/${userId}`,  method: 'PUT' }),    invalidatesTags: ['ApprovedUsers', 'PendingUsers', 'AdminStats'] }),
    deleteUser:   b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}`,   method: 'DELETE' }), invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'RejectedUsers', 'AdminStats'] }),
    bulkApprove:  b.mutation({ query: (userIds) => ({ url: `${BASE}/bulk-approve`, method: 'PUT',    body: { userIds } }), invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'AdminStats'] }),
    bulkReject:   b.mutation({ query: ({ userIds, reason }) => ({ url: `${BASE}/bulk-reject`,  method: 'DELETE', body: { userIds, reason } }), invalidatesTags: ['PendingUsers', 'RejectedUsers', 'AdminStats'] }),
    assignHod:    b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}/assign-hod`, method: 'PUT' }), invalidatesTags: ['Faculty', 'ApprovedUsers'] }),
    removeHod:    b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}/remove-hod`, method: 'PUT' }), invalidatesTags: ['Faculty', 'ApprovedUsers'] }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPendingUsersQuery,
  useGetApprovedUsersQuery,
  useGetRejectedUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useRevokeUserMutation,
  useDeleteUserMutation,
  useBulkApproveMutation,
  useBulkRejectMutation,
  useAssignHodMutation,
  useRemoveHodMutation,
} = adminApi;
