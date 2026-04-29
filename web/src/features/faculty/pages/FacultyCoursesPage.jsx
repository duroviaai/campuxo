import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyCourses, getFacultyAssignments } from '../services/facultyService';
import ROUTES from '../../../app/routes/routeConstants';
import { TableWrap, Thead, Tr, Td, EmptyState, Btn } from '../../../shared/components/ui/PageShell';

const FacultyCoursesPage = () => {
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getFacultyCourses(), getFacultyAssignments()])
      .then(([c, a]) => { setCourses(c ?? []); setAssignments(a ?? []); })
      .catch((err) => setError(err.message ?? 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>;
  if (error)   return <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>;
  if (courses.length === 0) return <EmptyState message="No courses assigned yet." sub="Contact your admin to get courses assigned." />;

  const assignmentsByCourse = assignments.reduce((acc, a) => {
    if (!acc[a.courseId]) acc[a.courseId] = [];
    acc[a.courseId].push(a);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl">
      <TableWrap>
        <Thead cols={['#', 'Course', 'Code', 'Credits', 'Classes', 'Students', '']} />
        <tbody>
          {courses.map((course, i) => {
            const courseAssignments = assignmentsByCourse[course.id] ?? [];
            const classNames = courseAssignments.map(a => a.classDisplayName).filter(Boolean).join(', ');
            return (
              <Tr key={course.id}>
                <Td muted>{i + 1}</Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                      {course.code?.slice(0, 2) ?? '??'}
                    </div>
                    <span className="font-medium">{course.name}</span>
                  </div>
                </Td>
                <Td mono muted>{course.code || '—'}</Td>
                <Td muted>{course.credits ?? '—'}</Td>
                <Td muted>{classNames || <span style={{ color: '#cbd5e1' }}>None</span>}</Td>
                <Td>
                  <button
                    onClick={() => navigate(ROUTES.FACULTY_COURSE_STUDENTS.replace(':courseId', course.id))}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#7c3aed' }}
                  >
                    {course.studentCount ?? 0} students
                  </button>
                </Td>
                <Td>
                  <Btn variant="secondary" onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}>
                    Attendance
                  </Btn>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
};

export default FacultyCoursesPage;
