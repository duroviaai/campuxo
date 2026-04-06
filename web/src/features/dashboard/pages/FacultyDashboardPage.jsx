import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { getFacultyCourses, getFacultyAssignments } from '../../faculty/services/facultyService';
import ROUTES from '../../../app/routes/routeConstants';

const StatCard = ({ label, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.allSettled([getFacultyCourses(), getFacultyAssignments()])
      .then(([c, a]) => {
        if (c.status === 'fulfilled') setCourses(c.value ?? []);
        if (a.status === 'fulfilled') setAssignments(a.value ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.username} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Faculty overview for today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Assigned Courses"
            value={courses.length}
            icon="📚"
            color="bg-indigo-50 text-indigo-600"
            onClick={() => navigate(ROUTES.FACULTY_COURSES)}
          />
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon="🎓"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Class Assignments"
            value={assignments.length}
            icon="🗓️"
            color="bg-amber-50 text-amber-600"
            onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}
          />
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">My Courses</h2>
            <button
              onClick={() => navigate(ROUTES.FACULTY_COURSES)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {c.code?.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.studentCount ?? 0} students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboardPage;
