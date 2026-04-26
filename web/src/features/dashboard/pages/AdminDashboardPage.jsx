import { useNavigate } from 'react-router-dom';
import {
  useGetStatsQuery,
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
} from '../../admin/state/adminApi';
import {
  useGetDepartmentsQuery,
  useGetDeptCoursesQuery,
} from '../../admin/courses/coursesAdminApi';
import ROUTES from '../../../app/routes/routeConstants';
import toast from 'react-hot-toast';

const fmt = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

const RoleBadge = ({ roles }) => {
  const role = [...(roles ?? [])][0]?.replace('ROLE_', '') ?? '—';
  const cls = { STUDENT: 'bg-blue-50 text-blue-700', FACULTY: 'bg-violet-50 text-violet-700' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls[role] ?? 'bg-gray-100 text-gray-500'}`}>
      {role}
    </span>
  );
};

const StatCard = ({ label, value, icon, bg, onClick, loading }) => (
  <button
    onClick={onClick}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${bg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
      {loading
        ? <div className="h-7 w-10 bg-gray-100 rounded-lg animate-pulse mt-0.5" />
        : <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? '—'}</p>
      }
    </div>
    <span className="ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors text-sm">→</span>
  </button>
);

const QuickAction = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm font-medium text-gray-700 hover:text-indigo-700 w-full"
  >
    <span className="text-base">{icon}</span>
    {label}
  </button>
);

// Inner component — receives depts array so all hooks are called unconditionally
const CoursesByDeptInner = ({ depts }) => {
  const navigate = useNavigate();
  const d0 = useGetDeptCoursesQuery({ departmentId: depts[0]?.id }, { skip: !depts[0] });
  const d1 = useGetDeptCoursesQuery({ departmentId: depts[1]?.id }, { skip: !depts[1] });
  const d2 = useGetDeptCoursesQuery({ departmentId: depts[2]?.id }, { skip: !depts[2] });
  const d3 = useGetDeptCoursesQuery({ departmentId: depts[3]?.id }, { skip: !depts[3] });
  const d4 = useGetDeptCoursesQuery({ departmentId: depts[4]?.id }, { skip: !depts[4] });
  const d5 = useGetDeptCoursesQuery({ departmentId: depts[5]?.id }, { skip: !depts[5] });
  const results = [d0, d1, d2, d3, d4, d5].slice(0, depts.length);
  const counts = results.map((r) => r.data?.length ?? 0);
  const max = Math.max(1, ...counts);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Courses by Department</h2>
        <button
          onClick={() => navigate(ROUTES.ADMIN_COURSES)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Manage →
        </button>
      </div>
      <div className="space-y-2.5">
        {depts.map((dept, i) => {
          const { isLoading } = results[i];
          const count = counts[i];
          return (
            <div key={dept.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium truncate max-w-[140px]">{dept.name}</span>
                {isLoading
                  ? <div className="h-3 w-5 bg-gray-100 rounded animate-pulse" />
                  : <span className="text-gray-400 font-semibold shrink-0 ml-2">{count}</span>
                }
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: isLoading ? '0%' : `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CoursesByDept = () => {
  const { data: depts = [], isLoading } = useGetDepartmentsQuery();
  const visible = depts.slice(0, 6);
  if (isLoading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Courses by Department</h2>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
  if (visible.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Courses by Department</h2>
      <p className="text-xs text-gray-400 py-4 text-center">No departments found</p>
    </div>
  );
  return <CoursesByDeptInner depts={visible} />;
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: pending = [], isLoading: pendingLoading } = useGetPendingUsersQuery({});
  const [approveUser] = useApproveUserMutation();
  const [rejectUser] = useRejectUserMutation();

  const handleApprove = (id) =>
    approveUser(id).unwrap()
      .then(() => toast.success('User approved'))
      .catch(() => toast.error('Failed to approve'));

  const handleReject = (id) => {
    if (!window.confirm('Reject this user?')) return;
    rejectUser({ userId: id }).unwrap()
      .then(() => toast.success('User rejected'))
      .catch(() => toast.error('Failed to reject'));
  };

  const STATS = [
    { label: 'Students',         value: stats?.totalStudents,    icon: '🎓', bg: 'bg-indigo-50 text-indigo-500',  route: ROUTES.ADMIN_STUDENTS },
    { label: 'Faculty',          value: stats?.totalFaculty,     icon: '👨‍🏫', bg: 'bg-emerald-50 text-emerald-500', route: ROUTES.ADMIN_FACULTY },
    { label: 'Courses',          value: stats?.totalCourses,     icon: '📚', bg: 'bg-amber-50 text-amber-500',    route: ROUTES.ADMIN_COURSES },
    { label: 'Pending Approvals',value: stats?.pendingApprovals, icon: '⏳', bg: 'bg-rose-50 text-rose-500',      route: ROUTES.ADMIN_APPROVALS },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, Admin</p>
        </div>
        {pending.length > 0 && (
          <button
            onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
            className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            {pending.length} pending approval{pending.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon, bg, route }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            bg={bg}
            loading={statsLoading}
            onClick={() => navigate(route)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Approvals Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Pending Approvals</h2>
              {!pendingLoading && pending.length > 0 && (
                <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View all →
            </button>
          </div>

          {pendingLoading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2.5 w-48 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm text-gray-400">No pending approvals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70">
                    {['Name', 'Role', 'Dept', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pending.slice(0, 6).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{user.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{user.email}</p>
                      </td>
                      <td className="px-5 py-3"><RoleBadge roles={user.roles} /></td>
                      <td className="px-5 py-3 text-xs text-gray-500 max-w-[100px] truncate">{user.department || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(user.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction label="Manage Approvals"  icon="✅" onClick={() => navigate(ROUTES.ADMIN_APPROVALS)} />
              <QuickAction label="View Students"     icon="🎓" onClick={() => navigate(ROUTES.ADMIN_STUDENTS)} />
              <QuickAction label="View Faculty"      icon="👨‍🏫" onClick={() => navigate(ROUTES.ADMIN_FACULTY)} />
              <QuickAction label="Manage Courses"    icon="📚" onClick={() => navigate(ROUTES.ADMIN_COURSES)} />
              <QuickAction label="Attendance"        icon="📋" onClick={() => navigate(ROUTES.ADMIN_ATTENDANCE)} />
            </div>
          </div>

          <CoursesByDept />

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
