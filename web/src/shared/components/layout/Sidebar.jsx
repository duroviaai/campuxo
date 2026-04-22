import useAuth from '../../../features/auth/hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import ROLES from '../../constants/roles';
import SidebarItem from './SidebarItem';
import { useGetStatsQuery } from '../../../features/admin/state/adminApi';

const ICONS = {
  dashboard:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  students:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
  faculty:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  courses:    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  classes:    'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9',
  attendance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  approvals:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

const FACULTY_ITEMS = [
  { to: ROUTES.FACULTY_DASHBOARD,  label: 'Dashboard',  icon: ICONS.dashboard, end: true },
  { to: ROUTES.FACULTY_COURSES,    label: 'My Courses', icon: ICONS.courses },
  { to: ROUTES.FACULTY_ATTENDANCE, label: 'Attendance', icon: ICONS.attendance },
  { to: ROUTES.FACULTY_PROFILE,    label: 'Profile',    icon: ICONS.students },
];

const STUDENT_ITEMS = [
  { to: ROUTES.STUDENT_DASHBOARD,  label: 'Dashboard',  icon: ICONS.dashboard, end: true },
  { to: ROUTES.STUDENT_COURSES,    label: 'My Courses', icon: ICONS.courses },
  { to: ROUTES.STUDENT_ATTENDANCE, label: 'Attendance', icon: ICONS.attendance },
  { to: ROUTES.STUDENT_PROFILE,    label: 'Profile',    icon: ICONS.students },
];

const Sidebar = () => {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes(ROLES.ADMIN);

  const { data: stats } = useGetStatsQuery(undefined, { skip: !isAdmin });
  const pendingCount = stats?.pendingApprovals ?? 0;

  const ADMIN_ITEMS = [
    { to: ROUTES.ADMIN_DASHBOARD,  label: 'Dashboard',  icon: ICONS.dashboard,  end: true },
    { to: ROUTES.ADMIN_STUDENTS,   label: 'Students',   icon: ICONS.students },
    { to: ROUTES.ADMIN_FACULTY,    label: 'Faculty',    icon: ICONS.faculty },
    { to: ROUTES.ADMIN_COURSES,    label: 'Departments', icon: ICONS.courses },
    { to: ROUTES.ADMIN_ATTENDANCE, label: 'Attendance', icon: ICONS.attendance },
    { to: ROUTES.ADMIN_APPROVALS,  label: 'Approvals',  icon: ICONS.approvals, badge: pendingCount },
  ];

  const items = isAdmin
    ? ADMIN_ITEMS
    : roles.includes(ROLES.FACULTY)
    ? FACULTY_ITEMS
    : STUDENT_ITEMS;

  const subtitle = isAdmin
    ? 'Admin Panel'
    : roles.includes(ROLES.FACULTY)
    ? 'Faculty Panel'
    : 'Student Panel';

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-black tracking-tight">cx</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight">campuxo</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {items.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
