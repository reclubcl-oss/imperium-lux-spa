import { createClient } from '@supabase/supabase-js';
import { CLINIC } from './_lib/clinic.js';
import { alertAdmins } from './_lib/alert.js';
import { brandedEmail, sendMailSafe } from './_lib/mail.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Con cuántas horas de anticipación la clienta puede cambiar o cancelar sola.
// Después de eso debe escribir por WhatsApp (así la clínica no queda con
// horas vacías a último minuto). Cambia este número si quieres otra política.
const MIN_HOURS = 24;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Límite por IP en memoria (mismo criterio que las otras rutas públicas).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 40;
}

/** Fecha+hora dichas en horario de Chile -> instante real (el servidor corre en UTC). */
function santiagoToDate(iso, hhmm) {
  const [y, m, d] = iso.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(guess)).map(p => [p.type, p.value]));
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (asLocal - guess));
}

const hoursUntil = (iso, hhmm) => (santiagoToDate(iso, hhmm).getTime() - Date.now()) / 3600000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return res.status(500).json({ success: false, error: 'Servidor no configurado' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ success: false, error: 'Demasiados intentos. Espera unos minutos.' });

  const { action, token, fechaIso, hora, fecha, staffId } = req.body || {};
  if (typeof token !== 'string' || !UUID_RE.test(token)) {
    return res.status(404).json({ success: false, error: 'Este enlace no es válido.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: row, error } = await supabaseAdmin.from('reservas')
    .select('id, nombre, email, servicio, fecha, fecha_iso, hora, staff_id')
    .eq('cancel_token', token).maybeSingle();

  if (error?.code === '42703') return res.status(501).json({ success: false, error: 'Esta función aún no está activa.' });
  if (error) return res.status(500).json({ success: false, error: 'No pudimos cargar tu cita. Intenta de nuevo.' });
  if (!row || !row.fecha_iso) return res.status(404).json({ success: false, error: 'No encontramos esta cita. Puede que ya haya sido cancelada.' });

  const left = hoursUntil(row.fecha_iso, row.hora);
  const canModify = left >= MIN_HOURS;

  if (action === 'get') {
    return res.status(200).json({
      success: true,
      appointment: { nombre: String(row.nombre).split(' ')[0], servicio: row.servicio, fecha: row.fecha, hora: row.hora, fechaIso: row.fecha_iso, canModify, past: left < 0, minHours: MIN_HOURS },
    });
  }

  if (!canModify) {
    return res.status(403).json({ success: false, error: `Solo puedes hacer cambios hasta ${MIN_HOURS} horas antes de tu cita. Escríbenos por WhatsApp al ${CLINIC.telefono}.` });
  }

  if (action === 'cancel') {
    const { error: delError } = await supabaseAdmin.from('reservas').delete().eq('id', row.id);
    if (delError) return res.status(500).json({ success: false, error: 'No pudimos cancelar tu cita. Intenta de nuevo.' });

    const { html, text } = brandedEmail({
      eyebrow: 'CITA CANCELADA', title: 'Tu cita fue cancelada',
      rows: [['Tratamiento', row.servicio], ['Fecha', row.fecha], ['Hora', `${row.hora} hrs`]],
      note: 'Cuando quieras, puedes agendar una nueva hora en nuestro sitio.',
    });
    await Promise.allSettled([
      sendMailSafe({ to: row.email, subject: `Cita cancelada · ${CLINIC.nombre}`, html, text }),
      alertAdmins(supabaseAdmin, { title: 'Cita cancelada', body: `${row.nombre} canceló: ${row.servicio}, ${row.fecha} ${row.hora}`, tag: `cancela-${row.id}` }),
    ]);
    return res.status(200).json({ success: true });
  }

  if (action === 'reschedule') {
    if (typeof fechaIso !== 'string' || !ISO_RE.test(fechaIso) || typeof hora !== 'string' || !HHMM_RE.test(hora) || typeof fecha !== 'string' || !fecha || fecha.length > 80) {
      return res.status(400).json({ success: false, error: 'Elige una fecha y hora válidas.' });
    }
    if (hoursUntil(fechaIso, hora) < 1) {
      return res.status(400).json({ success: false, error: 'Elige un horario futuro.' });
    }
    if (staffId != null && (typeof staffId !== 'string' || !UUID_RE.test(staffId))) {
      return res.status(400).json({ success: false, error: 'Profesional inválido.' });
    }

    const { error: updError } = await supabaseAdmin.from('reservas').update({
      fecha, fecha_iso: fechaIso, hora, ...(staffId ? { staff_id: staffId } : {}), recordatorio_enviado_at: null,
    }).eq('id', row.id);
    if (updError) {
      if (updError.code === '23505') return res.status(409).json({ success: false, error: 'Ese horario se acaba de ocupar. Por favor elige otro.' });
      await alertAdmins(supabaseAdmin, { title: 'Error al cambiar una cita', body: String(updError.message).slice(0, 180), tag: 'error-cita', dedupeMs: 5 * 60 * 1000 });
      return res.status(500).json({ success: false, error: 'No pudimos cambiar tu cita. Intenta de nuevo.' });
    }

    const { html, text } = brandedEmail({
      eyebrow: 'CITA REPROGRAMADA', title: 'Tu cita fue cambiada',
      rows: [['Tratamiento', row.servicio], ['Nueva fecha', fecha], ['Nueva hora', `${hora} hrs`]],
      note: `Te esperamos en ${CLINIC.direccion}.`,
    });
    await Promise.allSettled([
      sendMailSafe({ to: row.email, subject: `Cita cambiada · ${CLINIC.nombre}`, html, text }),
      alertAdmins(supabaseAdmin, { title: 'Cita reprogramada', body: `${row.nombre}: ${row.fecha} ${row.hora} pasó a ${fecha} ${hora}`, tag: `cambia-${row.id}` }),
    ]);
    return res.status(200).json({ success: true, fecha, hora });
  }

  return res.status(400).json({ success: false, error: 'Acción no válida' });
}
