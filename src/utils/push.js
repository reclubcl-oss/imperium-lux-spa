// App instalable (PWA) + notificaciones push.
//
// En iPhone (iOS 16.4+) Apple SOLO permite notificaciones push cuando el
// sitio está agregado a la pantalla de inicio, y el permiso debe pedirse
// desde un toque del usuario (un botón) — nunca automáticamente al cargar.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

let installEvent = null;
const installListeners = new Set();

/** Se llama una vez al iniciar la app: registra el service worker y captura el aviso de instalación. */
export function initPWA() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW no se pudo registrar:', err));
    });
  }

  // Chrome/Android/escritorio: permite instalar con un botón propio.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e;
    installListeners.forEach(fn => fn(true));
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    installListeners.forEach(fn => fn(false));
  });
}

export function onInstallAvailable(fn) {
  installListeners.add(fn);
  fn(!!installEvent);
  return () => installListeners.delete(fn);
}

export async function promptInstall() {
  if (!installEvent) return { success: false };
  installEvent.prompt();
  const choice = await installEvent.userChoice;
  installEvent = null;
  installListeners.forEach(fn => fn(false));
  return { success: choice.outcome === 'accepted' };
}

/** Detecta la plataforma a partir del user agent (puro, para poder probarlo). */
export function detectPlatform(ua = '', maxTouchPoints = 0) {
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  // Navegadores internos de Instagram, Facebook, TikTok, etc. — no permiten "Agregar a inicio".
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|TikTok|Snapchat|Line\/|MicroMessenger/i.test(ua);
  return { ios, inApp };
}

export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function getCurrentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Pide permiso, se suscribe y guarda la suscripción en el servidor. Debe llamarse desde un toque del usuario. */
export async function enablePush({ email } = {}) {
  if (!pushSupported()) return { success: false, error: 'unsupported' };
  if (!VAPID_PUBLIC_KEY) return { success: false, error: 'not_configured' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { success: false, error: permission };

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = (await reg.pushManager.getSubscription())
      || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });

    const res = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON(), email }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return { success: false, error: json.error || 'server' };
    return { success: true };
  } catch (err) {
    console.error('enablePush:', err);
    return { success: false, error: 'server' };
  }
}

export async function disablePush() {
  const subscription = await getCurrentSubscription();
  if (!subscription) return { success: true };
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe().catch(() => {});
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unsubscribe', endpoint }),
  }).catch(() => {});
  return { success: true };
}

/** SOLO PARA PRUEBAS: se suscribe sin guardar nada en el servidor y devuelve la suscripción. */
export async function subscribeWithoutSaving() {
  if (!pushSupported()) return { success: false, error: 'unsupported' };
  if (!VAPID_PUBLIC_KEY) return { success: false, error: 'not_configured' };
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { success: false, error: permission };
  const reg = await navigator.serviceWorker.ready;
  const subscription = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
  return { success: true, subscription: subscription.toJSON() };
}
