import { useState } from 'react';
import { useGetStudentsQuery } from '../state/studentApi';

const useStudents = () => {
  const [page, setPage]   = useState(0);
  const [search, setSearchState] = useState('');
  const [dept, setDept]   = useState('');
  const [classId, setClassId] = useState('');

  const { data, isLoading: loading, error, refetch } = useGetStudentsQuery({
    page,
    size: 10,
    search:       search   || undefined,
    department:   dept     || undefined,
    classBatchId: classId  || undefined,
    sort: 'id',
  });

  const setSearch  = (v) => { setPage(0); setSearchState(v); };
  const handleDept = (v) => { setPage(0); setDept(v); setClassId(''); };
  const handleClass = (v) => { setPage(0); setClassId(v); };

  return {
    students:   data?.content ?? data ?? [],
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    page,
    search,
    dept,
    classId,
    setPage,
    setSearch,
    setDept: handleDept,
    setClassId: handleClass,
    fetchStudents: refetch,
  };
};

export default useStudents;
