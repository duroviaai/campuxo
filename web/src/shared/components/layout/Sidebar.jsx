import useAuth from '../../../features/auth/hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import ROLES from '../../constants/roles';
import SidebarItem from './SidebarItem';
import { useGetStatsQuery } from '../../../features/admin/state/adminApi';
import { Icon, NavIcons, AcademicIcons, ActionIcons, StatusIcons, TimeIcons } from '../icons/IconLibrary';
import { useGetUnreadCountQuery } from '../../../features/notifications/state/notificationApi';
import { faChevronLeft, faChevronRight, faBullhorn, faBell } from '@fortawesome/free-solid-svg-icons';
import BrandLogo from '../ui/BrandLogo';

const HOD_ITEMS = [
  { to: ROUTES.HOD_DASHBOARD,  label: 'Dashboard',    icon: NavIcons.dashboard,    end: true },
  { to: ROUTES.HOD_FACULTY,    label: 'Faculty',       icon: NavIcons.faculty },
  { to: ROUTES.HOD_STUDENTS,   label: 'Students',      icon: NavIcons.students },
  { to: ROUTES.HOD_COURSES,    label: 'Programs',      icon: AcademicIcons.book },
  { to: ROUTES.HOD_MY_COURSES, label: 'My Programs',   icon: AcademicIcons.marks },
  { to: ROUTES.HOD_TIMETABLE,  label: 'Timetable',     icon: TimeIcons.calendar },
  { to: ROUTES.HOD_PROFILE,    label: 'My Profile',    icon: NavIcons.users },
  { to: ROUTES.NOTIFICATIONS,  label: 'Notifications', icon: faBell },
];

const FACULTY_ITEMS = [
  { to: ROUTES.FACULTY_DASHBOARD,  label: 'Dashboard',  icon: NavIcons.dashboard, end: true },
  { to: ROUTES.FACULTY_COURSES,    label: 'My Courses', icon: AcademicIcons.book },
  { to: ROUTES.FACULTY_TIMETABLE,  label: 'Timetable',  icon: NavIcons.schedule },
  { to: ROUTES.FACULTY_ATTENDANCE, label: 'Attendance', icon: NavIcons.attendance },
  { to: ROUTES.FACULTY_IA,         label: 'IA Marks',   icon: AcademicIcons.marks },
  { to: ROUTES.FACULTY_PROFILE,    label: 'Profile',    icon: NavIcons.users },
  { to: ROUTES.NOTIFICATIONS,      label: 'Notifications', icon: faBell },
];

const STUDENT_ITEMS = [
  { to: ROUTES.STUDENT_DASHBOARD,  label: 'Dashboard',  icon: NavIcons.dashboard, end: true },
  { to: ROUTES.STUDENT_COURSES,    label: 'My Courses', icon: AcademicIcons.book },
  { to: ROUTES.STUDENT_TIMETABLE,  label: 'Timetable',  icon: NavIcons.schedule },
  { to: ROUTES.STUDENT_ATTENDANCE, label: 'Attendance', icon: NavIcons.attendance },
  { to: ROUTES.STUDENT_IA,         label: 'IA Marks',   icon: AcademicIcons.marks },
  { to: ROUTES.STUDENT_PROFILE,    label: 'Profile',    icon: NavIcons.users },
  { to: ROUTES.NOTIFICATIONS,      label: 'Notifications', icon: faBell },
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
  const { data: countData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unreadCount = countData?.count ?? 0;

  const ADMIN_ITEMS = [
    { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard',          icon: NavIcons.dashboard,  end: true },
    { to: ROUTES.ADMIN_STUDENTS,  label: 'Students',           icon: NavIcons.students },
    { to: ROUTES.ADMIN_FACULTY,   label: 'Faculty',            icon: NavIcons.faculty },
    { to: ROUTES.ADMIN_COURSES,   label: 'Programs',           icon: AcademicIcons.book },
    { to: ROUTES.ADMIN_OVERVIEW,  label: 'Overview',           icon: ActionIcons.filter },
    { to: ROUTES.ADMIN_ATTENDANCE,label: 'Attendance',         icon: NavIcons.attendance },
    { to: ROUTES.ADMIN_IA,        label: 'Internal Assessment',icon: AcademicIcons.marks },
    { to: ROUTES.ADMIN_APPROVALS, label: 'Approvals',          icon: StatusIcons.check, badge: pendingCount },
    { to: ROUTES.ADMIN_REGISTRATION_WINDOWS, label: 'Reg. Windows', icon: TimeIcons.calendar },
    { to: ROUTES.ADMIN_TIMETABLE,             label: 'Timetable',    icon: NavIcons.schedule },
    { to: ROUTES.ADMIN_ANNOUNCEMENTS,         label: 'Announcements', icon: faBullhorn },
    { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: faBell, badge: unreadCount },
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
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0 mx-auto"
            style={{ color: 'rgba(100,116,139,1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(100,116,139,1)'; }}
          >
            <Icon icon={faChevronRight} size="xs" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <img src="/campuxo_logo.png" alt="Campuxo" width={48} height={48} style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", fontSize: '18px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffffff', lineHeight: 1, userSelect: 'none' }}>CAMPUXO</span>
            </div>
            <button
              onClick={onToggle}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0 ml-auto"
              style={{ color: 'rgba(100,116,139,1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(100,116,139,1)'; }}
            >
              <Icon icon={faChevronLeft} size="xs" />
            </button>
          </>
        )}
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
