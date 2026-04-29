import { useEffect, useRef } from 'react';

const ICON = '/campuxo_logo.png';

/**
 * Requests browser notification permission once on mount.
 * Fires a native OS notification whenever `unreadCount` increases
 * and the latest unread notification is provided.
 *
 * @param {number}      unreadCount  - current unread count from polling
 * @param {object|null} latest       - most recent unread notification object
 */
const useBrowserNotifications = (unreadCount, latest) => {
  const prevCount = useRef(null);
  const permission = useRef(Notification.permission);

  // Request permission once on mount
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        permission.current = p;
      });
    }
  }, []);

  // Fire native notification when count increases
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (permission.current !== 'granted') return;
    if (prevCount.current === null) {
      // First load — just record baseline, don't fire
      prevCount.current = unreadCount;
      return;
    }
    if (unreadCount > prevCount.current && latest) {
      const n = new Notification(latest.title ?? 'New notification', {
        body: latest.message,
        icon: ICON,
        tag:  String(latest.id),   // prevents duplicate popups for same notif
        renotify: false,
      });
      n.onclick = () => {
        window.focus();
        if (latest.link) window.location.href = latest.link;
        n.close();
      };
    }
    prevCount.current = unreadCount;
  }, [unreadCount, latest]);
};

export default useBrowserNotifications;
