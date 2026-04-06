import { useNavigate } from 'react-router-dom';
import useFaculty from '../hooks/useFaculty';
import { useDeleteFacultyMutation } from '../state/facultyApi';
import FacultyTable from '../components/FacultyTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';
import { DEPARTMENTS } from '../utils/facultyHelpers';

const selCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const FacultyListPage = () => {
  const navigate = useNavigate();
  const { faculty, loading, error, page, totalPages, search, dept, setPage, setSearch, setDept } = useFaculty();
  const [deleteFaculty] = useDeleteFacultyMutation();

  const handleEdit          = (id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/edit`);
  const handleAssignCourses = (id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/assign-courses`);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    await deleteFaculty(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_FACULTY_CREATE)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Faculty
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Search</label>
          <input
            type="text"
            placeholder="Name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${selCls} w-48`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className={selCls}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {(dept || search) && (
          <button
            onClick={() => { setDept(''); setSearch(''); }}
            className="text-xs text-indigo-600 hover:underline self-end pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? <Loader /> : error ? (
          <Error message="Failed to load faculty." />
        ) : (
          <FacultyTable faculty={faculty} onEdit={handleEdit} onDelete={handleDelete} onAssignCourses={handleAssignCourses} />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
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
    </div>
  );
};

export default FacultyListPage;
