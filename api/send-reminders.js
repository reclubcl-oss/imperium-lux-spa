import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import nodemailer from 'nodemailer';
import { CLINIC, esc } from './_lib/clinic.js';
import { alertAdmins } from './_lib/alert.js';
import { manageUrlFor } from './_lib/mail.js';

// Recordatorios de cita. Lo ejecuta Vercel Cron una vez al día (vercel.json,
// 13:00 UTC = 9–10 AM en Chile) y avisa a quienes tienen cita MAÑANA, por
// correo y por notificación push (si activaron el aviso desde su reserva).
//
// GET /api/send-reminders?dry=1  →  muestra a cuántas citas avisaría, sin enviar nada.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:clinicaimperiumvina@gmail.com';


// "Mañana" según la hora de Chile (el servidor corre en UTC).
function tomorrowInSantiago() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}


function emailContent(r) {
  const manage = manageUrlFor(r.cancel_token);
  const subject = `Recordatorio: tu cita es mañana a las ${r.hora} · ${CLINIC.nombre}`;
  const text = [
    `Hola ${r.nombre},`,
    '',
    `Te recordamos tu cita de mañana en ${CLINIC.nombre}:`,
    `${r.fecha} a las ${r.hora} — ${r.servicio}`,
    `Dirección: ${CLINIC.direccion}`,
    '',
    manage ? `¿Necesitas cambiarla o cancelarla? Hazlo aquí: ${manage}` : `¿Necesitas cambiarla? Escríbenos por WhatsApp al ${CLINIC.telefono}: ${CLINIC.whatsapp}`,
    '',
    'Te esperamos.',
  ].join('\n');
  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;background:#FAF9F5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#FFFEFB;border:1px solid #E7E2D3;border-radius:14px;padding:28px">
    <p style="font:700 11px -apple-system,Segoe UI,Arial,sans-serif;letter-spacing:.2em;color:#B5924D;margin:0 0 10px">RECORDATORIO DE CITA</p>
    <h1 style="font-weight:400;font-size:24px;color:#172616;margin:0 0 16px">Hola ${esc(r.nombre)}, te esperamos mañana</h1>
    <div style="background:#F3F0E6;border-radius:10px;padding:14px 16px;margin-bottom:18px;font:15px -apple-system,Segoe UI,Arial,sans-serif;color:#172616">
      <div style="font-weight:700">${esc(r.fecha)}</div>
      <div style="font-size:20px;font-family:Georgia,serif;margin:2px 0 6px">${esc(r.hora)} hrs</div>
      <div>${esc(r.servicio)}</div>
    </div>
    <p style="font:14px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#5b6357;margin:0 0 6px">📍 ${esc(CLINIC.direccion)}</p>
    <p style="font:14px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#5b6357;margin:0 0 18px">¿Necesitas cambiar tu hora? Escríbenos por WhatsApp.</p>
    <a href="${manage || CLINIC.whatsapp}" style="display:inline-block;background:#263A22;color:#FFFEFB;text-decoration:none;padding:12px 22px;border-radius:8px;font:700 13px -apple-system,Segoe UI,Arial,sans-serif">${manage ? 'Cambiar o cancelar mi cita' : 'Escribir por WhatsApp'}</a>
  </div>
  <p style="text-align:center;font:12px -apple-system,Segoe UI,Arial,sans-serif;color:#8a8f84;margin:14px 0 0">${esc(CLINIC.nombre)}</p>
</div>`;
  return { subject, text, html };
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !CRON_SECRET) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (faltan variables en Vercel)' });
  }
  // Vercel Cron manda "Authorization: Bearer <CRON_SECRET>" automáticamente.
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  const dry = req.query?.dry === '1';
  const date = tomorrowInSantiago();
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const load = (cols) => supabaseAdmin.from('reservas').select(cols).eq('fecha_iso', date).is('recordatorio_enviado_at', null);
  let { data: reservas, error } = await load('id, nombre, email, servicio, fecha, hora, cancel_token');
  // Si aún no se corrió supabase-add-gestion-citas.sql, envía igual (sin el enlace de cambio).
  if (error?.code === '42703') ({ data: reservas, error } = await load('id, nombre, email, servicio, fecha, hora'));
  if (error) return res.status(400).json({ success: false, error: error.message });

  const emailReady = !!(GMAIL_USER && GMAIL_APP_PASSWORD);
  const pushReady = !!(VAPID_PUBLIC && VAPID_PRIVATE);
  const summary = { success: true, date, dry, pending: reservas.length, emailEnabled: emailReady, pushEnabled: pushReady, emailed: 0, pushed: 0, noChannel: 0, errors: 0 };
  if (dry || !reservas.length) return res.status(200).json(summary);

  const transporter = emailReady
    ? nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } })
    : null;
  if (pushReady) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  for (const r of reservas) {
    let emailed = false;
    let pushed = 0;

    if (transporter && r.email) {
      try {
        const { subject, text, html } = emailContent(r);
        await transporter.sendMail({ from: `"${CLINIC.nombre}" <${GMAIL_USER}>`, to: r.email, subject, text, html });
        emailed = true;
      } catch (err) {
        summary.errors++;
        console.warn('Recordatorio por correo falló:', err.message);
      }
    }

    if (pushReady && r.email) {
      const { data: subs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('email', r.email.trim().toLowerCase());
      const payload = JSON.stringify({
        title: 'Tu cita es mañana ✨',
        body: `${r.servicio} a las ${r.hora}. Te esperamos en ${CLINIC.direccion}.`,
        url: '/',
        tag: `cita-${r.id}`,
      });
      for (const s of subs || []) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 12 });
          pushed++;
        } catch (err) {
          if ([404, 410].includes(err.statusCode)) await supabaseAdmin.from('push_subscriptions').delete().eq('id', s.id);
          else summary.errors++;
        }
      }
    }

    if (emailed || pushed) {
      await supabaseAdmin.from('reservas').update({ recordatorio_enviado_at: new Date().toISOString() }).eq('id', r.id);
      if (emailed) summary.emailed++;
      if (pushed) summary.pushed++;
    } else {
      summary.noChannel++;
    }
  }

  // Si algo falló al enviar, avisa a las administradoras (correo y/o push).
  if (summary.errors || summary.noChannel) {
    await alertAdmins(supabaseAdmin, {
      title: 'Recordatorios con problemas',
      body: `${summary.emailed + summary.pushed} enviados, ${summary.errors} errores, ${summary.noChannel} sin canal de aviso (${date}).`,
      tag: 'recordatorios',
    });
  }

  return res.status(200).json(summary);
}
