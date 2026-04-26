import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useGetMyCoursesQuery, useGetMyProfileQuery, useGetMyAttendanceQuery } from '../../student/state/studentApi';
import ROUTES from '../../../app/routes/routeConstants';

// ── helpers ───────────────────────────────────────────────────────────────────
const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

const StatCard = ({ label, value, sub, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Student Dashboard ─────────────────────────────────────────────────────────
const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: courses  = [], isLoading: coursesLoading  } = useGetMyCoursesQuery();
  const { data: profile,       isLoading: profileLoading  } = useGetMyProfileQuery();
  const { data: attendance,    isLoading: attendanceLoading } = useGetMyAttendanceQuery();

  const loading = coursesLoading || profileLoading || attendanceLoading;

  // Attendance summary per course from the attendance records
  const summary = (() => {
    if (!attendance?.content && !Array.isArray(attendance)) return [];
    const records = Array.isArray(attendance) ? attendance : attendance.content ?? [];
    const map = {};
    records.forEach(r => {
      if (!map[r.courseId]) map[r.courseId] = { courseName: r.courseName, courseCode: r.courseCode, total: 0, present: 0 };
      map[r.courseId].total++;
      if (r.status === 'PRESENT') map[r.courseId].present++;
    });
    return Object.values(map).map(s => ({ ...s, percentage: pct(s.present, s.total) }));
  })();

  const avgAttendance = summary.length
    ? Math.round(summary.reduce((a, s) => a + s.percentage, 0) / summary.length)
    : null;

  const lowAttendance = summary.filter(s => s.percentage < 75);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome, {profile?.firstName || user?.username} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Your academic overview</p>
        </div>
        {profile && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
              {(profile.firstName || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">{profile.fullName}</p>
              <p className="text-[10px] text-gray-400">{profile.department || 'Student'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Enrolled Courses"
            value={courses.length}
            icon="📚"
            color="bg-indigo-50 text-indigo-600"
            onClick={() => navigate(ROUTES.STUDENT_COURSES)}
          />
          <StatCard
            label="Avg Attendance"
            value={avgAttendance !== null ? `${avgAttendance}%` : '—'}
            sub={avgAttendance !== null ? (avgAttendance >= 75 ? 'Good standing' : 'Needs attention') : undefined}
            icon="✅"
            color={avgAttendance !== null && avgAttendance < 75 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
            onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
          />
          <StatCard
            label="Year of Study"
            value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : '—'}
            icon="🎓"
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="Semester"
            value={profile?.semester ?? '—'}
            icon="📅"
            color="bg-blue-50 text-blue-600"
          />
        </div>
      )}

      {/* Low attendance alert */}
      {!loading && lowAttendance.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">Attendance Alert</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowAttendance.length} course{lowAttendance.length > 1 ? 's' : ''} below 75%.{' '}
              <button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)} className="underline font-semibold">
                View details
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses */}
        {!loading && courses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">My Courses</h2>
              <button onClick={() => navigate(ROUTES.STUDENT_COURSES)} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {courses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.code?.slice(0, 2) ?? '??'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.facultyName || 'No instructor'} · {c.credits ?? 0} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance breakdown */}
        {!loading && summary.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Attendance</h2>
              <button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                View details →
              </button>
            </div>
            <div className="space-y-4">
              {summary.slice(0, 5).map((s) => (
                <div key={s.courseCode}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-700 truncate">{s.courseName}</p>
                    <span className={`text-xs font-bold ml-2 shrink-0 ${s.percentage >= 75 ? 'text-emerald-600' : s.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${s.percentage >= 75 ? 'bg-emerald-500' : s.percentage >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.present}/{s.total} classes</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
