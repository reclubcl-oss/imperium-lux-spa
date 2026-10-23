import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:clinicaimperiumvina@gmail.com';

const BATCH = 25;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (faltan claves VAPID o Supabase en Vercel)' });
  }

  // ── Solo un admin autenticado puede enviar ────────────────────────────────
  const accessToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!accessToken) return res.status(401).json({ success: false, error: 'No autenticado' });

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) return res.status(401).json({ success: false, error: 'Sesión inválida' });

  const { data: caller } = await supabaseAdmin.from('staff').select('rol').eq('auth_user_id', userData.user.id).single();
  if (caller?.rol !== 'admin') return res.status(403).json({ success: false, error: 'No autorizado' });

  // ── Validar el mensaje ────────────────────────────────────────────────────
  const { title, body, url, onlyEndpoint } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || title.length > 65) {
    return res.status(400).json({ success: false, error: 'El título es obligatorio (máx. 65 caracteres)' });
  }
  if (typeof body !== 'string' || !body.trim() || body.length > 180) {
    return res.status(400).json({ success: false, error: 'El mensaje es obligatorio (máx. 180 caracteres)' });
  }
  const path = typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && url.length <= 200 ? url : '/';

  // ── Traer destinatarios (todos, o solo el dispositivo de prueba) ──────────
  let query = supabaseAdmin.from('push_subscriptions').select('id, endpoint, p256dh, auth').limit(5000);
  if (onlyEndpoint) query = query.eq('endpoint', onlyEndpoint);
  const { data: subs, error: subsError } = await query;
  if (subsError) return res.status(400).json({ success: false, error: subsError.message });
  if (!subs?.length) return res.status(200).json({ success: true, sent: 0, failed: 0, removed: 0 });

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  const payload = JSON.stringify({ title: title.trim(), body: body.trim(), url: path });

  let sent = 0;
  let failed = 0;
  const dead = [];

  for (let i = 0; i < subs.length; i += BATCH) {
    const results = await Promise.allSettled(
      subs.slice(i, i + BATCH).map(s =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 })
          .then(() => s)
      )
    );
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') { sent++; return; }
      failed++;
      // 404/410: el dispositivo ya no existe (desinstalaron la app o revocaron el permiso).
      if ([404, 410].includes(r.reason?.statusCode)) dead.push(subs[i + idx].id);
    });
  }

  if (dead.length) await supabaseAdmin.from('push_subscriptions').delete().in('id', dead);

  return res.status(200).json({ success: true, sent, failed, removed: dead.length });
}
