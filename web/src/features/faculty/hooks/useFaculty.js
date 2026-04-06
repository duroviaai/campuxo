import { useState, useEffect, useCallback } from 'react';
import { getFaculty } from '../services/facultyService';

const useFaculty = () => {
  const [faculty, setFaculty]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearchState]      = useState('');

  const fetchFaculty = useCallback(() => {
    setLoading(true);
    setError(null);
    getFaculty({ page, size: 10, search: search || undefined })
      .then((data) => {
        setFaculty(data.content ?? data);
        setTotalPages(data.totalPages ?? 0);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  const setSearch = (value) => { setPage(0); setSearchState(value); };

  return { faculty, loading, error, page, totalPages, search, setPage, setSearch, fetchFaculty };
};

export default useFaculty;
