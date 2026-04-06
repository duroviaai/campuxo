import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetProgramsQuery, useGetCoursesByProgramQuery, useDeleteCourseMutation } from '../state/courseApi';
import ROUTES from '../../../app/routes/routeConstants';
import Loader from '../../../shared/components/feedback/Loader';

// ─── Department card grid ────────────────────────────────────────────────────

const DEPT_COLORS = [
  'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
  'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
  'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700',
  'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700',
  'border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700',
  'border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700',
];

const DeptGrid = ({ departments, courseCounts, onSelect }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Select a department to view its classes and courses.</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {departments.map((dept, i) => (
        <button
          key={dept}
          onClick={() => onSelect(dept)}
          className={`rounded-xl border-2 p-5 text-left transition-all ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
        >
          <p className="text-lg font-bold">{dept}</p>
          <p className="text-xs mt-1 opacity-70">
            {courseCounts[dept] ?? '…'} course{courseCounts[dept] !== 1 ? 's' : ''}
          </p>
        </button>
      ))}
      {departments.length === 0 && (
        <p className="col-span-4 text-sm text-gray-400">No departments found. Create a course first.</p>
      )}
    </div>
  </div>
);

// ─── Course table for a department ──────────────────────────────────────────

const CourseList = ({ courses, onEdit, onDelete, onAdd }) => {
  const [search, setSearch] = useState('');

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Course
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No courses found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {['Course Name', 'Code', 'Credits', 'Faculty', 'Students', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-mono font-medium">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.credits ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.facultyName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.studentCount ?? 0}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => onEdit(c.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const CourseListPage = () => {
  const navigate = useNavigate();
  const location  = useLocation();

  const [selDept, setSelDept] = useState(location.state?.dept ?? null);

  const { data: departments = [], isLoading: deptsLoading } = useGetProgramsQuery();
  const { data: courses = [], isLoading: coursesLoading, refetch } = useGetCoursesByProgramQuery(selDept, { skip: !selDept });
  const [deleteCourse] = useDeleteCourseMutation();

  // build course counts from cached program queries — use a simple map
  const loading = deptsLoading || (selDept && coursesLoading);
  const error   = null;

  const loadDeptCourses = useCallback((dept) => setSelDept(dept), []);
  const handleBack = () => setSelDept(null);
  const handleEdit = (id) => navigate(`${ROUTES.ADMIN_COURSES}/${id}/edit`);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await deleteCourse(id);
    refetch();
  };
  const handleAdd = () => navigate(ROUTES.ADMIN_COURSES_CREATE);

  // course counts: derive from courses when a dept is selected, otherwise show '…'
  const courseCounts = {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selDept && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            {selDept && (
              <p className="text-xs text-gray-400 mt-0.5">
                <button onClick={handleBack} className="text-indigo-500 hover:underline">All Departments</button>
                {' › '}
                <span className="text-gray-600 font-medium">{selDept}</span>
              </p>
            )}
          </div>
        </div>

        {/* Add Course always visible */}
        {!selDept && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
          >
            + Add Course
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <Loader />
      ) : selDept ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <CourseList
            courses={courses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <DeptGrid
            departments={departments}
            courseCounts={courseCounts}
            onSelect={loadDeptCourses}
          />
        </div>
      )}
    </div>
  );
};

export default CourseListPage;
