import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyCourses, getFacultyAssignments, getCourseStudents } from '../services/facultyService';
import ROUTES from '../../../app/routes/routeConstants';

const FacultyCoursesPage = () => {
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [studentsModal, setStudentsModal]     = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getFacultyCourses(), getFacultyAssignments()])
      .then(([c, a]) => { setCourses(c ?? []); setAssignments(a ?? []); })
      .catch((err) => setError(err.message ?? 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const openStudents = async (course) => {
    setStudentsModal({ courseName: course.name, students: [] });
    setStudentsLoading(true);
    try {
      const students = await getCourseStudents(course.id);
      setStudentsModal({ courseName: course.name, students: students ?? [] });
    } finally {
      setStudentsLoading(false);
    }
  };

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
                        ? <span className="text-gray-300">No class assigned</span>
                        : courseAssignments
                            .map((a) => a.classDisplayName)
                            .filter(Boolean)
                            .join(', ') || <span className="text-gray-400">Assigned (no class yet)</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <button
                        onClick={() => openStudents(course)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {course.studentCount ?? 0} students
                      </button>
                    </td>
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

      {studentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{studentsModal.courseName} — Students</h2>
              <button onClick={() => setStudentsModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {studentsLoading ? (
                <p className="text-sm text-gray-500 p-6">Loading...</p>
              ) : studentsModal.students.length === 0 ? (
                <p className="text-sm text-gray-400 p-6 text-center">No students enrolled.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Reg No.</th>
                      <th className="px-6 py-3 text-left">Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentsModal.students.map((s, i) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-6 py-3 text-gray-900">{s.fullName}</td>
                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">{s.registrationNumber ?? '—'}</td>
                        <td className="px-6 py-3 text-gray-500">{s.classBatchName ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyCoursesPage;
