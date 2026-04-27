import useAuth from '../../../features/auth/hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import ROLES from '../../constants/roles';
import SidebarItem from './SidebarItem';
import { useGetStatsQuery } from '../../../features/admin/state/adminApi';
import { Icon, NavIcons, AcademicIcons, ActionIcons, StatusIcons } from '../icons/IconLibrary';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import BrandLogo from '../ui/BrandLogo';

const HOD_ITEMS = [
  { to: ROUTES.HOD_DASHBOARD, label: 'Dashboard', icon: NavIcons.dashboard, end: true },
  { to: ROUTES.HOD_FACULTY,   label: 'Faculty',   icon: NavIcons.faculty },
  { to: ROUTES.HOD_STUDENTS,  label: 'Students',  icon: NavIcons.students },
  { to: ROUTES.HOD_COURSES,   label: 'Courses',   icon: AcademicIcons.book },
];

const FACULTY_ITEMS = [
  { to: ROUTES.FACULTY_DASHBOARD,  label: 'Dashboard',  icon: NavIcons.dashboard, end: true },
  { to: ROUTES.FACULTY_COURSES,    label: 'My Courses', icon: AcademicIcons.book },
  { to: ROUTES.FACULTY_ATTENDANCE, label: 'Attendance', icon: NavIcons.attendance },
  { to: ROUTES.FACULTY_PROFILE,    label: 'Profile',    icon: NavIcons.users },
];

const STUDENT_ITEMS = [
  { to: ROUTES.STUDENT_DASHBOARD,  label: 'Dashboard',  icon: NavIcons.dashboard, end: true },
  { to: ROUTES.STUDENT_COURSES,    label: 'My Courses', icon: AcademicIcons.book },
  { to: ROUTES.STUDENT_ATTENDANCE, label: 'Attendance', icon: NavIcons.attendance },
  { to: ROUTES.STUDENT_PROFILE,    label: 'Profile',    icon: NavIcons.users },
];

const ROLE_BADGE = {
  admin:   { label: 'Admin',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  hod:     { label: 'HOD',     color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  faculty: { label: 'Faculty', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  student: { label: 'Student', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const roles     = user?.roles ?? [];
  const isAdmin   = roles.includes(ROLES.ADMIN);
  const isHod     = roles.includes('ROLE_HOD');
  const isFaculty = roles.includes(ROLES.FACULTY);

  const { data: stats } = useGetStatsQuery(undefined, { skip: !isAdmin });
  const pendingCount = stats?.pendingApprovals ?? 0;

  const ADMIN_ITEMS = [
    { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard',          icon: NavIcons.dashboard,  end: true },
    { to: ROUTES.ADMIN_STUDENTS,  label: 'Students',           icon: NavIcons.students },
    { to: ROUTES.ADMIN_FACULTY,   label: 'Faculty',            icon: NavIcons.faculty },
    { to: ROUTES.ADMIN_COURSES,   label: 'Courses',            icon: AcademicIcons.book },
    { to: ROUTES.ADMIN_OVERVIEW,  label: 'Overview',           icon: ActionIcons.filter },
    { to: ROUTES.ADMIN_ATTENDANCE,label: 'Attendance',         icon: NavIcons.attendance },
    { to: ROUTES.ADMIN_IA,        label: 'Internal Assessment',icon: AcademicIcons.marks },
    { to: ROUTES.ADMIN_APPROVALS, label: 'Approvals',          icon: StatusIcons.check, badge: pendingCount },
  ];

  const items   = isAdmin ? ADMIN_ITEMS : isHod ? HOD_ITEMS : isFaculty ? FACULTY_ITEMS : STUDENT_ITEMS;
  const roleKey = isAdmin ? 'admin' : isHod ? 'hod' : isFaculty ? 'faculty' : 'student';
  const badge   = ROLE_BADGE[roleKey];

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? '68px' : '236px',
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center h-16 shrink-0 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="shrink-0">
          {collapsed
            ? <BrandLogo size="sm" dark iconOnly />
            : <BrandLogo size="sm" dark />
          }
        </div>

        {!collapsed && (
          <div className="ml-auto">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md inline-block"
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0"
          style={{ color: 'rgba(100,116,139,1)', marginLeft: collapsed ? 'auto' : undefined }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(100,116,139,1)'; }}
        >
          <Icon icon={collapsed ? faChevronRight : faChevronLeft} size="xs" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: 'rgba(71,85,105,1)' }}>
            Navigation
          </p>
        )}
        {items.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User footer */}
      <div
        className="p-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {collapsed ? (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold mx-auto"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: '#fff' }}
          >
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: '#fff' }}
            >
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>{user?.username}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(100,116,139,1)' }}>{badge.label}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
