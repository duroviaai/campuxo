import { useState } from 'react';
import { useGetCoursesQuery } from '../state/courseApi';

const useCourses = () => {
  const [page, setPage]          = useState(0);
  const [search, setSearchState] = useState('');

  const { data, isLoading: loading, error, refetch } = useGetCoursesQuery({
    page,
    size: 10,
    search: search || undefined,
  });

  const setSearch = (v) => { setPage(0); setSearchState(v); };

  return {
    courses:    data?.content ?? data ?? [],
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    page,
    search,
    setPage,
    setSearch,
    fetchCourses: refetch,
  };
};

export default useCourses;
