import { useNavigate } from 'react-router-dom';
import { useGetFacultyStatsQuery, useGetFacultyCoursesQuery } from '../../faculty/state/facultyApi';
import ROUTES from '../../../app/routes/routeConstants';
import { FaBook, FaUserGraduate, FaLayerGroup, FaClipboardList } from 'react-icons/fa';

const STATS_CFG = [
  { key: 'totalCourses',         label: 'Total Courses',    Icon: FaBook,          accent: { bg: '#f5f3ff', color: '#7c3aed' }, route: ROUTES.FACULTY_COURSES },
  { key: 'totalStudents',        label: 'Total Students',   Icon: FaUserGraduate,  accent: { bg: '#ecfdf5', color: '#059669' }, route: null },
  { key: 'totalClassStructures', label: 'Total Classes',    Icon: FaLayerGroup,    accent: { bg: '#fffbeb', color: '#d97706' }, route: ROUTES.FACULTY_ATTENDANCE },
  { key: 'overallAttendanceRate',label: 'Attendance Rate',  Icon: FaClipboardList, accent: { bg: '#eff6ff', color: '#2563eb' }, route: ROUTES.FACULTY_ATTENDANCE },
];

const StatCard = ({ statKey, label, value, Icon, accent, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white rounded-xl p-5 flex flex-col gap-3 text-left w-full transition-all"
    style={{ border: '1px solid #e8edf2' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent.color + '40'; e.currentTarget.style.boxShadow = `0 4px 16px ${accent.color}15`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent.bg, color: accent.color }}>
        <Icon size={14} />
      </div>
      <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </div>
    <div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
        {statKey === 'overallAttendanceRate' ? `${value ?? 0}%` : (value ?? '—')}
      </p>
      <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>{label}</p>
    </div>
  </button>
);

const FacultyDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useGetFacultyStatsQuery();
  const { data: courses = [], isLoading: coursesLoading } = useGetFacultyCoursesQuery();

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [1,2,3,4].map(i => <div key={i} className="rounded-xl h-28 skeleton" />)
          : STATS_CFG.map(({ key, label, Icon, accent, route }) => (
              <StatCard
                key={key}
                statKey={key}
                label={label}
                value={stats?.[key]}
                Icon={Icon}
                accent={accent}
                onClick={route ? () => navigate(route) : undefined}
              />
            ))
        }
      </div>

      {!coursesLoading && courses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">My Courses</h2>
            <button onClick={() => navigate(ROUTES.FACULTY_COURSES)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50"
                style={{ border: '1px solid #f1f5f9' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  {c.code?.slice(0, 2) ?? '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.studentCount ?? 0} students · {c.credits ?? 0} credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!coursesLoading && courses.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm font-semibold text-slate-700">No courses assigned yet</p>
          <p className="text-xs text-slate-400 mt-1">Your assigned courses will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboardPage;
