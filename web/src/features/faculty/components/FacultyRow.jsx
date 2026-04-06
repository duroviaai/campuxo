import { memo } from 'react';
import { getFullName } from '../utils/facultyHelpers';

const FacultyRow = memo(({ faculty, onEdit, onDelete, onAssignCourses, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{getFullName(faculty)}</td>
    <td className="px-4 py-3 text-gray-500">{faculty.email || '—'}</td>
    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{faculty.facultyId || '—'}</td>
    <td className="px-4 py-3 text-gray-500">{faculty.department || '—'}</td>
    <td className="px-4 py-3 flex gap-2">
      <button onClick={() => onAssignCourses(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">Assign Courses</button>
      <button onClick={() => onEdit(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
      <button onClick={() => onDelete(faculty.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
    </td>
  </tr>
));

export default FacultyRow;
