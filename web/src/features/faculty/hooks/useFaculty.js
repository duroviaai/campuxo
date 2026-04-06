import { useState } from 'react';
import { useGetFacultyQuery } from '../state/facultyApi';

const useFaculty = () => {
  const [page, setPage]          = useState(0);
  const [search, setSearchState] = useState('');
  const [dept, setDeptState]     = useState('');

  const { data, isLoading: loading, error, refetch } = useGetFacultyQuery({
    page,
    size: 10,
    search:     search || undefined,
    department: dept   || undefined,
    sort: 'id',
  });

  const setSearch = (v) => { setPage(0); setSearchState(v); };
  const setDept   = (v) => { setPage(0); setDeptState(v); };

  return {
    faculty:    data?.content ?? data ?? [],
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    page,
    search,
    dept,
    setPage,
    setSearch,
    setDept,
    fetchFaculty: refetch,
  };
};

export default useFaculty;
