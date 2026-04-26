import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useGetStudentsQuery, useDeleteStudentMutation, useAdminCreateStudentMutation, useUpdateStudentMutation, useGetStudentByIdQuery } from '../state/studentApi';
import { useGetDepartmentsQuery } from '../../admin/courses/coursesAdminApi';
import StudentForm from '../components/StudentForm';
import AttendanceSummaryView from '../../attendance/components/AttendanceSummaryView';
import useDebounce from '../../../shared/hooks/useDebounce';
import { getFullName } from '../utils/studentHelpers';

// ── Shared ────────────────────────────────────────────────────────────────────
const SchemeBadge = ({ scheme }) => scheme ? (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
    scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
  }`}>{scheme}</span>
) : <span className="text-gray-300">—</span>;

const Avatar = ({ name, size = 'sm' }) => {
  const initials = name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0`}>
      {initials}
    </div>
  );
};

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const StudentModal = ({ studentId, onClose }) => {
  const isEdit = !!studentId;
  const { data: existing, isLoading } = useGetStudentByIdQuery(studentId, { skip: !isEdit });
  const [adminCreate, { isLoading: creating }] = useAdminCreateStudentMutation();
  const [update, { isLoading: updating }]      = useUpdateStudentMutation();

  const handleSubmit = async (data) => {
    try {
      if (isEdit) {
        await update({ id: studentId, ...data }).unwrap();
        toast.success('Student updated.');
      } else {
        await adminCreate(data).unwrap();
        toast.success('Student created.');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save student.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto p-6">
          {isEdit && isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <StudentForm
              initialData={isEdit ? existing : undefined}
              onSubmit={handleSubmit}
              saving={creating || updating}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Detail Slide-over ─────────────────────────────────────────────────────────
const StudentDetail = ({ studentId, onClose, onEdit }) => {
  const { data: student, isLoading } = useGetStudentByIdQuery(studentId);
  const name = student ? getFullName(student) : '…';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-xs text-indigo-600 hover:underline">← Students</button>
          <button onClick={onEdit}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
            Edit
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : student ? (
            <>
              {/* Profile strip */}
              <div className="flex items-center gap-4">
                <Avatar name={name} size="lg" />
                <div>
                  <p className="text-lg font-bold text-gray-900">{name}</p>
                  {student.registrationNumber && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{student.registrationNumber}</p>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Email',       student.email],
                  ['Phone',       student.phone],
                  ['Department',  student.department],
                  ['Year',        student.yearOfStudy ? `Year ${student.yearOfStudy}` : null],
                  ['Batch',       student.classBatchStartYear ? `${student.classBatchStartYear}–${student.classBatchEndYear}` : null],
                  ['Date of Birth', student.dateOfBirth],
                ].map(([label, value]) => value ? (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                  </div>
                ) : null)}
                <div>
                  <p className="text-xs text-gray-400">Scheme</p>
                  <div className="mt-0.5"><SchemeBadge scheme={student.scheme} /></div>
                </div>
              </div>

              {/* Attendance */}
              <AttendanceSummaryView studentId={Number(studentId)} studentName={name} />
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Student not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Student row ───────────────────────────────────────────────────────────────
const StudentRow = ({ student, onView, onEdit, onDelete, index }) => {
  const name = getFullName(student);
  return (
    <tr className={`group border-b border-gray-100 last:border-0 hover:bg-indigo-50/40 transition-colors cursor-pointer ${
      index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
    }`} onClick={() => onView(student.id)}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400 truncate">{student.email || '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{student.registrationNumber || '—'}</td>
      <td className="px-4 py-3 text-xs">
        {student.department
          ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{student.department}</span>
          : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        {student.yearOfStudy ? `Year ${student.yearOfStudy}` : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
        {student.classBatchStartYear
          ? `${student.classBatchStartYear}–${student.classBatchEndYear}`
          : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3"><SchemeBadge scheme={student.scheme} /></td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(student.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
            Edit
          </button>
          <button onClick={() => onDelete(student.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment]   = useState('');
  const [page, setPage]               = useState(0);
  const [modal, setModal]             = useState(null);  // null | 'add' | { edit: id }
  const [detail, setDetail]           = useState(null);  // studentId

  const search = useDebounce(searchInput, 300);

  const params = useMemo(() => {
    const p = { page, size: 15, sort: 'id' };
    if (search)     p.search     = search;
    if (department) p.department = department;
    return p;
  }, [page, search, department]);

  const { data, isLoading, error } = useGetStudentsQuery(params);
  const { data: depts = [] }       = useGetDepartmentsQuery();
  const [deleteStudent]            = useDeleteStudentMutation();

  const students     = data?.content ?? data ?? [];
  const totalPages   = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try { await deleteStudent(id).unwrap(); toast.success('Student deleted.'); }
    catch { toast.error('Failed to delete student.'); }
  };

  const handleEdit = (id) => {
    setDetail(null);
    setModal({ edit: id });
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {totalElements} student{totalElements !== 1 ? 's' : ''} total
            </p>
          )}
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
          placeholder="Search by name, email or reg. no."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[240px]" />
        <select value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">All Departments</option>
          {depts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="p-8 text-sm text-red-500 text-center">Failed to load students.</p>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-4xl">🎓</p>
            <p className="text-sm font-semibold text-gray-700">
              {search || department ? 'No students match your filters.' : 'No students yet.'}
            </p>

          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Reg. No.', 'Department', 'Year', 'Batch', 'Scheme', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s, i) => (
                <StudentRow key={s.id} student={s} index={i}
                  onView={setDetail}
                  onEdit={handleEdit}
                  onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <StudentModal
          studentId={modal?.edit ?? null}
          onClose={() => setModal(null)}
        />
      )}

      {/* Detail slide-over */}
      {detail && (
        <StudentDetail
          studentId={detail}
          onClose={() => setDetail(null)}
          onEdit={() => handleEdit(detail)}
        />
      )}
    </div>
  );
};

export default StudentsPage;
