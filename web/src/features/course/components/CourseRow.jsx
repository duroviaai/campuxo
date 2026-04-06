import { memo } from 'react';

const CourseRow = memo(({ course, onEdit, onDelete, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
    <td className="px-4 py-3">
      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-mono font-medium">{course.code}</span>
    </td>
    <td className="px-4 py-3">
      {course.programType
        ? <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{course.programType}</span>
        : <span className="text-gray-400">—</span>}
    </td>
    <td className="px-4 py-3 text-gray-500">{course.credits ?? '—'}</td>
    <td className="px-4 py-3 text-gray-500">{course.facultyName || '—'}</td>
    <td className="px-4 py-3 text-gray-500">{course.studentCount ?? 0}</td>
    <td className="px-4 py-3 flex gap-2">
      <button onClick={() => onEdit(course.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Edit</button>
      <button onClick={() => onDelete(course.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
    </td>
  </tr>
));

export default CourseRow;
