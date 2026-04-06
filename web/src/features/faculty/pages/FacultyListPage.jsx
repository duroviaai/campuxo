import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useFaculty from '../hooks/useFaculty';
import { deleteFaculty } from '../services/facultyService';
import FacultyFilters from '../components/FacultyFilters';
import FacultyTable from '../components/FacultyTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';

const FacultyListPage = () => {
  const { faculty, loading, error, page, totalPages, search, setPage, setSearch, fetchFaculty } = useFaculty();
  const navigate = useNavigate();

  const handleEdit   = useCallback((id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/edit`), [navigate]);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    await deleteFaculty(id);
    fetchFaculty();
  }, [fetchFaculty]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Faculty</h2>
        <div className="flex items-center gap-2">
          <FacultyFilters search={search} setSearch={setSearch} />
          <button onClick={() => navigate(ROUTES.ADMIN_FACULTY_CREATE)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
            Add Faculty
          </button>
        </div>
      </div>

      {loading ? <Loader /> : error ? (
        <Error message="Failed to load faculty." />
      ) : (
        <FacultyTable faculty={faculty} onEdit={handleEdit} onDelete={handleDelete} />
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

export default FacultyListPage;
