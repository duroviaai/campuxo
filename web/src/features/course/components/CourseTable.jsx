import { memo } from 'react';
import CourseRow from './CourseRow';
import { COURSE_COLS } from '../utils/courseHelpers';
import EmptyState from '../../../shared/components/feedback/EmptyState';

const CourseTable = memo(({ courses, onEdit, onDelete }) => {
  if (!courses?.length) return <EmptyState message="No courses found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {COURSE_COLS.map((c) => (
              <th key={c} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <CourseRow key={c.id} course={c} onEdit={onEdit} onDelete={onDelete} zebra={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default CourseTable;
