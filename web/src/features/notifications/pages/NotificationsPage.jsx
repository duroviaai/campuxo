import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '../../../shared/components/icons/IconLibrary';
import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteReadMutation,
} from '../state/notificationApi';

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

const TABS = ['All', 'Unread', 'Announcements'];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage]     = useState(0);
  const [items, setItems]   = useState([]);
  const [tab, setTab]       = useState('All');
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { page, size: 20 },
    {
      onSuccess: (res) => {
        setItems(prev => page === 0 ? res.content : [...prev, ...res.content]);
        setHasMore(!res.last);
      },
    }
  );

  // Merge pages manually since RTK Query doesn't accumulate by default
  const allItems = useMemo(() => {
    if (!data) return items;
    const merged = page === 0 ? data.content : [...items, ...data.content];
    // deduplicate by id
    const seen = new Set();
    return merged.filter(n => seen.has(n.id) ? false : seen.add(n.id));
  }, [data, page]);

  const filtered = useMemo(() => {
    if (tab === 'Unread')        return allItems.filter(n => !n.read);
    if (tab === 'Announcements') return allItems.filter(n => n.type === 'ANNOUNCEMENT');
    return allItems;
  }, [allItems, tab]);

  const [markRead]    = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const [deleteRead]  = useDeleteReadMutation();

  const handleLoadMore = () => {
    if (data && !data.last) setPage(p => p + 1);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const isPageLoading = isLoading && page === 0;

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a', letterSpacing: '-0.02em' }}
        >
          Notifications
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllRead()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            Mark all read
          </button>
          <button
            onClick={() => { deleteRead(); setPage(0); setItems([]); }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            Delete read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
            style={
              tab === t
                ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { color: '#64748b' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isPageLoading ? (
          [0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white" style={{ border: '1px solid #e2e8f0' }}>
              <div className="w-9 h-9 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded skeleton" />
                <div className="h-3 w-full rounded skeleton" />
                <div className="h-2.5 w-1/3 rounded skeleton" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#f1f5f9' }}
            >
              <Icon icon={faBell} size="lg" style={{ color: '#cbd5e1' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>No notifications yet</p>
          </div>
        ) : (
          filtered.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className="w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all"
              style={{
                background: notif.read ? '#ffffff' : '#faf5ff',
                border: `1px solid ${notif.read ? '#e2e8f0' : '#ede9fe'}`,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              {/* Type icon circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                style={{ background: TYPE_COLORS[notif.type] ?? '#7c3aed' }}
              >
                {notif.type?.[0] ?? '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{notif.title}</p>
                <p className="text-sm line-clamp-2 mt-0.5" style={{ color: '#64748b' }}>{notif.message}</p>
                <p className="text-[11px] mt-1.5" style={{ color: '#94a3b8' }}>{notif.timeAgo}</p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#7c3aed' }} />
              )}
            </button>
          ))
        )}
      </div>

      {/* Load more */}
      {!isPageLoading && filtered.length > 0 && data && !data.last && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="px-5 py-2 text-sm font-semibold rounded-xl transition-colors"
            style={{
              background: '#f8fafc',
              color: isFetching ? '#94a3b8' : '#7c3aed',
              border: '1px solid #e2e8f0',
            }}
          >
            {isFetching ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
