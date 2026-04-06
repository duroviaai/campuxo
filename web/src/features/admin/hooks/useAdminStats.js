import { useEffect, useState } from 'react';
import { getStats } from '../../../services/adminService';

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then((data) =>
        setStats({
          students: data.totalStudents,
          faculty: data.totalFaculty,
          courses: data.totalCourses,
          pending: data.pendingApprovals,
        })
      )
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
