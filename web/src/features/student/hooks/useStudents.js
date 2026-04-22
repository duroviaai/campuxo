import { useState } from 'react';
import { useGetStudentsQuery } from '../state/studentApi';

const useStudents = ({ search = '', department = '', classBatchId = '' } = {}) => {
  const [page, setPage] = useState(0);

  const params = { page, size: 10, sort: 'id' };
  if (search)       params.search       = search;
  if (department)   params.department   = department;
  if (classBatchId) params.classBatchId = classBatchId;

  const { data, isLoading: loading, error, refetch } = useGetStudentsQuery(params);

  return {
    students:      data?.content ?? data ?? [],
    totalPages:    data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    page,
    setPage,
    fetchStudents: refetch,
  };
};

export default useStudents;
