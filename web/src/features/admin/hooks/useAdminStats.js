import { useGetStatsQuery } from '../state/adminApi';

export default function useAdminStats() {
  const { data, isLoading: loading, error } = useGetStatsQuery();

  const stats = data ? {
    students: data.totalStudents,
    faculty:  data.totalFaculty,
    courses:  data.totalCourses,
    pending:  data.pendingApprovals,
  } : null;

  return { stats, loading, error };
}
