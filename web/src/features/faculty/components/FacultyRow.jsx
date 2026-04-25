import { memo } from 'react';
import { getFullName } from '../utils/facultyHelpers';
import { useAssignHodMutation, useRemoveHodMutation } from '../../admin/state/adminApi';
import toast from 'react-hot-toast';

const FacultyRow = memo(({ faculty, onEdit, onDelete, onAssignCourses, zebra }) => {
  const [assignHod,  { isLoading: assigning }] = useAssignHodMutation();
  const [removeHod,  { isLoading: removing  }] = useRemoveHodMutation();

  const handleToggleHod = async () => {
    try {
      if (faculty.isHod) {
        await removeHod(faculty.userId).unwrap();
        toast.success('HOD role removed');
      } else {
        await assignHod(faculty.userId).unwrap();
        toast.success('HOD role assigned');
      }
    } catch {
      toast.error('Failed to update HOD role');
    }
  };

  return (
    <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
      <td className="px-4 py-3 font-medium text-gray-900">
        <div className="flex items-center gap-2">
          {getFullName(faculty)}
          {faculty.isHod && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">HOD</span>
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
      <td className="px-4 py-3 text-gray-500 text-xs">{faculty.phone || '—'}</td>
      <td className="px-4 py-3 text-xs">
        {faculty.courseCount != null
          ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{faculty.courseCount}</span>
          : '—'}
      </td>
      <td className="px-4 py-3 flex gap-2 flex-wrap">
        <button
          onClick={handleToggleHod}
          disabled={assigning || removing}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
            faculty.isHod
              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {faculty.isHod ? 'Remove HOD' : 'Make HOD'}
        </button>
        <button onClick={() => onAssignCourses(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">Courses</button>
        <button onClick={() => onEdit(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
        <button onClick={() => onDelete(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
      </td>
    </tr>
  );
});

export default FacultyRow;
