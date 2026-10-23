import { createClient } from '@supabase/supabase-js';

// Horas ya ocupadas en una fecha (por profesional). Es público a propósito: la
// tabla `reservas` solo la leen usuarios autenticados (protege nombre/correo de
// las clientas), así que sin este endpoint la página de reservas no podría
// saber qué horarios están tomados y ofrecería horas ocupadas. Devuelve SOLO
// profesional + hora (y cuántas citas lleva cada uno), nunca datos personales.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const fecha = String(req.query?.fecha || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ success: false, error: 'Fecha inválida' });
  }
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ success: false, error: 'Servidor no configurado' });

  // Una sola consulta: las horas de ese día y, de paso, cuántas citas lleva cada
  // profesional una semana antes y después (para repartir las citas parejo).
  const d = new Date(`${fecha}T12:00:00Z`);
  const shift = (days) => new Date(d.getTime() + days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await createClient(url, key).from('reservas').select('staff_id, hora, fecha_iso').gte('fecha_iso', shift(-7)).lte('fecha_iso', shift(7));
  if (error) return res.status(500).json({ success: false, error: 'No se pudo cargar la disponibilidad' });
  const load = {};
  data.forEach(r => { if (r.staff_id) load[r.staff_id] = (load[r.staff_id] || 0) + 1; });
  return res.status(200).json({ success: true, busy: data.filter(r => r.fecha_iso === fecha).map(({ staff_id, hora }) => ({ staff_id, hora })), load });
}
