import { useGetHodStatsQuery, useGetHodCoursesQuery } from '../state/hodApi';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routeConstants';
import { Card, EmptyState } from '../../../shared/components/ui/PageShell';
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaClipboardList, FaChartBar } from 'react-icons/fa';

const STATS_CFG = [
  { key: 'totalFaculty',  label: 'Faculty',  icon: FaChalkboardTeacher, accent: { bg: '#f5f3ff', color: '#7c3aed' }, route: 'HOD_FACULTY' },
  { key: 'totalStudents', label: 'Students', icon: FaUserGraduate,      accent: { bg: '#ecfdf5', color: '#059669' }, route: 'HOD_STUDENTS' },
  { key: 'totalCourses',  label: 'Programs',  icon: FaBook,              accent: { bg: '#fffbeb', color: '#d97706' }, route: 'HOD_COURSES' },
  { key: 'attendance',    label: 'Attendance', icon: FaClipboardList,   accent: { bg: '#eff6ff', color: '#2563eb' }, route: 'HOD_ATTENDANCE' },
  { key: 'ia',            label: 'Internal Assessment', icon: FaChartBar, accent: { bg: '#fdf4ff', color: '#9333ea' }, route: 'HOD_IA' },
];

// nav-only keys that don't map to a stats field
const NAV_ONLY = new Set(['attendance', 'ia']);

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
      {NAV_ONLY.has(statKey)
        ? <p className="text-xs font-semibold mt-1" style={{ color: accent.color }}>View →</p>
        : <p className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>{value ?? '—'}</p>
      }
      <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>{label}</p>
    </div>
  </button>
);

const HodDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useGetHodStatsQuery();
  const { data: courses = [], isLoading: coursesLoading } = useGetHodCoursesQuery();

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsLoading
          ? [1,2,3].map(i => <div key={i} className="rounded-xl h-28 skeleton" />)
          : STATS_CFG.map(({ key, label, icon: Icon, accent, route }) => (
              <StatCard key={key} statKey={key} label={label} value={stats?.[key]} Icon={Icon} accent={accent} onClick={() => navigate(ROUTES[route])} />
            ))
        }
      </div>

      {/* Department programs */}
      {!coursesLoading && courses.length === 0 && (
        <EmptyState message="No programs in your department yet." />
      )}
      {!coursesLoading && courses.length > 0 && (
        <Card>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Department Programs</p>
            <button onClick={() => navigate(ROUTES.HOD_COURSES)} className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
            {courses.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ border: '1px solid #f1f5f9' }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                  {c.code?.slice(0, 2) ?? '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>{c.studentCount ?? 0} students · {c.facultyName ?? 'Unassigned'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HodDashboardPage;
