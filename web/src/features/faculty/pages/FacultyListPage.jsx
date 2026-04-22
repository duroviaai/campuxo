import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFaculty from '../hooks/useFaculty';
import { useDeleteFacultyMutation } from '../state/facultyApi';
import FacultyTable from '../components/FacultyTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';
import { DEPARTMENTS } from '../utils/facultyHelpers';
import useDebounce from '../../../shared/hooks/useDebounce';

const FacultyListPage = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment]   = useState('');

  const search = useDebounce(searchInput, 300);

  const { faculty, loading, error, page, setPage, totalPages, totalElements } =
    useFaculty({ search, department });

  const [deleteFaculty] = useDeleteFacultyMutation();

  const handleDepartment  = (val) => { setDepartment(val); setPage(0); };
  const handleSearchInput = (val) => { setSearchInput(val); setPage(0); };

  const handleEdit          = (id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/edit`);
  const handleAssignCourses = (id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/assign-courses`);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try {
      await deleteFaculty(id).unwrap();
      toast.success('Faculty deleted successfully');
    } catch {
      toast.error('Failed to delete faculty.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">{totalElements} member{totalElements !== 1 ? 's' : ''} total</p>
          )}
        </div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_FACULTY_CREATE)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Faculty
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Search by name, email or faculty ID"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[220px]"
        />
        <select
          value={department}
          onChange={(e) => handleDepartment(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

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
