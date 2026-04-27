import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useGetFacultyCoursesQuery, useGetFacultyAssignmentsQuery } from '../../faculty/state/facultyApi';
import ROUTES from '../../../app/routes/routeConstants';

const ICON_STYLES = [
  { bg: '#f5f3ff', color: '#7c3aed' },
  { bg: '#ecfdf5', color: '#059669' },
  { bg: '#fffbeb', color: '#d97706' },
];

const StatCard = ({ label, value, icon, styleIdx = 0, onClick }) => {
  const s = ICON_STYLES[styleIdx];
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
      style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; } : undefined}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: s.bg, color: s.color }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
};

const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: courses     = [], isLoading: coursesLoading     } = useGetFacultyCoursesQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetFacultyAssignmentsQuery();

  const loading = coursesLoading || assignmentsLoading;
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="rounded-2xl h-24 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Assigned Courses"  value={courses.length}     icon="📚" styleIdx={0} onClick={() => navigate(ROUTES.FACULTY_COURSES)} />
          <StatCard label="Total Students"    value={totalStudents}      icon="🎓" styleIdx={1} />
          <StatCard label="Class Assignments" value={assignments.length} icon="🗓️" styleIdx={2} onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)} />
        </div>
      )}

      {!loading && courses.length > 0 && (
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

      {!loading && courses.length === 0 && (
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
