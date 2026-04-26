import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/admin';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStats:               b.query({ query: () => `${BASE}/stats`, providesTags: ['AdminStats'] }),
    getDepartmentsSummary:  b.query({ query: () => `${BASE}/departments-summary`, providesTags: ['DeptSummary'] }),
    getPendingUsers:        b.query({ query: ({ role, department } = {}) => { const p = new URLSearchParams(); if (role) p.set('role', role); if (department) p.set('department', department); const q = p.toString(); return `${BASE}/pending-users${q ? `?${q}` : ''}`; }, providesTags: (_, __, arg) => [{ type: 'PendingUsers', id: arg?.department ?? 'ALL' }] }),
    getApprovedUsers:       b.query({ query: ({ role, department } = {}) => { const p = new URLSearchParams(); if (role) p.set('role', role); if (department) p.set('department', department); const q = p.toString(); return `${BASE}/approved-users${q ? `?${q}` : ''}`; }, providesTags: (_, __, arg) => [{ type: 'ApprovedUsers', id: arg?.department ?? 'ALL' }] }),
    getRejectedUsers:       b.query({ query: ({ department } = {}) => `${BASE}/rejected-users${department ? `?department=${encodeURIComponent(department)}` : ''}`, providesTags: (_, __, arg) => [{ type: 'RejectedUsers', id: arg?.department ?? 'ALL' }] }),

    approveUser:  b.mutation({ query: (userId) => ({ url: `${BASE}/approve/${userId}`, method: 'PUT' }),    invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'RejectedUsers', 'AdminStats', 'DeptSummary', 'Faculty', 'Student'] }),
    rejectUser:   b.mutation({ query: ({ userId, reason }) => ({ url: `${BASE}/reject/${userId}`, method: 'DELETE', body: reason ? { reason } : undefined }), invalidatesTags: ['PendingUsers', 'RejectedUsers', 'AdminStats', 'DeptSummary'] }),
    revokeUser:   b.mutation({ query: (userId) => ({ url: `${BASE}/revoke/${userId}`,  method: 'PUT' }),    invalidatesTags: ['ApprovedUsers', 'PendingUsers', 'AdminStats', 'DeptSummary', 'Faculty', 'Student'] }),
    deleteUser:   b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}`,   method: 'DELETE' }), invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'RejectedUsers', 'AdminStats', 'DeptSummary', 'Faculty', 'Student'] }),
    bulkApprove:  b.mutation({ query: (userIds) => ({ url: `${BASE}/bulk-approve`, method: 'PUT',    body: { userIds } }), invalidatesTags: ['PendingUsers', 'ApprovedUsers', 'AdminStats', 'DeptSummary', 'Faculty', 'Student'] }),
    bulkReject:   b.mutation({ query: ({ userIds, reason }) => ({ url: `${BASE}/bulk-reject`,  method: 'DELETE', body: { userIds, reason } }), invalidatesTags: ['PendingUsers', 'RejectedUsers', 'AdminStats', 'DeptSummary'] }),
    assignHod:    b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}/assign-hod`, method: 'PUT' }), invalidatesTags: ['Faculty', 'ApprovedUsers'] }),
    removeHod:    b.mutation({ query: (userId) => ({ url: `${BASE}/users/${userId}/remove-hod`, method: 'PUT' }), invalidatesTags: ['Faculty', 'ApprovedUsers'] }),
  }),
});

export const {
  useGetStatsQuery,
  useGetDepartmentsSummaryQuery,
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
