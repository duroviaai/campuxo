import { useEffect, useRef } from 'react';
import { getToken } from '../../../shared/utils/tokenUtils';

const API = import.meta.env.VITE_API_BASE_URL ?? '';

/** Convert a base64url VAPID public key to a Uint8Array for PushManager */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const useWebPush = (enabled = true) => {
  const subscribed = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (subscribed.current) return;

    const setup = async () => {
      try {
        // 1. Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        // 2. Check existing subscription
        let sub = await reg.pushManager.getSubscription();
        if (sub) { subscribed.current = true; return; }

        // 3. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 4. Fetch VAPID public key from backend
        const res = await fetch(`${API}/api/v1/push/public-key`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const { publicKey } = await res.json();

        // 5. Subscribe
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // 6. Send subscription to backend
        const { endpoint, keys } = sub.toJSON();
        await fetch(`${API}/api/v1/push/subscribe`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
        });

        subscribed.current = true;
      } catch (err) {
        console.warn('[WebPush] setup failed:', err);
      }
    };

    setup();
  }, [enabled]);
};

export default useWebPush;
