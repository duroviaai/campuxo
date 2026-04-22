import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import env from '../../config/env';
import { clearAuth } from '../../shared/utils/tokenUtils';

const baseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    clearAuth();
    if (window.location.pathname !== '/login') window.location.replace('/login?expired=1');
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Student', 'Faculty', 'Course', 'Class', 'AdminStats', 'PendingUsers', 'ApprovedUsers', 'RejectedUsers'],
  endpoints: () => ({}),
});
