import { useEffect, useState } from 'react';
import { getMyCourses } from '../services/studentService';

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getMyCourses()
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
        <p className="text-sm text-gray-500">No courses enrolled yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white shadow rounded-xl p-5 space-y-1">
              <p className="font-semibold text-gray-900">{course.name}</p>
              <p className="text-sm text-gray-500">{course.facultyName}</p>
              {course.credits != null && (
                <p className="text-xs text-indigo-600 font-medium">{course.credits} credits</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
