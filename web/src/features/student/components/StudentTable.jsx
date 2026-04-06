import { memo } from 'react';
import StudentRow from './StudentRow';
import { STUDENT_COLS } from '../utils/studentHelpers';
import EmptyState from '../../../shared/components/feedback/EmptyState';

const StudentTable = memo(({ students, onEdit, onDelete, onView }) => {
  if (!students?.length) return <EmptyState message="No students found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {STUDENT_COLS.map((c) => (
              <th key={c} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <StudentRow key={s.id} student={s} onEdit={onEdit} onDelete={onDelete} onView={onView} zebra={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default StudentTable;
