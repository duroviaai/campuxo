import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudents from '../hooks/useStudents';
import { deleteStudent } from '../services/studentService';
import StudentFilters from '../components/StudentFilters';
import StudentTable from '../components/StudentTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';

const StudentListPage = () => {
  const { students, loading, error, page, totalPages, search, setPage, setSearch, fetchStudents } = useStudents();
  const navigate = useNavigate();

  const handleEdit   = useCallback((id) => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}/edit`), [navigate]);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    await deleteStudent(id);
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Students</h2>
        <StudentFilters search={search} setSearch={setSearch} />
      </div>

      {loading ? <Loader /> : error ? (
        <Error message="Failed to load students." />
      ) : (
        <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Previous
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentListPage;
