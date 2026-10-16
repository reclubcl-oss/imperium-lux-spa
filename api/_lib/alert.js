import webpush from 'web-push';
import { sendMailSafe, gmailConfigured, clinicInbox } from './mail.js';

const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:clinicaimperiumvina@gmail.com';

/**
 * Avisa a las administradoras: notificación push a los dispositivos marcados
 * como admin (botón "Alertas" del panel) y correo si Gmail está configurado.
 * Nunca lanza ni tarda más de ~4 s: una alerta que falla no debe romper la
 * reserva que la originó.
 *
 * Ojo: si Supabase está caído no se puede leer la lista de dispositivos, así
 * que en ese caso solo llega el correo.
 */
const recentAlerts = new Map();

export async function alertAdmins(supabaseAdmin, { title, body, url = '/admin', tag, dedupeMs = 0 }) {
  // Para errores repetidos (ej. la base caída y 20 personas intentando reservar):
  // un solo aviso cada `dedupeMs`, no una lluvia de notificaciones.
  if (dedupeMs) {
    const key = `${title}|${body}`;
    if (Date.now() - (recentAlerts.get(key) || 0) < dedupeMs) return { push: 0, email: false, deduped: true };
    recentAlerts.set(key, Date.now());
  }
  const work = (async () => {
    const out = { push: 0, email: false };

    if (VAPID_PUBLIC && VAPID_PRIVATE) {
      try {
        const { data: subs } = await supabaseAdmin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('es_admin', true);
        if (subs?.length) {
          webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
          const payload = JSON.stringify({ title, body, url, tag });
          const dead = [];
          const results = await Promise.allSettled(subs.map(s =>
            webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 6 })));
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') out.push++;
            else if ([404, 410].includes(r.reason?.statusCode)) dead.push(subs[i].id);
          });
          if (dead.length) await supabaseAdmin.from('push_subscriptions').delete().in('id', dead);
        }
      } catch (err) {
        console.warn('Alerta push falló:', err.message);
      }
    }

    if (gmailConfigured()) {
      out.email = await sendMailSafe({ to: clinicInbox(), subject: `[Imperium] ${title}`, text: `${title}\n\n${body}` });
    }
    return out;
  })();

  return Promise.race([work, new Promise(resolve => setTimeout(() => resolve({ push: 0, email: false, timeout: true }), 4000))]);
}
