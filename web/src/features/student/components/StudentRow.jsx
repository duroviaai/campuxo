import { memo } from 'react';
import { getFullName } from '../utils/studentHelpers';

const StudentRow = memo(({ student, onEdit, onDelete, onView, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{getFullName(student)}</td>
    <td className="px-4 py-3 text-gray-500 text-xs">{student.email || '—'}</td>
    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{student.registrationNumber || '—'}</td>
    <td className="px-4 py-3 text-gray-600 text-xs">
      {student.department
        ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{student.department}</span>
        : '—'}
    </td>
    <td className="px-4 py-3 text-gray-600 text-xs">{student.classBatchDisplayName || student.classBatchName || '—'}</td>
    <td className="px-4 py-3 text-gray-600 text-xs">{student.yearOfStudy ? `Year ${student.yearOfStudy}` : '—'}</td>
    <td className="px-4 py-3 flex gap-2">
      {onView && <button onClick={() => onView(student.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">View</button>}
      <button onClick={() => onEdit(student.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
      <button onClick={() => onDelete(student.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
    </td>
  </tr>
));

export default StudentRow;
