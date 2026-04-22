import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetProgramsQuery,
  useGetCoursesByProgramQuery,
  useGetDeptCountsQuery,
  useDeleteCourseMutation,
} from '../state/courseApi';
import ROUTES from '../../../app/routes/routeConstants';
import Loader from '../../../shared/components/feedback/Loader';
import useDebounce from '../../../shared/hooks/useDebounce';

const DEPT_COLORS = [
  'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
  'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
  'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700',
  'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700',
  'border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700',
  'border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700',
];

// ─── Dept card grid ──────────────────────────────────────────────────────────

const DeptGrid = ({ departments, counts, onSelect, onAdd }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">Select a department to manage its courses.</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
      >
        + Add Course
      </button>
    </div>
    {departments.length === 0 ? (
      <div className="py-12 text-center space-y-2">
        <p className="text-3xl">📚</p>
        <p className="text-sm font-semibold text-gray-700">No departments yet</p>
        <p className="text-xs text-gray-400">Create a course to get started.</p>
        <button onClick={onAdd} className="mt-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
          + Add First Course
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {departments.map((dept, i) => (
          <button
            key={dept}
            onClick={() => onSelect(dept)}
            className={`rounded-xl border-2 p-5 text-left transition-all ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
          >
            <p className="text-lg font-bold">{dept}</p>
            <p className="text-xs mt-1 opacity-70">
              {counts?.[dept] ?? '…'} course{counts?.[dept] !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>
    )}
  </div>
);

// ─── Course list for a dept ──────────────────────────────────────────────────

const DeptCourseList = ({ dept, onEdit, onDelete, onAdd }) => {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  const { data: allCourses = [], isLoading } = useGetCoursesByProgramQuery(dept);

  const filtered = allCourses.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or code…"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[200px]"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Course
        </button>
      </div>

      {isLoading ? <Loader /> : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No courses found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {['Course Name', 'Code', 'Credits', 'Faculty', 'Students', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-mono font-medium">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.credits ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.facultyName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">{c.studentCount ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => onEdit(c.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
                    <button onClick={() => onDelete(c.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
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
  const navigate  = useNavigate();
  const location  = useLocation();
  const [selDept, setSelDept] = useState(location.state?.dept ?? null);

  const { data: departments = [], isLoading: deptsLoading } = useGetProgramsQuery();
  const { data: counts }                                    = useGetDeptCountsQuery();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleEdit   = (id) => navigate(`${ROUTES.ADMIN_COURSES}/${id}/edit`);
  const handleAdd    = () => navigate(ROUTES.ADMIN_COURSES_CREATE);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id).unwrap();
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {selDept && (
          <button
            onClick={() => setSelDept(null)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          {selDept && (
            <p className="text-xs text-gray-400 mt-0.5">
              <button onClick={() => setSelDept(null)} className="text-indigo-500 hover:underline">All Departments</button>
              {' › '}
              <span className="text-gray-600 font-medium">{selDept}</span>
            </p>
          )}
        </div>
      </div>

      {deptsLoading ? <Loader /> : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {selDept ? (
            <DeptCourseList
              dept={selDept}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          ) : (
            <DeptGrid
              departments={departments}
              counts={counts}
              onSelect={setSelDept}
              onAdd={handleAdd}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CourseListPage;
