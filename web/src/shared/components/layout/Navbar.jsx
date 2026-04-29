import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../features/auth/hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import { Icon, UserIcons, ActionIcons } from '../icons/IconLibrary';
import { faBell, faCheck } from '@fortawesome/free-solid-svg-icons';
import BrandLogo from '../ui/BrandLogo';
import {
  useGetUnreadCountQuery,
  useGetUnreadNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from '../../../features/notifications/state/notificationApi';
import useBrowserNotifications from '../../../features/notifications/hooks/useBrowserNotifications';

const TYPE_COLORS = {
  NEW_REGISTRATION:  '#7c3aed',
  ACCOUNT_APPROVED:  '#059669',
  ACCOUNT_REJECTED:  '#dc2626',
  ACCOUNT_REVOKED:   '#dc2626',
  ATTENDANCE_MARKED: '#2563eb',
  ATTENDANCE_LOW:    '#d97706',
  IA_MARKS_UPDATED:  '#7c3aed',
  COURSE_ASSIGNED:   '#059669',
  COURSE_REMOVED:    '#dc2626',
  HOD_ASSIGNED:      '#7c3aed',
  REGISTRATION_OPEN: '#2563eb',
  ANNOUNCEMENT:      '#0f172a',
};

const ROLE_META = {
  ROLE_ADMIN:   { label: 'Admin',   bg: '#dbeafe', color: '#1d4ed8' },
  ROLE_FACULTY: { label: 'Faculty', bg: '#ccfbf1', color: '#0d9488' },
  ROLE_HOD:     { label: 'HOD',     bg: '#dbeafe', color: '#1d4ed8' },
  ROLE_STUDENT: { label: 'Student', bg: '#ccfbf1', color: '#0d9488' },
};

const PAGE_TITLES = {
  admin: 'Dashboard', student: 'Dashboard', faculty: 'Dashboard', hod: 'Dashboard',
  dashboard: 'Dashboard', students: 'Students', courses: 'Programs',
  attendance: 'Attendance', profile: 'Profile', approvals: 'Approvals',
  overview: 'Overview', ia: 'Internal Assessment', approved: 'Approved Users',
  faculty: 'Faculty', 'my-courses': 'My Programs', 'my-attendance': 'My Attendance',
};

const getPageTitle = (pathname) => {
  const segment = pathname.split('/').filter(Boolean).pop() ?? '';
  return PAGE_TITLES[segment] ?? 'Dashboard';
};

const LogoutModal = ({ onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
    style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}
  >
    <div
      className="bg-white rounded-2xl p-7 w-[22rem] animate-scale-in"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
    >
      <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Icon icon={ActionIcons.delete} size="lg" className="text-red-500" />
      </div>
      <h3 className="text-base font-bold text-slate-900 text-center">Sign out?</h3>
      <p className="text-sm text-slate-500 text-center mt-1 mb-6">You'll need to sign in again to access your account.</p>
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showModal,    setShowModal]    = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs,   setShowNotifs]   = useState(false);

  const { data: countData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data: unread = [], isLoading: notifsLoading } =
    useGetUnreadNotificationsQuery(undefined, { skip: !showNotifs });
  // Always fetch latest unread for browser notification delta detection
  const { data: unreadAll = [] } = useGetUnreadNotificationsQuery(undefined, { pollingInterval: 30000 });
  const [markRead]    = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const unreadCount = countData?.count ?? 0;

  useBrowserNotifications(unreadCount, unreadAll[0] ?? null);

  const handleConfirm = () => { logout(); navigate(ROUTES.LOGIN, { replace: true }); };

  const userInitial = user?.username?.[0]?.toUpperCase() ?? '?';
  const primaryRole = user?.roles?.[0] ?? user?.role ?? 'ROLE_STUDENT';
  const roleMeta    = ROLE_META[primaryRole] ?? ROLE_META.ROLE_STUDENT;
  const pageTitle   = getPageTitle(location.pathname);

  return (
    <>
      {showModal && <LogoutModal onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />}

      <header
        className="h-16 px-6 flex items-center justify-between sticky top-0 z-40 shrink-0"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Page title */}
        <h1
          className="text-[15px] font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em', color: '#0f172a' }}
        >
          {pageTitle}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(v => !v)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Icon icon={faBell} size="sm" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#ef4444' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl z-40 animate-scale-in"
                  style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead()}
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#7c3aed' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#6d28d9'}
                        onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div>
                    {notifsLoading ? (
                      [0, 1, 2].map(i => (
                        <div key={i} className="flex gap-3 px-4 py-3">
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 skeleton" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-3/4 rounded skeleton" />
                            <div className="h-2.5 w-full rounded skeleton" />
                            <div className="h-2 w-1/3 rounded skeleton" />
                          </div>
                        </div>
                      ))
                    ) : unread.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: '#f0fdf4' }}
                        >
                          <Icon icon={faCheck} size="sm" style={{ color: '#059669' }} />
                        </div>
                        <p className="text-xs font-medium" style={{ color: '#64748b' }}>You're all caught up!</p>
                      </div>
                    ) : (
                      unread.map(notif => (
                        <button
                          key={notif.id}
                          onClick={async () => {
                            await markRead(notif.id);
                            if (notif.link) navigate(notif.link);
                            setShowNotifs(false);
                          }}
                          className="w-full flex gap-3 px-4 py-3 text-left transition-colors"
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                          style={{ borderBottom: '1px solid #f8fafc' }}
                        >
                          <span
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: notif.read ? 'transparent' : (TYPE_COLORS[notif.type] ?? '#7c3aed') }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>{notif.title}</p>
                            <p className="text-xs line-clamp-2 mt-0.5" style={{ color: '#64748b' }}>{notif.message}</p>
                            <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{notif.timeAgo}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => { navigate('/notifications'); setShowNotifs(false); }}
                      className="w-full py-3 text-xs font-semibold transition-colors"
                      style={{ color: '#7c3aed' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-5 mx-1" style={{ background: '#e2e8f0' }} />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: '#fff' }}
              >
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: '#0f172a' }}>{user?.username}</p>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: roleMeta.bg, color: roleMeta.color }}
                >
                  {roleMeta.label}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl z-40 py-1 animate-scale-in overflow-hidden"
                  style={{ border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <p className="text-xs font-semibold text-slate-800">{user?.username}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{roleMeta.label}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); setShowModal(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <Icon icon={UserIcons.logout} size="sm" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
