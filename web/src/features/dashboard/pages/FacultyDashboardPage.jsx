import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useGetFacultyCoursesQuery, useGetFacultyAssignmentsQuery } from '../../faculty/state/facultyApi';
import ROUTES from '../../../app/routes/routeConstants';

const StatCard = ({ label, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: courses = [],     isLoading: coursesLoading }     = useGetFacultyCoursesQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetFacultyAssignmentsQuery();

  const loading = coursesLoading || assignmentsLoading;
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.username} 👋</h1>
        <p className="text-xs text-gray-400 mt-0.5">Faculty overview</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Assigned Courses"  value={courses.length}     icon="📚" color="bg-indigo-50 text-indigo-600"   onClick={() => navigate(ROUTES.FACULTY_COURSES)} />
          <StatCard label="Total Students"    value={totalStudents}      icon="🎓" color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Class Assignments" value={assignments.length} icon="🗓️" color="bg-amber-50 text-amber-600"    onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)} />
        </div>
      )}

      {/* Course list */}
      {!loading && courses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">My Courses</h2>
            <button onClick={() => navigate(ROUTES.FACULTY_COURSES)} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                  {c.code?.slice(0, 2) ?? '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.studentCount ?? 0} students · {c.credits ?? 0} credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          No courses assigned yet.
        </div>
      )}
    </div>
  );
};

export default FacultyDashboardPage;
