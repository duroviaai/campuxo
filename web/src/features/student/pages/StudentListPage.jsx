import { useNavigate } from 'react-router-dom';
import useStudents from '../hooks/useStudents';
import { useGetAllClassesQuery, useDeleteStudentMutation } from '../state/studentApi';
import StudentTable from '../components/StudentTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';
import { DEPARTMENTS } from '../utils/studentHelpers';

const selCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const StudentListPage = () => {
  const navigate = useNavigate();
  const { students, loading, error, page, totalPages, search, dept, classId, setPage, setSearch, setDept, setClassId } = useStudents();
  const { data: classes = [] } = useGetAllClassesQuery();
  const [deleteStudent] = useDeleteStudentMutation();

  const handleEdit   = (id) => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}/edit`);
  const handleView   = (id) => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await deleteStudent(id);
  };

  const filteredClasses = dept
    ? classes.filter((c) => (c.name ?? '').toUpperCase().includes(dept.toUpperCase().slice(0, 3)))
    : classes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS_CREATE)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Search</label>
          <input
            type="text"
            placeholder="Name, email, reg no…"
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Class / Batch</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={selCls}>
            <option value="">All Classes</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName || `${c.name} Yr${c.year} Sec-${c.section}`}
              </option>
            ))}
          </select>
        </div>

        {(dept || classId || search) && (
          <button
            onClick={() => { setDept(''); setClassId(''); setSearch(''); }}
            className="text-xs text-indigo-600 hover:underline self-end pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? <Loader /> : error ? (
          <Error message="Failed to load students." />
        ) : (
          <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
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

export default StudentListPage;
