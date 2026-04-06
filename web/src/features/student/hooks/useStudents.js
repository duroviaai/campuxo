import { useState, useEffect, useCallback } from 'react';
import { getStudents } from '../services/studentService';

const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError(null);
    getStudents({ page, size: 10, search: search || undefined })
      .then((data) => {
        setStudents(data.content ?? data);
        setTotalPages(data.totalPages ?? 0);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSetSearch = (value) => {
    setPage(0);
    setSearch(value);
  };

  return {
    students,
    loading,
    error,
    page,
    totalPages,
    search,
    setPage,
    setSearch: handleSetSearch,
    fetchStudents,
  };
};

export default useStudents;
