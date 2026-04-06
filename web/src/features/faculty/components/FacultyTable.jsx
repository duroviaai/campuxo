import { memo } from 'react';
import FacultyRow from './FacultyRow';
import { FACULTY_COLS } from '../utils/facultyHelpers';
import EmptyState from '../../../shared/components/feedback/EmptyState';

const FacultyTable = memo(({ faculty, onEdit, onDelete, onAssignCourses }) => {
  if (!faculty?.length) return <EmptyState message="No faculty found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {FACULTY_COLS.map((c) => (
              <th key={c} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {faculty.map((f, i) => (
            <FacultyRow key={f.id} faculty={f} onEdit={onEdit} onDelete={onDelete} onAssignCourses={onAssignCourses} zebra={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default FacultyTable;
