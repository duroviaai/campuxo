import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyStatsQuery,
  useGetMyCoursesQuery,
  useGetMyAttendanceSummaryQuery,
  useGetMyAlertsQuery,
} from '../../student/state/studentApi';
import ROUTES from '../../../app/routes/routeConstants';
import { FaBook, FaCalendarCheck, FaGraduationCap, FaExclamationTriangle } from 'react-icons/fa';

const attendanceAccent = (p) =>
  p >= 75 ? { bg: '#ecfdf5', color: '#059669' }
  : p >= 50 ? { bg: '#fffbeb', color: '#d97706' }
  : { bg: '#fef2f2', color: '#dc2626' };

const STATS_CFG = (stats) => [
  { label: 'Enrolled Courses',  value: stats?.totalEnrolledCourses ?? '—',  icon: FaBook,              accent: { bg: '#f5f3ff', color: '#7c3aed' }, route: ROUTES.STUDENT_COURSES },
  { label: 'Overall Attendance', value: stats ? `${stats.overallAttendancePercentage}%` : '—', icon: FaCalendarCheck, accent: stats ? attendanceAccent(stats.overallAttendancePercentage) : { bg: '#ecfdf5', color: '#059669' }, route: ROUTES.STUDENT_ATTENDANCE },
  { label: 'Year of Study',     value: stats?.yearOfStudy ? `Year ${stats.yearOfStudy}` : '—', icon: FaGraduationCap, accent: { bg: '#eff6ff', color: '#2563eb' }, route: null },
  { label: 'Courses at Risk',   value: stats?.coursesAtRisk ?? '—', icon: FaExclamationTriangle, accent: (stats?.coursesAtRisk ?? 0) > 0 ? { bg: '#fef2f2', color: '#dc2626' } : { bg: '#ecfdf5', color: '#059669' }, route: ROUTES.STUDENT_ATTENDANCE },
];

const StatCard = ({ label, value, Icon, accent, onClick }) => (
  <button
    onClick={onClick ?? undefined}
    className="group bg-white rounded-xl p-5 flex flex-col gap-3 text-left w-full transition-all"
    style={{ border: '1px solid #e8edf2', cursor: onClick ? 'pointer' : 'default' }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = accent.color + '40'; e.currentTarget.style.boxShadow = `0 4px 16px ${accent.color}15`; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = ''; } : undefined}
  >
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent.bg, color: accent.color }}>
        <Icon size={14} />
      </div>
      {onClick && (
        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>{label}</p>
    </div>
  </button>
);

// ── Alert styles by severity ──────────────────────────────────────────────────
const SEVERITY_STYLE = {
  HIGH:   { bg: '#fef2f2', border: '#fecaca', icon: '🚨', color: '#dc2626', label: 'Critical' },
  MEDIUM: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#d97706', label: 'Warning'  },
  LOW:    { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', color: '#2563eb', label: 'Info'     },
};

const ALERT_ACTION = {
  ATTENDANCE_LOW:    { label: 'View Attendance', route: ROUTES.STUDENT_ATTENDANCE },
  PROFILE_INCOMPLETE:{ label: 'Complete Profile', route: ROUTES.STUDENT_PROFILE   },
  IA_PENDING:        { label: 'View IA',          route: ROUTES.STUDENT_IA         },
};

const AlertsSection = ({ alerts, loading }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (loading) return <div className="h-16 skeleton rounded-xl" />;

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
        <span className="text-lg">✅</span>
        <p className="text-sm font-medium" style={{ color: '#065f46' }}>All good! No issues to report.</p>
      </div>
    );
  }

  const MAX = 5;
  const visible = showAll ? alerts : alerts.slice(0, MAX);
  const hidden  = alerts.length - MAX;

  return (
    <div className="space-y-2">
      {visible.map((alert, i) => {
        const s      = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.LOW;
        const action = ALERT_ACTION[alert.type];
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-base shrink-0">{s.icon}</span>
            <p className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: s.color }}>
              {alert.message}
            </p>
            {action && (
              <button
                onClick={() => navigate(action.route)}
                className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg transition-opacity"
                style={{ background: s.color + '18', color: s.color }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {action.label}
              </button>
            )}
          </div>
        );
      })}
      {!showAll && hidden > 0 && (
        <button onClick={() => setShowAll(true)}
          className="text-xs font-semibold w-full text-center py-1.5 rounded-lg transition-colors"
          style={{ color: '#7c3aed', background: '#f5f3ff' }}>
          +{hidden} more alert{hidden > 1 ? 's' : ''} — View all
        </button>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const StudentDashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats,       isLoading: statsLoading      } = useGetMyStatsQuery();
  const { data: courses = [], isLoading: coursesLoading   } = useGetMyCoursesQuery();
  const { data: attendanceSummary = [], isLoading: attendanceLoading } = useGetMyAttendanceSummaryQuery();
  const { data: alerts,               isLoading: alertsLoading       } = useGetMyAlertsQuery();

  const loading = statsLoading || coursesLoading || attendanceLoading;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? [1,2,3,4].map(i => <div key={i} className="rounded-xl h-28 skeleton" />)
          : STATS_CFG(stats).map(({ label, value, icon: Icon, accent, route }) => (
              <StatCard key={label} label={label} value={value} Icon={Icon} accent={accent}
                onClick={route ? () => navigate(route) : null} />
            ))
        }
      </div>

      {/* Alerts */}
      <AlertsSection alerts={alerts} loading={alertsLoading} />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl h-48 skeleton" />
          <div className="rounded-xl h-48 skeleton" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Courses */}
          {courses.length > 0 ? (
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e8edf2' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>My Courses</h2>
                <button onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                  className="text-xs font-semibold" style={{ color: '#7c3aed' }}>View all</button>
              </div>
              <div className="space-y-1">
                {courses.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: '#7c3aed' }}>
                      {c.code?.slice(0, 2) ?? '??'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{c.facultyName || 'No instructor'} &middot; {c.credits ?? 0} cr</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center py-10"
              style={{ border: '1px solid #e8edf2' }}>
              <p className="text-sm font-semibold" style={{ color: '#334155' }}>No courses enrolled yet</p>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Go to My Courses to enroll.</p>
              <button onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg text-white"
                style={{ background: '#7c3aed' }}>
                Browse Courses
              </button>
            </div>
          )}

          {/* Attendance breakdown */}
          {attendanceSummary.length > 0 ? (
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e8edf2' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Attendance</h2>
                <button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
                  className="text-xs font-semibold" style={{ color: '#7c3aed' }}>View details</button>
              </div>
              <div className="space-y-4">
                {attendanceSummary.slice(0, 5).map((s) => (
                  <div key={s.courseCode}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium truncate" style={{ color: '#334155' }}>{s.courseName}</p>
                      <span className="text-xs font-bold ml-2 shrink-0"
                        style={{ color: s.attendancePercentage >= 75 ? '#059669' : s.attendancePercentage >= 50 ? '#d97706' : '#dc2626' }}>
                        {s.attendancePercentage}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1" style={{ background: '#f1f5f9' }}>
                      <div className="h-1 rounded-full transition-all"
                        style={{ width: `${s.attendancePercentage}%`, background: s.attendancePercentage >= 75 ? '#10b981' : s.attendancePercentage >= 50 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{s.attendedClasses}/{s.totalClasses} classes attended</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 flex items-center justify-center py-10"
              style={{ border: '1px solid #e8edf2' }}>
              <p className="text-sm" style={{ color: '#94a3b8' }}>No attendance records yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
