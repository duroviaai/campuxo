import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyCourses, getFacultyAssignments } from '../services/facultyService';
import ROUTES from '../../../app/routes/routeConstants';

const FacultyCoursesPage = () => {
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const navigate                      = useNavigate();

  useEffect(() => {
    Promise.all([getFacultyCourses(), getFacultyAssignments()])
      .then(([c, a]) => { setCourses(c ?? []); setAssignments(a ?? []); })
      .catch((err) => setError(err.message ?? 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading courses...</p>;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  // Group assignments by courseId for quick lookup
  const assignmentsByCourse = assignments.reduce((acc, a) => {
    if (!acc[a.courseId]) acc[a.courseId] = [];
    acc[a.courseId].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center space-y-2">
          <p className="text-3xl">📚</p>
          <p className="text-sm font-semibold text-gray-700">No courses assigned yet.</p>
          <p className="text-xs text-gray-400">Contact your admin to get courses assigned.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Credits</th>
                <th className="px-6 py-3 text-left">Classes</th>
                <th className="px-6 py-3 text-left">Students</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course, i) => {
                const courseAssignments = assignmentsByCourse[course.id] ?? [];
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{course.code || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{course.credits ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {courseAssignments.length === 0
                        ? '—'
                        : courseAssignments.map((a) => a.classDisplayName).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{course.studentCount ?? '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      >
                        Mark / View Attendance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyCoursesPage;
