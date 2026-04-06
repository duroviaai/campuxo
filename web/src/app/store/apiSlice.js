import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import env from '../../config/env';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: env.API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Student', 'Faculty', 'Course', 'Class', 'AdminStats', 'PendingUsers'],
  endpoints: () => ({}),
});
