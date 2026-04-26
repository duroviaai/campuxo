import { memo, useState } from 'react';
import { getFullName } from '../utils/facultyHelpers';
import { useAssignHodMutation, useRemoveHodMutation } from '../../admin/state/adminApi';
import { useUpdateFacultyStatusMutation } from '../state/facultyApi';
import toast from 'react-hot-toast';

// ── HOD Confirmation Modal ────────────────────────────────────────────────────
const HodConfirmModal = ({ faculty, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🏛️</span>
        <h3 className="text-base font-bold text-gray-900">Assign as HOD?</h3>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold text-gray-800">{getFullName(faculty)}</span> will become the HOD
        for <span className="font-semibold text-indigo-700">{faculty.department}</span>.
      </p>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
        ⚠️ The current HOD of this department will be automatically downgraded to Faculty.
      </p>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ── FacultyRow ────────────────────────────────────────────────────────────────
const FacultyRow = memo(({ faculty, onEdit, onDelete, onAssignCourses, zebra }) => {
  const [showHodModal, setShowHodModal] = useState(false);
  const [assignHod,  { isLoading: assigning }] = useAssignHodMutation();
  const [removeHod,  { isLoading: removing  }] = useRemoveHodMutation();
  const [updateStatus, { isLoading: toggling }] = useUpdateFacultyStatusMutation();

  const isActive = faculty.status !== 'inactive';

  const handleConfirmHod = async () => {
    setShowHodModal(false);
    try {
      await assignHod(faculty.userId).unwrap();
      toast.success(`${getFullName(faculty)} is now HOD of ${faculty.department}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign HOD');
    }
  };

  const handleRemoveHod = async () => {
    try {
      await removeHod(faculty.userId).unwrap();
      toast.success('HOD role removed');
    } catch {
      toast.error('Failed to remove HOD role');
    }
  };

  const handleToggleStatus = async () => {
    const next = isActive ? 'inactive' : 'active';
    try {
      await updateStatus({ id: faculty.id, status: next }).unwrap();
      toast.success(`Faculty ${next === 'active' ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const rowBg = faculty.isHod
    ? 'bg-violet-50 border-l-4 border-l-violet-400'
    : zebra ? 'bg-gray-50/60' : 'bg-white';

  return (
    <>
      <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/40 transition-colors ${rowBg}`}>
        {/* Name + HOD badge */}
        <td className="px-4 py-3 font-medium text-gray-900">
          <div className="flex items-center gap-2">
            {getFullName(faculty)}
            {faculty.isHod && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 uppercase tracking-wide">
                HOD
              </span>
            )}
            {!isActive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-400 uppercase tracking-wide">
                Inactive
              </span>
            )}
          </div>
        </td>

        <td className="px-4 py-3 text-gray-500 text-xs">{faculty.email || '—'}</td>
        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{faculty.facultyId || '—'}</td>

        <td className="px-4 py-3 text-xs">
          {faculty.department
            ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{faculty.department}</span>
            : '—'}
        </td>

        <td className="px-4 py-3 text-gray-500 text-xs">{faculty.designation || '—'}</td>

        <td className="px-4 py-3 text-xs">
          {faculty.courseCount != null
            ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{faculty.courseCount}</span>
            : '—'}
        </td>

        {/* Status badge */}
        <td className="px-4 py-3 text-xs">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${
            isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* HOD toggle */}
            {faculty.isHod ? (
              <button
                onClick={handleRemoveHod}
                disabled={removing}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-50"
              >
                Remove HOD
              </button>
            ) : (
              <button
                onClick={() => setShowHodModal(true)}
                disabled={assigning || !faculty.department}
                title={!faculty.department ? 'Assign a department first' : 'Make HOD'}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition-colors disabled:opacity-40"
              >
                Make HOD
              </button>
            )}

            <button
              onClick={() => onAssignCourses(faculty.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              Courses
            </button>

            <button
              onClick={() => onEdit(faculty.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Edit
            </button>

            {/* Deactivate / Activate */}
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                isActive
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={() => onDelete(faculty.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {showHodModal && (
        <HodConfirmModal
          faculty={faculty}
          onConfirm={handleConfirmHod}
          onClose={() => setShowHodModal(false)}
        />
      )}
    </>
  );
});

export default FacultyRow;
