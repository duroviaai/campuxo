import { memo } from 'react';
import StatusSelector from './StatusSelector';

const AttendanceRow = memo(({ student, onStatusChange, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{student.registrationNumber}</td>
    <td className="px-4 py-3">
      <StatusSelector value={student.status} onChange={(s) => onStatusChange(student.id, s)} />
    </td>
  </tr>
));

export default AttendanceRow;
