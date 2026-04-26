import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetFacultyQuery, useDeleteFacultyMutation, useUpdateFacultyStatusMutation } from '../state/facultyApi';
import { useAssignHodMutation, useRemoveHodMutation } from '../../admin/state/adminApi';
import { getFullName } from '../utils/facultyHelpers';
import ROUTES from '../../../app/routes/routeConstants';
import CreateFacultyModal from './CreateFacultyModal';
import EditFacultyModal from './EditFacultyModal';

// ── HOD Confirm Modal ─────────────────────────────────────────────────────────
const HodConfirmModal = ({ faculty, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
      <h3 className="text-base font-bold text-gray-900">Assign as HOD?</h3>
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-800">{getFullName(faculty)}</span> will become HOD
        for <span className="font-semibold text-indigo-700">{faculty.department}</span>.
      </p>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ The current HOD of this department will be downgraded to Faculty.
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white">Confirm</button>
      </div>
    </div>
  </div>
);

// ── Faculty Card ──────────────────────────────────────────────────────────────
const FacultyCard = ({ faculty, onEdit, onDelete, onAssignCourses }) => {
  const [showHodModal, setShowHodModal] = useState(false);
  const [assignHod, { isLoading: assigning }] = useAssignHodMutation();
  const [removeHod, { isLoading: removing }] = useRemoveHodMutation();
  const [updateStatus, { isLoading: toggling }] = useUpdateFacultyStatusMutation();

  const isActive = faculty.status !== 'inactive';
  const isHodCard = faculty.hod;
  const initials = getFullName(faculty).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleConfirmHod = async () => {
    setShowHodModal(false);
    try {
      await assignHod(faculty.userId).unwrap();
      toast.success(`${getFullName(faculty)} is now HOD`);
    } catch (err) { toast.error(err?.data?.message || 'Failed to assign HOD'); }
  };

  const handleRemoveHod = async () => {
    try { await removeHod(faculty.userId).unwrap(); toast.success('HOD role removed'); }
    catch { toast.error('Failed to remove HOD role'); }
  };

  const handleToggleStatus = async () => {
    const next = isActive ? 'inactive' : 'active';
    try { await updateStatus({ id: faculty.id, status: next }).unwrap(); }
    catch { toast.error('Failed to update status'); }
  };

  return (
    <>
      <div className={`relative bg-white rounded-xl border p-4 group transition-all hover:shadow-md ${
        isHodCard ? 'border-violet-300 hover:border-violet-400' : 'border-gray-200 hover:border-indigo-300'
      } ${!isActive ? 'opacity-60' : ''}`}>

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              isHodCard ? 'bg-violet-200 text-violet-800' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{getFullName(faculty)}</p>
              <p className="text-xs text-gray-400 truncate">{faculty.email || '—'}</p>
            </div>
          </div>
          <span className={`shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
          {faculty.designation && <span>{faculty.designation}</span>}
          {faculty.qualification && <span className="text-gray-400">{faculty.qualification}</span>}
          {faculty.experience != null && <span>{faculty.experience} yr{faculty.experience !== 1 ? 's' : ''} exp</span>}
          {faculty.facultyId && <span className="font-mono text-gray-400">{faculty.facultyId}</span>}
          <span><span className="font-bold text-gray-700">{faculty.courseCount ?? 0}</span> course{faculty.courseCount !== 1 ? 's' : ''}</span>
        </div>

        {faculty.subjects && (
          <p className="text-xs text-gray-400 mb-3 truncate" title={faculty.subjects}>
            📚 {faculty.subjects}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAssignCourses(faculty.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
            Courses
          </button>
          <button onClick={() => onEdit(faculty.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
            Edit
          </button>
          {isHodCard ? (
            <button onClick={handleRemoveHod} disabled={removing}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50">
              Remove HOD
            </button>
          ) : (
            <button onClick={() => setShowHodModal(true)} disabled={assigning}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 disabled:opacity-40">
              Make HOD
            </button>
          )}
          <button onClick={handleToggleStatus} disabled={toggling}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border disabled:opacity-50 ${
              isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
            }`}>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => onDelete(faculty.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
            Delete
          </button>
        </div>
      </div>

      {showHodModal && (
        <HodConfirmModal faculty={faculty} onConfirm={handleConfirmHod} onClose={() => setShowHodModal(false)} />
      )}
    </>
  );
};

// ── Faculty Manager ───────────────────────────────────────────────────────────
const FacultyManager = ({ dept, onBack }) => {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useGetFacultyQuery({ page: 0, size: 200, sort: 'id', department: dept.name });
  const [deleteFaculty] = useDeleteFacultyMutation();

  const all = data?.content ?? data ?? [];
  const hod = all.find((f) => f.hod) ?? null;
  const rest = all.filter((f) => !f.hod);

  const handleDelete = async (id) => {
    const f = all.find((x) => x.id === id);
    if ((f?.courseCount ?? 0) > 0) {
      toast.error(`Cannot delete: assigned to ${f.courseCount} course(s). Remove assignments first.`);
      return;
    }
    if (!window.confirm('Permanently delete this faculty member?')) return;
    try { await deleteFaculty(id).unwrap(); toast.success('Faculty deleted'); }
    catch (err) { toast.error(err?.data?.message || 'Failed to delete faculty.'); }
  };

  const handleAssignCourses = (id) => navigate(`${ROUTES.ADMIN_FACULTY}/${id}/assign-courses`);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <button onClick={onBack} className="text-indigo-600 hover:underline">← Departments</button>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{dept.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{dept.name}</h2>
          {!isLoading && (
            <p className="text-xs text-gray-400 mt-0.5">{all.length} member{all.length !== 1 ? 's' : ''}</p>
          )}
        </div>

      </div>

      {isLoading ? (
        <div className="space-y-5">
          <div className="h-28 rounded-xl bg-gray-100 animate-pulse max-w-sm" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        </div>
      ) : all.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-4xl">👨🏫</p>
          <p className="text-sm font-semibold text-gray-700">No faculty in {dept.name} yet</p>

        </div>
      ) : (
        <div className="space-y-6">
          {/* HOD — full-width prominent card */}
          {hod ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">Head of Department</p>
              <div className="max-w-sm">
                <FacultyCard faculty={hod} onEdit={setEditId} onDelete={handleDelete} onAssignCourses={handleAssignCourses} />
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
              No HOD assigned for {dept.name}. Use "Make HOD" on any faculty member below.
            </div>
          )}

          {/* Faculty grid */}
          {rest.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faculty Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((f) => (
                  <FacultyCard key={f.id} faculty={f} onEdit={setEditId} onDelete={handleDelete} onAssignCourses={handleAssignCourses} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {createOpen && <CreateFacultyModal onClose={() => setCreateOpen(false)} />}
      {editId && <EditFacultyModal id={editId} onClose={() => setEditId(null)} />}
    </div>
  );
};

export default FacultyManager;
