import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useCourses from '../hooks/useCourses';
import { deleteCourse } from '../services/courseService';
import CourseFilters from '../components/CourseFilters';
import CourseTable from '../components/CourseTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';

const CourseListPage = () => {
  const { courses, loading, error, page, totalPages, search, setPage, setSearch, fetchCourses } = useCourses();
  const navigate = useNavigate();

  const handleEdit   = useCallback((id) => navigate(`${ROUTES.ADMIN_COURSES}/${id}/edit`), [navigate]);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await deleteCourse(id);
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Courses</h2>
        <div className="flex items-center gap-2">
          <CourseFilters search={search} setSearch={setSearch} />
          <button onClick={() => navigate(ROUTES.ADMIN_COURSES_CREATE)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
            Add Course
          </button>
        </div>
      </div>

      {loading ? <Loader /> : error ? (
        <Error message="Failed to load courses." />
      ) : (
        <CourseTable courses={courses} onEdit={handleEdit} onDelete={handleDelete} />
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

export default CourseListPage;
