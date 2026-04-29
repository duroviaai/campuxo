import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import env from '../../config/env';
import { clearAuth, setToken, getRefreshToken, setRefreshToken } from '../../shared/utils/tokenUtils';

const baseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (endpoint !== 'uploadMyPhoto') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResult = await fetch(`${env.API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResult.ok) {
          const data = await refreshResult.json();
          setToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          return await baseQuery(args, api, extraOptions);
        }
      } catch {}
    }
    clearAuth();
    if (window.location.pathname !== '/login')
      window.location.replace('/login?expired=1');
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 0,
  tagTypes: ['Student', 'Faculty', 'Course', 'Class', 'Department', 'Specialization', 'Batch', 'ClassStructure', 'AdminCourse', 'AdminStats', 'PendingUsers', 'ApprovedUsers', 'RejectedUsers', 'DeptSummary', 'IA', 'Attendance', 'HodFaculty', 'HodCourse', 'Notification', 'FacultyProfile', 'Timetable'],
  endpoints: () => ({}),
});
