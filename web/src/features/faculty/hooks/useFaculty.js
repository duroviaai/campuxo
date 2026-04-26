import { useState } from 'react';
import { useGetFacultyQuery } from '../state/facultyApi';

const useFaculty = ({ search = '', department = '', status = '' } = {}) => {
  const [page, setPage] = useState(0);

  const params = { page, size: 10, sort: 'id' };
  if (search)     params.search     = search;
  if (department) params.department = department;
  if (status)     params.status     = status;

  const { data, isLoading: loading, error, refetch } = useGetFacultyQuery(params);

  return {
    faculty:       data?.content ?? data ?? [],
    totalPages:    data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    page,
    setPage,
    fetchFaculty: refetch,
  };
};

export default useFaculty;
