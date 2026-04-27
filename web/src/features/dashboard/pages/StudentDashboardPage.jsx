import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useGetMyCoursesQuery, useGetMyProfileQuery, useGetMyAttendanceQuery } from '../../student/state/studentApi';
import ROUTES from '../../../app/routes/routeConstants';
import { FaBook, FaCalendarCheck, FaGraduationCap, FaLayerGroup } from 'react-icons/fa';

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

const ICON_STYLES = [
  { bg: '#f5f3ff', color: '#7c3aed' },
  { bg: '#ecfdf5', color: '#059669' },
  { bg: '#eff6ff', color: '#2563eb' },
  { bg: '#fffbeb', color: '#d97706' },
];

const StatCard = ({ label, value, sub, icon, styleIdx = 0, onClick }) => {
  const s = ICON_STYLES[styleIdx];
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ border: '1px solid #e8edf2' }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = s.color + '40'; e.currentTarget.style.boxShadow = `0 4px 16px ${s.color}15`; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = ''; } : undefined}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: s.bg, color: s.color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>{label}</p>
        {sub && <p className="text-[11px] mt-1" style={{ color: s.color }}>{sub}</p>}
      </div>
    </div>
  );
};

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: courses   = [], isLoading: coursesLoading   } = useGetMyCoursesQuery();
  const { data: profile,        isLoading: profileLoading   } = useGetMyProfileQuery();
  const { data: attendance,     isLoading: attendanceLoading } = useGetMyAttendanceQuery();

  const loading = coursesLoading || profileLoading || attendanceLoading;

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
    <div className="space-y-6 animate-fade-up">
      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl h-24 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Enrolled Courses" value={courses.length} icon={<FaBook />} styleIdx={0} onClick={() => navigate(ROUTES.STUDENT_COURSES)} />
          <StatCard
            label="Avg Attendance" value={avgAttendance !== null ? `${avgAttendance}%` : '—'}
            sub={avgAttendance !== null ? (avgAttendance >= 75 ? 'Good standing' : 'Needs attention') : undefined}
            icon={<FaCalendarCheck />}
            styleIdx={avgAttendance !== null && avgAttendance < 75 ? 3 : 1}
            onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
          />
          <StatCard label="Year of Study" value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : '—'} icon={<FaGraduationCap />} styleIdx={2} />
          <StatCard label="Semester" value={profile?.semester ?? '—'} icon={<FaLayerGroup />} styleIdx={3} />
        </div>
      )}

      {/* Low attendance alert */}
      {!loading && lowAttendance.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Attendance Alert</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowAttendance.length} course{lowAttendance.length > 1 ? 's' : ''} below 75%.{' '}
              <button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)} className="underline font-semibold">
                View details
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Courses */}
        {!loading && courses.length > 0 && (
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e8edf2' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>My Courses</h2>
              <button onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                className="text-xs font-semibold transition-colors" style={{ color: '#7c3aed' }}>
                View all
              </button>
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
        )}

        {/* Attendance breakdown */}
        {!loading && summary.length > 0 && (
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e8edf2' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Attendance</h2>
              <button onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
                className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
                View details
              </button>
            </div>
            <div className="space-y-4">
              {summary.slice(0, 5).map((s) => (
                <div key={s.courseCode}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium truncate" style={{ color: '#334155' }}>{s.courseName}</p>
                    <span className="text-xs font-bold ml-2 shrink-0" style={{ color: s.percentage >= 75 ? '#059669' : s.percentage >= 50 ? '#d97706' : '#dc2626' }}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1" style={{ background: '#f1f5f9' }}>
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${s.percentage}%`,
                        background: s.percentage >= 75 ? '#10b981' : s.percentage >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{s.present}/{s.total} classes attended</p>
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
