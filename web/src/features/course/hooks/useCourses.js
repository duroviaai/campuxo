import { useState, useEffect, useCallback } from 'react';
import { getCourses } from '../services/courseService';

const useCourses = () => {
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState]    = useState('');

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError(null);
    getCourses({ page, size: 10, search: search || undefined })
      .then((data) => {
        setCourses(data.content ?? data);
        setTotalPages(data.totalPages ?? 0);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const setSearch = (value) => { setPage(0); setSearchState(value); };

  return { courses, loading, error, page, totalPages, search, setPage, setSearch, fetchCourses };
};

export default useCourses;
