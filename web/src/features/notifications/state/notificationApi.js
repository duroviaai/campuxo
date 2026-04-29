import { apiSlice } from '../../../app/store/apiSlice';

const BASE = '/api/v1/notifications';

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getNotifications: b.query({
      query: ({ page = 0, size = 20 } = {}) =>
        `${BASE}?page=${page}&size=${size}`,
      providesTags: ['Notification'],
    }),
    getUnreadNotifications: b.query({
      query: () => `${BASE}/unread`,
      providesTags: ['Notification'],
    }),
    getUnreadCount: b.query({
      query: () => `${BASE}/unread/count`,
      providesTags: ['Notification'],
    }),
    markRead: b.mutation({
      query: (id) => ({ url: `${BASE}/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: b.mutation({
      query: () => ({ url: `${BASE}/read-all`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    deleteRead: b.mutation({
      query: () => ({ url: `${BASE}/read`, method: 'DELETE' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteReadMutation,
} = notificationApi;
