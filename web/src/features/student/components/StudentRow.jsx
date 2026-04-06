import { memo } from 'react';
import { getFullName } from '../utils/studentHelpers';

const StudentRow = memo(({ student, onEdit, onDelete, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{getFullName(student)}</td>
    <td className="px-4 py-3 text-gray-500">{student.email || '—'}</td>
    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{student.registrationNumber || '—'}</td>
    <td className="px-4 py-3 flex gap-2">
      <button onClick={() => onEdit(student.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
      <button onClick={() => onDelete(student.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
    </td>
  </tr>
));

export default StudentRow;
