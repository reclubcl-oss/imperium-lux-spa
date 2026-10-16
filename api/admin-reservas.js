import { createClient } from '@supabase/supabase-js';
import { CLINIC, SITE_URL } from './_lib/clinic.js';
import { brandedEmail, sendMailSafe, manageUrlFor, gmailConfigured } from './_lib/mail.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (res, code, error) => res.status(code).json({ success: false, error });

// Gestión de reservas desde el panel (solo administradoras): cancelar, cambiar
// la hora y crear una reserva a mano (ej. una clienta que llamó por teléfono).
// Va por el servidor porque la tabla `reservas` solo permite escribir con la
// llave de servicio.
export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return fail(res, 500, 'Servidor no configurado');

  const accessToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!accessToken) return fail(res, 401, 'No autenticado');

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) return fail(res, 401, 'Sesión inválida');
  const { data: caller } = await supabaseAdmin.from('staff').select('rol').eq('auth_user_id', userData.user.id).single();
  if (caller?.rol !== 'admin') return fail(res, 403, 'No autorizado');

  const { action, id, notify, nombre, email, telefono, servicio, fecha, fechaIso, hora, staffId, notas } = req.body || {};
  const emailConfigured = gmailConfigured();

  // ── Cancelar ───────────────────────────────────────────────────────────────
  if (action === 'cancel') {
    if (typeof id !== 'string' || !UUID_RE.test(id)) return fail(res, 400, 'Reserva inválida');
    const { data: row } = await supabaseAdmin.from('reservas').select('nombre, email, servicio, fecha, hora').eq('id', id).maybeSingle();
    if (!row) return fail(res, 404, 'No encontramos esa reserva (quizás ya fue cancelada).');

    const { error } = await supabaseAdmin.from('reservas').delete().eq('id', id);
    if (error) return fail(res, 500, 'No se pudo cancelar la reserva.');

    let emailSent = false;
    if (notify && row.email) {
      const { html, text } = brandedEmail({
        eyebrow: 'CITA CANCELADA', title: 'Tu cita fue cancelada',
        intro: `Hola ${String(row.nombre).split(' ')[0]}, lamentamos avisarte que debimos cancelar tu cita.`,
        rows: [['Tratamiento', row.servicio], ['Fecha', row.fecha], ['Hora', `${row.hora} hrs`]],
        note: `Para elegir otra hora escríbenos por WhatsApp al ${CLINIC.telefono} o reserva en nuestro sitio.`,
        ctaLabel: 'Agendar otra hora', ctaUrl: `${SITE_URL}/reservar`,
      });
      emailSent = await sendMailSafe({ to: row.email, subject: `Cita cancelada · ${CLINIC.nombre}`, html, text });
    }
    return res.status(200).json({ success: true, emailSent, emailConfigured });
  }

  // ── Validación común de fecha/hora (cambiar y crear) ───────────────────────
  const validSlot = typeof fechaIso === 'string' && ISO_RE.test(fechaIso) && typeof hora === 'string' && HHMM_RE.test(hora)
    && typeof fecha === 'string' && fecha.length > 0 && fecha.length <= 80
    && (staffId == null || (typeof staffId === 'string' && UUID_RE.test(staffId)));

  // ── Cambiar la hora ────────────────────────────────────────────────────────
  if (action === 'reschedule') {
    if (typeof id !== 'string' || !UUID_RE.test(id)) return fail(res, 400, 'Reserva inválida');
    if (!validSlot) return fail(res, 400, 'Elige una fecha y una hora válidas.');

    const { data: row } = await supabaseAdmin.from('reservas').select('*').eq('id', id).maybeSingle();
    if (!row) return fail(res, 404, 'No encontramos esa reserva.');

    const { error } = await supabaseAdmin.from('reservas').update({
      fecha, fecha_iso: fechaIso, hora, ...(staffId ? { staff_id: staffId } : {}), recordatorio_enviado_at: null,
    }).eq('id', id);
    if (error) {
      if (error.code === '23505') return fail(res, 409, 'Ese horario ya está ocupado. Elige otro.');
      return fail(res, 500, 'No se pudo cambiar la hora.');
    }

    let emailSent = false;
    if (notify && row.email) {
      const manage = manageUrlFor(row.cancel_token);
      const { html, text } = brandedEmail({
        eyebrow: 'CITA REPROGRAMADA', title: 'Cambiamos la hora de tu cita',
        intro: `Hola ${String(row.nombre).split(' ')[0]}, reprogramamos tu cita:`,
        rows: [['Tratamiento', row.servicio], ['Nueva fecha', fecha], ['Nueva hora', `${hora} hrs`]],
        note: `Te esperamos en ${CLINIC.direccion}. Si no te acomoda, puedes cambiarla o escribirnos por WhatsApp.`,
        ctaLabel: manage ? 'Cambiar o cancelar mi cita' : 'Escribir por WhatsApp', ctaUrl: manage || CLINIC.whatsapp,
      });
      emailSent = await sendMailSafe({ to: row.email, subject: `Cita reprogramada · ${CLINIC.nombre}`, html, text });
    }
    return res.status(200).json({ success: true, emailSent, emailConfigured });
  }

  // ── Crear reserva manual ───────────────────────────────────────────────────
  if (action === 'create') {
    const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
    if (!str(nombre, 120) || !str(servicio, 120) || !str(telefono, 40) || !str(email, 160) || !EMAIL_RE.test(email) || (notas && String(notas).length > 1000)) {
      return fail(res, 400, 'Revisa los datos: nombre, tratamiento, teléfono y un correo válido son obligatorios.');
    }
    if (!validSlot) return fail(res, 400, 'Elige una fecha y una hora válidas.');

    const { data: servicioRow } = await supabaseAdmin.from('servicios').select('precio').eq('nombre', servicio).maybeSingle();
    const { data, error } = await supabaseAdmin.from('reservas').insert([{
      nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim(), servicio, fecha,
      fecha_iso: fechaIso, hora, notas: notas || '', staff_id: staffId || null, precio: servicioRow?.precio ?? null,
    }]).select();
    if (error) {
      if (error.code === '23505') return fail(res, 409, 'Ese horario ya está ocupado. Elige otro.');
      return fail(res, 400, error.message);
    }

    const created = data?.[0];
    let emailSent = false;
    if (notify) {
      const manage = manageUrlFor(created?.cancel_token);
      const { html, text } = brandedEmail({
        eyebrow: 'RESERVA CONFIRMADA', title: `Hola ${nombre.trim().split(' ')[0]}, tu cita quedó agendada`,
        rows: [['Fecha', fecha], ['Hora', `${hora} hrs`], ['Tratamiento', servicio]],
        note: manage ? 'Si necesitas cambiar la hora o cancelar, puedes hacerlo tú misma hasta 24 horas antes con el botón de abajo.' : `Para cambios escríbenos por WhatsApp al ${CLINIC.telefono}.`,
        ctaLabel: 'Cambiar o cancelar mi cita', ctaUrl: manage,
      });
      emailSent = await sendMailSafe({ to: email.trim(), subject: `Reserva confirmada · ${CLINIC.nombre}`, html, text });
    }
    return res.status(200).json({ success: true, id: created?.id, emailSent, emailConfigured });
  }

  return fail(res, 400, 'Acción no válida');
}
