import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStudents from '../hooks/useStudents';
import { useDeleteStudentMutation, useGetAllClassesQuery } from '../state/studentApi';
import StudentTable from '../components/StudentTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import ROUTES from '../../../app/routes/routeConstants';
import { DEPARTMENTS } from '../utils/studentHelpers';
import useDebounce from '../../../shared/hooks/useDebounce';

const StudentListPage = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment]   = useState('');
  const [classBatchId, setClassBatchId] = useState('');

  const search = useDebounce(searchInput, 300);

  const { students, loading, error, page, setPage, totalPages, totalElements } =
    useStudents({ search, department, classBatchId });

  const { data: classes = [] } = useGetAllClassesQuery();
  const [deleteStudent] = useDeleteStudentMutation();

  const handleDepartment  = (val) => { setDepartment(val);   setPage(0); };
  const handleClassBatch  = (val) => { setClassBatchId(val); setPage(0); };
  const handleSearchInput = (val) => { setSearchInput(val);  setPage(0); };

  const handleEdit   = (id) => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}/edit`);
  const handleView   = (id) => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await deleteStudent(id).unwrap();
      toast.success('Student deleted successfully');
    } catch {
      toast.error('Failed to delete student.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">{totalElements} student{totalElements !== 1 ? 's' : ''} total</p>
          )}
        </div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS_CREATE)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          + Add Student
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Search by name, email or reg. no."
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
        <select
          value={classBatchId}
          onChange={(e) => handleClassBatch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.displayName || `${c.name} Yr${c.year} Sec-${c.section}`}</option>
          ))}
        </select>
      </div>

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
