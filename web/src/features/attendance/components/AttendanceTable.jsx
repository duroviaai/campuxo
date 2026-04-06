import { memo } from 'react';
import AttendanceRow from './AttendanceRow';
import { ATTENDANCE_COLS } from '../utils/attendanceHelpers';
import EmptyState from '../../../shared/components/feedback/EmptyState';

const AttendanceTable = memo(({ students, onStatusChange }) => {
  if (!students.length) return <EmptyState message="Select a course and date to load students." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {ATTENDANCE_COLS.map((c) => (
              <th key={c} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <AttendanceRow key={s.id} student={s} onStatusChange={onStatusChange} zebra={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default AttendanceTable;
