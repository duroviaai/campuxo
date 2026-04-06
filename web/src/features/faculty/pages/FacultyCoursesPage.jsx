import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyCourses } from '../services/facultyService';
import ROUTES from '../../../app/routes/routeConstants';

const FacultyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate              = useNavigate();

  useEffect(() => {
    getFacultyCourses()
      .then(setCourses)
      .catch((err) => setError(err.message ?? 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading courses...</p>;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>

      {courses.length === 0 ? (
        <p className="text-sm text-gray-500">No courses assigned yet.</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Students</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {course.totalStudents ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE, { state: { courseId: course.id } })}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyCoursesPage;
