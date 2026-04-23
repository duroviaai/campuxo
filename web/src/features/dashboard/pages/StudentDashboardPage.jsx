import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { getMyCourses, getMyAttendance, getMyProfile } from '../../student/services/studentService';
import { getMyAttendanceSummary } from '../../attendance/services/attendanceService';
import ROUTES from '../../../app/routes/routeConstants';

const StatCard = ({ label, value, icon, color, onClick, trend }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`text-2xl w-14 h-14 flex items-center justify-center rounded-xl ${color} shadow-sm`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
    </div>
  </div>
);

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getMyCourses(),
      getMyAttendance(),
      getMyAttendanceSummary(),
      getMyProfile()
    ])
      .then(([c, a, s, p]) => {
        if (c.status === 'fulfilled') setCourses(c.value ?? []);
        if (a.status === 'fulfilled') setAttendance(a.value ?? []);
        if (s.status === 'fulfilled') setSummary(s.value ?? []);
        if (p.status === 'fulfilled') setProfile(p.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const presentCount = attendance.filter((r) => r.status === 'PRESENT').length;
  const attendancePct = attendance.length
    ? Math.round((presentCount / attendance.length) * 100)
    : null;

  const avgAttendance = summary.length
    ? Math.round(summary.reduce((acc, s) => acc + s.attendancePercentage, 0) / summary.length)
    : null;

  const lowAttendanceCourses = summary.filter(s => s.attendancePercentage < 75);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with profile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.firstName || user?.username}! 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's your academic overview for today.</p>
        </div>
        {profile && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                {(profile.firstName || '?')[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile.fullName}</p>
              <p className="text-xs text-gray-500">{profile.department || 'Student'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Enrolled Courses"
            value={courses.length}
            icon="📚"
            color="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600"
            onClick={() => navigate(ROUTES.STUDENT_COURSES)}
            trend={`${courses.length} active`}
          />
          <StatCard
            label="Avg Attendance"
            value={avgAttendance !== null ? `${avgAttendance}%` : '—'}
            icon="✅"
            color={`bg-gradient-to-br ${avgAttendance >= 75 ? 'from-emerald-50 to-emerald-100 text-emerald-600' : 'from-amber-50 to-amber-100 text-amber-600'}`}
            onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
            trend={avgAttendance >= 75 ? 'Good standing' : 'Needs attention'}
          />
          <StatCard
            label="Classes Attended"
            value={`${presentCount}/${attendance.length}`}
            icon="📋"
            color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
            trend={`${attendancePct || 0}% present`}
          />
          <StatCard
            label="Year of Study"
            value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : '—'}
            icon="🎓"
            color="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600"
            trend={profile?.classBatchName || 'Student'}
          />
        </div>
      )}

      {/* Alert for low attendance */}
      {!loading && lowAttendanceCourses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Attendance Alert</p>
            <p className="text-xs text-amber-700 mt-1">
              You have {lowAttendanceCourses.length} course{lowAttendanceCourses.length > 1 ? 's' : ''} with attendance below 75%.
              {' '}<button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)} className="underline font-medium">View details</button>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled courses */}
        {!loading && courses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">My Courses</h2>
              <button
                onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {courses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {c.code?.slice(0, 2) || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.facultyName || 'No instructor'} • {c.credits || 0} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance summary */}
        {!loading && summary.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Attendance Overview</h2>
              <button
                onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                View details →
              </button>
            </div>
            <div className="space-y-3">
              {summary.slice(0, 5).map((s) => (
                <div key={s.courseCode} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{s.courseName}</p>
                      <span className={`text-xs font-bold ${s.attendancePercentage >= 75 ? 'text-emerald-600' : s.attendancePercentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {s.attendancePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${s.attendancePercentage >= 75 ? 'bg-emerald-500' : s.attendancePercentage >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${s.attendancePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{s.attendedClasses}/{s.totalClasses} classes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all"
          >
            <span className="text-2xl block mb-1">👤</span>
            <span className="text-xs font-semibold">My Profile</span>
          </button>
          <button
            onClick={() => navigate(ROUTES.STUDENT_COURSES)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all"
          >
            <span className="text-2xl block mb-1">📚</span>
            <span className="text-xs font-semibold">Browse Courses</span>
          </button>
          <button
            onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all"
          >
            <span className="text-2xl block mb-1">📊</span>
            <span className="text-xs font-semibold">View Attendance</span>
          </button>
          <button
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all opacity-60 cursor-not-allowed"
            disabled
          >
            <span className="text-2xl block mb-1">📅</span>
            <span className="text-xs font-semibold">Timetable</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
